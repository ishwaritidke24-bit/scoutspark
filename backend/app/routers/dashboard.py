from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ProspectModel
from ..schemas import DashboardSummary, ProspectOut, ActivityOut
from ..services.prospect_service import ProspectService

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

SIGNALS_FEED = [
    {
        "id": "sig-01",
        "type": "tech_stack_migration",
        "companyName": "KiteMetrics",
        "prospectId": "prospect-01",
        "title": "Kubernetes Cluster Ingestion Scale & Broker Lag",
        "summary": "Engineering blog post and open GitHub PRs confirm transition to multi-tenant trace collector handling >20M spans/sec.",
        "timestamp": "2 hours ago",
        "confidence": 94,
        "relevanceScore": 98,
        "impactBadge": "Critical Urgency",
    },
    {
        "id": "sig-02",
        "type": "funding_round",
        "companyName": "AuraPulse Health",
        "prospectId": "prospect-02",
        "title": "14-Clinic Multi-Practice Expansion in Central Texas",
        "summary": "Acquired 4 regional clinical practices; CMO published essay identifying front-desk EHR transcription as primary throughput bottleneck.",
        "timestamp": "4 hours ago",
        "confidence": 96,
        "relevanceScore": 95,
        "impactBadge": "High Opportunity",
    },
    {
        "id": "sig-03",
        "type": "product_launch",
        "companyName": "VeritasFlow",
        "prospectId": "prospect-03",
        "title": "UK & EU Multi-Currency Card Clearing Launch",
        "summary": "Released multi-jurisdiction clearing product with Stripe Issuing; recruiting settlement operations analyst to handle discrepancies.",
        "timestamp": "Yesterday",
        "confidence": 91,
        "relevanceScore": 90,
        "impactBadge": "Active Expansion",
    },
    {
        "id": "sig-04",
        "type": "executive_hire",
        "companyName": "BeaconStack",
        "prospectId": "prospect-04",
        "title": "Priya Sharma Keynote on LLM Underwriting Guardrails",
        "summary": "Keynote presentation detailing prompt regression challenges when evaluating financial underwriting models.",
        "timestamp": "2 days ago",
        "confidence": 89,
        "relevanceScore": 86,
        "impactBadge": "Technical Trigger",
    },
    {
        "id": "sig-05",
        "type": "hiring_surge",
        "companyName": "LogixFleet",
        "prospectId": "prospect-05",
        "title": "ThermoKing 1,200 Reefer Telematics Integration",
        "summary": "Sensor telemetry deployment completed; operations team experiencing dispatcher alert fatigue from false temperature spikes.",
        "timestamp": "3 days ago",
        "confidence": 85,
        "relevanceScore": 81,
        "impactBadge": "Operational Signal",
    },
]


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Returns live computed statistics from database records:
    - Real count of prospects
    - Breakdown by pipeline stage computed from stored data
    - Top shortlisted prospects sorted by fit score
    - Real recent activity trail
    """
    all_prospects = db.query(ProspectModel).all()
    total_prospects = len(all_prospects)

    # Compute stage counts from real records
    stage_counts = {
        "to_research": 0,
        "ready_to_review": 0,
        "approved": 0,
        "contacted": 0,
        "replied": 0,
        "meeting": 0,
        "won": 0,
        "not_a_fit": 0,
    }
    for p in all_prospects:
        stage = p.pipeline_stage or "to_research"
        if stage in stage_counts:
            stage_counts[stage] += 1
        else:
            stage_counts[stage] = 1

    # Shortlist: top 4 sorted by fit score
    sorted_prospects = sorted(all_prospects, key=lambda x: x.fit_score, reverse=True)
    shortlist = [ProspectOut.from_model(p) for p in sorted_prospects[:4]]

    # Activities
    recent_acts = ProspectService.get_activities(db, limit=10)
    acts_out = [
        ActivityOut(
            id=a.id,
            timestamp=a.timestamp,
            type=a.type,
            title=a.title,
            description=a.description,
            prospect_name=a.prospect_name,
            user=a.user,
        )
        for a in recent_acts
    ]

    return DashboardSummary(
        total_prospects=total_prospects,
        pipeline_stage_counts=stage_counts,
        priority_shortlist=shortlist,
        recent_activities=acts_out,
        signals=SIGNALS_FEED,
        demo_workspace=True,
    )
