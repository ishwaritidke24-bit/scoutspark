from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import ActivityOut
from ..services.prospect_service import ProspectService

router = APIRouter(prefix="/api/v1/activities", tags=["Activities"])


@router.get("", response_model=List[ActivityOut])
def get_activities(
    limit: int = Query(20, ge=1, le=100, description="Max activities to return"),
    db: Session = Depends(get_db),
):
    """Retrieve audit trail of recent human actions and research detections."""
    acts = ProspectService.get_activities(db, limit=limit)
    return [
        ActivityOut(
            id=a.id,
            timestamp=a.timestamp,
            type=a.type,
            title=a.title,
            description=a.description,
            prospect_name=a.prospect_name,
            user=a.user,
        )
        for a in acts
    ]
