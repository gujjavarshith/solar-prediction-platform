import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function BuildingHistory() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [buildingInput, setBuildingInput] = useState(id || "0");

  const fetchHistory = async (buildingId, pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/buildings/${buildingId}/history?page=${pageNum}&limit=15`
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory(id, page);
  }, [id, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/buildings/${buildingInput}`;
  };

  return (
    <main className="container">
      <div className="page-header fade-in">
        <h1>📊 Building {id} — Prediction History</h1>
        <p>Past solar output predictions for this building</p>
      </div>

      {/* Building selector */}
      <div className="glass-card fade-in" style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "1rem", alignItems: "end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="building-select">Building ID</label>
            <input
              id="building-select"
              className="form-input"
              type="number"
              min="0"
              max="49"
              value={buildingInput}
              onChange={(e) => setBuildingInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            View History
          </button>
        </form>
      </div>

      {/* Results table */}
      <div className="glass-card slide-up">
        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p className="spinner-text">Loading history...</p>
          </div>
        ) : !data || data.predictions?.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>No predictions found for Building {id}</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              Make a Prediction
            </Link>
          </div>
        ) : (
          <>
            <div className="section-header">
              <h2 className="section-title">
                {data.total} Total Predictions
              </h2>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Page {data.page} of {data.total_pages}
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>City</th>
                    <th>Output</th>
                    <th>Capacity</th>
                    <th>Est. kW</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.predictions.map((pred) => (
                    <tr key={pred.job_id}>
                      <td>{new Date(pred.created_at).toLocaleString()}</td>
                      <td>{pred.city || "—"}</td>
                      <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                        {pred.pv_normalized != null
                          ? `${(pred.pv_normalized * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      <td>{pred.installed_capacity ? `${pred.installed_capacity} kW` : "—"}</td>
                      <td>
                        {pred.pv_normalized != null && pred.installed_capacity
                          ? `${(pred.pv_normalized * pred.installed_capacity).toFixed(1)} kW`
                          : "—"}
                      </td>
                      <td>
                        <span className={`status-badge ${pred.status}`}>
                          {pred.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.total_pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ← Prev
                </button>
                <button className="current">{page}</button>
                <button
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={page >= data.total_pages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
