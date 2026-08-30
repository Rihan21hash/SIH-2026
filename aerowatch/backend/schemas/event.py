"""Event Pydantic Schemas"""

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class EventBase(BaseModel):
    """Base event schema with common fields."""

    event_id: str
    hazard_type: str
    first_detected_time: datetime
    centroid_lat: float
    centroid_lon: float
    affected_area_km2: float
    affected_districts: List[str]
    affected_states: List[str]


class EventCreate(EventBase):
    """Schema for creating a new event."""

    pass


class EventResponse(EventBase):
    """Schema for event API responses."""

    id: int
    status: str
    last_updated_time: datetime
    created_at: datetime
    risk_score: Optional[float] = None
    confidence: Optional[float] = None
    severity: Optional[str] = None
    lead_time_hours: Optional[int] = None

    class Config:
        from_attributes = True


class EventTrackResponse(BaseModel):
    """Schema for event track / temporal evolution responses."""

    event_id: str
    timestep: int
    valid_time: datetime
    centroid_lat: float
    centroid_lon: float
    area_km2: float
    intensity: float
    severity: str
    movement_vector_lat: Optional[float] = None
    movement_vector_lon: Optional[float] = None
    growth_rate: float
    persistence_days: int

    class Config:
        from_attributes = True


class EventDriversResponse(BaseModel):
    """SHAP-based feature importance for event."""

    event_id: str
    drivers: dict
    model_version: Optional[str] = None


class AffectedRegion(BaseModel):
    """Individual affected region."""

    name: str
    state: str
    exposure_score: float


class AffectedRegionsResponse(BaseModel):
    """Affected districts and states with exposure metrics."""

    districts: List[AffectedRegion]
    states: List[str]
    total_population_at_risk: Optional[int] = None
