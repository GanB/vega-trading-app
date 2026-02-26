"""Order execution simulator for backtesting."""

from typing import Optional

from engine.strategies.base_strategy import Order, Signal
from .portfolio import Portfolio, Trade


class ExecutionSimulator:
    """Simulates order execution with configurable slippage and commission."""

    def __init__(
        self,
        slippage_pct: float = 0.0005,
        commission_rate: float = 0.001,
    ):
        self.slippage_pct = slippage_pct
        self.commission_rate = commission_rate

    def execute(
        self,
        order: Order,
        current_price: float,
        timestamp: str,
        portfolio: Portfolio,
    ) -> Optional[Trade]:
        """Execute an order against the portfolio.

        Applies slippage to simulate real-world fill prices.
        """
        if order.signal == Signal.FLAT:
            # Close existing position
            return portfolio.close_position(
                symbol=order.symbol,
                price=current_price,
                timestamp=timestamp,
            )

        # Apply slippage
        if order.signal == Signal.LONG:
            fill_price = current_price * (1 + self.slippage_pct)
        else:
            fill_price = current_price * (1 - self.slippage_pct)

        # Calculate quantity based on order or use default
        quantity = order.quantity
        if quantity <= 0:
            return None

        # Check if we need to close an existing opposite position first
        if order.symbol in portfolio.positions:
            existing = portfolio.positions[order.symbol]
            if existing.side != order.signal:
                portfolio.close_position(
                    symbol=order.symbol,
                    price=current_price,
                    timestamp=timestamp,
                )

        # Open new position
        return portfolio.open_position(
            symbol=order.symbol,
            quantity=quantity,
            price=fill_price,
            side=order.signal,
            timestamp=timestamp,
        )
