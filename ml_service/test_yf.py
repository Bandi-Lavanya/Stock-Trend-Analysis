import yfinance as yf
df = yf.download("RELIANCE.NS", start="2015-01-01", progress=False)
print(df.head())
print(df.tail())
