"""
Spatio-Temporal Tracking Engine
Tracks extreme weather phenomena across multi-step medium-range forecasts
(T0, T+12h, T+24h, T+36h, T+48h, T+72h) modeling spatial trajectory, intensification,
and decay.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from backend.models.schemas import EventTimestep, SeverityLevel, EventType
from backend.config import SEVERITY_CONFIG


def generate_spatio_temporal_track(
    hazard_type: EventType,
    base_lat: float,
    base_lon: float,
    initial_risk: float,
    initial_area_km2: float,
    movement_direction: Optional[str] = None,
    movement_speed_kmh: Optional[float] = None
) -> List[EventTimestep]:
    """
    Computes deterministic spatial displacement and intensity curve across timesteps.
    Treats the event as a continuous moving spatial field rather than disconnected points.
    """
    timesteps_def = [
        ("T0", 0),
        ("T+12h", 12),
        ("T+24h", 24),
        ("T+36h", 36),
        ("T+48h", 48),
        ("T+72h", 72)
    ]

    # Direction vectors (dx, dy in approximate degrees per 12h)
    dir_vectors: Dict[str, Tuple[float, float]] = {
        "N":   (0.0, 0.25),
        "NNE": (0.12, 0.23),
        "NE":  (0.20, 0.20),
        "ENE": (0.23, 0.12),
        "E":   (0.25, 0.0),
        "ESE": (0.23, -0.12),
        "SE":  (0.20, -0.20),
        "SSE": (0.12, -0.23),
        "S":   (0.0, -0.25),
        "SSW": (-0.12, -0.23),
        "SW":  (-0.20, -0.20),
        "WSW": (-0.23, -0.12),
        "W":   (-0.25, 0.0),
        "WNW": (-0.23, 0.12),
        "NW":  (-0.20, 0.20),
        "NNW": (-0.12, 0.23),
    }

    dx_base, dy_base = dir_vectors.get(movement_direction or "N", (0.0, 0.0))
    speed_factor = (movement_speed_kmh or 10.0) / 15.0

    timeline: List[EventTimestep] = []

    for i, (label, offset_hours) in enumerate(timesteps_def):
        # Time progression factor (intensity peaking around 24-36h before landfall/dissipation)
        if offset_hours <= 36:
            intensity_mod = 1.0 + (offset_hours / 36.0) * 0.18
        else:
            intensity_mod = 1.18 - ((offset_hours - 36) / 36.0) * 0.35

        step_risk = round(max(10.0, min(100.0, initial_risk * intensity_mod)), 1)
        
        # Severity evaluation
        step_sev: SeverityLevel = "LOW"
        if step_risk >= SEVERITY_CONFIG.severe:
            step_sev = "SEVERE"
        elif step_risk >= SEVERITY_CONFIG.high:
            step_sev = "HIGH"
        elif step_risk >= SEVERITY_CONFIG.elevated:
            step_sev = "ELEVATED"
        elif step_risk >= SEVERITY_CONFIG.moderate:
            step_sev = "MODERATE"

        # Coordinates evolution
        step_lat = round(base_lat + (dy_base * (offset_hours / 12.0) * speed_factor), 3)
        step_lon = round(base_lon + (dx_base * (offset_hours / 12.0) * speed_factor), 3)

        # Spatial extent evolution
        growth_multiplier = 1.0 + (offset_hours * 0.006)
        step_area = round(initial_area_km2 * growth_multiplier, 0)

        timeline.append(EventTimestep(
            timestep=label,
            offset_hours=offset_hours,
            lat=step_lat,
            lon=step_lon,
            risk_score=step_risk,
            severity=step_sev,
            intensity_value=round(step_risk * 0.85, 1),
            affected_area_km2=step_area
        ))

    return timeline
