// Redis client — provides cache lookups and Pub/Sub subscription.
const Redis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

// Main client for cache reads/writes
const redis = new Redis(REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 500, 5000),
  maxRetriesPerRequest: 3,
});

// Separate client for Pub/Sub (Redis requires dedicated connection for subscribe)
const subscriber = new Redis(REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 500, 5000),
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));

subscriber.on("connect", () => console.log("Redis subscriber connected"));

async function getCached(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

module.exports = { redis, subscriber, getCached };
