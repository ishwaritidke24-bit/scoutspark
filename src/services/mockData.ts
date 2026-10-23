import { Prospect, IdealCustomerProfile, ResearchSignal, EvaluationMetric, ActivityItem } from '../types';

export const INITIAL_ICP: IdealCustomerProfile = {
  companyName: "ScoutSpark AI",
  productName: "SignalEngine B2B",
  companyDescription: "High-signal prospecting and account intelligence platform that translates live company events, engineering artifacts, and organizational shifts into evidence-backed customer outreach.",
  valueProposition: "Cut outreach research time by 80% while increasing qualified reply rates by providing verifiable facts, clear hypothesis separation, and human-in-the-loop email drafts.",
  targetIndustries: [
    "Developer Tools & Infrastructure",
    "HealthTech & Digital Health",
    "Fintech & Payments Infrastructure",
    "AI Operations & Enterprise SaaS",
    "Supply Chain & Logistics Tech"
  ],
  targetRoles: [
    "VP of Engineering",
    "Chief Medical Officer / Clinical Ops",
    "Head of Finance Operations",
    "Head of Machine Learning / AI",
    "VP of Operations",
    "Head of Product"
  ],
  targetGeographies: ["North America", "United Kingdom & Ireland", "DACH & Western Europe"],
  companySizeRanges: ["20 - 50 employees", "51 - 150 employees", "151 - 300 employees"],
  fundingStages: ["Seed ($2M - $5M)", "Series A ($6M - $18M)", "Series B ($20M - $35M)"],
  exclusions: ["Agencies / Consultancies", "Pure B2C Apps", "Companies under 10 people without funding"],
  primaryPainPoint: "Account executives and founders spend 45 minutes manually digging through job posts, GitHub commits, and PRs just to write one mediocre cold email.",
  lastUpdated: "2026-10-23T08:00:00Z"
};

export const MOCK_PROSPECTS: Prospect[] = [
  {
    id: "prospect-01",
    companyName: "KiteMetrics",
    domain: "kitemetrics.internal",
    industry: "Developer Tools & Infrastructure",
    subIndustry: "Distributed Tracing & Observability",
    headquarters: "San Francisco, CA & Remote",
    employeeCount: "42 employees",
    stage: "Series A ($9.2M • Lead: Horizon Capital)",
    fitScore: 96,
    fitLevel: "exceptional",
    fitReasons: [
      "Explicit technical bottleneck mentioned in recent public incident postmortem",
      "VP Engineering recently hired to scale team from 15 to 45 engineers",
      "Public GitHub repo activity shows multi-tenant telemetry ingestion spike",
      "Matches exact target ICP: Series A, Developer Infrastructure, 35-50 headcount"
    ],
    summary: "Cloud-native observability provider experiencing exponential trace ingestion volume after landing three mid-market fintech customers.",
    pipelineStage: "ready_to_review",
    tags: ["High Velocity", "Post-Series A", "Technical Buyer", "Incident Postmortem"],
    observedFacts: [
      {
        id: "fact-01",
        fact: "Published a technical incident retrospective citing Kafka broker lag and trace retention storage overhead (Dated: Sept 2026).",
        source: "Engineering Blog Post (Simulated Archive)",
        sourceUrl: "https://demo.scoutspark.internal/signals/kitemetrics-postmortem",
        date: "2026-09-14",
        verified: true
      },
      {
        id: "fact-02",
        fact: "Currently recruiting 3 Senior Infrastructure Engineers with Kubernetes and eBPF kernel profiling expertise.",
        source: "Careers Page API Snapshot",
        sourceUrl: "https://demo.scoutspark.internal/signals/kitemetrics-careers",
        date: "2026-10-02",
        verified: true
      },
      {
        id: "fact-03",
        fact: "Elena Rostova (ex-Stripe Infrastructure Staff) stepped into the VP Engineering role 4 months ago.",
        source: "Executive Movement Monitor",
        date: "2026-06-18",
        verified: true
      }
    ],
    hypotheses: [
      {
        id: "hyp-01",
        hypothesis: "The engineering team is struggling to balance enterprise customer SLAs with ballooning telemetry storage costs.",
        rationale: "Correlating the sudden 3x node cluster increase with the retrospective commentary on storage cost per gigabyte.",
        confidence: "high"
      },
      {
        id: "hyp-02",
        hypothesis: "Elena has a 90-day mandate from the board to optimize reliability without tripling the cloud infrastructure budget.",
        rationale: "Standard Series A executive onboarding priority after high-profile retention incident.",
        confidence: "medium"
      }
    ],
    missingInformation: [
      "Exact monthly AWS/GCP cloud egress bill (estimated between $40k-$75k/mo)",
      "Whether internal tooling team has begun prototyping a custom in-house gateway"
    ],
    recommendedAngle: {
      hook: "Referencing Elena's recent engineering essay on high-cardinality trace bottlenecks and offering our benchmark data on 4x cheaper compression.",
      valueProposition: "Cut ingest telemetry overhead without dropping trace spans or slowing query latency.",
      suggestedCta: "Brief 15-minute technical sanity check to compare KiteMetrics' p99 compression curves."
    },
    targetBuyer: {
      name: "Elena Rostova",
      title: "VP of Engineering",
      emailPlaceholder: "elena@kitemetrics.internal",
      linkedinNote: "Elena Rostova | ex-Stripe Staff | VP Eng KiteMetrics",
      roleType: "Technical Decision Maker & Budget Owner"
    },
    emailDraft: {
      subject: "Your post on Kafka trace overhead & KiteMetrics' p99 latency",
      body: `Hi Elena,

Read your candid postmortem on KiteMetrics' Kafka buffer saturation during last month's enterprise ingest surge. Loved the transparency on where your team spent 36 hours diagnosing span drops.

Most Series A observability startups hit that exact wall when trace cardinality triples: you're either forced to sample aggressively (frustrating developers) or watch your storage tier eat your ARR.

We built a lightweight ingestion proxy specifically for fast-growing platforms handling >20M spans/sec. It drops storage costs by ~65% while keeping 100% trace fidelity for anomalous traces.

Would you be open to a 12-minute technical peer review on how Teams like Vector and HyperScale solved this without rewriting their collectors?

Best,
Alex Rivera
Founding Team, ScoutSpark`,
      customizationVariables: {
        "{{first_name}}": "Elena",
        "{{company}}": "KiteMetrics",
        "{{recent_event}}": "Kafka buffer postmortem",
        "{{pain_point}}": "Trace cardinality & storage tier cost"
      },
      isApproved: false,
      notes: "Drafted using verified facts #fact-01 and #fact-03. Tone is engineering-peer, not sales pitch."
    },
    uncertaintyIndicators: [
      "Exact current cloud provider (observed AWS artifacts, but possible GCP hybrid deployment)",
      "Decision timeline: may take 30 days due to SOC2 audit cycle"
    ],
    lastUpdated: "2026-10-23T06:30:00Z"
  },
  {
    id: "prospect-02",
    companyName: "AuraPulse Health",
    domain: "aurapulsehealth.internal",
    industry: "HealthTech & Digital Health",
    subIndustry: "Outpatient Clinic Workflow & Intake",
    headquarters: "Austin, TX",
    employeeCount: "78 employees",
    stage: "Series A ($12M • Lead: Oakridge Health Ventures)",
    fitScore: 92,
    fitLevel: "exceptional",
    fitReasons: [
      "Rapid physical expansion: opened 6 new clinics across Texas in 4 months",
      "Chief Medical Officer publicly noted clinician administrative burnout",
      "Hiring Clinical Intake Coordinators and EHR Integration Engineers",
      "High willingness to adopt AI tools that maintain HIPAA air-gap compliance"
    ],
    summary: "Modern hybrid clinic operator providing same-day preventative and chronic care, currently strained by front-desk check-in bottlenecks.",
    pipelineStage: "ready_to_review",
    tags: ["HealthTech", "Clinic Network", "Fast Expansion", "HIPAA Ready"],
    observedFacts: [
      {
        id: "fact-04",
        fact: "Announced acquisition of 4 Austin regional family care practices on Oct 1, bringing total locations to 14.",
        source: "Digital Health Wire Press Release (Simulated)",
        date: "2026-10-01",
        verified: true
      },
      {
        id: "fact-05",
        fact: "Dr. Marcus Vance published an op-ed on 'The 18-minute intake friction in modern primary care'.",
        source: "Modern Physician Quarterly",
        date: "2026-08-20",
        verified: true
      },
      {
        id: "fact-06",
        fact: "EHR stack includes AthenaHealth and an internal TypeScript-based patient portal.",
        source: "Engineering Job Description Archive",
        date: "2026-09-11",
        verified: true
      }
    ],
    hypotheses: [
      {
        id: "hyp-03",
        hypothesis: "Front-desk intake staff are manually copying patient insurance waivers into the EHR, slowing clinic throughput by 20%.",
        rationale: "Direct correlation between the 14 new locations and open requisitions for 8 front-desk coordinators.",
        confidence: "high"
      },
      {
        id: "hyp-04",
        hypothesis: "Dr. Vance is evaluating software that can integrate directly with AthenaHealth without requiring EHR migration.",
        rationale: "Mentioned avoiding core EHR replacement at the Austin Health Innovation Summit.",
        confidence: "medium"
      }
    ],
    missingInformation: [
      "Whether AthenaHealth API rate limits have previously disrupted their portal",
      "Budget authorization limit of the Chief Medical Officer vs CEO"
    ],
    recommendedAngle: {
      hook: "Connect Dr. Vance's op-ed on 18-minute wait times directly to an automated, zero-clerk intake pipeline.",
      valueProposition: "Eliminate repetitive patient data re-entry while cutting check-in time down to 90 seconds.",
      suggestedCta: "Offer a 10-minute demo showing the AthenaHealth zero-click sync in action."
    },
    targetBuyer: {
      name: "Dr. Marcus Vance",
      title: "Chief Medical Officer & Co-Founder",
      emailPlaceholder: "marcus.vance@aurapulsehealth.internal",
      linkedinNote: "Dr. Marcus Vance MD | CMO AuraPulse | Primary Care Innovation",
      roleType: "Clinical Workflow Champion"
    },
    emailDraft: {
      subject: "AuraPulse's 14-clinic expansion & Dr. Vance's 18-min intake thesis",
      body: `Hi Dr. Vance,

Congratulations on bringing AuraPulse to 14 clinics this month across Central Texas.

I caught your essay in Modern Physician on the "18-minute intake friction"—especially your point about clinicians spending the first 6 minutes of an appointment re-verifying information the patient already typed into a clipboard.

We built an ambient intake intelligence module that bridges mobile check-in directly into AthenaHealth. Clinics using it have brought patient intake down to 85 seconds with zero manual transcription by clinical staff.

Would you be open to an 11-minute look at how this works on AthenaHealth before your next clinic rollout?

Warm regards,
Alex Rivera
Founding Team, ScoutSpark`,
      customizationVariables: {
        "{{first_name}}": "Dr. Vance",
        "{{company}}": "AuraPulse",
        "{{recent_event}}": "Expansion to 14 clinics",
        "{{pain_point}}": "18-minute check-in friction"
      },
      isApproved: false,
      notes: "Warm, respectful clinical tone. Highlights understanding of AthenaHealth integration constraints."
    },
    uncertaintyIndicators: [
      "Clinical procurement committee review cycles can take 6-8 weeks",
      "EHR security review required"
    ],
    lastUpdated: "2026-10-23T07:15:00Z"
  },
  {
    id: "prospect-03",
    companyName: "VeritasFlow",
    domain: "veritasflow.internal",
    industry: "Fintech & Payments Infrastructure",
    subIndustry: "Ledger Settlement & Multi-currency Clearing",
    headquarters: "London, UK & New York, NY",
    employeeCount: "34 employees",
    stage: "Seed ($4.1M • Lead: NorthStar Fintech)",
    fitScore: 88,
    fitLevel: "strong",
    fitReasons: [
      "Launched multi-currency corporate card issuing in 3 new jurisdictions",
      "Stripe Issuing partnership announced last month",
      "Head of Finance Operations recently posted on LinkedIn about manual reconciliation stress",
      "Clear regulatory compliance pressure in UK FCA sandbox"
    ],
    summary: "Cross-border payment infrastructure enabling B2B software companies to issue multi-currency virtual cards with sub-second FX conversions.",
    pipelineStage: "approved",
    tags: ["Fintech", "High Fit", "UK/US", "Approved Draft"],
    observedFacts: [
      {
        id: "fact-07",
        fact: "Announced official launch of UK & EU multi-currency card clearing product in late September.",
        source: "Fintech Insider Roundup",
        date: "2026-09-28",
        verified: true
      },
      {
        id: "fact-08",
        fact: "Job opening for 'Settlement Operations Analyst' explicitly mentions resolving end-of-day bank file discrepancies.",
        source: "Careers Portal Snapshot",
        date: "2026-10-12",
        verified: true
      }
    ],
    hypotheses: [
      {
        id: "hyp-05",
        hypothesis: "VeritasFlow's finance team is manually cross-referencing Swift MT940 statements against Stripe settlement logs each evening.",
        rationale: "Job description emphasizes 'tolerance for manual data reconciliation under tight clearing deadlines'.",
        confidence: "high"
      }
    ],
    missingInformation: [
      "Current banking partner relationships (ClearBank vs Barclays vs Banking Circle)",
      "Daily settlement transaction count"
    ],
    recommendedAngle: {
      hook: "Congratulate on the UK card issuing milestone and highlight automated 3-way reconciliation without custom ledger engineering.",
      valueProposition: "Automate cross-border ledger settlement matching with zero spreadsheet exports.",
      suggestedCta: "Share a 3-minute video showing continuous bank-to-ledger audit trail."
    },
    targetBuyer: {
      name: "Tariq Al-Mansoor",
      title: "Head of Finance Operations",
      emailPlaceholder: "tariq@veritasflow.internal",
      linkedinNote: "Tariq Al-Mansoor | Ex-Revolut Ops | Head of Finance Ops VeritasFlow",
      roleType: "Operational Buyer & Process Owner"
    },
    emailDraft: {
      subject: "VeritasFlow's multi-currency clearing & automated EOD ledger matching",
      body: `Hi Tariq,

Huge congratulations on rolling out VeritasFlow's UK card clearing engine last month.

Managing settlement discrepancies across multi-currency jurisdictions gets unruly fast—especially when MT940 bank feeds don't cleanly align with card network batches at midnight.

We built an automated clearing reconciliation layer that resolves 99.4% of multi-currency ledger mismatches in real-time, completely cutting out the nightly CSV audit grind.

Happy to send over a 2-minute workflow recording of how we handle Stripe Issuing feeds if helpful as you ramp up transaction volume?

Best,
Alex Rivera
Founding Team, ScoutSpark`,
      customizationVariables: {
        "{{first_name}}": "Tariq",
        "{{company}}": "VeritasFlow",
        "{{recent_event}}": "Multi-currency card launch",
        "{{pain_point}}": "Nightly ledger clearing reconciliation"
      },
      isApproved: true,
      approvedAt: "2026-10-23T05:20:00Z",
      approvedBy: "Founder (Human Approved)",
      notes: "Approved by Alex. Ready for human-controlled outbound via founder's email client."
    },
    uncertaintyIndicators: [
      "UK/EU data residency requirements must be confirmed"
    ],
    lastUpdated: "2026-10-23T05:20:00Z"
  },
  {
    id: "prospect-04",
    companyName: "BeaconStack",
    domain: "beaconstack.internal",
    industry: "AI Operations & Enterprise SaaS",
    subIndustry: "LLM Gateway & Model Governance",
    headquarters: "Seattle, WA & Boston, MA",
    employeeCount: "54 employees",
    stage: "Series A ($15M • Lead: Apex Horizon Ventures)",
    fitScore: 84,
    fitLevel: "strong",
    fitReasons: [
      "Enterprise customer adoption in strictly regulated financial services",
      "Priya Sharma (Head of ML) recently gave keynote on model drift and eval harnesses",
      "Actively hiring AI Security & Evaluation Engineers",
      "Recent release of automated audit-log collector for LLM prompts"
    ],
    summary: "Enterprise governance suite helping regulated financial institutions deploy generative AI pipelines with automated prompt compliance guardrails.",
    pipelineStage: "contacted",
    outcomeNotes: "Sent personalized email via founder inbox on Oct 21. Follow-up queued for Oct 26.",
    tags: ["AI Governance", "Enterprise", "Regulated Tech", "Contacted"],
    observedFacts: [
      {
        id: "fact-09",
        fact: "Priya Sharma presented at AI Summit on 'Prompt Regression Testing in Commercial Underwriting'.",
        source: "Conference Keynote Recording",
        date: "2026-09-08",
        verified: true
      },
      {
        id: "fact-10",
        fact: "Signed pilot agreement with mid-market credit union consortium per CEO announcement.",
        source: "LinkedIn Company Update",
        date: "2026-10-05",
        verified: true
      }
    ],
    hypotheses: [
      {
        id: "hyp-06",
        hypothesis: "BeaconStack is building out synthetic evaluation datasets manually to stress-test prompt injection vulnerabilities.",
        rationale: "Job postings describe 'authoring diverse adversarial prompt corpora'.",
        confidence: "medium"
      }
    ],
    missingInformation: [
      "Specific cloud deployment preference (AWS Bedrock vs Azure OpenAI)",
      "Vendor budget procurement cycle for Q4"
    ],
    recommendedAngle: {
      hook: "Connect to Priya's talk on prompt regression testing and show how our synthetic eval engine generates 10,000 edge cases automatically.",
      valueProposition: "Cut prompt regression test authoring time from 40 hours to 10 minutes.",
      suggestedCta: "Share sample benchmark of adversarial credit evaluation prompts."
    },
    targetBuyer: {
      name: "Priya Sharma",
      title: "Head of Machine Learning",
      emailPlaceholder: "priya@beaconstack.internal",
      linkedinNote: "Priya Sharma | Ex-AWS AI | Head of ML at BeaconStack",
      roleType: "Technical Evaluator & ML Leader"
    },
    emailDraft: {
      subject: "Priya's talk on prompt regression & adversarial stress-testing",
      body: `Hi Priya,

Loved your presentation at AI Summit on why traditional unit testing breaks down when validating LLM underwriting prompts.

Your point on synthetic edge cases—specifically how human engineers struggle to author subtle prompt injections—resonated deeply with our team.

We developed an adversarial evaluation generator that automatically stress-tests enterprise LLM prompts across 14,000 regulatory compliance vectors.

Would love to share a sample benchmark of how it evaluates financial underwriting guardrails if you're exploring eval automation this quarter?

Best,
Alex Rivera
Founding Team, ScoutSpark`,
      customizationVariables: {
        "{{first_name}}": "Priya",
        "{{company}}": "BeaconStack",
        "{{recent_event}}": "AI Summit keynote on prompt regression",
        "{{pain_point}}": "Adversarial prompt test generation"
      },
      isApproved: true,
      approvedAt: "2026-10-21T14:15:00Z",
      approvedBy: "Founder (Manual Outbound Recorded)",
      notes: "Email sent manually by Alex. Stage updated to Contacted."
    },
    uncertaintyIndicators: [
      "May require on-premise evaluation engine due to client NDA constraints"
    ],
    lastUpdated: "2026-10-21T14:15:00Z"
  },
  {
    id: "prospect-05",
    companyName: "LogixFleet",
    domain: "logixfleet.internal",
    industry: "Supply Chain & Logistics Tech",
    subIndustry: "Fleet Telematics & Cold-Chain Monitoring",
    headquarters: "Chicago, IL",
    employeeCount: "95 employees",
    stage: "Series B ($28M • Lead: Keystone Logistics Fund)",
    fitScore: 78,
    fitLevel: "moderate",
    fitReasons: [
      "Acquired regional freight broker in August to expand Midwest corridor",
      "Announced cold-chain IoT sensor integration with ThermoKing",
      "Scale indicates growing operational complexity across 1,200 trucks",
      "Slightly larger than core ICP sweet spot (95 headcount vs 25-60 target)"
    ],
    summary: "Real-time fleet intelligence platform monitoring perishable food and pharmaceutical transit conditions for mid-tier freight carriers.",
    pipelineStage: "to_research",
    tags: ["Logistics", "IoT", "Midwest", "Series B"],
    observedFacts: [
      {
        id: "fact-11",
        fact: "Announced integration with ThermoKing telematics units covering 1,200 refrigerated trailers.",
        source: "Freight News Weekly",
        date: "2026-08-30",
        verified: true
      },
      {
        id: "fact-12",
        fact: "Derek Cole joined as VP Logistics Operations from Echo Global Logistics.",
        source: "LinkedIn Executive Announcement",
        date: "2026-07-15",
        verified: true
      }
    ],
    hypotheses: [
      {
        id: "hyp-07",
        hypothesis: "Dispatchers are overwhelmed by false-positive temperature anomaly alerts during driver mandatory rest stops.",
        rationale: "Frequent complaint raised by cold-chain fleet managers on logistics subreddits.",
        confidence: "medium"
      }
    ],
    missingInformation: [
      "Whether internal engineering has already built anomaly filtering logic",
      "Current TMS integration depth with McLeod or Trimble"
    ],
    recommendedAngle: {
      hook: "Address false-positive cold-chain alerts and show how contextual AI triage stops dispatcher fatigue.",
      valueProposition: "Cut trailer temperature false alarms by 82% without risking cargo spoilage claims.",
      suggestedCta: "Offer a 15-minute case study on sensor telemetry triage."
    },
    targetBuyer: {
      name: "Derek Cole",
      title: "VP of Logistics Operations",
      emailPlaceholder: "derek.cole@logixfleet.internal",
      linkedinNote: "Derek Cole | VP Logistics Ops LogixFleet",
      roleType: "Operational Leader & Cost Center Owner"
    },
    emailDraft: {
      subject: "LogixFleet's 1,200 trailer sensor rollout & alert fatigue",
      body: `Hi Derek,

Noticed LogixFleet's recent ThermoKing sensor rollout across your 1,200 trailer fleet—impressive milestone.

The biggest operational pain we consistently see after scaling refrigerated telematics is dispatcher alert fatigue. When drivers trigger false-positive temp spikes during defrost cycles or door openings, dispatchers either miss real refrigeration failures or waste hours verifying false alarms.

We created an anomaly triage model that correlates ambient weather, door sensors, and engine RPM to eliminate 82% of spurious alarms.

Would you be open to seeing a 2-minute breakdown of how this handles defrost cycle anomalies?

Best,
Alex Rivera
Founding Team, ScoutSpark`,
      customizationVariables: {
        "{{first_name}}": "Derek",
        "{{company}}": "LogixFleet",
        "{{recent_event}}": "ThermoKing 1,200 trailer sensor rollout",
        "{{pain_point}}": "Dispatcher alert fatigue & false temperature spikes"
      },
      isApproved: false,
      notes: "Needs confirmation of TMS integration before sending."
    },
    uncertaintyIndicators: [
      "Sales cycle likely 90-120 days due to enterprise logistics procurement"
    ],
    lastUpdated: "2026-10-22T11:00:00Z"
  },
  {
    id: "prospect-06",
    companyName: "TroveHuman",
    domain: "trovehuman.internal",
    industry: "Modern HR & Compensation Tech",
    subIndustry: "Global Equity & Compensation Benchmarking",
    headquarters: "Toronto, Canada & Remote",
    employeeCount: "28 employees",
    stage: "Seed ($3.5M • Lead: Maple Leaf Ventures)",
    fitScore: 72,
    fitLevel: "moderate",
    fitReasons: [
      "Team doubled in past 10 months to serve remote distributed companies",
      "Published open handbook on global salary bands across 18 countries",
      "High cultural openness to async tooling and human-in-the-loop AI",
      "Earlier revenue stage than KiteMetrics or AuraPulse"
    ],
    summary: "Compensation planning platform for remote-first startups navigating currency volatility and localized equity taxation.",
    pipelineStage: "to_research",
    tags: ["HR Tech", "Remote Work", "Canada", "Early Stage"],
    observedFacts: [
      {
        id: "fact-13",
        fact: "Released public guide on 'Navigating 2026 Remote Engineering Pay Parity' with 4,000+ views.",
        source: "Company Substack Newsletter",
        date: "2026-09-19",
        verified: true
      },
      {
        id: "fact-14",
        fact: "Hiring their first dedicated Product Marketing Lead.",
        source: "Job Board Listing",
        date: "2026-10-18",
        verified: true
      }
    ],
    hypotheses: [
      {
        id: "hyp-08",
        hypothesis: "TroveHuman's account executives are manually compiling comp benchmarking reports for prospective clients to prove ROI.",
        rationale: "Typical high-touch sales strategy used by early-stage HR tech prior to automation.",
        confidence: "medium"
      }
    ],
    missingInformation: [
      "Current monthly active client companies",
      "Whether they use Carta or homegrown equity tables"
    ],
    recommendedAngle: {
      hook: "Reference their remote compensation handbook and offer automated candidate benchmarking briefs.",
      valueProposition: "Generate tailored prospect salary intelligence in seconds rather than hours of manual spreadsheet scraping.",
      suggestedCta: "Share a sample automated compensation benchmark brief."
    },
    targetBuyer: {
      name: "Chloe Dubois",
      title: "VP of People & Customer Strategy",
      emailPlaceholder: "chloe@trovehuman.internal",
      linkedinNote: "Chloe Dubois | People Operations & Compensation Strategy",
      roleType: "Customer Strategy & People Leader"
    },
    emailDraft: {
      subject: "TroveHuman's remote pay parity guide & prospect comp briefs",
      body: `Hi Chloe,

Really appreciated your essay on remote salary band compression across LATAM and Western Europe—spot on about the danger of treating purchasing power parity as a static formula.

When scaling early-stage HR tech, we see sales teams burning 3-4 hours per deal manually gathering local benchmark comps just to convince a skeptical CFO.

We automated that research layer: it synthesizes localized market salary bands and recent talent departures into a clean, 1-page account intelligence brief.

Could I send you a 1-page sample brief generated for a 50-person distributed startup to see if it would save your sales team time?

Warmly,
Alex Rivera
Founding Team, ScoutSpark`,
      customizationVariables: {
        "{{first_name}}": "Chloe",
        "{{company}}": "TroveHuman",
        "{{recent_event}}": "Remote pay parity handbook",
        "{{pain_point}}": "Manual candidate and prospect comp research"
      },
      isApproved: false,
      notes: "High empathy approach. Validates Chloe's domain thought leadership."
    },
    uncertaintyIndicators: [
      "Early revenue stage; budget may be capped at <$500/month"
    ],
    lastUpdated: "2026-10-20T16:00:00Z"
  },
  {
    id: "prospect-07",
    companyName: "PrismShield Cyber",
    domain: "prismshield.internal",
    industry: "Cybersecurity & Infrastructure",
    subIndustry: "Zero-Trust Identity & Air-gap Policy",
    headquarters: "Reston, VA",
    employeeCount: "62 employees",
    stage: "Series A ($11M • Lead: Citadel Defense Tech)",
    fitScore: 58,
    fitLevel: "moderate",
    fitReasons: [
      "High compliance focus with DoD and federal contractor target market",
      "Recently attained SOC2 Type II and FedRAMP In-Process status",
      "High security friction: strict prohibition on external cloud data processors",
      "Long buying cycle (6-9 months) typical of defense-adjacent cybersecurity"
    ],
    summary: "Zero-trust network access suite built for defense contractors and critical infrastructure providers needing isolated cryptographic tunnels.",
    pipelineStage: "not_a_fit",
    outcomeNotes: "Marked as Not a Fit on Oct 19: Requires on-premise air-gapped deployment which our current SaaS does not support.",
    tags: ["Cybersecurity", "GovTech", "Air-Gapped", "Not A Fit"],
    observedFacts: [
      {
        id: "fact-15",
        fact: "Achieved FedRAMP In-Process designation for defense industrial base customers.",
        source: "FedRAMP Marketplace Registry",
        date: "2026-07-22",
        verified: true
      }
    ],
    hypotheses: [
      {
        id: "hyp-09",
        hypothesis: "Their security evaluation council will reject any SaaS vendor that does not run entirely within a GovCloud VPC boundary.",
        rationale: "Standard defense procurement requirement for FedRAMP High environments.",
        confidence: "high"
      }
    ],
    missingInformation: [
      "Whether they have an open commercial enterprise pipeline outside GovTech"
    ],
    recommendedAngle: {
      hook: "Acknowledge FedRAMP compliance and assess if on-premise Kubernetes operator is required.",
      valueProposition: "Air-gapped deployment option for defense grade intelligence.",
      suggestedCta: "Determine compatibility with GovCloud air-gap requirements."
    },
    targetBuyer: {
      name: "Nathan Vance",
      title: "Chief Information Security Officer",
      emailPlaceholder: "nathan.vance@prismshield.internal",
      linkedinNote: "Nathan Vance CISSP | CISO PrismShield Cyber",
      roleType: "Security Gatekeeper"
    },
    emailDraft: {
      subject: "PrismShield's FedRAMP milestone & air-gapped telemetry question",
      body: `Hi Nathan,

Saw PrismShield's FedRAMP In-Process listing—congratulations to your security engineering team.

Quick question: for your internal prospect intelligence tooling, do you require 100% GovCloud VPC containment, or does your team utilize commercial multi-tenant SaaS for top-of-funnel customer research?

We want to ensure we respect your security boundary before sharing technical details on our research engine.

Regards,
Alex Rivera
Founding Team, ScoutSpark`,
      customizationVariables: {
        "{{first_name}}": "Nathan",
        "{{company}}": "PrismShield",
        "{{recent_event}}": "FedRAMP milestone",
        "{{pain_point}}": "Strict air-gap compliance"
      },
      isApproved: false,
      notes: "Correctly flagged: prospect requires GovCloud air-gap. Marked 'Not a Fit' in pipeline."
    },
    uncertaintyIndicators: [
      "Definite blocker: lack of on-premise deployment mode"
    ],
    lastUpdated: "2026-10-19T09:40:00Z"
  },
  {
    id: "prospect-08",
    companyName: "OrbitCraft Dev",
    domain: "orbitcraft.internal",
    industry: "Developer Tools & Infrastructure",
    subIndustry: "Micro-Frontend Build Orchestration",
    headquarters: "Berlin, Germany",
    employeeCount: "14 employees",
    stage: "Pre-seed ($1.2M • Lead: European Angel Syndicate)",
    fitScore: 42,
    fitLevel: "unlikely",
    fitReasons: [
      "Pre-seed stage with small 14-person engineering team",
      "Open source core with nascent commercial monetization",
      "Solo founder Alex Mercer currently handles both code and outbound calls",
      "Low willingness to pay for dedicated prospecting software at current ARR"
    ],
    summary: "Next-generation bundler and module federation orchestrator for micro-frontend web applications.",
    pipelineStage: "to_research",
    tags: ["Open Source", "Pre-Seed", "DevTools", "Low Budget"],
    observedFacts: [
      {
        id: "fact-16",
        fact: "GitHub repository crossed 4,200 stars with 120 weekly active contributors.",
        source: "GitHub Public Metric API",
        date: "2026-10-15",
        verified: true
      }
    ],
    hypotheses: [
      {
        id: "hyp-10",
        hypothesis: "The founder is focused 90% on developer adoption and OSS community growth, not enterprise outbound sales.",
        rationale: "Recent podcast interview with founder emphasizes community growth over enterprise revenue.",
        confidence: "high"
      }
    ],
    missingInformation: [
      "Whether enterprise cloud tier pricing has been established"
    ],
    recommendedAngle: {
      hook: "Congratulate on GitHub milestone and track when they begin enterprise lead qualification.",
      valueProposition: "Identify enterprise developers contributing to open source repos as commercial buyer signals.",
      suggestedCta: "Connect on developer-led growth metrics."
    },
    targetBuyer: {
      name: "Alex Mercer",
      title: "Founder & Lead Architect",
      emailPlaceholder: "alex@orbitcraft.internal",
      linkedinNote: "Alex Mercer | Creator of OrbitCraft | Open Source Enthusiast",
      roleType: "Technical Founder"
    },
    emailDraft: {
      subject: "OrbitCraft's 4.2k GitHub stars & enterprise dev detection",
      body: `Hi Alex,

Huge congrats on OrbitCraft passing 4,200 GitHub stars this week—the module federation DX you built is slick.

I know at pre-seed your priority is developer love rather than aggressive outbound. When you do start seeing Fortune 500 engineers starring the repo from corporate domains, finding those signals is tricky.

Bookmarking your progress for when OrbitCraft starts launching your enterprise cloud tier.

Keep crushing it,
Alex Rivera
Founding Team, ScoutSpark`,
      customizationVariables: {
        "{{first_name}}": "Alex",
        "{{company}}": "OrbitCraft",
        "{{recent_event}}": "4.2k GitHub stars milestone",
        "{{pain_point}}": "Identifying commercial buyers from OSS"
      },
      isApproved: false,
      notes: "Scored 42% fit. Kept on nurture list; not ready for active sales motion."
    },
    uncertaintyIndicators: [
      "Company budget insufficient for immediate paid pilot"
    ],
    lastUpdated: "2026-10-15T18:20:00Z"
  }
];

export const MOCK_SIGNALS: ResearchSignal[] = [
  {
    id: "sig-01",
    type: "tech_stack_migration",
    companyName: "KiteMetrics",
    prospectId: "prospect-01",
    title: "Kubernetes Cluster Ingestion Scale & Broker Lag",
    summary: "Engineering blog post and open GitHub PRs confirm transition to multi-tenant trace collector handling >20M spans/sec.",
    timestamp: "2 hours ago",
    confidence: 94,
    relevanceScore: 98,
    impactBadge: "Critical Urgency"
  },
  {
    id: "sig-02",
    type: "funding_round",
    companyName: "AuraPulse Health",
    prospectId: "prospect-02",
    title: "14-Clinic Multi-Practice Expansion in Central Texas",
    summary: "Acquired 4 regional clinical practices; CMO published essay identifying front-desk EHR transcription as primary throughput bottleneck.",
    timestamp: "4 hours ago",
    confidence: 96,
    relevanceScore: 95,
    impactBadge: "High Opportunity"
  },
  {
    id: "sig-03",
    type: "product_launch",
    companyName: "VeritasFlow",
    prospectId: "prospect-03",
    title: "UK & EU Multi-Currency Card Clearing Launch",
    summary: "Released multi-jurisdiction clearing product with Stripe Issuing; recruiting settlement operations analyst to handle discrepancies.",
    timestamp: "Yesterday",
    confidence: 91,
    relevanceScore: 90,
    impactBadge: "Active Expansion"
  },
  {
    id: "sig-04",
    type: "executive_hire",
    companyName: "BeaconStack",
    prospectId: "prospect-04",
    title: "Priya Sharma Keynote on LLM Underwriting Guardrails",
    summary: "Keynote presentation detailing prompt regression challenges when evaluating financial underwriting models.",
    timestamp: "2 days ago",
    confidence: 89,
    relevanceScore: 86,
    impactBadge: "Technical Trigger"
  },
  {
    id: "sig-05",
    type: "hiring_surge",
    companyName: "LogixFleet",
    prospectId: "prospect-05",
    title: "ThermoKing 1,200 Reefer Telematics Integration",
    summary: "Sensor telemetry deployment completed; operations team experiencing dispatcher alert fatigue from false temperature spikes.",
    timestamp: "3 days ago",
    confidence: 85,
    relevanceScore: 81,
    impactBadge: "Operational Signal"
  }
];

export const MOCK_EVAL_METRICS: EvaluationMetric[] = [
  {
    id: "eval-01",
    name: "Observed Fact Grounding Rate",
    category: "grounding",
    score: "99.2%",
    target: "≥ 98.0%",
    status: "healthy",
    benchmarkNotes: "Evaluated on 420 extracted statements: zero hallucinated citations. Unverified statements strictly tagged as hypotheses.",
    description: "Percentage of extracted business claims directly traceable to a verifiable public or archival artifact.",
    trend: "+1.4% vs last benchmark"
  },
  {
    id: "eval-02",
    name: "ICP Fit Qualification Precision",
    category: "accuracy",
    score: "91.8%",
    target: "≥ 88.0%",
    status: "healthy",
    benchmarkNotes: "Validated against human founder accept/reject decisions over 60 test accounts.",
    description: "Accuracy of fit score ranking in matching an early-stage startup's true ideal customer criteria.",
    trend: "+3.2% vs last benchmark"
  },
  {
    id: "eval-03",
    name: "Hypothesis Uncertainty Flagging",
    category: "ranking",
    score: "94.5%",
    target: "≥ 90.0%",
    status: "healthy",
    benchmarkNotes: "Identifies unverified assumptions (e.g. cloud egress bills or internal committee structures) before outreach.",
    description: "Reliability in detecting speculative assumptions and prompting human review before drafting.",
    trend: "+2.1% vs last benchmark"
  },
  {
    id: "eval-04",
    name: "Human Research Time Reduction",
    category: "efficiency",
    score: "78.4%",
    target: "≥ 70.0%",
    status: "improving",
    benchmarkNotes: "Measured median time to produce an approved, hyper-personalized draft (dropped from 42 mins to 8.5 mins).",
    description: "Efficiency gain for founders and account leads compared to manual multi-tab research workflows.",
    trend: "+6.8% vs last benchmark"
  }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-01",
    timestamp: "18 minutes ago",
    type: "approval",
    title: "Draft Approved by Human",
    description: "VeritasFlow personalized email draft approved for founder outreach by Alex Rivera.",
    prospectName: "VeritasFlow",
    user: "Alex Rivera"
  },
  {
    id: "act-02",
    timestamp: "1 hour ago",
    type: "research_signal",
    title: "High-Signal Incident Detected",
    description: "Identified Kafka trace bottleneck signal for KiteMetrics with 96% fit score.",
    prospectName: "KiteMetrics",
    user: "Scout Engine"
  },
  {
    id: "act-03",
    timestamp: "3 hours ago",
    type: "pipeline_move",
    title: "Stage Updated to Not a Fit",
    description: "PrismShield Cyber moved to Not a Fit due to GovCloud air-gapped on-premise requirement.",
    prospectName: "PrismShield Cyber",
    user: "Alex Rivera"
  },
  {
    id: "act-04",
    timestamp: "Yesterday",
    type: "draft_edited",
    title: "Email Draft Tailored",
    description: "Edited clinical workflow hook in AuraPulse Health email to emphasize AthenaHealth zero-click sync.",
    prospectName: "AuraPulse Health",
    user: "Alex Rivera"
  }
];
