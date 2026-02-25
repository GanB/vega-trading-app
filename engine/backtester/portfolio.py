"""Portfolio state tracker for backtesting."""

from dataclasses import dataclass
from typing import Dict, List, Optional

import pandas as pd

from engine.strategies.base_strategy import Signal


@dataclass
class Position:
    symbol: str
    quantity: float
    entry_price: float
    entry_date: str
    side: Signal  # LONG or SHORT
    current_price: float = 0.0

    @property
    def market_value(self) -> float:
        if self.side == Signal.LONG:
            return self.quantity * self.current_price
        else:
            return self.quantity * (2 * self.entry_price - self.current_price)

    @property
    def unrealized_pnl(self) -> float:
        if self.side == Signal.LONG:
            return self.quantity * (self.current_price - self.entry_price)
        else:
            return self.quantity * (self.entry_price - self.current_price)


@dataclass
class Trade:
    symbol: str
    side: str  # "BUY" or "SELL"
    quantity: float
    price: float
    timestamp: str
    commission: float = 0.0
    pnl: float = 0.0


class Portfolio:
    """Tracks cash, positions, and trade history during a backtest."""

    def __init__(
        self,
        initial_capital: float = 100000.0,
        commission_rate: float = 0.001,
    ):
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.commission_rate = commission_rate
        self.positions: Dict[str, Position] = {}
        self.trades: List[Trade] = []
        self.equity_curve: List[dict] = []

    @property
    def equity(self) -> float:
        positions_value = sum(p.market_value for p in self.positions.values())
        return self.cash + positions_value

    @property
    def total_pnl(self) -> float:
        return self.equity - self.initial_capital

    def update_prices(self, prices: Dict[str, float], timestamp: str) -> None:
        """Update current prices for all held positions."""
        for symbol, position in self.positions.items():
            if symbol in prices:
                position.current_price = prices[symbol]

        self.equity_curve.append({
            "timestamp": timestamp,
            "equity": self.equity,
            "cash": self.cash,
            "positions_value": self.equity - self.cash,
        })

    def open_position(
        self,
        symbol: str,
        quantity: float,
        price: float,
        side: Signal,
        timestamp: str,
    ) -> Trade:
        """Open a new position."""
        cost = quantity * price
        commission = cost * self.commission_rate

        trade_side = "BUY" if side == Signal.LONG else "SELL"
        if side == Signal.LONG:
            self.cash -= cost + commission
        else:
            self.cash += cost - commission

        self.positions[symbol] = Position(
            symbol=symbol,
            quantity=quantity,
            entry_price=price,
            entry_date=timestamp,
            side=side,
            current_price=price,
        )

        trade = Trade(
            symbol=symbol,
            side=trade_side,
            quantity=quantity,
            price=price,
            timestamp=timestamp,
            commission=commission,
        )
        self.trades.append(trade)
        return trade

    def close_position(
        self, symbol: str, price: float, timestamp: str
    ) -> Optional[Trade]:
        """Close an existing position."""
        if symbol not in self.positions:
            return None

        position = self.positions[symbol]
        cost = position.quantity * price
        commission = cost * self.commission_rate
        pnl = position.unrealized_pnl - commission

        trade_side = "SELL" if position.side == Signal.LONG else "BUY"
        if position.side == Signal.LONG:
            self.cash += cost - commission
        else:
            self.cash -= cost + commission

        trade = Trade(
            symbol=symbol,
            side=trade_side,
            quantity=position.quantity,
            price=price,
            timestamp=timestamp,
            commission=commission,
            pnl=pnl,
        )
        self.trades.append(trade)
        del self.positions[symbol]
        return trade

    def get_state(self) -> dict:
        return {
            "equity": self.equity,
            "cash": self.cash,
            "total_pnl": self.total_pnl,
            "positions": {
                sym: {
                    "quantity": p.quantity,
                    "entry_price": p.entry_price,
                    "current_price": p.current_price,
                    "unrealized_pnl": p.unrealized_pnl,
                    "side": p.side.name,
                }
                for sym, p in self.positions.items()
            },
            "num_trades": len(self.trades),
        }

    def get_equity_series(self) -> pd.Series:
        if not self.equity_curve:
            return pd.Series(dtype=float)
        df = pd.DataFrame(self.equity_curve)
        return df.set_index("timestamp")["equity"]

    def get_trades_df(self) -> pd.DataFrame:
        if not self.trades:
            return pd.DataFrame()
        return pd.DataFrame([
            {
                "timestamp": t.timestamp,
                "symbol": t.symbol,
                "side": t.side,
                "quantity": t.quantity,
                "price": t.price,
                "commission": t.commission,
                "pnl": t.pnl,
            }
            for t in self.trades
        ])
