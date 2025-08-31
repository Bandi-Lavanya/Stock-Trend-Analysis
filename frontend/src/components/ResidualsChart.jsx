import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ResidualsChart({ data }) {
  if (!data || !data.residuals) return null;

  return (
    <div className="card" style={{ marginTop: "20px", padding: "16px" }}>
      <h4>📉 Prediction Residuals (Errors)</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.residuals}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="arima" stroke="#82ca9d" name="ARIMA Error" />
          <Line type="monotone" dataKey="rf" stroke="#ffc658" name="RF Error" />
          <Line type="monotone" dataKey="dt" stroke="#ff7300" name="DT Error" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
