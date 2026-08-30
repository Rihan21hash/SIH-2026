"""Unit tests for hybrid anomaly detection algorithm."""

import pytest
import numpy as np
from backend.services.anomaly_service import AnomalyDetector


class TestAnomalyDetection:

    @pytest.fixture
    def anomaly_detector(self):
        return AnomalyDetector()

    def test_z_score_calculation(self, anomaly_detector):
        # Forecast: 52mm, mean: 12.4mm, std: 8.2mm -> Z ~ 4.829
        z_score = anomaly_detector.compute_z_score_anomaly(52.0, 12.4, 8.2)
        assert abs(z_score - 4.829) < 0.01

    def test_percentile_anomaly_upper_bound(self, anomaly_detector):
        # Above p99
        pct = anomaly_detector.compute_percentile_anomaly(150.0, 40.0, 2.0)
        assert pct == 100.0

    def test_percentile_anomaly_lower_bound(self, anomaly_detector):
        # Below p05
        pct = anomaly_detector.compute_percentile_anomaly(1.0, 40.0, 2.0)
        assert pct == 0.0

    def test_percentile_anomaly_interpolation(self, anomaly_detector):
        # Midpoint between p05 (10) and p99 (90)
        pct = anomaly_detector.compute_percentile_anomaly(50.0, 90.0, 10.0)
        assert abs(pct - 50.0) < 0.1

    def test_hybrid_score(self, anomaly_detector):
        # Z-score = 5.0, Percentile = 95.0
        score = anomaly_detector.compute_hybrid_anomaly_score(5.0, 95.0)
        assert 70.0 < score <= 100.0

    def test_severity_classification(self, anomaly_detector):
        assert anomaly_detector.classify_severity(15.0) == "NORMAL"
        assert anomaly_detector.classify_severity(30.0) == "WATCH"
        assert anomaly_detector.classify_severity(50.0) == "WARNING"
        assert anomaly_detector.classify_severity(70.0) == "SEVERE"
        assert anomaly_detector.classify_severity(95.0) == "EXTREME"
