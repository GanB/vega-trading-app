"""Unit tests for engine.data.preprocessor."""

import numpy as np
import pandas as pd
import pytest

from engine.data.preprocessor import (
    normalize_prices,
    compute_spread,
    rolling_zscore,
    compute_bollinger_bands,
    compute_rsi,
    compute_atr,
)


@pytest.fixture
def sample_prices():
    """Simple price DataFrame for testing."""
    np.random.seed(42)
    dates = pd.date_range("2023-01-01", periods=100, freq="D")
    return pd.DataFrame(
        {"A": 100 + np.cumsum(np.random.randn(100) * 0.5),
         "B": 50 + np.cumsum(np.random.randn(100) * 0.3)},
        index=dates,
    )


@pytest.fixture
def sample_series():
    np.random.seed(42)
    dates = pd.date_range("2023-01-01", periods=100, freq="D")
    return pd.Series(100 + np.cumsum(np.random.randn(100) * 0.5), index=dates)


class TestNormalizePrices:
    def test_returns_method(self, sample_prices):
        result = normalize_prices(sample_prices, method="returns")
        assert len(result) == len(sample_prices) - 1
        assert not result.isnull().all().any()

    def test_zscore_method(self, sample_prices):
        result = normalize_prices(sample_prices, method="zscore")
        assert len(result) == len(sample_prices)
        # Z-scores should have mean ~0 and std ~1
        for col in result.columns:
            assert abs(result[col].mean()) < 1e-10
            assert abs(result[col].std() - 1.0) < 0.01

    def test_zscore_handles_zero_std(self):
        """Column with constant values should produce NaN, not error."""
        df = pd.DataFrame({"const": [5.0] * 10, "vary": range(10)})
        result = normalize_prices(df, method="zscore")
        assert result["const"].isna().all()
        assert not result["vary"].isna().all()

    def test_unknown_method_raises(self, sample_prices):
        with pytest.raises(ValueError, match="Unknown method"):
            normalize_prices(sample_prices, method="invalid")


class TestComputeSpread:
    def test_basic_spread(self):
        a = pd.Series([100.0, 101.0, 102.0])
        b = pd.Series([50.0, 50.5, 51.0])
        spread = compute_spread(a, b, hedge_ratio=2.0)
        expected = a - 2.0 * b
        pd.testing.assert_series_equal(spread, expected)


class TestRollingZscore:
    def test_basic(self, sample_series):
        result = rolling_zscore(sample_series, window=20)
        assert len(result) == len(sample_series)
        # First window-1 values should be NaN
        assert result.iloc[:19].isna().all()
        # After warmup, values should be finite
        assert result.iloc[20:].notna().all()

    def test_handles_zero_std(self):
        """Constant series should produce NaN z-scores, not inf."""
        series = pd.Series([5.0] * 50)
        result = rolling_zscore(series, window=10)
        valid = result.iloc[10:]
        assert valid.isna().all()


class TestBollingerBands:
    def test_output_shape(self, sample_series):
        result = compute_bollinger_bands(sample_series, period=20, num_std=2.0)
        assert set(result.columns) == {"sma", "upper", "lower"}
        assert len(result) == len(sample_series)

    def test_band_ordering(self, sample_series):
        result = compute_bollinger_bands(sample_series, period=20, num_std=2.0)
        valid = result.dropna()
        assert (valid["upper"] >= valid["sma"]).all()
        assert (valid["sma"] >= valid["lower"]).all()


class TestComputeRSI:
    def test_output_range(self, sample_series):
        rsi = compute_rsi(sample_series, period=14)
        valid = rsi.dropna()
        assert (valid >= 0).all()
        assert (valid <= 100).all()

    def test_trending_up(self):
        """Strongly uptrending series (with noise) should have high RSI."""
        np.random.seed(42)
        # Uptrend with noise: drift +1 with std 0.5 so occasional down-ticks
        steps = np.random.normal(1.0, 0.5, 200)
        series = pd.Series(100 + np.cumsum(steps))
        rsi = compute_rsi(series, period=14)
        valid = rsi.dropna()
        assert len(valid) > 0
        assert valid.iloc[-1] > 70

    def test_trending_down(self):
        """Strongly downtrending series should have low RSI."""
        np.random.seed(42)
        steps = np.random.normal(-1.0, 0.5, 200)
        series = pd.Series(500 + np.cumsum(steps))
        rsi = compute_rsi(series, period=14)
        valid = rsi.dropna()
        assert len(valid) > 0
        assert valid.iloc[-1] < 30


class TestComputeATR:
    def test_basic(self):
        np.random.seed(42)
        n = 50
        close = pd.Series(100 + np.cumsum(np.random.randn(n) * 0.5))
        high = close + abs(np.random.randn(n) * 0.3)
        low = close - abs(np.random.randn(n) * 0.3)
        atr = compute_atr(high, low, close, period=14)
        assert len(atr) == n
        valid = atr.dropna()
        assert (valid > 0).all()
