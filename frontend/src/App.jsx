import React, { useState } from 'react';
import PredictionForm from './components/PredictionForm.jsx';
import PriceChart from './components/PriceChart.jsx';

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className='container'>
      <header>
        <div className='row'>
          <span>📈</span>
          <b>Stock Trend Analysis</b>
        </div>
        <span className='muted'>Price Prediction</span>
      </header>
      <div className='grid'>
        <div className='card'>
          <div className='title'>Predict a Stock</div>
          <p className='muted'>Choose a ticker and date.</p>
          <PredictionForm onResult={setResult} setLoading={setLoading} setError={setError} />
        </div>
        <div className='card'>
          <div className='title'>Results</div>
          {!loading && !result && !error && <p className='muted'>No prediction yet.</p>}
          {loading && <p className='muted'>Crunching numbers…</p>}
          {error && <p style={{ color: '#ff8f8f' }}>⚠️ {error}</p>}
          {result && (
            <>
              <div className='row' style={{ justifyContent: 'space-between', margin: '8px 0' }}>
                <div>
                  <div className='muted'>Ticker</div>
                  <div className='kpi'>{result.ticker}</div>
                </div>
                <div>
                  <div className='muted'>Target Date</div>
                  <div className='kpi'>{result.target_date}</div>
                </div>
                <div>
                  <div className='muted'>Predicted Price</div>
                  <div className='kpi'>
                    {result.currency} {Number(result.predicted_price).toFixed(2)}
                  </div>
                </div>
              </div>
              <PriceChart data={result} />
              {/*  Removed ARIMA debug metrics here */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
