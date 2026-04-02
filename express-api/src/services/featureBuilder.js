// Feature builder — constructs the 55-feature vector from weather data + metadata.
// This is where raw Open-Meteo data gets transformed into what the model expects.

// ── Wind direction: degrees → compass ──────────────────────────
const COMPASS = [
  "N","NNE","NE","ENE","E","ESE","SE","SSE",
  "S","SSW","SW","WSW","W","WNW","NW","NNW",
];

const WIND_COLS = [
  "Wind_CALM","Wind_E","Wind_ENE","Wind_ESE",
  "Wind_N","Wind_NE","Wind_NNE","Wind_NNW",
  "Wind_NW","Wind_S","Wind_SE","Wind_SSE",
  "Wind_SSW","Wind_SW","Wind_UNKNOWN","Wind_VAR",
  "Wind_W","Wind_WNW","Wind_WSW",
];

function degreesToCompass(deg) {
  if (deg == null || deg < 0) return "UNKNOWN";
  const idx = Math.round(deg / 22.5) % 16;
  return COMPASS[idx];
}

// ── WMO weather code → condition category ──────────────────────
const WMO_MAP = {
  0:"Fair", 1:"Fair", 2:"Partly", 3:"Cloudy",
  45:"Fog", 48:"Fog",
  51:"Light", 53:"Light", 55:"Rain", 56:"Light", 57:"Rain",
  61:"Light", 63:"Rain", 65:"Heavy", 66:"Light", 67:"Heavy",
  71:"Light", 73:"Heavy", 75:"Heavy", 77:"Heavy",
  80:"Rain", 81:"Rain", 82:"Heavy",
  85:"Light", 86:"Heavy",
  95:"T-Storm", 96:"Thunder", 99:"Thunder",
};

const COND_COLS = [
  "Cond_Blowing","Cond_Cloudy","Cond_Duststorm","Cond_Fair",
  "Cond_Fog","Cond_Haze","Cond_Heavy","Cond_Light",
  "Cond_Mostly","Cond_Partly","Cond_Patches","Cond_Rain",
  "Cond_Smoke","Cond_Squalls","Cond_T-Storm","Cond_Thunder",
  "Cond_UNKNOWN","Cond_Widespread",
];

function wmoToCondition(code) {
  return WMO_MAP[code] || "UNKNOWN";
}

// ── Build the full 55-feature object ───────────────────────────
function buildFeatures({ weather, buildingId, installedCapacity, datetime, lags }) {
  const dt = datetime ? new Date(datetime) : new Date();
  const hour = dt.getHours() + dt.getMinutes() / 60;
  const month = dt.getMonth() + 1;         // 1-12
  const weekday = dt.getDay();             // 0=Sun, 6=Sat

  // Cyclical time encodings (sin/cos)
  const hourSin = Math.sin((2 * Math.PI * hour) / 24);
  const hourCos = Math.cos((2 * Math.PI * hour) / 24);
  const monthSin = Math.sin((2 * Math.PI * month) / 12);
  const monthCos = Math.cos((2 * Math.PI * month) / 12);
  const weekdaySin = Math.sin((2 * Math.PI * weekday) / 7);
  const weekdayCos = Math.cos((2 * Math.PI * weekday) / 7);

  // Wind direction one-hot
  const windDir = weather.wind_direction
    ? weather.wind_direction                // manual mode: string like "NNW"
    : degreesToCompass(weather.wind_direction_deg);  // auto mode: degrees from API
  const windOneHot = {};
  for (const col of WIND_COLS) windOneHot[col] = 0;
  const windKey = `Wind_${windDir}`;
  if (windOneHot.hasOwnProperty(windKey)) {
    windOneHot[windKey] = 1;
  } else {
    windOneHot["Wind_UNKNOWN"] = 1;
  }

  // Weather condition one-hot
  const condName = weather.weather_condition
    ? weather.weather_condition              // manual mode: string like "Partly"
    : wmoToCondition(weather.weather_code);  // auto mode: WMO code from API
  const condOneHot = {};
  for (const col of COND_COLS) condOneHot[col] = 0;
  const condKey = `Cond_${condName}`;
  if (condOneHot.hasOwnProperty(condKey)) {
    condOneHot[condKey] = 1;
  } else {
    condOneHot["Cond_UNKNOWN"] = 1;
  }

  // Lag features (default to 0 if not available)
  const lagDefaults = {
    PV_norm_lag1: lags?.pv_norm_lag1 ?? 0,
    PV_norm_lag24: lags?.pv_norm_lag24 ?? 0,
    PV_norm_roll24: lags?.pv_norm_roll24 ?? 0,
  };

  // Assemble the full 55-feature object
  return {
    installed_capacity: installedCapacity,
    building_id: buildingId,
    Temperature: weather.temperature,
    "Dew Point": weather.dew_point,
    Humidity: weather.humidity,
    "Wind Speed": weather.wind_speed,
    "Wind Gust": weather.wind_gust,
    Pressure: weather.pressure,
    Precip: weather.precip,
    Hour_sin: hourSin,
    Hour_cos: hourCos,
    Month_sin: monthSin,
    Month_cos: monthCos,
    Weekday_sin: weekdaySin,
    Weekday_cos: weekdayCos,
    ...windOneHot,
    ...condOneHot,
    ...lagDefaults,
  };
}

module.exports = { buildFeatures, degreesToCompass, wmoToCondition };
