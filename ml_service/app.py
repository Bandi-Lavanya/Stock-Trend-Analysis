from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
from datetime import datetime

app = Flask(__name__)
CORS(app)


def compute_metrics(y_true, y_pred):
    """Return RMSE and MAPE as dict"""
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mape = mean_absolute_percentage_error(y_true, y_pred) * 100
    return {"rmse": float(rmse), "mape": float(mape)}


# =============================
# 📈 Forecast Endpoint (Already Existing)
# =============================
@app.route("/forecast", methods=["POST"])
def forecast():
    try:
        data = request.json
        ticker = data.get("ticker")
        target_date = data.get("target_date")

        if not ticker or not target_date:
            return jsonify({"error": "Missing ticker or target_date"}), 400

        # Fetch stock data
        stock = yf.Ticker(ticker)
        hist = stock.history(period="6mo")
        if hist.empty:
            return jsonify({"error": f"No data found for {ticker}"}), 400

        hist.reset_index(inplace=True)
        hist["Date"] = hist["Date"].dt.strftime("%Y-%m-%d")

        close_prices = hist["Close"].values
        X = np.arange(len(close_prices)).reshape(-1, 1)
        y = close_prices

        # Split into train/test (last 20% as test)
        split_idx = int(len(y) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        # Train models
        rf = RandomForestRegressor(n_estimators=100, random_state=42)
        rf.fit(X_train, y_train)

        dt = DecisionTreeRegressor(random_state=42)
        dt.fit(X_train, y_train)

        arima_model = ARIMA(y_train, order=(5, 1, 0)).fit()

        # Forecast horizon for target date
        last_date = datetime.strptime(hist["Date"].iloc[-1], "%Y-%m-%d")
        target_date_obj = datetime.strptime(target_date, "%Y-%m-%d")
        days_ahead = (target_date_obj - last_date).days

        if days_ahead <= 0:
            return jsonify({"error": "Target date must be after last available date"}), 400

        future_idx = np.arange(len(close_prices), len(close_prices) + days_ahead).reshape(-1, 1)

        rf_pred = rf.predict(future_idx)[-1]
        dt_pred = dt.predict(future_idx)[-1]
        arima_pred = arima_model.forecast(steps=days_ahead)[-1]

        # --- Metrics on test set ---
        rf_test_pred = rf.predict(X_test)
        dt_test_pred = dt.predict(X_test)
        arima_test_pred = arima_model.forecast(steps=len(y_test))

        metrics = {
            "rf": compute_metrics(y_test, rf_test_pred),
            "dt": compute_metrics(y_test, dt_test_pred),
            "arima": compute_metrics(y_test, arima_test_pred),
        }

        # --- Residuals for plotting (date + error per model) ---
        residuals = []
        test_dates = hist["Date"].iloc[split_idx:].tolist()
        for i, d in enumerate(test_dates):
            residuals.append({
                "date": d,
                "rf": float(y_test[i] - rf_test_pred[i]),
                "dt": float(y_test[i] - dt_test_pred[i]),
                "arima": float(y_test[i] - arima_test_pred[i]),
            })

        return jsonify({
            "ticker": ticker,
            "currency": stock.info.get("currency", "USD"),
            "target_date": target_date,
            "predictions": {
                "arima": float(arima_pred),
                "rf": float(rf_pred),
                "dt": float(dt_pred),
            },
            "metrics": metrics,
            "residuals": residuals,
            "history": [
                {"date": d, "close": float(c)}
                for d, c in zip(hist["Date"], hist["Close"])
            ]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================
# 📑 Technical Analysis Endpoint (NEW)
# =============================
@app.route("/analysis", methods=["POST"])
def analysis():
    try:
        data = request.json
        ticker = data.get("ticker")

        if not ticker:
            return jsonify({"error": "Ticker is required"}), 400

        # Download 6 months of stock data
        df = yf.download(ticker, period="6mo")

        if df.empty:
            return jsonify({"error": "Invalid ticker or no data"}), 400

        # 🔹 Fix MultiIndex columns from yfinance
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [col[0] for col in df.columns]

        df.reset_index(inplace=True)
        df["Date"] = df["Date"].astype(str)

        # 🔹 Indicators
        df["SMA_20"] = df["Close"].rolling(window=20).mean()
        df["EMA_20"] = df["Close"].ewm(span=20, adjust=False).mean()

        # RSI
        delta = df["Close"].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        avg_gain = gain.rolling(window=14).mean()
        avg_loss = loss.rolling(window=14).mean()
        rs = avg_gain / avg_loss
        df["RSI"] = 100 - (100 / (1 + rs))

        # MACD
        short_ema = df["Close"].ewm(span=12, adjust=False).mean()
        long_ema = df["Close"].ewm(span=26, adjust=False).mean()
        df["MACD"] = short_ema - long_ema
        df["Signal"] = df["MACD"].ewm(span=9, adjust=False).mean()

        # ✅ Fixed Bollinger Bands
        rolling_mean = df["Close"].rolling(window=20).mean()
        rolling_std = df["Close"].rolling(window=20).std()

        df["BB_Mid"] = rolling_mean
        df["BB_Upper"] = rolling_mean + (rolling_std * 2)
        df["BB_Lower"] = rolling_mean - (rolling_std * 2)

        # Format response
        result = df[
            ["Date", "Close", "SMA_20", "EMA_20", "RSI", "MACD", "Signal", "BB_Upper", "BB_Lower"]
        ].dropna()

        return jsonify({"ticker": ticker, "data": result.to_dict(orient="records")})

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    app.run(port=5001, debug=True)
