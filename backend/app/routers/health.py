from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from ..config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
@router.get("/api/v1/health")
def check_health(db: Session = Depends(get_db)):
    """Health check endpoint validating API and database connectivity."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "app": settings.app_name,
        "version": settings.version,
        "database": db_status,
        "demo_mode": settings.demo_mode,
    }
