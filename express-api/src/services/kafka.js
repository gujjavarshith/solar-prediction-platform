// Kafka producer — publishes prediction job messages to Kafka topic.
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "express-api",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
  retry: { retries: 10, initialRetryTime: 1000 },
});

const producer = kafka.producer();
let isConnected = false;

async function connectProducer() {
  if (isConnected) return;
  // Retry loop — Kafka may still be starting
  for (let i = 0; i < 30; i++) {
    try {
      await producer.connect();
      isConnected = true;
      console.log("Kafka producer connected");
      return;
    } catch (err) {
      console.log(`Kafka not ready (attempt ${i + 1}/30)...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error("Failed to connect to Kafka");
}

async function publishJob(topic, message) {
  await connectProducer();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}

module.exports = { connectProducer, publishJob };
