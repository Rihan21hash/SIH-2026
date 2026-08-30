"""Geospatial utilities for distance, polygon calculation, and intersection."""

import math
from typing import List, Tuple, Dict, Any


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in kilometers.
    """
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2.0) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2.0) ** 2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371.0  # Earth radius in kilometers
    return c * r


def calculate_polygon_area_km2(coords: List[Tuple[float, float]]) -> float:
    """
    Approximate polygon area on Earth's surface in square kilometers.
    Coords are in (lon, lat) order.
    """
    if len(coords) < 3:
        return 0.0

    # Spherical excess or planar approximation
    centroid_lat = sum(c[1] for c in coords) / len(coords)
    km_per_deg_lat = 111.0
    km_per_deg_lon = 111.0 * math.cos(math.radians(centroid_lat))

    # Shoelace formula in projected km
    pts_km = [(c[0] * km_per_deg_lon, c[1] * km_per_deg_lat) for c in coords]
    area = 0.0
    n = len(pts_km)
    for i in range(n):
        j = (i + 1) % n
        area += pts_km[i][0] * pts_km[j][1]
        area -= pts_km[j][0] * pts_km[i][1]
    return abs(area) / 2.0


def create_geojson_circle_polygon(lat: float, lon: float, radius_km: float, num_points: int = 16) -> Dict[str, Any]:
    """
    Generate GeoJSON Polygon approximating a circle centered at lat, lon with given radius in km.
    """
    coords = []
    lat_deg_offset = radius_km / 111.0
    lon_deg_offset = radius_km / (111.0 * math.cos(math.radians(lat)) if math.cos(math.radians(lat)) != 0 else 111.0)

    for i in range(num_points):
        angle = (2 * math.pi * i) / num_points
        dx = lon_deg_offset * math.cos(angle)
        dy = lat_deg_offset * math.sin(angle)
        coords.append([round(lon + dx, 4), round(lat + dy, 4)])
    
    # Close polygon
    coords.append(coords[0])

    return {
        "type": "Polygon",
        "coordinates": [coords]
    }
