"""
AeroWatch — Backend Application Entrypoint
FastAPI Operational Weather Intelligence & Command Server (SIH26078)
"""
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from backend.routes.health import router as health_router
from backend.routes.events import router as events_router
from backend.routes.forecast import router as forecast_router
from backend.routes.anomalies import router as anomalies_router
from backend.routes.timeline import router as timeline_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("aerowatch.main")

app = FastAPI(
    title="AeroWatch API",
    description="AI-Driven Spatio-Temporal Tracking of Extreme Weather Anomalies in Medium-Range Forecasts (SIH26078)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration — allow frontend development origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error occurred in weather intelligence engine",
            "detail": str(exc)
        }
    )

# Include route modules
app.include_router(health_router)
app.include_router(events_router)
app.include_router(forecast_router)
app.include_router(anomalies_router)
app.include_router(timeline_router)


@app.on_event("startup")
async def startup_event():
    logger.info("====================================================================")
    logger.info("AeroWatch Extreme Weather Intelligence Command Center API Started")
    logger.info("Data Provider: Open-Meteo (Free Open Meteorological API - ₹0 cost)")
    logger.info("Endpoints: /health, /api/status, /api/events, /api/anomalies, /api/timeline")
    logger.info("====================================================================")


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
