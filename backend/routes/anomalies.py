"""
Anomalies API Route
Provides raw anomaly z-scores and meteorological deviations across India.
"""
from fastapi import APIRouter
from datetime import datetime, timezone
from backend.models.schemas import ApiResponse
from backend.services.open_meteo import fetch_grid_weather
from backend.services.anomaly import process_anomalies

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])


@router.get("", response_model=ApiResponse)
async def get_all_anomalies():
    """
    Returns computed meteorological anomalies across all monitoring grid stations in India.
    """
    now = datetime.now(timezone.utc)
    readings = await fetch_grid_weather()
    anomalies = process_anomalies(readings)

    return ApiResponse(
        success=True,
        mode="LIVE",
        timestamp=now,
        data=[a.model_dump(mode="json") for a in anomalies]
    )
