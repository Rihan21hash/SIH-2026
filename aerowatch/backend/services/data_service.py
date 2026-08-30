"""
Demo Data Service — Generates realistic weather event data for MVP demonstration.

This service provides all data when DEMO_MODE=true, eliminating the need
for a running PostgreSQL instance or live weather APIs.
"""

import random
import math
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from backend.utils.constants import (
    HAZARD_TYPES,
    DISTRICTS_BY_STATE,
    SEVERITY_COLORS,
    RISK_WEIGHTS,
)


# Seed for reproducibility in demos
random.seed(42)

# Base timestamp for demo data (current time minus 2 days for history)
_BASE_TIME = datetime(2026, 8, 28, 0, 0, 0)


def _generate_event_id(index: int) -> str:
    return f"AW-{index:03d}"


def _random_indian_location() -> dict:
    """Generate random location within India."""
    locations = [
        {"lat": 19.076, "lon": 72.877, "state": "Maharashtra", "districts": ["Mumbai", "Thane"]},
        {"lat": 18.520, "lon": 73.856, "state": "Maharashtra", "districts": ["Pune", "Satara"]},
        {"lat": 20.005, "lon": 73.790, "state": "Maharashtra", "districts": ["Nashik"]},
        {"lat": 23.022, "lon": 72.571, "state": "Gujarat", "districts": ["Ahmedabad", "Gandhinagar"]},
        {"lat": 21.170, "lon": 72.831, "state": "Gujarat", "districts": ["Surat", "Bharuch"]},
        {"lat": 12.971, "lon": 77.594, "state": "Karnataka", "districts": ["Bengaluru"]},
        {"lat": 12.870, "lon": 74.880, "state": "Karnataka", "districts": ["Mangaluru", "Dakshina Kannada"]},
        {"lat": 13.082, "lon": 80.270, "state": "Tamil Nadu", "districts": ["Chennai"]},
        {"lat": 9.931, "lon": 76.267, "state": "Kerala", "districts": ["Kochi", "Ernakulam"]},
        {"lat": 11.250, "lon": 75.770, "state": "Kerala", "districts": ["Kozhikode", "Wayanad"]},
        {"lat": 8.524, "lon": 76.936, "state": "Kerala", "districts": ["Thiruvananthapuram"]},
        {"lat": 20.296, "lon": 85.824, "state": "Odisha", "districts": ["Bhubaneswar", "Cuttack"]},
        {"lat": 22.572, "lon": 88.363, "state": "West Bengal", "districts": ["Kolkata", "Howrah"]},
        {"lat": 26.912, "lon": 75.787, "state": "Rajasthan", "districts": ["Jaipur"]},
        {"lat": 26.449, "lon": 80.331, "state": "Uttar Pradesh", "districts": ["Kanpur"]},
        {"lat": 25.317, "lon": 82.987, "state": "Uttar Pradesh", "districts": ["Varanasi"]},
        {"lat": 17.385, "lon": 78.486, "state": "Telangana", "districts": ["Hyderabad", "Ranga Reddy"]},
        {"lat": 15.300, "lon": 74.000, "state": "Goa", "districts": ["North Goa", "South Goa"]},
    ]
    return random.choice(locations)


def generate_demo_events() -> List[Dict[str, Any]]:
    """Generate 12 realistic demo weather events across India."""
    events = []

    event_configs = [
        {
            "hazard_type": "extreme_rainfall",
            "location": {"lat": 19.076, "lon": 72.877, "state": "Maharashtra", "districts": ["Mumbai", "Thane", "Palghar"]},
            "area": 18500,
            "risk_score": 94,
            "confidence": 91,
            "severity": "EXTREME",
            "status": "ACTIVE",
            "intensity": 92,
            "persistence_days": 4,
            "lead_time": 6,
        },
        {
            "hazard_type": "extreme_rainfall",
            "location": {"lat": 18.520, "lon": 73.856, "state": "Maharashtra", "districts": ["Pune", "Satara", "Kolhapur"]},
            "area": 12400,
            "risk_score": 82,
            "confidence": 88,
            "severity": "SEVERE",
            "status": "ACTIVE",
            "intensity": 78,
            "persistence_days": 3,
            "lead_time": 12,
        },
        {
            "hazard_type": "extreme_rainfall",
            "location": {"lat": 9.931, "lon": 76.267, "state": "Kerala", "districts": ["Kochi", "Ernakulam", "Idukki", "Thrissur"]},
            "area": 22100,
            "risk_score": 89,
            "confidence": 85,
            "severity": "EXTREME",
            "status": "ACTIVE",
            "intensity": 88,
            "persistence_days": 5,
            "lead_time": 4,
        },
        {
            "hazard_type": "heatwave",
            "location": {"lat": 26.912, "lon": 75.787, "state": "Rajasthan", "districts": ["Jaipur", "Jodhpur", "Bikaner"]},
            "area": 45000,
            "risk_score": 71,
            "confidence": 92,
            "severity": "SEVERE",
            "status": "ACTIVE",
            "intensity": 74,
            "persistence_days": 7,
            "lead_time": 24,
        },
        {
            "hazard_type": "heatwave",
            "location": {"lat": 25.317, "lon": 82.987, "state": "Uttar Pradesh", "districts": ["Varanasi", "Allahabad", "Lucknow"]},
            "area": 38000,
            "risk_score": 65,
            "confidence": 89,
            "severity": "HIGH",
            "status": "ACTIVE",
            "intensity": 68,
            "persistence_days": 5,
            "lead_time": 36,
        },
        {
            "hazard_type": "extreme_wind",
            "location": {"lat": 15.300, "lon": 74.000, "state": "Goa", "districts": ["North Goa", "South Goa"]},
            "area": 5200,
            "risk_score": 58,
            "confidence": 76,
            "severity": "WARNING",
            "status": "ACTIVE",
            "intensity": 62,
            "persistence_days": 2,
            "lead_time": 18,
        },
        {
            "hazard_type": "extreme_rainfall",
            "location": {"lat": 12.870, "lon": 74.880, "state": "Karnataka", "districts": ["Mangaluru", "Dakshina Kannada", "Udupi"]},
            "area": 9800,
            "risk_score": 73,
            "confidence": 82,
            "severity": "SEVERE",
            "status": "ACTIVE",
            "intensity": 71,
            "persistence_days": 3,
            "lead_time": 8,
        },
        {
            "hazard_type": "extreme_rainfall",
            "location": {"lat": 20.296, "lon": 85.824, "state": "Odisha", "districts": ["Bhubaneswar", "Cuttack", "Puri"]},
            "area": 15600,
            "risk_score": 67,
            "confidence": 79,
            "severity": "HIGH",
            "status": "ACTIVE",
            "intensity": 65,
            "persistence_days": 2,
            "lead_time": 14,
        },
        {
            "hazard_type": "extreme_wind",
            "location": {"lat": 22.572, "lon": 88.363, "state": "West Bengal", "districts": ["Kolkata", "Howrah", "South 24 Parganas"]},
            "area": 8400,
            "risk_score": 52,
            "confidence": 71,
            "severity": "WARNING",
            "status": "ACTIVE",
            "intensity": 55,
            "persistence_days": 1,
            "lead_time": 20,
        },
        {
            "hazard_type": "extreme_rainfall",
            "location": {"lat": 11.250, "lon": 75.770, "state": "Kerala", "districts": ["Kozhikode", "Wayanad", "Malappuram"]},
            "area": 11200,
            "risk_score": 78,
            "confidence": 84,
            "severity": "SEVERE",
            "status": "ACTIVE",
            "intensity": 76,
            "persistence_days": 4,
            "lead_time": 6,
        },
        {
            "hazard_type": "heatwave",
            "location": {"lat": 17.385, "lon": 78.486, "state": "Telangana", "districts": ["Hyderabad", "Ranga Reddy", "Medchal"]},
            "area": 28000,
            "risk_score": 45,
            "confidence": 87,
            "severity": "WARNING",
            "status": "DECLINING",
            "intensity": 48,
            "persistence_days": 3,
            "lead_time": 48,
        },
        {
            "hazard_type": "extreme_rainfall",
            "location": {"lat": 21.170, "lon": 72.831, "state": "Gujarat", "districts": ["Surat", "Bharuch", "Navsari"]},
            "area": 7600,
            "risk_score": 61,
            "confidence": 77,
            "severity": "HIGH",
            "status": "ACTIVE",
            "intensity": 59,
            "persistence_days": 2,
            "lead_time": 10,
        },
    ]

    for i, cfg in enumerate(event_configs):
        event_id = _generate_event_id(i + 1)
        loc = cfg["location"]
        detected = _BASE_TIME - timedelta(days=cfg["persistence_days"])

        events.append({
            "id": i + 1,
            "event_id": event_id,
            "hazard_type": cfg["hazard_type"],
            "first_detected_time": detected.isoformat(),
            "last_updated_time": _BASE_TIME.isoformat(),
            "centroid_lat": loc["lat"],
            "centroid_lon": loc["lon"],
            "affected_area_km2": cfg["area"],
            "affected_districts": loc["districts"],
            "affected_states": [loc["state"]],
            "status": cfg["status"],
            "risk_score": cfg["risk_score"],
            "confidence": cfg["confidence"],
            "severity": cfg["severity"],
            "intensity": cfg["intensity"],
            "persistence_days": cfg["persistence_days"],
            "lead_time_hours": cfg["lead_time"],
            "area_km2": cfg["area"],
            "created_at": detected.isoformat(),
        })

    return events


def generate_demo_event_timeline(event_id: str) -> List[Dict[str, Any]]:
    """Generate 120 hours of temporal evolution for an event."""
    events = generate_demo_events()
    event = next((e for e in events if e["event_id"] == event_id), None)
    if not event:
        return []

    timeline = []
    base_intensity = event["intensity"]
    base_area = event["area_km2"]
    base_lat = event["centroid_lat"]
    base_lon = event["centroid_lon"]

    for t in range(120):  # 120 hourly timesteps (5 days)
        # Simulate intensity evolution (rises, peaks, declines)
        phase = t / 120.0
        if phase < 0.3:
            # Rising
            intensity = base_intensity * (0.4 + phase * 2.0)
        elif phase < 0.7:
            # Peak
            intensity = base_intensity * (0.9 + 0.1 * math.sin(phase * 10))
        else:
            # Declining
            intensity = base_intensity * (1.0 - (phase - 0.7) * 2.0)
        intensity = max(5, min(100, intensity))

        # Area grows then shrinks
        area_factor = 1.0 + 0.3 * math.sin(phase * math.pi)
        area = base_area * area_factor

        # Slow movement
        lat = base_lat + t * 0.005 * random.uniform(-1, 1)
        lon = base_lon + t * 0.008 * random.uniform(0.5, 1.5)

        # Growth rate
        if t > 0:
            prev_area = timeline[-1]["area_km2"]
            growth_rate = (area - prev_area) / prev_area if prev_area > 0 else 0
        else:
            growth_rate = 0

        severity = _classify_severity(intensity)
        valid_time = _BASE_TIME + timedelta(hours=t)

        timeline.append({
            "event_id": event_id,
            "timestep": t,
            "valid_time": valid_time.isoformat(),
            "centroid_lat": round(lat, 3),
            "centroid_lon": round(lon, 3),
            "area_km2": round(area, 1),
            "intensity": round(intensity, 1),
            "severity": severity,
            "movement_vector_lat": round(random.uniform(-0.01, 0.01), 4),
            "movement_vector_lon": round(random.uniform(0.005, 0.02), 4),
            "growth_rate": round(growth_rate, 4),
            "persistence_days": event["persistence_days"] + t // 24,
        })

    return timeline


def generate_demo_event_drivers(event_id: str) -> Dict[str, Any]:
    """Generate SHAP-based feature importance for an event."""
    events = generate_demo_events()
    event = next((e for e in events if e["event_id"] == event_id), None)
    if not event:
        return {"event_id": event_id, "drivers": {}, "model_version": "v1.0"}

    hazard = event["hazard_type"]

    if hazard == "extreme_rainfall":
        drivers = {
            "rainfall_anomaly_pct": {"value": round(random.uniform(120, 300), 1), "unit": "%", "contribution": 0.32},
            "pressure_anomaly_hpa": {"value": round(random.uniform(-25, -8), 1), "unit": "hPa", "contribution": 0.21},
            "humidity_pct": {"value": round(random.uniform(85, 98), 1), "unit": "%", "contribution": 0.18},
            "persistence_days": {"value": event["persistence_days"], "unit": "days", "contribution": 0.14},
            "spatial_growth_rate": {"value": round(random.uniform(0.1, 0.6), 2), "unit": "ratio", "contribution": 0.10},
            "wind_convergence": {"value": round(random.uniform(2, 8), 1), "unit": "m/s", "contribution": 0.05},
        }
    elif hazard == "heatwave":
        drivers = {
            "temperature_anomaly_c": {"value": round(random.uniform(4, 10), 1), "unit": "°C", "contribution": 0.35},
            "consecutive_hot_days": {"value": random.randint(3, 8), "unit": "days", "contribution": 0.22},
            "humidity_deficit": {"value": round(random.uniform(-30, -10), 1), "unit": "%", "contribution": 0.15},
            "solar_radiation": {"value": round(random.uniform(250, 350), 0), "unit": "W/m²", "contribution": 0.12},
            "soil_moisture_deficit": {"value": round(random.uniform(-40, -15), 1), "unit": "%", "contribution": 0.09},
            "urban_heat_island": {"value": round(random.uniform(1.5, 4.0), 1), "unit": "°C", "contribution": 0.07},
        }
    else:  # extreme_wind
        drivers = {
            "wind_speed_anomaly": {"value": round(random.uniform(15, 40), 1), "unit": "km/h", "contribution": 0.30},
            "pressure_gradient": {"value": round(random.uniform(3, 12), 1), "unit": "hPa/100km", "contribution": 0.25},
            "convective_instability": {"value": round(random.uniform(1500, 3500), 0), "unit": "J/kg", "contribution": 0.18},
            "wind_shear": {"value": round(random.uniform(10, 25), 1), "unit": "m/s", "contribution": 0.12},
            "frontal_activity": {"value": round(random.uniform(0.6, 1.0), 2), "unit": "index", "contribution": 0.10},
            "terrain_effect": {"value": round(random.uniform(1.1, 2.0), 2), "unit": "factor", "contribution": 0.05},
        }

    return {
        "event_id": event_id,
        "drivers": drivers,
        "model_version": "XGBoost v1.2.0",
    }


def generate_demo_affected_regions(event_id: str) -> Dict[str, Any]:
    """Generate affected regions for an event."""
    events = generate_demo_events()
    event = next((e for e in events if e["event_id"] == event_id), None)
    if not event:
        return {"districts": [], "states": [], "total_population_at_risk": 0}

    districts = []
    for d in event["affected_districts"]:
        districts.append({
            "name": d,
            "state": event["affected_states"][0],
            "exposure_score": round(random.uniform(0.4, 0.95), 2),
        })

    # Sort by exposure
    districts.sort(key=lambda x: x["exposure_score"], reverse=True)

    population = random.randint(500000, 8000000)

    return {
        "districts": districts,
        "states": event["affected_states"],
        "total_population_at_risk": population,
    }


def generate_demo_risk_summary() -> Dict[str, Any]:
    """Generate overall risk summary."""
    events = generate_demo_events()
    active = [e for e in events if e["status"] == "ACTIVE"]
    high_risk = [e for e in active if e["risk_score"] > 60]
    severe = [e for e in active if e["severity"] in ("SEVERE", "EXTREME")]

    max_event = max(events, key=lambda e: e["risk_score"])

    return {
        "active_events": len(active),
        "high_risk_events": len(high_risk),
        "severe_events": len(severe),
        "max_risk_score": max_event["risk_score"],
        "max_risk_event": max_event["event_id"],
        "forecast_horizon_hours": 120,
    }


def generate_demo_risk_timeline(event_id: str) -> List[Dict[str, Any]]:
    """Generate risk score evolution over time."""
    events = generate_demo_events()
    event = next((e for e in events if e["event_id"] == event_id), None)
    if not event:
        return []

    timeline = []
    base_risk = event["risk_score"]

    for t in range(120):
        phase = t / 120.0
        # Risk evolution pattern
        if phase < 0.2:
            risk = base_risk * (0.3 + phase * 3.5)
        elif phase < 0.6:
            risk = base_risk * (0.95 + 0.05 * math.sin(phase * 15))
        else:
            risk = base_risk * (1.0 - (phase - 0.6) * 1.5)
        risk = max(0, min(100, risk))

        risk_level = _classify_risk(risk)
        valid_time = _BASE_TIME + timedelta(hours=t)

        timeline.append({
            "timestep": t,
            "valid_time": valid_time.isoformat(),
            "risk_score": round(risk, 1),
            "risk_level": risk_level,
        })

    return timeline


def generate_demo_alerts() -> List[Dict[str, Any]]:
    """Generate demo alerts based on events."""
    events = generate_demo_events()
    alerts = []

    alert_templates = {
        "extreme_rainfall": {
            "title_prefix": "Heavy Rainfall Alert",
            "message_template": "Extreme rainfall expected in {districts}. Forecast indicates {intensity}% above normal precipitation. Exercise extreme caution.",
        },
        "heatwave": {
            "title_prefix": "Heatwave Warning",
            "message_template": "Severe heatwave conditions developing in {districts}. Temperatures expected {intensity}% above seasonal average. Stay hydrated and avoid outdoor exposure.",
        },
        "extreme_wind": {
            "title_prefix": "High Wind Advisory",
            "message_template": "Strong winds forecasted for {districts}. Wind speeds may reach dangerous levels. Secure loose objects and avoid travel if possible.",
        },
    }

    for i, event in enumerate(events):
        if event["risk_score"] < 50:
            continue

        template = alert_templates.get(event["hazard_type"], alert_templates["extreme_rainfall"])
        districts_str = ", ".join(event["affected_districts"][:3])

        issued = datetime.fromisoformat(event["last_updated_time"]) - timedelta(hours=random.randint(1, 6))
        expires = issued + timedelta(hours=event["lead_time_hours"] + 24)

        alerts.append({
            "id": i + 1,
            "alert_id": f"ALT-{i + 1:03d}",
            "event_id": event["event_id"],
            "severity": event["severity"],
            "title": f"{template['title_prefix']} — {event['affected_states'][0]}",
            "message": template["message_template"].format(
                districts=districts_str,
                intensity=round(event["intensity"]),
            ),
            "affected_districts": event["affected_districts"],
            "expected_lead_time_hours": event["lead_time_hours"],
            "issued_at": issued.isoformat(),
            "expires_at": expires.isoformat(),
            "acknowledged": random.choice([True, False, False]),
            "acknowledged_by": "operator_1" if random.random() > 0.7 else None,
            "acknowledged_at": None,
        })

    return alerts


def generate_demo_anomaly_grid(
    valid_time_offset: int = 0,
    variable: str = "rainfall"
) -> Dict[str, Any]:
    """Generate anomaly grid data for map visualization."""
    grid_points = []
    # Generate a grid over India
    for lat in range(6, 37, 1):
        for lon in range(68, 98, 1):
            # Base anomaly score — mostly low
            score = random.uniform(0, 15)

            # Add hotspots near active event locations
            event_locs = [
                (19.076, 72.877, 85),  # Mumbai
                (18.520, 73.856, 70),  # Pune
                (9.931, 76.267, 80),   # Kochi
                (26.912, 75.787, 60),  # Jaipur
                (12.870, 74.880, 65),  # Mangaluru
                (20.296, 85.824, 55),  # Bhubaneswar
                (11.250, 75.770, 72),  # Kozhikode
                (21.170, 72.831, 50),  # Surat
            ]

            for elat, elon, peak in event_locs:
                dist = math.sqrt((lat - elat) ** 2 + (lon - elon) ** 2)
                if dist < 3:
                    falloff = max(0, 1 - dist / 3)
                    score += peak * falloff * random.uniform(0.7, 1.0)

            score = min(100, score)

            if score > 10:  # Only include non-trivial anomalies
                grid_points.append({
                    "lat": lat + random.uniform(0, 1),
                    "lon": lon + random.uniform(0, 1),
                    "score": round(score, 1),
                    "severity": _classify_severity(score),
                    "variable": variable,
                })

    return {
        "valid_time": (_BASE_TIME + timedelta(hours=valid_time_offset)).isoformat(),
        "variable": variable,
        "grid_resolution": 1.0,
        "points": grid_points,
    }


def generate_demo_system_status() -> Dict[str, Any]:
    """Generate system health status."""
    return {
        "data_ingestion": "HEALTHY",
        "ml_inference": "HEALTHY",
        "database": "HEALTHY",
        "api": "HEALTHY",
        "last_forecast_update": (_BASE_TIME - timedelta(hours=2)).isoformat(),
        "next_update": (_BASE_TIME + timedelta(hours=4)).isoformat(),
        "demo_mode": True,
        "model_version": "XGBoost v1.2.0",
        "uptime_hours": 168,
    }


def _classify_severity(score: float) -> str:
    if score < 20:
        return "NORMAL"
    elif score < 40:
        return "WATCH"
    elif score < 60:
        return "WARNING"
    elif score < 80:
        return "SEVERE"
    else:
        return "EXTREME"


def _classify_risk(score: float) -> str:
    if score < 20:
        return "LOW"
    elif score < 40:
        return "MODERATE"
    elif score < 60:
        return "HIGH"
    elif score < 80:
        return "SEVERE"
    else:
        return "EXTREME"
