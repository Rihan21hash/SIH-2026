"""Unit tests for composite risk scoring engine."""

import pytest
from backend.services.risk_service import RiskScoringEngine


class TestRiskScoring:

    @pytest.fixture
    def risk_engine(self):
        return RiskScoringEngine()

    def test_risk_score_bounds(self, risk_engine):
        event_track = {
            "intensity": 90.0,
            "area_km2": 25000.0,
        }
        score, level, components = risk_engine.compute_risk_score(
            event_track,
            previous_track=None,
            persistence_days=3,
            forecast_confidence=90.0
        )
        assert 0.0 <= score <= 100.0
        assert level in ["LOW", "MODERATE", "HIGH", "SEVERE", "EXTREME"]
        assert "intensity" in components
        assert "spatial_extent" in components

    def test_extreme_risk_classification(self, risk_engine):
        event_track = {
            "intensity": 98.0,
            "area_km2": 45000.0,
        }
        score, level, _ = risk_engine.compute_risk_score(
            event_track,
            previous_track={"area_km2": 20000.0},
            persistence_days=5,
            forecast_confidence=95.0
        )
        assert score > 75.0
        assert level in ["SEVERE", "EXTREME"]

    def test_low_risk_classification(self, risk_engine):
        event_track = {
            "intensity": 5.0,
            "area_km2": 100.0,
        }
        score, level, _ = risk_engine.compute_risk_score(
            event_track,
            previous_track=None,
            persistence_days=0,
            forecast_confidence=20.0
        )
        assert score < 20.0
        assert level == "LOW"
