"""AeroWatch Configuration — Pydantic Settings"""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Application
    APP_NAME: str = "AeroWatch"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://aerowatch_user:aerowatch_pass@localhost:5432/aerowatch"
    SQLALCHEMY_ECHO: bool = False

    # Security
    SECRET_KEY: str = "dev_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Data Sources
    ERA5_DATA_PATH: str = "/data/era5"
    FORECAST_DATA_PATH: str = "/data/forecasts"
    OPEN_METEO_API_URL: str = "https://api.open-meteo.com/v1"

    # ML
    XGBOOST_MODEL_PATH: str = "/models/xgboost_model.pkl"
    SHAP_CACHE_PATH: str = "/cache/shap"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Demo Mode
    DEMO_MODE: bool = True
    DEMO_DATA_PATH: str = "/data/demo"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
