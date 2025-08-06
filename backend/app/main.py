from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import sys

from app.config import settings
from app.api.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("api.log")
    ]
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Sketch to Reality API",
    description="API for converting sketches to realistic images using Stable Diffusion",
    version="1.0.0",
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Sketch to Reality API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.on_event("startup")
async def startup_event():
    """Startup event handler."""
    logger.info("Starting Sketch to Reality API...")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"Stable Diffusion WebUI URL: {settings.SD_WEBUI_URL}")
    logger.info(f"Upload directory: {settings.UPLOAD_DIR}")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler."""
    logger.info("Shutting down Sketch to Reality API...")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )