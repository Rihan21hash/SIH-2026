"""
Statistical & Machine Learning Anomaly Detector
Calculates explainable climatological z-scores and composite anomaly ratings across multi-variate weather metrics.
"""
from typing import Dict, Tuple, Any, List
import numpy as np

CLIMATOLOGICAL_BASELINES: Dict[str, Tuple[float, float, float, float, float, float, float, float]] = {
    # Format: (temp_mean, temp_std, rain_mean, rain_std, wind_mean, wind_std, press_mean, press_std)
    "Tamil Nadu":     (30.0, 1.8,  2.5, 3.0, 12.0, 4.0, 1012.0, 3.5),
    "Kerala":         (27.5, 1.5,  5.0, 6.0, 10.0, 3.5, 1011.5, 3.0),
    "Rajasthan":      (34.0, 2.2,  0.5, 1.2, 14.0, 5.0, 1006.0, 4.0),
    "Uttarakhand":    (22.0, 2.5,  3.0, 4.5,  8.0, 3.0,  990.0, 5.0),
    "Odisha":         (29.5, 1.9,  3.5, 4.0, 12.5, 4.5, 1010.0, 3.5),
    "Delhi":          (32.0, 2.4,  1.2, 2.5, 11.0, 4.0, 1008.0, 4.0),
    "Maharashtra":    (28.5, 1.8,  2.8, 3.8, 11.5, 3.8, 1011.0, 3.2),
    "West Bengal":    (30.5, 1.7,  4.0, 4.5, 10.5, 3.5, 1009.5, 3.5),
    "Gujarat":        (32.5, 2.0,  1.0, 2.0, 13.0, 4.2, 1009.0, 3.8),
    "Assam":          (26.0, 1.6,  6.0, 5.5,  7.5, 2.8, 1010.5, 3.0),
    "DEFAULT":        (29.0, 2.0,  3.0, 4.0, 11.0, 4.0, 1010.0, 4.0),
}


class AnomalyDetector:
    """Computes explainable statistical z-score departures from climatological baselines."""

    def __init__(self, baselines: Dict[str, Tuple[float, ...]] = None):
        self.baselines = baselines or CLIMATOLOGICAL_BASELINES

    def get_baseline(self, state: str) -> Tuple[float, float, float, float, float, float, float, float]:
        return self.baselines.get(state, self.baselines["DEFAULT"])

    def detect_temperature_anomaly(self, observed: float, state: str) -> Tuple[float, float]:
        mean, std, *_ = self.get_baseline(state)
        z = (observed - mean) / max(std, 0.1)
        diff = observed - mean
        return round(float(z), 2), round(float(diff), 2)

    def detect_rainfall_anomaly(self, observed: float, state: str) -> Tuple[float, float]:
        _, _, mean, std, *_ = self.get_baseline(state)
        z = (observed - mean) / max(std, 0.1)
        pct = ((observed - mean) / max(mean, 0.1)) * 100.0
        return round(float(z), 2), round(float(pct), 1)

    def detect_wind_anomaly(self, observed: float, state: str) -> Tuple[float, float]:
        *_, mean, std, _, _ = self.get_baseline(state)
        z = (observed - mean) / max(std, 0.1)
        pct = ((observed - mean) / max(mean, 0.1)) * 100.0
        return round(float(z), 2), round(float(pct), 1)

    def detect_pressure_anomaly(self, observed: float, state: str) -> Tuple[float, float]:
        *_, p_mean, p_std = self.get_baseline(state)
        z = (observed - p_mean) / max(p_std, 0.1)
        delta = observed - p_mean
        return round(float(z), 2), round(float(delta), 2)
