"""Live/paper trading endpoints and WebSocket feed."""

import asyncio

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from api.models.schemas import LiveStartRequest, LiveState
from api.routers.strategies import get_strategy_instance
from api.routers.portfolio import set_active_trader, get_active_trader
from engine.live.paper_trader import PaperTrader
from engine.data.providers.synthetic import SyntheticDataProvider
from engine.data.providers.yahoo import YahooDataProvider

router = APIRouter(tags=["live"])


@router.post("/api/v1/live/start", response_model=LiveState)
async def start_live_trading(request: LiveStartRequest):
    """Start a paper trading session."""
    # Stop any existing trader
    existing = get_active_trader()
    if existing and existing.is_running:
        await existing.stop()

    try:
        strategy = get_strategy_instance(request.strategy, request.params)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if request.data_provider == "yahoo":
        provider = YahooDataProvider()
    else:
        provider = SyntheticDataProvider()

    trader = PaperTrader(
        strategy=strategy,
        data_provider=provider,
        tick_interval=request.tick_interval,
    )
    set_active_trader(trader)

    await trader.start(request.symbols)

    # Give it a moment to produce the first tick
    await asyncio.sleep(0.1)
    return LiveState(**trader.get_state())


@router.get("/api/v1/live/signals")
async def get_live_signals():
    """Return latest signals from running strategy."""
    trader = get_active_trader()
    if trader is None or not trader.is_running:
        raise HTTPException(status_code=404, detail="No active paper trader")

    return trader.get_latest_update()


@router.get("/api/v1/live/stop", response_model=LiveState)
async def stop_live_trading():
    """Stop the running paper trader."""
    trader = get_active_trader()
    if trader is None:
        raise HTTPException(status_code=404, detail="No active paper trader")

    final_state = await trader.stop()
    return LiveState(**final_state)


@router.websocket("/ws/live")
async def websocket_live_feed(websocket: WebSocket):
    """WebSocket endpoint for real-time paper trading updates.

    Streams: {timestamp, symbol, signal, price, position, pnl}
    """
    await websocket.accept()

    trader = get_active_trader()
    if trader is None or not trader.is_running:
        await websocket.send_json({"error": "No active paper trader"})
        await websocket.close()
        return

    try:
        while True:
            if not trader.is_running:
                await websocket.send_json({"status": "stopped"})
                break

            update = trader.get_latest_update()
            await websocket.send_json(update)
            await asyncio.sleep(trader.tick_interval)
    except WebSocketDisconnect:
        pass
    except Exception:
        await websocket.close()
