from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone
import uuid

from ..models import ProspectModel, ActivityModel, OutreachDraftModel, ICPModel
from ..schemas import (
    ProspectCreate,
    ProspectUpdate,
    ProspectStageUpdate,
    ProspectOutcomeUpdate,
    OutreachDraftCreate,
    OutreachDraftUpdate,
    ActivityCreate,
)
from .scoring_service import calculate_icp_score


class ProspectService:
    @staticmethod
    def get_prospects(
        db: Session,
        query: Optional[str] = None,
        industry: Optional[str] = None,
        min_fit_score: Optional[int] = None,
        pipeline_stage: Optional[str] = None,
        sort_by: Optional[str] = "fit_score",
        sort_direction: Optional[str] = "desc",
    ) -> List[ProspectModel]:
        q = db.query(ProspectModel)

        # Search filter
        if query and query.strip():
            term = f"%{query.strip().lower()}%"
            q = q.filter(
                or_(
                    ProspectModel.company_name.ilike(term),
                    ProspectModel.domain.ilike(term),
                    ProspectModel.industry.ilike(term),
                    ProspectModel.sub_industry.ilike(term),
                    ProspectModel.summary.ilike(term),
                )
            )

        # Industry filter
        if industry and industry.lower() != "all":
            q = q.filter(ProspectModel.industry == industry)

        # Pipeline stage filter
        if pipeline_stage and pipeline_stage.lower() != "all":
            q = q.filter(ProspectModel.pipeline_stage == pipeline_stage)

        # Min fit score
        if min_fit_score is not None and min_fit_score > 0:
            q = q.filter(ProspectModel.fit_score >= min_fit_score)

        # Sorting
        sort_map = {
            "fit_score": ProspectModel.fit_score,
            "fitScore": ProspectModel.fit_score,
            "company_name": ProspectModel.company_name,
            "companyName": ProspectModel.company_name,
            "name": ProspectModel.company_name,
            "updated_at": ProspectModel.updated_at,
            "created_at": ProspectModel.created_at,
        }
        sort_column = sort_map.get(sort_by, ProspectModel.fit_score)
        if sort_direction and sort_direction.lower() == "asc":
            q = q.order_by(asc(sort_column))
        else:
            q = q.order_by(desc(sort_column))

        return q.all()

    @staticmethod
    def get_prospect_by_id(db: Session, prospect_id: str) -> Optional[ProspectModel]:
        return db.query(ProspectModel).filter(ProspectModel.id == prospect_id).first()

    @staticmethod
    def create_prospect(
        db: Session,
        prospect_in: ProspectCreate,
    ) -> ProspectModel:
        # Get ICP for deterministic baseline scoring if score wasn't explicitly supplied
        fit_score = prospect_in.fit_score
        fit_level = prospect_in.fit_level
        fit_reasons = prospect_in.fit_reasons or []
        missing_info = prospect_in.missing_information or []

        if fit_score is None:
            icp_record = db.query(ICPModel).first()
            icp_dict = {}
            if icp_record:
                icp_dict = {
                    "target_industries": icp_record.target_industries or [],
                    "target_roles": icp_record.target_roles or [],
                    "target_geographies": icp_record.target_geographies or [],
                    "exclusions": icp_record.exclusions or [],
                }
            score_res = calculate_icp_score(prospect_in.model_dump(), icp_dict)
            fit_score = score_res["fit_score"]
            fit_level = score_res["fit_level"]
            fit_reasons = score_res["fit_reasons"]
            missing_info = score_res["missing_information"]

        prospect_id = prospect_in.id or f"prospect-{uuid.uuid4().hex[:8]}"

        observed_facts = [
            f.model_dump() for f in (prospect_in.observed_facts or [])
        ]
        hypotheses = [
            h.model_dump() for h in (prospect_in.hypotheses or [])
        ]
        recommended_angle = (
            prospect_in.recommended_angle.model_dump()
            if prospect_in.recommended_angle
            else {"hook": "", "valueProposition": "", "suggestedCta": ""}
        )
        target_buyer = (
            prospect_in.target_buyer.model_dump()
            if prospect_in.target_buyer
            else {"name": "", "title": ""}
        )
        email_draft = (
            prospect_in.email_draft.model_dump()
            if prospect_in.email_draft
            else {
                "subject": f"Quick note regarding {prospect_in.company_name}",
                "body": f"Hi,\n\nNoticed your work at {prospect_in.company_name}.",
                "customizationVariables": {},
                "isApproved": False,
            }
        )

        db_prospect = ProspectModel(
            id=prospect_id,
            company_name=prospect_in.company_name,
            domain=prospect_in.domain,
            industry=prospect_in.industry,
            sub_industry=prospect_in.sub_industry or "",
            headquarters=prospect_in.headquarters or "Remote",
            employee_count=prospect_in.employee_count or "20-50 employees",
            stage=prospect_in.stage or "Early Stage",
            fit_score=fit_score,
            fit_level=fit_level or "moderate",
            fit_reasons=fit_reasons,
            summary=prospect_in.summary or "",
            pipeline_stage=prospect_in.pipeline_stage or "to_research",
            observed_facts=observed_facts,
            hypotheses=hypotheses,
            missing_information=missing_info,
            uncertainty_indicators=prospect_in.uncertainty_indicators or [],
            recommended_angle=recommended_angle,
            target_buyer=target_buyer,
            email_draft=email_draft,
            tags=prospect_in.tags or [],
            outcome_notes=prospect_in.outcome_notes,
            provenance=prospect_in.provenance or "manual",
        )

        db.add(db_prospect)
        db.commit()
        db.refresh(db_prospect)

        # Log activity
        ProspectService.add_activity(
            db,
            ActivityCreate(
                type="prospect_created",
                title="Account Added to ScoutSpark",
                description=f"Added {db_prospect.company_name} ({db_prospect.industry}) with {db_prospect.fit_score}% fit score.",
                prospect_name=db_prospect.company_name,
                user="Founder",
            ),
        )

        return db_prospect

    @staticmethod
    def update_prospect(
        db: Session,
        prospect_id: str,
        update_in: ProspectUpdate,
    ) -> Optional[ProspectModel]:
        p = ProspectService.get_prospect_by_id(db, prospect_id)
        if not p:
            return None

        data = update_in.model_dump(exclude_unset=True)
        for key, val in data.items():
            if hasattr(p, key):
                setattr(p, key, val)

        p.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(p)
        return p

    @staticmethod
    def update_stage(
        db: Session,
        prospect_id: str,
        stage_in: ProspectStageUpdate,
    ) -> Optional[ProspectModel]:
        p = ProspectService.get_prospect_by_id(db, prospect_id)
        if not p:
            return None

        old_stage = p.pipeline_stage
        p.pipeline_stage = stage_in.pipeline_stage
        if stage_in.outcome_notes is not None:
            p.outcome_notes = stage_in.outcome_notes

        p.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(p)

        # Record activity
        stage_label = stage_in.pipeline_stage.replace("_", " ").title()
        ProspectService.add_activity(
            db,
            ActivityCreate(
                type="pipeline_move",
                title=f"Stage Updated to {stage_label}",
                description=f"Moved {p.company_name} from {old_stage} to {stage_label}.",
                prospect_name=p.company_name,
                user=stage_in.user or "Founder",
            ),
        )

        return p

    @staticmethod
    def update_outcome(
        db: Session,
        prospect_id: str,
        outcome_in: ProspectOutcomeUpdate,
    ) -> Optional[ProspectModel]:
        p = ProspectService.get_prospect_by_id(db, prospect_id)
        if not p:
            return None

        p.outcome_notes = outcome_in.outcome_notes
        p.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(p)

        ProspectService.add_activity(
            db,
            ActivityCreate(
                type="draft_edited",
                title="Outcome Notes Recorded",
                description=f"Updated outcome for {p.company_name}: '{outcome_in.outcome_notes}'.",
                prospect_name=p.company_name,
                user=outcome_in.user or "Founder",
            ),
        )

        return p

    @staticmethod
    def delete_prospect(db: Session, prospect_id: str) -> bool:
        p = ProspectService.get_prospect_by_id(db, prospect_id)
        if not p:
            return False
        db.delete(p)
        db.commit()
        return True

    @staticmethod
    def get_activities(db: Session, limit: int = 20) -> List[ActivityModel]:
        return (
            db.query(ActivityModel)
            .order_by(desc(ActivityModel.created_at))
            .limit(limit)
            .all()
        )

    @staticmethod
    def add_activity(db: Session, act_in: ActivityCreate) -> ActivityModel:
        act_id = f"act-{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc)
        act = ActivityModel(
            id=act_id,
            timestamp="Just now",
            type=act_in.type,
            title=act_in.title,
            description=act_in.description,
            prospect_name=act_in.prospect_name,
            user=act_in.user,
            created_at=now,
        )
        db.add(act)
        db.commit()
        db.refresh(act)
        return act

    @staticmethod
    def get_outreach_drafts(
        db: Session, prospect_id: Optional[str] = None
    ) -> List[OutreachDraftModel]:
        q = db.query(OutreachDraftModel)
        if prospect_id:
            q = q.filter(OutreachDraftModel.prospect_id == prospect_id)
        return q.order_by(desc(OutreachDraftModel.updated_at)).all()

    @staticmethod
    def create_outreach_draft(
        db: Session, draft_in: OutreachDraftCreate
    ) -> OutreachDraftModel:
        draft_id = f"draft-{uuid.uuid4().hex[:8]}"
        draft = OutreachDraftModel(
            id=draft_id,
            prospect_id=draft_in.prospect_id,
            subject=draft_in.subject,
            body=draft_in.body,
            customization_variables=draft_in.customization_variables or {},
            is_approved=draft_in.is_approved or False,
            notes=draft_in.notes,
        )
        db.add(draft)
        
        # Also sync to prospect's email_draft field
        p = ProspectService.get_prospect_by_id(db, draft_in.prospect_id)
        if p:
            p.email_draft = {
                "subject": draft.subject,
                "body": draft.body,
                "customizationVariables": draft.customization_variables,
                "isApproved": draft.is_approved,
                "notes": draft.notes,
            }
            p.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(draft)
        return draft

    @staticmethod
    def update_outreach_draft(
        db: Session, draft_id: str, patch_in: OutreachDraftUpdate
    ) -> Optional[OutreachDraftModel]:
        draft = (
            db.query(OutreachDraftModel)
            .filter(OutreachDraftModel.id == draft_id)
            .first()
        )
        if not draft:
            return None

        data = patch_in.model_dump(exclude_unset=True)
        for key, val in data.items():
            if hasattr(draft, key):
                setattr(draft, key, val)

        if patch_in.is_approved is True and not draft.approved_at:
            draft.approved_at = datetime.now(timezone.utc).isoformat()
            draft.approved_by = patch_in.approved_by or "Founder (Human Verified)"

        draft.updated_at = datetime.now(timezone.utc)

        # Sync back to prospect
        p = ProspectService.get_prospect_by_id(db, draft.prospect_id)
        if p:
            from sqlalchemy.orm.attributes import flag_modified
            p_draft = dict(p.email_draft or {})
            p_draft.update(
                {
                    "subject": draft.subject,
                    "body": draft.body,
                    "isApproved": draft.is_approved,
                    "approvedAt": draft.approved_at,
                    "approvedBy": draft.approved_by,
                    "notes": draft.notes,
                }
            )
            p.email_draft = p_draft
            flag_modified(p, "email_draft")
            if draft.is_approved and p.pipeline_stage in [
                "to_research",
                "ready_to_review",
            ]:
                p.pipeline_stage = "approved"
            p.updated_at = datetime.now(timezone.utc)

            ProspectService.add_activity(
                db,
                ActivityCreate(
                    type="approval",
                    title="Outreach Approved by Human",
                    description=f"Approved message draft for {p.company_name}. Ready for founder outbound.",
                    prospect_name=p.company_name,
                    user=draft.approved_by or "Founder",
                ),
            )

        db.commit()
        db.refresh(draft)
        return draft
