"""Integration tests for FastAPI endpoints."""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from api.main import app


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_root(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Vega Trading API"


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_list_strategies(client):
    resp = await client.get("/api/v1/strategies")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 3
    names = {s["name"] for s in data}
    assert names == {"pairs_trading", "mean_reversion", "momentum"}
    for s in data:
        assert "description" in s
        assert "parameters" in s


@pytest.mark.asyncio
async def test_run_backtest_pairs_trading(client):
    resp = await client.post("/api/v1/backtest/run", json={
        "strategy": "pairs_trading",
        "symbols": ["SYN_A", "SYN_B"],
        "start_date": "2022-01-01",
        "end_date": "2024-01-01",
        "params": {},
        "initial_capital": 100000,
        "data_provider": "synthetic",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "equity_curve" in data
    assert "trades" in data
    assert "metrics" in data
    assert data["metrics"]["final_equity"] > 0
    assert len(data["equity_curve"]) > 0


@pytest.mark.asyncio
async def test_run_backtest_mean_reversion(client):
    resp = await client.post("/api/v1/backtest/run", json={
        "strategy": "mean_reversion",
        "symbols": ["SYN_A"],
        "start_date": "2022-01-01",
        "end_date": "2024-01-01",
        "params": {"symbol": "SYN_A"},
        "initial_capital": 100000,
        "data_provider": "synthetic",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["metrics"]["final_equity"] > 0


@pytest.mark.asyncio
async def test_run_backtest_momentum(client):
    resp = await client.post("/api/v1/backtest/run", json={
        "strategy": "momentum",
        "symbols": ["SYN_A", "SYN_B", "SYN_C"],
        "start_date": "2022-01-01",
        "end_date": "2024-01-01",
        "params": {"symbols": ["SYN_A", "SYN_B", "SYN_C"], "lookback": 60, "skip": 5},
        "initial_capital": 100000,
        "data_provider": "synthetic",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "metrics" in data


@pytest.mark.asyncio
async def test_run_backtest_invalid_strategy(client):
    resp = await client.post("/api/v1/backtest/run", json={
        "strategy": "nonexistent",
        "symbols": ["SYN_A"],
        "start_date": "2022-01-01",
        "end_date": "2024-01-01",
        "params": {},
        "initial_capital": 100000,
        "data_provider": "synthetic",
    })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_run_backtest_invalid_date_format(client):
    resp = await client.post("/api/v1/backtest/run", json={
        "strategy": "pairs_trading",
        "symbols": ["SYN_A", "SYN_B"],
        "start_date": "not-a-date",
        "end_date": "2024-01-01",
        "params": {},
        "initial_capital": 100000,
        "data_provider": "synthetic",
    })
    assert resp.status_code == 422  # Pydantic validation error


@pytest.mark.asyncio
async def test_portfolio_no_active_trader(client):
    resp = await client.get("/api/v1/portfolio/current")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_live_signals_no_trader(client):
    resp = await client.get("/api/v1/live/signals")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_live_stop_no_trader(client):
    resp = await client.get("/api/v1/live/stop")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_live_start_and_stop(client):
    # Start
    resp = await client.post("/api/v1/live/start", json={
        "strategy": "pairs_trading",
        "symbols": ["SYN_A", "SYN_B"],
        "params": {},
        "tick_interval": 0.5,
        "data_provider": "synthetic",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["running"] is True

    # Get signals
    resp = await client.get("/api/v1/live/signals")
    assert resp.status_code == 200

    # Get portfolio
    resp = await client.get("/api/v1/portfolio/current")
    assert resp.status_code == 200

    # Stop
    resp = await client.get("/api/v1/live/stop")
    assert resp.status_code == 200
    data = resp.json()
    assert data["running"] is False


@pytest.mark.asyncio
async def test_live_start_invalid_strategy(client):
    resp = await client.post("/api/v1/live/start", json={
        "strategy": "nonexistent",
        "symbols": ["SYN_A"],
        "params": {},
        "tick_interval": 1.0,
        "data_provider": "synthetic",
    })
    assert resp.status_code == 400
