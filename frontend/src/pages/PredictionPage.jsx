import React, { useState } from "react";
import PredictionForm from "../components/PredictionForm.jsx";
import PriceChart from "../components/PriceChart.jsx";
import AccuracyChart from "../components/AccuracyChart.jsx";
import ResidualsChart from "../components/ResidualsChart.jsx";

export default function PredictionPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>🔮 Stock Price Prediction & Trend Analysis</h2>

      {/* Prediction Form */}
      <PredictionForm
        onResult={setResult}
        setLoading={setLoading}
        setError={setError}
      />

      {/* Card Wrapper */}
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
              <div
                className="card"
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  flex: "1",
                  minWidth: "200px",
                }}
              >
                <div className="muted">Ticker</div>
                <div className="kpi">{result.ticker}</div>
              </div>

              <div
                className="card"
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  flex: "1",
                  minWidth: "200px",
                }}
              >
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
              <div
                className="card"
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  flex: "1",
                  minWidth: "180px",
                }}
              >
                <div className="muted">ARIMA</div>
                <div className="kpi">
                  {result.currency} {result.predictions.arima.toFixed(2)}
                </div>
              </div>

              <div
                className="card"
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  flex: "1",
                  minWidth: "180px",
                }}
              >
                <div className="muted">Random Forest</div>
                <div className="kpi">
                  {result.currency} {result.predictions.rf.toFixed(2)}
                </div>
              </div>

              <div
                className="card"
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  flex: "1",
                  minWidth: "180px",
                }}
              >
                <div className="muted">Decision Tree</div>
                <div className="kpi">
                  {result.currency} {result.predictions.dt.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <PriceChart data={result} />
            <AccuracyChart data={result} />
            <ResidualsChart data={result} />
          </>
        )}
      </div>
    </div>
  );
}
