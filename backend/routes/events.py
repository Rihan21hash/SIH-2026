"""
Events API Routes
Provides endpoints for retrieving active weather anomalies and tracked extreme events.
"""
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timezone
from typing import List, Optional
from backend.models.schemas import WeatherEvent, ApiResponse
from backend.services.open_meteo import fetch_grid_weather
from backend.services.anomaly import process_anomalies
from backend.services.events import generate_events_from_anomalies

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.get("", response_model=ApiResponse)
async def get_events():
    """
    Returns all active tracked extreme weather events in India.
    """
    now = datetime.now(timezone.utc)
    readings = await fetch_grid_weather()
    anomalies = process_anomalies(readings)
    events = generate_events_from_anomalies(anomalies, readings)

    return ApiResponse(
        success=True,
        mode="LIVE",
        timestamp=now,
        data=[e.model_dump(mode="json") for e in events]
    )


@router.get("/{event_id}", response_model=ApiResponse)
async def get_event_by_id(event_id: str):
    """
    Retrieves detailed intelligence for a specific tracked event.
    """
    now = datetime.now(timezone.utc)
    readings = await fetch_grid_weather()
    anomalies = process_anomalies(readings)
    events = generate_events_from_anomalies(anomalies, readings)

    for e in events:
        if e.event_id.lower() == event_id.lower():
            return ApiResponse(
                success=True,
                mode="LIVE",
                timestamp=now,
                data=e.model_dump(mode="json")
            )

    raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")


@router.get("/{event_id}/timeline", response_model=ApiResponse)
async def get_event_timeline(event_id: str):
    """
    Retrieves the spatio-temporal forecast trajectory for a specific event.
    """
    now = datetime.now(timezone.utc)
    readings = await fetch_grid_weather()
    anomalies = process_anomalies(readings)
    events = generate_events_from_anomalies(anomalies, readings)

    for e in events:
        if e.event_id.lower() == event_id.lower():
            return ApiResponse(
                success=True,
                mode="LIVE",
                timestamp=now,
                data=[step.model_dump(mode="json") for step in e.timeline]
            )

    raise HTTPException(status_code=404, detail=f"Timeline for event '{event_id}' not found")
