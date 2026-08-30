"""Hyperparameter tuning for XGBoost model."""

from typing import Dict, Any
import numpy as np


def get_default_hyperparameters() -> Dict[str, Any]:
    """Return calibrated hyperparameters for operational weather intelligence."""
    return {
        "max_depth": 6,
        "n_estimators": 150,
        "learning_rate": 0.05,
        "subsample": 0.85,
        "colsample_bytree": 0.80,
        "min_child_weight": 3,
        "gamma": 0.1,
    }
