from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .models import ProspectModel, ICPModel, ActivityModel, OutreachDraftModel


SEED_ICP = {
    "company_name": "ScoutSpark AI",
    "product_name": "SignalEngine B2B",
    "company_description": "High-signal prospecting and account intelligence platform that translates live company events, engineering artifacts, and organizational shifts into evidence-backed customer outreach.",
    "value_proposition": "Cut outreach research time by 80% while increasing qualified reply rates by providing verifiable facts, clear hypothesis separation, and human-in-the-loop email drafts.",
    "target_industries": [
        "Developer Tools & Infrastructure",
        "HealthTech & Digital Health",
        "Fintech & Payments Infrastructure",
        "AI Operations & Enterprise SaaS",
        "Supply Chain & Logistics Tech",
    ],
    "target_roles": [
        "VP of Engineering",
        "Chief Medical Officer / Clinical Ops",
        "Head of Finance Operations",
        "Head of Machine Learning / AI",
        "VP of Operations",
        "Head of Product",
    ],
    "target_geographies": [
        "North America",
        "United Kingdom & Ireland",
        "DACH & Western Europe",
    ],
    "company_size_ranges": [
        "20 - 50 employees",
        "51 - 150 employees",
        "151 - 300 employees",
    ],
    "funding_stages": [
        "Seed ($2M - $5M)",
        "Series A ($6M - $18M)",
        "Series B ($20M - $35M)",
    ],
    "exclusions": [
        "Agencies / Consultancies",
        "Pure B2C Apps",
        "Companies under 10 people without funding",
    ],
    "primary_pain_point": "Account executives and founders spend 45 minutes manually digging through job posts, GitHub commits, and PRs just to write one mediocre cold email.",
    "last_updated": "2026-10-23T08:00:00Z",
}

SEED_PROSPECTS = [
    {
        "id": "prospect-01",
        "company_name": "KiteMetrics",
        "domain": "kitemetrics.internal",
        "industry": "Developer Tools & Infrastructure",
        "sub_industry": "Distributed Tracing & Observability",
        "headquarters": "San Francisco, CA & Remote",
        "employee_count": "42 employees",
        "stage": "Series A ($9.2M • Lead: Horizon Capital)",
        "fit_score": 96,
        "fit_level": "exceptional",
        "fit_reasons": [
            "Explicit technical bottleneck mentioned in recent public incident postmortem",
            "VP Engineering recently hired to scale team from 15 to 45 engineers",
            "Public GitHub repo activity shows multi-tenant telemetry ingestion spike",
            "Matches exact target ICP: Series A, Developer Infrastructure, 35-50 headcount",
        ],
        "summary": "Cloud-native observability provider experiencing exponential trace ingestion volume after landing three mid-market fintech customers.",
        "pipeline_stage": "ready_to_review",
        "tags": ["High Velocity", "Post-Series A", "Technical Buyer", "Incident Postmortem"],
        "observed_facts": [
            {
                "id": "fact-01",
                "fact": "Published a technical incident retrospective citing Kafka broker lag and trace retention storage overhead (Dated: Sept 2026).",
                "source": "Engineering Blog Post (Simulated Archive)",
                "source_url": "https://demo.scoutspark.internal/signals/kitemetrics-postmortem",
                "date": "2026-09-14",
                "verified": True,
            },
            {
                "id": "fact-02",
                "fact": "Currently recruiting 3 Senior Infrastructure Engineers with Kubernetes and eBPF kernel profiling expertise.",
                "source": "Careers Page API Snapshot",
                "source_url": "https://demo.scoutspark.internal/signals/kitemetrics-careers",
                "date": "2026-10-02",
                "verified": True,
            },
            {
                "id": "fact-03",
                "fact": "Elena Rostova (ex-Stripe Infrastructure Staff) stepped into the VP Engineering role 4 months ago.",
                "source": "Executive Movement Monitor",
                "date": "2026-06-18",
                "verified": True,
            },
        ],
        "hypotheses": [
            {
                "id": "hyp-01",
                "hypothesis": "The engineering team is struggling to balance enterprise customer SLAs with ballooning telemetry storage costs.",
                "rationale": "Correlating the sudden 3x node cluster increase with the retrospective commentary on storage cost per gigabyte.",
                "confidence": "high",
            },
            {
                "id": "hyp-02",
                "hypothesis": "Elena has a 90-day mandate from the board to optimize reliability without tripling the cloud infrastructure budget.",
                "rationale": "Standard Series A executive onboarding priority after high-profile retention incident.",
                "confidence": "medium",
            },
        ],
        "missing_information": [
            "Exact monthly AWS/GCP cloud egress bill (estimated between $40k-$75k/mo)",
            "Whether internal tooling team has begun prototyping a custom in-house gateway",
        ],
        "recommended_angle": {
            "hook": "Referencing Elena's recent engineering essay on high-cardinality trace bottlenecks and offering our benchmark data on 4x cheaper compression.",
            "valueProposition": "Cut ingest telemetry overhead without dropping trace spans or slowing query latency.",
            "suggestedCta": "Brief 15-minute technical sanity check to compare KiteMetrics' p99 compression curves.",
        },
        "target_buyer": {
            "name": "Elena Rostova",
            "title": "VP of Engineering",
            "emailPlaceholder": "elena@kitemetrics.internal",
            "linkedinNote": "Elena Rostova | ex-Stripe Staff | VP Eng KiteMetrics",
            "roleType": "Technical Decision Maker & Budget Owner",
        },
        "email_draft": {
            "subject": "Your post on Kafka trace overhead & KiteMetrics' p99 latency",
            "body": "Hi Elena,\n\nRead your candid postmortem on KiteMetrics' Kafka buffer saturation during last month's enterprise ingest surge. Loved the transparency on where your team spent 36 hours diagnosing span drops.\n\nMost Series A observability startups hit that exact wall when trace cardinality triples: you're either forced to sample aggressively (frustrating developers) or watch your storage tier eat your ARR.\n\nWe built a lightweight ingestion proxy specifically for fast-growing platforms handling >20M spans/sec. It drops storage costs by ~65% while keeping 100% trace fidelity for anomalous traces.\n\nWould you be open to a 12-minute technical peer review on how Teams like Vector and HyperScale solved this without rewriting their collectors?\n\nBest,\nAlex Rivera\nFounding Team, ScoutSpark",
            "customizationVariables": {
                "{{first_name}}": "Elena",
                "{{company}}": "KiteMetrics",
                "{{recent_event}}": "Kafka buffer postmortem",
                "{{pain_point}}": "Trace cardinality & storage tier cost",
            },
            "isApproved": False,
            "notes": "Drafted using verified facts #fact-01 and #fact-03. Tone is engineering-peer, not sales pitch.",
        },
        "uncertainty_indicators": [
            "Exact current cloud provider (observed AWS artifacts, but possible GCP hybrid deployment)",
            "Decision timeline: may take 30 days due to SOC2 audit cycle",
        ],
        "provenance": "demo",
    },
    {
        "id": "prospect-02",
        "company_name": "AuraPulse Health",
        "domain": "aurapulsehealth.internal",
        "industry": "HealthTech & Digital Health",
        "sub_industry": "Outpatient Clinic Workflow & Intake",
        "headquarters": "Austin, TX",
        "employee_count": "78 employees",
        "stage": "Series A ($12M • Lead: Oakridge Health Ventures)",
        "fit_score": 92,
        "fit_level": "exceptional",
        "fit_reasons": [
            "Rapid physical expansion: opened 6 new clinics across Texas in 4 months",
            "Chief Medical Officer publicly noted clinician administrative burnout",
            "Hiring Clinical Intake Coordinators and EHR Integration Engineers",
            "High willingness to adopt AI tools that maintain HIPAA air-gap compliance",
        ],
        "summary": "Modern hybrid clinic operator providing same-day preventative and chronic care, currently strained by front-desk check-in bottlenecks.",
        "pipeline_stage": "ready_to_review",
        "tags": ["HealthTech", "Clinic Network", "Fast Expansion", "HIPAA Ready"],
        "observed_facts": [
            {
                "id": "fact-04",
                "fact": "Announced acquisition of 4 Austin regional family care practices on Oct 1, bringing total locations to 14.",
                "source": "Digital Health Wire Press Release (Simulated)",
                "date": "2026-10-01",
                "verified": True,
            },
            {
                "id": "fact-05",
                "fact": "Dr. Marcus Vance published an op-ed on 'The 18-minute intake friction in modern primary care'.",
                "source": "Modern Physician Quarterly",
                "date": "2026-08-20",
                "verified": True,
            },
            {
                "id": "fact-06",
                "fact": "EHR stack includes AthenaHealth and an internal TypeScript-based patient portal.",
                "source": "Engineering Job Description Archive",
                "date": "2026-09-11",
                "verified": True,
            },
        ],
        "hypotheses": [
            {
                "id": "hyp-03",
                "hypothesis": "Front-desk intake staff are manually copying patient insurance waivers into the EHR, slowing clinic throughput by 20%.",
                "rationale": "Direct correlation between the 14 new locations and open requisitions for 8 front-desk coordinators.",
                "confidence": "high",
            }
        ],
        "missing_information": [
            "Whether AthenaHealth API rate limits have previously disrupted their portal",
            "Budget authorization limit of the Chief Medical Officer vs CEO",
        ],
        "recommended_angle": {
            "hook": "Connect Dr. Vance's op-ed on 18-minute wait times directly to an automated, zero-clerk intake pipeline.",
            "valueProposition": "Eliminate repetitive patient data re-entry while cutting check-in time down to 90 seconds.",
            "suggestedCta": "Offer a 10-minute demo showing the AthenaHealth zero-click sync in action.",
        },
        "target_buyer": {
            "name": "Dr. Marcus Vance",
            "title": "Chief Medical Officer & Co-Founder",
            "emailPlaceholder": "marcus.vance@aurapulsehealth.internal",
            "linkedinNote": "Dr. Marcus Vance MD | CMO AuraPulse | Primary Care Innovation",
            "roleType": "Clinical Workflow Champion",
        },
        "email_draft": {
            "subject": "AuraPulse's 14-clinic expansion & Dr. Vance's 18-min intake thesis",
            "body": "Hi Dr. Vance,\n\nCongratulations on bringing AuraPulse to 14 clinics this month across Central Texas.\n\nI caught your essay in Modern Physician on the '18-minute intake friction'—especially your point about clinicians spending the first 6 minutes of an appointment re-verifying information the patient already typed into a clipboard.\n\nWe built an ambient intake intelligence module that bridges mobile check-in directly into AthenaHealth. Clinics using it have brought patient intake down to 85 seconds with zero manual transcription by clinical staff.\n\nWould you be open to an 11-minute look at how this works on AthenaHealth before your next clinic rollout?\n\nWarm regards,\nAlex Rivera\nFounding Team, ScoutSpark",
            "customizationVariables": {
                "{{first_name}}": "Dr. Vance",
                "{{company}}": "AuraPulse",
                "{{recent_event}}": "Expansion to 14 clinics",
                "{{pain_point}}": "18-minute check-in friction",
            },
            "isApproved": False,
            "notes": "Warm, respectful clinical tone. Highlights understanding of AthenaHealth integration constraints.",
        },
        "uncertainty_indicators": [
            "Clinical procurement committee review cycles can take 6-8 weeks",
            "EHR security review required",
        ],
        "provenance": "demo",
    },
    {
        "id": "prospect-03",
        "company_name": "VeritasFlow",
        "domain": "veritasflow.internal",
        "industry": "Fintech & Payments Infrastructure",
        "sub_industry": "Ledger Settlement & Multi-currency Clearing",
        "headquarters": "London, UK & New York, NY",
        "employee_count": "34 employees",
        "stage": "Seed ($4.1M • Lead: NorthStar Fintech)",
        "fit_score": 88,
        "fit_level": "strong",
        "fit_reasons": [
            "Launched multi-currency corporate card issuing in 3 new jurisdictions",
            "Stripe Issuing partnership announced last month",
            "Head of Finance Operations recently posted on LinkedIn about manual reconciliation stress",
            "Clear regulatory compliance pressure in UK FCA sandbox",
        ],
        "summary": "Cross-border payment infrastructure enabling B2B software companies to issue multi-currency virtual cards with sub-second FX conversions.",
        "pipeline_stage": "approved",
        "tags": ["Fintech", "High Fit", "UK/US", "Approved Draft"],
        "observed_facts": [
            {
                "id": "fact-07",
                "fact": "Announced official launch of UK & EU multi-currency card clearing product in late September.",
                "source": "Fintech Insider Roundup",
                "date": "2026-09-28",
                "verified": True,
            }
        ],
        "hypotheses": [
            {
                "id": "hyp-05",
                "hypothesis": "VeritasFlow's finance team is manually cross-referencing Swift MT940 statements against Stripe settlement logs each evening.",
                "rationale": "Job description emphasizes 'tolerance for manual data reconciliation under tight clearing deadlines'.",
                "confidence": "high",
            }
        ],
        "missing_information": [
            "Current banking partner relationships (ClearBank vs Barclays vs Banking Circle)",
            "Daily settlement transaction count",
        ],
        "recommended_angle": {
            "hook": "Congratulate on the UK card issuing milestone and highlight automated 3-way reconciliation without custom ledger engineering.",
            "valueProposition": "Automate cross-border ledger settlement matching with zero spreadsheet exports.",
            "suggestedCta": "Share a 3-minute video showing continuous bank-to-ledger audit trail.",
        },
        "target_buyer": {
            "name": "Tariq Al-Mansoor",
            "title": "Head of Finance Operations",
            "emailPlaceholder": "tariq@veritasflow.internal",
            "linkedinNote": "Tariq Al-Mansoor | Ex-Revolut Ops | Head of Finance Ops VeritasFlow",
            "roleType": "Operational Buyer & Process Owner",
        },
        "email_draft": {
            "subject": "VeritasFlow's multi-currency clearing & automated EOD ledger matching",
            "body": "Hi Tariq,\n\nHuge congratulations on rolling out VeritasFlow's UK card clearing engine last month.\n\nManaging settlement discrepancies across multi-currency jurisdictions gets unruly fast—especially when MT940 bank feeds don't cleanly align with card network batches at midnight.\n\nWe built an automated clearing reconciliation layer that resolves 99.4% of multi-currency ledger mismatches in real-time, completely cutting out the nightly CSV audit grind.\n\nHappy to send over a 2-minute workflow recording of how we handle Stripe Issuing feeds if helpful as you ramp up transaction volume?\n\nBest,\nAlex Rivera\nFounding Team, ScoutSpark",
            "customizationVariables": {
                "{{first_name}}": "Tariq",
                "{{company}}": "VeritasFlow",
                "{{recent_event}}": "Multi-currency card launch",
                "{{pain_point}}": "Nightly ledger clearing reconciliation",
            },
            "isApproved": True,
            "approvedAt": "2026-10-23T05:20:00Z",
            "approvedBy": "Founder (Human Approved)",
            "notes": "Approved by Alex. Ready for human-controlled outbound via founder's email client.",
        },
        "uncertainty_indicators": [
            "UK/EU data residency requirements must be confirmed"
        ],
        "provenance": "demo",
    },
    {
        "id": "prospect-04",
        "company_name": "BeaconStack",
        "domain": "beaconstack.internal",
        "industry": "AI Operations & Enterprise SaaS",
        "sub_industry": "LLM Gateway & Model Governance",
        "headquarters": "Seattle, WA & Boston, MA",
        "employee_count": "54 employees",
        "stage": "Series A ($15M • Lead: Apex Horizon Ventures)",
        "fit_score": 84,
        "fit_level": "strong",
        "fit_reasons": [
            "Enterprise customer adoption in strictly regulated financial services",
            "Priya Sharma (Head of ML) recently gave keynote on model drift and eval harnesses",
            "Actively hiring AI Security & Evaluation Engineers",
        ],
        "summary": "Enterprise governance suite helping regulated financial institutions deploy generative AI pipelines with automated prompt compliance guardrails.",
        "pipeline_stage": "contacted",
        "outcome_notes": "Sent personalized email via founder inbox on Oct 21. Follow-up queued for Oct 26.",
        "tags": ["AI Governance", "Enterprise", "Regulated Tech", "Contacted"],
        "observed_facts": [
            {
                "id": "fact-09",
                "fact": "Priya Sharma presented at AI Summit on 'Prompt Regression Testing in Commercial Underwriting'.",
                "source": "Conference Keynote Recording",
                "date": "2026-09-08",
                "verified": True,
            }
        ],
        "hypotheses": [
            {
                "id": "hyp-06",
                "hypothesis": "BeaconStack is building out synthetic evaluation datasets manually to stress-test prompt injection vulnerabilities.",
                "rationale": "Job postings describe 'authoring diverse adversarial prompt corpora'.",
                "confidence": "medium",
            }
        ],
        "missing_information": [
            "Specific cloud deployment preference (AWS Bedrock vs Azure OpenAI)",
            "Vendor budget procurement cycle for Q4",
        ],
        "recommended_angle": {
            "hook": "Connect to Priya's talk on prompt regression testing and show how our synthetic eval engine generates 10,000 edge cases automatically.",
            "valueProposition": "Cut prompt regression test authoring time from 40 hours to 10 minutes.",
            "suggestedCta": "Share sample benchmark of adversarial credit evaluation prompts.",
        },
        "target_buyer": {
            "name": "Priya Sharma",
            "title": "Head of Machine Learning",
            "emailPlaceholder": "priya@beaconstack.internal",
            "linkedinNote": "Priya Sharma | Ex-AWS AI | Head of ML at BeaconStack",
            "roleType": "Technical Evaluator & ML Leader",
        },
        "email_draft": {
            "subject": "Priya's talk on prompt regression & adversarial stress-testing",
            "body": "Hi Priya,\n\nLoved your presentation at AI Summit on why traditional unit testing breaks down when validating LLM underwriting prompts.\n\nYour point on synthetic edge cases—specifically how human engineers struggle to author subtle prompt injections—resonated deeply with our team.\n\nWe developed an adversarial evaluation generator that automatically stress-tests enterprise LLM prompts across 14,000 regulatory compliance vectors.\n\nWould love to share a sample benchmark of how it evaluates financial underwriting guardrails if you're exploring eval automation this quarter?\n\nBest,\nAlex Rivera\nFounding Team, ScoutSpark",
            "customizationVariables": {
                "{{first_name}}": "Priya",
                "{{company}}": "BeaconStack",
                "{{recent_event}}": "AI Summit keynote on prompt regression",
                "{{pain_point}}": "Adversarial prompt test generation",
            },
            "isApproved": True,
            "approvedAt": "2026-10-21T14:15:00Z",
            "approvedBy": "Founder (Manual Outbound Recorded)",
            "notes": "Email sent manually by Alex. Stage updated to Contacted.",
        },
        "uncertainty_indicators": [
            "May require on-premise evaluation engine due to client NDA constraints"
        ],
        "provenance": "demo",
    },
    {
        "id": "prospect-05",
        "company_name": "LogixFleet",
        "domain": "logixfleet.internal",
        "industry": "Supply Chain & Logistics Tech",
        "sub_industry": "Fleet Telematics & Cold-Chain Monitoring",
        "headquarters": "Chicago, IL",
        "employee_count": "95 employees",
        "stage": "Series B ($28M • Lead: Keystone Logistics Fund)",
        "fit_score": 78,
        "fit_level": "moderate",
        "fit_reasons": [
            "Acquired regional freight broker in August to expand Midwest corridor",
            "Announced cold-chain IoT sensor integration with ThermoKing",
            "Scale indicates growing operational complexity across 1,200 trucks",
        ],
        "summary": "Real-time fleet intelligence platform monitoring perishable food and pharmaceutical transit conditions for mid-tier freight carriers.",
        "pipeline_stage": "to_research",
        "tags": ["Logistics", "IoT", "Midwest", "Series B"],
        "observed_facts": [
            {
                "id": "fact-11",
                "fact": "Announced integration with ThermoKing telematics units covering 1,200 refrigerated trailers.",
                "source": "Freight News Weekly",
                "date": "2026-08-30",
                "verified": True,
            }
        ],
        "hypotheses": [
            {
                "id": "hyp-07",
                "hypothesis": "Dispatchers are overwhelmed by false-positive temperature anomaly alerts during driver mandatory rest stops.",
                "rationale": "Frequent complaint raised by cold-chain fleet managers on logistics subreddits.",
                "confidence": "medium",
            }
        ],
        "missing_information": [
            "Whether internal engineering has already built anomaly filtering logic",
            "Current TMS integration depth with McLeod or Trimble",
        ],
        "recommended_angle": {
            "hook": "Address false-positive cold-chain alerts and show how contextual AI triage stops dispatcher fatigue.",
            "valueProposition": "Cut trailer temperature false alarms by 82% without risking cargo spoilage claims.",
            "suggestedCta": "Offer a 15-minute case study on sensor telemetry triage.",
        },
        "target_buyer": {
            "name": "Derek Cole",
            "title": "VP of Logistics Operations",
            "emailPlaceholder": "derek.cole@logixfleet.internal",
            "linkedinNote": "Derek Cole | VP Logistics Ops LogixFleet",
            "roleType": "Operational Leader & Cost Center Owner",
        },
        "email_draft": {
            "subject": "LogixFleet's 1,200 trailer sensor rollout & alert fatigue",
            "body": "Hi Derek,\n\nNoticed LogixFleet's recent ThermoKing sensor rollout across your 1,200 trailer fleet—impressive milestone.\n\nThe biggest operational pain we consistently see after scaling refrigerated telematics is dispatcher alert fatigue. When drivers trigger false-positive temp spikes during defrost cycles or door openings, dispatchers either miss real refrigeration failures or waste hours verifying false alarms.\n\nWe created an anomaly triage model that correlates ambient weather, door sensors, and engine RPM to eliminate 82% of spurious alarms.\n\nWould you be open to seeing a 2-minute breakdown of how this handles defrost cycle anomalies?\n\nBest,\nAlex Rivera\nFounding Team, ScoutSpark",
            "customizationVariables": {
                "{{first_name}}": "Derek",
                "{{company}}": "LogixFleet",
                "{{recent_event}}": "ThermoKing 1,200 trailer sensor rollout",
                "{{pain_point}}": "Dispatcher alert fatigue & false temperature spikes",
            },
            "isApproved": False,
            "notes": "Needs confirmation of TMS integration before sending.",
        },
        "uncertainty_indicators": [
            "Sales cycle likely 90-120 days due to enterprise logistics procurement"
        ],
        "provenance": "demo",
    },
    {
        "id": "prospect-06",
        "company_name": "TroveHuman",
        "domain": "trovehuman.internal",
        "industry": "Modern HR & Compensation Tech",
        "sub_industry": "Global Equity & Compensation Benchmarking",
        "headquarters": "Toronto, Canada & Remote",
        "employee_count": "28 employees",
        "stage": "Seed ($3.5M • Lead: Maple Leaf Ventures)",
        "fit_score": 72,
        "fit_level": "moderate",
        "fit_reasons": [
            "Team doubled in past 10 months to serve remote distributed companies",
            "Published open handbook on global salary bands across 18 countries",
            "High cultural openness to async tooling and human-in-the-loop AI",
        ],
        "summary": "Compensation planning platform for remote-first startups navigating currency volatility and localized equity taxation.",
        "pipeline_stage": "to_research",
        "tags": ["HR Tech", "Remote Work", "Canada", "Early Stage"],
        "observed_facts": [
            {
                "id": "fact-13",
                "fact": "Released public guide on 'Navigating 2026 Remote Engineering Pay Parity' with 4,000+ views.",
                "source": "Company Substack Newsletter",
                "date": "2026-09-19",
                "verified": True,
            }
        ],
        "hypotheses": [
            {
                "id": "hyp-08",
                "hypothesis": "TroveHuman's account executives are manually compiling comp benchmarking reports for prospective clients to prove ROI.",
                "rationale": "Typical high-touch sales strategy used by early-stage HR tech prior to automation.",
                "confidence": "medium",
            }
        ],
        "missing_information": [
            "Current monthly active client companies",
            "Whether they use Carta or homegrown equity tables",
        ],
        "recommended_angle": {
            "hook": "Reference their remote compensation handbook and offer automated candidate benchmarking briefs.",
            "valueProposition": "Generate tailored prospect salary intelligence in seconds rather than hours of manual spreadsheet scraping.",
            "suggestedCta": "Share a sample automated compensation benchmark brief.",
        },
        "target_buyer": {
            "name": "Chloe Dubois",
            "title": "VP of People & Customer Strategy",
            "emailPlaceholder": "chloe@trovehuman.internal",
            "linkedinNote": "Chloe Dubois | People Operations & Compensation Strategy",
            "roleType": "Customer Strategy & People Leader",
        },
        "email_draft": {
            "subject": "TroveHuman's remote pay parity guide & prospect comp briefs",
            "body": "Hi Chloe,\n\nReally appreciated your essay on remote salary band compression across LATAM and Western Europe—spot on about the danger of treating purchasing power parity as a static formula.\n\nWhen scaling early-stage HR tech, we see sales teams burning 3-4 hours per deal manually gathering local benchmark comps just to convince a skeptical CFO.\n\nWe automated that research layer: it synthesizes localized market salary bands and recent talent departures into a clean, 1-page account intelligence brief.\n\nCould I send you a 1-page sample brief generated for a 50-person distributed startup to see if it would save your sales team time?\n\nWarmly,\nAlex Rivera\nFounding Team, ScoutSpark",
            "customizationVariables": {
                "{{first_name}}": "Chloe",
                "{{company}}": "TroveHuman",
                "{{recent_event}}": "Remote pay parity handbook",
                "{{pain_point}}": "Manual candidate and prospect comp research",
            },
            "isApproved": False,
            "notes": "High empathy approach. Validates Chloe's domain thought leadership.",
        },
        "uncertainty_indicators": [
            "Early revenue stage; budget may be capped at <$500/month"
        ],
        "provenance": "demo",
    },
    {
        "id": "prospect-07",
        "company_name": "PrismShield Cyber",
        "domain": "prismshield.internal",
        "industry": "Cybersecurity & Infrastructure",
        "sub_industry": "Zero-Trust Identity & Air-gap Policy",
        "headquarters": "Reston, VA",
        "employee_count": "62 employees",
        "stage": "Series A ($11M • Lead: Citadel Defense Tech)",
        "fit_score": 58,
        "fit_level": "moderate",
        "fit_reasons": [
            "High compliance focus with DoD and federal contractor target market",
            "Recently attained SOC2 Type II and FedRAMP In-Process status",
            "High security friction: strict prohibition on external cloud data processors",
        ],
        "summary": "Zero-trust network access suite built for defense contractors and critical infrastructure providers needing isolated cryptographic tunnels.",
        "pipeline_stage": "not_a_fit",
        "outcome_notes": "Marked as Not a Fit on Oct 19: Requires on-premise air-gapped deployment which our current SaaS does not support.",
        "tags": ["Cybersecurity", "GovTech", "Air-Gapped", "Not A Fit"],
        "observed_facts": [
            {
                "id": "fact-15",
                "fact": "Achieved FedRAMP In-Process designation for defense industrial base customers.",
                "source": "FedRAMP Marketplace Registry",
                "date": "2026-07-22",
                "verified": True,
            }
        ],
        "hypotheses": [
            {
                "id": "hyp-09",
                "hypothesis": "Their security evaluation council will reject any SaaS vendor that does not run entirely within a GovCloud VPC boundary.",
                "rationale": "Standard defense procurement requirement for FedRAMP High environments.",
                "confidence": "high",
            }
        ],
        "missing_information": [
            "Whether they have an open commercial enterprise pipeline outside GovTech"
        ],
        "recommended_angle": {
            "hook": "Acknowledge FedRAMP compliance and assess if on-premise Kubernetes operator is required.",
            "valueProposition": "Air-gapped deployment option for defense grade intelligence.",
            "suggestedCta": "Determine compatibility with GovCloud air-gap requirements.",
        },
        "target_buyer": {
            "name": "Nathan Vance",
            "title": "Chief Information Security Officer",
            "emailPlaceholder": "nathan.vance@prismshield.internal",
            "linkedinNote": "Nathan Vance CISSP | CISO PrismShield Cyber",
            "roleType": "Security Gatekeeper",
        },
        "email_draft": {
            "subject": "PrismShield's FedRAMP milestone & air-gapped telemetry question",
            "body": "Hi Nathan,\n\nSaw PrismShield's FedRAMP In-Process listing—congratulations to your security engineering team.\n\nQuick question: for your internal prospect intelligence tooling, do you require 100% GovCloud VPC containment, or does your team utilize commercial multi-tenant SaaS for top-of-funnel customer research?\n\nWe want to ensure we respect your security boundary before sharing technical details on our research engine.\n\nRegards,\nAlex Rivera\nFounding Team, ScoutSpark",
            "customizationVariables": {
                "{{first_name}}": "Nathan",
                "{{company}}": "PrismShield",
                "{{recent_event}}": "FedRAMP milestone",
                "{{pain_point}}": "Strict air-gap compliance",
            },
            "isApproved": False,
            "notes": "Correctly flagged: prospect requires GovCloud air-gap. Marked 'Not a Fit' in pipeline.",
        },
        "uncertainty_indicators": [
            "Definite blocker: lack of on-premise deployment mode"
        ],
        "provenance": "demo",
    },
    {
        "id": "prospect-08",
        "company_name": "OrbitCraft Dev",
        "domain": "orbitcraft.internal",
        "industry": "Developer Tools & Infrastructure",
        "sub_industry": "Micro-Frontend Build Orchestration",
        "headquarters": "Berlin, Germany",
        "employee_count": "14 employees",
        "stage": "Pre-seed ($1.2M • Lead: European Angel Syndicate)",
        "fit_score": 42,
        "fit_level": "unlikely",
        "fit_reasons": [
            "Pre-seed stage with small 14-person engineering team",
            "Open source core with nascent commercial monetization",
            "Solo founder Alex Mercer currently handles both code and outbound calls",
        ],
        "summary": "Next-generation bundler and module federation orchestrator for micro-frontend web applications.",
        "pipeline_stage": "to_research",
        "tags": ["Open Source", "Pre-Seed", "DevTools", "Low Budget"],
        "observed_facts": [
            {
                "id": "fact-16",
                "fact": "GitHub repository crossed 4,200 stars with 120 weekly active contributors.",
                "source": "GitHub Public Metric API",
                "date": "2026-10-15",
                "verified": True,
            }
        ],
        "hypotheses": [
            {
                "id": "hyp-10",
                "hypothesis": "The founder is focused 90% on developer adoption and OSS community growth, not enterprise outbound sales.",
                "rationale": "Recent podcast interview with founder emphasizes community growth over enterprise revenue.",
                "confidence": "high",
            }
        ],
        "missing_information": [
            "Whether enterprise cloud tier pricing has been established"
        ],
        "recommended_angle": {
            "hook": "Congratulate on GitHub milestone and track when they begin enterprise lead qualification.",
            "valueProposition": "Identify enterprise developers contributing to open source repos as commercial buyer signals.",
            "suggestedCta": "Connect on developer-led growth metrics.",
        },
        "target_buyer": {
            "name": "Alex Mercer",
            "title": "Founder & Lead Architect",
            "emailPlaceholder": "alex@orbitcraft.internal",
            "linkedinNote": "Alex Mercer | Creator of OrbitCraft | Open Source Enthusiast",
            "roleType": "Technical Founder",
        },
        "email_draft": {
            "subject": "OrbitCraft's 4.2k GitHub stars & enterprise dev detection",
            "body": "Hi Alex,\n\nHuge congrats on OrbitCraft passing 4,200 GitHub stars this week—the module federation DX you built is slick.\n\nI know at pre-seed your priority is developer love rather than aggressive outbound. When you do start seeing Fortune 500 engineers starring the repo from corporate domains, finding those signals is tricky.\n\nBookmarking your progress for when OrbitCraft starts launching your enterprise cloud tier.\n\nKeep crushing it,\nAlex Rivera\nFounding Team, ScoutSpark",
            "customizationVariables": {
                "{{first_name}}": "Alex",
                "{{company}}": "OrbitCraft",
                "{{recent_event}}": "4.2k GitHub stars milestone",
                "{{pain_point}}": "Identifying commercial buyers from OSS",
            },
            "isApproved": False,
            "notes": "Scored 42% fit. Kept on nurture list; not ready for active sales motion.",
        },
        "uncertainty_indicators": [
            "Company budget insufficient for immediate paid pilot"
        ],
        "provenance": "demo",
    },
]

SEED_ACTIVITIES = [
    {
        "id": "act-01",
        "timestamp": "18 minutes ago",
        "type": "approval",
        "title": "Draft Approved by Human",
        "description": "VeritasFlow personalized email draft approved for founder outreach by Alex Rivera.",
        "prospect_name": "VeritasFlow",
        "user": "Alex Rivera",
    },
    {
        "id": "act-02",
        "timestamp": "1 hour ago",
        "type": "research_signal",
        "title": "High-Signal Incident Detected",
        "description": "Identified Kafka trace bottleneck signal for KiteMetrics with 96% fit score.",
        "prospect_name": "KiteMetrics",
        "user": "Scout Engine",
    },
    {
        "id": "act-03",
        "timestamp": "3 hours ago",
        "type": "pipeline_move",
        "title": "Stage Updated to Not a Fit",
        "description": "PrismShield Cyber moved to Not a Fit due to GovCloud air-gapped on-premise requirement.",
        "prospect_name": "PrismShield Cyber",
        "user": "Alex Rivera",
    },
    {
        "id": "act-04",
        "timestamp": "Yesterday",
        "type": "draft_edited",
        "title": "Email Draft Tailored",
        "description": "Edited clinical workflow hook in AuraPulse Health email to emphasize AthenaHealth zero-click sync.",
        "prospect_name": "AuraPulse Health",
        "user": "Alex Rivera",
    },
]


def seed_database(db: Session) -> None:
    """
    Idempotent database seeding.
    Checks if records already exist so user modifications are never overwritten.
    """
    # 1. Seed ICP
    icp_count = db.query(ICPModel).count()
    if icp_count == 0:
        icp = ICPModel(
            id=1,
            company_name=SEED_ICP["company_name"],
            product_name=SEED_ICP["product_name"],
            company_description=SEED_ICP["company_description"],
            value_proposition=SEED_ICP["value_proposition"],
            target_industries=SEED_ICP["target_industries"],
            target_roles=SEED_ICP["target_roles"],
            target_geographies=SEED_ICP["target_geographies"],
            company_size_ranges=SEED_ICP["company_size_ranges"],
            funding_stages=SEED_ICP["funding_stages"],
            exclusions=SEED_ICP["exclusions"],
            primary_pain_point=SEED_ICP["primary_pain_point"],
            last_updated=SEED_ICP["last_updated"],
        )
        db.add(icp)
        db.commit()

    # 2. Seed Prospects idempotently
    for p_data in SEED_PROSPECTS:
        existing = db.query(ProspectModel).filter(ProspectModel.id == p_data["id"]).first()
        if not existing:
            prospect = ProspectModel(
                id=p_data["id"],
                company_name=p_data["company_name"],
                domain=p_data["domain"],
                industry=p_data["industry"],
                sub_industry=p_data["sub_industry"],
                headquarters=p_data["headquarters"],
                employee_count=p_data["employee_count"],
                stage=p_data["stage"],
                fit_score=p_data["fit_score"],
                fit_level=p_data["fit_level"],
                fit_reasons=p_data["fit_reasons"],
                summary=p_data["summary"],
                pipeline_stage=p_data["pipeline_stage"],
                observed_facts=p_data["observed_facts"],
                hypotheses=p_data["hypotheses"],
                missing_information=p_data["missing_information"],
                recommended_angle=p_data["recommended_angle"],
                target_buyer=p_data["target_buyer"],
                email_draft=p_data["email_draft"],
                uncertainty_indicators=p_data["uncertainty_indicators"],
                tags=p_data["tags"],
                outcome_notes=p_data.get("outcome_notes"),
                provenance=p_data["provenance"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(prospect)

            # Also seed an initial outreach draft entry
            draft = OutreachDraftModel(
                id=f"draft-{p_data['id']}",
                prospect_id=p_data["id"],
                subject=p_data["email_draft"]["subject"],
                body=p_data["email_draft"]["body"],
                customization_variables=p_data["email_draft"].get("customizationVariables", {}),
                is_approved=p_data["email_draft"].get("isApproved", False),
                approved_at=p_data["email_draft"].get("approvedAt"),
                approved_by=p_data["email_draft"].get("approvedBy"),
                notes=p_data["email_draft"].get("notes"),
            )
            db.add(draft)

    # 3. Seed Activities if table empty
    if db.query(ActivityModel).count() == 0:
        for act_data in SEED_ACTIVITIES:
            act = ActivityModel(
                id=act_data["id"],
                timestamp=act_data["timestamp"],
                type=act_data["type"],
                title=act_data["title"],
                description=act_data["description"],
                prospect_name=act_data.get("prospect_name"),
                user=act_data["user"],
                created_at=datetime.now(timezone.utc),
            )
            db.add(act)

    db.commit()
