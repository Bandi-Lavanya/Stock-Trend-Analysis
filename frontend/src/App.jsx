import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import PredictionPage from "./pages/PredictionPage.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user session exists (simple flag in localStorage)
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem("loggedIn", "true"); // ✅ session flag
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.setItem("loggedIn", "false"); // ✅ keep credentials, just logout
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* If logged in → go Home, else → go Login */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <HomePage onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protect prediction route */}
        <Route
          path="/predict"
          element={
            isAuthenticated ? <PredictionPage /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}
