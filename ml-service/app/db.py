"""
Async PostgreSQL writer using asyncpg.
Creates the predictions table if it doesn't exist, and provides
functions to insert/update prediction rows.
"""

import asyncpg
import os
import json
from datetime import datetime

_pool = None


async def get_pool():
    """Get or create a connection pool to PostgreSQL."""
    global _pool
    if _pool is None:
        dsn = os.environ["DATABASE_URL"]
        _pool = await asyncpg.create_pool(dsn, min_size=2, max_size=10)
        await _init_table()
    return _pool


async def _init_table():
    """Create the predictions table if it doesn't exist."""
    pool = _pool
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id            SERIAL PRIMARY KEY,
                job_id        VARCHAR(64) UNIQUE NOT NULL,
                building_id   INTEGER NOT NULL,
                installed_capacity DOUBLE PRECISION,
                pv_normalized DOUBLE PRECISION,
                status        VARCHAR(20) DEFAULT 'pending',
                city          VARCHAR(100),
                weather       JSONB,
                features      JSONB,
                error         TEXT,
                created_at    TIMESTAMP DEFAULT NOW(),
                completed_at  TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_predictions_job_id ON predictions(job_id);
            CREATE INDEX IF NOT EXISTS idx_predictions_building_id ON predictions(building_id);
        """)


async def update_prediction(job_id: str, pv_normalized: float, status: str = "completed"):
    """Update a prediction row with the model result."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE predictions
            SET pv_normalized = $1, status = $2, completed_at = $3
            WHERE job_id = $4
            """,
            pv_normalized, status, datetime.utcnow(), job_id,
        )


async def mark_failed(job_id: str, error: str):
    """Mark a prediction job as failed with error message."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE predictions
            SET status = 'failed', error = $1, completed_at = $2
            WHERE job_id = $3
            """,
            error, datetime.utcnow(), job_id,
        )
