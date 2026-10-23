from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..database import get_db
from ..models import ICPModel
from ..schemas import ICPSchema, ICPUpdate
from ..services.prospect_service import ProspectService
from ..schemas import ActivityCreate

router = APIRouter(prefix="/api/v1/icp", tags=["ICP"])


@router.get("", response_model=ICPSchema)
def get_icp(db: Session = Depends(get_db)):
    """Retrieve the current Ideal Customer Profile (ICP) configuration."""
    icp = db.query(ICPModel).first()
    if not icp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ICP settings not configured yet.",
        )
    return ICPSchema(
        company_name=icp.company_name,
        product_name=icp.product_name,
        company_description=icp.company_description,
        value_proposition=icp.value_proposition,
        target_industries=icp.target_industries or [],
        target_roles=icp.target_roles or [],
        target_geographies=icp.target_geographies or [],
        company_size_ranges=icp.company_size_ranges or [],
        funding_stages=icp.funding_stages or [],
        exclusions=icp.exclusions or [],
        primary_pain_point=icp.primary_pain_point,
        last_updated=icp.last_updated,
    )


@router.put("", response_model=ICPSchema)
def update_icp(icp_in: ICPUpdate, db: Session = Depends(get_db)):
    """Update ICP parameters and record in audit trail."""
    icp = db.query(ICPModel).first()
    if not icp:
        icp = ICPModel(
            id=1,
            company_name=icp_in.company_name or "ScoutSpark",
            product_name=icp_in.product_name or "Prospect Intelligence",
            company_description=icp_in.company_description or "",
            value_proposition=icp_in.value_proposition or "",
            primary_pain_point=icp_in.primary_pain_point or "",
            last_updated=datetime.now(timezone.utc).isoformat(),
        )
        db.add(icp)

    data = icp_in.model_dump(exclude_unset=True)
    for key, val in data.items():
        if hasattr(icp, key):
            setattr(icp, key, val)

    now_iso = datetime.now(timezone.utc).isoformat()
    icp.last_updated = now_iso
    db.commit()
    db.refresh(icp)

    # Record activity
    ProspectService.add_activity(
        db,
        ActivityCreate(
            type="icp_updated",
            title="ICP Parameters Tuned",
            description=f"Updated targeting criteria: {len(icp.target_industries or [])} industries, {len(icp.target_roles or [])} roles.",
            user="Founder",
        ),
    )

    return ICPSchema(
        company_name=icp.company_name,
        product_name=icp.product_name,
        company_description=icp.company_description,
        value_proposition=icp.value_proposition,
        target_industries=icp.target_industries or [],
        target_roles=icp.target_roles or [],
        target_geographies=icp.target_geographies or [],
        company_size_ranges=icp.company_size_ranges or [],
        funding_stages=icp.funding_stages or [],
        exclusions=icp.exclusions or [],
        primary_pain_point=icp.primary_pain_point,
        last_updated=icp.last_updated,
    )
