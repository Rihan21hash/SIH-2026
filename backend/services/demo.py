"""
Demo Data Fallback Service
Loads pre-configured extreme weather events from data/demo/events.json
"""
import json
import os
from pathlib import Path
from typing import List, Dict, Any

DEMO_FILE_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "demo" / "events.json"

def get_demo_events_raw() -> List[Dict[str, Any]]:
    """Loads static demo events from json file."""
    if os.path.exists(DEMO_FILE_PATH):
        try:
            with open(DEMO_FILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("events", [])
        except Exception as e:
            print(f"Failed to read demo events file: {e}")
    return []
