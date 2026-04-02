// Maps WMO weather codes to human-readable descriptions + emoji
const WMO_DESCRIPTIONS = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"], 45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌧️"], 55: ["Dense drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"], 73: ["Snow", "❄️"], 75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"], 81: ["Moderate showers", "🌧️"], 82: ["Violent showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"], 96: ["Hail storm", "⛈️"], 99: ["Severe hail", "⛈️"],
};

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  const [desc, emoji] = WMO_DESCRIPTIONS[weather.condition_code] || ["Unknown", "🌡️"];

  return (
    <div className="glass-card fade-in">
      <div className="section-header">
        <h2 className="section-title">🌤️ Current Weather</h2>
        <span style={{ fontSize: "1.5rem" }}>{emoji}</span>
      </div>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.9rem" }}>
        {desc}
      </p>
      <div className="weather-grid">
        <div className="weather-item">
          <div className="value">{weather.temperature}°C</div>
          <div className="label">Temp</div>
        </div>
        <div className="weather-item">
          <div className="value">{weather.humidity}%</div>
          <div className="label">Humidity</div>
        </div>
        <div className="weather-item">
          <div className="value">{weather.wind_speed} km/h</div>
          <div className="label">Wind</div>
        </div>
        <div className="weather-item">
          <div className="value">{weather.pressure} hPa</div>
          <div className="label">Pressure</div>
        </div>
      </div>
    </div>
  );
}
