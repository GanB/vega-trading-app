"""Yahoo Finance data provider using yfinance."""

from typing import List

import pandas as pd
import yfinance as yf

from .base import BaseDataProvider


class YahooDataProvider(BaseDataProvider):
    """Fetches real market data from Yahoo Finance (free, no API key)."""

    def fetch_ohlcv(
        self,
        symbols: List[str],
        start_date: str,
        end_date: str,
        interval: str = "1d",
    ) -> pd.DataFrame:
        if len(symbols) == 1:
            ticker = yf.Ticker(symbols[0])
            df = ticker.history(start=start_date, end=end_date, interval=interval)
            df = df[["Open", "High", "Low", "Close", "Volume"]]
            tuples = [(col, symbols[0]) for col in df.columns]
            df.columns = pd.MultiIndex.from_tuples(tuples)
            return df

        data = yf.download(
            symbols,
            start=start_date,
            end=end_date,
            interval=interval,
            group_by="column",
            auto_adjust=True,
        )
        # yf.download with multiple tickers already returns MultiIndex (field, symbol)
        fields = ["Open", "High", "Low", "Close", "Volume"]
        available = [f for f in fields if f in data.columns.get_level_values(0)]
        return data[available]

    def fetch_latest_bar(self, symbol: str) -> dict:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="1d")
        if hist.empty:
            return {}
        row = hist.iloc[-1]
        return {
            "timestamp": hist.index[-1].isoformat(),
            "open": float(row["Open"]),
            "high": float(row["High"]),
            "low": float(row["Low"]),
            "close": float(row["Close"]),
            "volume": int(row["Volume"]),
        }

    def available_symbols(self) -> List[str]:
        return [
            "AAPL", "MSFT", "GOOGL", "AMZN", "META",
            "TSLA", "NVDA", "JPM", "GS", "BAC",
            "XOM", "CVX", "PFE", "JNJ", "UNH",
            "SPY", "QQQ", "IWM", "DIA", "TLT",
        ]
