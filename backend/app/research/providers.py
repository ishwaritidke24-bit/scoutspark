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

    def plan_queries(self, icp: Dict[str, Any], user_instructions: Optional[str] = None) -> List[str]:
        client = self._get_client()
        from google.genai import types

        startup_name = icp.get("company_name", "Our Startup")
        product_name = icp.get("product_name", "B2B Solution")
        value_prop = icp.get("value_proposition", "")
        industries = ", ".join(icp.get("target_industries", [])[:3])
        pain_point = icp.get("primary_pain_point", "")
        roles = ", ".join(icp.get("target_roles", [])[:2])
        exclusions = ", ".join(icp.get("exclusions", [])[:3])

        prompt = f"""You are Scout, an analytical B2B prospect research engine.
The startup seeking customers is: '{startup_name}' (Product: '{product_name}').
Product Value Proposition: {value_prop}
Problem Solved: {pain_point}

TARGET PROSPECT CRITERIA (Businesses {startup_name} wants to acquire as prospective customers):
Target Industries: {industries}
Target Buyer Roles: {roles}
Negative Exclusions: {exclusions}
Additional Search Focus / Narrowing Instructions: {user_instructions or "None"}

CRITICAL RULES:
1. TARGET CUSTOMER ORIENTATION: Queries must seek ACTUAL PROSPECT BUSINESSES that would buy or use this product.
2. DO NOT query for '{startup_name}' or generic lead generation advice or marketing tutorials.
3. User instructions must only NARROW the search within the target ICP; they must NOT replace the ICP.
4. Formulate 2 to 3 concise, specific search queries seeking actual companies (e.g. engineering blogs, incident postmortems, expansion announcements, or hiring for the target buyer roles).
5. Return output as a valid JSON array of strings, e.g.: ["query 1", "query 2"]
"""
        try:
            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )
            data = json.loads(response.text)
            if isinstance(data, list) and len(data) > 0:
                return [str(q).strip() for q in data[:3] if str(q).strip()]
        except Exception as e:
            logger.warning(f"Gemini query planning failed, using fallback query: {e}")

        # Deterministic fallback query based on ICP
        first_ind = icp.get("target_industries", ["B2B SaaS"])[0]
        return [
            f"{first_ind} startup company announcement incident",
            f"{first_ind} engineering blog hiring infrastructure",
        ]

    def extract_candidates(
        self, sources: List[SourceReference], icp: Dict[str, Any]
    ) -> List[CandidateCompany]:
        if not sources:
            return []

        client = self._get_client()
        from google.genai import types

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

        target_industries = icp.get("target_industries", [])
        value_prop = icp.get("value_proposition", "")

        prompt = f"""You are Scout, an evidence-grounded B2B intelligence analyst.
Analyze the following web search snippets and extract candidate companies that could be potential B2B customers for:
Product Value Proposition: {value_prop}
Target Industries: {', '.join(target_industries)}

Sources retrieved from public web:
{json.dumps(sources_payload, indent=2)}

STRICT GROUNDING & EVIDENCE RULES:
1. Every candidate MUST be an actual company mentioned in the search sources.
2. 'observed_facts': MUST cite ONLY facts explicitly stated in the snippets. You MUST provide the exact source_id and source_url from the sources above. DO NOT hallucinate facts, metrics, or citations.
3. 'hypotheses': Separate hypotheses (speculative assumptions about what the company might need) from observed facts. Give rationale and confidence ('high', 'medium', 'speculative').
4. 'missing_information': List what critical data is missing from the search snippets (e.g. unknown headcount, unverified cloud provider).
5. DO NOT confuse the startup providing the tool with the prospect companies.
6. Extract at most 4 high-quality candidates. If no company fits or snippets are irrelevant, return an empty array [].

Return a JSON array of objects adhering to this schema:
[
  {{
    "company_name": "Company Name",
    "domain": "company.domain (or derived from url)",
    "industry": "Industry category",
    "sub_industry": "Specific niche",
    "headquarters": "City, Country or Remote",
    "employee_count": "e.g. 30-50 employees or Unknown",
    "stage": "e.g. Series A or Early Stage",
    "summary": "1-2 sentence executive summary grounded in the sources",
    "target_buyer_name": "Name if found in source, else null",
    "target_buyer_title": "Title if found in source, else null",
    "target_buyer_role": "Role description",
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
        "hypothesis": "Reasoning about their likely challenge",
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
            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
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
        from google.genai import types

        facts_text = "\n".join([f"- {f.fact} (Source: {f.source_url})" for f in verified_facts])
        value_prop = icp.get("value_proposition", "")
        buyer_name = candidate.target_buyer_name or "there"
        buyer_title = candidate.target_buyer_title or "Engineering Leader"

        prompt = f"""Write a personalized cold email draft to:
Recipient: {buyer_name} ({buyer_title} at {candidate.company_name})
Startup Value Proposition: {value_prop}

Grounded Public Facts (ONLY cite these verified facts):
{facts_text}

ETHICAL OUTREACH RULES:
1. Ground the hook strictly in one of the verified facts above.
2. Professional, engineering peer tone. Zero aggressive sales hype, no fake scarcity, no deception.
3. Keep the email concise: between 75 and 130 words.
4. Conclude with a frictionless, low-commitment CTA (e.g. 10-minute peer comparison).
5. Output format: JSON object with keys "subject", "body", "hook", "value_proposition", "suggested_cta".
"""
        try:
            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )
            data = json.loads(response.text)
            return {
                "subject": data.get("subject", f"Quick question regarding {candidate.company_name}"),
                "body": data.get("body", f"Hi {buyer_name},\n\nNoticed your recent work at {candidate.company_name}."),
                "hook": data.get("hook", f"Noticed public signals from {candidate.company_name}."),
                "value_proposition": data.get("value_proposition", value_prop),
                "suggested_cta": data.get("suggested_cta", "12-minute technical peer comparison"),
            }
        except Exception as e:
            logger.warning(f"Gemini draft generation failed, using structured template: {e}")
            return {
                "subject": f"Question regarding {candidate.company_name}'s recent technical milestone",
                "body": f"Hi {buyer_name},\n\nNoticed {candidate.company_name}'s recent work.\n\nWe built an engine that helps teams with {value_prop}.\n\nWould you be open to a brief 10-minute conversation?\n\nBest,\nFounding Team, ScoutSpark",
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
