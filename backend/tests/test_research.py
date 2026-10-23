import pytest
from unittest.mock import patch, MagicMock

from backend.app.config import settings
from backend.app.research.state import SourceReference, CandidateCompany, ExtractedFact, ExtractedHypothesis
from backend.app.research.providers import MockSearchProvider, MockLLMProvider, TavilySearchProvider, GeminiLLMProvider
from backend.app.research.graph import ResearchGraphRunner
from backend.app.models import ProspectModel, ActivityModel


def test_research_config_endpoint(client):
    response = client.get("/api/v1/research/config")
    assert response.status_code == 200
    data = response.json()
    assert "configured" in data
    assert "mode" in data
    assert "model" in data
    # Ensure no secret keys leaked in response
    assert "geminiApiKey" not in data
    assert "tavilyApiKey" not in data
    assert "AQ." not in str(data)
    assert "tvly" not in str(data)


def test_research_run_demo_mode_workflow(client, db_session):
    # Run in explicit demo mode
    response = client.post(
        "/api/v1/research/run",
        json={
            "maxProspects": 3,
            "mode": "demo",
            "userInstructions": "Distributed telemetry platforms"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["mode"] == "demo"
    assert len(data["queriesExecuted"]) > 0
    assert data["totalSourcesFound"] >= 1
    assert data["candidatesSaved"] >= 1
    assert len(data["savedProspectIds"]) >= 1
    
    # Check step outcomes
    step_names = [o["step"] for o in data["stepOutcomes"]]
    assert "validate_input" in step_names
    assert "search_sources" in step_names
    assert "ground_and_validate" in step_names
    assert "qualify_and_score" in step_names
    assert "synthesize_outreach" in step_names
    assert "persist_records" in step_names

    # Check database persistence and provenance
    saved_id = data["savedProspectIds"][0]
    db_record = db_session.query(ProspectModel).filter(ProspectModel.id == saved_id).first()
    assert db_record is not None
    assert db_record.provenance == "researched"
    assert db_record.company_name == "SynapseCloud"
    assert len(db_record.observed_facts) >= 1
    # Check activity logged
    act = db_session.query(ActivityModel).filter(ActivityModel.title.contains("Live Web Research")).first()
    assert act is not None


def test_research_run_missing_keys_raises_clear_error(client):
    # Temporarily unset keys in settings
    with patch.object(settings, "gemini_api_key", None), patch.object(settings, "tavily_api_key", None):
        response = client.post(
            "/api/v1/research/run",
            json={"mode": "live", "maxProspects": 2}
        )
        assert response.status_code == 400
        detail = response.json()["detail"].lower()
        assert "credentials are not configured" in detail
        assert "gemini_api_key" in detail or "tavily_api_key" in detail


def test_research_graph_deduplicates_sources():
    sources_with_dupes = [
        SourceReference(source_id="s1", url="https://example.com/blog", title="Title 1", snippet="Snippet 1", retrieved_at="2026-10-23"),
        SourceReference(source_id="s2", url="https://example.com/blog", title="Title 1 Dupe", snippet="Snippet 1", retrieved_at="2026-10-23"),
        SourceReference(source_id="s3", url="https://other.com/post", title="Title 2", snippet="Snippet 2", retrieved_at="2026-10-23"),
    ]
    mock_search = MockSearchProvider(fixture_results=sources_with_dupes)
    mock_llm = MockLLMProvider()

    runner = ResearchGraphRunner(search_provider=mock_search, llm_provider=mock_llm)
    state = runner.run({
        "icp": {"target_industries": ["Developer Tools"]},
        "max_prospects": 5,
        "mode": "demo"
    })
    # Should deduplicate by URL
    assert len(state["raw_sources"]) == 2


def test_research_graph_rejects_hallucinated_urls():
    """
    CRITICAL: Tests that an LLM citing an imaginary URL not in the provider's
    search results has that citation demoted from observed_facts to hypotheses.
    """
    real_sources = [
        SourceReference(
            source_id="src-real-1",
            url="https://ghosttech.internal/postmortem",
            title="GhostTech Infrastructure Retrospective",
            snippet="GhostTech resolved Kafka memory saturation incident under 20M spans.",
            retrieved_at="2026-10-23"
        )
    ]
    
    # Candidate with one valid citation and one completely hallucinated URL
    candidate_with_hallucination = [
        CandidateCompany(
            company_name="GhostTech",
            domain="ghosttech.internal",
            industry="Developer Tools",
            observed_facts=[
                ExtractedFact(
                    fact="Resolved Kafka memory saturation incident under 20M spans.",
                    source_ids=["src-real-1"],
                    source_url="https://ghosttech.internal/postmortem",
                    verified=True
                ),
                ExtractedFact(
                    fact="Fabricated fact citing fake website",
                    source_ids=["src-fake-99"],
                    source_url="https://totally-made-up-hallucinated-domain.com/secret",
                    verified=True
                )
            ]
        )
    ]

    mock_search = MockSearchProvider(fixture_results=real_sources)
    mock_llm = MockLLMProvider(candidate_fixtures=candidate_with_hallucination)

    runner = ResearchGraphRunner(search_provider=mock_search, llm_provider=mock_llm)
    state = runner.run({
        "icp": {"target_industries": ["Developer Tools"]},
        "max_prospects": 2,
        "mode": "demo"
    })

    validated = state["validated_candidates"][0]
    # The real fact must be preserved
    assert len(validated.observed_facts) == 1
    assert validated.observed_facts[0].source_url == "https://ghosttech.internal/postmortem"
    # The hallucinated claim must NOT be in observed_facts; it was demoted to hypotheses
    assert not any("totally-made-up" in (f.source_url or "") for f in validated.observed_facts)
    assert any("Demoted from observed fact" in h.rationale for h in validated.hypotheses)


def test_research_graph_empty_search_handling():
    mock_search = MockSearchProvider(fixture_results=[])
    mock_llm = MockLLMProvider()

    runner = ResearchGraphRunner(search_provider=mock_search, llm_provider=mock_llm)
    state = runner.run({
        "icp": {"target_industries": ["Exotic Obscure Niche"]},
        "max_prospects": 2,
        "mode": "demo"
    })
    assert len(state.get("raw_sources", [])) == 0
    assert len(state.get("saved_prospect_ids", [])) == 0
    step_statuses = {o.step: o.status for o in state["step_outcomes"]}
    assert step_statuses["search_sources"] == "warning"


def test_tavily_provider_error_handling():
    provider = TavilySearchProvider(api_key="invalid-key")
    with patch("tavily.TavilyClient.search", side_effect=Exception("Unauthorized: 401")):
        with pytest.raises(ValueError, match="Tavily API authentication failed"):
            provider.search("test query")


def test_gemini_provider_missing_key_handling():
    provider = GeminiLLMProvider(api_key=None)
    with pytest.raises(ValueError, match="Gemini API key is not configured"):
        provider.plan_queries({"target_industries": ["DevTools"]})
