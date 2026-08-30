"""
Historical Baseline Service — Computes multi-year statistical climatological baselines.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Optional


class BaselineService:
    """
    Computes statistical percentiles, means, and standard deviations
    from multi-year climatological observation data per grid cell per calendar month.
    """

    def compute_baseline_for_grid(
        self,
        historical_values: np.ndarray,
        grid_id: int,
        variable: str,
        month: int,
    ) -> Dict[str, Any]:
        """
        Compute parametric and non-parametric baseline metrics from historical series.
        """
        clean_vals = historical_values[~np.isnan(historical_values)]
        if len(clean_vals) == 0:
            return {
                "grid_id": grid_id,
                "variable": variable,
                "month": month,
                "mean": 0.0,
                "median": 0.0,
                "std_dev": 0.0,
                "p05": 0.0,
                "p25": 0.0,
                "p75": 0.0,
                "p95": 0.0,
                "p99": 0.0,
            }

        return {
            "grid_id": grid_id,
            "variable": variable,
            "month": month,
            "mean": round(float(np.mean(clean_vals)), 2),
            "median": round(float(np.median(clean_vals)), 2),
            "std_dev": round(float(np.std(clean_vals)), 2),
            "p05": round(float(np.percentile(clean_vals, 5)), 2),
            "p25": round(float(np.percentile(clean_vals, 25)), 2),
            "p75": round(float(np.percentile(clean_vals, 75)), 2),
            "p95": round(float(np.percentile(clean_vals, 95)), 2),
            "p99": round(float(np.percentile(clean_vals, 99)), 2),
        }
