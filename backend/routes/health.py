"""
Health Check Route
"""
from fastapi import APIRouter
from datetime import datetime, timezone
from backend.models.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        version="1.0.0",
        timestamp=datetime.now(timezone.utc),
        backend_online=True
    )
