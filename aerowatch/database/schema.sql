-- AeroWatch Database Schema
-- PostgreSQL + PostGIS

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Weather Observations Table
CREATE TABLE weather_observations (
    id SERIAL PRIMARY KEY,
    grid_id INTEGER NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    temperature FLOAT,
    rainfall FLOAT,
    humidity FLOAT,
    pressure FLOAT,
    wind_speed FLOAT,
    wind_direction FLOAT,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grid_id, timestamp, source)
);
CREATE INDEX idx_obs_timestamp ON weather_observations(timestamp);
CREATE INDEX idx_obs_grid ON weather_observations(grid_id);
CREATE INDEX idx_weather_obs_composite ON weather_observations(grid_id, timestamp);

-- Forecast Data Table
CREATE TABLE forecast_data (
    id SERIAL PRIMARY KEY,
    grid_id INTEGER NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    forecast_issued_at TIMESTAMP NOT NULL,
    valid_time TIMESTAMP NOT NULL,
    lead_time_hours INTEGER,
    temperature FLOAT,
    rainfall FLOAT,
    humidity FLOAT,
    pressure FLOAT,
    wind_speed FLOAT,
    wind_direction FLOAT,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grid_id, forecast_issued_at, valid_time, source)
);
CREATE INDEX idx_forecast_valid_time ON forecast_data(valid_time);
CREATE INDEX idx_forecast_grid ON forecast_data(grid_id);
CREATE INDEX idx_forecast_composite ON forecast_data(grid_id, valid_time);

-- Historical Baselines Table
CREATE TABLE historical_baselines (
    id SERIAL PRIMARY KEY,
    grid_id INTEGER NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    variable VARCHAR(50) NOT NULL,
    month INTEGER NOT NULL,
    mean FLOAT,
    median FLOAT,
    std_dev FLOAT,
    p05 FLOAT,
    p25 FLOAT,
    p75 FLOAT,
    p95 FLOAT,
    p99 FLOAT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grid_id, variable, month)
);
CREATE INDEX idx_baseline_grid_month ON historical_baselines(grid_id, month);

-- Anomalies Table
CREATE TABLE anomalies (
    id SERIAL PRIMARY KEY,
    grid_id INTEGER NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    forecast_id INTEGER REFERENCES forecast_data(id),
    variable VARCHAR(50),
    anomaly_score FLOAT,
    z_score FLOAT,
    percentile_rank FLOAT,
    severity VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_anomaly_timestamp ON anomalies(timestamp);
CREATE INDEX idx_anomaly_grid ON anomalies(grid_id);
CREATE INDEX idx_anomaly_severity ON anomalies(severity);

-- Weather Events Table
CREATE TABLE weather_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(50) UNIQUE NOT NULL,
    hazard_type VARCHAR(50) NOT NULL,
    first_detected_time TIMESTAMP NOT NULL,
    last_updated_time TIMESTAMP NOT NULL,
    centroid_lat FLOAT,
    centroid_lon FLOAT,
    geometry GEOMETRY(Polygon, 4326),
    affected_area_km2 FLOAT,
    affected_districts TEXT[],
    affected_states TEXT[],
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_event_id ON weather_events(event_id);
CREATE INDEX idx_event_hazard ON weather_events(hazard_type);
CREATE INDEX idx_event_geom ON weather_events USING GIST(geometry);

-- Event Tracks Table (temporal evolution)
CREATE TABLE event_tracks (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL REFERENCES weather_events(event_id),
    timestep INTEGER,
    valid_time TIMESTAMP NOT NULL,
    centroid_lat FLOAT,
    centroid_lon FLOAT,
    area_km2 FLOAT,
    intensity FLOAT,
    severity VARCHAR(20),
    movement_vector_lat FLOAT,
    movement_vector_lon FLOAT,
    growth_rate FLOAT,
    persistence_days INTEGER,
    geometry GEOMETRY(Polygon, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_track_event_time ON event_tracks(event_id, valid_time);
CREATE INDEX idx_track_valid_time ON event_tracks(valid_time);

-- Risk Scores Table
CREATE TABLE risk_scores (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL REFERENCES weather_events(event_id),
    timestep INTEGER,
    valid_time TIMESTAMP NOT NULL,
    risk_score FLOAT,
    risk_level VARCHAR(20),
    intensity_component FLOAT,
    spatial_extent_component FLOAT,
    persistence_component FLOAT,
    growth_rate_component FLOAT,
    confidence_component FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_risk_event_time ON risk_scores(event_id, valid_time);

-- Model Predictions Table
CREATE TABLE model_predictions (
    id SERIAL PRIMARY KEY,
    forecast_id INTEGER REFERENCES forecast_data(id),
    anomaly_id INTEGER REFERENCES anomalies(id),
    model_version VARCHAR(50),
    predicted_severity VARCHAR(20),
    predicted_probability FLOAT,
    shap_base_value FLOAT,
    shap_feature_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts Table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(50) UNIQUE,
    event_id VARCHAR(50) NOT NULL REFERENCES weather_events(event_id),
    severity VARCHAR(20),
    title TEXT,
    message TEXT,
    affected_districts TEXT[],
    expected_lead_time_hours INTEGER,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP
);
CREATE INDEX idx_alert_event ON alerts(event_id);
CREATE INDEX idx_alert_severity ON alerts(severity);

-- Administrative Boundaries (Districts/States)
CREATE TABLE administrative_boundaries (
    id SERIAL PRIMARY KEY,
    state_name VARCHAR(100),
    district_name VARCHAR(100),
    state_code VARCHAR(5),
    district_code VARCHAR(5),
    geometry GEOMETRY(MultiPolygon, 4326),
    UNIQUE(state_code, district_code)
);
CREATE INDEX idx_admin_geom ON administrative_boundaries USING GIST(geometry);

-- System Status Table
CREATE TABLE system_status (
    id SERIAL PRIMARY KEY,
    component VARCHAR(100),
    status VARCHAR(20),
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_successful_run TIMESTAMP,
    error_message TEXT
);
