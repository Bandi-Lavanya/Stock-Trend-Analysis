import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "../assets/bg.jpg"; // ✅ use same background

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username === username && user.password === password) {
      setMessage("✅ Login successful!");
      onLogin(user);
      navigate("/");
    } else {
      setMessage("❌ Invalid credentials.");
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
        <h2 className="title">Login</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "6px", border: "none" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "6px", border: "none" }}
          />
          <button type="submit" className="primary" style={{ padding: "10px" }}>
            Login
          </button>
        </form>
        <p className="muted" style={{ marginTop: 12 }}>
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
        {message && <p className="muted">{message}</p>}
      </div>
    </div>
  );
}
