"""Backtest execution endpoints."""

import logging

from fastapi import APIRouter, HTTPException

from api.models.schemas import BacktestRequest, BacktestResult
from api.routers.strategies import get_strategy_instance
from engine.backtester.engine import BacktestEngine
from engine.data.providers.yahoo import YahooDataProvider
from engine.data.providers.synthetic import SyntheticDataProvider

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/backtest", tags=["backtest"])


@router.post("/run", response_model=BacktestResult)
async def run_backtest(request: BacktestRequest):
    """Run a backtest with the specified strategy and parameters."""
    try:
        strategy = get_strategy_instance(request.strategy, request.params)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Select data provider
    if request.data_provider == "yahoo":
        provider = YahooDataProvider()
    else:
        provider = SyntheticDataProvider()

    # Fetch data
    try:
        data = provider.fetch_ohlcv(
            symbols=request.symbols,
            start_date=request.start_date,
            end_date=request.end_date,
        )
    except Exception as e:
        logger.exception("Failed to fetch data")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch market data. Please check symbols and date range.",
        )

    if data.empty:
        raise HTTPException(status_code=400, detail="No data returned for given parameters")

    # Run backtest
    engine = BacktestEngine(
        strategy=strategy,
        initial_capital=request.initial_capital,
    )

    try:
        result = engine.run(data)
    except Exception as e:
        logger.exception("Backtest failed")
        raise HTTPException(
            status_code=500,
            detail="Backtest execution failed. Please check parameters.",
        )

    return result
