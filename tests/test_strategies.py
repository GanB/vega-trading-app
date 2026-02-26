"""Unit tests for trading strategies."""

import numpy as np
import pandas as pd
import pytest

from engine.strategies.base_strategy import Signal, Order
from engine.strategies.pairs_trading import PairsTradingStrategy
from engine.strategies.mean_reversion import MeanReversionStrategy
from engine.strategies.momentum import MomentumStrategy


def _make_pairs_data(n=300, seed=42):
    """Generate synthetic correlated MultiIndex price data."""
    np.random.seed(seed)
    dates = pd.date_range("2022-01-01", periods=n, freq="D")
    base = 100 + np.cumsum(np.random.randn(n) * 0.5)
    noise = np.random.randn(n) * 0.3
    price_a = pd.Series(base + noise, index=dates)
    price_b = pd.Series(base * 0.5 + np.random.randn(n) * 0.2, index=dates)

    arrays = {
        ("Close", "SYN_A"): price_a.values,
        ("Close", "SYN_B"): price_b.values,
        ("Open", "SYN_A"): price_a.values,
        ("Open", "SYN_B"): price_b.values,
        ("High", "SYN_A"): (price_a + 0.5).values,
        ("High", "SYN_B"): (price_b + 0.3).values,
        ("Low", "SYN_A"): (price_a - 0.5).values,
        ("Low", "SYN_B"): (price_b - 0.3).values,
        ("Volume", "SYN_A"): np.ones(n) * 1000,
        ("Volume", "SYN_B"): np.ones(n) * 1000,
    }
    df = pd.DataFrame(arrays, index=dates)
    df.columns = pd.MultiIndex.from_tuples(df.columns)
    return df


def _make_single_data(n=200, seed=42):
    """Generate single-symbol OHLCV data with MultiIndex columns."""
    np.random.seed(seed)
    dates = pd.date_range("2022-01-01", periods=n, freq="D")
    close = pd.Series(100 + np.cumsum(np.random.randn(n) * 0.5), index=dates)
    high = close + abs(np.random.randn(n) * 0.3)
    low = close - abs(np.random.randn(n) * 0.3)
    open_ = close + np.random.randn(n) * 0.1
    volume = np.ones(n) * 1000

    sym = "SYN_A"
    arrays = {
        ("Close", sym): close.values,
        ("Open", sym): open_.values,
        ("High", sym): high.values,
        ("Low", sym): low.values,
        ("Volume", sym): volume,
    }
    df = pd.DataFrame(arrays, index=dates)
    df.columns = pd.MultiIndex.from_tuples(df.columns)
    return df


class TestPairsTradingStrategy:
    def test_generate_signals_returns_series(self):
        data = _make_pairs_data()
        strategy = PairsTradingStrategy(symbol_a="SYN_A", symbol_b="SYN_B")
        signals = strategy.generate_signals(data)
        assert isinstance(signals, pd.Series)
        assert len(signals) == len(data)
        assert set(signals.unique()).issubset({-1, 0, 1})

    def test_parameters_round_trip(self):
        strategy = PairsTradingStrategy(lookback=30, entry_z=1.5)
        params = strategy.get_parameters()
        assert params["lookback"] == 30
        assert params["entry_z"] == 1.5

        strategy.set_parameters({"lookback": 45})
        assert strategy.lookback == 45

    def test_reset(self):
        strategy = PairsTradingStrategy()
        strategy._price_buffer_a = [1.0, 2.0, 3.0]
        strategy._position = Signal.LONG
        strategy.reset()
        assert strategy._position == Signal.FLAT
        assert len(strategy._price_buffer_a) == 0

    def test_calculate_position_size(self):
        strategy = PairsTradingStrategy()
        assert strategy.calculate_position_size(Signal.FLAT, {"equity": 100000}) == 0.0
        assert strategy.calculate_position_size(Signal.LONG, {"equity": 100000}) == 10000.0

    def test_on_bar_needs_data(self):
        strategy = PairsTradingStrategy(lookback=10)
        result = strategy.on_bar({"symbol": "SYN_A", "close": 100.0, "timestamp": "2023-01-01"})
        assert result is None  # Not enough data yet

    def test_hedge_ratio_zero_variance(self):
        """Should return 1.0 when price_b has zero variance."""
        a = pd.Series([100.0, 101.0, 102.0, 103.0, 104.0])
        b = pd.Series([50.0, 50.0, 50.0, 50.0, 50.0])  # constant
        ratio = PairsTradingStrategy._compute_hedge_ratio(a, b)
        assert ratio == 1.0


class TestMeanReversionStrategy:
    def test_generate_signals(self):
        data = _make_single_data()
        strategy = MeanReversionStrategy(symbol="SYN_A")
        signals = strategy.generate_signals(data)
        assert isinstance(signals, pd.Series)
        assert len(signals) == len(data)
        assert set(signals.unique()).issubset({-1, 0, 1})

    def test_parameters_round_trip(self):
        strategy = MeanReversionStrategy(bb_period=30)
        params = strategy.get_parameters()
        assert params["bb_period"] == 30

    def test_reset(self):
        strategy = MeanReversionStrategy()
        strategy._position = Signal.LONG
        strategy.reset()
        assert strategy._position == Signal.FLAT


class TestMomentumStrategy:
    def test_generate_signals_returns_dataframe(self):
        """Momentum strategy returns DataFrame with columns per symbol."""
        syms = ["SYN_A", "SYN_B"]
        data = _make_pairs_data(n=400)
        strategy = MomentumStrategy(symbols=syms, lookback=60, skip=5)
        signals = strategy.generate_signals(data)
        assert isinstance(signals, pd.DataFrame)
        assert set(signals.columns) == set(syms)
        for col in signals.columns:
            assert set(signals[col].unique()).issubset({-1, 0, 1})

    def test_parameters_round_trip(self):
        strategy = MomentumStrategy(lookback=120)
        params = strategy.get_parameters()
        assert params["lookback"] == 120

    def test_reset(self):
        strategy = MomentumStrategy(symbols=["A", "B"])
        strategy._current_longs = ["A"]
        strategy.reset()
        assert len(strategy._current_longs) == 0
