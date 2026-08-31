"""
Timeline API Route
Provides synchronized multi-event timeline slices for the command center scrubber.
"""
from fastapi import APIRouter
from datetime import datetime, timezone
from typing import Dict, List, Any
from backend.models.schemas import ApiResponse
from backend.services.open_meteo import fetch_grid_weather
from backend.services.anomaly import process_anomalies
from backend.services.events import generate_events_from_anomalies

router = APIRouter(prefix="/api/timeline", tags=["Timeline"])


@router.get("", response_model=ApiResponse)
async def get_system_timeline():
    """
    Returns time-indexed weather event positions and intensities across
    forecast intervals (T0 to T+72h).
    """
    now = datetime.now(timezone.utc)
    readings = await fetch_grid_weather()
    anomalies = process_anomalies(readings)
    events = generate_events_from_anomalies(anomalies, readings)

    timestep_keys = ["T0", "T+12h", "T+24h", "T+36h", "T+48h", "T+72h"]
    timeline_slices: Dict[str, List[Dict[str, Any]]] = {k: [] for k in timestep_keys}

    for ev in events:
        for step in ev.timeline:
            if step.timestep in timeline_slices:
                timeline_slices[step.timestep].append({
                    "event_id": ev.event_id,
                    "hazard_type": ev.hazard_type,
                    "lat": step.lat,
                    "lon": step.lon,
                    "risk_score": step.risk_score,
                    "severity": step.severity,
                    "affected_area_km2": step.affected_area_km2
                })

    return ApiResponse(
        success=True,
        mode="LIVE",
        timestamp=now,
        data={
            "timesteps": timestep_keys,
            "slices": timeline_slices
        }
    )
