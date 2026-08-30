"""API integration tests using FastAPI TestClient."""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_list_events():
    response = client.get("/api/events/")
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    assert len(events) > 0
    assert "event_id" in events[0]


def test_get_event_detail():
    response = client.get("/api/events/AW-001")
    assert response.status_code == 200
    event = response.json()
    assert event["event_id"] == "AW-001"
    assert "risk_score" in event


def test_get_event_drivers():
    response = client.get("/api/events/AW-001/drivers")
    assert response.status_code == 200
    drivers = response.json()
    assert "drivers" in drivers


def test_risk_summary():
    response = client.get("/api/risk/summary")
    assert response.status_code == 200
    summary = response.json()
    assert "active_events" in summary
    assert "max_risk_score" in summary


def test_list_alerts():
    response = client.get("/api/alerts/")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)


def test_acknowledge_alert():
    response = client.post("/api/alerts/ALT-001/acknowledge")
    assert response.status_code == 200
    data = response.json()
    assert data["acknowledged"] is True


def test_system_status():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    status = response.json()
    assert status["data_ingestion"] == "HEALTHY"
    assert status["demo_mode"] is True
