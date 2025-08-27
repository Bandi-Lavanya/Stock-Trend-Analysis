import React, { useState } from 'react';
import axios from 'axios';

const popular = [
  { label: 'Reliance Industries (NSE)', value: 'RELIANCE.NS' },
  { label: 'TCS (NSE)', value: 'TCS.NS' },
  { label: 'HDFC Bank (NSE)', value: 'HDFCBANK.NS' },
  { label: 'Apple (NASDAQ)', value: 'AAPL' },
  { label: 'Microsoft (NASDAQ)', value: 'MSFT' },
  { label: 'Tesla (NASDAQ)', value: 'TSLA' },
];

export default function PredictionForm({ onResult, setLoading, setError }) {
  // define "today" once at the top
  const today = new Date().toISOString().split('T')[0];

  const [ticker, setTicker] = useState('RELIANCE.NS');
  const [date, setDate] = useState(today);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    onResult(null);
    try {
      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const r = await axios.post(`${base}/api/forecast`, { ticker, target_date: date });
      if (r.data && !r.data.error) {
        onResult(r.data);
        localStorage.setItem('lastResult', JSON.stringify(r.data));
      } else {
        setError(r.data.error || 'Prediction failed.');
      }
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.message ||
        'An unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="row" style={{ alignItems: 'end' }}>
      <div style={{ flex: '1 1 260px' }}>
        <label htmlFor="stock-select" className="muted">Stock</label>
        <select
          id="stock-select"
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          style={{ width: '100%' }}
        >
          {popular.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="date-input" className="muted">Target Date</label>
        <input
          id="date-input"
          type="date"
          value={date}
          min={today}
          onChange={e => setDate(e.target.value)}
        />
      </div>
      <div>
        <button className="primary" type="submit">Predict</button>
      </div>
    </form>
  );
}
