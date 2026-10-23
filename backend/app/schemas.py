from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, timezone


def to_camel(string: str) -> str:
    components = string.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


# Sub-entities
class ObservedFactSchema(CamelModel):
    id: str
    fact: str
    source: str
    source_url: Optional[str] = None
    date: Optional[str] = None
    verified: bool = True


class HypothesisSchema(CamelModel):
    id: str
    hypothesis: str
    rationale: str
    confidence: Literal["high", "medium", "speculative"] = "medium"


class TargetBuyerSchema(CamelModel):
    name: str
    title: str
    email_placeholder: str = ""
    linkedin_note: str = ""
    role_type: str = "Decision Maker"


class RecommendedAngleSchema(CamelModel):
    hook: str
    value_proposition: str
    suggested_cta: str


class EmailDraftSchema(CamelModel):
    subject: str
    body: str
    customization_variables: Dict[str, str] = Field(default_factory=dict)
    is_approved: bool = False
    approved_at: Optional[str] = None
    approved_by: Optional[str] = None
    notes: Optional[str] = None


# Prospect Schemas
PipelineStageType = Literal[
    "to_research",
    "ready_to_review",
    "approved",
    "contacted",
    "replied",
    "meeting",
    "won",
    "not_a_fit",
]

FitLevelType = Literal["exceptional", "strong", "moderate", "unlikely"]


class ProspectBaseSchema(CamelModel):
    company_name: str
    domain: str
    industry: str
    sub_industry: str = ""
    headquarters: str = ""
    employee_count: str = ""
    stage: str = ""
    fit_score: int = 50
    fit_level: FitLevelType = "moderate"
    fit_reasons: List[str] = Field(default_factory=list)
    summary: str = ""
    pipeline_stage: PipelineStageType = "to_research"
    observed_facts: List[ObservedFactSchema] = Field(default_factory=list)
    hypotheses: List[HypothesisSchema] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    recommended_angle: RecommendedAngleSchema = Field(
        default_factory=lambda: RecommendedAngleSchema(
            hook="", value_proposition="", suggested_cta=""
        )
    )
    target_buyer: TargetBuyerSchema = Field(
        default_factory=lambda: TargetBuyerSchema(name="", title="")
    )
    email_draft: EmailDraftSchema = Field(
        default_factory=lambda: EmailDraftSchema(subject="", body="")
    )
    uncertainty_indicators: List[str] = Field(default_factory=list)
    outcome_notes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    provenance: str = "demo"


class ProspectCreate(CamelModel):
    id: Optional[str] = None
    company_name: str
    domain: str
    industry: str
    sub_industry: Optional[str] = ""
    headquarters: Optional[str] = "Remote"
    employee_count: Optional[str] = "20-50 employees"
    stage: Optional[str] = "Early Stage"
    fit_score: Optional[int] = None
    fit_level: Optional[FitLevelType] = None
    fit_reasons: Optional[List[str]] = None
    summary: Optional[str] = ""
    pipeline_stage: Optional[PipelineStageType] = "to_research"
    observed_facts: Optional[List[ObservedFactSchema]] = None
    hypotheses: Optional[List[HypothesisSchema]] = None
    missing_information: Optional[List[str]] = None
    recommended_angle: Optional[RecommendedAngleSchema] = None
    target_buyer: Optional[TargetBuyerSchema] = None
    email_draft: Optional[EmailDraftSchema] = None
    uncertainty_indicators: Optional[List[str]] = None
    outcome_notes: Optional[str] = None
    tags: Optional[List[str]] = None
    provenance: Optional[str] = "manual"


class ProspectUpdate(CamelModel):
    company_name: Optional[str] = None
    domain: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    headquarters: Optional[str] = None
    employee_count: Optional[str] = None
    stage: Optional[str] = None
    fit_score: Optional[int] = None
    fit_level: Optional[FitLevelType] = None
    fit_reasons: Optional[List[str]] = None
    summary: Optional[str] = None
    pipeline_stage: Optional[PipelineStageType] = None
    observed_facts: Optional[List[ObservedFactSchema]] = None
    hypotheses: Optional[List[HypothesisSchema]] = None
    missing_information: Optional[List[str]] = None
    recommended_angle: Optional[RecommendedAngleSchema] = None
    target_buyer: Optional[TargetBuyerSchema] = None
    email_draft: Optional[EmailDraftSchema] = None
    uncertainty_indicators: Optional[List[str]] = None
    outcome_notes: Optional[str] = None
    tags: Optional[List[str]] = None


class ProspectStageUpdate(CamelModel):
    pipeline_stage: PipelineStageType
    outcome_notes: Optional[str] = None
    user: Optional[str] = "Founder"


class ProspectOutcomeUpdate(CamelModel):
    outcome_notes: str
    user: Optional[str] = "Founder"


class ProspectOut(ProspectBaseSchema):
    id: str
    last_updated: Optional[str] = None

    @classmethod
    def from_model(cls, model):
        last_up = (
            model.updated_at.isoformat()
            if model.updated_at
            else datetime.now(timezone.utc).isoformat()
        )
        return cls(
            id=model.id,
            company_name=model.company_name,
            domain=model.domain,
            industry=model.industry,
            sub_industry=model.sub_industry or "",
            headquarters=model.headquarters or "",
            employee_count=model.employee_count or "",
            stage=model.stage or "",
            fit_score=model.fit_score,
            fit_level=model.fit_level,
            fit_reasons=model.fit_reasons or [],
            summary=model.summary or "",
            pipeline_stage=model.pipeline_stage,
            observed_facts=model.observed_facts or [],
            hypotheses=model.hypotheses or [],
            missing_information=model.missing_information or [],
            recommended_angle=model.recommended_angle or {},
            target_buyer=model.target_buyer or {},
            email_draft=model.email_draft or {},
            uncertainty_indicators=model.uncertainty_indicators or [],
            outcome_notes=model.outcome_notes,
            tags=model.tags or [],
            provenance=model.provenance,
            last_updated=last_up,
        )


# ICP Schemas
class ICPSchema(CamelModel):
    company_name: str
    product_name: str
    company_description: str
    value_proposition: str
    target_industries: List[str] = Field(default_factory=list)
    target_roles: List[str] = Field(default_factory=list)
    target_geographies: List[str] = Field(default_factory=list)
    company_size_ranges: List[str] = Field(default_factory=list)
    funding_stages: List[str] = Field(default_factory=list)
    exclusions: List[str] = Field(default_factory=list)
    primary_pain_point: str
    last_updated: str


class ICPUpdate(CamelModel):
    company_name: Optional[str] = None
    product_name: Optional[str] = None
    company_description: Optional[str] = None
    value_proposition: Optional[str] = None
    target_industries: Optional[List[str]] = None
    target_roles: Optional[List[str]] = None
    target_geographies: Optional[List[str]] = None
    company_size_ranges: Optional[List[str]] = None
    funding_stages: Optional[List[str]] = None
    exclusions: Optional[List[str]] = None
    primary_pain_point: Optional[str] = None


# Activity Schemas
class ActivityCreate(CamelModel):
    type: Literal[
        "approval",
        "pipeline_move",
        "research_signal",
        "draft_edited",
        "icp_updated",
        "prospect_created",
        "csv_imported",
    ]
    title: str
    description: str
    prospect_name: Optional[str] = None
    user: str = "Founder"


class ActivityOut(CamelModel):
    id: str
    timestamp: str
    type: str
    title: str
    description: str
    prospect_name: Optional[str] = None
    user: str = "Founder"


# Outreach Draft Schemas
class OutreachDraftCreate(CamelModel):
    prospect_id: str
    subject: str
    body: str
    customization_variables: Optional[Dict[str, str]] = None
    is_approved: Optional[bool] = False
    notes: Optional[str] = None


class OutreachDraftUpdate(CamelModel):
    subject: Optional[str] = None
    body: Optional[str] = None
    customization_variables: Optional[Dict[str, str]] = None
    is_approved: Optional[bool] = None
    approved_by: Optional[str] = None
    notes: Optional[str] = None


class OutreachDraftOut(CamelModel):
    id: str
    prospect_id: str
    subject: str
    body: str
    customization_variables: Dict[str, str] = Field(default_factory=dict)
    is_approved: bool = False
    approved_at: Optional[str] = None
    approved_by: Optional[str] = None
    notes: Optional[str] = None


# Dashboard Summary Schema
class DashboardSummary(CamelModel):
    total_prospects: int
    pipeline_stage_counts: Dict[str, int]
    priority_shortlist: List[ProspectOut]
    recent_activities: List[ActivityOut]
    signals: List[Dict[str, Any]]
    demo_workspace: bool = True


# CSV Import Result Schema
class ImportErrorDetail(CamelModel):
    row: int
    error: str


class ImportResponse(CamelModel):
    imported_count: int
    error_count: int
    errors: List[ImportErrorDetail] = Field(default_factory=list)
    prospects: List[ProspectOut] = Field(default_factory=list)
