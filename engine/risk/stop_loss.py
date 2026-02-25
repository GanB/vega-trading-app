"""Stop loss implementations: ATR-based and fixed percentage."""

import pandas as pd

from engine.data.preprocessor import compute_atr


class StopLossManager:
    """Manages stop loss levels for open positions."""

    @staticmethod
    def fixed_percentage(
        entry_price: float, stop_pct: float = 0.05, side: str = "long"
    ) -> float:
        """Fixed percentage stop loss.

        Args:
            entry_price: Price at which position was entered.
            stop_pct: Percentage below (long) or above (short) entry to stop.
            side: 'long' or 'short'.

        Returns:
            Stop loss price level.
        """
        if side == "long":
            return entry_price * (1 - stop_pct)
        else:
            return entry_price * (1 + stop_pct)

    @staticmethod
    def atr_based(
        entry_price: float,
        high: pd.Series,
        low: pd.Series,
        close: pd.Series,
        atr_period: int = 14,
        atr_multiplier: float = 2.0,
        side: str = "long",
    ) -> float:
        """ATR-based stop loss.

        Args:
            entry_price: Price at which position was entered.
            high, low, close: Recent OHLC data for ATR calculation.
            atr_period: Period for ATR computation.
            atr_multiplier: How many ATRs to use for stop distance.
            side: 'long' or 'short'.

        Returns:
            Stop loss price level.
        """
        atr = compute_atr(high, low, close, period=atr_period)
        current_atr = atr.iloc[-1]

        if pd.isna(current_atr):
            # Fall back to fixed 5% if ATR is unavailable
            return StopLossManager.fixed_percentage(entry_price, 0.05, side)

        stop_distance = current_atr * atr_multiplier

        if side == "long":
            return entry_price - stop_distance
        else:
            return entry_price + stop_distance

    @staticmethod
    def trailing_stop(
        current_price: float,
        highest_since_entry: float,
        lowest_since_entry: float,
        trail_pct: float = 0.03,
        side: str = "long",
    ) -> float:
        """Trailing stop loss.

        Args:
            current_price: Current market price.
            highest_since_entry: Highest price since position entry (for longs).
            lowest_since_entry: Lowest price since position entry (for shorts).
            trail_pct: Trailing percentage.
            side: 'long' or 'short'.

        Returns:
            Stop loss price level.
        """
        if side == "long":
            return highest_since_entry * (1 - trail_pct)
        else:
            return lowest_since_entry * (1 + trail_pct)

    @staticmethod
    def check_stop(
        current_price: float, stop_price: float, side: str = "long"
    ) -> bool:
        """Check if stop loss has been triggered.

        Returns True if stop is triggered.
        """
        if side == "long":
            return current_price <= stop_price
        else:
            return current_price >= stop_price
