import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export default function PriceChart({ data }) {
  const hist = Array.isArray(data?.history)
    ? data.history.map(p => ({ date: p.date, close: p.close }))
    : [];
  const fc = Array.isArray(data?.forecast)
    ? data.forecast.map(p => ({ date: p.date, arima: p.arima }))
    : [];
  const series = [...hist, ...fc].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={{ width: '100%', height: 420, marginTop: 8 }}>
      <ResponsiveContainer>
        <LineChart data={series}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={24} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="close" dot={false} name="Close (History)" stroke="#8884d8" />
          <Line type="monotone" dataKey="arima" dot={false} name="ARIMA (Forecast)" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}