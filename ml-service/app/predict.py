"""
Loads XGBoost model + StandardScaler from .joblib files,
provides a predict() function that takes a raw feature dict and returns PV_normalized.
"""

import numpy as np
import joblib
from pathlib import Path
from .feature_schema import FEATURE_COLUMNS

MODEL_DIR = Path("/app/models")

# Load once at import time — stays in memory for fast inference
print("Loading XGBoost model...")
model = joblib.load(MODEL_DIR / "best_xgboost.joblib")
print("Loading StandardScaler...")
scaler = joblib.load(MODEL_DIR / "scaler.joblib")
print(f"Model loaded. Expects {len(FEATURE_COLUMNS)} features.")


def predict(features: dict) -> float:
    """
    Takes a dict with all 55 feature keys → returns predicted PV_normalized (0–1).
    Features are ordered, scaled, then passed to the model.
    """
    # Order features into a numpy array matching training column order
    ordered = [features.get(col, 0.0) for col in FEATURE_COLUMNS]
    X = np.array([ordered], dtype=np.float64)

    # Scale using the same scaler fitted during training
    X_scaled = scaler.transform(X)

    # Predict
    prediction = float(model.predict(X_scaled)[0])

    # Clamp to [0, 1] range (PV_normalized is a fraction)
    prediction = max(0.0, min(1.0, prediction))

    return prediction
