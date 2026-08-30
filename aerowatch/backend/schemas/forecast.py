"""Forecast Pydantic Schemas"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ForecastBase(BaseModel):
    """Base forecast schema."""

    grid_id: int
    latitude: float
    longitude: float
    valid_time: datetime
    temperature: Optional[float] = None
    rainfall: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None


class ForecastCreate(ForecastBase):
    """Schema for creating forecast data."""

    forecast_issued_at: datetime
    lead_time_hours: Optional[int] = None
    source: Optional[str] = None


class ForecastResponse(ForecastBase):
    """Schema for forecast API responses."""

    id: int
    forecast_issued_at: datetime
    lead_time_hours: Optional[int] = None
    source: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
