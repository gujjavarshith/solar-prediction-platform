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

module.exports = { geocodeCity, fetchWeather };
