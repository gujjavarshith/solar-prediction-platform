"""
Redis cache writer — caches prediction results for fast retrieval.
Also publishes to a Redis Pub/Sub channel so Express can push results via Socket.io.
"""

import os
import json
import redis.asyncio as aioredis

_redis = None


async def get_redis():
    """Get or create an async Redis connection."""
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(os.environ["REDIS_URL"], decode_responses=True)
    return _redis


async def cache_prediction(job_id: str, building_id: int, result: dict):
    """
    Cache the prediction result in Redis with two keys:
    1. pred:{job_id}  — for direct lookup
    2. pred:building:{building_id}:latest  — for quick latest lookup
    Both expire after 1 hour.
    """
    r = await get_redis()
    data = json.dumps(result)

    # Cache by job_id (primary lookup)
    await r.setex(f"pred:{job_id}", 3600, data)

    # Cache latest prediction for this building
    await r.setex(f"pred:building:{building_id}:latest", 3600, data)


async def publish_result(job_id: str, result: dict):
    """
    Publish prediction result to Redis Pub/Sub channel.
    Express API subscribes to this channel and pushes to the browser via Socket.io.
    """
    r = await get_redis()
    message = json.dumps({"job_id": job_id, **result})
    await r.publish("prediction_done", message)
