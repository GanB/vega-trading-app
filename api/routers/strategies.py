"""Strategy listing and info endpoints."""

from fastapi import APIRouter

from api.models.schemas import StrategyInfo
from engine.strategies.pairs_trading import PairsTradingStrategy
from engine.strategies.mean_reversion import MeanReversionStrategy
from engine.strategies.momentum import MomentumStrategy

router = APIRouter(prefix="/api/v1/strategies", tags=["strategies"])

STRATEGY_REGISTRY = {
    "pairs_trading": {
        "class": PairsTradingStrategy,
        "description": PairsTradingStrategy.description,
    },
    "mean_reversion": {
        "class": MeanReversionStrategy,
        "description": MeanReversionStrategy.description,
    },
    "momentum": {
        "class": MomentumStrategy,
        "description": MomentumStrategy.description,
    },
}


def get_strategy_instance(name: str, params: dict = None):
    """Factory function to create a strategy instance."""
    if name not in STRATEGY_REGISTRY:
        raise ValueError(f"Unknown strategy: {name}")
    cls = STRATEGY_REGISTRY[name]["class"]
    instance = cls()
    if params:
        instance.set_parameters(params)
    return instance


@router.get("", response_model=list[StrategyInfo])
async def list_strategies():
    """Return all available strategies with their parameter schemas."""
    result = []
    for name, info in STRATEGY_REGISTRY.items():
        instance = info["class"]()
        result.append(StrategyInfo(
            name=name,
            description=info["description"],
            parameters=instance.get_parameters(),
        ))
    return result
