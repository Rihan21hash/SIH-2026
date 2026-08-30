"""
Event Tracking Service — Extracts spatial events from anomaly grids and tracks them across timesteps.
"""

import math
from datetime import datetime
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
from scipy import ndimage
from backend.utils.geospatial import haversine_distance, create_geojson_circle_polygon


class EventTracker:
    """
    Converts anomaly grids into persistent weather events and tracks them temporally.
    """

    def __init__(self, grid_resolution: float = 0.25):
        self.grid_resolution = grid_resolution

    def extract_events_from_anomaly_grid(
        self,
        anomaly_grid: np.ndarray,
        grid_coords: Tuple[np.ndarray, np.ndarray],  # (lats, lons)
        threshold: float = 60.0,
        valid_time: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """
        Extract discrete weather events from anomaly grid using connected components.
        """
        lats, lons = grid_coords
        binary_mask = anomaly_grid >= threshold

        # Label connected components
        labeled_array, num_features = ndimage.label(binary_mask)
        events = []

        for component_id in range(1, num_features + 1):
            component_mask = labeled_array == component_id

            if np.sum(component_mask) < 2:
                continue

            event_props = self._compute_event_properties(
                component_mask, anomaly_grid, grid_coords, valid_time
            )
            events.append(event_props)

        return events

    def _compute_event_properties(
        self,
        mask: np.ndarray,
        anomaly_grid: np.ndarray,
        grid_coords: Tuple[np.ndarray, np.ndarray],
        valid_time: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Compute centroid, area, intensity, and geometry for an event."""
        lats, lons = grid_coords
        y_indices, x_indices = np.where(mask)

        centroid_lat = float(lats[int(np.mean(y_indices))])
        centroid_lon = float(lons[int(np.mean(x_indices))])

        km_per_degree_lat = 111.0
        km_per_degree_lon = 111.0 * math.cos(math.radians(centroid_lat))
        cell_area_km2 = (self.grid_resolution ** 2) * km_per_degree_lat * km_per_degree_lon
        area_km2 = float(np.sum(mask) * cell_area_km2)
        intensity = float(np.mean(anomaly_grid[mask]))

        # Approximate radius for geometry polygon
        radius_km = math.sqrt(max(1.0, area_km2 / math.pi))
        geojson_poly = create_geojson_circle_polygon(centroid_lat, centroid_lon, radius_km)

        return {
            "centroid_lat": centroid_lat,
            "centroid_lon": centroid_lon,
            "area_km2": area_km2,
            "intensity": intensity,
            "geometry": geojson_poly,
            "valid_time": valid_time.isoformat() if valid_time else None,
            "grid_cells": mask,
        }

    def associate_events_across_timesteps(
        self,
        prev_events: List[Dict[str, Any]],
        curr_events: List[Dict[str, Any]],
        max_distance_km: float = 300.0,
        min_iou: float = 0.05,
    ) -> List[Tuple[int, int]]:
        """
        Match events between consecutive timesteps using centroid distance and mask IoU.
        """
        matches = []

        for i, prev_event in enumerate(prev_events):
            best_match = None
            best_score = -1.0

            for j, curr_event in enumerate(curr_events):
                dist = haversine_distance(
                    prev_event["centroid_lat"], prev_event["centroid_lon"],
                    curr_event["centroid_lat"], curr_event["centroid_lon"],
                )

                if dist > max_distance_km:
                    continue

                iou = 0.0
                if "grid_cells" in prev_event and "grid_cells" in curr_event:
                    mask1 = prev_event["grid_cells"]
                    mask2 = curr_event["grid_cells"]
                    if mask1.shape == mask2.shape:
                        intersection = np.sum(mask1 & mask2)
                        union = np.sum(mask1 | mask2)
                        iou = float(intersection / union) if union > 0 else 0.0

                dist_score = max(0.0, 1.0 - (dist / max_distance_km))
                score = 0.6 * dist_score + 0.4 * iou

                if score > best_score and (iou >= min_iou or dist_score > 0.6):
                    best_score = score
                    best_match = j

            if best_match is not None:
                matches.append((i, best_match))

        return matches
