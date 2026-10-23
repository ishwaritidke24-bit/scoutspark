from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..schemas import (
    OutreachDraftOut,
    OutreachDraftCreate,
    OutreachDraftUpdate,
)
from ..services.prospect_service import ProspectService

router = APIRouter(prefix="/api/v1/outreach-drafts", tags=["Outreach Drafts"])


@router.get("", response_model=List[OutreachDraftOut])
def list_outreach_drafts(
    prospect_id: Optional[str] = Query(None, description="Filter by prospect ID"),
    db: Session = Depends(get_db),
):
    """Retrieve outreach drafts, optionally filtered by prospect ID."""
    drafts = ProspectService.get_outreach_drafts(db, prospect_id)
    return [
        OutreachDraftOut(
            id=d.id,
            prospect_id=d.prospect_id,
            subject=d.subject,
            body=d.body,
            customization_variables=d.customization_variables or {},
            is_approved=d.is_approved,
            approved_at=d.approved_at,
            approved_by=d.approved_by,
            notes=d.notes,
        )
        for d in drafts
    ]


@router.post("", response_model=OutreachDraftOut, status_code=status.HTTP_201_CREATED)
def create_outreach_draft(
    draft_in: OutreachDraftCreate, db: Session = Depends(get_db)
):
    """Create a new reviewable outreach draft for a prospect."""
    draft = ProspectService.create_outreach_draft(db, draft_in)
    return OutreachDraftOut(
        id=draft.id,
        prospect_id=draft.prospect_id,
        subject=draft.subject,
        body=draft.body,
        customization_variables=draft.customization_variables or {},
        is_approved=draft.is_approved,
        approved_at=draft.approved_at,
        approved_by=draft.approved_by,
        notes=draft.notes,
    )


@router.patch("/{draft_id}", response_model=OutreachDraftOut)
def update_outreach_draft(
    draft_id: str,
    draft_patch: OutreachDraftUpdate,
    db: Session = Depends(get_db),
):
    """Update draft subject, message body, or record human approval."""
    draft = ProspectService.update_outreach_draft(db, draft_id, draft_patch)
    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Outreach draft with ID '{draft_id}' not found.",
        )
    return OutreachDraftOut(
        id=draft.id,
        prospect_id=draft.prospect_id,
        subject=draft.subject,
        body=draft.body,
        customization_variables=draft.customization_variables or {},
        is_approved=draft.is_approved,
        approved_at=draft.approved_at,
        approved_by=draft.approved_by,
        notes=draft.notes,
    )
