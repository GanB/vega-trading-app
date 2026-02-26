"""FastAPI application entry point."""

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response

from api.routers import strategies, backtest, portfolio, live

_env = os.getenv("ENV", "development")

app = FastAPI(
    title="Vega Trading API",
    description="Algorithmic trading platform for statistical arbitrage",
    version="1.0.0",
    docs_url="/docs" if _env != "production" else None,
    redoc_url="/redoc" if _env != "production" else None,
)

# CORS — allow React frontend
_cors_origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


app.include_router(strategies.router)
app.include_router(backtest.router)
app.include_router(portfolio.router)
app.include_router(live.router)


@app.get("/")
async def root():
    return {
        "name": "Vega Trading API",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
