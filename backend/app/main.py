from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import engine, SessionLocal, Base
from .seed import seed_database
from .routers import health, dashboard, prospects, icp, outreach, activities


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Run idempotent seeding
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
        
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="ScoutSpark B2B Prospect Intelligence & Customer Acquisition API",
    lifespan=lifespan,
)

# CORS configuration strictly bound to expected frontend origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(prospects.router)
app.include_router(icp.router)
app.include_router(outreach.router)
app.include_router(activities.router)


@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "version": settings.version,
        "docs_url": "/docs",
        "health_url": "/health",
        "demo_workspace": True,
    }
