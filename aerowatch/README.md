# AeroWatch 🛰️⚡
### AI-Driven Operational Weather Intelligence Command & Control Center
**Smart India Hackathon 2026 — Problem SIH26078**

---

## 🌟 Executive Summary

**AeroWatch** transforms raw meteorological forecasts and observational datasets into high-fidelity, actionable operational intelligence for disaster management authorities, municipal emergency services, and critical infrastructure operators.

```
Detect (Z-Score + Percentile) ➔ Track (Connected Components) ➔ Quantify (Risk 0-100) ➔ Explain (SHAP XAI) ➔ Warn (C2 Alert Center)
```

---

## 🚀 Key Capabilities

- **Military-Grade C2 Interface**: High-density tactical dark theme with dynamic situational awareness cards, interactive radar scan overlays, and real-time operator desks.
- **Hybrid Anomaly Engine**: Combines climatological normal Z-scores with historical percentile ranks (p99/p05) for high-sensitivity anomaly detection without false alarms.
- **Temporal Event Tracking**: Employs spatial connected components clustering and IoU/haversine trajectory matching across 120-hour forecast horizons.
- **Explainable AI (XAI)**: Native SHAP integration breaks down atmospheric drivers (rainfall volume, pressure deficits, humidity saturation, wind shear).
- **Composite Multi-Factorial Risk Scoring**: Computes calibrated 0–100 risk indices factoring hazard intensity, spatial extent, persistence window, growth rate, and forecast confidence.
- **Operational Warning Dispatch**: Priority-graded warning dispatch with operator acknowledgment workflows.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, MapLibre GL, Recharts |
| **Backend** | FastAPI, Python 3.11, Uvicorn, SQLAlchemy, Pydantic v2 |
| **ML & Data** | XGBoost, scikit-learn, SHAP, NumPy, Pandas, SciPy |
| **Database** | PostgreSQL 15+, PostGIS Spatial Extension, Redis |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## ⚡ Quick Start

### 1. Launch with Docker Compose
```bash
docker compose up --build
```
Access the dashboard at `http://localhost:3000` and the API documentation at `http://localhost:8000/docs`.

### 2. Run Manually (Local Development)
```bash
# Terminal 1: Backend
pip install -r backend/requirements.txt
uvicorn backend.main:app --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing Suite

```bash
# Execute unit & API integration tests
pytest tests/ -v
```

---

## 📚 Documentation Links
- [REST API Specifications](docs/API.md)
- [Database Schema & ERD](docs/DATABASE.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Local Development Guide](docs/DEVELOPMENT.md)
- [Cloud Deployment Guide](docs/DEPLOYMENT.md)

---

© 2026 AeroWatch Team — Smart India Hackathon.
