"""SQLAlchemy ORM models for AeroWatch database."""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    JSON,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    grid_id = Column(Integer, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    temperature = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    pressure = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    wind_direction = Column(Float, nullable=True)
    source = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("grid_id", "timestamp", "source", name="uq_obs_grid_time_source"),
    )


class ForecastData(Base):
    __tablename__ = "forecast_data"

    id = Column(Integer, primary_key=True, index=True)
    grid_id = Column(Integer, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    forecast_issued_at = Column(DateTime, nullable=False)
    valid_time = Column(DateTime, nullable=False, index=True)
    lead_time_hours = Column(Integer, nullable=True)
    temperature = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    pressure = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    wind_direction = Column(Float, nullable=True)
    source = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("grid_id", "forecast_issued_at", "valid_time", "source", name="uq_fc_grid_issued_valid"),
    )


class HistoricalBaseline(Base):
    __tablename__ = "historical_baselines"

    id = Column(Integer, primary_key=True, index=True)
    grid_id = Column(Integer, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    variable = Column(String(50), nullable=False)  # 'temperature', 'rainfall', 'wind_speed'
    month = Column(Integer, nullable=False)        # 1-12
    mean = Column(Float, nullable=True)
    median = Column(Float, nullable=True)
    std_dev = Column(Float, nullable=True)
    p05 = Column(Float, nullable=True)
    p25 = Column(Float, nullable=True)
    p75 = Column(Float, nullable=True)
    p95 = Column(Float, nullable=True)
    p99 = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("grid_id", "variable", "month", name="uq_baseline_grid_var_month"),
    )


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    grid_id = Column(Integer, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    forecast_id = Column(Integer, ForeignKey("forecast_data.id"), nullable=True)
    variable = Column(String(50), nullable=True)
    anomaly_score = Column(Float, nullable=True)  # 0-100
    z_score = Column(Float, nullable=True)
    percentile_rank = Column(Float, nullable=True)
    severity = Column(String(20), nullable=True, index=True)  # NORMAL, WATCH, WARNING, SEVERE, EXTREME
    created_at = Column(DateTime, default=datetime.utcnow)


class WeatherEvent(Base):
    __tablename__ = "weather_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(50), unique=True, nullable=False, index=True)  # 'AW-001'
    hazard_type = Column(String(50), nullable=False, index=True)            # 'extreme_rainfall', 'heatwave'
    first_detected_time = Column(DateTime, nullable=False)
    last_updated_time = Column(DateTime, nullable=False)
    centroid_lat = Column(Float, nullable=True)
    centroid_lon = Column(Float, nullable=True)
    geometry_geojson = Column(JSON, nullable=True)  # Store GeoJSON polygon representation
    affected_area_km2 = Column(Float, nullable=True)
    affected_districts = Column(JSON, nullable=True)  # Array of strings
    affected_states = Column(JSON, nullable=True)     # Array of strings
    status = Column(String(20), default="ACTIVE")    # ACTIVE, DECLINING, DISSIPATED
    created_at = Column(DateTime, default=datetime.utcnow)

    tracks = relationship("EventTrack", back_populates="event", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="event", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="event", cascade="all, delete-orphan")


class EventTrack(Base):
    __tablename__ = "event_tracks"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(50), ForeignKey("weather_events.event_id"), nullable=False, index=True)
    timestep = Column(Integer, nullable=False)
    valid_time = Column(DateTime, nullable=False, index=True)
    centroid_lat = Column(Float, nullable=True)
    centroid_lon = Column(Float, nullable=True)
    area_km2 = Column(Float, nullable=True)
    intensity = Column(Float, nullable=True)  # 0-100
    severity = Column(String(20), nullable=True)
    movement_vector_lat = Column(Float, nullable=True)
    movement_vector_lon = Column(Float, nullable=True)
    growth_rate = Column(Float, nullable=True)
    persistence_days = Column(Integer, default=1)
    geometry_geojson = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("WeatherEvent", back_populates="tracks")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(50), ForeignKey("weather_events.event_id"), nullable=False, index=True)
    timestep = Column(Integer, nullable=True)
    valid_time = Column(DateTime, nullable=False, index=True)
    risk_score = Column(Float, nullable=False)  # 0-100
    risk_level = Column(String(20), nullable=False)  # LOW, MODERATE, HIGH, SEVERE, EXTREME
    intensity_component = Column(Float, nullable=True)
    spatial_extent_component = Column(Float, nullable=True)
    persistence_component = Column(Float, nullable=True)
    growth_rate_component = Column(Float, nullable=True)
    confidence_component = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("WeatherEvent", back_populates="risk_scores")


class ModelPrediction(Base):
    __tablename__ = "model_predictions"

    id = Column(Integer, primary_key=True, index=True)
    forecast_id = Column(Integer, ForeignKey("forecast_data.id"), nullable=True)
    anomaly_id = Column(Integer, ForeignKey("anomalies.id"), nullable=True)
    model_version = Column(String(50), nullable=True)
    predicted_severity = Column(String(20), nullable=True)
    predicted_probability = Column(Float, nullable=True)
    shap_base_value = Column(Float, nullable=True)
    shap_feature_values = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, nullable=False, index=True)
    event_id = Column(String(50), ForeignKey("weather_events.event_id"), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    title = Column(Text, nullable=False)
    message = Column(Text, nullable=False)
    affected_districts = Column(JSON, nullable=True)
    expected_lead_time_hours = Column(Integer, nullable=True)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)

    event = relationship("WeatherEvent", back_populates="alerts")


class AdministrativeBoundary(Base):
    __tablename__ = "administrative_boundaries"

    id = Column(Integer, primary_key=True, index=True)
    state_name = Column(String(100), nullable=False)
    district_name = Column(String(100), nullable=False)
    state_code = Column(String(5), nullable=True)
    district_code = Column(String(5), nullable=True)
    geometry_geojson = Column(JSON, nullable=True)

    __table_args__ = (
        UniqueConstraint("state_code", "district_code", name="uq_state_district_code"),
    )


class SystemStatus(Base):
    __tablename__ = "system_status"

    id = Column(Integer, primary_key=True, index=True)
    component = Column(String(100), nullable=False)  # 'data_ingestion', 'ml_inference', 'api'
    status = Column(String(20), default="HEALTHY")    # 'HEALTHY', 'WARNING', 'ERROR'
    last_check = Column(DateTime, default=datetime.utcnow)
    last_successful_run = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
