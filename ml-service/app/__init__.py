"""
Solar ML Service Application

This package contains the FastAPI service for serving machine learning predictions,
managing background tasks via Kafka, and tracking experiments with MLflow.
"""

__version__ = "1.0.0"

from .main import app

__all__ = ["app"]
