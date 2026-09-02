"""
Multi-Dimensional Risk Scoring Engine
Calculates weighted composite risk index and confidence estimates.
"""
from typing import Dict, Any, Tuple

class RiskScorer:
    """Computes weighted multi-parameter composite risk scores and confidence estimates."""

    def __init__(
        self,
        weights: Dict[str, float] = None
    ):
        self.weights = weights or {
            "temperature_anomaly": 0.20,
            "rainfall_anomaly": 0.30,
            "wind_anomaly": 0.20,
            "pressure_anomaly": 0.15,
            "persistence": 0.10,
            "spatial_extent": 0.05,
        }

    def compute_risk(
        self,
        temp_diff: float,
        rain_pct: float,
        wind_pct: float,
        pressure_diff: float,
        persistence_days: float,
        area_km2: float
    ) -> Tuple[float, str, float]:
        temp_norm = min(1.0, abs(temp_diff) / 8.0)
        rain_norm = min(1.0, max(0.0, rain_pct) / 300.0) if rain_pct > 0 else min(1.0, abs(rain_pct) / 100.0) * 0.5
        wind_norm = min(1.0, max(0.0, wind_pct) / 150.0)
        press_norm = min(1.0, max(0.0, -pressure_diff) / 25.0)
        pers_norm = min(1.0, persistence_days / 5.0)
        extent_norm = min(1.0, area_km2 / 40000.0)

        weighted_score = (
            (temp_norm * self.weights["temperature_anomaly"]) +
            (rain_norm * self.weights["rainfall_anomaly"]) +
            (wind_norm * self.weights["wind_anomaly"]) +
            (press_norm * self.weights["pressure_anomaly"]) +
            (pers_norm * self.weights["persistence"]) +
            (extent_norm * self.weights["spatial_extent"])
        )

        risk_score = round(max(0.0, min(100.0, weighted_score * 100.0)), 1)

        severity = "LOW"
        if risk_score >= 80.0:
            severity = "SEVERE"
        elif risk_score >= 65.0:
            severity = "HIGH"
        elif risk_score >= 50.0:
            severity = "ELEVATED"
        elif risk_score >= 35.0:
            severity = "MODERATE"

        active_signals = sum([
            1 if abs(temp_diff) > 2.0 else 0,
            1 if abs(rain_pct) > 50.0 else 0,
            1 if wind_pct > 40.0 else 0,
            1 if abs(pressure_diff) > 5.0 else 0,
            1 if persistence_days >= 1.0 else 0,
        ])
        confidence = round(min(96.0, max(50.0, 65.0 + (active_signals * 6.0))), 1)

        return risk_score, severity, confidence
