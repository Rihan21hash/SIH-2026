"""Alert Pydantic Schemas"""

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class AlertBase(BaseModel):
    """Base alert schema."""

    alert_id: str
    event_id: str
    severity: str
    title: str
    message: str
    affected_districts: List[str]
    expected_lead_time_hours: Optional[int] = None


class AlertResponse(AlertBase):
    """Schema for alert API responses."""

    id: int
    issued_at: datetime
    expires_at: Optional[datetime] = None
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AlertAcknowledge(BaseModel):
    """Schema for acknowledging an alert."""

    user_id: str
