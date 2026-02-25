"""Unit tests for data providers."""

import numpy as np
import pandas as pd
import pytest

from engine.data.providers.synthetic import SyntheticDataProvider


class TestSyntheticDataProvider:
    def test_fetch_ohlcv_basic(self):
        provider = SyntheticDataProvider(seed=42)
        data = provider.fetch_ohlcv(
            symbols=["SYN_A", "SYN_B"],
            start_date="2022-01-01",
            end_date="2023-01-01",
        )
        assert isinstance(data, pd.DataFrame)
        assert not data.empty
        assert isinstance(data.columns, pd.MultiIndex)
        # Should have Close, Open, High, Low, Volume for each symbol
        fields = data.columns.get_level_values(0).unique()
        assert "Close" in fields
        assert "Open" in fields

    def test_fetch_ohlcv_single_symbol(self):
        provider = SyntheticDataProvider(seed=42)
        data = provider.fetch_ohlcv(
            symbols=["SYN_A"],
            start_date="2022-01-01",
            end_date="2022-06-01",
        )
        assert not data.empty

    def test_fetch_latest_bar(self):
        provider = SyntheticDataProvider(seed=42)
        bar = provider.fetch_latest_bar("SYN_A")
        assert isinstance(bar, dict)
        assert "close" in bar
        assert "open" in bar
        assert "high" in bar
        assert "low" in bar
        assert "timestamp" in bar
        assert bar["high"] >= bar["low"]

    def test_available_symbols(self):
        provider = SyntheticDataProvider()
        symbols = provider.available_symbols()
        assert isinstance(symbols, list)
        assert len(symbols) > 0

    def test_reproducible_with_seed(self):
        provider1 = SyntheticDataProvider(seed=42)
        provider2 = SyntheticDataProvider(seed=42)
        data1 = provider1.fetch_ohlcv(["SYN_A"], "2022-01-01", "2022-06-01")
        data2 = provider2.fetch_ohlcv(["SYN_A"], "2022-01-01", "2022-06-01")
        pd.testing.assert_frame_equal(data1, data2)

    def test_prices_positive(self):
        provider = SyntheticDataProvider(seed=42)
        data = provider.fetch_ohlcv(["SYN_A", "SYN_B"], "2022-01-01", "2023-01-01")
        close_a = data["Close"]["SYN_A"]
        assert (close_a > 0).all()

    def test_high_above_low(self):
        provider = SyntheticDataProvider(seed=42)
        data = provider.fetch_ohlcv(["SYN_A"], "2022-01-01", "2023-01-01")
        high = data["High"]["SYN_A"]
        low = data["Low"]["SYN_A"]
        assert (high >= low).all()
