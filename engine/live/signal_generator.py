"""Real-time signal computation for live/paper trading."""

from typing import Dict, Optional

from engine.strategies.base_strategy import BaseStrategy, Order


class SignalGenerator:
    """Wraps a strategy to generate signals from streaming bar data."""

    def __init__(self, strategy: BaseStrategy):
        self.strategy = strategy
        self.last_signal: Optional[Order] = None
        self.signal_count: int = 0

    def on_bar(self, bar: dict) -> Optional[Order]:
        """Process a new bar and return a signal if generated."""
        order = self.strategy.on_bar(bar)
        if order is not None:
            self.last_signal = order
            self.signal_count += 1
        return order

    def get_last_signal(self) -> Optional[dict]:
        """Return the last signal as a dict."""
        if self.last_signal is None:
            return None
        return {
            "symbol": self.last_signal.symbol,
            "signal": self.last_signal.signal.name,
            "quantity": self.last_signal.quantity,
            "metadata": self.last_signal.metadata,
        }

    def reset(self) -> None:
        self.strategy.reset()
        self.last_signal = None
        self.signal_count = 0
