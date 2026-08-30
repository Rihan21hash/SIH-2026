# AeroWatch — Database Schema Documentation

AeroWatch uses PostgreSQL 15+ with the PostGIS spatial extension.

## Entity Relationship Overview

```mermaid
erDiagram
    WEATHER_OBSERVATIONS {
        int id PK
        int grid_id
        float latitude
        float longitude
        timestamp timestamp
        float temperature
        float rainfall
        float humidity
        float pressure
        float wind_speed
    }
    FORECAST_DATA {
        int id PK
        int grid_id
        timestamp forecast_issued_at
        timestamp valid_time
        int lead_time_hours
    }
    HISTORICAL_BASELINES {
        int id PK
        int grid_id
        string variable
        int month
        float mean
        float std_dev
        float p99
    }
    WEATHER_EVENTS {
        string event_id PK
        string hazard_type
        timestamp first_detected_time
        float centroid_lat
        float centroid_lon
        float affected_area_km2
        string status
    }
    EVENT_TRACKS {
        int id PK
        string event_id FK
        int timestep
        timestamp valid_time
        float intensity
        float area_km2
    }
    RISK_SCORES {
        int id PK
        string event_id FK
        int timestep
        float risk_score
        string risk_level
    }
    ALERTS {
        string alert_id PK
        string event_id FK
        string severity
        string title
        boolean acknowledged
    }

    WEATHER_EVENTS ||--o{ EVENT_TRACKS : tracks
    WEATHER_EVENTS ||--o{ RISK_SCORES : scores
    WEATHER_EVENTS ||--o{ ALERTS : triggers
```

## Table Specifications

1. **`weather_observations`**: Historical point observations (IMD, ERA5).
2. **`forecast_data`**: Multi-horizon numerical weather predictions (NOAA GFS, ECMWF).
3. **`historical_baselines`**: Climatological normal means, percentiles, standard deviations per grid and calendar month.
4. **`anomalies`**: Detected spatial anomalies with Z-scores and percentile ranks.
5. **`weather_events`**: Persistent weather events created via connected component clustering.
6. **`event_tracks`**: Temporal tracking states for events across 120-hour forecast horizons.
7. **`risk_scores`**: Composite risk index (0-100) and decomposed sub-indices.
8. **`model_predictions`**: XGBoost prediction results and SHAP attribution payloads.
9. **`alerts`**: Operational operator alerts with acknowledgment workflows.
10. **`administrative_boundaries`**: Administrative districts and states geometry.
11. **`system_status`**: Pipeline health telemetry.
