"""Position sizing methods: Kelly criterion, fixed fractional."""

import numpy as np
from typing import Optional


class PositionSizer:
    """Calculate optimal position sizes using various methods."""

    @staticmethod
    def fixed_fractional(
        equity: float,
        risk_pct: float = 0.02,
        stop_distance: float = 0.0,
        price: float = 1.0,
    ) -> float:
        """Fixed fractional position sizing.

        Args:
            equity: Current portfolio equity.
            risk_pct: Maximum fraction of equity to risk per trade.
            stop_distance: Distance to stop loss in price units.
            price: Current price of the asset.

        Returns:
            Number of shares to trade.
        """
        risk_amount = equity * risk_pct
        if stop_distance > 0:
            shares = risk_amount / stop_distance
        else:
            shares = risk_amount / price
        return max(0, shares)

    @staticmethod
    def kelly_criterion(
        win_rate: float,
        avg_win: float,
        avg_loss: float,
        kelly_fraction: float = 0.5,
    ) -> float:
        """Kelly criterion for optimal bet sizing.

        Args:
            win_rate: Historical win rate (0 to 1).
            avg_win: Average winning trade return.
            avg_loss: Average losing trade return (positive number).
            kelly_fraction: Fraction of full Kelly to use (0.5 = half Kelly).

        Returns:
            Optimal fraction of equity to allocate.
        """
        if avg_loss <= 0 or win_rate <= 0 or win_rate >= 1:
            return 0.0

        win_loss_ratio = avg_win / avg_loss
        kelly = win_rate - (1 - win_rate) / win_loss_ratio

        # Apply fractional Kelly and floor at 0
        return max(0.0, kelly * kelly_fraction)

    @staticmethod
    def equal_weight(
        equity: float,
        n_positions: int,
        max_allocation: float = 0.95,
    ) -> float:
        """Equal-weight allocation across N positions.

        Args:
            equity: Current portfolio equity.
            n_positions: Number of positions to hold.
            max_allocation: Maximum total allocation (leave some cash buffer).

        Returns:
            Dollar amount per position.
        """
        if n_positions <= 0:
            return 0.0
        return (equity * max_allocation) / n_positions

    @staticmethod
    def volatility_scaled(
        equity: float,
        target_vol: float,
        asset_vol: float,
        risk_pct: float = 0.02,
    ) -> float:
        """Scale position size inversely with asset volatility.

        Args:
            equity: Current portfolio equity.
            target_vol: Target annualized volatility for the position.
            asset_vol: Asset's annualized volatility.
            risk_pct: Base risk percentage.

        Returns:
            Dollar amount to allocate.
        """
        if asset_vol <= 0:
            return 0.0
        vol_scalar = target_vol / asset_vol
        return equity * risk_pct * vol_scalar
