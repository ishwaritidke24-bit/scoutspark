from pydantic import Field
from typing import List, Optional, Dict, Any
from ..schemas import CamelModel, ProspectOut
from .state import SourceReference, StepOutcome, CandidateRejection, EvidenceValidationOutcome


class ResearchRequest(CamelModel):
    user_instructions: Optional[str] = Field(None, description="Optional search instructions or focus keywords")
    max_prospects: int = Field(5, ge=1, le=10, description="Maximum prospect candidates to research (1-10)")
    mode: Optional[str] = Field(None, description="'live' for actual public search or 'demo'")


class ResearchConfigResponse(CamelModel):
    configured: bool
    llm_provider: str = "Google Gemini"
    search_provider: str = "Tavily Search API"
    provider: str
    mode: str
    model: str
    gemini_configured: bool
    tavily_configured: bool
    connection_status: str = "credentials_present"


class ResearchRunResponse(CamelModel):
    run_id: str = Field(default_factory=lambda: "")
    status: str  # 'completed' | 'empty' | 'error'
    mode: str    # 'live' | 'demo'
    queries_executed: List[str] = Field(default_factory=list)
    total_sources_found: int = 0
    unique_candidates_considered: int = 0
    candidates_accepted: int = 0
    candidates_rejected: int = 0
    candidates_saved: int = 0
    saved_prospect_ids: List[str] = Field(default_factory=list)
    rejections: List[CandidateRejection] = Field(default_factory=list)
    evidence_validations: List[EvidenceValidationOutcome] = Field(default_factory=list)
    prospects: List[ProspectOut] = Field(default_factory=list)
    sources: List[SourceReference] = Field(default_factory=list)
    step_outcomes: List[StepOutcome] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    error: Optional[str] = None
