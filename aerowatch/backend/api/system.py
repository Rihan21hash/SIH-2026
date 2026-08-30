"""System API — System status and demo mode endpoints"""

from fastapi import APIRouter

from backend.config import settings
from backend.services.data_service import generate_demo_system_status

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/status")
async def get_system_status():
    """Get overall system health status."""
    status = generate_demo_system_status()
    status["demo_mode"] = settings.DEMO_MODE
    return status


@router.post("/demo-mode")
async def toggle_demo_mode(enabled: bool):
    """Switch between live and demo mode."""
    settings.DEMO_MODE = enabled
    return {
        "demo_mode": settings.DEMO_MODE,
        "message": f"Demo mode {'enabled' if enabled else 'disabled'}",
    }
