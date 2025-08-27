import os
import json
import numpy as np
import pandas as pd
import yfinance as yf
from flask import Flask, request, jsonify
from flask_cors import CORS
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error

app = Flask(__name__)
CORS(app)

@app.route("/forecast", methods=["POST"])
def forecast():
    try:
        data = request.get_json()
        ticker = data.get("ticker")
        target_date = data.get("target_date")

        if not ticker or not target_date:
            return jsonify({"error": "Missing ticker or target_date"}), 400

        # --- Download data ---
        df = yf.download(ticker, start="2015-01-01", progress=False)

        # Flatten multi-index (sometimes appears in yfinance output)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [col[0] if isinstance(col, tuple) else col for col in df.columns]

        df = df.rename_axis("Date").reset_index()[["Date", "Close"]].dropna()
        s = df.set_index("Date")["Close"]

        if s.empty:
            return jsonify({"error": f"No data found for ticker {ticker}"}), 400

        # --- Fit ARIMA ---
        model = ARIMA(s, order=(5, 1, 2))
        model_fit = model.fit()

        # --- Metrics ---
        history = s[:-30]
        test = s[-30:]
        model_test = ARIMA(history, order=(5, 1, 0)).fit()
        pred_test = model_test.forecast(len(test))

        rmse = mean_squared_error(test, pred_test, squared=False)
        try:
            mape = mean_absolute_percentage_error(test, pred_test) * 100
        except Exception:
            mape = None

        # --- Forecast horizon ---
        last_date = df["Date"].max()
        target_dt = pd.to_datetime(target_date)

        # Business day range between last date and target
        future_dates = pd.bdate_range(last_date, target_dt)
        n_steps = len(future_dates)

        if n_steps <= 0:
            return jsonify({"error": "Target date must be after the last available date"}), 400

        # --- Forecast future values ---
        forecast_res = model_fit.get_forecast(steps=n_steps)
        forecast_mean = forecast_res.predicted_mean

        # Align forecast with business dates
        forecast_mean.index = future_dates

        # Handle non-trading day (weekend/holiday)
        if target_dt not in forecast_mean.index:
            target_dt = forecast_mean.index[-1]

        predicted_price = float(forecast_mean.loc[target_dt])

        # --- Build response ---
        response = {
            "ticker": ticker,
            "target_date": str(target_dt.date()),
            "predicted_price": predicted_price,
            "currency": "INR",
            "history": [
                {"date": str(d.date()), "close": float(c)}
                for d, c in s.tail(60).items()
            ],
            "metrics": {
                "arima_order": model_fit.model_orders,
                "arima_aic": model_fit.aic,
                "rmse": rmse,
                "mape_percent": mape,
            },
            "forecast": {
                str(d.date()): float(p) for d, p in forecast_mean.items()
            },
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": f"Unhandled server error: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
