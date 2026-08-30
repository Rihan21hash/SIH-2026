"""AeroWatch — Operational Weather Intelligence API"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from backend.config import settings
from backend.api import events, risk, anomalies, alerts, system, forecasts

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AeroWatch API",
    description="Operational Weather Intelligence Command & Control API",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(events.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(anomalies.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(system.router, prefix="/api")
app.include_router(forecasts.router, prefix="/api")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Graceful error responses with demo mode fallback info."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "demo_mode_fallback": settings.DEMO_MODE,
            "message": str(exc) if settings.DEBUG else None,
        },
    )


@app.on_event("startup")
async def startup_event():
    logger.info("AeroWatch API starting up")
    logger.info(f"Demo mode: {settings.DEMO_MODE}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("AeroWatch API shutting down")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
