"""Portfolio state endpoints."""

from fastapi import APIRouter, HTTPException

from api.models.schemas import PortfolioState

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])

# Reference to active paper trader (set by live router)
_active_trader = None


def set_active_trader(trader):
    global _active_trader
    _active_trader = trader


def get_active_trader():
    return _active_trader


@router.get("/current", response_model=PortfolioState)
async def get_current_portfolio():
    """Return current paper trading portfolio state."""
    trader = get_active_trader()
    if trader is None:
        raise HTTPException(
            status_code=404,
            detail="No active paper trader. Start one via POST /api/v1/live/start",
        )

    state = trader.portfolio.get_state()
    return PortfolioState(**state)
