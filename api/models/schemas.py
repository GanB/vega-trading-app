"""Pydantic models for API request/response schemas."""

import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_SYMBOL_RE = re.compile(r"^[A-Za-z0-9_.@-]{1,20}$")


class BacktestRequest(BaseModel):
    strategy: str = Field(..., max_length=50, description="Strategy name: pairs_trading, mean_reversion, momentum")
    symbols: List[str] = Field(..., min_length=1, max_length=20, description="List of ticker symbols")
    start_date: str = Field(..., description="Start date YYYY-MM-DD")
    end_date: str = Field(..., description="End date YYYY-MM-DD")
    params: Dict[str, Any] = Field(default_factory=dict, description="Strategy parameters")
    initial_capital: float = Field(default=100000, gt=0, le=1e12, description="Starting capital")
    data_provider: str = Field(default="synthetic", description="Data provider: yahoo or synthetic")

    @field_validator("start_date", "end_date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        if not _DATE_RE.match(v):
            raise ValueError("Date must be in YYYY-MM-DD format")
        return v

    @field_validator("symbols")
    @classmethod
    def validate_symbols(cls, v: List[str]) -> List[str]:
        for sym in v:
            if not _SYMBOL_RE.match(sym):
                raise ValueError(f"Invalid symbol format: {sym}")
        return v


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
    strategy: str = Field(..., max_length=50)
    symbols: List[str] = Field(..., min_length=1, max_length=20)
    params: Dict[str, Any] = Field(default_factory=dict)
    tick_interval: float = Field(default=1.0, ge=0.5, le=60, description="Seconds between ticks")
    data_provider: str = Field(default="synthetic", max_length=20)


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
