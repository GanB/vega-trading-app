"""Cross-asset momentum strategy with monthly rebalancing."""

from typing import Dict, List, Optional

import numpy as np
import pandas as pd

from .base_strategy import BaseStrategy, Order, Signal


class MomentumStrategy(BaseStrategy):
    """Cross-asset momentum: rank assets by 12-month return (skip 1 month).

    Long top quartile, short bottom quartile, rebalance monthly.
    """

    name = "momentum"
    description = "Cross-asset momentum with monthly rebalance"

    def __init__(
        self,
        symbols: Optional[List[str]] = None,
        lookback: int = 252,
        skip: int = 21,
        rebalance_freq: str = "monthly",
        top_pct: float = 0.25,
        bottom_pct: float = 0.25,
    ):
        self.symbols = symbols or [
            "AAPL", "MSFT", "GOOGL", "AMZN", "META",
            "TSLA", "NVDA", "JPM", "GS", "XOM",
        ]
        self.lookback = lookback
        self.skip = skip
        self.rebalance_freq = rebalance_freq
        self.top_pct = top_pct
        self.bottom_pct = bottom_pct

        self._current_longs: List[str] = []
        self._current_shorts: List[str] = []
        self._last_rebalance_month: Optional[int] = None
        self._bar_count: int = 0
        self._price_history: Dict[str, list] = {s: [] for s in self.symbols}

    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """Generate signals for all symbols.

        Returns a DataFrame with columns for each symbol, values +1/-1/0.
        """
        close = data["Close"][self.symbols]
        signals = pd.DataFrame(0, index=data.index, columns=self.symbols)

        # Identify monthly boundaries
        monthly_idx = []
        prev_month = None
        for i, dt in enumerate(data.index):
            if prev_month is not None and dt.month != prev_month:
                monthly_idx.append(i)
            prev_month = dt.month

        for rebal_idx in monthly_idx:
            if rebal_idx < self.lookback:
                continue

            # Compute momentum: return from (lookback) to (skip) days ago
            start_idx = rebal_idx - self.lookback
            end_idx = rebal_idx - self.skip

            if start_idx < 0 or end_idx < 0:
                continue

            returns = {}
            for sym in self.symbols:
                price_start = close[sym].iloc[start_idx]
                price_end = close[sym].iloc[end_idx]
                if price_start > 0 and not np.isnan(price_start) and not np.isnan(price_end):
                    returns[sym] = (price_end - price_start) / price_start

            if not returns:
                continue

            # Rank by return
            sorted_syms = sorted(returns.keys(), key=lambda s: returns[s], reverse=True)
            n = len(sorted_syms)
            n_top = max(1, int(n * self.top_pct))
            n_bottom = max(1, int(n * self.bottom_pct))

            longs = sorted_syms[:n_top]
            shorts = sorted_syms[-n_bottom:]

            # Find next rebalance point or end of data
            next_rebal = len(data)
            for future_idx in monthly_idx:
                if future_idx > rebal_idx:
                    next_rebal = future_idx
                    break

            # Apply signals from rebalance to next rebalance
            for sym in self.symbols:
                if sym in longs:
                    signals[sym].iloc[rebal_idx:next_rebal] = 1
                elif sym in shorts:
                    signals[sym].iloc[rebal_idx:next_rebal] = -1
                else:
                    signals[sym].iloc[rebal_idx:next_rebal] = 0

        return signals

    def calculate_position_size(
        self, signal: Signal, portfolio: dict
    ) -> float:
        if signal == Signal.FLAT:
            return 0.0
        equity = portfolio.get("equity", 100000)
        n_positions = max(
            1, len(self._current_longs) + len(self._current_shorts)
        )
        return equity / n_positions * 0.9  # 90% of equal-weight allocation

    def on_bar(self, bar: dict) -> Optional[Order]:
        symbol = bar.get("symbol", "")
        if symbol not in self.symbols:
            return None

        self._price_history[symbol].append(bar["close"])
        self._bar_count += 1

        # Trim history
        for sym in self.symbols:
            if len(self._price_history[sym]) > self.lookback * 2:
                self._price_history[sym] = self._price_history[sym][-self.lookback * 2:]

        # Check if we should rebalance (monthly)
        ts = pd.Timestamp(bar["timestamp"])
        current_month = ts.month

        if self._last_rebalance_month == current_month:
            return None

        # Check if all symbols have enough data
        min_hist = min(len(v) for v in self._price_history.values())
        if min_hist < self.lookback:
            return None

        self._last_rebalance_month = current_month

        # Compute momentum for all symbols
        returns = {}
        for sym in self.symbols:
            prices = self._price_history[sym]
            price_start = prices[-self.lookback]
            price_end = prices[-self.skip] if len(prices) > self.skip else prices[-1]
            if price_start > 0:
                returns[sym] = (price_end - price_start) / price_start

        sorted_syms = sorted(returns.keys(), key=lambda s: returns[s], reverse=True)
        n = len(sorted_syms)
        n_top = max(1, int(n * self.top_pct))
        n_bottom = max(1, int(n * self.bottom_pct))

        self._current_longs = sorted_syms[:n_top]
        self._current_shorts = sorted_syms[-n_bottom:]

        # Return a signal for the current symbol
        if symbol in self._current_longs:
            return Order(
                symbol=symbol,
                signal=Signal.LONG,
                quantity=1.0,
                metadata={"momentum_rank": "top_quartile"},
            )
        elif symbol in self._current_shorts:
            return Order(
                symbol=symbol,
                signal=Signal.SHORT,
                quantity=1.0,
                metadata={"momentum_rank": "bottom_quartile"},
            )
        return None

    def get_parameters(self) -> dict:
        return {
            "symbols": self.symbols,
            "lookback": self.lookback,
            "skip": self.skip,
            "rebalance_freq": self.rebalance_freq,
            "top_pct": self.top_pct,
            "bottom_pct": self.bottom_pct,
        }

    def set_parameters(self, params: dict) -> None:
        for key, value in params.items():
            if hasattr(self, key):
                setattr(self, key, value)
        if "symbols" in params:
            self._price_history = {s: [] for s in self.symbols}

    def reset(self) -> None:
        self._current_longs.clear()
        self._current_shorts.clear()
        self._last_rebalance_month = None
        self._bar_count = 0
        self._price_history = {s: [] for s in self.symbols}
