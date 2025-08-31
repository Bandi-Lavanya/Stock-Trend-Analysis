import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AccuracyChart({ data }) {
  if (!data || !data.metrics) return null;

  const metricsData = [
    { model: "ARIMA", RMSE: data.metrics.arima.rmse, MAPE: data.metrics.arima.mape },
    { model: "Random Forest", RMSE: data.metrics.rf.rmse, MAPE: data.metrics.rf.mape },
    { model: "Decision Tree", RMSE: data.metrics.dt.rmse, MAPE: data.metrics.dt.mape },
  ];

  return (
    <div className="card" style={{ marginTop: "20px", padding: "16px" }}>
      <h4>📊 Model Accuracy</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={metricsData}>
          <XAxis dataKey="model" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="RMSE" fill="#8884d8" />
          <Bar dataKey="MAPE" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
