"""
AeroWatch — Centralized Configuration
All thresholds and weights are here — never scattered in code.
"""
from dataclasses import dataclass, field
from typing import Dict


# ─── Anomaly Thresholds (z-score) ────────────────────────────────────────────
@dataclass
class AnomalyConfig:
    """
    Anomaly is detected as:
        z = (current - baseline_mean) / baseline_std
    Flags are raised when |z| exceeds threshold.
    """
    temperature_z_threshold: float = 2.0     # z > 2σ = anomaly
    rainfall_z_threshold: float = 2.0
    wind_z_threshold: float = 2.5
    pressure_z_threshold: float = 2.0

    baseline_days: int = 30                  # days of history for baseline


# ─── Event Severity Thresholds (risk score 0–100) ────────────────────────────
@dataclass
class SeverityConfig:
    """
    Classify events based on risk score.
    Thresholds mark the lower bound of each severity level.
    """
    low:      float = 0.0
    moderate: float = 20.0
    elevated: float = 40.0
    high:     float = 60.0
    severe:   float = 80.0


# ─── Risk Score Weights ───────────────────────────────────────────────────────
@dataclass
class RiskWeights:
    """
    Normalized weights for the composite risk score (0–100).
    Sum of weights: total is used for normalization.
    """
    temperature_anomaly: float = 1.5      # high temp = more risk
    rainfall_anomaly:    float = 2.0      # rainfall key driver
    wind_anomaly:        float = 1.8      # wind drives spread
    pressure_anomaly:    float = 1.2      # pressure indicates intensity
    persistence:         float = 1.0      # older events = more damage
    spatial_extent:      float = 0.8      # larger area = higher impact


# ─── Open-Meteo Grid Points for India ────────────────────────────────────────
# Strategically selected lat/lon points for good India coverage
INDIA_GRID_POINTS = [
    # Bay of Bengal / South India
    {"name": "Chennai",       "lat": 13.09, "lon": 80.27, "state": "Tamil Nadu"},
    {"name": "Visakhapatnam", "lat": 17.69, "lon": 83.22, "state": "Andhra Pradesh"},
    {"name": "Bhubaneswar",   "lat": 20.29, "lon": 85.83, "state": "Odisha"},
    # West India / Arabian Sea
    {"name": "Mumbai",        "lat": 19.08, "lon": 72.88, "state": "Maharashtra"},
    {"name": "Ahmedabad",     "lat": 23.03, "lon": 72.57, "state": "Gujarat"},
    {"name": "Surat",         "lat": 21.17, "lon": 72.83, "state": "Gujarat"},
    # North India
    {"name": "Delhi",         "lat": 28.61, "lon": 77.21, "state": "Delhi"},
    {"name": "Jaipur",        "lat": 26.91, "lon": 75.79, "state": "Rajasthan"},
    {"name": "Jaisalmer",     "lat": 26.92, "lon": 70.90, "state": "Rajasthan"},
    {"name": "Lucknow",       "lat": 26.85, "lon": 80.95, "state": "Uttar Pradesh"},
    # Central India
    {"name": "Bhopal",        "lat": 23.26, "lon": 77.41, "state": "Madhya Pradesh"},
    {"name": "Nagpur",        "lat": 21.14, "lon": 79.09, "state": "Maharashtra"},
    # Northeast India
    {"name": "Guwahati",      "lat": 26.18, "lon": 91.74, "state": "Assam"},
    {"name": "Imphal",        "lat": 24.82, "lon": 93.94, "state": "Manipur"},
    # Hills / Uttarakhand
    {"name": "Dehradun",      "lat": 30.32, "lon": 78.03, "state": "Uttarakhand"},
    # South India
    {"name": "Bengaluru",     "lat": 12.97, "lon": 77.59, "state": "Karnataka"},
    {"name": "Hyderabad",     "lat": 17.38, "lon": 78.49, "state": "Telangana"},
    {"name": "Kochi",         "lat": 9.93,  "lon": 76.26, "state": "Kerala"},
    # Kolkata region
    {"name": "Kolkata",       "lat": 22.57, "lon": 88.36, "state": "West Bengal"},
    {"name": "Patna",         "lat": 25.59, "lon": 85.14, "state": "Bihar"},
]


# ─── Singleton instances ──────────────────────────────────────────────────────
ANOMALY_CONFIG   = AnomalyConfig()
SEVERITY_CONFIG  = SeverityConfig()
RISK_WEIGHTS     = RiskWeights()
