"""
Risk Scoring & Confidence Estimation Engine
Produces explainable 0–100 risk scores based on weighted anomaly drivers,
persistence, spatial extent, and medium-range forecast confidence.
"""
from typing import Dict, Any, Tuple
from backend.config import RISK_WEIGHTS, SEVERITY_CONFIG
from backend.models.schemas import SeverityLevel, AnomalyDrivers


def calculate_risk_score(
    drivers: AnomalyDrivers,
    affected_area_km2: float
) -> Tuple[float, SeverityLevel, float]:
    """
    Computes:
      1. risk_score: Normalized composite 0–100 score
      2. severity: Categorical level (LOW, MODERATE, ELEVATED, HIGH, SEVERE)
      3. confidence: Confidence percentage (0–100) based on signal consistency
    """
    w = RISK_WEIGHTS

    # Normalized component values (0 to 1 scale)
    # Temperature contribution (high positive temp or high negative cold snap)
    temp_norm = min(1.0, abs(drivers.temperature_anomaly_c) / 8.0)
    
    # Rainfall contribution (positive surplus for flood/cyclone/cloudburst)
    rain_norm = min(1.0, max(0.0, drivers.rainfall_anomaly_pct) / 300.0) if drivers.rainfall_anomaly_pct > 0 else min(1.0, abs(drivers.rainfall_anomaly_pct) / 100.0) * 0.5
    
    # Wind contribution
    wind_norm = min(1.0, max(0.0, drivers.wind_anomaly_pct) / 150.0)
    
    # Pressure drop contribution (e.g. -25 hPa drop in cyclone)
    press_norm = min(1.0, max(0.0, -drivers.pressure_anomaly_hpa) / 25.0)
    
    # Persistence contribution (e.g. 5 days = high cumulative impact)
    pers_norm = min(1.0, drivers.persistence_days / 5.0)
    
    # Spatial extent contribution (e.g. 50,000 km2 = large scale)
    extent_norm = min(1.0, affected_area_km2 / 40000.0)

    # Weighted sum
    total_weights = (
        w.temperature_anomaly +
        w.rainfall_anomaly +
        w.wind_anomaly +
        w.pressure_anomaly +
        w.persistence +
        w.spatial_extent
    )

    weighted_score = (
        (temp_norm * w.temperature_anomaly) +
        (rain_norm * w.rainfall_anomaly) +
        (wind_norm * w.wind_anomaly) +
        (press_norm * w.pressure_anomaly) +
        (pers_norm * w.persistence) +
        (extent_norm * w.spatial_extent)
    ) / total_weights

    raw_risk = weighted_score * 100.0
    risk_score = round(max(0.0, min(100.0, raw_risk)), 1)

    # Categorize severity
    severity: SeverityLevel = "LOW"
    if risk_score >= SEVERITY_CONFIG.severe:
        severity = "SEVERE"
    elif risk_score >= SEVERITY_CONFIG.high:
        severity = "HIGH"
    elif risk_score >= SEVERITY_CONFIG.elevated:
        severity = "ELEVATED"
    elif risk_score >= SEVERITY_CONFIG.moderate:
        severity = "MODERATE"

    # Confidence calculation: signal consistency across multiple anomaly dimensions
    active_drivers = sum([
        1 if abs(drivers.temperature_anomaly_c) > 2.0 else 0,
        1 if abs(drivers.rainfall_anomaly_pct) > 50.0 else 0,
        1 if drivers.wind_anomaly_pct > 40.0 else 0,
        1 if abs(drivers.pressure_anomaly_hpa) > 5.0 else 0,
        1 if drivers.persistence_days >= 1 else 0,
    ])
    
    # Multi-variable alignment increases confidence score
    base_confidence = 65.0 + (active_drivers * 6.0)
    confidence = round(min(96.0, max(50.0, base_confidence)), 1)

    return risk_score, severity, confidence
