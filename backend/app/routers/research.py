from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..config import settings
from ..models import ICPModel, ProspectModel
from ..schemas import ProspectOut
from ..research.schemas import (
    ResearchRequest,
    ResearchConfigResponse,
    ResearchRunResponse,
)
from ..research.providers import (
    TavilySearchProvider,
    GeminiLLMProvider,
    MockSearchProvider,
    MockLLMProvider,
)
from ..research.graph import ResearchGraphRunner
from ..research.state import ResearchState

router = APIRouter(prefix="/api/v1/research", tags=["Research"])


@router.get("/config", response_model=ResearchConfigResponse)
def get_research_config():
    """
    Returns provider configuration status and effective research mode.
    Derives model identifier from backend settings. Never exposes secret API keys.
    """
    is_live = settings.is_live_configured
    llm_p = "Google Gemini"
    search_p = "Tavily Search API"
    provider_label = f"{llm_p} + {search_p}" if is_live else "Local Simulation"
    status_label = "credentials_configured" if is_live else "offline"

    return ResearchConfigResponse(
        configured=is_live,
        llm_provider=llm_p,
        search_provider=search_p,
        provider=provider_label,
        mode=settings.effective_research_mode,
        model=settings.gemini_model,
        gemini_configured=bool(settings.gemini_api_key and settings.gemini_api_key.strip()),
        tavily_configured=bool(settings.tavily_api_key and settings.tavily_api_key.strip()),
        connection_status=status_label,
    )


@router.post("/run", response_model=ResearchRunResponse)
def run_prospect_research(
    request_in: ResearchRequest,
    db: Session = Depends(get_db),
):
    """
    Executes public-web prospect discovery using LangGraph, Gemini, and Tavily.
    - Gathers verified facts from Tavily search results.
    - Quarantines speculative hypotheses.
    - Applies deterministic ICP rules scoring.
    - Drafts personalized outreach for human approval.
    - Persists valid records with provenance='researched'.
    """
    requested_mode = (request_in.mode or settings.effective_research_mode).lower()

    if requested_mode == "live":
        if not settings.is_live_configured:
            missing = []
            if not settings.gemini_api_key:
                missing.append("GEMINI_API_KEY")
            if not settings.tavily_api_key:
                missing.append("TAVILY_API_KEY")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Live research credentials are not configured. Missing: {', '.join(missing)} in backend/.env.",
            )
        search_provider = TavilySearchProvider()
        llm_provider = GeminiLLMProvider()
    else:
        # Explicit demo mode
        search_provider = MockSearchProvider()
        llm_provider = MockLLMProvider()

    # Load saved ICP from database
    icp_record = db.query(ICPModel).first()
    icp_dict = {}
    if icp_record:
        icp_dict = {
            "company_name": icp_record.company_name,
            "product_name": icp_record.product_name,
            "company_description": icp_record.company_description,
            "value_proposition": icp_record.value_proposition,
            "target_industries": icp_record.target_industries or [],
            "target_roles": icp_record.target_roles or [],
            "target_geographies": icp_record.target_geographies or [],
            "company_size_ranges": icp_record.company_size_ranges or [],
            "exclusions": icp_record.exclusions or [],
            "primary_pain_point": icp_record.primary_pain_point or "",
        }

    import uuid
    run_id = f"run-{uuid.uuid4().hex[:8]}"

    initial_state: ResearchState = {
        "run_id": run_id,
        "icp": icp_dict,
        "user_instructions": request_in.user_instructions,
        "max_prospects": request_in.max_prospects,
        "mode": requested_mode,
        "step_outcomes": [],
        "warnings": [],
        "raw_sources": [],
        "candidate_companies": [],
        "rejected_candidates": [],
        "evidence_validation_outcomes": [],
        "validated_candidates": [],
        "qualified_prospects": [],
        "skipped_candidates": [],
        "saved_prospect_ids": [],
    }

    try:
        runner = ResearchGraphRunner(
            search_provider=search_provider,
            llm_provider=llm_provider,
            db_session=db,
        )
        final_state = runner.run(initial_state)

        # Retrieve saved prospects from DB to return complete schemas
        saved_ids = final_state.get("saved_prospect_ids", [])
        saved_prospects_out: List[ProspectOut] = []
        if saved_ids:
            db_records = (
                db.query(ProspectModel)
                .filter(ProspectModel.id.in_(saved_ids))
                .all()
            )
            saved_prospects_out = [ProspectOut.from_model(r) for r in db_records]

        sources = final_state.get("raw_sources", [])
        queries = final_state.get("search_queries", [])
        outcomes = final_state.get("step_outcomes", [])
        warnings = final_state.get("warnings", [])
        candidates_raw = final_state.get("candidate_companies", [])
        candidates_val = final_state.get("validated_candidates", [])
        rejections = final_state.get("rejected_candidates", [])
        validations = final_state.get("evidence_validation_outcomes", [])

        run_status = "completed" if saved_prospects_out else ("empty" if sources else "error")

        return ResearchRunResponse(
            run_id=final_state.get("run_id", run_id),
            status=run_status,
            mode=requested_mode,
            queries_executed=queries,
            total_sources_found=len(sources),
            unique_candidates_considered=len(candidates_raw),
            candidates_accepted=len(candidates_val),
            candidates_rejected=len(rejections),
            candidates_saved=len(saved_prospects_out),
            rejections=rejections,
            evidence_validations=validations,
            saved_prospect_ids=saved_ids,
            prospects=saved_prospects_out,
            sources=sources,
            step_outcomes=outcomes,
            warnings=warnings,
            error=final_state.get("error"),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Research graph execution failed: {str(e)}",
        )
