from typing import TypedDict, List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SourceReference(BaseModel):
    source_id: str
    url: str
    title: str = ""
    snippet: str = ""
    provider: str = "tavily"
    published_date: Optional[str] = None
    retrieved_at: str


class ExtractedFact(BaseModel):
    fact: str
    source_ids: List[str] = Field(default_factory=list)
    source_url: Optional[str] = None
    date: Optional[str] = None
    verified: bool = True


class ExtractedHypothesis(BaseModel):
    hypothesis: str
    rationale: str
    confidence: str = "medium"  # 'high', 'medium', 'speculative'


class CandidateCompany(BaseModel):
    company_name: str
    domain: str
    industry: str
    sub_industry: str = ""
    headquarters: str = "Remote"
    employee_count: str = "20-50 employees"
    stage: str = "Early Stage"
    summary: str = ""
    target_buyer_name: Optional[str] = None
    target_buyer_title: Optional[str] = None
    target_buyer_role: Optional[str] = None
    observed_facts: List[ExtractedFact] = Field(default_factory=list)
    hypotheses: List[ExtractedHypothesis] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    uncertainty_indicators: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class CandidateRejection(BaseModel):
    company_name: str
    domain: str
    reason: str
    relevance_decision: str = "rejected"  # 'rejected' | 'insufficient_evidence'


class EvidenceValidationOutcome(BaseModel):
    fact: str
    company_name: str
    source_id: Optional[str] = None
    source_url: Optional[str] = None
    status: str  # 'accepted' | 'demoted_to_hypothesis' | 'rejected'
    reason: str


class StepOutcome(BaseModel):
    step: str
    status: str  # 'completed' | 'warning' | 'failed' | 'skipped'
    detail: str


class ResearchState(TypedDict, total=False):
    # Run Identity
    run_id: str
    
    # Inputs
    icp: Dict[str, Any]
    user_instructions: Optional[str]
    max_prospects: int
    mode: str  # 'live' | 'demo'
    
    # Graph processing state
    search_queries: List[str]
    raw_sources: List[SourceReference]
    candidate_companies: List[CandidateCompany]
    rejected_candidates: List[CandidateRejection]
    evidence_validation_outcomes: List[EvidenceValidationOutcome]
    validated_candidates: List[CandidateCompany]
    qualified_prospects: List[Dict[str, Any]]
    skipped_candidates: List[Dict[str, Any]]
    saved_prospect_ids: List[str]
    
    # Audit & Reporting
    step_outcomes: List[StepOutcome]
    warnings: List[str]
    error: Optional[str]
