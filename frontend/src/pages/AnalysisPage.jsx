import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AnalysisPage() {
  const [ticker, setTicker] = useState("AAPL");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:5001/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });

      const result = await res.json();
      if (result.error) {
        setError(result.error);
        setData([]);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError("Error fetching analysis");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!data.length) return;
    const header = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row).map((val) => `"${val}"`).join(",")
    );
    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${ticker}_analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>📑 Stock Technical Analysis</h2>
      <p className="muted">
        Here are the key technical indicators for the selected stock.
      </p>

      {/* Controls */}
      <div className="card" style={{ marginTop: "20px", padding: "16px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="card"
            style={{ padding: "8px", borderRadius: "8px" }}
          >
            <option value="AAPL">AAPL (Apple)</option>
            <option value="MSFT">MSFT (Microsoft)</option>
            <option value="GOOGL">GOOGL (Alphabet)</option>
            <option value="AMZN">AMZN (Amazon)</option>
            <option value="TSLA">TSLA (Tesla)</option>
          </select>

          <button
            onClick={fetchAnalysis}
            className="card"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "#3b82f6",
              color: "white",
            }}
          >
            {loading ? "Fetching…" : "Analyze"}
          </button>
        </div>

        {/* Status */}
        {!loading && !data.length && !error && (
          <p className="muted" style={{ marginTop: "16px" }}>
            No analysis yet.
          </p>
        )}
        {loading && (
          <p className="muted" style={{ marginTop: "16px" }}>
            Crunching indicators…
          </p>
        )}
        {error && (
          <p style={{ marginTop: "16px", color: "#ff8f8f" }}>⚠️ {error}</p>
        )}
      </div>

      {/* Charts Section */}
      {data.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          {/* SMA & EMA */}
          <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
            <h3>📈 SMA & EMA</h3>
            <p className="muted" style={{ marginBottom: "8px" }}>
              The Simple and Exponential Moving Averages help smooth out price
              action to identify the overall trend direction.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date" hide />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Close" stroke="#38bdf8" />
                <Line type="monotone" dataKey="SMA_20" stroke="#22c55e" />
                <Line type="monotone" dataKey="EMA_20" stroke="#f97316" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* RSI */}
          <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
            <h3>📊 RSI</h3>
            <p className="muted" style={{ marginBottom: "8px" }}>
              The Relative Strength Index (RSI) measures momentum and indicates
              overbought (above 70) or oversold (below 30) conditions.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="RSI" stroke="#e11d48" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* MACD */}
          <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
            <h3>📉 MACD</h3>
            <p className="muted" style={{ marginBottom: "8px" }}>
              The Moving Average Convergence Divergence (MACD) shows trend
              changes and momentum shifts using moving averages.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date" hide />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="MACD" stroke="#3b82f6" />
                <Line type="monotone" dataKey="Signal" stroke="#f97316" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bollinger Bands */}
          <div className="card" style={{ padding: "16px" }}>
            <h3>📌 Bollinger Bands</h3>
            <p className="muted" style={{ marginBottom: "8px" }}>
              Bollinger Bands plot upper and lower ranges around a moving average
              to highlight volatility and potential reversal zones.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date" hide />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Close" stroke="#38bdf8" />
                <Line type="monotone" dataKey="BB_Upper" stroke="#22c55e" />
                <Line type="monotone" dataKey="BB_Lower" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Show Raw Data Button */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="card"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                background: "#3b82f6",
                color: "white",
              }}
            >
              {showRaw ? "Hide Raw Data" : "Show Raw Data"}
            </button>
          </div>

          {/* Raw Data Table */}
          {showRaw && (
            <div className="card" style={{ marginTop: "20px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>📂 Raw Data (Sample 10 rows)</h3>
                <button
                  onClick={downloadCSV}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: "#0a0a0bff",
                    color: "white",
                  }}
                >
                  ⬇️
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "10px",
                  }}
                >
                  <thead>
                    <tr>
                      {Object.keys(data[0]).map((key) => (
                        <th
                          key={key}
                          style={{
                            borderBottom: "1px solid #ccc",
                            textAlign: "left",
                            padding: "6px",
                          }}
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td
                            key={i}
                            style={{
                              borderBottom: "1px solid #eee",
                              padding: "6px",
                            }}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
