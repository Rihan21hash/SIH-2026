# AeroWatch — Local Development Guide

## Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- Docker & Docker Compose (Optional for full DB setup)

---

## 1. Quick Start (Frontend + Backend)

### Backend Setup
```bash
# From repository root:
cd aerowatch
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend/requirements.txt

# Run FastAPI backend with hot reloading
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
# In a new terminal:
cd aerowatch/frontend
npm install
npm run dev
```

Visit:
- **C2 Command Center Dashboard**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 2. Running Automated Tests

```bash
# Run backend & ML test suite
cd aerowatch
python -m pytest tests/ -v
```

---

## 3. Training the ML Model

```bash
cd aerowatch
python -m ml.training.train_xgboost
```
