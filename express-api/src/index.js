// Express API Gateway — main entry point.
// Sets up Express + Socket.io + Redis Pub/Sub listener.

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const predictRoutes = require("./routes/predict");
const buildingRoutes = require("./routes/buildings");
const { connectProducer } = require("./services/kafka");
const { subscriber } = require("./services/redis");
const { registerJob, notifyClient, removeSocket } = require("./services/socketManager");
const { buildFeatures } = require("./services/featureBuilder");
const { geocodeCity, fetchWeather, fetchHourlyWeather } = require("./services/weather");
const prisma = require("./services/prisma");
const { publishJob } = require("./services/kafka");
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 3000;
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || "prediction-jobs";

// ── Express setup ──────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "express-api" });
});

// Mount REST routes
app.use("/", predictRoutes);
app.use("/", buildingRoutes);

// ── Socket.io setup ────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle prediction request via WebSocket
  socket.on("predict", async (data) => {
    try {
      const { city, building_id, installed_capacity, datetime } = data;

      // Validate
      if (!city || building_id == null || !installed_capacity) {
        socket.emit("error", { message: "Missing required fields: city, building_id, installed_capacity" });
        return;
      }

      // 1. Geocode
      const location = await geocodeCity(city);

      // 2. Fetch weather — hourly forecast if datetime provided, else current
      let weather;
      let requestedDatetime = null;

      if (datetime) {
        const dt = new Date(datetime);
        if (isNaN(dt.getTime())) {
          socket.emit("error", { message: "Invalid datetime format. Use ISO 8601." });
          return;
        }
        requestedDatetime = dt.toISOString();
        const dateStr = dt.toISOString().split("T")[0];
        const hour = dt.getHours();
        weather = await fetchHourlyWeather(location.latitude, location.longitude, dateStr, hour);
        console.log(`Fetched hourly forecast for ${dateStr} hour ${hour}`);
      } else {
        weather = await fetchWeather(location.latitude, location.longitude);
      }

      // 3. Auto-fetch lags
      const lastPredictions = await prisma.prediction.findMany({
        where: { buildingId: building_id, status: "completed" },
        orderBy: { createdAt: "desc" },
        take: 24,
      });
      const lags = {
        pv_norm_lag1: lastPredictions[0]?.pvNormalized ?? 0,
        pv_norm_lag24: lastPredictions[23]?.pvNormalized ?? 0,
        pv_norm_roll24: lastPredictions.length > 0
          ? lastPredictions.reduce((s, p) => s + (p.pvNormalized || 0), 0) / lastPredictions.length
          : 0,
      };

      // 4. Build features (pass datetime so time features match)
      const features = buildFeatures({
        weather,
        buildingId: building_id,
        installedCapacity: installed_capacity,
        datetime: requestedDatetime,
        lags,
      });

      // 5. Create pending row
      const jobId = uuidv4();
      await prisma.prediction.create({
        data: {
          jobId,
          buildingId: building_id,
          installedCapacity: installed_capacity,
          status: "pending",
          city: `${location.name}, ${location.country}`,
          weather,
          features,
        },
      });

      // 6. Register this socket to receive the result
      registerJob(jobId, socket);

      // 7. Publish to Kafka
      await publishJob(KAFKA_TOPIC, {
        job_id: jobId,
        city: `${location.name}, ${location.country}`,
        features,
      });

      // 8. Acknowledge submission
      socket.emit("job_created", {
        job_id: jobId,
        status: "pending",
        location: { name: location.name, country: location.country },
        requested_datetime: requestedDatetime || "now",
        weather: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          wind_speed: weather.wind_speed,
          pressure: weather.pressure,
          condition_code: weather.weather_code,
        },
      });
    } catch (err) {
      console.error("Socket predict error:", err);
      socket.emit("error", { message: err.message });
    }
  });

  socket.on("disconnect", () => {
    removeSocket(socket.id);
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ── Redis Pub/Sub — listen for completed predictions ───────────
subscriber.subscribe("prediction_done", (err) => {
  if (err) console.error("Redis subscribe error:", err);
  else console.log("Subscribed to prediction_done channel");
});

subscriber.on("message", (channel, message) => {
  if (channel === "prediction_done") {
    try {
      const result = JSON.parse(message);
      const delivered = notifyClient(result.job_id, "prediction_result", result);
      if (delivered) {
        console.log(`Pushed result to client for job ${result.job_id}`);
      }
    } catch (err) {
      console.error("Pub/Sub message error:", err);
    }
  }
});

// ── Start server ───────────────────────────────────────────────
async function start() {
  try {
    await connectProducer();
  } catch (err) {
    console.error("Kafka producer failed:", err.message);
  }

  server.listen(PORT, () => {
    console.log(`Express API running on port ${PORT}`);
    console.log(`Socket.io ready for connections`);
  });
}

start();
