# AeroWatch — REST API Documentation

AeroWatch exposes a RESTful API built on FastAPI providing endpoints for weather event tracking, anomaly detection, risk assessment, operational alerts, and system health status.

## Base URL
```
http://localhost:8000/api
```

---

## Endpoints

### 1. Events API

#### `GET /api/events/`
Retrieve all active weather events.
- **Query Params**:
  - `hazard_type` (string, optional): `extreme_rainfall`, `heatwave`, `extreme_wind`
  - `severity` (string, optional): `NORMAL`, `WATCH`, `WARNING`, `SEVERE`, `EXTREME`
  - `status` (string, optional): `ACTIVE`, `DECLINING`, `DISSIPATED`
  - `limit` (int, default 100)
  - `offset` (int, default 0)
- **Response**: Array of `EventResponse`

#### `GET /api/events/{event_id}`
Retrieve full details for a specific event.

#### `GET /api/events/{event_id}/timeline`
Retrieve the 120-hour temporal trajectory and evolution for an event.

#### `GET /api/events/{event_id}/drivers`
Retrieve Explainable AI (XAI) feature attributions (SHAP values) justifying the hazard classification.

#### `GET /api/events/{event_id}/affected-regions`
Retrieve list of impacted districts and states with vulnerability exposure ratings.

---

### 2. Risk API

#### `GET /api/risk/summary`
Get high-level summary of active risks across all monitored geographical sectors.
```json
{
  "active_events": 12,
  "high_risk_events": 5,
  "severe_events": 4,
  "max_risk_score": 94,
  "max_risk_event": "AW-001",
  "forecast_horizon_hours": 120
}
```

#### `GET /api/risk/timeline/{event_id}`
Retrieve sequential risk score progression over the 120-hour forecast window.

#### `GET /api/risk/heatmap`
Retrieve raster grid values for 2D spatial heatmap rendering.

---

### 3. Anomalies API

#### `GET /api/anomalies/grid`
Retrieve spatial anomaly grid for specified valid time and variable.

#### `GET /api/anomalies/statistics`
Retrieve aggregate statistical metrics (mean score, severe count) for anomalies.

---

### 4. Alerts API

#### `GET /api/alerts/`
List operational command alerts.
- **Query Params**:
  - `severity` (string, optional)
  - `acknowledged` (boolean, optional)

#### `POST /api/alerts/{alert_id}/acknowledge`
Acknowledge an operational warning.

---

### 5. System API

#### `GET /api/system/status`
Health status of data ingestion, ML pipeline, database, and API services.

#### `POST /api/system/demo-mode`
Toggle between live feeds and demo simulation datasets.
