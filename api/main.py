"""FastAPI application entry point."""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import strategies, backtest, portfolio, live

app = FastAPI(
    title="Vega Trading API",
    description="Algorithmic trading platform for statistical arbitrage",
    version="1.0.0",
)

# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(strategies.router)
app.include_router(backtest.router)
app.include_router(portfolio.router)
app.include_router(live.router)


@app.get("/")
async def root():
    return {
        "name": "Vega Trading API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
