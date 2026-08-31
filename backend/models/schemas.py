"""
AeroWatch — Pydantic Data Models
All API request/response schemas are defined here.
"""
from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# ─── Enums ────────────────────────────────────────────────────────────────────
SeverityLevel = Literal["LOW", "MODERATE", "ELEVATED", "HIGH", "SEVERE"]
DataMode = Literal["LIVE", "DEMO"]
EventType = Literal["CYCLONE", "FLOOD", "HEATWAVE", "CLOUDBURST", "DROUGHT", "STORM", "COLD_WAVE"]


# ─── Sub-models ───────────────────────────────────────────────────────────────
class AnomalyDrivers(BaseModel):
    rainfall_anomaly_pct: float = Field(..., description="% deviation of rainfall from baseline")
    temperature_anomaly_c: float = Field(..., description="°C deviation from baseline")
    wind_anomaly_pct: float = Field(..., description="% deviation of wind speed from baseline")
    pressure_anomaly_hpa: float = Field(..., description="hPa deviation (negative = low pressure)")
    persistence_days: float = Field(..., description="Days event has been active")
    spatial_growth_pct: float = Field(..., description="% area growth over 24h")


class EventLocation(BaseModel):
    lat: float
    lon: float
    state: str
    district: Optional[str] = None
    region_name: str


class EventTimestep(BaseModel):
    timestep: str = Field(..., description="Forecast step label: T0, T+12h, etc.")
    offset_hours: int
    lat: float
    lon: float
    risk_score: float
    severity: SeverityLevel
    intensity_value: float
    affected_area_km2: float


class WeatherEvent(BaseModel):
    event_id: str
    hazard_type: EventType
    severity: SeverityLevel
    risk_score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=100)
    start_time: datetime
    expected_duration_hours: int
    location: EventLocation
    affected_districts: List[str]
    affected_area_km2: float
    movement_direction: Optional[str] = None
    movement_speed_kmh: Optional[float] = None
    growth_rate_pct: float
    forecast_lead_hours: int
    anomaly_drivers: AnomalyDrivers
    timeline: List[EventTimestep]


class SystemStatus(BaseModel):
    system_online: bool
    data_mode: DataMode
    forecast_cycle: str
    last_updated: datetime
    active_event_count: int
    high_risk_count: int
    severe_count: int
    affected_districts_count: int
    max_risk_score: float
    forecast_lead_hours: int


class WeatherReading(BaseModel):
    """Raw weather data from Open-Meteo or fallback."""
    location_name: str
    lat: float
    lon: float
    state: str
    timestamp: datetime
    temperature_2m: float           # °C
    precipitation: float            # mm
    windspeed_10m: float            # km/h
    surface_pressure: float         # hPa
    relative_humidity_2m: float     # %


class AnomalyReading(BaseModel):
    """Computed anomaly scores for a single location."""
    location_name: str
    lat: float
    lon: float
    state: str
    timestamp: datetime
    # Anomaly z-scores
    temp_z: float
    rain_z: float
    wind_z: float
    pressure_z: float
    # Human-readable deviations
    temp_anomaly_c: float
    rain_anomaly_pct: float
    wind_anomaly_pct: float
    pressure_anomaly_hpa: float
    # Composite
    composite_anomaly_score: float  # 0–100


# ─── API Wrappers ─────────────────────────────────────────────────────────────
class ApiResponse(BaseModel):
    success: bool = True
    mode: DataMode
    timestamp: datetime
    data: object


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    timestamp: datetime
    backend_online: bool = True
