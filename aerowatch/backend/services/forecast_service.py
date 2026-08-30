"""
Forecast Service — Handles numerical weather prediction forecast ingestion, interpolation, and grid mapping.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np


class ForecastService:
    """
    Manages forecast datasets, temporal lead times, and spatial interpolation.
    """

    def generate_synthetic_forecast_grid(
        self,
        base_time: datetime,
        horizon_hours: int = 120,
        grid_resolution: float = 0.25,
    ) -> List[Dict[str, Any]]:
        """
        Generate synthetic high-resolution forecast grid points across India.
        """
        records = []
        # Key sample coordinates in India
        centers = [
            {"grid_id": 1, "lat": 18.5204, "lon": 73.8567, "name": "Pune"},
            {"grid_id": 2, "lat": 19.0760, "lon": 72.8777, "name": "Mumbai"},
            {"grid_id": 3, "lat": 26.9124, "lon": 75.7873, "name": "Jaipur"},
            {"grid_id": 4, "lat": 9.9312, "lon": 76.2673, "name": "Kochi"},
            {"grid_id": 5, "lat": 13.0827, "lon": 80.2707, "name": "Chennai"},
            {"grid_id": 6, "lat": 22.5726, "lon": 88.3639, "name": "Kolkata"},
        ]

        for step in range(0, horizon_hours, 6):
            valid_time = base_time + timedelta(hours=step)
            for center in centers:
                records.append({
                    "grid_id": center["grid_id"],
                    "latitude": center["lat"],
                    "longitude": center["lon"],
                    "forecast_issued_at": base_time.isoformat(),
                    "valid_time": valid_time.isoformat(),
                    "lead_time_hours": step,
                    "temperature": round(25.0 + 10.0 * np.sin(step / 24.0 * np.pi), 1),
                    "rainfall": round(max(0.0, float(np.random.exponential(5.0) if center["grid_id"] in [1, 2, 4] else 0.5)), 1),
                    "humidity": round(70.0 + 20.0 * np.sin(step / 12.0), 1),
                    "pressure": round(1010.0 - 5.0 * np.sin(step / 48.0), 1),
                    "wind_speed": round(15.0 + 10.0 * np.random.rand(), 1),
                    "source": "NOAA_GFS_0.25",
                })

        return records
