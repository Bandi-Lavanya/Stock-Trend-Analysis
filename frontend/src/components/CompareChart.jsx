import React, { useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const stockOptions = [
  { label: "Reliance Industries (NSE)", value: "RELIANCE.NS" },
  { label: "TCS (NSE)", value: "TCS.NS" },
  { label: "HDFC Bank (NSE)", value: "HDFCBANK.NS" },
  { label: "Apple (NASDAQ)", value: "AAPL" },
  { label: "Microsoft (NASDAQ)", value: "MSFT" },
  { label: "Tesla (NASDAQ)", value: "TSLA" },
];

export default function CompareChart() {
  const [selected, setSelected] = useState(["AAPL", "MSFT"]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const responses = await Promise.all(
        selected.map((ticker) =>
          axios.post(`${base}/api/forecast`, {
            ticker,
            target_date: new Date().toISOString().split("T")[0],
          })
        )
      );

      // Merge & normalize history data
      const merged = {};
      responses.forEach((r, idx) => {
        const ticker = selected[idx];
        const history = r.data.history;

        if (!history || history.length === 0) return;

        const baseValue = history[0].close; // first price for normalization
        history.forEach((point) => {
          if (!merged[point.date]) merged[point.date] = { date: point.date };
          merged[point.date][ticker] =
            ((point.close - baseValue) / baseValue) * 100; // % change
        });
      });

      // convert to array sorted by date
      const chartData = Object.values(merged).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setData(chartData);
    } catch (err) {
      console.error(err);
      setError("Failed to load stock comparison data.");
    } finally {
      setLoading(false);
    }
  }

  function toggleTicker(value) {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="title">📊 Compare Multiple Stocks</div>
      <p className="muted">
        Select stocks and view their relative performance (% growth).
      </p>

      <div className="row" style={{ flexWrap: "wrap", gap: "10px" }}>
        {stockOptions.map((s) => (
          <label key={s.value} style={{ fontSize: "14px" }}>
            <input
              type="checkbox"
              value={s.value}
              checked={selected.includes(s.value)}
              onChange={() => toggleTicker(s.value)}
              style={{ marginRight: "6px" }}
            />
            {s.label}
          </label>
        ))}
      </div>

      <button
        className="primary"
        style={{ marginTop: "10px" }}
        onClick={fetchData}
      >
        Compare
      </button>

      {loading && <p className="muted">Loading comparison…</p>}
      {error && <p style={{ color: "#ff8f8f" }}>{error}</p>}

      {data.length > 0 && (
        <div style={{ width: "100%", height: 400, marginTop: 10 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={24} />
              <YAxis
                label={{
                  value: "% Change",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
              <Legend />
              {selected.map((ticker, i) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  dot={false}
                  stroke={
                    [
                      "#8884d8",
                      "#82ca9d",
                      "#ff7300",
                      "#00C49F",
                      "#FF69B4",
                      "#FFD700",
                    ][i % 6]
                  }
                  name={ticker}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
