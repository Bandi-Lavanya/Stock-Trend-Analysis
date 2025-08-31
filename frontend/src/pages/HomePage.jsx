import React from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/bg.jpg";

export default function HomePage({ onLogout }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // ✅ credentials remain after logout

  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        padding: "20px",
        position: "relative", // for positioning logout button
      }}
    >
      {/* Logout button at top-right */}
      <button
        onClick={onLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "none",
          background: "#6191ddff",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        👤 Logout
      </button>

      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>
        📊 Stock Trend Analysis
      </h1>

      {/* Personalized Welcome Message */}
      {user && (
        <>
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "15px",
              fontWeight: "500",
            }}
          >
            Welcome back,{" "}
            <span style={{ fontWeight: "bold", color: "#ffd700" }}>
              {user.username}
            </span>{" "}
            🚀
          </h2>

          {/* Tagline */}
          <p
            style={{
              fontSize: "1.3rem",
              marginBottom: "30px",
              fontStyle: "italic",
              color: "#f0f0f0",
            }}
          >
            Turn market data into smarter decisions 📊
          </p>
        </>
      )}

      <p style={{ fontSize: "1.3rem", marginBottom: "40px" }}>
        Predict future stock prices easily.
      </p>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <button
          onClick={() => navigate("/predict")}
          style={{
            padding: "15px 30px",
            fontSize: "1.2rem",
            borderRadius: "10px",
            border: "none",
            background: "#007bff",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🔮 Stock Price Prediction
        </button>
      </div>
    </div>
  );
}
