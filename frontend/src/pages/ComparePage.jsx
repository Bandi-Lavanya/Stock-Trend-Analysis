import React from "react";
import CompareChart from "../components/CompareChart.jsx";

export default function ComparePage() {
  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>📈 Compare Multiple Stocks</h2>
      <p className="muted">Select different stocks and view them together in one chart.</p>
      <CompareChart />
    </div>
  );
}
