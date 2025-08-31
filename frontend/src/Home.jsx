// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function HomePage({ user, onLogout }) {
  return (
    <div className="container">
      {/* 🔹 Logout button only — nothing else changed */}
      {user && (
        <div style={{ position: "absolute", top: 20, right: 20 }}>
          <button
            onClick={onLogout}
            className="primary"
            style={{ background: "#ef4444", borderRadius: "8px" }}
          >
            🚪 Logout
          </button>
        </div>
      )}

      <header>
        <div className="row">
          <span>📈</span>
          <b>Stock Trend Analysis</b>
        </div>
        <span className="muted">ARIMA • MERN + Flask</span>
      </header>

      <div className="grid">
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="title">Welcome, {user?.username} 👋</div>
          <p className="muted" style={{ marginBottom: 16 }}>
            Forecast stock prices using ARIMA, visualize trends, and compare multiple tickers.
          </p>

          <div className="row" style={{ gap: 12 }}>
            <Link to="/predict">
              <button className="primary">📊 Stock Price Prediction</button>
            </Link>
            <Link to="/compare">
              <button>🔄 Compare Multiple Stocks</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
