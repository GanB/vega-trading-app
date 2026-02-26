"""Abstract base class for all data providers."""

from abc import ABC, abstractmethod
from typing import List, Optional

import pandas as pd


class BaseDataProvider(ABC):
    """Interface that every data provider must implement."""

    @abstractmethod
    def fetch_ohlcv(
        self,
        symbols: List[str],
        start_date: str,
        end_date: str,
        interval: str = "1d",
    ) -> pd.DataFrame:
        """Fetch OHLCV data for one or more symbols.

        Returns a DataFrame with a DatetimeIndex and MultiIndex columns
        (field, symbol) where field is one of: Open, High, Low, Close, Volume.
        """

    @abstractmethod
    def fetch_latest_bar(self, symbol: str) -> dict:
        """Return the most recent bar as a dict with keys:
        timestamp, open, high, low, close, volume.
        """

    @abstractmethod
    def available_symbols(self) -> List[str]:
        """Return list of symbols this provider can serve."""
