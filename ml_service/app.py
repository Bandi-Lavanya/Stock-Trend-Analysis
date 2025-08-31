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


if __name__ == "__main__":
    app.run(port=5001, debug=True)
