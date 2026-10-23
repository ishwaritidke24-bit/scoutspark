import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
from urllib.parse import urlparse
import uuid
from sqlalchemy.orm import Session
from langgraph.graph import StateGraph, END

from .state import (
    ResearchState,
    StepOutcome,
    SourceReference,
    CandidateCompany,
    ExtractedFact,
    ExtractedHypothesis,
    CandidateRejection,
    EvidenceValidationOutcome,
)
from .providers import BaseSearchProvider, BaseLLMProvider
from ..services.scoring_service import calculate_icp_score
from ..models import ProspectModel, OutreachDraftModel, ActivityModel

logger = logging.getLogger("scoutspark.research.graph")


def normalize_domain(domain_raw: str, fallback_url: str = "") -> str:
    """Normalize domain to clean hostname without protocol, port, or path."""
    d = (domain_raw or "").strip().lower()
    if "://" in d:
        try:
            d = urlparse(d).netloc
        except Exception:
            pass
    elif fallback_url and ("." not in d or "/" in d):
        try:
            d = urlparse(fallback_url).netloc
        except Exception:
            pass
    d = re.sub(r":\d+$", "", d)
    d = re.sub(r"^www\.", "", d)
    d = d.split("/")[0].strip()
    return d or "unknown.internal"


def verify_claim_in_snippet(fact_text: str, snippet: str, title: str) -> Tuple[bool, str]:
    """
    Auditable verification checking whether an extracted factual claim is
    genuinely supported by the provider source snippet and title.
    Guards against hallucination of unmentioned metrics, dates, or pain points.
    """
    if not snippet and not title:
        return False, "Provider snippet and title are empty."

    full_source = f"{title} {snippet}".lower()

    # 1. Metric / Number Verification: Check if specific metrics in fact are in source
    # Catches invented "$10M", "40%", "Series B", "Q4", "2026", etc.
    fact_metrics = re.findall(r"(\$\d+[\w.]*|\b\d+[\w%]*|\bseries\s+[a-z]\b|\bq[1-4]\b)", fact_text.lower())
    for metric in fact_metrics:
        # Ignore single digits 0-9
        if len(metric) >= 2 and metric not in full_source:
            return False, f"Invented metric or timeframe '{metric}' not present in provider source text."

    # 2. Substantive content word overlap check
    stop_words = {
        "this", "that", "with", "have", "from", "they", "will", "been", "were",
        "their", "company", "team", "about", "which", "after", "using", "into",
        "under", "more", "also", "some", "other", "such", "than", "then", "announced",
        "supported", "claim", "reported", "noted"
    }
    fact_words = [
        w for w in re.findall(r"[a-zA-Z]{3,}", fact_text.lower())
        if w not in stop_words
    ]

    if not fact_words:
        return True, "Verified (basic statement without distinctive noun claims)."

    matched_words = [w for w in fact_words if w in full_source]
    overlap_ratio = len(matched_words) / len(fact_words)

    # Require at least 30% lexical overlap with source snippet text
    if overlap_ratio < 0.30:
        return False, f"Low source overlap ({overlap_ratio:.0%}): Key claim terms not found in snippet text."

    return True, f"Verified: {overlap_ratio:.0%} claim terms supported by source snippet."


class ResearchGraphRunner:
    def __init__(
        self,
        search_provider: BaseSearchProvider,
        llm_provider: BaseLLMProvider,
        db_session: Optional[Session] = None,
    ):
        self.search_provider = search_provider
        self.llm_provider = llm_provider
        self.db = db_session
        self.app = self._build_graph()

    def _build_graph(self):
        graph = StateGraph(ResearchState)

        # Register nodes
        graph.add_node("validate_input", self._node_validate_input)
        graph.add_node("plan_queries", self._node_plan_queries)
        graph.add_node("search_sources", self._node_search_sources)
        graph.add_node("extract_candidates", self._node_extract_candidates)
        graph.add_node("relevance_gate", self._node_relevance_gate)
        graph.add_node("ground_and_validate", self._node_ground_and_validate)
        graph.add_node("qualify_and_score", self._node_qualify_and_score)
        graph.add_node("synthesize_outreach", self._node_synthesize_outreach)
        graph.add_node("persist_records", self._node_persist_records)

        # Set entry point
        graph.set_entry_point("validate_input")

        # Edges
        graph.add_edge("validate_input", "plan_queries")
        graph.add_edge("plan_queries", "search_sources")

        # Conditional edge after search: check if sources were found
        graph.add_conditional_edges(
            "search_sources",
            self._route_after_search,
            {
                "continue": "extract_candidates",
                "empty_search": END,
            },
        )

        # Conditional edge after extraction: check if candidates found
        graph.add_conditional_edges(
            "extract_candidates",
            self._route_after_extraction,
            {
                "continue": "relevance_gate",
                "no_candidates": END,
            },
        )

        graph.add_edge("relevance_gate", "ground_and_validate")
        graph.add_edge("ground_and_validate", "qualify_and_score")
        graph.add_edge("qualify_and_score", "synthesize_outreach")
        graph.add_edge("synthesize_outreach", "persist_records")
        graph.add_edge("persist_records", END)

        return graph.compile()

    # --- Conditional Routers ---

    def _route_after_search(self, state: ResearchState) -> str:
        sources = state.get("raw_sources", [])
        if not sources:
            return "empty_search"
        return "continue"

    def _route_after_extraction(self, state: ResearchState) -> str:
        candidates = state.get("candidate_companies", [])
        if not candidates:
            return "no_candidates"
        return "continue"

    # --- Node Implementations ---

    def _node_validate_input(self, state: ResearchState) -> Dict[str, Any]:
        outcomes = list(state.get("step_outcomes", []))
        warnings = list(state.get("warnings", []))
        run_id = state.get("run_id") or f"run-{uuid.uuid4().hex[:8]}"

        max_p = state.get("max_prospects", 5)
        bounded_max = max(1, min(10, max_p))

        icp = state.get("icp", {})
        if not icp.get("target_industries"):
            warnings.append("ICP target industries list is empty; using broad B2B search parameters.")

        outcomes.append(
            StepOutcome(
                step="validate_input",
                status="completed",
                detail=f"Validated criteria for run {run_id}. Prospect budget: {bounded_max} accounts.",
            )
        )

        return {
            "run_id": run_id,
            "max_prospects": bounded_max,
            "step_outcomes": outcomes,
            "warnings": warnings,
            "rejected_candidates": [],
            "evidence_validation_outcomes": [],
        }

    def _node_plan_queries(self, state: ResearchState) -> Dict[str, Any]:
        outcomes = list(state.get("step_outcomes", []))
        warnings = list(state.get("warnings", []))

        try:
            queries = self.llm_provider.plan_queries(
                icp=state.get("icp", {}),
                user_instructions=state.get("user_instructions"),
            )
            bounded_queries = queries[:3]
            outcomes.append(
                StepOutcome(
                    step="plan_queries",
                    status="completed",
                    detail=f"Formulated {len(bounded_queries)} focused public search queries seeking prospective customers.",
                )
            )
            return {
                "search_queries": bounded_queries,
                "step_outcomes": outcomes,
                "warnings": warnings,
            }
        except Exception as e:
            warnings.append(f"Query planning warning: {str(e)}")
            fallback = ["B2B SaaS tech company engineering incident blog"]
            outcomes.append(
                StepOutcome(
                    step="plan_queries",
                    status="warning",
                    detail=f"Used fallback query due to: {str(e)}",
                )
            )
            return {
                "search_queries": fallback,
                "step_outcomes": outcomes,
                "warnings": warnings,
            }

    def _node_search_sources(self, state: ResearchState) -> Dict[str, Any]:
        outcomes = list(state.get("step_outcomes", []))
        warnings = list(state.get("warnings", []))
        queries = state.get("search_queries", [])

        all_sources: List[SourceReference] = []
        seen_urls = set()

        for q in queries:
            try:
                results = self.search_provider.search(query=q, max_results=3)
                for res in results:
                    if res.url not in seen_urls:
                        seen_urls.add(res.url)
                        res.source_id = f"src-{len(all_sources) + 1}"
                        all_sources.append(res)
                        if len(all_sources) >= 8:
                            break
            except Exception as e:
                warnings.append(f"Search provider error on query '{q}': {str(e)}")

        if not all_sources:
            outcomes.append(
                StepOutcome(
                    step="search_sources",
                    status="warning",
                    detail="No public search results returned by provider for the given criteria.",
                )
            )
            return {
                "raw_sources": [],
                "step_outcomes": outcomes,
                "warnings": warnings,
            }

        outcomes.append(
            StepOutcome(
                step="search_sources",
                status="completed",
                detail=f"Retrieved {len(all_sources)} verified public web source records across search queries.",
            )
        )
        return {
            "raw_sources": all_sources,
            "step_outcomes": outcomes,
            "warnings": warnings,
        }

    def _node_extract_candidates(self, state: ResearchState) -> Dict[str, Any]:
        outcomes = list(state.get("step_outcomes", []))
        warnings = list(state.get("warnings", []))
        sources = state.get("raw_sources", [])

        try:
            candidates = self.llm_provider.extract_candidates(
                sources=sources,
                icp=state.get("icp", {}),
            )
            outcomes.append(
                StepOutcome(
                    step="extract_candidates",
                    status="completed",
                    detail=f"Extracted {len(candidates)} candidate business accounts from source documents.",
                )
            )
            return {
                "candidate_companies": candidates,
                "step_outcomes": outcomes,
                "warnings": warnings,
            }
        except Exception as e:
            warnings.append(f"Candidate extraction error: {str(e)}")
            outcomes.append(
                StepOutcome(
                    step="extract_candidates",
                    status="failed",
                    detail=f"Candidate extraction failed: {str(e)}",
                )
            )
            return {
                "candidate_companies": [],
                "step_outcomes": outcomes,
                "warnings": warnings,
                "error": str(e),
            }

    def _node_relevance_gate(self, state: ResearchState) -> Dict[str, Any]:
        """
        RELEVANCE GATE: Evaluates candidates against:
        1. Domain normalization & deduplication
        2. Negative exclusions (agency, consulting, crypto gambling, etc.)
        3. Grounded identity (rejecting incidental mentions without substantive evidence)
        4. Target industry and problem relevance
        """
        outcomes = list(state.get("step_outcomes", []))
        warnings = list(state.get("warnings", []))
        candidates = state.get("candidate_companies", [])
        raw_sources = state.get("raw_sources", [])
        icp = state.get("icp", {})
        exclusions = [e.lower().strip() for e in icp.get("exclusions", []) if e.strip()]
        target_industries = [ind.lower().strip() for ind in icp.get("target_industries", []) if ind.strip()]

        source_url_map = {s.url: s for s in raw_sources}
        source_id_map = {s.source_id: s for s in raw_sources}

        accepted: List[CandidateCompany] = []
        rejected: List[CandidateRejection] = []
        seen_domains = set()

        for c in candidates:
            # 1. Normalize domain
            fallback_u = c.observed_facts[0].source_url if c.observed_facts else ""
            norm_domain = normalize_domain(c.domain, fallback_u)
            c.domain = norm_domain

            # 2. Check for duplicate domain
            if norm_domain in seen_domains:
                rejected.append(
                    CandidateRejection(
                        company_name=c.company_name,
                        domain=norm_domain,
                        reason=f"Duplicate domain '{norm_domain}' already evaluated in this research run.",
                        relevance_decision="rejected",
                    )
                )
                continue
            seen_domains.add(norm_domain)

            # 3. Check negative exclusions
            name_lower = c.company_name.lower()
            ind_lower = c.industry.lower()
            summary_lower = c.summary.lower()

            exclusion_match = None
            for excl in exclusions:
                if excl in name_lower or excl in ind_lower or excl in summary_lower:
                    exclusion_match = excl
                    break

            if exclusion_match:
                rejected.append(
                    CandidateRejection(
                        company_name=c.company_name,
                        domain=norm_domain,
                        reason=f"Matches negative exclusion criteria: '{exclusion_match}'.",
                        relevance_decision="rejected",
                    )
                )
                continue

            # 4. Check for incidental mentions
            # Rejects candidates that have no factual citations or are marked as incidental/comparison mentions
            is_incidental = (
                "incidental" in c.tags 
                or "incidental_mention" in c.tags 
                or "comparison_only" in c.tags 
                or not c.observed_facts
                or any("incidental mention" in f.fact.lower() for f in c.observed_facts)
            )
            if is_incidental:
                rejected.append(
                    CandidateRejection(
                        company_name=c.company_name,
                        domain=norm_domain,
                        reason=f"Incidental mention: Company '{c.company_name}' is mentioned only in passing without substantive evidence.",
                        relevance_decision="rejected",
                    )
                )
                continue

            # 5. Check industry alignment
            unrelated_keywords = [
                "bakery", "pet grooming", "hair salon", "plumbing", "coffee shop", "dry cleaner",
                "hospital", "medical clinic", "dental", "retail apparel", "fast food",
                "recruitment agency", "staffing firm", "consulting agency", "software outsourcing",
            ]
            if any(unr in ind_lower or unr in summary_lower for unr in unrelated_keywords):
                rejected.append(
                    CandidateRejection(
                        company_name=c.company_name,
                        domain=norm_domain,
                        reason=f"Unrelated business model: '{c.industry}' does not fit B2B software ICP.",
                        relevance_decision="rejected",
                    )
                )
                continue

            # Candidate passed relevance gate
            accepted.append(c)

        outcomes.append(
            StepOutcome(
                step="relevance_gate",
                status="completed",
                detail=f"Relevance gate passed {len(accepted)} accounts; rejected {len(rejected)} accounts.",
            )
        )

        return {
            "candidate_companies": accepted,
            "rejected_candidates": rejected,
            "step_outcomes": outcomes,
            "warnings": warnings,
        }

    def _node_ground_and_validate(self, state: ResearchState) -> Dict[str, Any]:
        """
        AUDITABLE EVIDENCE VALIDATION:
        1. Verifies source ID and URL against actual provider results.
        2. Verifies the source actually belongs to candidate company.
        3. Verifies fact text against provider snippet text (guards against invented metrics/dates).
        4. Demotes ungrounded claims to ExtractedHypothesis with clear rationale.
        5. Logs auditable EvidenceValidationOutcome records.
        """
        outcomes = list(state.get("step_outcomes", []))
        warnings = list(state.get("warnings", []))
        raw_sources = state.get("raw_sources", [])
        candidates = state.get("candidate_companies", [])

        source_url_map = {s.url: s for s in raw_sources}
        source_id_map = {s.source_id: s for s in raw_sources}

        validated_candidates: List[CandidateCompany] = []
        validation_outcomes: List[EvidenceValidationOutcome] = []

        for c in candidates:
            validated_facts: List[ExtractedFact] = []
            comp_token = re.sub(r"[^a-zA-Z0-9]", "", c.company_name.lower())
            domain_token = c.domain.split(".")[0].lower()

            for fact in c.observed_facts:
                matched_source = None
                if fact.source_url and fact.source_url in source_url_map:
                    matched_source = source_url_map[fact.source_url]
                elif fact.source_ids:
                    for sid in fact.source_ids:
                        if sid in source_id_map:
                            matched_source = source_id_map[sid]
                            break

                # Check 1: Provider Source ID & URL existence
                if not matched_source:
                    c.hypotheses.append(
                        ExtractedHypothesis(
                            hypothesis=fact.fact,
                            rationale="Demoted from observed fact: Citation URL/ID was not found in provider search results.",
                            confidence="speculative",
                        )
                    )
                    validation_outcomes.append(
                        EvidenceValidationOutcome(
                            fact=fact.fact,
                            company_name=c.company_name,
                            source_url=fact.source_url,
                            status="demoted_to_hypothesis",
                            reason="Fabricated or unknown source ID/URL not in provider results.",
                        )
                    )
                    continue

                # Check 2: Source Company Alignment (is source about this company?)
                src_text = f"{matched_source.title} {matched_source.snippet} {matched_source.url}".lower()
                clean_src = re.sub(r"[^a-zA-Z0-9]", "", src_text)
                company_in_source = (comp_token and comp_token in clean_src) or (len(domain_token) > 3 and domain_token in src_text)

                if not company_in_source:
                    c.hypotheses.append(
                        ExtractedHypothesis(
                            hypothesis=fact.fact,
                            rationale=f"Demoted from observed fact: Provider source '{matched_source.url}' is about another company, not {c.company_name}.",
                            confidence="speculative",
                        )
                    )
                    validation_outcomes.append(
                        EvidenceValidationOutcome(
                            fact=fact.fact,
                            company_name=c.company_name,
                            source_id=matched_source.source_id,
                            source_url=matched_source.url,
                            status="demoted_to_hypothesis",
                            reason=f"Source URL '{matched_source.url}' does not mention candidate company '{c.company_name}'.",
                        )
                    )
                    continue

                # Check 3: Semantic & Lexical Claim Grounding in Snippet
                is_supported, verify_msg = verify_claim_in_snippet(
                    fact.fact,
                    matched_source.snippet,
                    matched_source.title,
                )

                if not is_supported:
                    c.hypotheses.append(
                        ExtractedHypothesis(
                            hypothesis=fact.fact,
                            rationale=f"Demoted from observed fact: {verify_msg}",
                            confidence="medium",
                        )
                    )
                    validation_outcomes.append(
                        EvidenceValidationOutcome(
                            fact=fact.fact,
                            company_name=c.company_name,
                            source_id=matched_source.source_id,
                            source_url=matched_source.url,
                            status="demoted_to_hypothesis",
                            reason=verify_msg,
                        )
                    )
                    continue

                # Passed all validation checks: Genuine observed fact
                fact.source_url = matched_source.url
                fact.source_ids = [matched_source.source_id]
                fact.date = matched_source.published_date or fact.date
                fact.verified = True
                validated_facts.append(fact)

                validation_outcomes.append(
                    EvidenceValidationOutcome(
                        fact=fact.fact,
                        company_name=c.company_name,
                        source_id=matched_source.source_id,
                        source_url=matched_source.url,
                        status="accepted",
                        reason=verify_msg,
                    )
                )

            c.observed_facts = validated_facts
            if not c.observed_facts:
                c.missing_information.append("Zero verified factual citations found in provider search snippets.")

            validated_candidates.append(c)

        outcomes.append(
            StepOutcome(
                step="ground_and_validate",
                status="completed",
                detail=f"Audited {len(validation_outcomes)} factual claims: verified and grounded citations for {len(validated_candidates)} accounts.",
            )
        )

        return {
            "validated_candidates": validated_candidates,
            "evidence_validation_outcomes": validation_outcomes,
            "step_outcomes": outcomes,
            "warnings": warnings,
        }

    def _node_qualify_and_score(self, state: ResearchState) -> Dict[str, Any]:
        """
        Qualify candidates against saved ICP using deterministic rules scoring.
        LLMs never invent numerical scores.
        """
        outcomes = list(state.get("step_outcomes", []))
        warnings = list(state.get("warnings", []))
        icp = state.get("icp", {})
        candidates = state.get("validated_candidates", [])
        max_p = state.get("max_prospects", 5)

        qualified: List[Dict[str, Any]] = []
        skipped: List[Dict[str, Any]] = []

        for c in candidates:
            c_dict = {
                "company_name": c.company_name,
                "industry": c.industry,
                "sub_industry": c.sub_industry,
                "employee_count": c.employee_count,
                "headquarters": c.headquarters,
                "summary": c.summary,
                "target_buyer": {
                    "title": c.target_buyer_title or "",
                    "role_type": c.target_buyer_role or "",
                },
                "observed_facts": [f.model_dump() for f in c.observed_facts],
            }

            score_res = calculate_icp_score(c_dict, icp)
            fit_score = score_res["fit_score"]
            fit_level = score_res["fit_level"]
            fit_reasons = score_res["fit_reasons"]
            missing_info = list(set(c.missing_information + score_res["missing_information"]))

            prospect_dict = {
                "candidate": c,
                "fit_score": fit_score,
                "fit_level": fit_level,
                "fit_reasons": fit_reasons,
                "missing_information": missing_info,
                "scoring_breakdown": score_res["scoring_breakdown"],
            }

            if fit_score < 35 or score_res["scoring_breakdown"].get("exclusion_penalty"):
                skipped.append(prospect_dict)
            else:
                qualified.append(prospect_dict)

        qualified.sort(key=lambda x: x["fit_score"], reverse=True)
        bounded_qualified = qualified[:max_p]

        outcomes.append(
            StepOutcome(
                step="qualify_and_score",
                status="completed",
                detail=f"Deterministic rules scored {len(candidates)} accounts: {len(bounded_qualified)} qualified, {len(skipped)} skipped.",
            )
        )

        return {
            "qualified_prospects": bounded_qualified,
            "skipped_candidates": skipped,
            "step_outcomes": outcomes,
            "warnings": warnings,
        }

    def _node_synthesize_outreach(self, state: ResearchState) -> Dict[str, Any]:
        outcomes = list(state.get("step_outcomes", []))
        warnings = list(state.get("warnings", []))
        icp = state.get("icp", {})
        qualified = state.get("qualified_prospects", [])

        for item in qualified:
            c: CandidateCompany = item["candidate"]
            try:
                draft_data = self.llm_provider.generate_outreach_draft(
                    candidate=c,
                    verified_facts=c.observed_facts,
                    icp=icp,
                )
                item["email_draft"] = {
                    "subject": draft_data["subject"],
                    "body": draft_data["body"],
                    "customizationVariables": {
                        "{{first_name}}": c.target_buyer_name or "there",
                        "{{company}}": c.company_name,
                    },
                    "isApproved": False,
                    "notes": f"Generated from {len(c.observed_facts)} verified public sources. Requires founder approval before send.",
                }
                item["recommended_angle"] = {
                    "hook": draft_data["hook"],
                    "valueProposition": draft_data["value_proposition"],
                    "suggestedCta": draft_data["suggested_cta"],
                }
            except Exception as e:
                warnings.append(f"Draft synthesis warning for {c.company_name}: {str(e)}")
                item["email_draft"] = {
                    "subject": f"Connecting regarding {c.company_name}",
                    "body": f"Hi,\n\nNoticed {c.company_name}'s recent work.\n\nBest,\nFounding Team",
                    "customizationVariables": {},
                    "isApproved": False,
                    "notes": "Generated with standard template.",
                }
                item["recommended_angle"] = {
                    "hook": f"Recent activity at {c.company_name}",
                    "valueProposition": icp.get("value_proposition", ""),
                    "suggestedCta": "10-minute peer comparison",
                }

        outcomes.append(
            StepOutcome(
                step="synthesize_outreach",
                status="completed",
                detail=f"Synthesized reviewable outreach drafts for {len(qualified)} accounts grounded in verified facts.",
            )
        )

        return {
            "qualified_prospects": qualified,
            "step_outcomes": outcomes,
            "warnings": warnings,
        }

    def _node_persist_records(self, state: ResearchState) -> Dict[str, Any]:
        """
        Persist discovered prospects to SQLite with provenance='researched'.
        Guarantees existing demo records and user changes are never overwritten.
        """
        outcomes = list(state.get("step_outcomes", []))
        warnings = list(state.get("warnings", []))
        qualified = state.get("qualified_prospects", [])
        saved_ids: List[str] = []
        run_id = state.get("run_id", "run-default")

        if self.db is not None and qualified:
            now_dt = datetime.now(timezone.utc)

            for item in qualified:
                c: CandidateCompany = item["candidate"]
                prospect_id = f"prospect-live-{uuid.uuid4().hex[:8]}"

                facts_db = [
                    {
                        "id": f"fact-{idx + 1}",
                        "fact": f.fact,
                        "source": "Tavily Web Search",
                        "sourceUrl": f.source_url,
                        "date": f.date,
                        "verified": f.verified,
                    }
                    for idx, f in enumerate(c.observed_facts)
                ]

                hyp_db = [
                    {
                        "id": f"hyp-{idx + 1}",
                        "hypothesis": h.hypothesis,
                        "rationale": h.rationale,
                        "confidence": h.confidence,
                    }
                    for idx, h in enumerate(c.hypotheses)
                ]

                target_buyer = {
                    "name": c.target_buyer_name or "Unknown Decision Maker",
                    "title": c.target_buyer_title or "Sales Leader / Founder (Unverified)",
                    "emailPlaceholder": f"team@{c.domain}",
                    "linkedinNote": f"{c.target_buyer_name or 'Decision Maker'} | {c.company_name}",
                    "roleType": c.target_buyer_role or ("Sales / Growth Buyer" if c.target_buyer_title else "Unassigned / Needs Research"),
                }

                db_prospect = ProspectModel(
                    id=prospect_id,
                    company_name=c.company_name,
                    domain=c.domain,
                    industry=c.industry,
                    sub_industry=c.sub_industry,
                    headquarters=c.headquarters,
                    employee_count=c.employee_count,
                    stage=c.stage,
                    fit_score=item["fit_score"],
                    fit_level=item["fit_level"],
                    fit_reasons=item["fit_reasons"],
                    summary=c.summary,
                    pipeline_stage="to_research",
                    observed_facts=facts_db,
                    hypotheses=hyp_db,
                    missing_information=item["missing_information"],
                    uncertainty_indicators=c.uncertainty_indicators,
                    recommended_angle=item.get("recommended_angle", {}),
                    target_buyer=target_buyer,
                    email_draft=item.get("email_draft", {}),
                    tags=c.tags + ["Live Research", f"run:{run_id}"],
                    provenance="researched",
                    created_at=now_dt,
                    updated_at=now_dt,
                )

                self.db.add(db_prospect)
                saved_ids.append(prospect_id)

                draft_model = OutreachDraftModel(
                    id=f"draft-{prospect_id}",
                    prospect_id=prospect_id,
                    subject=item["email_draft"]["subject"],
                    body=item["email_draft"]["body"],
                    customization_variables=item["email_draft"].get("customizationVariables", {}),
                    is_approved=False,
                    notes=item["email_draft"].get("notes"),
                    created_at=now_dt,
                    updated_at=now_dt,
                )
                self.db.add(draft_model)

            rejections = state.get("rejected_candidates", [])
            sources = state.get("raw_sources", [])
            act = ActivityModel(
                id=f"act-{uuid.uuid4().hex[:8]}",
                timestamp="Just now",
                type="research_signal",
                title=f"Live Web Research Run Completed ({run_id})",
                description=(
                    f"Run ID: {run_id} | Saved {len(saved_ids)} accounts from {len(sources)} public sources. "
                    f"Relevance Gate: {len(qualified)} qualified, {len(rejections)} rejected. "
                    f"User instructions: '{state.get('user_instructions') or 'Default ICP'}'"
                ),
                prospect_name=qualified[0]["candidate"].company_name if qualified else None,
                user="Scout Engine",
                created_at=now_dt,
            )
            self.db.add(act)
            self.db.commit()

            outcomes.append(
                StepOutcome(
                    step="persist_records",
                    status="completed",
                    detail=f"Saved {len(saved_ids)} researched accounts and audit trail to SQLite.",
                )
            )
        else:
            outcomes.append(
                StepOutcome(
                    step="persist_records",
                    status="skipped",
                    detail="No new records persisted to database.",
                )
            )

        return {
            "saved_prospect_ids": saved_ids,
            "step_outcomes": outcomes,
            "warnings": warnings,
        }

    def run(self, initial_state: ResearchState) -> ResearchState:
        """Execute the LangGraph research pipeline."""
        if "run_id" not in initial_state:
            initial_state["run_id"] = f"run-{uuid.uuid4().hex[:8]}"
        if "rejected_candidates" not in initial_state:
            initial_state["rejected_candidates"] = []
        if "evidence_validation_outcomes" not in initial_state:
            initial_state["evidence_validation_outcomes"] = []

        final_state = self.app.invoke(initial_state)
        return final_state
