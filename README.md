# Vega Trading Platform

A production-grade algorithmic trading platform for statistical arbitrage, built with Python (FastAPI) and React (TypeScript).

## Architecture

```
Browser (React + TypeScript + Tailwind)
   │
   ├── REST ──► FastAPI (/api/v1/...)
   │               │
   │               ├── BacktestEngine
   │               │       ├── PairsTradingStrategy
   │               │       ├── MeanReversionStrategy
   │               │       └── MomentumStrategy
   │               │
   │               └── PaperTrader (asyncio)
   │                       ├── SignalGenerator
   │                       └── SyntheticDataProvider
   │
   └── WebSocket ──► /ws/live (real-time PnL stream)
```

## Strategies

| Strategy | Description | Key Parameters |
|----------|-------------|----------------|
| **Pairs Trading** | Engle-Granger cointegration with z-score signals | `lookback=60, entry_z=2.0, exit_z=0.5, stop_z=3.5` |
| **Mean Reversion** | Bollinger Bands + RSI filter | `bb_period=20, bb_std=2.0, rsi_period=14` |
| **Momentum** | Cross-asset 12-1 month momentum, monthly rebalance | `lookback=252, skip=21, top_pct=0.25` |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional)

### Local Development

```bash
# Clone and setup
git clone git@github.com:GanB/vega-trading-app.git
cd vega-trading-app

# Python backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Copy environment config
cp .env.example .env

# Start API server
uvicorn api.main:app --reload --port 8000

# In a new terminal — React frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — the frontend proxies API calls to port 8000.

### Docker

```bash
cp .env.example .env
docker compose up --build            # API + Frontend
docker compose --profile dev up      # + Jupyter Lab
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Docs | http://localhost:8000/docs |
| Jupyter | http://localhost:8888 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/strategies` | List available strategies with parameter schemas |
| `POST` | `/api/v1/backtest/run` | Run a backtest |
| `POST` | `/api/v1/live/start` | Start paper trading |
| `GET` | `/api/v1/live/signals` | Get latest live signals |
| `GET` | `/api/v1/live/stop` | Stop paper trader |
| `GET` | `/api/v1/portfolio/current` | Current portfolio state |
| `WS` | `/ws/live` | Real-time PnL stream |

### Example — Run a Backtest

```bash
curl -X POST http://localhost:8000/api/v1/backtest/run \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "pairs_trading",
    "symbols": ["SYN_A", "SYN_B"],
    "start_date": "2022-01-01",
    "end_date": "2024-01-01",
    "params": {},
    "initial_capital": 100000,
    "data_provider": "synthetic"
  }'
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_PROVIDER` | `yahoo` | `yahoo` or `synthetic` |
| `DEFAULT_LOOKBACK_DAYS` | `365` | Default historical lookback |
| `PAPER_TRADING_ENABLED` | `true` | Enable paper trading mode |
| `INITIAL_CAPITAL` | `100000` | Starting capital for paper trading |
| `COMMISSION_RATE` | `0.001` | Commission rate (0.1%) |
| `API_HOST` | `0.0.0.0` | API bind host |
| `API_PORT` | `8000` | API port |
| `JUPYTER_TOKEN` | — | Jupyter Lab access token |

## Project Structure

```
vega-trading-app/
├── engine/                     # Core trading engine (Python)
│   ├── strategies/             # Trading strategy implementations
│   ├── backtester/             # Event-driven backtesting engine
│   ├── data/providers/         # Yahoo Finance + Synthetic data
│   ├── risk/                   # Position sizing, stops, VaR/CVaR
│   └── live/                   # Paper trader + signal generator
├── api/                        # FastAPI backend
│   ├── routers/                # REST + WebSocket endpoints
│   └── models/                 # Pydantic schemas
├── frontend/                   # React + TypeScript + Tailwind
│   └── src/
│       ├── components/         # EquityCurve, MetricsPanel, TradeLog
│       ├── pages/              # StrategyLab, LiveTrading, PairsFinder
│       └── hooks/              # useApi, useWebSocket
├── notebooks/                  # Jupyter research notebooks
├── tests/
├── docker-compose.yml
└── .env.example
```

## Mock Mode

All three strategies run fully in demo mode using `DATA_PROVIDER=synthetic`. The `SyntheticDataProvider` generates correlated price series via Geometric Brownian Motion — **no API keys or market data subscriptions required**.

## License

MIT
