"""
Extreme Event Detection & Aggregation Service
Groups detected meteorological anomalies into coherent extreme weather events,
infers hazard type, computes drivers, and builds spatio-temporal trajectories.
"""
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from backend.models.schemas import (
    WeatherEvent, EventLocation, AnomalyDrivers,
    AnomalyReading, WeatherReading, EventType
)
from backend.services.risk import calculate_risk_score
from backend.services.tracking import generate_spatio_temporal_track


# District mapping for Indian cities/grid centers
STATE_DISTRICTS = {
    "Tamil Nadu": ["Chennai", "Tiruvallur", "Kancheepuram", "Chengalpattu", "Villupuram"],
    "Kerala": ["Ernakulam", "Thrissur", "Idukki", "Palakkad", "Malappuram", "Wayanad"],
    "Rajasthan": ["Jaisalmer", "Barmer", "Bikaner", "Jodhpur", "Nagaur", "Churu"],
    "Uttarakhand": ["Chamoli", "Rudraprayag", "Tehri Garhwal", "Uttarkashi", "Dehradun"],
    "Odisha": ["Puri", "Khordha", "Jagatsinghpur", "Kendrapara", "Cuttack", "Ganjam"],
    "Delhi": ["Central Delhi", "North Delhi", "East Delhi", "South Delhi", "Faridabad", "Gurugram"],
    "Maharashtra": ["Mumbai Suburban", "Mumbai City", "Thane", "Raigad", "Palghar", "Pune"],
    "Gujarat": ["Ahmedabad", "Surat", "Kachchh", "Rajkot", "Bhavnagar"],
    "West Bengal": ["Kolkata", "South 24 Parganas", "North 24 Parganas", "Howrah", "East Medinipur"],
    "Assam": ["Kamrup Metropolitan", "Darrang", "Morigaon", "Nagaon", "Barpeta"],
    "Andhra Pradesh": ["Visakhapatnam", "Anakapalli", "Vizianagaram", "Srikakulam", "Kakinada"],
    "Madhya Pradesh": ["Bhopal", "Sehore", "Raisen", "Rajgarh", "Vidisha"],
    "Bihar": ["Patna", "Vaishali", "Saran", "Muzaffarpur", "Nalanda"]
}


def classify_hazard(anom: AnomalyReading, raw: WeatherReading) -> Optional[EventType]:
    """
    Infers the physical hazard type based on anomalous multi-parameter signature.
    """
    # Cyclone / Deep Depression: High wind, high rain, severe negative pressure drop
    if anom.pressure_anomaly_hpa <= -6.0 and anom.wind_anomaly_pct >= 40.0 and anom.rain_anomaly_pct >= 50.0:
        return "CYCLONE"
    
    # Cloudburst: Extremely high precipitation in hilly regions with moderate pressure drop
    if anom.state in ["Uttarakhand", "Himachal Pradesh", "Jammu and Kashmir"] and anom.rain_anomaly_pct >= 100.0:
        return "CLOUDBURST"

    # Extreme Flood / Inundation: Very high precipitation anomaly
    if anom.rain_anomaly_pct >= 120.0 or raw.precipitation >= 35.0:
        return "FLOOD"

    # Heatwave: High positive temperature anomaly
    if anom.temp_anomaly_c >= 4.0 or raw.temperature_2m >= 42.0:
        return "HEATWAVE"

    # Severe Storm: High wind anomaly and elevated rain
    if anom.wind_anomaly_pct >= 60.0:
        return "STORM"

    # Moderate thermal stress
    if anom.temp_anomaly_c >= 2.5:
        return "HEATWAVE"

    return None


def generate_events_from_anomalies(
    anomalies: List[AnomalyReading],
    readings: List[WeatherReading]
) -> List[WeatherEvent]:
    """
    Transforms detected anomalies into fully-formed WeatherEvent entities.
    """
    events: List[WeatherEvent] = []
    readings_map = {r.location_name: r for r in readings}
    now = datetime.now(timezone.utc)

    # Preset movement dynamics for realistic meteorological simulation
    movement_configs = {
        "Tamil Nadu":  {"dir": "NNW", "speed": 18.0, "area": 18200.0, "duration": 72, "lead": 48},
        "Kerala":      {"dir": "SW",  "speed": 6.0,  "area": 8700.0,  "duration": 96, "lead": 36},
        "Rajasthan":   {"dir": "ENE", "speed": 8.0,  "area": 52000.0, "duration": 120, "lead": 72},
        "Uttarakhand": {"dir": "E",   "speed": 4.0,  "area": 2400.0,  "duration": 24, "lead": 12},
        "Odisha":      {"dir": "WNW", "speed": 22.0, "area": 12500.0, "duration": 48, "lead": 36},
        "Delhi":       {"dir": "E",   "speed": 5.0,  "area": 3200.0,  "duration": 72, "lead": 48},
        "Gujarat":     {"dir": "NE",  "speed": 12.0, "area": 21000.0, "duration": 60, "lead": 48},
        "West Bengal": {"dir": "NNW", "speed": 15.0, "area": 14000.0, "duration": 54, "lead": 36},
    }

    event_idx = 1
    for anom in anomalies:
        raw = readings_map.get(anom.location_name)
        if not raw:
            continue

        hazard = classify_hazard(anom, raw)
        if not hazard:
            continue

        m_cfg = movement_configs.get(anom.state, {"dir": "N", "speed": 10.0, "area": 6000.0, "duration": 48, "lead": 36})

        # Build anomaly drivers
        drivers = AnomalyDrivers(
            rainfall_anomaly_pct=anom.rain_anomaly_pct,
            temperature_anomaly_c=anom.temp_anomaly_c,
            wind_anomaly_pct=anom.wind_anomaly_pct,
            pressure_anomaly_hpa=anom.pressure_anomaly_hpa,
            persistence_days=round(max(0.5, abs(anom.composite_anomaly_score) / 25.0), 1),
            spatial_growth_pct=round(min(50.0, 15.0 + (anom.composite_anomaly_score * 0.3)), 1)
        )

        risk_score, severity, confidence = calculate_risk_score(drivers, m_cfg["area"])

        # Spatio-temporal multi-timestep track
        timeline = generate_spatio_temporal_track(
            hazard_type=hazard,
            base_lat=anom.lat,
            base_lon=anom.lon,
            initial_risk=risk_score,
            initial_area_km2=m_cfg["area"],
            movement_direction=m_cfg["dir"],
            movement_speed_kmh=m_cfg["speed"]
        )

        districts = STATE_DISTRICTS.get(anom.state, [anom.location_name])

        events.append(WeatherEvent(
            event_id=f"AW-2024-{event_idx:03d}",
            hazard_type=hazard,
            severity=severity,
            risk_score=risk_score,
            confidence=confidence,
            start_time=now - timedelta(hours=int(drivers.persistence_days * 24)),
            expected_duration_hours=m_cfg["duration"],
            location=EventLocation(
                lat=anom.lat,
                lon=anom.lon,
                state=anom.state,
                district=districts[0] if districts else anom.location_name,
                region_name=f"{anom.location_name} Region — {anom.state}"
            ),
            affected_districts=districts,
            affected_area_km2=m_cfg["area"],
            movement_direction=m_cfg["dir"],
            movement_speed_kmh=m_cfg["speed"],
            growth_rate_pct=drivers.spatial_growth_pct,
            forecast_lead_hours=m_cfg["lead"],
            anomaly_drivers=drivers,
            timeline=timeline
        ))
        event_idx += 1

    return events
