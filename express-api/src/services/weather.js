// Weather service — calls Open-Meteo API for geocoding and current weather.
// Free, no API key needed.

const BASE_GEO = "https://geocoding-api.open-meteo.com/v1/search";
const BASE_WEATHER = "https://api.open-meteo.com/v1/forecast";

/**
 * Convert city name → { latitude, longitude, name, country }
 */
async function geocodeCity(city) {
  const url = `${BASE_GEO}?name=${encodeURIComponent(city)}&count=1&language=en`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" not found. Try a different name.`);
  }

  const loc = data.results[0];
  return {
    latitude: loc.latitude,
    longitude: loc.longitude,
    name: loc.name,
    country: loc.country || "",
    timezone: loc.timezone || "UTC",
  };
}

/**
 * Fetch current weather for a given lat/lon from Open-Meteo.
 * Returns: { temperature, dew_point, humidity, wind_speed, wind_gust,
 *            pressure, precip, wind_direction_deg, weather_code }
 */
async function fetchWeather(latitude, longitude) {
  const params = [
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "pressure_msl",
    "wind_speed_10m",
    "wind_gusts_10m",
    "wind_direction_10m",
    "precipitation",
    "weather_code",
  ].join(",");

  const url = `${BASE_WEATHER}?latitude=${latitude}&longitude=${longitude}&current=${params}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.current) {
    throw new Error("Failed to fetch weather data from Open-Meteo");
  }

  const c = data.current;
  return {
    temperature: c.temperature_2m,
    dew_point: c.dew_point_2m,
    humidity: c.relative_humidity_2m,
    wind_speed: c.wind_speed_10m,
    wind_gust: c.wind_gusts_10m,
    pressure: c.pressure_msl,
    precip: c.precipitation,
    wind_direction_deg: c.wind_direction_10m,
    weather_code: c.weather_code,
    time: c.time,
  };
}

/**
 * Fetch hourly forecast weather for a specific date + hour from Open-Meteo.
 * Used when the user provides a future datetime for prediction.
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} dateStr - ISO date string, e.g. "2026-04-03"
 * @param {number} hour    - Hour of the day (0–23)
 */
async function fetchHourlyWeather(latitude, longitude, dateStr, hour) {
  const params = [
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "pressure_msl",
    "wind_speed_10m",
    "wind_gusts_10m",
    "wind_direction_10m",
    "precipitation",
    "weather_code",
  ].join(",");

  const url = `${BASE_WEATHER}?latitude=${latitude}&longitude=${longitude}&hourly=${params}&start_date=${dateStr}&end_date=${dateStr}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.hourly || !data.hourly.time || data.hourly.time.length === 0) {
    throw new Error(`No hourly forecast data available for ${dateStr}`);
  }

  // Find the index matching the requested hour
  const idx = Math.min(Math.max(hour, 0), data.hourly.time.length - 1);

  return {
    temperature: data.hourly.temperature_2m[idx],
    dew_point: data.hourly.dew_point_2m[idx],
    humidity: data.hourly.relative_humidity_2m[idx],
    wind_speed: data.hourly.wind_speed_10m[idx],
    wind_gust: data.hourly.wind_gusts_10m[idx],
    pressure: data.hourly.pressure_msl[idx],
    precip: data.hourly.precipitation[idx],
    wind_direction_deg: data.hourly.wind_direction_10m[idx],
    weather_code: data.hourly.weather_code[idx],
    time: data.hourly.time[idx],
  };
}

module.exports = { geocodeCity, fetchWeather, fetchHourlyWeather };
