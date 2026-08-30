"""Unit tests for connected components event extraction and temporal tracking."""

import pytest
import numpy as np
from backend.services.event_service import EventTracker
from backend.utils.geospatial import haversine_distance


class TestEventTracking:

    @pytest.fixture
    def event_tracker(self):
        return EventTracker(grid_resolution=0.25)

    def test_haversine_distance(self):
        # Distance between Mumbai (19.076, 72.877) and Pune (18.520, 73.856) is ~120 km
        dist = haversine_distance(19.076, 72.877, 18.520, 73.856)
        assert 110.0 < dist < 140.0

    def test_extract_events_from_grid(self, event_tracker):
        # Create a 20x20 grid with one hotspot
        grid = np.zeros((20, 20))
        grid[5:9, 5:9] = 85.0  # Connected component of 16 cells

        lats = np.linspace(15.0, 25.0, 20)
        lons = np.linspace(70.0, 80.0, 20)

        events = event_tracker.extract_events_from_anomaly_grid(
            grid, (lats, lons), threshold=60.0
        )

        assert len(events) == 1
        assert events[0]["area_km2"] > 0
        assert events[0]["intensity"] == 85.0

    def test_temporal_event_association(self, event_tracker):
        prev_events = [{
            "centroid_lat": 19.0,
            "centroid_lon": 73.0,
            "grid_cells": np.ones((5, 5), dtype=bool),
        }]
        curr_events = [{
            "centroid_lat": 19.1,
            "centroid_lon": 73.1,
            "grid_cells": np.ones((5, 5), dtype=bool),
        }]

        matches = event_tracker.associate_events_across_timesteps(
            prev_events, curr_events, max_distance_km=100.0
        )
        assert len(matches) == 1
        assert matches[0] == (0, 0)
