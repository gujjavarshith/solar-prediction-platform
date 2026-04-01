"""
Lightweight MLflow tracker — logs each prediction as a run for model monitoring.
"""

import os
import mlflow


def init_mlflow():
    """Set up MLflow tracking URI and experiment."""
    tracking_uri = os.environ.get("MLFLOW_TRACKING_URI", "http://mlflow:5001")
    mlflow.set_tracking_uri(tracking_uri)
    mlflow.set_experiment("solar_predictions")
    print(f"MLflow tracking → {tracking_uri}")


def log_prediction(job_id: str, building_id: int, pv_normalized: float, features: dict):
    """Log a prediction run to MLflow with key metrics."""
    try:
        with mlflow.start_run(run_name=f"pred_{job_id[:8]}"):
            mlflow.log_param("job_id", job_id)
            mlflow.log_param("building_id", building_id)
            mlflow.log_metric("pv_normalized", pv_normalized)
            mlflow.log_metric("temperature", features.get("Temperature", 0))
            mlflow.log_metric("humidity", features.get("Humidity", 0))
            mlflow.log_metric("wind_speed", features.get("Wind Speed", 0))
            mlflow.log_metric("installed_capacity", features.get("installed_capacity", 0))
    except Exception as e:
        # Don't let MLflow errors break predictions
        print(f"MLflow logging failed (non-fatal): {e}")
