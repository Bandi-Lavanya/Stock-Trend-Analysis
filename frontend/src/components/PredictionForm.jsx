import React, { useState } from "react";

const popular = [
  { label: "Reliance Industries (NSE)", value: "RELIANCE.NS" },
  { label: "TCS (NSE)", value: "TCS.NS" },
  { label: "HDFC Bank (NSE)", value: "HDFCBANK.NS" },
  { label: "Apple (NASDAQ)", value: "AAPL" },
  { label: "Microsoft (NASDAQ)", value: "MSFT" },
  { label: "Tesla (NASDAQ)", value: "TSLA" },
];

export default function PredictionForm({ onSubmit }) {
  const today = new Date().toISOString().split("T")[0];
  const [ticker, setTicker] = useState("RELIANCE.NS");
  const [date, setDate] = useState(today);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(ticker, date); // ✅ call parent handler
  }

  return (
    <form onSubmit={handleSubmit} className="row" style={{ alignItems: "end" }}>
      <div style={{ flex: "1 1 260px" }}>
        <label htmlFor="stock-select" className="muted">
          Stock
        </label>
        <select
          id="stock-select"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          style={{ width: "100%" }}
        >
          {popular.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="date-input" className="muted">
          Target Date
        </label>
        <input
          id="date-input"
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div>
        <button className="primary" type="submit">
          Predict
        </button>
      </div>
    </form>
  );
}
