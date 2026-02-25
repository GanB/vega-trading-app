"""Paper trading engine — simulates live trading without real orders."""

import asyncio
from datetime import datetime
from typing import Callable, Dict, List, Optional

from engine.backtester.portfolio import Portfolio
from engine.backtester.execution import ExecutionSimulator
from engine.data.providers.base import BaseDataProvider
from engine.data.providers.synthetic import SyntheticDataProvider
from engine.strategies.base_strategy import BaseStrategy, Signal
from .signal_generator import SignalGenerator


class PaperTrader:
    """Async paper trading loop that simulates live market execution."""

    def __init__(
        self,
        strategy: BaseStrategy,
        data_provider: Optional[BaseDataProvider] = None,
        initial_capital: float = 100000.0,
        commission_rate: float = 0.001,
        tick_interval: float = 1.0,
    ):
        self.signal_gen = SignalGenerator(strategy)
        self.portfolio = Portfolio(
            initial_capital=initial_capital,
            commission_rate=commission_rate,
        )
        self.executor = ExecutionSimulator(commission_rate=commission_rate)
        self.data_provider = data_provider or SyntheticDataProvider()
        self.tick_interval = tick_interval

        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._subscribers: List[Callable] = []
        self._tick_count = 0
        self._symbols: List[str] = []

    @property
    def is_running(self) -> bool:
        return self._running

    def subscribe(self, callback: Callable) -> None:
        """Subscribe to real-time updates. Callback receives a dict."""
        self._subscribers.append(callback)

    async def start(self, symbols: List[str]) -> None:
        """Start the paper trading loop."""
        if self._running:
            return
        self._symbols = symbols
        self._running = True
        self._task = asyncio.create_task(self._trading_loop())

    async def stop(self) -> dict:
        """Stop the paper trading loop and return final state."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        return self.get_state()

    def get_state(self) -> dict:
        """Return current paper trading state."""
        return {
            "running": self._running,
            "tick_count": self._tick_count,
            "portfolio": self.portfolio.get_state(),
            "last_signal": self.signal_gen.get_last_signal(),
            "signal_count": self.signal_gen.signal_count,
        }

    def get_latest_update(self) -> dict:
        """Return the latest tick update for WebSocket streaming."""
        return {
            "timestamp": datetime.now().isoformat(),
            "tick": self._tick_count,
            "equity": self.portfolio.equity,
            "cash": self.portfolio.cash,
            "pnl": self.portfolio.total_pnl,
            "positions": {
                sym: {
                    "quantity": p.quantity,
                    "entry_price": p.entry_price,
                    "current_price": p.current_price,
                    "unrealized_pnl": p.unrealized_pnl,
                    "side": p.side.name,
                }
                for sym, p in self.portfolio.positions.items()
            },
            "last_signal": self.signal_gen.get_last_signal(),
        }

    async def _trading_loop(self) -> None:
        """Main async loop: fetch bars, generate signals, execute."""
        while self._running:
            try:
                for symbol in self._symbols:
                    bar = self.data_provider.fetch_latest_bar(symbol)
                    if not bar:
                        continue
                    bar["symbol"] = symbol

                    # Generate signal
                    order = self.signal_gen.on_bar(bar)

                    # Update portfolio prices
                    self.portfolio.update_prices(
                        {symbol: bar["close"]},
                        bar["timestamp"],
                    )

                    # Execute order if any
                    if order is not None:
                        price = bar["close"]
                        if order.signal == Signal.FLAT:
                            self.portfolio.close_position(
                                symbol, price, bar["timestamp"]
                            )
                        else:
                            # Calculate position size
                            pos_size = self.signal_gen.strategy.calculate_position_size(
                                order.signal, self.portfolio.get_state()
                            )
                            quantity = pos_size / price if price > 0 else 0
                            if quantity > 0:
                                order.quantity = quantity
                                self.executor.execute(
                                    order, price, bar["timestamp"], self.portfolio
                                )

                self._tick_count += 1

                # Notify subscribers
                update = self.get_latest_update()
                for callback in self._subscribers:
                    try:
                        if asyncio.iscoroutinefunction(callback):
                            await callback(update)
                        else:
                            callback(update)
                    except Exception:
                        pass

                await asyncio.sleep(self.tick_interval)

            except asyncio.CancelledError:
                break
            except Exception as e:
                # Log but don't crash the loop
                print(f"PaperTrader error: {e}")
                await asyncio.sleep(self.tick_interval)
