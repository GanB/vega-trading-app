"""Unit tests for risk management modules."""

import numpy as np
import pandas as pd
import pytest

from engine.risk.position_sizer import PositionSizer
from engine.risk.stop_loss import StopLossManager
from engine.risk.portfolio_risk import PortfolioRiskManager


class TestPositionSizer:
    def test_fixed_fractional(self):
        size = PositionSizer.fixed_fractional(
            equity=100000, risk_pct=0.02, stop_distance=5.0, price=100.0
        )
        # risk = 100000 * 0.02 = 2000, shares = 2000 / 5 = 400, value = 400 * 100
        assert size == 400

    def test_fixed_fractional_zero_stop(self):
        """When stop_distance=0, falls back to risk_amount/price."""
        size = PositionSizer.fixed_fractional(
            equity=100000, risk_pct=0.02, stop_distance=0.0, price=100.0
        )
        # risk_amount = 2000, shares = 2000 / 100 = 20
        assert size == 20

    def test_kelly_criterion(self):
        size = PositionSizer.kelly_criterion(
            win_rate=0.6, avg_win=2.0, avg_loss=1.0
        )
        assert size > 0
        assert size <= 1.0  # returns a fraction

    def test_kelly_zero_avg_loss(self):
        size = PositionSizer.kelly_criterion(
            win_rate=0.6, avg_win=2.0, avg_loss=0.0
        )
        assert size == 0

    def test_equal_weight(self):
        size = PositionSizer.equal_weight(equity=100000, n_positions=5)
        assert size == pytest.approx(19000.0)  # 100000 * 0.95 / 5

    def test_equal_weight_zero_positions(self):
        size = PositionSizer.equal_weight(equity=100000, n_positions=0)
        assert size == 0

    def test_volatility_scaled(self):
        size = PositionSizer.volatility_scaled(
            equity=100000, target_vol=0.10, asset_vol=0.20
        )
        # 100000 * 0.02 * (0.10 / 0.20) = 1000
        assert size == pytest.approx(1000.0)

    def test_volatility_scaled_zero_vol(self):
        size = PositionSizer.volatility_scaled(
            equity=100000, target_vol=0.10, asset_vol=0.0
        )
        assert size == 0


class TestStopLossManager:
    def test_fixed_percentage(self):
        stop = StopLossManager.fixed_percentage(entry_price=100.0, stop_pct=0.05, side="long")
        assert stop == pytest.approx(95.0)

    def test_fixed_percentage_short(self):
        stop = StopLossManager.fixed_percentage(entry_price=100.0, stop_pct=0.05, side="short")
        assert stop == pytest.approx(105.0)

    def test_atr_based(self):
        np.random.seed(42)
        n = 30
        close = pd.Series(100 + np.cumsum(np.random.randn(n) * 0.5))
        high = close + abs(np.random.randn(n) * 0.3)
        low = close - abs(np.random.randn(n) * 0.3)
        stop = StopLossManager.atr_based(
            entry_price=100.0, high=high, low=low, close=close,
            atr_period=14, atr_multiplier=2.0, side="long"
        )
        assert stop < 100.0  # stop below entry for long

    def test_trailing_stop_long(self):
        stop = StopLossManager.trailing_stop(
            current_price=110.0, highest_since_entry=115.0,
            lowest_since_entry=105.0, trail_pct=0.05, side="long"
        )
        assert stop == pytest.approx(115.0 * 0.95)

    def test_check_stop_triggered(self):
        assert StopLossManager.check_stop(
            current_price=94.0, stop_price=95.0, side="long"
        ) is True

    def test_check_stop_not_triggered(self):
        assert StopLossManager.check_stop(
            current_price=96.0, stop_price=95.0, side="long"
        ) is False


class TestPortfolioRiskManager:
    @pytest.fixture
    def returns(self):
        np.random.seed(42)
        return pd.Series(np.random.randn(252) * 0.01)

    def test_compute_var_historical(self, returns):
        rm = PortfolioRiskManager()
        var = rm.compute_var(returns, confidence=0.95, method="historical")
        assert var >= 0

    def test_compute_var_parametric(self, returns):
        rm = PortfolioRiskManager()
        var = rm.compute_var(returns, confidence=0.95, method="parametric")
        assert var >= 0

    def test_compute_var_unknown_method(self, returns):
        rm = PortfolioRiskManager()
        with pytest.raises(ValueError, match="Unknown VaR method"):
            rm.compute_var(returns, method="invalid")

    def test_compute_cvar(self, returns):
        rm = PortfolioRiskManager()
        cvar = rm.compute_cvar(returns, confidence=0.95)
        assert cvar >= 0

    def test_check_position_limit(self):
        rm = PortfolioRiskManager(max_position_pct=0.20)
        assert rm.check_position_limit(15000, 100000) is True
        assert rm.check_position_limit(25000, 100000) is False

    def test_check_position_limit_zero_equity(self):
        rm = PortfolioRiskManager()
        assert rm.check_position_limit(1000, 0) is False

    def test_compute_portfolio_metrics_empty(self):
        rm = PortfolioRiskManager()
        metrics = rm.compute_portfolio_metrics({}, pd.DataFrame(), 100000)
        assert metrics["within_limits"] is True
        assert metrics["position_count"] == 0
