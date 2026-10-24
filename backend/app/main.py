from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import engine, SessionLocal, Base
from .seed import seed_database
from .routers import health, dashboard, prospects, icp, outreach, activities, research


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

# CORS configuration supporting deployed origins and Vercel preview environments
allow_credentials = False if ("*" in settings.cors_origins) else True

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=allow_credentials,
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
app.include_router(research.router)


@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "version": settings.version,
        "docs_url": "/docs",
        "health_url": "/health",
        "demo_workspace": True,
    }


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    app_module = "backend.app.main:app" if os.path.exists("backend") else "app.main:app"
    uvicorn.run(app_module, host="0.0.0.0", port=port)

