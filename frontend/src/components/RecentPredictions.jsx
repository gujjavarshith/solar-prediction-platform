import { Link } from "react-router-dom";

export default function RecentPredictions({ predictions }) {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="glass-card">
        <div className="section-header">
          <h2 className="section-title">📊 Recent Predictions</h2>
        </div>
        <div className="empty-state">
          <div className="icon">☀️</div>
          <p>No predictions yet. Try one above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="section-header">
        <h2 className="section-title">📊 Recent Predictions</h2>
      </div>
      <div className="predictions-list">
        {predictions.map((pred) => (
          <Link
            key={pred.job_id}
            to={`/buildings/${pred.building_id}`}
            className="prediction-item"
          >
            <div className="pred-info">
              <span className="pred-city">
                {pred.city || `Building ${pred.building_id}`}
              </span>
              <span className="pred-time">
                {new Date(pred.created_at || Date.now()).toLocaleString()}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span className={`status-badge ${pred.status}`}>
                {pred.status}
              </span>
              {pred.pv_normalized != null && (
                <span className="pred-value">
                  {(pred.pv_normalized * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
