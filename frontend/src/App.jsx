import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import PredictionPage from "./pages/PredictionPage.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import AnalysisPage from "./pages/AnalysisPage.jsx"; // ✅ NEW

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem("loggedIn", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.setItem("loggedIn", "false");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
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

        <Route
          path="/predict"
          element={
            isAuthenticated ? <PredictionPage /> : <Navigate to="/login" replace />
          }
        />

        {/* ✅ New route for analysis */}
        <Route
          path="/analysis"
          element={
            isAuthenticated ? <AnalysisPage /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}
