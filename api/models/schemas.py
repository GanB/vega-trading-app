"""Pydantic models for API request/response schemas."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class BacktestRequest(BaseModel):
    strategy: str = Field(..., description="Strategy name: pairs_trading, mean_reversion, momentum")
    symbols: List[str] = Field(..., description="List of ticker symbols")
    start_date: str = Field(..., description="Start date YYYY-MM-DD")
    end_date: str = Field(..., description="End date YYYY-MM-DD")
    params: Dict[str, Any] = Field(default_factory=dict, description="Strategy parameters")
    initial_capital: float = Field(default=100000, description="Starting capital")
    data_provider: str = Field(default="synthetic", description="Data provider: yahoo or synthetic")


class BacktestMetrics(BaseModel):
    total_return: float
    cagr: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    max_drawdown_peak: Optional[str]
    max_drawdown_trough: Optional[str]
    win_rate: float
    profit_factor: float
    total_trades: int
    final_equity: float


class EquityPoint(BaseModel):
    timestamp: str
    equity: float


class TradeRecord(BaseModel):
    timestamp: str
    symbol: str
    side: str
    quantity: float
    price: float
    commission: float
    pnl: float


class BacktestResult(BaseModel):
    equity_curve: List[EquityPoint]
    trades: List[TradeRecord]
    metrics: BacktestMetrics
    portfolio_state: Dict[str, Any]


class StrategyInfo(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]


class LiveStartRequest(BaseModel):
    strategy: str
    symbols: List[str]
    params: Dict[str, Any] = Field(default_factory=dict)
    tick_interval: float = Field(default=1.0, description="Seconds between ticks")
    data_provider: str = Field(default="synthetic")


class LiveState(BaseModel):
    running: bool
    tick_count: int
    portfolio: Dict[str, Any]
    last_signal: Optional[Dict[str, Any]]
    signal_count: int


class PortfolioState(BaseModel):
    equity: float
    cash: float
    total_pnl: float
    positions: Dict[str, Any]
    num_trades: int
