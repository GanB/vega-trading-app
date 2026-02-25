"""Portfolio-level risk management: VaR, CVaR, correlation limits."""

import numpy as np
import pandas as pd
from typing import Dict, Optional


class PortfolioRiskManager:
    """Portfolio-wide risk metrics and limits."""

    def __init__(
        self,
        max_portfolio_var: float = 0.05,
        max_position_pct: float = 0.20,
        max_correlation: float = 0.80,
        max_sector_exposure: float = 0.40,
    ):
        self.max_portfolio_var = max_portfolio_var
        self.max_position_pct = max_position_pct
        self.max_correlation = max_correlation
        self.max_sector_exposure = max_sector_exposure

    @staticmethod
    def compute_var(
        returns: pd.Series,
        confidence: float = 0.95,
        method: str = "historical",
    ) -> float:
        """Compute Value at Risk.

        Args:
            returns: Series of portfolio returns.
            confidence: Confidence level (e.g. 0.95 for 95% VaR).
            method: 'historical' or 'parametric'.

        Returns:
            VaR as a positive number (loss).
        """
        if len(returns) < 2:
            return 0.0

        if method == "historical":
            var = -np.percentile(returns.dropna(), (1 - confidence) * 100)
        elif method == "parametric":
            from scipy import stats
            z = stats.norm.ppf(1 - confidence)
            var = -(returns.mean() + z * returns.std())
        else:
            raise ValueError(f"Unknown VaR method: {method}")

        return float(max(0, var))

    @staticmethod
    def compute_cvar(
        returns: pd.Series, confidence: float = 0.95
    ) -> float:
        """Compute Conditional Value at Risk (Expected Shortfall).

        Average loss in the worst (1-confidence)% of cases.
        """
        if len(returns) < 2:
            return 0.0

        cutoff = np.percentile(returns.dropna(), (1 - confidence) * 100)
        tail_losses = returns[returns <= cutoff]

        if tail_losses.empty:
            return 0.0

        return float(-tail_losses.mean())

    def check_position_limit(
        self, position_value: float, portfolio_equity: float
    ) -> bool:
        """Check if a position exceeds the maximum allocation."""
        if portfolio_equity <= 0:
            return False
        return abs(position_value / portfolio_equity) <= self.max_position_pct

    def check_correlation_limit(
        self,
        new_symbol_returns: pd.Series,
        existing_positions_returns: Dict[str, pd.Series],
    ) -> bool:
        """Check if adding a new position would breach correlation limits."""
        for sym, existing_returns in existing_positions_returns.items():
            # Align the series
            aligned = pd.concat(
                [new_symbol_returns, existing_returns], axis=1
            ).dropna()
            if len(aligned) < 10:
                continue
            corr = aligned.corr().iloc[0, 1]
            if abs(corr) > self.max_correlation:
                return False
        return True

    def compute_portfolio_metrics(
        self,
        positions: Dict[str, float],
        returns_data: pd.DataFrame,
        portfolio_equity: float,
    ) -> dict:
        """Compute comprehensive portfolio risk metrics."""
        if returns_data.empty or not positions:
            return {
                "portfolio_var_95": 0.0,
                "portfolio_cvar_95": 0.0,
                "max_position_pct": 0.0,
                "position_count": 0,
                "within_limits": True,
            }

        # Compute portfolio returns (weighted sum)
        weights = {}
        for sym, value in positions.items():
            weights[sym] = value / portfolio_equity if portfolio_equity > 0 else 0

        portfolio_returns = pd.Series(0, index=returns_data.index, dtype=float)
        for sym, weight in weights.items():
            if sym in returns_data.columns:
                portfolio_returns += weight * returns_data[sym]

        var_95 = self.compute_var(portfolio_returns, confidence=0.95)
        cvar_95 = self.compute_cvar(portfolio_returns, confidence=0.95)

        max_pos_pct = max(
            abs(v / portfolio_equity) for v in positions.values()
        ) if positions and portfolio_equity > 0 else 0.0

        within_limits = (
            var_95 <= self.max_portfolio_var
            and max_pos_pct <= self.max_position_pct
        )

        return {
            "portfolio_var_95": var_95,
            "portfolio_cvar_95": cvar_95,
            "max_position_pct": max_pos_pct,
            "position_count": len(positions),
            "within_limits": within_limits,
        }
