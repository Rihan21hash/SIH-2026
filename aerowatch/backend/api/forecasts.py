"""Forecast API — Forecast retrieval and grid endpoints"""

from fastapi import APIRouter, Query
from typing import Optional, List
from datetime import datetime
from backend.services.forecast_service import ForecastService

router = APIRouter(prefix="/forecasts", tags=["forecasts"])
forecast_service = ForecastService()


@router.get("/")
async def list_forecasts(
    grid_id: Optional[int] = None,
    horizon_hours: int = 120,
):
    """Retrieve forecast grid data up to horizon_hours."""
    base_time = datetime(2026, 8, 28, 0, 0, 0)
    data = forecast_service.generate_synthetic_forecast_grid(base_time, horizon_hours)
    if grid_id is not None:
        data = [d for d in data if d["grid_id"] == grid_id]
    return data
