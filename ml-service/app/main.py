"""
FastAPI REST API + Kafka consumer for ML inference.
- /health endpoint for container health checks
- Kafka consumer runs in background, processes prediction jobs
- On each job: predict → store in DB → cache in Redis → notify via Pub/Sub → log to MLflow
"""

import os
import json
import asyncio
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI
from aiokafka import AIOKafkaConsumer

from .predict import predict
from .db import get_pool, update_prediction, mark_failed
from .cache import cache_prediction, publish_result
from .mlflow_tracker import init_mlflow, log_prediction

KAFKA_BROKER = os.environ.get("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.environ.get("KAFKA_TOPIC", "prediction-jobs")


async def consume_predictions():
    """
    Background task: consume prediction jobs from Kafka.
    Each message contains the 55-feature vector + metadata.
    Outer retry loop handles transient failures like GroupCoordinator errors.
    """
    # Wait for Kafka internal topics (__consumer_offsets) to be ready
    await asyncio.sleep(15)

    while True:  # Outer retry loop — reconnects on any fatal error
        consumer = None
        try:
            consumer = AIOKafkaConsumer(
                KAFKA_TOPIC,
                bootstrap_servers=KAFKA_BROKER,
                group_id="ml-service-group",
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                auto_offset_reset="earliest",
                retry_backoff_ms=1000,
                request_timeout_ms=40000,
                session_timeout_ms=30000,
                heartbeat_interval_ms=10000,
                metadata_max_age_ms=60000,
            )

            # Retry connection to Kafka
            for attempt in range(30):
                try:
                    await consumer.start()
                    print(f"Kafka consumer connected to {KAFKA_BROKER}")
                    break
                except Exception as e:
                    print(f"Kafka not ready (attempt {attempt + 1}/30): {e}")
                    await asyncio.sleep(3)
            else:
                print("Failed to connect to Kafka after 30 attempts, retrying in 10s...")
                await asyncio.sleep(10)
                continue

            async for msg in consumer:
                job = msg.value
                job_id = job.get("job_id", "unknown")
                print(f"Processing job {job_id}")

                try:
                    features = job["features"]
                    building_id = int(features.get("building_id", 0))

                    # Run XGBoost inference
                    pv_normalized = predict(features)
                    print(f"Prediction for job {job_id}: {pv_normalized:.4f}")

                    # Store in PostgreSQL
                    await update_prediction(job_id, pv_normalized)

                    # Build result payload
                    result = {
                        "building_id": building_id,
                        "pv_normalized": round(pv_normalized, 6),
                        "status": "completed",
                        "installed_capacity": features.get("installed_capacity", 0),
                        "city": job.get("city", ""),
                    }

                    # Cache in Redis
                    await cache_prediction(job_id, building_id, result)

                    # Notify Express via Redis Pub/Sub (for Socket.io push)
                    await publish_result(job_id, result)

                    # Log to MLflow
                    log_prediction(job_id, building_id, pv_normalized, features)

                except Exception as e:
                    print(f"Job {job_id} failed: {e}")
                    traceback.print_exc()
                    await mark_failed(job_id, str(e))
                    await publish_result(job_id, {"status": "failed", "error": str(e)})

        except Exception as e:
            print(f"Kafka consumer error: {e}, reconnecting in 10s...")
            traceback.print_exc()
        finally:
            if consumer:
                try:
                    await consumer.stop()
                except Exception:
                    pass
            await asyncio.sleep(10)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start Kafka consumer and DB pool when app starts."""
    init_mlflow()
    await get_pool()
    task = asyncio.create_task(consume_predictions())
    print("ML Service ready")
    yield
    task.cancel()


app = FastAPI(title="Solar ML Service", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ml-service"}
