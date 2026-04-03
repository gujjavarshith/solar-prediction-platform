import { useState } from "react";

export default function PredictionForm({ onSubmit, loading }) {
  const [city, setCity] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [capacity, setCapacity] = useState("");
  const [datetime, setDatetime] = useState("");
  const [useCustomTime, setUseCustomTime] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city || buildingId === "" || !capacity) return;

    const payload = {
      city,
      building_id: parseInt(buildingId, 10),
      installed_capacity: parseFloat(capacity),
    };

    // Only include datetime if the toggle is on and a value is set
    if (useCustomTime && datetime) {
      payload.datetime = new Date(datetime).toISOString();
    }

    onSubmit(payload);
  };

  return (
    <div className="glass-card slide-up">
      <div className="section-header">
        <h2 className="section-title">🔮 New Prediction</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="city">City</label>
          <input
            id="city"
            className="form-input"
            type="text"
            placeholder="e.g. Berlin, Tokyo, New York"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="building-id">Building ID (0–49)</label>
          <input
            id="building-id"
            className="form-input"
            type="number"
            min="0"
            max="49"
            placeholder="e.g. 5"
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="capacity">Installed Capacity (kW)</label>
          <input
            id="capacity"
            className="form-input"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="e.g. 100.0"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>

        {/* Date & Time toggle */}
        <div className="form-group">
          <div className="datetime-toggle">
            <label className="toggle-switch" htmlFor="use-custom-time">
              <input
                id="use-custom-time"
                type="checkbox"
                checked={useCustomTime}
                onChange={(e) => {
                  setUseCustomTime(e.target.checked);
                  if (!e.target.checked) setDatetime("");
                }}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {useCustomTime ? "Forecast for specific time" : "Use current weather"}
            </span>
          </div>
        </div>

        {useCustomTime && (
          <div className="form-group datetime-group slide-up">
            <label className="form-label" htmlFor="datetime">Date & Time</label>
            <input
              id="datetime"
              className="form-input"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required={useCustomTime}
            />
            <span className="form-hint">
              Hourly forecast available up to 16 days ahead
            </span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              Predicting...
            </>
          ) : (
            useCustomTime && datetime
              ? "🕐 Predict for Selected Time"
              : "⚡ Predict Solar Output"
          )}
        </button>
      </form>
    </div>
  );
}
