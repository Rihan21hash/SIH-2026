"""
Open-Meteo Weather Service
Integrates with the free, open Open-Meteo API for real-time and forecast weather data in India.
No API key required (₹0 cost).
"""
import httpx
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from backend.config import INDIA_GRID_POINTS
from backend.models.schemas import WeatherReading

logger = logging.getLogger("aerowatch.open_meteo")

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive"

# In-memory cache for weather readings to minimize external calls
_weather_cache: Dict[str, Any] = {
    "timestamp": None,
    "readings": [],
    "forecasts": {}
}

CACHE_TTL_SECONDS = 300  # 5 minutes cache


async def fetch_grid_weather(client: Optional[httpx.AsyncClient] = None) -> List[WeatherReading]:
    """
    Fetches current weather readings across the Indian subcontinent grid points.
    Returns list of WeatherReading models.
    """
    now = datetime.now(timezone.utc)
    
    # Check cache
    if _weather_cache["timestamp"] and (now - _weather_cache["timestamp"]).total_seconds() < CACHE_TTL_SECONDS:
        if _weather_cache["readings"]:
            logger.info("Serving weather readings from in-memory cache")
            return _weather_cache["readings"]

    readings: List[WeatherReading] = []
    should_close = False
    if client is None:
        client = httpx.AsyncClient(timeout=10.0)
        should_close = True

    try:
        # Group coordinates for batch request if supported or iterate
        # Open-Meteo supports comma-separated latitudes and longitudes
        lats = [str(pt["lat"]) for pt in INDIA_GRID_POINTS]
        lons = [str(pt["lon"]) for pt in INDIA_GRID_POINTS]

        params = {
            "latitude": ",".join(lats),
            "longitude": ",".join(lons),
            "current": "temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m",
            "hourly": "temperature_2m,precipitation,surface_pressure,wind_speed_10m",
            "forecast_days": 4,
            "timezone": "Asia/Kolkata"
        }

        response = await client.get(OPEN_METEO_FORECAST_URL, params=params)
        
        if response.status_code == 200:
            data = response.json()
            # If multiple locations, Open-Meteo returns a list of result objects
            if isinstance(data, list):
                for i, location_data in enumerate(data):
                    pt = INDIA_GRID_POINTS[i]
                    curr = location_data.get("current", {})
                    readings.append(WeatherReading(
                        location_name=pt["name"],
                        lat=pt["lat"],
                        lon=pt["lon"],
                        state=pt["state"],
                        timestamp=now,
                        temperature_2m=float(curr.get("temperature_2m", 25.0)),
                        precipitation=float(curr.get("precipitation", 0.0)),
                        windspeed_10m=float(curr.get("wind_speed_10m", 10.0)),
                        surface_pressure=float(curr.get("surface_pressure", 1013.25)),
                        relative_humidity_2m=float(curr.get("relative_humidity_2m", 60.0))
                    ))
                    _weather_cache["forecasts"][pt["name"]] = location_data.get("hourly", {})
            else:
                # Single location response
                curr = data.get("current", {})
                pt = INDIA_GRID_POINTS[0]
                readings.append(WeatherReading(
                    location_name=pt["name"],
                    lat=pt["lat"],
                    lon=pt["lon"],
                    state=pt["state"],
                    timestamp=now,
                    temperature_2m=float(curr.get("temperature_2m", 25.0)),
                    precipitation=float(curr.get("precipitation", 0.0)),
                    windspeed_10m=float(curr.get("wind_speed_10m", 10.0)),
                    surface_pressure=float(curr.get("surface_pressure", 1013.25)),
                    relative_humidity_2m=float(curr.get("relative_humidity_2m", 60.0))
                ))
            
            _weather_cache["timestamp"] = now
            _weather_cache["readings"] = readings
            logger.info(f"Successfully fetched live weather for {len(readings)} grid points from Open-Meteo")
        else:
            logger.warning(f"Open-Meteo API returned status {response.status_code}: {response.text}")
            readings = _get_synthetic_fallback_readings(now)
    except Exception as e:
        logger.warning(f"Failed to fetch live data from Open-Meteo: {e}. Using fallback baseline.")
        readings = _get_synthetic_fallback_readings(now)
    finally:
        if should_close:
            await client.aclose()

    return readings


def get_cached_forecast_hourly(location_name: str) -> Optional[Dict[str, Any]]:
    return _weather_cache["forecasts"].get(location_name)


def _get_synthetic_fallback_readings(now: datetime) -> List[WeatherReading]:
    """Generates standard climatological baseline readings when offline."""
    readings = []
    # Realistic regional baselines across India
    regional_profiles = {
        "Tamil Nadu": {"temp": 32.5, "rain": 4.2, "wind": 18.0, "press": 1008.0, "hum": 75.0},
        "Kerala": {"temp": 28.0, "rain": 14.5, "wind": 14.0, "press": 1009.5, "hum": 85.0},
        "Rajasthan": {"temp": 42.0, "rain": 0.0, "wind": 22.0, "press": 1002.0, "hum": 25.0},
        "Uttarakhand": {"temp": 19.5, "rain": 8.0, "wind": 12.0, "press": 985.0, "hum": 70.0},
        "Odisha": {"temp": 31.0, "rain": 6.5, "wind": 20.0, "press": 1006.0, "hum": 80.0},
        "Delhi": {"temp": 38.5, "rain": 0.5, "wind": 15.0, "press": 1004.0, "hum": 45.0},
        "Maharashtra": {"temp": 30.5, "rain": 3.0, "wind": 16.0, "press": 1010.0, "hum": 70.0},
        "West Bengal": {"temp": 32.0, "rain": 5.0, "wind": 15.0, "press": 1007.0, "hum": 78.0},
        "Gujarat": {"temp": 36.0, "rain": 0.2, "wind": 18.0, "press": 1006.0, "hum": 55.0},
        "Assam": {"temp": 27.5, "rain": 9.0, "wind": 10.0, "press": 1008.0, "hum": 82.0},
    }
    
    for pt in INDIA_GRID_POINTS:
        profile = regional_profiles.get(pt["state"], {"temp": 30.0, "rain": 2.0, "wind": 12.0, "press": 1010.0, "hum": 65.0})
        readings.append(WeatherReading(
            location_name=pt["name"],
            lat=pt["lat"],
            lon=pt["lon"],
            state=pt["state"],
            timestamp=now,
            temperature_2m=profile["temp"],
            precipitation=profile["rain"],
            windspeed_10m=profile["wind"],
            surface_pressure=profile["press"],
            relative_humidity_2m=profile["hum"]
        ))
    return readings
