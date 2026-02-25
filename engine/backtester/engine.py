"""Event-driven backtesting engine."""

from typing import Dict, List, Optional, Type

import pandas as pd

from engine.strategies.base_strategy import BaseStrategy, Order, Signal
from .execution import ExecutionSimulator
from .metrics import compute_all_metrics
from .portfolio import Portfolio


class BacktestEngine:
    """Event-driven backtesting engine.

    Iterates over historical bars, feeds them to a strategy,
    and executes resulting orders through the simulation.
    """

    def __init__(
        self,
        strategy: BaseStrategy,
        initial_capital: float = 100000.0,
        commission_rate: float = 0.001,
        slippage_pct: float = 0.0005,
    ):
        self.strategy = strategy
        self.portfolio = Portfolio(
            initial_capital=initial_capital,
            commission_rate=commission_rate,
        )
        self.executor = ExecutionSimulator(
            slippage_pct=slippage_pct,
            commission_rate=commission_rate,
        )
        self.initial_capital = initial_capital

    def run(self, data: pd.DataFrame) -> dict:
        """Run a full backtest on historical data.

        Args:
            data: DataFrame with MultiIndex columns (field, symbol).

        Returns:
            Dict with equity_curve, trades, metrics.
        """
        self.strategy.reset()

        # Generate signals for the full dataset
        signals = self.strategy.generate_signals(data)

        # Determine symbols from strategy
        if hasattr(self.strategy, "symbol_a"):
            # Pairs trading - use symbol_a as the primary traded symbol
            symbols = [self.strategy.symbol_a]
        elif hasattr(self.strategy, "symbol"):
            symbols = [self.strategy.symbol]
        elif hasattr(self.strategy, "symbols"):
            symbols = self.strategy.symbols
        else:
            symbols = list(data["Close"].columns)

        # Iterate through bars
        for i in range(len(data)):
            timestamp = str(data.index[i])

            # Update portfolio prices
            prices = {}
            for sym in symbols:
                try:
                    prices[sym] = float(data["Close"][sym].iloc[i])
                except (KeyError, IndexError):
                    continue
            self.portfolio.update_prices(prices, timestamp)

            # Get signal for this bar
            if isinstance(signals, pd.DataFrame):
                # Multi-asset strategy (momentum)
                for sym in symbols:
                    sig_val = int(signals[sym].iloc[i])
                    self._process_signal(sig_val, sym, prices.get(sym, 0), timestamp)
            else:
                # Single signal strategy
                sig_val = int(signals.iloc[i])
                primary_symbol = symbols[0]
                self._process_signal(
                    sig_val, primary_symbol, prices.get(primary_symbol, 0), timestamp
                )

        # Close all remaining positions at the end
        for sym in list(self.portfolio.positions.keys()):
            last_price = float(data["Close"][sym].iloc[-1])
            self.portfolio.close_position(sym, last_price, str(data.index[-1]))

        # Compute metrics
        equity_series = self.portfolio.get_equity_series()
        trades_df = self.portfolio.get_trades_df()
        metrics = compute_all_metrics(equity_series, trades_df)

        return {
            "equity_curve": [
                {"timestamp": str(e["timestamp"]), "equity": e["equity"]}
                for e in self.portfolio.equity_curve
            ],
            "trades": trades_df.to_dict(orient="records") if not trades_df.empty else [],
            "metrics": metrics,
            "portfolio_state": self.portfolio.get_state(),
        }

    def _process_signal(
        self, signal_value: int, symbol: str, price: float, timestamp: str
    ) -> None:
        """Process a signal value and execute if needed."""
        if price <= 0:
            return

        current_position = self.portfolio.positions.get(symbol)

        if signal_value == 0 and current_position is not None:
            # Exit signal
            order = Order(symbol=symbol, signal=Signal.FLAT, quantity=0.0)
            self.executor.execute(order, price, timestamp, self.portfolio)
        elif signal_value == 1 and current_position is None:
            # Long entry
            position_value = self.strategy.calculate_position_size(
                Signal.LONG, self.portfolio.get_state()
            )
            quantity = position_value / price if price > 0 else 0
            if quantity > 0:
                order = Order(symbol=symbol, signal=Signal.LONG, quantity=quantity)
                self.executor.execute(order, price, timestamp, self.portfolio)
        elif signal_value == -1 and current_position is None:
            # Short entry
            position_value = self.strategy.calculate_position_size(
                Signal.SHORT, self.portfolio.get_state()
            )
            quantity = position_value / price if price > 0 else 0
            if quantity > 0:
                order = Order(symbol=symbol, signal=Signal.SHORT, quantity=quantity)
                self.executor.execute(order, price, timestamp, self.portfolio)
