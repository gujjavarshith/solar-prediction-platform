export default function PredictionResult({ result }) {
  if (!result) return null;

  const { status, pv_normalized, building_id, city, installed_capacity } = result;

  if (status === "pending") {
    return (
      <div className="glass-card result-card slide-up">
        <div className="spinner-container">
          <div className="spinner" />
          <p className="spinner-text">Running XGBoost inference...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="glass-card result-card slide-up">
        <div className="result-value" style={{ color: "var(--error)", WebkitTextFillColor: "var(--error)" }}>
          Error
        </div>
        <p className="result-label">{result.error || "Prediction failed"}</p>
      </div>
    );
  }

  const pct = (pv_normalized * 100).toFixed(1);
  const actualOutput = installed_capacity
    ? (pv_normalized * installed_capacity).toFixed(1)
    : null;

  return (
    <div className="glass-card result-card slide-up">
      <div className="result-value">{pct}%</div>
      <p className="result-label">Predicted Solar Output (PV Normalized)</p>

      <div className="result-gauge">
        <div
          className="result-gauge-fill"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      <div className="result-meta">
        {actualOutput && (
          <div className="result-meta-item">
            <div className="result-meta-value">{actualOutput} kW</div>
            <div className="result-meta-label">Estimated Output</div>
          </div>
        )}
        <div className="result-meta-item">
          <div className="result-meta-value">{building_id}</div>
          <div className="result-meta-label">Building</div>
        </div>
        {city && (
          <div className="result-meta-item">
            <div className="result-meta-value">{city}</div>
            <div className="result-meta-label">Location</div>
          </div>
        )}
        <div className="result-meta-item">
          <span className="status-badge completed">● Completed</span>
        </div>
      </div>
    </div>
  );
}
