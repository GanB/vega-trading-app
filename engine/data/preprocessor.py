"""Data preprocessing: normalization, feature engineering, cleaning."""

import numpy as np
import pandas as pd


def normalize_prices(df: pd.DataFrame, method: str = "returns") -> pd.DataFrame:
    """Normalize price data.

    Args:
        df: DataFrame with price columns.
        method: 'returns' for log returns, 'zscore' for z-score normalization.
    """
    if method == "returns":
        return np.log(df / df.shift(1)).dropna()
    elif method == "zscore":
        std = df.std()
        std = std.replace(0, np.nan)
        return (df - df.mean()) / std
    else:
        raise ValueError(f"Unknown method: {method}")


def compute_spread(
    price_a: pd.Series, price_b: pd.Series, hedge_ratio: float
) -> pd.Series:
    """Compute the spread between two price series."""
    return price_a - hedge_ratio * price_b


def rolling_zscore(series: pd.Series, window: int = 60) -> pd.Series:
    """Compute rolling z-score of a series."""
    mean = series.rolling(window=window).mean()
    std = series.rolling(window=window).std()
    std = std.replace(0, np.nan)
    return (series - mean) / std


def compute_bollinger_bands(
    series: pd.Series, period: int = 20, num_std: float = 2.0
) -> pd.DataFrame:
    """Compute Bollinger Bands."""
    sma = series.rolling(window=period).mean()
    std = series.rolling(window=period).std()
    return pd.DataFrame({
        "sma": sma,
        "upper": sma + num_std * std,
        "lower": sma - num_std * std,
    })


def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Compute Relative Strength Index using Wilder's smoothing."""
    delta = series.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = (-delta).where(delta < 0, 0.0)

    avg_gain = gain.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi


def compute_atr(
    high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14
) -> pd.Series:
    """Compute Average True Range."""
    prev_close = close.shift(1)
    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    return tr.rolling(window=period).mean()
