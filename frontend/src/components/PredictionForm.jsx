import { useState } from "react";

export default function PredictionForm({ onSubmit, loading }) {
  const [city, setCity] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city || buildingId === "" || !capacity) return;
    onSubmit({
      city,
      building_id: parseInt(buildingId, 10),
      installed_capacity: parseFloat(capacity),
    });
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
            "⚡ Predict Solar Output"
          )}
        </button>
      </form>
    </div>
  );
}
