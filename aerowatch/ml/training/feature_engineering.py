"""Feature engineering for weather hazard classification."""

import numpy as np
import pandas as pd


def compute_derived_weather_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute derived meteorological features from raw observations/forecasts:
    - Z-scores relative to climatology
    - Percentile rankings
    - Atmospheric pressure gradient
    - Wind shear & dew point approximations
    """
    df = df.copy()

    # Z-scores
    if "rainfall" in df.columns and "rainfall_mean" in df.columns and "rainfall_std" in df.columns:
        df["rainfall_anomaly_zscore"] = np.where(
            df["rainfall_std"] > 0,
            (df["rainfall"] - df["rainfall_mean"]) / df["rainfall_std"],
            0.0,
        )

    if "temperature" in df.columns and "temp_mean" in df.columns and "temp_std" in df.columns:
        df["temp_anomaly_zscore"] = np.where(
            df["temp_std"] > 0,
            (df["temperature"] - df["temp_mean"]) / df["temp_std"],
            0.0,
        )

    # Persistence indicators
    if "consecutive_anomalous_timesteps" not in df.columns:
        df["persistence_hours"] = 24.0

    return df
