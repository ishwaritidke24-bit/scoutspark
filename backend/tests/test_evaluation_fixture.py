"""
OFFLINE RESEARCH EVALUATION FIXTURE (EXPLICITLY LABELED TEST FIXTURE — NOT REAL-WORLD BENCHMARK PROOF)

Curated suite of 12 controlled, fictional test cases to evaluate:
1. Candidate relevance gating (duplicate domain rejection, negative exclusions, unrelated industries, incidental mentions).
2. Factual claim grounding & provenance validation (URL verification, subject-company alignment, snippet support, invented metric rejection).
3. Uncertainty & missing information handling.
"""

import pytest
from typing import List, Dict, Any, Optional

from backend.app.services.scoring_service import calculate_icp_score
from backend.app.research.state import (
    SourceReference,
    CandidateCompany,
    ExtractedFact,
    ExtractedHypothesis,
)
from backend.app.research.providers import MockSearchProvider, MockLLMProvider
from backend.app.research.graph import ResearchGraphRunner


EVALUATION_ICP = {
    "company_name": "TracePulse",
    "product_name": "TracePulse Engine",
    "company_description": "High-throughput eBPF distributed tracing proxy for cloud-native infrastructure.",
    "value_proposition": "Compresses telemetry storage costs by 65% while keeping 100% anomaly fidelity.",
    "primary_pain_point": "High cloud telemetry storage costs and Kafka ingestion latency",
    "target_industries": ["Developer Tools & Infrastructure", "Fintech & Payments Infrastructure"],
    "target_roles": ["VP of Engineering", "Head of Platform", "Infrastructure Lead"],
    "target_geographies": ["North America", "San Francisco", "New York", "Remote"],
    "company_size_ranges": ["20-50 employees", "51-200 employees"],
    "exclusions": ["agency", "consulting", "b2c marketplace", "crypto gambling"],
}

# ============================================================================
# 12 CAREFULLY DESIGNED FICTIONAL RESEARCH CASES
# ============================================================================

EVALUATION_CASES = [
    # Case 1: Clear ICP match (Observability startup with verified postmortem)
    {
        "id": "CASE-01",
        "name": "Clear ICP Match — Series A Observability",
        "candidate": CandidateCompany(
            company_name="SynapseCloud",
            domain="synapsecloud.internal",
            industry="Developer Tools & Infrastructure",
            sub_industry="Distributed Tracing",
            employee_count="45 employees",
            headquarters="San Francisco, CA",
            target_buyer_title="VP of Platform",
            target_buyer_name="Marcus Brody",
            observed_facts=[
                ExtractedFact(
                    fact="SynapseCloud infrastructure team migrated to eBPF profiling after Kafka buffer saturation.",
                    source_ids=["src-1"],
                    source_url="https://synapsecloud.internal/blog/ebpf-tracing",
                    verified=True,
                )
            ],
            hypotheses=[
                ExtractedHypothesis(
                    hypothesis="Engineering team is seeking automated telemetry compression.",
                    rationale="Kafka buffer lag cited in postmortem.",
                    confidence="high",
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-1",
                url="https://synapsecloud.internal/blog/ebpf-tracing",
                title="SynapseCloud: eBPF Profiling and Kafka Saturation",
                snippet="SynapseCloud infrastructure team migrated to eBPF profiling after Kafka buffer saturation.",
                published_date="2026-09-20",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "accepted",
        "expected_grounding": "fact_verified",
        "expected_min_score": 75,
    },

    # Case 2: Clearly unrelated company (Bakery / consumer food)
    {
        "id": "CASE-02",
        "name": "Clearly Unrelated Company — Artisanal Bakery",
        "candidate": CandidateCompany(
            company_name="Crust & Sourdough Bakery",
            domain="crustbakery.internal",
            industry="Food & Artisanal Bakery",
            summary="We bake organic sourdough bread and French pastries in downtown Portland.",
            observed_facts=[
                ExtractedFact(
                    fact="Baking sourdough bread daily using wood-fired ovens.",
                    source_ids=["src-2"],
                    source_url="https://crustbakery.internal/about",
                    verified=True,
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-2",
                url="https://crustbakery.internal/about",
                title="Crust Bakery: Fresh Sourdough Daily",
                snippet="Baking sourdough bread daily using wood-fired ovens.",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "rejected",
        "rejection_reason_keyword": "unrelated",
    },

    # Case 3: Relevant company with insufficient evidence (Missing headcount & buyer)
    {
        "id": "CASE-03",
        "name": "Relevant Company with Insufficient Evidence",
        "candidate": CandidateCompany(
            company_name="VaporTrace",
            domain="vaportrace.internal",
            industry="Developer Tools & Infrastructure",
            headquarters="Remote",
            employee_count="Unknown",
            summary="Early developer tools project working on trace visualization.",
            observed_facts=[
                ExtractedFact(
                    fact="VaporTrace published an open-source trace visualizer for Kubernetes.",
                    source_ids=["src-3"],
                    source_url="https://vaportrace.internal/github",
                    verified=True,
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-3",
                url="https://vaportrace.internal/github",
                title="VaporTrace Open Source Project",
                snippet="VaporTrace published an open-source trace visualizer for Kubernetes.",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "accepted",
        "expected_grounding": "fact_verified",
        "expected_missing_info": True,
    },

    # Case 4: Company mentioned incidentally by unrelated source
    {
        "id": "CASE-04",
        "name": "Incidental Mention Without Substantive Evidence",
        "candidate": CandidateCompany(
            company_name="IncidentalTech",
            domain="incidentaltech.internal",
            industry="Developer Tools & Infrastructure",
            tags=["incidental_mention"],
            observed_facts=[
                ExtractedFact(
                    fact="Incidental mention: Mentioned in competitor blog footnote.",
                    source_ids=["src-4"],
                    source_url="https://othercompany.internal/blog",
                    verified=True,
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-4",
                url="https://othercompany.internal/blog",
                title="OtherCompany Benchmark Comparison",
                snippet="OtherCompany compares its telemetry throughput against IncidentalTech and two legacy vendors.",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "rejected",
        "rejection_reason_keyword": "incidental",
    },

    # Case 5: Duplicate company domain
    {
        "id": "CASE-05",
        "name": "Duplicate Company Domain",
        "candidate": CandidateCompany(
            company_name="DuplicateCloud",
            domain="duplicatecloud.internal",
            industry="Developer Tools & Infrastructure",
            observed_facts=[
                ExtractedFact(
                    fact="DuplicateCloud managing distributed traces.",
                    source_ids=["src-5"],
                    source_url="https://duplicatecloud.internal/blog",
                    verified=True,
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-5",
                url="https://duplicatecloud.internal/blog",
                title="DuplicateCloud Blog",
                snippet="DuplicateCloud managing distributed traces.",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "duplicate_rejection",
    },

    # Case 6: Valid URL with an unsupported factual claim
    {
        "id": "CASE-06",
        "name": "Valid URL with Unsupported Fact (Invented Metric)",
        "candidate": CandidateCompany(
            company_name="MetricFabricator",
            domain="metricfabricator.internal",
            industry="Developer Tools & Infrastructure",
            observed_facts=[
                ExtractedFact(
                    fact="MetricFabricator raised $50M Series B with 40% memory latency saturation in Q4.",
                    source_ids=["src-6"],
                    source_url="https://metricfabricator.internal/post",
                    verified=True,
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-6",
                url="https://metricfabricator.internal/post",
                title="MetricFabricator Technical Overview",
                snippet="MetricFabricator provides cloud routing tools for engineers.",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "accepted",
        "expected_grounding": "demoted_to_hypothesis",
        "hypothesis_keyword": "metric",
    },

    # Case 7: Correct source attached to wrong company
    {
        "id": "CASE-07",
        "name": "Source Attached to Wrong Company",
        "candidate": CandidateCompany(
            company_name="WrongCompanyTarget",
            domain="wrongcompanytarget.internal",
            industry="Developer Tools & Infrastructure",
            observed_facts=[
                ExtractedFact(
                    fact="AcmePlatform resolved Kafka trace ingestion lag.",
                    source_ids=["src-7"],
                    source_url="https://acmeplatform.internal/postmortem",
                    verified=True,
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-7",
                url="https://acmeplatform.internal/postmortem",
                title="AcmePlatform Retrospective",
                snippet="AcmePlatform resolved Kafka trace ingestion lag under high traffic.",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "accepted",
        "expected_grounding": "demoted_to_hypothesis",
        "hypothesis_keyword": "another company",
    },

    # Case 8: Fabricated source ID / phantom URL
    {
        "id": "CASE-08",
        "name": "Fabricated Source ID / Phantom URL",
        "candidate": CandidateCompany(
            company_name="PhantomSourceCorp",
            domain="phantomsourcecorp.internal",
            industry="Developer Tools & Infrastructure",
            observed_facts=[
                ExtractedFact(
                    fact="PhantomSourceCorp running 20 Kubernetes nodes.",
                    source_ids=["src-phantom-99"],
                    source_url="https://invented-hallucinated-phantom-domain.com/secret",
                    verified=True,
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-8",
                url="https://real-search-source.internal/info",
                title="Real Search Source",
                snippet="Real search snippet.",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "accepted",
        "expected_grounding": "demoted_to_hypothesis",
        "hypothesis_keyword": "not found in provider",
    },

    # Case 9: Conflicting source statements (Headcount discrepancy flagged)
    {
        "id": "CASE-09",
        "name": "Conflicting Source Statements Flagged",
        "candidate": CandidateCompany(
            company_name="ConflictTelemetry",
            domain="conflicttelemetry.internal",
            industry="Developer Tools & Infrastructure",
            uncertainty_indicators=["Conflicting headcount: Blog states 15 employees while press states 500."],
            observed_facts=[
                ExtractedFact(
                    fact="ConflictTelemetry manages distributed Kubernetes clusters.",
                    source_ids=["src-9"],
                    source_url="https://conflicttelemetry.internal/blog",
                    verified=True,
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-9",
                url="https://conflicttelemetry.internal/blog",
                title="ConflictTelemetry Engineering Blog",
                snippet="ConflictTelemetry manages distributed Kubernetes clusters.",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "accepted",
        "expected_grounding": "fact_verified",
        "expected_uncertainty": True,
    },

    # Case 10: Plausible but unproven business-pain hypothesis
    {
        "id": "CASE-10",
        "name": "Unproven Business Pain Kept as Hypothesis",
        "candidate": CandidateCompany(
            company_name="HypoTrace",
            domain="hypotrace.internal",
            industry="Developer Tools & Infrastructure",
            observed_facts=[
                ExtractedFact(
                    fact="HypoTrace is hiring 5 backend infrastructure engineers in San Francisco.",
                    source_ids=["src-10"],
                    source_url="https://hypotrace.internal/careers",
                    verified=True,
                )
            ],
            hypotheses=[
                ExtractedHypothesis(
                    hypothesis="Hiring surge suggests cloud infrastructure costs are outpacing engineering capacity.",
                    rationale="Inferred from simultaneous hiring of 5 infrastructure specialists.",
                    confidence="speculative",
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-10",
                url="https://hypotrace.internal/careers",
                title="HypoTrace Careers",
                snippet="HypoTrace is hiring 5 backend infrastructure engineers in San Francisco.",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "accepted",
        "expected_grounding": "fact_verified",
        "expected_hypothesis_preserved": True,
    },

    # Case 11: Explicitly excluded industry (Offshore Consulting Agency)
    {
        "id": "CASE-11",
        "name": "Negative Exclusion Match — Offshore Consulting Agency",
        "candidate": CandidateCompany(
            company_name="Global Offshore Consulting Agency",
            domain="globaloffshoreagency.internal",
            industry="Software Consulting Agency",
            summary="We are an IT staff augmentation agency and offshore software consulting firm.",
            observed_facts=[
                ExtractedFact(
                    fact="Providing custom software development agency services to clients.",
                    source_ids=["src-11"],
                    source_url="https://globaloffshoreagency.internal/services",
                    verified=True,
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-11",
                url="https://globaloffshoreagency.internal/services",
                title="Global Agency Services",
                snippet="Providing custom software development agency services to clients.",
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "rejected",
        "rejection_reason_keyword": "exclusion",
    },

    # Case 12: Search result with missing dates or incomplete metadata
    {
        "id": "CASE-12",
        "name": "Source with Missing Date Preserves None (No Invention)",
        "candidate": CandidateCompany(
            company_name="TimelessCloud",
            domain="timelesscloud.internal",
            industry="Developer Tools & Infrastructure",
            observed_facts=[
                ExtractedFact(
                    fact="TimelessCloud released open-source eBPF network probe.",
                    source_ids=["src-12"],
                    source_url="https://timelesscloud.internal/probe",
                    date=None,  # No date in snippet
                    verified=True,
                )
            ],
        ),
        "sources": [
            SourceReference(
                source_id="src-12",
                url="https://timelesscloud.internal/probe",
                title="TimelessCloud eBPF Probe Release",
                snippet="TimelessCloud released open-source eBPF network probe.",
                published_date=None,  # Provider did NOT supply a date
                retrieved_at="2026-10-23",
            )
        ],
        "expected_relevance": "accepted",
        "expected_grounding": "fact_verified",
        "expected_date_none": True,
    },
]


# ============================================================================
# AUTOMATED DETERMINISTIC TESTS VERIFYING ALL 12 CASES
# ============================================================================

def test_evaluation_case_01_clear_icp_match():
    case = EVALUATION_CASES[0]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    assert len(state["validated_candidates"]) == 1
    val = state["validated_candidates"][0]
    assert val.company_name == "SynapseCloud"
    assert len(val.observed_facts) == 1
    assert "eBPF profiling" in val.observed_facts[0].fact


def test_evaluation_case_02_unrelated_company_rejection():
    case = EVALUATION_CASES[1]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    assert len(state["validated_candidates"]) == 0
    rejections = state.get("rejected_candidates", [])
    assert len(rejections) == 1
    assert "unrelated" in rejections[0].reason.lower()


def test_evaluation_case_03_insufficient_evidence_preservation():
    case = EVALUATION_CASES[2]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    assert len(state["validated_candidates"]) == 1
    val = state["validated_candidates"][0]
    assert val.employee_count == "Unknown"


def test_evaluation_case_04_incidental_mention_rejection():
    case = EVALUATION_CASES[3]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    assert len(state["validated_candidates"]) == 0
    rejections = state.get("rejected_candidates", [])
    assert len(rejections) == 1
    assert "incidental" in rejections[0].reason.lower()


def test_evaluation_case_05_duplicate_domain_rejection():
    case = EVALUATION_CASES[4]
    candidate1 = case["candidate"]
    # Duplicate instance with same domain
    candidate2 = CandidateCompany(
        company_name="DuplicateCloud Second Listing",
        domain="duplicatecloud.internal",
        industry="Developer Tools & Infrastructure",
        observed_facts=[ExtractedFact(fact="Second listing", source_url="https://duplicatecloud.internal/blog")]
    )
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[candidate1, candidate2]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 2, "mode": "demo"})
    # Only 1 unique candidate accepted; second rejected as duplicate
    assert len(state["validated_candidates"]) == 1
    rejections = state.get("rejected_candidates", [])
    assert any("duplicate" in r.reason.lower() for r in rejections)


def test_evaluation_case_06_unsupported_fact_demotion():
    case = EVALUATION_CASES[5]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    val = state["validated_candidates"][0]
    # Invented metric fact must NOT be in observed_facts; demoted to hypothesis
    assert len(val.observed_facts) == 0
    assert any("Invented metric" in h.rationale for h in val.hypotheses)


def test_evaluation_case_07_source_attached_to_wrong_company():
    case = EVALUATION_CASES[6]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    val = state["validated_candidates"][0]
    # Fact demoted because source mentions AcmePlatform, not WrongCompanyTarget
    assert len(val.observed_facts) == 0
    assert any("another company" in h.rationale.lower() for h in val.hypotheses)


def test_evaluation_case_08_phantom_url_demotion():
    case = EVALUATION_CASES[7]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    val = state["validated_candidates"][0]
    # Fabricated URL demoted
    assert len(val.observed_facts) == 0
    assert any("not found in provider" in h.rationale.lower() for h in val.hypotheses)


def test_evaluation_case_09_uncertainty_indicator_preservation():
    case = EVALUATION_CASES[8]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    val = state["validated_candidates"][0]
    assert len(val.uncertainty_indicators) >= 1
    assert "Conflicting headcount" in val.uncertainty_indicators[0]


def test_evaluation_case_10_unproven_hypothesis_quarantine():
    case = EVALUATION_CASES[9]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    val = state["validated_candidates"][0]
    # Observed fact preserved
    assert len(val.observed_facts) == 1
    # Speculative hypothesis remains explicitly quarantined with confidence
    assert len(val.hypotheses) >= 1
    assert val.hypotheses[0].confidence == "speculative"


def test_evaluation_case_11_negative_exclusion_rejection():
    case = EVALUATION_CASES[10]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    assert len(state["validated_candidates"]) == 0
    rejections = state.get("rejected_candidates", [])
    assert len(rejections) == 1
    assert "exclusion" in rejections[0].reason.lower()


def test_evaluation_case_12_missing_date_not_invented():
    case = EVALUATION_CASES[11]
    runner = ResearchGraphRunner(
        search_provider=MockSearchProvider(fixture_results=case["sources"]),
        llm_provider=MockLLMProvider(candidate_fixtures=[case["candidate"]]),
    )
    state = runner.run({"icp": EVALUATION_ICP, "max_prospects": 1, "mode": "demo"})
    val = state["validated_candidates"][0]
    assert len(val.observed_facts) == 1
    # Ensure missing published date remains None (no invented date)
    assert val.observed_facts[0].date is None
