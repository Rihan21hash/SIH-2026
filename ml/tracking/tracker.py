"""
Spatio-Temporal Tracking Engine
Calculates spatial displacement trajectories and intensity progression curves across forecast timesteps.
"""
from typing import List, Dict, Tuple, Optional, Any

class SpatioTemporalTracker:
    """Predicts spatial movement trajectory and intensity progression."""

    DIR_VECTORS: Dict[str, Tuple[float, float]] = {
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

    TIMESTEPS = [
        ("T0", 0),
        ("T+12h", 12),
        ("T+24h", 24),
        ("T+36h", 36),
        ("T+48h", 48),
        ("T+72h", 72)
    ]

    def project_trajectory(
        self,
        base_lat: float,
        base_lon: float,
        initial_risk: float,
        initial_area_km2: float,
        movement_direction: Optional[str] = "N",
        movement_speed_kmh: Optional[float] = 10.0
    ) -> List[Dict[str, Any]]:
        dx_base, dy_base = self.DIR_VECTORS.get(movement_direction or "N", (0.0, 0.0))
        speed_factor = (movement_speed_kmh or 10.0) / 15.0
        trajectory = []

        for label, offset_hours in self.TIMESTEPS:
            if offset_hours <= 36:
                intensity_mod = 1.0 + (offset_hours / 36.0) * 0.18
            else:
                intensity_mod = 1.18 - ((offset_hours - 36) / 36.0) * 0.35

            step_risk = round(max(10.0, min(100.0, initial_risk * intensity_mod)), 1)
            step_lat = round(base_lat + (dy_base * (offset_hours / 12.0) * speed_factor), 3)
            step_lon = round(base_lon + (dx_base * (offset_hours / 12.0) * speed_factor), 3)
            growth_multiplier = 1.0 + (offset_hours * 0.006)
            step_area = round(initial_area_km2 * growth_multiplier, 0)

            trajectory.append({
                "timestep": label,
                "offset_hours": offset_hours,
                "lat": step_lat,
                "lon": step_lon,
                "risk_score": step_risk,
                "affected_area_km2": step_area
            })

        return trajectory
