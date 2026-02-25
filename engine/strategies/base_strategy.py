"""Abstract base class for all trading strategies."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional

import pandas as pd


class Signal(Enum):
    LONG = 1
    SHORT = -1
    FLAT = 0


@dataclass
class Order:
    symbol: str
    signal: Signal
    quantity: float
    order_type: str = "market"  # market | limit
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    metadata: Optional[Dict] = None


class BaseStrategy(ABC):
    """Every strategy must implement these methods."""

    name: str = "base"
    description: str = ""

    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate trading signals from historical data.

        Args:
            data: DataFrame with OHLCV data.

        Returns:
            Series of +1 (long), -1 (short), 0 (flat) indexed by date.
        """

    @abstractmethod
    def calculate_position_size(
        self, signal: Signal, portfolio: dict
    ) -> float:
        """Determine position size given a signal and portfolio state."""

    @abstractmethod
    def on_bar(self, bar: dict) -> Optional[Order]:
        """Process a single bar (used in live/paper trading).

        Args:
            bar: dict with keys: timestamp, open, high, low, close, volume, symbol.

        Returns:
            An Order if a trade should be placed, None otherwise.
        """

    @abstractmethod
    def get_parameters(self) -> dict:
        """Return current strategy parameters as a dict."""

    @abstractmethod
    def set_parameters(self, params: dict) -> None:
        """Update strategy parameters."""

    def reset(self) -> None:
        """Reset any internal state. Override if needed."""
