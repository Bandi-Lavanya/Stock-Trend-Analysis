import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "../assets/bg.jpg"; // ✅ same background

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      localStorage.setItem("user", JSON.stringify({ username, password }));
      setMessage("✅ Sign up successful! Please login.");
      setTimeout(() => navigate("/login"), 1000);
    } else {
      setMessage("❌ Please fill in all fields.");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="card"
        style={{
          width: 400,
          padding: 24,
          textAlign: "center",
          background: "rgba(0,0,0,0.6)", // ✅ semi-transparent card
          borderRadius: "12px",
          color: "white",
        }}
      >
        <h2 className="title">Sign Up</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="text"
            placeholder="Choose a Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "6px", border: "none" }}
          />
          <input
            type="password"
            placeholder="Choose a Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "6px", border: "none" }}
          />
          <button type="submit" className="primary" style={{ padding: "10px" }}>
            Sign Up
          </button>
        </form>
        <p className="muted" style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
        {message && <p className="muted">{message}</p>}
      </div>
    </div>
  );
}
