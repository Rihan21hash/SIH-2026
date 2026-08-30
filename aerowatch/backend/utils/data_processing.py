"""Data processing utilities for normalization, temporal splitting, and aggregation."""

import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any


def temporal_train_test_split(data: pd.DataFrame, test_size: float = 0.2) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split data strictly chronologically to prevent temporal data leakage.
    """
    n = len(data)
    split_point = int(n * (1 - test_size))
    train = data.iloc[:split_point].copy()
    test = data.iloc[split_point:].copy()
    return train, test


def normalize_series(series: np.ndarray, min_val: float = None, max_val: float = None) -> np.ndarray:
    """Min-max normalize an array to [0, 1]."""
    if min_val is None:
        min_val = np.nanmin(series)
    if max_val is None:
        max_val = np.nanmax(series)
    
    denom = max_val - min_val
    if denom == 0:
        return np.zeros_like(series)
    
    return np.clip((series - min_val) / denom, 0.0, 1.0)


def aggregate_grid_to_districts(
    grid_points: List[Dict[str, Any]],
    district_centers: Dict[str, Tuple[float, float]],
    max_radius_km: float = 50.0
) -> Dict[str, float]:
    """
    Aggregate grid cell anomalies to district exposure scores based on proximity.
    """
    from backend.utils.geospatial import haversine_distance

    district_scores = {}
    for district, (dlat, dlon) in district_centers.items():
        matched_scores = []
        for pt in grid_points:
            dist = haversine_distance(dlat, dlon, pt["lat"], pt["lon"])
            if dist <= max_radius_km:
                weight = 1.0 - (dist / max_radius_km)
                matched_scores.append(pt["score"] * weight)
        
        if matched_scores:
            district_scores[district] = round(float(np.mean(matched_scores)), 2)
        else:
            district_scores[district] = 0.0

    return district_scores
