"""Events API — Weather event endpoints"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from backend.services.data_service import (
    generate_demo_events,
    generate_demo_event_timeline,
    generate_demo_event_drivers,
    generate_demo_affected_regions,
)

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/")
async def list_events(
    hazard_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
):
    """List all active weather events with optional filtering."""
    events = generate_demo_events()

    # Apply filters
    if hazard_type:
        events = [e for e in events if e["hazard_type"] == hazard_type]
    if severity:
        events = [e for e in events if e["severity"] == severity]
    if status:
        events = [e for e in events if e["status"] == status]

    return events[offset : offset + limit]


@router.get("/{event_id}")
async def get_event_detail(event_id: str):
    """Get detailed information about a specific event."""
    events = generate_demo_events()
    event = next((e for e in events if e["event_id"] == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
    return event


@router.get("/{event_id}/timeline")
async def get_event_timeline(
    event_id: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
):
    """Get complete temporal evolution of an event."""
    timeline = generate_demo_event_timeline(event_id)
    if not timeline:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
    return timeline


@router.get("/{event_id}/drivers")
async def get_event_drivers(event_id: str):
    """Get SHAP-based feature importance for why event was flagged."""
    drivers = generate_demo_event_drivers(event_id)
    if not drivers["drivers"]:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
    return drivers


@router.get("/{event_id}/affected-regions")
async def get_affected_regions(event_id: str):
    """Get affected districts and states with exposure metrics."""
    regions = generate_demo_affected_regions(event_id)
    if not regions["districts"]:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
    return regions
