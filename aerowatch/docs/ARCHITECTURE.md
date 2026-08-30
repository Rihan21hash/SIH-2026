# AeroWatch — System Architecture

AeroWatch is an end-to-end Operational Weather Intelligence Command & Control system designed for disaster management authorities, municipal emergency teams, and infrastructure operators.

## High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Data Sources
        ERA5[ERA5 Reanalysis]
        GFS[NOAA GFS 0.25°]
        IMD[IMD Station Observations]
    end

    subgraph Data Pipeline & Baseline Engine
        INGEST[Ingestion Service]
        BASE[Historical Baseline Computation]
        ANOM[Hybrid Anomaly Detection<br/>Z-Score + Percentile]
    end

    subgraph AI/ML Intelligence Core
        TRACK[Spatial Connected Components & Tracking]
        XGB[XGBoost Severity Classifier]
        SHAP[SHAP Attribution Engine]
        RISK[Composite Risk Scoring Engine]
    end

    subgraph Data Storage & Cache
        PG[(PostgreSQL + PostGIS)]
        REDIS[(Redis Cache)]
    end

    subgraph C2 Web Command Center
        API[FastAPI Backend]
        NEXT[Next.js 14 Frontend<br/>Military C2 Dark Aesthetic]
        MAP[MapLibre GL Geospatial Map]
        XAI[SHAP Explainability View]
    end

    ERA5 & GFS & IMD --> INGEST
    INGEST --> BASE
    BASE --> ANOM
    ANOM --> TRACK
    TRACK --> XGB
    XGB --> SHAP & RISK
    XGB & SHAP & RISK --> PG & REDIS
    PG & REDIS --> API
    API --> NEXT
    NEXT --> MAP & XAI
```

## Architectural Tenets

1. **Deterministic Hazard Association**: Spatial connected components identify contiguous anomaly masks while haversine-distance IoU trackers link phenomena sequentially across forecast horizons.
2. **Preventing Temporal Data Leakage**: All ML training and cross-validation strictly employ temporal splits and expanding window rolling splits.
3. **Explainable AI (XAI)**: Predictions are backed by local SHAP attributions highlighting meteorological drivers.
4. **Resilient Demo Mode**: Automatic fallback ensures operational command center displays remain responsive during network isolation.
