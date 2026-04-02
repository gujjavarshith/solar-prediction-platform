// Prediction routes:
//   POST /predict/location  — auto-fetch weather by city name (primary)
//   POST /predict           — manual weather input (advanced)
//   GET  /predict/:id       — fetch prediction result by job ID

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const prisma = require("../services/prisma");
const { publishJob } = require("../services/kafka");
const { getCached } = require("../services/redis");
const { geocodeCity, fetchWeather } = require("../services/weather");
const { buildFeatures } = require("../services/featureBuilder");
const { registerJob } = require("../services/socketManager");
const { validateLocationPredict, validateManualPredict } = require("../middleware/validate");

const KAFKA_TOPIC = process.env.KAFKA_TOPIC || "prediction-jobs";

// ── POST /predict/location ─────────────────────────────────────
// User sends: { city, building_id, installed_capacity }
// Server fetches weather, builds features, publishes to Kafka.
router.post("/predict/location", validateLocationPredict, async (req, res) => {
  try {
    const { city, building_id, installed_capacity } = req.body;

    // 1. Geocode city → lat/lon
    const location = await geocodeCity(city);

    // 2. Fetch live weather from Open-Meteo
    const weather = await fetchWeather(location.latitude, location.longitude);

    // 3. Try to auto-fetch lag features from last predictions
    const lastPredictions = await prisma.prediction.findMany({
      where: { buildingId: building_id, status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 24,
    });

    const lags = {
      pv_norm_lag1: lastPredictions[0]?.pvNormalized ?? 0,
      pv_norm_lag24: lastPredictions[23]?.pvNormalized ?? 0,
      pv_norm_roll24: lastPredictions.length > 0
        ? lastPredictions.reduce((sum, p) => sum + (p.pvNormalized || 0), 0) / lastPredictions.length
        : 0,
    };

    // 4. Build 55-feature vector
    const features = buildFeatures({
      weather,
      buildingId: building_id,
      installedCapacity: installed_capacity,
      lags,
    });

    // 5. Create pending prediction in DB
    const jobId = uuidv4();
    await prisma.prediction.create({
      data: {
        jobId: jobId,
        buildingId: building_id,
        installedCapacity: installed_capacity,
        status: "pending",
        city: `${location.name}, ${location.country}`,
        weather: weather,
        features: features,
      },
    });

    // 6. Register socket for real-time push (if WebSocket connection exists)
    const socket = req.app.get("currentSocket");
    if (socket) registerJob(jobId, socket);

    // 7. Publish job to Kafka
    await publishJob(KAFKA_TOPIC, {
      job_id: jobId,
      city: `${location.name}, ${location.country}`,
      features,
    });

    res.status(202).json({
      job_id: jobId,
      status: "pending",
      message: "Prediction job submitted. Weather fetched automatically.",
      location: { name: location.name, country: location.country },
      weather_summary: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        condition_code: weather.weather_code,
      },
    });
  } catch (err) {
    console.error("POST /predict/location error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /predict ──────────────────────────────────────────────
// Advanced: user provides all weather data manually.
router.post("/predict", validateManualPredict, async (req, res) => {
  try {
    const {
      building_id, installed_capacity, datetime,
      temperature, dew_point, humidity, wind_speed, wind_gust,
      pressure, precip, wind_direction, weather_condition,
      pv_norm_lag1, pv_norm_lag24, pv_norm_roll24,
    } = req.body;

    const weather = {
      temperature: temperature ?? 20,
      dew_point: dew_point ?? 10,
      humidity: humidity ?? 50,
      wind_speed: wind_speed ?? 5,
      wind_gust: wind_gust ?? 10,
      pressure: pressure ?? 1013,
      precip: precip ?? 0,
      wind_direction: wind_direction ?? "CALM",
      weather_condition: weather_condition ?? "Fair",
    };

    const features = buildFeatures({
      weather,
      buildingId: building_id,
      installedCapacity: installed_capacity,
      datetime,
      lags: { pv_norm_lag1, pv_norm_lag24, pv_norm_roll24 },
    });

    const jobId = uuidv4();
    await prisma.prediction.create({
      data: {
        jobId,
        buildingId: building_id,
        installedCapacity: installed_capacity,
        status: "pending",
        city: "manual",
        weather,
        features,
      },
    });

    const socket = req.app.get("currentSocket");
    if (socket) registerJob(jobId, socket);

    await publishJob(KAFKA_TOPIC, { job_id: jobId, city: "manual", features });

    res.status(202).json({
      job_id: jobId,
      status: "pending",
      message: "Prediction job submitted with manual weather data.",
    });
  } catch (err) {
    console.error("POST /predict error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /predict/:id ───────────────────────────────────────────
// Fetch prediction result. Checks Redis cache first, falls back to DB.
router.get("/predict/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    // Try Redis cache first (fast path)
    const cached = await getCached(`pred:${jobId}`);
    if (cached) {
      return res.json({ ...cached, job_id: jobId, source: "cache" });
    }

    // Fall back to database
    const prediction = await prisma.prediction.findUnique({
      where: { jobId: jobId },
    });

    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }

    res.json({
      job_id: prediction.jobId,
      building_id: prediction.buildingId,
      installed_capacity: prediction.installedCapacity,
      pv_normalized: prediction.pvNormalized,
      status: prediction.status,
      city: prediction.city,
      weather: prediction.weather,
      error: prediction.error,
      created_at: prediction.createdAt,
      completed_at: prediction.completedAt,
      source: "database",
    });
  } catch (err) {
    console.error("GET /predict/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
