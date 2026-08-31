"""
Anomaly Detection Engine
Implements explainable statistical anomaly calculation:
    Anomaly Z-Score = (Observed_Value - Climatological_Mean) / Climatological_Std
Calculates deviation metrics for temperature, rainfall, wind, and pressure.
"""
import numpy as np
import logging
from typing import List, Dict, Tuple
from backend.config import ANOMALY_CONFIG
from backend.models.schemas import WeatherReading, AnomalyReading

logger = logging.getLogger("aerowatch.anomaly")

# Climatological baseline distributions (Mean, StdDev) for Indian meteorological zones
# Based on IMD long-term seasonal averages
CLIMATOLOGICAL_BASELINES = {
    # Format: "State": (temp_mean, temp_std, rain_mean, rain_std, wind_mean, wind_std, press_mean, press_std)
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


def calculate_temperature_anomaly(observed: float, state: str) -> Tuple[float, float]:
    """Returns (z_score, absolute_deviation_celsius)"""
    mean, std, *_ = CLIMATOLOGICAL_BASELINES.get(state, CLIMATOLOGICAL_BASELINES["DEFAULT"])
    z = (observed - mean) / max(std, 0.1)
    diff = observed - mean
    return round(float(z), 2), round(float(diff), 2)


def calculate_rainfall_anomaly(observed: float, state: str) -> Tuple[float, float]:
    """Returns (z_score, percentage_anomaly)"""
    _, _, mean, std, *_ = CLIMATOLOGICAL_BASELINES.get(state, CLIMATOLOGICAL_BASELINES["DEFAULT"])
    z = (observed - mean) / max(std, 0.1)
    pct = ((observed - mean) / max(mean, 0.1)) * 100.0
    return round(float(z), 2), round(float(pct), 1)


def calculate_wind_anomaly(observed: float, state: str) -> Tuple[float, float]:
    """Returns (z_score, percentage_anomaly)"""
    *_, mean, std, p_mean, p_std = CLIMATOLOGICAL_BASELINES.get(state, CLIMATOLOGICAL_BASELINES["DEFAULT"])
    z = (observed - mean) / max(std, 0.1)
    pct = ((observed - mean) / max(mean, 0.1)) * 100.0
    return round(float(z), 2), round(float(pct), 1)


def calculate_pressure_anomaly(observed: float, state: str) -> Tuple[float, float]:
    """Returns (z_score, delta_hpa)"""
    *_, p_mean, p_std = CLIMATOLOGICAL_BASELINES.get(state, CLIMATOLOGICAL_BASELINES["DEFAULT"])
    z = (observed - p_mean) / max(p_std, 0.1)
    delta = observed - p_mean
    return round(float(z), 2), round(float(delta), 2)


def process_anomalies(readings: List[WeatherReading]) -> List[AnomalyReading]:
    """
    Takes raw weather observations and produces anomaly records with z-scores
    and composite severity ratings.
    """
    anomalies: List[AnomalyReading] = []

    for r in readings:
        t_z, t_diff = calculate_temperature_anomaly(r.temperature_2m, r.state)
        r_z, r_pct  = calculate_rainfall_anomaly(r.precipitation, r.state)
        w_z, w_pct  = calculate_wind_anomaly(r.windspeed_10m, r.state)
        p_z, p_diff = calculate_pressure_anomaly(r.surface_pressure, r.state)

        # Composite anomaly intensity (0–100 scale based on maximum z excursions)
        # Pressure drop is an indicator for storms/cyclones, so negative p_z increases score
        p_factor = max(0.0, -p_z)
        max_z = max(abs(t_z), max(0.0, r_z), max(0.0, w_z), p_factor)
        composite = min(100.0, (max_z / 4.0) * 100.0)

        anomalies.append(AnomalyReading(
            location_name=r.location_name,
            lat=r.lat,
            lon=r.lon,
            state=r.state,
            timestamp=r.timestamp,
            temp_z=t_z,
            rain_z=r_z,
            wind_z=w_z,
            pressure_z=p_z,
            temp_anomaly_c=t_diff,
            rain_anomaly_pct=r_pct,
            wind_anomaly_pct=w_pct,
            pressure_anomaly_hpa=p_diff,
            composite_anomaly_score=round(composite, 1)
        ))

    return anomalies
