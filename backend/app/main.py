"""
FastAPI Main Application
FRA Atlas - AI-powered Forest Rights Act Atlas and Decision Support System
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.documents import router as documents_router
from app.api.geospatial import router as geospatial_router
from app.api.ml_inference import router as ml_router
from app.api.dss import router as dss_router
from app.api.government_data import router as gov_data_router
from app.core.database import engine, Base
from app.middleware.security import (
    SecurityHeadersMiddleware, 
    RateLimitMiddleware, 
    RequestLoggingMiddleware,
    FileUploadSecurityMiddleware
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    print("🚀 Starting FRA Atlas FastAPI Services...")
    
    # Try to create database tables, but don't fail if database is unavailable
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created/verified")
    except Exception as e:
        print(f"⚠️ Database connection failed: {e}")
        print("🔄 Starting in database-free mode...")
    
    print("✅ FRA Atlas services are ready!")
    
    yield
    
    # Shutdown
    print("🔄 Shutting down FRA Atlas services...")
    try:
        await engine.dispose()
    except Exception as e:
        print(f"⚠️ Database cleanup failed: {e}")
    print("✅ Shutdown complete")


# Initialize FastAPI app
app = FastAPI(
    title="FRA Atlas API Services",
    description="""
    AI-powered Forest Rights Act Atlas and Decision Support System
    
    ## Features
    
    * **Document Processing**: OCR and NER extraction from FRA documents
    * **Geospatial Data**: Village boundaries, claim mappings, asset detection
    * **ML Inference**: Asset detection from satellite imagery
    * **Decision Support**: CSS scheme recommendations and prioritization
    * **Government Data**: Real-time integration with official FRA APIs
    
    ## Target States
    - Madhya Pradesh
    - Tripura
    - Odisha
    - Telangana
    """,
    version="1.0.0",
    contact={
        "name": "SIH 2024 Team",
        "email": "fra-atlas@sih2024.gov.in",
    },
    lifespan=lifespan
)

# Security middleware - Order matters!
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(FileUploadSecurityMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.ALLOWED_HOSTS
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language", 
        "Content-Type",
        "Authorization",
        "X-Requested-With"
    ],
)


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "🌲 FRA Atlas API Services",
        "version": "1.0.0",
        "status": "operational",
        "description": "AI-powered Forest Rights Act Atlas and Decision Support System"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for load balancers and monitoring"""
    try:
        # Check database connection
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": settings.get_current_timestamp()
        }
    except Exception as e:
        # Return degraded status instead of error for demo purposes
        return {
            "status": "degraded",
            "database": "disconnected",
            "warning": "Database unavailable - running in demo mode",
            "timestamp": settings.get_current_timestamp()
        }


# Include API routers
app.include_router(
    documents_router,
    prefix="/api/documents",
    tags=["Document Processing"]
)

app.include_router(
    geospatial_router,
    prefix="/api/geospatial",
    tags=["Geospatial Data"]
)

app.include_router(
    ml_router,
    prefix="/api/ml",
    tags=["ML Inference"]
)

app.include_router(
    dss_router,
    prefix="/api/dss",
    tags=["Decision Support System"]
)

app.include_router(
    gov_data_router,
    prefix="/api/government",
    tags=["Government Data"]
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )