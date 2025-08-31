import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PriceChart({ data }) {
  if (!data || !data.history) return null;

  const historyData = data.history.map((d) => ({
    date: d.date,
    close: d.close,
  }));

  const forecastPoint = {
    date: data.target_date,
    arima: data.predictions.arima,
    rf: data.predictions.rf,
    dt: data.predictions.dt,
  };

  const chartData = [...historyData, forecastPoint];

  return (
    <div style={{ width: "100%", height: 400, marginTop: "20px" }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="close" stroke="#8884d8" name="Historical" />
          <Line type="monotone" dataKey="arima" stroke="#82ca9d" name="ARIMA" />
          <Line type="monotone" dataKey="rf" stroke="#ffc658" name="Random Forest" />
          <Line type="monotone" dataKey="dt" stroke="#ff7300" name="Decision Tree" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
