# AeroWatch

### AI-Powered Extreme Weather Intelligence & Operational Command Center
**SIH Problem Statement ID: SIH26078** — *AI-Driven Spatio-Temporal Tracking of Extreme Weather Anomalies in Medium-Range Forecasts*

---

## 1. Problem Statement (SIH26078)
Medium-range numerical weather prediction (NWP) models generate massive quantities of multi-variable gridded forecast data (temperature, surface pressure, precipitation, and wind fields). However, operational meteorologists and disaster response authorities face critical bottlenecks:
- **Raw Numerical Deluge:** Identifying developing extreme events (cyclones, cloudbursts, severe heatwaves, and urban flash floods) 24–72 hours in advance requires time-consuming manual spatial cross-examination.
- **Explainability Gap:** Traditional alert systems issue black-box warnings without communicating the statistical significance or multi-variable atmospheric drivers behind an anomaly.
- **Spatio-Temporal Discontinuity:** Isolated spatial point alerts fail to track the continuous spatial growth, track trajectory, persistence, and projected landfall/impact horizon of evolving meteorological phenomena.

## 2. Solution: AeroWatch
**AeroWatch** transforms raw global/regional medium-range forecast streams into actionable operational intelligence. Engineered for mission-critical command-and-control operations, AeroWatch provides:
1. **Explainable Anomaly Pipeline:** Continuous statistical z-score deviation analysis against 30-day regional climatological baselines.
2. **Spatio-Temporal Trajectory Tracking:** Physics-informed spatial displacement modeling across medium-range horizons (`NOW/T0` through `T+72h`).
3. **Composite Risk Scoring & Confidence:** Normalized 0–100 risk scoring with driver contribution breakdowns and multi-signal confidence estimation.
4. **Mission-Grade HUD Command Center:** An ultra-dense, low-latency cartographic situational awareness interface reproducing the **AeroDark Intelligence** HUD design system.
5. **₹0 Cost Architecture:** Built 100% on free/open-source technologies, public APIs (Open-Meteo), and locally cached GeoJSON boundaries.

---

## 3. Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │             METEOROLOGICAL DATA INGESTION              │
       │    Open-Meteo Free API (Live) + Local Demo Cache       │
       └──────────────────────────┬─────────────────────────────┘
                                  │ Raw Hourly Forecasts
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             STATISTICAL ANOMALY ENGINE                 │
       │   z = (Observed - Baseline_Mean) / Baseline_StdDev     │
       │   (Temperature, Rainfall, Wind Speed, Pressure)        │
       └──────────────────────────┬─────────────────────────────┘
                                  │ Anomaly Readings & Z-Scores
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             EXTREME EVENT CLASSIFICATION               │
       │  Hazard Identification (Cyclone, Heatwave, Flood, etc.)│
       └──────────────────────────┬─────────────────────────────┘
                                  │ Classified Hazards
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             SPATIO-TEMPORAL TRACKING ENGINE            │
       │ Multi-timestep Trajectory Modeling (T0 to T+72h)       │
       └──────────────────────────┬─────────────────────────────┘
                                  │ Trajectories & Growth
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             COMPOSITE RISK & CONFIDENCE SCORER         │
       │  Normalized 0–100 Score + Multi-Signal Consistency %   │
       └──────────────────────────┬─────────────────────────────┘
                                  │ JSON Stream
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             AEROWATCH C2 COMMAND DASHBOARD             │
       │   Next.js 14 HUD, MapLibre GL JS, Recharts, TopNav     │
       └────────────────────────────────────────────────────────┘
```

---

## 4. Key Features

- **Live Telemetry & Synoptic Cycle HUD:** Real-time system health chips, UTC synoptic forecast cycle tracker (`00Z`, `06Z`, `12Z`, `18Z`), data mode indicator (`LIVE` / `DEMO`), and update recency.
- **KPI Status Area:** High-visibility cards displaying Active Events, High Risk Events, Severe Events, Affected Districts count, Maximum Risk Score, and Forecast Lead Horizon.
- **Interactive India Cartographic Map:** Powered by MapLibre GL JS with India state boundaries, risk-radii circles, active pulsing rings, hover tooltips, and click-to-focus event selection.
- **Event Intelligence Panel:** Comprehensive metadata detailing hazard category, start timestamp, expected duration, spatial area (km²), movement direction/speed, and affected districts chips.
- **"Why Was This Event Flagged?" Anomaly Breakdown:** Direct visual bars showing exact percentage and unit deviations:
  - Rainfall Anomaly (`+%` or `-%`)
  - Temperature Anomaly (`+°C`)
  - Wind Speed Anomaly (`+%`)
  - Surface Pressure Anomaly (`Δ hPa`)
  - Persistence (days active)
  - Spatial Growth Rate (`+% / 24h`)
- **Forecast Scrubber & Animation:** Interactive timeline (`NOW`, `+12h`, `+24h`, `+36h`, `+48h`, `+72h`) with play/pause and step controls.
- **Dual Mode (`LIVE` / `DEMO`):** Seamless toggle between live Open-Meteo telemetry and a comprehensive offline SIH scenario dataset.

---

## 5. Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom **AeroDark Intelligence** tokens
- **Cartography:** MapLibre GL JS
- **Visualizations:** Recharts & Material Symbols Icons

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Server:** Uvicorn (ASGI)
- **Networking:** Async HTTPX
- **Validation:** Pydantic v2
- **Data & Computation:** NumPy & Pandas

---

## 6. Mathematical Methodology

### 1. Statistical Anomaly Formulation
For every observation $x_{i,t}$ of atmospheric parameter $i \in \{\text{temp}, \text{rain}, \text{wind}, \text{pressure}\}$ at location $l$:
$$z_{i} = \frac{x_{i,t} - \mu_{i,l}}{\sigma_{i,l}}$$
Where $\mu_{i,l}$ is the 30-day climatological seasonal baseline mean and $\sigma_{i,l}$ is the baseline standard deviation.

### 2. Composite Risk Score ($0 \le \text{Risk} \le 100$)
$$\text{Risk} = \frac{\sum_{k} w_k \cdot f_k(\text{Driver}_k)}{\sum_k w_k} \times 100$$
- $w_{\text{rain}} = 2.0$, $w_{\text{wind}} = 1.8$, $w_{\text{temp}} = 1.5$, $w_{\text{press}} = 1.2$, $w_{\text{persist}} = 1.0$, $w_{\text{extent}} = 0.8$.
- Categorical thresholds: `0–20 LOW`, `21–40 MODERATE`, `41–60 ELEVATED`, `61–80 HIGH`, `81–100 SEVERE`.

---

## 7. Installation & Local Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### Clone the Repository
```bash
git clone <repository_url>
cd SIH
```

### Backend Setup
```bash
# Optional: Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI backend server
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be live at `http://localhost:8000` (Docs: `http://localhost:8000/docs`).

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev -- -p 3000
```
Open `http://localhost:3000` in your web browser.

---

## 8. Project Structure

```text
SIH/
├── backend/
│   ├── main.py                # FastAPI entrypoint, middleware, CORS
│   ├── config.py              # Centralized thresholds and risk weights
│   ├── requirements.txt       # Python dependencies
│   ├── models/
│   │   └── schemas.py         # Pydantic v2 schemas and API response types
│   ├── services/
│   │   ├── open_meteo.py      # Async Open-Meteo client with in-memory caching
│   │   ├── anomaly.py         # Statistical z-score anomaly calculation
│   │   ├── risk.py            # Normalized 0–100 risk scoring & confidence
│   │   ├── tracking.py        # Spatio-temporal multi-timestep trajectory modeling
│   │   └── events.py          # Extreme event classification and clustering
│   └── routes/
│       ├── health.py          # Health check endpoint
│       ├── events.py          # Events querying and timeline endpoints
│       ├── forecast.py        # Operational telemetry and forecast grid data
│       ├── anomalies.py       # Raw meteorological anomaly scores
│       └── timeline.py        # Synchronized multi-event timeline slices
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Global layout and font preloading
│   │   ├── page.tsx           # Command Center main dashboard
│   │   └── globals.css        # AeroDark Intelligence HUD styling and effects
│   ├── components/
│   │   ├── layout/            # TopNav, SideNav
│   │   ├── dashboard/         # KPICard
│   │   ├── map/               # MapLibre India Map with boundaries
│   │   ├── events/            # EventList, EventPanel, AnomalyDrivers
│   │   ├── timeline/          # ForecastTimeline scrubber & animation
│   │   └── charts/            # AnomalyChart risk trajectory
│   ├── lib/
│   │   ├── api.ts             # API client with timeout & fallback logic
│   │   └── demo-data.ts       # Standalone realistic offline demo dataset
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces
│   ├── public/
│   │   └── india_states.geojson # High-fidelity India state cartography
│   ├── tailwind.config.ts     # AeroDark color tokens, fonts, and shadows
│   └── package.json
│
├── data/
│   ├── boundaries/            # Locally stored GeoJSON state boundaries
│   └── demo/
│       └── events.json        # SIH Ground Truth scenario dataset
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 9. Live vs. Demo Mode

- **Live Mode:** Connects to Open-Meteo's API across representative Indian meteorological stations, runs the real-time statistical anomaly engine, and visualizes live detected events.
- **Demo Mode:** Loads a pre-configured multi-event SIH presentation scenario (including a Severe Bay of Bengal Cyclone, Rajasthan Heatwave, Kerala Flood, and Himalayan Cloudburst) with complete spatio-temporal tracks for reliable demonstrations without active internet access.
- **Graceful Fallback:** If the external weather API becomes temporarily unreachable or network connectivity is lost, AeroWatch automatically switches to DEMO mode with a non-blocking HUD notice, ensuring 100% presentation uptime.

---

## 10. License & Compliance
Developed for **Smart India Hackathon (SIH26078)**. Distributed under the MIT Open Source License. Built at **₹0 cost** utilizing open data and open-source software libraries.
