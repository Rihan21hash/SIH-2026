"""Risk API — Risk scoring endpoints"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime

from backend.services.data_service import (
    generate_demo_risk_summary,
    generate_demo_risk_timeline,
)

router = APIRouter(prefix="/risk", tags=["risk"])


@router.get("/summary")
async def get_risk_summary():
    """Get overall risk summary for current forecast period."""
    return generate_demo_risk_summary()


@router.get("/timeline/{event_id}")
async def get_risk_timeline(event_id: str):
    """Get risk score evolution over time for an event."""
    timeline = generate_demo_risk_timeline(event_id)
    if not timeline:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
    return timeline


@router.get("/heatmap")
async def get_risk_heatmap(
    valid_time: Optional[datetime] = None,
    hazard_type: Optional[str] = None,
):
    """Get grid-based risk heatmap for visualization."""
    from backend.services.data_service import generate_demo_anomaly_grid

    # Use offset from valid_time if provided
    offset = 0
    if valid_time:
        base = datetime(2026, 8, 28, 0, 0, 0)
        offset = int((valid_time - base).total_seconds() / 3600)
        offset = max(0, min(119, offset))

    return generate_demo_anomaly_grid(valid_time_offset=offset, variable="risk")
