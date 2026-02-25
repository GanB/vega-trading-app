"""Statistical pairs trading strategy using cointegration and z-score."""

from typing import Dict, Optional

import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import coint

from engine.data.preprocessor import compute_spread, rolling_zscore
from .base_strategy import BaseStrategy, Order, Signal


class PairsTradingStrategy(BaseStrategy):
    """Pairs trading via Engle-Granger cointegration.

    Spread = price_A - hedge_ratio * price_B
    Entry:  |z-score| > entry_z
    Exit:   |z-score| < exit_z
    Stop:   |z-score| > stop_z
    """

    name = "pairs_trading"
    description = "Statistical arbitrage using cointegrated pairs"

    def __init__(
        self,
        symbol_a: str = "SYN_A",
        symbol_b: str = "SYN_B",
        lookback: int = 60,
        entry_z: float = 2.0,
        exit_z: float = 0.5,
        stop_z: float = 3.5,
    ):
        self.symbol_a = symbol_a
        self.symbol_b = symbol_b
        self.lookback = lookback
        self.entry_z = entry_z
        self.exit_z = exit_z
        self.stop_z = stop_z

        # Internal state for live trading
        self._hedge_ratio: Optional[float] = None
        self._spread_mean: Optional[float] = None
        self._spread_std: Optional[float] = None
        self._position: Signal = Signal.FLAT
        self._price_buffer_a: list = []
        self._price_buffer_b: list = []

    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate signals from a DataFrame with Close prices for both symbols."""
        price_a = data["Close"][self.symbol_a]
        price_b = data["Close"][self.symbol_b]

        # Cointegration test
        score, pvalue, _ = coint(price_a.dropna(), price_b.dropna())

        # OLS hedge ratio: regress A on B
        hedge_ratio = self._compute_hedge_ratio(price_a, price_b)
        self._hedge_ratio = hedge_ratio

        # Compute spread and z-score
        spread = compute_spread(price_a, price_b, hedge_ratio)
        zscore = rolling_zscore(spread, window=self.lookback)

        # Generate signals
        signals = pd.Series(0, index=data.index, dtype=int)

        in_position = Signal.FLAT
        for i in range(len(zscore)):
            z = zscore.iloc[i]
            if np.isnan(z):
                continue

            if in_position == Signal.FLAT:
                if z > self.entry_z:
                    signals.iloc[i] = -1  # Short spread
                    in_position = Signal.SHORT
                elif z < -self.entry_z:
                    signals.iloc[i] = 1  # Long spread
                    in_position = Signal.LONG
            elif in_position == Signal.LONG:
                if z > -self.exit_z or z > self.stop_z:
                    signals.iloc[i] = 0
                    in_position = Signal.FLAT
                else:
                    signals.iloc[i] = 1
            elif in_position == Signal.SHORT:
                if z < self.exit_z or z < -self.stop_z:
                    signals.iloc[i] = 0
                    in_position = Signal.FLAT
                else:
                    signals.iloc[i] = -1

        return signals

    def calculate_position_size(
        self, signal: Signal, portfolio: dict
    ) -> float:
        if signal == Signal.FLAT:
            return 0.0
        equity = portfolio.get("equity", 100000)
        return equity * 0.1  # 10% of equity per leg

    def on_bar(self, bar: dict) -> Optional[Order]:
        symbol = bar.get("symbol", "")

        if symbol == self.symbol_a:
            self._price_buffer_a.append(bar["close"])
        elif symbol == self.symbol_b:
            self._price_buffer_b.append(bar["close"])
        else:
            return None

        # Need enough data for both symbols
        if (
            len(self._price_buffer_a) < self.lookback
            or len(self._price_buffer_b) < self.lookback
        ):
            return None

        # Trim buffers
        self._price_buffer_a = self._price_buffer_a[-self.lookback * 2 :]
        self._price_buffer_b = self._price_buffer_b[-self.lookback * 2 :]

        price_a = pd.Series(self._price_buffer_a)
        price_b = pd.Series(self._price_buffer_b)

        hedge_ratio = self._compute_hedge_ratio(price_a, price_b)
        spread = compute_spread(price_a, price_b, hedge_ratio)
        zscore = rolling_zscore(spread, window=self.lookback)

        z = zscore.iloc[-1]
        if np.isnan(z):
            return None

        prev_position = self._position

        if self._position == Signal.FLAT:
            if z > self.entry_z:
                self._position = Signal.SHORT
                return Order(
                    symbol=self.symbol_a,
                    signal=Signal.SHORT,
                    quantity=1.0,
                    metadata={"z_score": z, "hedge_ratio": hedge_ratio},
                )
            elif z < -self.entry_z:
                self._position = Signal.LONG
                return Order(
                    symbol=self.symbol_a,
                    signal=Signal.LONG,
                    quantity=1.0,
                    metadata={"z_score": z, "hedge_ratio": hedge_ratio},
                )
        elif self._position == Signal.LONG:
            if z > -self.exit_z or z > self.stop_z:
                self._position = Signal.FLAT
                return Order(
                    symbol=self.symbol_a,
                    signal=Signal.FLAT,
                    quantity=0.0,
                    metadata={"z_score": z, "reason": "exit/stop"},
                )
        elif self._position == Signal.SHORT:
            if z < self.exit_z or z < -self.stop_z:
                self._position = Signal.FLAT
                return Order(
                    symbol=self.symbol_a,
                    signal=Signal.FLAT,
                    quantity=0.0,
                    metadata={"z_score": z, "reason": "exit/stop"},
                )

        return None

    def get_parameters(self) -> dict:
        return {
            "symbol_a": self.symbol_a,
            "symbol_b": self.symbol_b,
            "lookback": self.lookback,
            "entry_z": self.entry_z,
            "exit_z": self.exit_z,
            "stop_z": self.stop_z,
        }

    def set_parameters(self, params: dict) -> None:
        for key, value in params.items():
            if hasattr(self, key):
                setattr(self, key, value)

    def reset(self) -> None:
        self._position = Signal.FLAT
        self._price_buffer_a.clear()
        self._price_buffer_b.clear()
        self._hedge_ratio = None

    @staticmethod
    def _compute_hedge_ratio(price_a: pd.Series, price_b: pd.Series) -> float:
        """OLS hedge ratio: regress price_a on price_b."""
        clean_a = price_a.dropna()
        clean_b = price_b.dropna()
        min_len = min(len(clean_a), len(clean_b))
        a = clean_a.iloc[-min_len:].values
        b = clean_b.iloc[-min_len:].values
        # Simple OLS: beta = cov(a,b) / var(b)
        beta = np.cov(a, b)[0, 1] / np.var(b)
        return float(beta)
