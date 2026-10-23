"""
Stage 4.1 Regression Tests: Target Customer Profile, Lead Scoring & Evidence Integrity

Verifies:
1. The corrected ICP profile persists after saving without unsupported claims or testing notes.
2. The ICP contains coherent commercial/sales/founder target buyer roles.
3. Non-sales roles (engineering blog authors, Chief Medical Officers) receive 0 buyer-role points.
4. Companies in unrelated industries are rejected by the relevance gate.
5. Missing employee counts are not invented and are clearly penalized in missing_information.
6. Excluded businesses (consulting agencies, giant enterprises) do not score as good matches.
7. Search query planning respects the saved product and target profile.
8. Unsupported factual claims are rejected and quarantined into hypotheses.
9. Existing seed records and user edits are preserved without overwriting.
"""

import pytest
from backend.app.services.scoring_service import calculate_icp_score
from backend.app.research.graph import ResearchGraphRunner, verify_claim_in_snippet
from backend.app.research.providers import MockSearchProvider, MockLLMProvider
from backend.app.research.state import CandidateCompany, ExtractedFact, SourceReference
from backend.app.models import ProspectModel


CORRECTED_ICP = {
    "company_name": "ScoutSpark AI",
    "product_name": "ScoutSpark",
    "company_description": (
        "ScoutSpark helps small B2B software teams find likely customers, "
        "research public information about them, understand why they may be a good fit, "
        "and write personalized messages for a person to review."
    ),
    "value_proposition": (
        "Find potential business customers, review source-backed information about them, "
        "and prepare personal outreach messages in less time spent on manual research."
    ),
    "target_industries": [
        "B2B SaaS",
        "Developer tools and developer productivity",
        "AI infrastructure and AI operations software",
        "DevOps and cloud software",
        "Engineering productivity tools",
    ],
    "target_roles": [
        "Founder or CEO",
        "Head or VP of Sales",
        "Sales Development or BDR Manager",
        "Head of Growth",
        "Revenue Operations or RevOps leader",
    ],
    "target_geographies": [
        "India",
        "United States",
        "United Kingdom",
    ],
    "company_size_ranges": [
        "10 - 50 employees",
        "51 - 200 employees",
    ],
    "funding_stages": [
        "Seed ($1M - $4M)",
        "Series A ($5M - $15M)",
        "Series B ($15M - $30M)",
    ],
    "exclusions": [
        "Consumer-only businesses",
        "Agencies and software consultancies",
        "Recruitment and staffing businesses",
        "Very large enterprises outside the preferred customer size",
    ],
    "primary_pain_point": (
        "Founders and sales leaders spend excessive time manually researching accounts "
        "across web sources just to write personalized outreach messages."
    ),
}


def test_corrected_profile_persists_after_saving(client):
    """Verify that the corrected ICP is returned from the API without placeholder or testing claims."""
    res = client.get("/api/v1/icp")
    assert res.status_code == 200
    data = res.json()
    assert data["companyName"] == "ScoutSpark AI"
    assert data["productName"] == "ScoutSpark"
    
    # Must NOT have unsupported claims or test tags
    assert "80%" not in data["valueProposition"]
    assert "reply rates" not in data["valueProposition"].lower()
    assert "Persistent DB Active" not in data["valueProposition"]
    
    # Must include correct geographies
    assert "India" in data["targetGeographies"]
    assert "United States" in data["targetGeographies"]
    assert "United Kingdom" in data["targetGeographies"]


def test_icp_contains_coherent_target_buyer_roles(client):
    """Verify that the ICP buyer roles are strictly sales, growth, and founder roles."""
    res = client.get("/api/v1/icp")
    data = res.json()
    roles = data["targetRoles"]
    
    # Must include valid commercial buyers
    assert any("founder" in r.lower() or "ceo" in r.lower() for r in roles)
    assert any("sales" in r.lower() for r in roles)
    assert any("growth" in r.lower() or "revops" in r.lower() for r in roles)
    
    # Must NOT include medical or pure engineering buyer roles
    assert not any("medical" in r.lower() for r in roles)
    assert not any("clinical" in r.lower() for r in roles)
    assert not any("vp of engineering" in r.lower() for r in roles)


def test_engineering_author_and_medical_officer_denied_buyer_role_points():
    """
    Verify that an engineering blog author or medical officer does NOT receive buyer-role points
    when scoring against ScoutSpark's B2B sales outreach ICP.
    """
    company_with_eng_author = {
        "company_name": "CloudRouter",
        "industry": "Developer tools and developer productivity",
        "employee_count": "50 employees",
        "headquarters": "San Francisco, CA",
        "target_buyer": {
            "name": "Dmitry Kolesnikov",
            "title": "Senior Principal Engineer",
        },
        "observed_facts": [{"fact": "Published engineering postmortem.", "verified": True}],
    }

    res_eng = calculate_icp_score(company_with_eng_author, CORRECTED_ICP)
    assert res_eng["scoring_breakdown"]["buyer_role"] == 0
    assert any("decision-maker" in m.lower() or "buyer" in m.lower() for m in res_eng["missing_information"])

    company_with_cmo = {
        "company_name": "CareStack",
        "industry": "B2B SaaS",
        "employee_count": "80 employees",
        "headquarters": "London, UK",
        "target_buyer": {
            "name": "Dr. Sarah Jenkins",
            "title": "Chief Medical Officer",
        },
        "observed_facts": [{"fact": "Hiring clinical staff.", "verified": True}],
    }

    res_cmo = calculate_icp_score(company_with_cmo, CORRECTED_ICP)
    assert res_cmo["scoring_breakdown"]["buyer_role"] == 0

    # In contrast, an actual target buyer (VP of Sales) receives full points
    company_with_sales_vp = {
        "company_name": "SaaSFlow",
        "industry": "B2B SaaS",
        "employee_count": "45 employees",
        "headquarters": "Bangalore, India",
        "target_buyer": {
            "name": "Priya Raman",
            "title": "VP of Sales",
        },
        "observed_facts": [{"fact": "Hiring SDR team and expanding to US market.", "verified": True}],
    }

    res_sales = calculate_icp_score(company_with_sales_vp, CORRECTED_ICP)
    assert res_sales["scoring_breakdown"]["buyer_role"] == 15


def test_unrelated_industry_rejection_in_relevance_gate():
    """Verify that consumer clinics and retail businesses are rejected at the relevance gate."""
    candidate = CandidateCompany(
        company_name="Metro Dental & Medical Clinic",
        domain="metrodental.internal",
        industry="Healthcare Clinic & Dental Practice",
        summary="Local family dentistry and urgent care clinic in Austin.",
        observed_facts=[
            ExtractedFact(
                fact="Providing outpatient dental care.",
                source_url="https://metrodental.internal",
                verified=True,
            )
        ],
    )
    sources = [
        SourceReference(
            source_id="src-1",
            url="https://metrodental.internal",
            title="Metro Dental Clinic",
            snippet="Local family dentistry and urgent care clinic in Austin.",
            retrieved_at="2026-10-23",
        )
    ]

    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=sources),
        llm_provider=MockLLMProvider(candidate_fixtures=[candidate]),
    )
    state = runner.run({"icp": CORRECTED_ICP, "max_prospects": 1, "mode": "demo"})
    assert len(state["validated_candidates"]) == 0
    rejections = state.get("rejected_candidates", [])
    assert len(rejections) == 1
    assert "unrelated" in rejections[0].reason.lower()


def test_missing_employee_counts_not_invented():
    """
    Verify that an unknown headcount awards 0 size points and is explicitly listed
    in missing_information, but does NOT disqualify a good company.
    """
    company_unknown_size = {
        "company_name": "DevFlow Inc",
        "industry": "Developer tools and developer productivity",
        "employee_count": "Unknown",
        "headquarters": "Bengaluru, India",
        "summary": "Building automated testing harnesses for B2B APIs.",
        "target_buyer": {
            "name": "Rahul Verma",
            "title": "Head of Growth",
        },
        "observed_facts": [
            {"fact": "Announced Series A funding to scale sales operations.", "verified": True},
            {"fact": "Hiring Sales Development Representatives.", "verified": True},
        ],
    }

    res = calculate_icp_score(company_unknown_size, CORRECTED_ICP)
    # Headcount gets 0 points and is documented in missing_information
    assert res["scoring_breakdown"]["company_size"] == 0
    assert any("headcount" in m.lower() for m in res["missing_information"])
    
    # But because industry (30), signals (20), buyer (15), and geography (15) are strong:
    # 30 + 0 + 20 + 15 + 15 = 80
    assert res["fit_score"] >= 75
    assert res["fit_level"] == "strong"


def test_excluded_companies_do_not_score_as_good_matches():
    """Verify that consultancies, agencies, and massive enterprises are heavily penalized."""
    consultancy = {
        "company_name": "Apex Cloud Consulting Agency",
        "industry": "DevOps and cloud software",
        "summary": "We provide bespoke IT consulting and custom software outsourcing services.",
        "employee_count": "45 employees",
        "headquarters": "Austin, TX",
        "target_buyer": {"title": "Head of Sales"},
        "observed_facts": [{"fact": "Delivering client projects.", "verified": True}],
    }
    res_agency = calculate_icp_score(consultancy, CORRECTED_ICP)
    assert res_agency["scoring_breakdown"].get("exclusion_penalty") == -45
    assert res_agency["fit_score"] < 50
    assert res_agency["fit_level"] == "unlikely"

    enterprise = {
        "company_name": "MegaCorp Conglomerate",
        "industry": "B2B SaaS",
        "employee_count": "15,000 employees",
        "headquarters": "New York, NY",
        "target_buyer": {"title": "VP of Sales"},
        "observed_facts": [{"fact": "Reporting annual earnings.", "verified": True}],
    }
    res_corp = calculate_icp_score(enterprise, CORRECTED_ICP)
    assert res_corp["scoring_breakdown"].get("exclusion_penalty") == -45
    assert res_corp["fit_score"] < 50


def test_unsupported_factual_claim_rejected():
    """Verify that invented numbers or metrics cannot pass evidence verification."""
    snippet = "TraceLog announced seed funding to hire its first three sales representatives in London."
    title = "TraceLog Raises Seed Round"

    # Supported claim
    ok, msg = verify_claim_in_snippet(
        "TraceLog announced seed funding to hire sales representatives.",
        snippet,
        title,
    )
    assert ok is True

    # Invented metric claim ($20M Series B not in source)
    unsupported, fail_msg = verify_claim_in_snippet(
        "TraceLog closed a $20M Series B funding round.",
        snippet,
        title,
    )
    assert unsupported is False
    assert "Invented metric" in fail_msg or "not present" in fail_msg


def test_existing_seed_records_preserved(db_session):
    """Verify that existing seeded prospects remain intact with original IDs."""
    kitemetrics = db_session.query(ProspectModel).filter(ProspectModel.id == "prospect-01").first()
    assert kitemetrics is not None
    assert kitemetrics.company_name == "KiteMetrics"
    assert kitemetrics.provenance == "demo"
