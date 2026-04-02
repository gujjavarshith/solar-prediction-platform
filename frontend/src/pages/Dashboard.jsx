import { useState, useEffect, useCallback } from "react";
import socket from "../socket";
import PredictionForm from "../components/PredictionForm";
import PredictionResult from "../components/PredictionResult";
import WeatherCard from "../components/WeatherCard";
import RecentPredictions from "../components/RecentPredictions";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [weather, setWeather] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [error, setError] = useState(null);

  // Listen for real-time prediction results
  useEffect(() => {
    const handleJobCreated = (data) => {
      console.log("Job created:", data);
      setResult({ status: "pending", ...data });
      setWeather(data.weather || null);
      setError(null);
    };

    const handleResult = (data) => {
      console.log("Prediction result:", data);
      setLoading(false);
      setResult(data);
      // Add to recent predictions at the top
      setRecentPredictions((prev) => [data, ...prev].slice(0, 10));
    };

    const handleError = (data) => {
      console.error("Socket error:", data);
      setLoading(false);
      setError(data.message);
      setResult(null);
    };

    socket.on("job_created", handleJobCreated);
    socket.on("prediction_result", handleResult);
    socket.on("error", handleError);

    return () => {
      socket.off("job_created", handleJobCreated);
      socket.off("prediction_result", handleResult);
      socket.off("error", handleError);
    };
  }, []);

  const handleSubmit = useCallback((data) => {
    setLoading(true);
    setResult(null);
    setWeather(null);
    setError(null);
    socket.emit("predict", data);
  }, []);

  return (
    <main className="container">
      <div className="page-header fade-in">
        <h1>☀️ Solar Output Predictor</h1>
        <p>
          Predict solar panel output for any city using live weather data and XGBoost ML model.
        </p>
      </div>

      {error && (
        <div className="glass-card fade-in" style={{
          borderColor: "var(--error)",
          marginBottom: "1.5rem",
          padding: "1rem 1.5rem",
        }}>
          <p style={{ color: "var(--error)" }}>⚠️ {error}</p>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        <PredictionForm onSubmit={handleSubmit} loading={loading} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {(result || loading) && <PredictionResult result={result} />}
          {weather && <WeatherCard weather={weather} />}
          {!result && !loading && !weather && (
            <div className="glass-card fade-in" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="empty-state">
                <div className="icon">⚡</div>
                <p>Enter a city and building details to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <RecentPredictions predictions={recentPredictions} />
    </main>
  );
}
