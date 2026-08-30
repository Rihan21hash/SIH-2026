"""Dataset preparation and temporal cross-validation splitting."""

import numpy as np
import pandas as pd
from typing import Tuple


def generate_synthetic_training_dataset(num_samples: int = 2000) -> pd.DataFrame:
    """
    Generate synthetic balanced dataset reflecting Indian monsoon and heatwave dynamics.
    """
    np.random.seed(42)

    z_rainfall = np.random.exponential(scale=1.5, size=num_samples) - 0.5
    pct_rainfall = np.clip((z_rainfall + 2) * 20, 0, 100)

    z_temp = np.random.normal(loc=0.0, scale=1.8, size=num_samples)
    pct_temp = np.clip((z_temp + 3) * 16.6, 0, 100)

    wind_anomaly = np.random.exponential(scale=10.0, size=num_samples)
    pressure_anomaly = np.random.normal(loc=-2.0, scale=8.0, size=num_samples)
    humidity_anomaly = np.random.normal(loc=5.0, scale=15.0, size=num_samples)
    persistence_hours = np.random.choice([6, 12, 24, 48, 72, 96, 120], size=num_samples)
    spatial_extent = np.random.exponential(scale=15.0, size=num_samples) + 2
    growth_rate = np.random.normal(loc=0.05, scale=0.3, size=num_samples)

    # Multi-class target label assignment
    severity_labels = []
    for i in range(num_samples):
        score = (
            0.35 * pct_rainfall[i] +
            0.25 * max(0, z_temp[i] * 18) +
            0.20 * min(100, wind_anomaly[i] * 3) +
            0.20 * min(100, persistence_hours[i] * 0.8)
        )
        if score < 25:
            severity_labels.append(0)  # NORMAL
        elif score < 45:
            severity_labels.append(1)  # WATCH
        elif score < 65:
            severity_labels.append(2)  # WARNING
        elif score < 85:
            severity_labels.append(3)  # SEVERE
        else:
            severity_labels.append(4)  # EXTREME

    df = pd.DataFrame({
        "rainfall_anomaly_zscore": z_rainfall,
        "rainfall_percentile": pct_rainfall,
        "temp_anomaly_zscore": z_temp,
        "temp_percentile": pct_temp,
        "wind_speed_anomaly": wind_anomaly,
        "pressure_anomaly": pressure_anomaly,
        "humidity_anomaly": humidity_anomaly,
        "persistence_hours": persistence_hours,
        "spatial_extent_cells": spatial_extent,
        "growth_rate": growth_rate,
        "severity": severity_labels,
    })

    return df


def prepare_temporal_splits(
    df: pd.DataFrame,
    train_frac: float = 0.7,
    val_frac: float = 0.15
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Split dataset strictly sequentially to prevent forward information leakage.
    """
    n = len(df)
    train_end = int(n * train_frac)
    val_end = int(n * (train_frac + val_frac))

    train = df.iloc[:train_end].copy()
    val = df.iloc[train_end:val_end].copy()
    test = df.iloc[val_end:].copy()

    return train, val, test
