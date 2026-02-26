"""Performance metrics: Sharpe, Sortino, max drawdown, and more."""

import numpy as np
import pandas as pd


def compute_sharpe_ratio(
    equity_series: pd.Series, risk_free_rate: float = 0.02, periods: int = 252
) -> float:
    """Annualized Sharpe ratio."""
    returns = equity_series.pct_change().dropna()
    if len(returns) < 2 or np.isclose(returns.std(), 0):
        return 0.0
    excess_returns = returns - risk_free_rate / periods
    return float(np.sqrt(periods) * excess_returns.mean() / returns.std())


def compute_sortino_ratio(
    equity_series: pd.Series, risk_free_rate: float = 0.02, periods: int = 252
) -> float:
    """Annualized Sortino ratio (downside deviation only)."""
    returns = equity_series.pct_change().dropna()
    excess_returns = returns - risk_free_rate / periods
    downside = returns[returns < 0]
    if len(downside) < 2 or np.isclose(downside.std(), 0):
        return 0.0
    return float(np.sqrt(periods) * excess_returns.mean() / downside.std())


def compute_max_drawdown(equity_series: pd.Series) -> dict:
    """Maximum drawdown and its duration."""
    if len(equity_series) < 2:
        return {"max_drawdown": 0.0, "peak_date": None, "trough_date": None}

    cummax = equity_series.cummax()
    drawdown = (equity_series - cummax) / cummax
    max_dd = float(drawdown.min())

    trough_idx = drawdown.idxmin()
    peak_idx = equity_series.loc[:trough_idx].idxmax()

    return {
        "max_drawdown": max_dd,
        "peak_date": str(peak_idx),
        "trough_date": str(trough_idx),
    }


def compute_win_rate(trades_df: pd.DataFrame) -> float:
    """Percentage of trades with positive PnL."""
    closing_trades = trades_df[trades_df["pnl"] != 0]
    if closing_trades.empty:
        return 0.0
    winners = closing_trades[closing_trades["pnl"] > 0]
    return float(len(winners) / len(closing_trades))


def compute_profit_factor(trades_df: pd.DataFrame) -> float:
    """Ratio of gross profits to gross losses."""
    closing_trades = trades_df[trades_df["pnl"] != 0]
    if closing_trades.empty:
        return 0.0
    gross_profit = closing_trades[closing_trades["pnl"] > 0]["pnl"].sum()
    gross_loss = abs(closing_trades[closing_trades["pnl"] < 0]["pnl"].sum())
    if gross_loss == 0:
        return float("inf") if gross_profit > 0 else 0.0
    return float(gross_profit / gross_loss)


def compute_cagr(equity_series: pd.Series, periods: int = 252) -> float:
    """Compound Annual Growth Rate."""
    if len(equity_series) < 2:
        return 0.0
    total_return = equity_series.iloc[-1] / equity_series.iloc[0]
    n_years = len(equity_series) / periods
    if n_years <= 0 or total_return <= 0:
        return 0.0
    return float(total_return ** (1 / n_years) - 1)


def compute_all_metrics(
    equity_series: pd.Series, trades_df: pd.DataFrame
) -> dict:
    """Compute all performance metrics at once."""
    dd_info = compute_max_drawdown(equity_series)
    return {
        "total_return": float(
            (equity_series.iloc[-1] / equity_series.iloc[0] - 1)
            if len(equity_series) > 1 else 0.0
        ),
        "cagr": compute_cagr(equity_series),
        "sharpe_ratio": compute_sharpe_ratio(equity_series),
        "sortino_ratio": compute_sortino_ratio(equity_series),
        "max_drawdown": dd_info["max_drawdown"],
        "max_drawdown_peak": dd_info["peak_date"],
        "max_drawdown_trough": dd_info["trough_date"],
        "win_rate": compute_win_rate(trades_df),
        "profit_factor": compute_profit_factor(trades_df),
        "total_trades": len(trades_df),
        "final_equity": float(equity_series.iloc[-1]) if len(equity_series) > 0 else 0.0,
    }
