"""
Forecast & Status API Routes
Provides operational command center telemetry, KPI aggregates, and medium-range forecast summaries.
"""
from fastapi import APIRouter, Query
from datetime import datetime, timezone
from typing import Optional
from backend.models.schemas import SystemStatus, ApiResponse
from backend.services.open_meteo import fetch_grid_weather
from backend.services.anomaly import process_anomalies
from backend.services.events import generate_events_from_anomalies
from backend.services.demo import get_demo_events_raw

router = APIRouter(tags=["Forecast & Status"])


@router.get("/api/status", response_model=SystemStatus)
async def get_system_status(mode: Optional[str] = Query(None)):
    """
    Returns real-time operational status metrics for the command center HUD.
    """
    now = datetime.now(timezone.utc)
    utc_hour = now.hour
    cycle_hour = (utc_hour // 6) * 6
    cycle_str = f"{cycle_hour:02d}Z"

    if mode == "DEMO":
        demo_events = get_demo_events_raw()
        high_risk = sum(1 for e in demo_events if e.get("risk_score", 0) >= 60.0)
        severe = sum(1 for e in demo_events if e.get("severity") == "SEVERE")
        all_districts = set()
        for e in demo_events:
            all_districts.update(e.get("affected_districts", []))
        max_risk = max((e.get("risk_score", 0) for e in demo_events), default=87.0)

        return SystemStatus(
            system_online=True,
            data_mode="DEMO",
            forecast_cycle="06Z",
            last_updated=now,
            active_event_count=len(demo_events),
            high_risk_count=high_risk,
            severe_count=severe,
            affected_districts_count=len(all_districts),
            max_risk_score=round(max_risk, 1),
            forecast_lead_hours=72
        )

    try:
        readings = await fetch_grid_weather()
        anomalies = process_anomalies(readings)
        events = generate_events_from_anomalies(anomalies, readings)

        if not events:
            demo_events = get_demo_events_raw()
            high_risk = sum(1 for e in demo_events if e.get("risk_score", 0) >= 60.0)
            severe = sum(1 for e in demo_events if e.get("severity") == "SEVERE")
            all_districts = set()
            for e in demo_events:
                all_districts.update(e.get("affected_districts", []))
            max_risk = max((e.get("risk_score", 0) for e in demo_events), default=87.0)

            return SystemStatus(
                system_online=True,
                data_mode="DEMO",
                forecast_cycle=cycle_str,
                last_updated=now,
                active_event_count=len(demo_events),
                high_risk_count=high_risk,
                severe_count=severe,
                affected_districts_count=len(all_districts),
                max_risk_score=round(max_risk, 1),
                forecast_lead_hours=72
            )

        high_risk = sum(1 for e in events if e.risk_score >= 60.0)
        severe = sum(1 for e in events if e.severity == "SEVERE")
        all_districts = set()
        for e in events:
            all_districts.update(e.affected_districts)
        
        max_risk = max((e.risk_score for e in events), default=0.0)

        return SystemStatus(
            system_online=True,
            data_mode="LIVE",
            forecast_cycle=cycle_str,
            last_updated=now,
            active_event_count=len(events),
            high_risk_count=high_risk,
            severe_count=severe,
            affected_districts_count=len(all_districts),
            max_risk_score=round(max_risk, 1),
            forecast_lead_hours=72
        )
    except Exception:
        demo_events = get_demo_events_raw()
        return SystemStatus(
            system_online=True,
            data_mode="DEMO",
            forecast_cycle=cycle_str,
            last_updated=now,
            active_event_count=len(demo_events),
            high_risk_count=2,
            severe_count=1,
            affected_districts_count=15,
            max_risk_score=87.0,
            forecast_lead_hours=72
        )


@router.get("/api/forecast", response_model=ApiResponse)
async def get_forecast_summary():
    """
    Retrieves summary of medium-range forecast grid readings.
    """
    now = datetime.now(timezone.utc)
    try:
        readings = await fetch_grid_weather()
        return ApiResponse(
            success=True,
            mode="LIVE",
            timestamp=now,
            data=[r.model_dump(mode="json") for r in readings]
        )
    except Exception:
        readings = await fetch_grid_weather()
        return ApiResponse(
            success=True,
            mode="DEMO",
            timestamp=now,
            data=[r.model_dump(mode="json") for r in readings]
        )
