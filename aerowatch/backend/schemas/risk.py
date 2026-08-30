"""Risk Pydantic Schemas"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RiskResponse(BaseModel):
    """Schema for risk score API responses."""

    event_id: str
    valid_time: datetime
    risk_score: float
    risk_level: str
    confidence: float
    intensity_component: float
    spatial_extent_component: float
    persistence_component: float
    growth_rate_component: float

    class Config:
        from_attributes = True


class RiskSummary(BaseModel):
    """Overall risk summary for current forecast period."""

    active_events: int
    high_risk_events: int
    severe_events: int
    max_risk_score: float
    max_risk_event: Optional[str] = None
    forecast_horizon_hours: int = 120


class RiskTimelinePoint(BaseModel):
    """Single point in risk timeline."""

    timestep: int
    valid_time: datetime
    risk_score: float
    risk_level: str
