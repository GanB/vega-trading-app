"""Synthetic data provider using Geometric Brownian Motion.

Generates correlated price series for zero-dependency testing
of pairs trading and other strategies.
"""

from typing import List, Optional

import numpy as np
import pandas as pd

from .base import BaseDataProvider


class SyntheticDataProvider(BaseDataProvider):
    """Generates realistic synthetic OHLCV data with configurable correlation."""

    def __init__(
        self,
        seed: Optional[int] = 42,
        base_price: float = 100.0,
        daily_vol: float = 0.02,
        correlation: float = 0.85,
    ):
        self.seed = seed
        self.base_price = base_price
        self.daily_vol = daily_vol
        self.correlation = correlation

    def fetch_ohlcv(
        self,
        symbols: List[str],
        start_date: str,
        end_date: str,
        interval: str = "1d",
    ) -> pd.DataFrame:
        rng = np.random.default_rng(self.seed)
        dates = pd.bdate_range(start=start_date, end=end_date)
        n_days = len(dates)
        n_symbols = len(symbols)

        # Build correlation matrix
        corr = np.full((n_symbols, n_symbols), self.correlation)
        np.fill_diagonal(corr, 1.0)
        chol = np.linalg.cholesky(corr)

        # Generate correlated returns
        raw = rng.standard_normal((n_days, n_symbols))
        correlated = raw @ chol.T
        daily_returns = self.daily_vol * correlated

        # Convert to prices via cumulative product
        close_prices = self.base_price * np.exp(np.cumsum(daily_returns, axis=0))

        # Synthesize OHLV from close
        high_noise = rng.uniform(0.001, 0.015, (n_days, n_symbols))
        low_noise = rng.uniform(0.001, 0.015, (n_days, n_symbols))
        open_noise = rng.uniform(-0.005, 0.005, (n_days, n_symbols))

        highs = close_prices * (1 + high_noise)
        lows = close_prices * (1 - low_noise)
        opens = close_prices * (1 + open_noise)
        volumes = rng.integers(100_000, 10_000_000, (n_days, n_symbols))

        # Build MultiIndex DataFrame
        tuples = []
        for field in ["Open", "High", "Low", "Close", "Volume"]:
            for sym in symbols:
                tuples.append((field, sym))
        columns = pd.MultiIndex.from_tuples(tuples)

        data = np.column_stack([opens, highs, lows, close_prices, volumes])
        df = pd.DataFrame(data, index=dates, columns=columns)
        df.index.name = "Date"
        return df

    def fetch_latest_bar(self, symbol: str) -> dict:
        rng = np.random.default_rng()
        close = self.base_price * np.exp(rng.normal(0, self.daily_vol))
        return {
            "timestamp": pd.Timestamp.now().isoformat(),
            "open": round(close * (1 + rng.uniform(-0.005, 0.005)), 2),
            "high": round(close * (1 + rng.uniform(0.001, 0.015)), 2),
            "low": round(close * (1 - rng.uniform(0.001, 0.015)), 2),
            "close": round(close, 2),
            "volume": int(rng.integers(100_000, 10_000_000)),
        }

    def available_symbols(self) -> List[str]:
        return [
            "SYN_A", "SYN_B", "SYN_C", "SYN_D",
            "SYN_E", "SYN_F", "SYN_G", "SYN_H",
        ]
