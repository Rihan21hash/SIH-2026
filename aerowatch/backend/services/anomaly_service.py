"""
Anomaly Detection Service — Hybrid Z-score + Percentile anomaly detection.

Combines statistical methods for robust weather anomaly identification:
- Z-score: Measures how many standard deviations from the mean
- Percentile: Compares against historical distribution
- Hybrid: Weighted combination for robust scoring
"""

import numpy as np
from typing import List, Tuple, Optional


class AnomalyDetector:
    """
    Hybrid anomaly detection combining:
    - Z-score method
    - Percentile method
    - ML classification (XGBoost)
    """

    def compute_z_score_anomaly(
        self,
        forecast_value: float,
        baseline_mean: float,
        baseline_std: float,
    ) -> float:
        """
        Z-score anomaly: (X - μ) / σ
        Returns: Z-score value
        """
        if baseline_std == 0:
            return 0.0
        return (forecast_value - baseline_mean) / baseline_std

    def compute_percentile_anomaly(
        self,
        forecast_value: float,
        percentile_p99: float,
        percentile_p05: float,
    ) -> float:
        """
        Percentile-based anomaly.
        Returns: 0-100 percentile rank
        """
        if forecast_value >= percentile_p99:
            return 100.0
        elif forecast_value <= percentile_p05:
            return 0.0
        else:
            denom = percentile_p99 - percentile_p05
            if denom == 0:
                return 50.0
            pct = (forecast_value - percentile_p05) / denom * 100
            return max(0.0, min(100.0, pct))

    def compute_hybrid_anomaly_score(
        self,
        z_score: float,
        percentile_rank: float,
    ) -> float:
        """
        Hybrid score: 0.6 × Z_normalized + 0.4 × Percentile_normalized
        Returns: 0-100 anomaly score
        """
        # Normalize Z-score to 0-100 (maps ~-5 to +5 Z to 0-100)
        z_normalized = max(0, min(100, (z_score + 5) * 10))

        # Percentile already 0-100
        hybrid = 0.6 * z_normalized + 0.4 * percentile_rank
        return max(0.0, min(100.0, hybrid))

    def detect_anomalies_batch(
        self,
        forecast_values: np.ndarray,
        baseline_means: np.ndarray,
        baseline_stds: np.ndarray,
        baseline_p99: np.ndarray,
        baseline_p05: np.ndarray,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Batch anomaly detection for arrays.

        Returns:
            (anomaly_scores, z_scores, percentile_ranks) — all shape (N,)
        """
        # Z-scores
        z_scores = np.where(
            baseline_stds > 0,
            (forecast_values - baseline_means) / baseline_stds,
            0.0,
        )

        # Percentile ranks
        denom = baseline_p99 - baseline_p05
        pct = np.where(
            forecast_values >= baseline_p99,
            100.0,
            np.where(
                forecast_values <= baseline_p05,
                0.0,
                np.where(denom > 0, (forecast_values - baseline_p05) / denom * 100, 50.0),
            ),
        )
        pct = np.clip(pct, 0, 100)

        # Hybrid scores
        z_norm = np.clip((z_scores + 5) * 10, 0, 100)
        scores = 0.6 * z_norm + 0.4 * pct
        scores = np.clip(scores, 0, 100)

        return scores, z_scores, pct

    def classify_severity(self, anomaly_score: float) -> str:
        """Classify severity based on anomaly score."""
        if anomaly_score < 20:
            return "NORMAL"
        elif anomaly_score < 40:
            return "WATCH"
        elif anomaly_score < 60:
            return "WARNING"
        elif anomaly_score < 80:
            return "SEVERE"
        else:
            return "EXTREME"
