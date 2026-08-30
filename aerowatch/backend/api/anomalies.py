"""Anomalies API — Anomaly detection endpoints"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime

from backend.services.data_service import generate_demo_anomaly_grid

router = APIRouter(prefix="/anomalies", tags=["anomalies"])


@router.get("/grid")
async def get_anomaly_grid(
    valid_time: Optional[datetime] = None,
    variable: str = "rainfall",
    hazard_type: Optional[str] = None,
):
    """Get anomaly grid data for a specific time and variable."""
    offset = 0
    if valid_time:
        base = datetime(2026, 8, 28, 0, 0, 0)
        offset = int((valid_time - base).total_seconds() / 3600)
        offset = max(0, min(119, offset))

    return generate_demo_anomaly_grid(valid_time_offset=offset, variable=variable)


@router.get("/statistics")
async def get_anomaly_statistics(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    variable: str = "rainfall",
):
    """Get statistical summary of anomalies in time range."""
    grid = generate_demo_anomaly_grid(variable=variable)
    points = grid["points"]

    if not points:
        return {
            "variable": variable,
            "total_anomalous_cells": 0,
            "mean_score": 0,
            "max_score": 0,
            "severe_count": 0,
            "extreme_count": 0,
        }

    scores = [p["score"] for p in points]
    return {
        "variable": variable,
        "total_anomalous_cells": len(points),
        "mean_score": round(sum(scores) / len(scores), 1),
        "max_score": round(max(scores), 1),
        "severe_count": sum(1 for p in points if p["severity"] in ("SEVERE", "EXTREME")),
        "extreme_count": sum(1 for p in points if p["severity"] == "EXTREME"),
        "watch_count": sum(1 for p in points if p["severity"] == "WATCH"),
        "warning_count": sum(1 for p in points if p["severity"] == "WARNING"),
    }
