"""
Risk Scoring Engine — Computes composite multi-factorial risk scores (0-100).
"""

from typing import Tuple, Dict, Any, Optional
from backend.utils.constants import RISK_WEIGHTS, RISK_LEVELS


class RiskScoringEngine:
    """
    Composite risk scoring engine:
    Risk = 0.30 × Intensity + 0.20 × Spatial_Extent + 0.20 × Persistence +
            0.15 × Growth_Rate + 0.15 × Forecast_Confidence
    """

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or RISK_WEIGHTS

    def compute_risk_score(
        self,
        event_track: Dict[str, Any],
        previous_track: Optional[Dict[str, Any]] = None,
        persistence_days: int = 1,
        forecast_confidence: float = 85.0,
    ) -> Tuple[float, str, Dict[str, float]]:
        """
        Compute risk score for an event at a specific timestep.

        Returns:
            (risk_score: float, risk_level: str, components: Dict[str, float])
        """
        # 1. Intensity component (0-100)
        intensity_component = min(100.0, max(0.0, float(event_track.get("intensity", 50.0))))

        # 2. Spatial extent component (0-50,000 km² normalized to 0-100)
        area = float(event_track.get("area_km2", 5000.0))
        spatial_extent_component = min(100.0, (area / 50000.0) * 100.0)

        # 3. Persistence component (higher for multi-day events)
        persistence_component = min(100.0, persistence_days * 20.0)

        # 4. Growth rate component (positive expansion increases risk)
        if previous_track:
            prev_area = float(previous_track.get("area_km2", area))
            growth_rate = (area - prev_area) / prev_area if prev_area > 0 else 0.0
            growth_rate_component = min(100.0, max(0.0, 50.0 + growth_rate * 50.0))
        else:
            growth_rate_component = 50.0

        # 5. Forecast confidence component (0-100)
        confidence_component = min(100.0, max(0.0, float(forecast_confidence)))

        # Composite score
        risk_score = (
            self.weights["intensity"] * intensity_component +
            self.weights["spatial_extent"] * spatial_extent_component +
            self.weights["persistence"] * persistence_component +
            self.weights["growth_rate"] * growth_rate_component +
            self.weights["forecast_confidence"] * confidence_component
        )
        risk_score = round(max(0.0, min(100.0, risk_score)), 1)
        risk_level = self.classify_risk(risk_score)

        components = {
            "intensity": round(intensity_component, 1),
            "spatial_extent": round(spatial_extent_component, 1),
            "persistence": round(persistence_component, 1),
            "growth_rate": round(growth_rate_component, 1),
            "confidence": round(confidence_component, 1),
        }

        return risk_score, risk_level, components

    def classify_risk(self, score: float) -> str:
        """Classify numerical risk score into standard risk tier."""
        for level, (low, high) in RISK_LEVELS.items():
            if low <= score <= high:
                return level
        return "EXTREME" if score >= 80 else "LOW"
