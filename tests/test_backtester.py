"""Unit tests for the backtesting engine, portfolio, execution, and metrics."""

import numpy as np
import pandas as pd
import pytest

from engine.backtester.engine import BacktestEngine
from engine.backtester.portfolio import Portfolio, Position, Trade
from engine.backtester.execution import ExecutionSimulator
from engine.backtester.metrics import (
    compute_sharpe_ratio,
    compute_sortino_ratio,
    compute_max_drawdown,
    compute_win_rate,
    compute_profit_factor,
    compute_cagr,
    compute_all_metrics,
)
from engine.strategies.base_strategy import Signal, Order
from engine.strategies.pairs_trading import PairsTradingStrategy


# ── Portfolio tests ──────────────────────────────────────────────────────


class TestPosition:
    def test_long_market_value(self):
        pos = Position("AAPL", 10, 150.0, "2023-01-01", Signal.LONG, 160.0)
        assert pos.market_value == 1600.0

    def test_long_unrealized_pnl(self):
        pos = Position("AAPL", 10, 150.0, "2023-01-01", Signal.LONG, 160.0)
        assert pos.unrealized_pnl == 100.0

    def test_short_unrealized_pnl(self):
        pos = Position("AAPL", 10, 150.0, "2023-01-01", Signal.SHORT, 140.0)
        assert pos.unrealized_pnl == 100.0  # profit on short

    def test_short_unrealized_loss(self):
        pos = Position("AAPL", 10, 150.0, "2023-01-01", Signal.SHORT, 160.0)
        assert pos.unrealized_pnl == -100.0


class TestPortfolio:
    def test_initial_state(self):
        p = Portfolio(initial_capital=50000)
        assert p.cash == 50000
        assert p.equity == 50000
        assert p.total_pnl == 0.0

    def test_open_long_position(self):
        p = Portfolio(initial_capital=100000, commission_rate=0.001)
        trade = p.open_position("AAPL", 10, 150.0, Signal.LONG, "2023-01-01")
        assert trade.side == "BUY"
        assert trade.commission == 1.5  # 10 * 150 * 0.001
        assert p.cash == 100000 - 1500 - 1.5
        assert "AAPL" in p.positions

    def test_close_position(self):
        p = Portfolio(initial_capital=100000, commission_rate=0.001)
        p.open_position("AAPL", 10, 150.0, Signal.LONG, "2023-01-01")
        p.positions["AAPL"].current_price = 160.0
        trade = p.close_position("AAPL", 160.0, "2023-02-01")
        assert trade is not None
        assert trade.side == "SELL"
        assert "AAPL" not in p.positions
        assert trade.pnl > 0  # should be profitable

    def test_close_nonexistent_position(self):
        p = Portfolio()
        result = p.close_position("FAKE", 100.0, "2023-01-01")
        assert result is None

    def test_equity_curve_tracking(self):
        p = Portfolio(initial_capital=100000)
        p.update_prices({}, "2023-01-01")
        p.update_prices({}, "2023-01-02")
        assert len(p.equity_curve) == 2

    def test_get_state(self):
        p = Portfolio(initial_capital=100000)
        state = p.get_state()
        assert state["equity"] == 100000
        assert state["cash"] == 100000
        assert state["num_trades"] == 0

    def test_get_equity_series(self):
        p = Portfolio(initial_capital=100000)
        p.update_prices({}, "2023-01-01")
        p.update_prices({}, "2023-01-02")
        series = p.get_equity_series()
        assert isinstance(series, pd.Series)
        assert len(series) == 2

    def test_get_trades_df_empty(self):
        p = Portfolio()
        df = p.get_trades_df()
        assert isinstance(df, pd.DataFrame)
        assert df.empty


# ── Execution tests ──────────────────────────────────────────────────────


class TestExecutionSimulator:
    def test_long_entry(self):
        sim = ExecutionSimulator(slippage_pct=0.0, commission_rate=0.001)
        portfolio = Portfolio(initial_capital=100000, commission_rate=0.001)
        order = Order(symbol="AAPL", signal=Signal.LONG, quantity=10)
        sim.execute(order, 150.0, "2023-01-01", portfolio)
        assert "AAPL" in portfolio.positions

    def test_flat_signal_closes_position(self):
        sim = ExecutionSimulator(slippage_pct=0.0, commission_rate=0.001)
        portfolio = Portfolio(initial_capital=100000, commission_rate=0.001)
        # Open first
        order = Order(symbol="AAPL", signal=Signal.LONG, quantity=10)
        sim.execute(order, 150.0, "2023-01-01", portfolio)
        # Close
        close_order = Order(symbol="AAPL", signal=Signal.FLAT, quantity=0)
        sim.execute(close_order, 155.0, "2023-01-02", portfolio)
        assert "AAPL" not in portfolio.positions

    def test_slippage_applied(self):
        sim = ExecutionSimulator(slippage_pct=0.01, commission_rate=0.0)
        portfolio = Portfolio(initial_capital=100000, commission_rate=0.0)
        order = Order(symbol="AAPL", signal=Signal.LONG, quantity=10)
        sim.execute(order, 100.0, "2023-01-01", portfolio)
        # With 1% slippage on buy, effective price > 100
        pos = portfolio.positions["AAPL"]
        assert pos.entry_price > 100.0


# ── Metrics tests ────────────────────────────────────────────────────────


class TestMetrics:
    @pytest.fixture
    def equity_series(self):
        return pd.Series(
            [100000, 101000, 99500, 102000, 103000, 101500, 104000],
            index=pd.date_range("2023-01-01", periods=7),
        )

    @pytest.fixture
    def trades_df(self):
        return pd.DataFrame({
            "timestamp": ["2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05"],
            "symbol": ["A", "A", "B", "B"],
            "side": ["BUY", "SELL", "BUY", "SELL"],
            "quantity": [10, 10, 5, 5],
            "price": [100, 105, 200, 195],
            "commission": [0.1, 0.1, 0.1, 0.1],
            "pnl": [0, 49.8, 0, -25.1],
        })

    def test_sharpe_ratio(self, equity_series):
        sharpe = compute_sharpe_ratio(equity_series)
        assert isinstance(sharpe, float)
        assert np.isfinite(sharpe)

    def test_sharpe_ratio_constant_equity(self):
        """Constant equity should return 0."""
        series = pd.Series([100000] * 10)
        assert compute_sharpe_ratio(series) == 0.0

    def test_sortino_ratio(self, equity_series):
        sortino = compute_sortino_ratio(equity_series)
        assert isinstance(sortino, float)

    def test_max_drawdown(self, equity_series):
        dd = compute_max_drawdown(equity_series)
        assert dd["max_drawdown"] <= 0
        assert dd["peak_date"] is not None

    def test_max_drawdown_short_series(self):
        dd = compute_max_drawdown(pd.Series([100000]))
        assert dd["max_drawdown"] == 0.0

    def test_win_rate(self, trades_df):
        wr = compute_win_rate(trades_df)
        assert 0 <= wr <= 1

    def test_profit_factor(self, trades_df):
        pf = compute_profit_factor(trades_df)
        assert pf > 0

    def test_profit_factor_no_losses(self):
        df = pd.DataFrame({"pnl": [10, 20, 30]})
        pf = compute_profit_factor(df)
        assert pf == float("inf")

    def test_cagr(self, equity_series):
        cagr = compute_cagr(equity_series)
        assert isinstance(cagr, float)

    def test_compute_all_metrics(self, equity_series, trades_df):
        metrics = compute_all_metrics(equity_series, trades_df)
        assert "total_return" in metrics
        assert "sharpe_ratio" in metrics
        assert "max_drawdown" in metrics
        assert "win_rate" in metrics


# ── BacktestEngine integration test ──────────────────────────────────────


class TestBacktestEngine:
    def test_pairs_trading_backtest(self):
        """Run a full pairs trading backtest on synthetic data."""
        np.random.seed(42)
        n = 300
        dates = pd.date_range("2022-01-01", periods=n, freq="D")
        base = 100 + np.cumsum(np.random.randn(n) * 0.5)

        arrays = {
            ("Close", "SYN_A"): base + np.random.randn(n) * 0.3,
            ("Close", "SYN_B"): base * 0.5 + np.random.randn(n) * 0.2,
            ("Open", "SYN_A"): base,
            ("Open", "SYN_B"): base * 0.5,
            ("High", "SYN_A"): base + 1,
            ("High", "SYN_B"): base * 0.5 + 0.5,
            ("Low", "SYN_A"): base - 1,
            ("Low", "SYN_B"): base * 0.5 - 0.5,
            ("Volume", "SYN_A"): np.ones(n) * 1000,
            ("Volume", "SYN_B"): np.ones(n) * 1000,
        }
        data = pd.DataFrame(arrays, index=dates)
        data.columns = pd.MultiIndex.from_tuples(data.columns)

        strategy = PairsTradingStrategy(symbol_a="SYN_A", symbol_b="SYN_B", lookback=30)
        engine = BacktestEngine(strategy=strategy, initial_capital=100000)
        result = engine.run(data)

        assert "equity_curve" in result
        assert "trades" in result
        assert "metrics" in result
        assert result["metrics"]["final_equity"] > 0
        assert len(result["equity_curve"]) > 0
