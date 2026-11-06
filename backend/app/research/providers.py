import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import re
from urllib.parse import urlparse

from .state import SourceReference, CandidateCompany, ExtractedFact, ExtractedHypothesis
from ..config import settings

logger = logging.getLogger("scoutspark.research.providers")


# ============================================================================
# SEARCH PROVIDERS
# ============================================================================

class BaseSearchProvider:
    def search(self, query: str, max_results: int = 5) -> List[SourceReference]:
        raise NotImplementedError


_DEFAULT = object()

class TavilySearchProvider(BaseSearchProvider):
    def __init__(self, api_key: Any = _DEFAULT):
        if api_key is _DEFAULT:
            self.api_key = settings.tavily_api_key
        else:
            self.api_key = api_key

    def search(self, query: str, max_results: int = 4) -> List[SourceReference]:
        if not self.api_key or not self.api_key.strip():
            raise ValueError("Tavily API key is not configured. Live search requires TAVILY_API_KEY.")

        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.api_key)
            
            # Limit results strictly to conservative budget (max 5 per query)
            bounded_max = min(max_results, 5)
            response = client.search(
                query=query,
                search_depth="basic",
                max_results=bounded_max,
                include_answer=False,
            )

            raw_results = response.get("results", [])
            sources: List[SourceReference] = []
            now_iso = datetime.now(timezone.utc).isoformat()

            seen_urls = set()
            for idx, item in enumerate(raw_results):
                url = item.get("url", "").strip()
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)

                sources.append(
                    SourceReference(
                        source_id=f"src-{len(sources) + 1}",
                        url=url,
                        title=item.get("title", "").strip() or "Web Source",
                        snippet=item.get("content", "").strip(),
                        provider="tavily",
                        published_date=item.get("published_date"),
                        retrieved_at=now_iso,
                    )
                )

            return sources

        except Exception as e:
            err_msg = str(e)
            if "unauthorized" in err_msg.lower() or "401" in err_msg:
                raise ValueError("Tavily API authentication failed. Verify TAVILY_API_KEY.")
            if "quota" in err_msg.lower() or "rate" in err_msg.lower() or "429" in err_msg:
                raise ValueError("Tavily API quota or rate limit exceeded.")
            raise RuntimeError(f"Tavily search error: {err_msg}")


class MockSearchProvider(BaseSearchProvider):
    """Deterministic mock search provider for offline tests."""
    def __init__(self, fixture_results: Optional[List[SourceReference]] = None):
        self.fixture_results = fixture_results

    def search(self, query: str, max_results: int = 4) -> List[SourceReference]:
        if self.fixture_results is not None:
            return self.fixture_results[:max_results]
        
        # Default mock sources
        now_iso = datetime.now(timezone.utc).isoformat()
        return [
            SourceReference(
                source_id="src-1",
                url="https://synapsecloud.internal/blog/distributed-tracing-bottlenecks",
                title="SynapseCloud Engineering: Resolving Kafka Trace Ingestion Lag",
                snippet="SynapseCloud is a 45-person cloud routing platform. In Sept 2026, our infrastructure team migrated to eBPF profiling after Kafka broker buffer saturation.",
                provider="tavily",
                published_date="2026-09-20",
                retrieved_at=now_iso,
            ),
            SourceReference(
                source_id="src-2",
                url="https://synapsecloud.internal/careers/senior-infrastructure-lead",
                title="SynapseCloud Careers: Senior Infrastructure Engineer",
                snippet="SynapseCloud is hiring a Senior Infrastructure Lead in San Francisco reporting to VP of Platform Marcus Brody to manage Kubernetes telemetry scale.",
                provider="tavily",
                published_date="2026-10-05",
                retrieved_at=now_iso,
            ),
        ]


# ============================================================================
# LLM PROVIDERS (GEMINI API)
# ============================================================================

class BaseLLMProvider:
    def plan_queries(self, icp: Dict[str, Any], user_instructions: Optional[str] = None) -> List[str]:
        raise NotImplementedError

    def extract_candidates(
        self, sources: List[SourceReference], icp: Dict[str, Any]
    ) -> List[CandidateCompany]:
        raise NotImplementedError

    def generate_outreach_draft(
        self,
        candidate: CandidateCompany,
        verified_facts: List[ExtractedFact],
        icp: Dict[str, Any],
    ) -> Dict[str, Any]:
        raise NotImplementedError


class GeminiLLMProvider(BaseLLMProvider):
    def __init__(self, api_key: Any = _DEFAULT, model: Optional[str] = None):
        if api_key is _DEFAULT:
            self.api_key = settings.gemini_api_key
        else:
            self.api_key = api_key
        self.model = model or settings.gemini_model

    def _get_client(self):
        if not self.api_key or not self.api_key.strip():
            raise ValueError("Gemini API key is not configured. Live research requires GEMINI_API_KEY.")
        from google import genai
        return genai.Client(api_key=self.api_key)

    def _generate_with_retry(self, client, prompt: str, temperature: float = 0.2):
        from google.genai import types
        candidate_models = [self.model]
        for fallback in ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-flash-latest"]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_err = None
        for mod in candidate_models:
            try:
                response = client.models.generate_content(
                    model=mod,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=temperature,
                    ),
                )
                return response
            except Exception as e:
                last_err = e
                err_str = str(e).lower()
                if "404" in err_str or "not_found" in err_str or "503" in err_str or "unavailable" in err_str:
                    logger.warning(f"Gemini model {mod} encountered {e}; trying next model...")
                    continue
                raise e
        raise last_err or RuntimeError("All candidate Gemini models failed.")

    def plan_queries(self, icp: Dict[str, Any], user_instructions: Optional[str] = None) -> List[str]:
        client = self._get_client()

        startup_name = icp.get("company_name", "Our Startup")
        product_name = icp.get("product_name", "Our Product")
        value_prop = icp.get("value_proposition", "")
        company_desc = icp.get("company_description", "")
        industries = ", ".join(icp.get("target_industries", [])[:4]) or "B2B Technology"
        pain_point = icp.get("primary_pain_point", "")
        roles = ", ".join(icp.get("target_roles", [])[:3]) or "Decision Maker"
        geographies = ", ".join(icp.get("target_geographies", [])[:3]) or "Global"
        exclusions = ", ".join(icp.get("exclusions", [])[:3])

        prompt = f"""You are Scout, an analytical B2B prospect research engine.
Your mission is to find REAL prospective customer companies on the public web for this startup:
- Startup Seeking Customers: '{startup_name}' (Product: '{product_name}')
- Value Proposition: {value_prop or company_desc}
- Problem Solved / Primary Pain Point: {pain_point}

TARGET PROSPECT CRITERIA (Businesses {startup_name} wants to discover as potential customers):
- Target Industries: {industries}
- Target Buyer Personas / Roles: {roles}
- Target Geographies: {geographies}
- Negative Exclusions: {exclusions or "None"}
- Additional Search Focus / Narrowing Instructions: {user_instructions or "None"}

CRITICAL RULES FOR SEARCH QUERY GENERATION:
1. PROSPECT CUSTOMER ORIENTATION: Queries must search for ACTUAL THIRD-PARTY COMPANIES that would buy or use a solution for: {pain_point or value_prop}.
2. DO NOT query for '{startup_name}' or generic sales tutorials. You are discovering external prospective businesses.
3. Formulate high-intent search queries that uncover real companies exhibiting buying signals, expansion, hiring in target roles ({roles}), or public milestones in target industries ({industries}).
4. If narrowing instructions are provided, reflect them directly in the search queries.
5. Formulate 2 to 3 concise, specific search queries seeking actual companies.
6. Return output strictly as a valid JSON array of strings, e.g.: ["query 1", "query 2"]
"""
        try:
            response = self._generate_with_retry(client, prompt, temperature=0.2)
            data = json.loads(response.text)
            if isinstance(data, list) and len(data) > 0:
                return [str(q).strip() for q in data[:3] if str(q).strip()]
        except Exception as e:
            logger.warning(f"Gemini query planning failed, using fallback query: {e}")

        # Deterministic fallback query based on ICP
        first_ind = icp.get("target_industries", ["B2B SaaS"])[0]
        first_role = icp.get("target_roles", ["Leadership", "Founder"])[0]
        return [
            f"{first_ind} startup hiring {first_role}",
            f"{first_ind} company expansion announcement",
        ]

    def extract_candidates(
        self, sources: List[SourceReference], icp: Dict[str, Any]
    ) -> List[CandidateCompany]:
        if not sources:
            return []

        client = self._get_client()

        sources_payload = [
            {
                "source_id": s.source_id,
                "url": s.url,
                "title": s.title,
                "snippet": s.snippet,
                "published_date": s.published_date,
            }
            for s in sources
        ]

        startup_name = icp.get("company_name", "Our Startup")
        product_name = icp.get("product_name", "Our Solution")
        value_prop = icp.get("value_proposition", "")
        company_desc = icp.get("company_description", "")
        target_industries = icp.get("target_industries", [])
        target_roles = icp.get("target_roles", [])
        exclusions = icp.get("exclusions", [])

        prompt = f"""You are Scout, an evidence-grounded B2B intelligence analyst.
Analyze the following web search snippets and extract candidate companies that could be genuine potential customers for:
- Startup: {startup_name}
- Product: {product_name}
- Value Proposition: {value_prop or company_desc}
- Target Industries: {', '.join(target_industries) or 'Technology & Software'}
- Target Buyer Personas: {', '.join(target_roles) or 'Founders, Executives, Team Leads'}
- Exclusions: {', '.join(exclusions) or 'Consumer-only apps, agencies, IT consultancies'}

Sources retrieved from public web:
{json.dumps(sources_payload, indent=2)}

STRICT GROUNDING & EVIDENCE RULES:
1. Every candidate MUST be an actual company explicitly mentioned in the search sources above.
2. DO NOT extract {startup_name}. Extract prospective client companies.
3. REJECT companies matching the exclusions ({', '.join(exclusions)}). Do NOT extract them.
4. 'observed_facts': MUST cite ONLY facts explicitly stated in the snippets. You MUST provide the exact source_id and source_url from the sources above. DO NOT hallucinate facts, metrics, or citations.
5. 'hypotheses': Separate hypotheses (speculative assumptions about why this company might need {product_name}) from observed facts. Give clear rationale and confidence ('high', 'medium', 'speculative').
6. 'target_buyer_name' and 'target_buyer_title': ONLY extract if a specific founder, executive, or leader matching the target roles is explicitly named in the snippet. DO NOT use the author of an engineering postmortem or blog article as the buyer unless explicitly identified as a commercial/technical decision-maker. If the buyer is not explicitly named in the source, set both to null.
7. 'employee_count': If the snippet does not explicitly mention headcount, write "Unknown". Never invent headcount.
8. 'headquarters': If not mentioned in the snippet, write "Unknown". Never invent locations.
9. 'stage': If not mentioned in the snippet, write "Unknown". Never invent funding stages.
10. 'missing_information': Explicitly list missing facts (e.g. "Specific decision maker unverified in snippet", "Headcount unknown").
11. Extract at most 3 high-quality candidates. If no company fits or snippets are irrelevant, return an empty array []. DO NOT pad results.

Return a JSON array of objects adhering to this schema:
[
  {{
    "company_name": "Company Name",
    "domain": "company.domain (or derived from url)",
    "industry": "Industry category",
    "sub_industry": "Specific niche",
    "headquarters": "City, Country or Unknown",
    "employee_count": "e.g. 40 employees or Unknown",
    "stage": "e.g. Seed, Series A, or Unknown",
    "summary": "1-2 sentence executive summary grounded in the sources",
    "target_buyer_name": "Name if explicitly named in source, else null",
    "target_buyer_title": "Title if explicitly named in source, else null",
    "target_buyer_role": "Role description (e.g. Target Buyer or Unassigned)",
    "observed_facts": [
      {{
        "fact": "Factual claim directly supported by snippet",
        "source_ids": ["src-1"],
        "source_url": "Exact URL from matching source_id",
        "date": "Date if in snippet, else null",
        "verified": true
      }}
    ],
    "hypotheses": [
      {{
        "hypothesis": "Reasoning about their potential customer fit",
        "rationale": "Why this hypothesis makes sense based on the facts",
        "confidence": "high"
      }}
    ],
    "missing_information": ["List of missing facts"],
    "uncertainty_indicators": ["Any risk flags or unknowns"],
    "tags": ["Tag1", "Tag2"]
  }}
]
"""
        try:
            response = self._generate_with_retry(client, prompt, temperature=0.1)
            raw_candidates = json.loads(response.text)
            if not isinstance(raw_candidates, list):
                return []

            candidates: List[CandidateCompany] = []
            for item in raw_candidates:
                try:
                    candidates.append(CandidateCompany(**item))
                except Exception as parse_err:
                    logger.warning(f"Skipping malformed candidate object: {parse_err}")

            return candidates

        except Exception as e:
            logger.error(f"Gemini candidate extraction error: {e}")
            raise RuntimeError(f"Gemini candidate extraction failed: {str(e)}")

    def generate_outreach_draft(
        self,
        candidate: CandidateCompany,
        verified_facts: List[ExtractedFact],
        icp: Dict[str, Any],
    ) -> Dict[str, Any]:
        client = self._get_client()

        facts_text = "\n".join([f"- {f.fact} (Source: {f.source_url})" for f in verified_facts])
        startup_name = icp.get("company_name", "Our Team")
        product_name = icp.get("product_name", "our solution")
        value_prop = icp.get("value_proposition", "solve key operational bottlenecks with evidence-grounded intelligence")
        buyer_name = candidate.target_buyer_name or "there"
        buyer_title = candidate.target_buyer_title or "Leadership Team"

        prompt = f"""Write an honest, personalized cold outreach draft from {startup_name} to:
Recipient: {buyer_name} ({buyer_title} at {candidate.company_name})
Our Product: {product_name}
Startup Value Proposition: {value_prop}

Grounded Public Facts about {candidate.company_name} (ONLY cite these verified facts):
{facts_text}

HONEST OUTREACH RULES:
1. Ground the opening hook strictly in one of the verified facts above (e.g. recent product expansion, hiring milestone, or public announcement).
2. Authentic, respectful founder-to-founder or peer tone. Zero aggressive sales hype, no fake scarcity, no deception.
3. DO NOT invent an unproven business problem.
4. DO NOT make unsupported percentage or numerical claims (e.g. do not say "cut time by 80%" or "triple your reply rate").
5. Explain simply and honestly how {startup_name}'s {product_name} helps: {value_prop}.
6. Keep the email concise: between 65 and 110 words.
7. Conclude with a frictionless, zero-pressure question.
8. Output format: JSON object with keys "subject", "body", "hook", "value_proposition", "suggested_cta".
"""
        try:
            response = self._generate_with_retry(client, prompt, temperature=0.2)
            data = json.loads(response.text)
            return {
                "subject": data.get("subject", f"Connecting regarding {candidate.company_name}"),
                "body": data.get("body", f"Hi {buyer_name},\n\nNoticed your recent work at {candidate.company_name}."),
                "hook": data.get("hook", f"Noticed public signals from {candidate.company_name}."),
                "value_proposition": data.get("value_proposition", value_prop),
                "suggested_cta": data.get("suggested_cta", "Brief 10-minute chat or sample brief"),
            }
        except Exception as e:
            logger.warning(f"Gemini draft generation failed, using structured template: {e}")
            return {
                "subject": f"Connecting with {candidate.company_name}",
                "body": f"Hi {buyer_name},\n\nNoticed {candidate.company_name}'s recent work.\n\nWe built {product_name} at {startup_name} to help teams: {value_prop}.\n\nWould you be open to a brief 10-minute conversation?\n\nBest,\nFounding Team, {startup_name}",
                "hook": f"Recent activity at {candidate.company_name}",
                "value_proposition": value_prop,
                "suggested_cta": "10-minute brief chat",
            }


class MockLLMProvider(BaseLLMProvider):
    """Deterministic mock LLM provider for unit tests."""
    def __init__(self, candidate_fixtures: Optional[List[CandidateCompany]] = None):
        self.candidate_fixtures = candidate_fixtures

    def plan_queries(self, icp: Dict[str, Any], user_instructions: Optional[str] = None) -> List[str]:
        return [
            "Developer Tools infrastructure Kafka postmortem",
            "Cloud observability eBPF startup careers",
        ]

    def extract_candidates(
        self, sources: List[SourceReference], icp: Dict[str, Any]
    ) -> List[CandidateCompany]:
        if self.candidate_fixtures is not None:
            return self.candidate_fixtures

        # Standard deterministic test fixture
        src_url = sources[0].url if sources else "https://synapsecloud.internal/blog"
        src_id = sources[0].source_id if sources else "src-1"
        return [
            CandidateCompany(
                company_name="SynapseCloud",
                domain="synapsecloud.internal",
                industry="Developer Tools & Infrastructure",
                sub_industry="Edge Routing & Distributed Tracing",
                headquarters="San Francisco, CA",
                employee_count="45 employees",
                stage="Series A ($8.5M)",
                summary="Edge routing platform handling 15M requests/sec experiencing trace latency bottlenecks.",
                target_buyer_name="Marcus Brody",
                target_buyer_title="VP of Platform",
                target_buyer_role="Platform Infrastructure Decision Maker",
                observed_facts=[
                    ExtractedFact(
                        fact="Migrated to eBPF profiling after Kafka buffer saturation (Sept 2026).",
                        source_ids=[src_id],
                        source_url=src_url,
                        date="2026-09-20",
                        verified=True,
                    )
                ],
                hypotheses=[
                    ExtractedHypothesis(
                        hypothesis="Engineering team is seeking automated telemetry compression to reduce cloud spend.",
                        rationale="Kafka buffer lag cited in public retrospective.",
                        confidence="high",
                    )
                ],
                missing_information=["Exact AWS egress bill", "Current database retention window"],
                uncertainty_indicators=["Procurement cycle unknown"],
                tags=["Edge", "Tracing", "Series A"],
            )
        ]

    def generate_outreach_draft(
        self,
        candidate: CandidateCompany,
        verified_facts: List[ExtractedFact],
        icp: Dict[str, Any],
    ) -> Dict[str, Any]:
        return {
            "subject": f"SynapseCloud's Kafka trace buffering & 4x compression benchmark",
            "body": f"Hi Marcus,\n\nRead your post on SynapseCloud's Kafka buffer saturation during high-throughput edge routing.\n\nWe built a lightweight proxy that drops telemetry storage costs by ~65% while keeping 100% trace fidelity for anomalies.\n\nWould you be open to a 10-minute technical peer comparison?\n\nBest,\nFounding Team, ScoutSpark",
            "hook": "Read your post on SynapseCloud's Kafka buffer saturation",
            "value_proposition": "Drop telemetry storage costs by ~65% while keeping 100% trace fidelity",
            "suggested_cta": "10-minute technical peer comparison",
        }
