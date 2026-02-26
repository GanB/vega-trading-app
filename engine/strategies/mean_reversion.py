"""Mean reversion strategy using Bollinger Bands and RSI filter."""

from typing import Optional

import numpy as np
import pandas as pd

from engine.data.preprocessor import compute_bollinger_bands, compute_rsi
from .base_strategy import BaseStrategy, Order, Signal


class MeanReversionStrategy(BaseStrategy):
    """Bollinger Band mean reversion with RSI confirmation.

    Entry long:  price < lower band AND RSI < 30
    Entry short: price > upper band AND RSI > 70
    Exit:        price crosses back through SMA
    """

    name = "mean_reversion"
    description = "Bollinger Band mean reversion with RSI filter"

    def __init__(
        self,
        symbol: str = "SPY",
        bb_period: int = 20,
        bb_std: float = 2.0,
        rsi_period: int = 14,
        rsi_oversold: float = 30.0,
        rsi_overbought: float = 70.0,
    ):
        self.symbol = symbol
        self.bb_period = bb_period
        self.bb_std = bb_std
        self.rsi_period = rsi_period
        self.rsi_oversold = rsi_oversold
        self.rsi_overbought = rsi_overbought

        self._position: Signal = Signal.FLAT
        self._price_buffer: list = []

    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        # Handle both MultiIndex and flat columns
        if isinstance(data.columns, pd.MultiIndex):
            close = data["Close"][self.symbol]
        else:
            close = data["Close"]

        bb = compute_bollinger_bands(close, self.bb_period, self.bb_std)
        rsi = compute_rsi(close, self.rsi_period)

        signals = pd.Series(0, index=data.index, dtype=int)

        in_position = Signal.FLAT
        for i in range(len(close)):
            price = close.iloc[i]
            sma = bb["sma"].iloc[i]
            upper = bb["upper"].iloc[i]
            lower = bb["lower"].iloc[i]
            rsi_val = rsi.iloc[i]

            if np.isnan(sma) or np.isnan(rsi_val):
                continue

            if in_position == Signal.FLAT:
                if price < lower and rsi_val < self.rsi_oversold:
                    signals.iloc[i] = 1  # Long
                    in_position = Signal.LONG
                elif price > upper and rsi_val > self.rsi_overbought:
                    signals.iloc[i] = -1  # Short
                    in_position = Signal.SHORT
            elif in_position == Signal.LONG:
                if price >= sma:
                    signals.iloc[i] = 0  # Exit
                    in_position = Signal.FLAT
                else:
                    signals.iloc[i] = 1
            elif in_position == Signal.SHORT:
                if price <= sma:
                    signals.iloc[i] = 0  # Exit
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
        return equity * 0.15  # 15% of equity

    def on_bar(self, bar: dict) -> Optional[Order]:
        self._price_buffer.append(bar["close"])

        min_bars = max(self.bb_period, self.rsi_period) + 5
        if len(self._price_buffer) < min_bars:
            return None

        self._price_buffer = self._price_buffer[-200:]

        prices = pd.Series(self._price_buffer)
        bb = compute_bollinger_bands(prices, self.bb_period, self.bb_std)
        rsi = compute_rsi(prices, self.rsi_period)

        price = prices.iloc[-1]
        sma = bb["sma"].iloc[-1]
        upper = bb["upper"].iloc[-1]
        lower = bb["lower"].iloc[-1]
        rsi_val = rsi.iloc[-1]

        if np.isnan(sma) or np.isnan(rsi_val):
            return None

        if self._position == Signal.FLAT:
            if price < lower and rsi_val < self.rsi_oversold:
                self._position = Signal.LONG
                return Order(
                    symbol=self.symbol,
                    signal=Signal.LONG,
                    quantity=1.0,
                    metadata={"rsi": rsi_val, "bb_lower": lower},
                )
            elif price > upper and rsi_val > self.rsi_overbought:
                self._position = Signal.SHORT
                return Order(
                    symbol=self.symbol,
                    signal=Signal.SHORT,
                    quantity=1.0,
                    metadata={"rsi": rsi_val, "bb_upper": upper},
                )
        elif self._position == Signal.LONG:
            if price >= sma:
                self._position = Signal.FLAT
                return Order(
                    symbol=self.symbol,
                    signal=Signal.FLAT,
                    quantity=0.0,
                    metadata={"reason": "price crossed SMA"},
                )
        elif self._position == Signal.SHORT:
            if price <= sma:
                self._position = Signal.FLAT
                return Order(
                    symbol=self.symbol,
                    signal=Signal.FLAT,
                    quantity=0.0,
                    metadata={"reason": "price crossed SMA"},
                )

        return None

    def get_parameters(self) -> dict:
        return {
            "symbol": self.symbol,
            "bb_period": self.bb_period,
            "bb_std": self.bb_std,
            "rsi_period": self.rsi_period,
            "rsi_oversold": self.rsi_oversold,
            "rsi_overbought": self.rsi_overbought,
        }

    ALLOWED_PARAMS = {"symbol", "bb_period", "bb_std", "rsi_period", "rsi_oversold", "rsi_overbought"}

    def set_parameters(self, params: dict) -> None:
        for key, value in params.items():
            if key in self.ALLOWED_PARAMS:
                setattr(self, key, value)

    def reset(self) -> None:
        self._position = Signal.FLAT
        self._price_buffer.clear()
