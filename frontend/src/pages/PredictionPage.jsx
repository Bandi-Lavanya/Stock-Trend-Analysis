import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PredictionForm from "../components/PredictionForm.jsx";
import PriceChart from "../components/PriceChart.jsx";
import AccuracyChart from "../components/AccuracyChart.jsx";
import ResidualsChart from "../components/ResidualsChart.jsx";

export default function PredictionPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ✅ Ensure user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please login first.");
      navigate("/login");
    }
  }, [navigate]);

  // ✅ API request for prediction
  const handlePrediction = async (ticker, target_date) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Missing authentication token. Please login again.");
      }

      const response = await fetch("http://127.0.0.1:5001/forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 👈 attach token
        },
        body: JSON.stringify({ ticker, target_date }),
      });

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Prediction request failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>🔮 Stock Price Prediction & Trend Analysis</h2>

      {/* Prediction Form */}
      <PredictionForm onSubmit={handlePrediction} />

      {/* Results Section */}
      <div className="card" style={{ marginTop: "20px", padding: "16px" }}>
        {!loading && !result && !error && (
          <p className="muted">No prediction yet.</p>
        )}
        {loading && <p className="muted">Crunching numbers…</p>}
        {error && <p style={{ color: "#ff8f8f" }}>⚠️ {error}</p>}

        {result && (
          <>
            {/* KPI Row 1: Stock Info */}
            <div
              className="row"
              style={{
                gap: "20px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <div className="card" style={cardStyle}>
                <div className="muted">Ticker</div>
                <div className="kpi">{result.ticker}</div>
              </div>

              <div className="card" style={cardStyle}>
                <div className="muted">Target Date</div>
                <div className="kpi">{result.target_date}</div>
              </div>
            </div>

            {/* KPI Row 2: Predictions */}
            <div
              className="row"
              style={{
                gap: "20px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <div className="card" style={cardStyle}>
                <div className="muted">ARIMA</div>
                <div className="kpi">
                  {result.currency} {result.predictions.arima.toFixed(2)}
                </div>
              </div>

              <div className="card" style={cardStyle}>
                <div className="muted">Random Forest</div>
                <div className="kpi">
                  {result.currency} {result.predictions.rf.toFixed(2)}
                </div>
              </div>

              <div className="card" style={cardStyle}>
                <div className="muted">Decision Tree</div>
                <div className="kpi">
                  {result.currency} {result.predictions.dt.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Charts */}
            <PriceChart data={result} />
            <AccuracyChart data={result} />
            <ResidualsChart data={result} />
          </>
        )}
      </div>
    </div>
  );
}

// ✅ shared card style
const cardStyle = {
  padding: "16px",
  borderRadius: "12px",
  flex: "1",
  minWidth: "180px",
};
