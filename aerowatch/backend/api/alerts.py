"""Alerts API — Alert management endpoints"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime

from backend.services.data_service import generate_demo_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/")
async def list_alerts(
    severity: Optional[str] = None,
    acknowledged: Optional[bool] = None,
    limit: int = 50,
):
    """List operational alerts."""
    alerts = generate_demo_alerts()

    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    if acknowledged is not None:
        alerts = [a for a in alerts if a["acknowledged"] == acknowledged]

    return alerts[:limit]


@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, user_id: str = "operator_1"):
    """Mark alert as acknowledged by operator."""
    alerts = generate_demo_alerts()
    alert = next((a for a in alerts if a["alert_id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    # In demo mode, just return success
    return {
        "alert_id": alert_id,
        "acknowledged": True,
        "acknowledged_by": user_id,
        "acknowledged_at": datetime.utcnow().isoformat(),
    }
