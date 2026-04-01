"""
Exact 55-feature column names that the XGBoost model expects, plus
mappings for wind direction (degrees→compass) and weather codes (WMO→condition).
"""

# ── Ordered feature columns (must match training data) ────────────
FEATURE_COLUMNS = [
    "installed_capacity",
    "building_id",
    "Temperature",
    "Dew Point",
    "Humidity",
    "Wind Speed",
    "Wind Gust",
    "Pressure",
    "Precip",
    "Hour_sin",
    "Hour_cos",
    "Month_sin",
    "Month_cos",
    "Weekday_sin",
    "Weekday_cos",
    # One-hot wind direction (19 columns)
    "Wind_CALM", "Wind_E", "Wind_ENE", "Wind_ESE",
    "Wind_N", "Wind_NE", "Wind_NNE", "Wind_NNW",
    "Wind_NW", "Wind_S", "Wind_SE", "Wind_SSE",
    "Wind_SSW", "Wind_SW", "Wind_UNKNOWN", "Wind_VAR",
    "Wind_W", "Wind_WNW", "Wind_WSW",
    # One-hot weather condition (19 columns)
    "Cond_Blowing", "Cond_Cloudy", "Cond_Duststorm", "Cond_Fair",
    "Cond_Fog", "Cond_Haze", "Cond_Heavy", "Cond_Light",
    "Cond_Mostly", "Cond_Partly", "Cond_Patches", "Cond_Rain",
    "Cond_Smoke", "Cond_Squalls", "Cond_T-Storm", "Cond_Thunder",
    "Cond_UNKNOWN", "Cond_Widespread",
    # Lag features
    "PV_norm_lag1",
    "PV_norm_lag24",
    "PV_norm_roll24",
]

assert len(FEATURE_COLUMNS) == 55, f"Expected 55 features, got {len(FEATURE_COLUMNS)}"

# ── Wind: degrees → compass direction ────────────────────────────
COMPASS_DIRECTIONS = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
]

WIND_COLUMNS = [c for c in FEATURE_COLUMNS if c.startswith("Wind_")]


def degrees_to_compass(deg: float) -> str:
    """Convert wind direction in degrees (0-360) to compass string."""
    if deg < 0:
        return "UNKNOWN"
    idx = round(deg / 22.5) % 16
    return COMPASS_DIRECTIONS[idx]


# ── WMO weather code → condition category ────────────────────────
# Maps WMO weather codes to the condition categories used in training
WMO_TO_CONDITION = {
    0: "Fair",       # Clear sky
    1: "Fair",       # Mainly clear
    2: "Partly",     # Partly cloudy
    3: "Cloudy",     # Overcast
    45: "Fog",       # Fog
    48: "Fog",       # Depositing rime fog
    51: "Light",     # Light drizzle
    53: "Light",     # Moderate drizzle
    55: "Rain",      # Dense drizzle
    56: "Light",     # Light freezing drizzle
    57: "Rain",      # Dense freezing drizzle
    61: "Light",     # Slight rain
    63: "Rain",      # Moderate rain
    65: "Heavy",     # Heavy rain
    66: "Light",     # Light freezing rain
    67: "Heavy",     # Heavy freezing rain
    71: "Light",     # Slight snowfall
    73: "Heavy",     # Moderate snowfall
    75: "Heavy",     # Heavy snowfall
    77: "Heavy",     # Snow grains
    80: "Rain",      # Slight rain showers
    81: "Rain",      # Moderate rain showers
    82: "Heavy",     # Violent rain showers
    85: "Light",     # Slight snow showers
    86: "Heavy",     # Heavy snow showers
    95: "T-Storm",   # Thunderstorm
    96: "Thunder",   # Thunderstorm with slight hail
    99: "Thunder",   # Thunderstorm with heavy hail
}

COND_COLUMNS = [c for c in FEATURE_COLUMNS if c.startswith("Cond_")]


def wmo_to_condition(code: int) -> str:
    """Convert WMO weather code to condition category name."""
    return WMO_TO_CONDITION.get(code, "UNKNOWN")
