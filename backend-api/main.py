from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.endpoints import ml
from app.core.config import settings
import os

# Create FastAPI app instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered health and nutrition analysis platform with YOLOv8 food detection",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routers
app.include_router(ml.router, prefix="/api/v1/ml", tags=["Machine Learning"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "HealthSphere AI Backend API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "ml_api": "/api/v1/ml",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "HealthSphere AI Backend",
        "ml_model": "YOLOv8 Food Detection",
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.get("/api-info")
async def api_info():
    """Get comprehensive API information"""
    return {
        "api_name": "HealthSphere AI Backend",
        "version": "1.0.0",
        "description": "AI-powered health and nutrition analysis platform",
        "features": [
            "YOLOv8 Food Detection",
            "Real-time Image Analysis",
            "Meal Composition Analysis",
            "RESTful API Interface"
        ],
        "ml_capabilities": {
            "model": "YOLOv8",
            "task": "Object Detection",
            "classes": 30,
            "supported_formats": ["JPG", "PNG", "JPEG"]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
