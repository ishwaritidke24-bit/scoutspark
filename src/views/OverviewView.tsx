import React, { useState } from 'react';
import { Prospect, ResearchSignal, ActivityItem, PipelineStage, ViewTab } from '../types';
import { ScoutMascot } from '../components/ScoutMascot';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Users, 
  ArrowUpRight,
  Target,
  FileCheck,
  Zap,
  Kanban,
  Send,
  HelpCircle,
  Search,
  Check,
  Flame,
  Globe,
  Sliders,
  X,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

interface OverviewViewProps {
  prospects: Prospect[];
  signals: ResearchSignal[];
  activities: ActivityItem[];
  onOpenDiscovery: () => void;
  onOpenGuide?: () => void;
  onSelectProspect: (prospect: Prospect) => void;
  onNavigateToTab: (tab: ViewTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  prospects,
  signals,
  activities,
  onOpenDiscovery,
  onOpenGuide,
  onSelectProspect,
  onNavigateToTab,
}) => {
  // Interactive "How It Works" active tab state
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);

  // Compute pipeline stage counts
  const stageCounts: Record<PipelineStage, number> = {
    to_research: prospects.filter(p => p.pipelineStage === 'to_research').length,
    ready_to_review: prospects.filter(p => p.pipelineStage === 'ready_to_review').length,
    approved: prospects.filter(p => p.pipelineStage === 'approved').length,
    contacted: prospects.filter(p => p.pipelineStage === 'contacted').length,
    replied: prospects.filter(p => p.pipelineStage === 'replied').length,
    meeting: prospects.filter(p => p.pipelineStage === 'meeting').length,
    won: prospects.filter(p => p.pipelineStage === 'won').length,
    not_a_fit: prospects.filter(p => p.pipelineStage === 'not_a_fit').length,
  };

  // High fit shortlist sorted by score
  const shortlist = [...prospects].sort((a, b) => b.fitScore - a.fitScore).slice(0, 4);

  // Dynamic next best action recommendation based on workspace state
  const getNextBestAction = () => {
    const readyToReview = prospects.find(p => p.pipelineStage === 'ready_to_review');
    const approved = prospects.find(p => p.pipelineStage === 'approved');

    if (prospects.length === 0) {
      return {
        title: "Define Target Customer & Search the Web",
        desc: "You have no leads in your workspace yet. Start by defining your ideal customer criteria, then run ScoutStar's AI discovery engine.",
        buttonText: "Set Target Customer",
        action: () => onNavigateToTab('settings'),
        secondaryText: "Launch Discovery",
        secondaryAction: onOpenDiscovery,
        badge: "STEP 1"
      };
    }

    if (readyToReview) {
      return {
        title: `Review Lead Dossier: ${readyToReview.companyName}`,
        desc: `ScoutStar found ${readyToReview.observedFacts.length} verified facts for ${readyToReview.companyName}. An email draft is prepared and waiting for your review.`,
        buttonText: `Review ${readyToReview.companyName}`,
        action: () => onSelectProspect(readyToReview),
        secondaryText: "See All Ready Leads",
        secondaryAction: () => onNavigateToTab('prospects'),
        badge: "ACTION NEEDED"
      };
    }

    if (approved) {
      return {
        title: `Ready to Send: ${approved.companyName}`,
        desc: `You have approved the personalized outreach message for ${approved.companyName}. Copy the text and move them to 'Reached out' in your Pipeline.`,
        buttonText: "Open Pipeline",
        action: () => onNavigateToTab('pipeline'),
        secondaryText: "Review Sequence",
        secondaryAction: () => onNavigateToTab('campaigns'),
        badge: "OUTREACH READY"
      };
    }

    return {
      title: "Find More High-Intent Customers",
      desc: "All current leads have been processed. Run a fresh discovery search across the public web or explore additional market segments.",
      buttonText: "Start Scouting",
      action: onOpenDiscovery,
      secondaryText: "View Leads",
      secondaryAction: () => onNavigateToTab('prospects'),
      badge: "DISCOVERY"
    };
  };

  const nextAction = getNextBestAction();

  // Reference prospect for interactive demonstration (uses first prospect or fallback)
  const sampleProspect: Prospect = prospects[0] || {
    id: "sample-1",
    companyName: "KiteMetrics",
    domain: "kitemetrics.internal",
    industry: "Developer Tools & Observability",
    subIndustry: "Distributed Tracing",
    headquarters: "San Francisco, CA",
    employeeCount: "42 employees",
    stage: "Series A • $14M ARR",
    fitScore: 88,
    fitLevel: "exceptional",
    fitReasons: [
      "Series A observability platform experiencing 3x trace volume growth",
      "Public postmortem discussing Kafka buffer saturation and ingest lag"
    ],
    summary: "Cloud-native distributed tracing platform scaling enterprise data collectors.",
    pipelineStage: "ready_to_review",
    observedFacts: [
      {
        id: "f-1",
        fact: "Published engineering postmortem on Kafka buffer latency during enterprise ingest spike.",
        source: "KiteMetrics Engineering Blog (Sept 2026)",
        verified: true
      },
      {
        id: "f-2",
        fact: "Actively hiring 4 distributed systems engineers for collector infrastructure.",
        source: "Public Careers Page",
        verified: true
      }
    ],
    hypotheses: [
      {
        id: "h-1",
        hypothesis: "Likely struggling with high cloud storage tier bills due to uncompressed cold traces.",
        rationale: "Typical scaling bottleneck when trace cardinality triples at Series A.",
        confidence: "high"
      }
    ],
    missingInformation: ["Exact monthly cloud egress budget"],
    recommendedAngle: {
      hook: "Referencing their postmortem on Kafka buffer saturation",
      valueProposition: "65% trace storage cost reduction with zero collector rewrites",
      suggestedCta: "12-minute technical peer review on ingestion proxies"
    },
    targetBuyer: {
      name: "Elena Vance",
      title: "VP of Engineering",
      emailPlaceholder: "elena@kitemetrics.internal",
      linkedinNote: "Head of Infrastructure scaling telemetry collectors",
      roleType: "Technical Decision Maker"
    },
    emailDraft: {
      subject: "Your post on Kafka trace overhead & KiteMetrics' p99 latency",
      body: "Hi Elena,\n\nRead your candid postmortem on KiteMetrics' Kafka buffer saturation during last month's enterprise ingest surge. Loved the transparency on where your team spent 36 hours diagnosing span drops.\n\nMost Series A observability startups hit that exact wall when trace cardinality triples...",
      customizationVariables: {},
      isApproved: false
    },
    uncertaintyIndicators: [],
    lastUpdated: "Just now",
    tags: ["Observability", "Kafka", "Series A"]
  };

  return (
    <div className="space-y-10 pb-16">
      {/* =========================================================================
          HERO SECTION: PRODUCT PURPOSE INSTANTLY UNDERSTANDABLE WITHIN SECONDS
         ========================================================================= */}
      <div 
        data-scout-target="overview-hero"
        className="card-tactile p-6 sm:p-10 rounded-3xl relative overflow-hidden bg-[#FAF7F0] border-2 border-[#17271F] shadow-[6px_6px_0px_#17271F]"
      >
        {/* Subtle decorative graph sketch pattern */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(#D8FF65_1.5px,transparent_1.5px)] [background-size:18px_18px] opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            {/* Target Audience & Purpose Eyebrow Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17271F] text-[#D8FF65] text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-[#D8FF65] animate-ping" />
                AI RESEARCH & OUTREACH FOR FOUNDER-LED SALES
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFEAE5] border border-[#FF7054] text-[#17271F] text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF7054]" />
                Zero Automated Email Spam
              </span>
            </div>

            {/* Memorable Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-bold text-[#17271F] tracking-tight leading-[1.12]">
              Find the right companies. See why they fit. Turn verified clues into booked calls.
            </h1>

            {/* Plain-English Problem, Solution & Audience Description */}
            <p className="text-sm sm:text-base text-[#4A5E52] leading-relaxed font-normal">
              Most B2B lead generation relies on stale databases and cold-email blasts that ruin your domain. 
              <strong> ScoutSpark searches the live public web</strong> for companies with real buying signals (hiring surges, infrastructure migrations, executive changes), cites proof for every claim, and drafts personalized messages for you to review. 
              <strong> You approve and send every email directly from your own inbox.</strong>
            </p>

            {/* Target Audience Callout */}
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#17271F] bg-white border border-[#E2D9C8] px-3 py-1.5 rounded-xl">
              <span className="font-bold text-[#FF7054]">BUILT FOR:</span>
              <span>Early-stage founders, technical CEOs & B2B teams doing high-conviction sales.</span>
            </div>

            {/* Obvious Primary Call To Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                data-scout-target="start-scouting-btn"
                onClick={onOpenDiscovery}
                className="btn-tactile-coral px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#17271F] hover:-translate-y-0.5 transition-transform"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Scouting Leads</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => onNavigateToTab('settings')}
                className="btn-tactile-secondary px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Target className="w-4 h-4 text-[#FF7054]" />
                <span>Define Target Customer</span>
              </button>

              {onOpenGuide && (
                <button
                  onClick={onOpenGuide}
                  className="btn-tactile-secondary px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer text-[#17271F] hover:text-[#FF7054]"
                >
                  <HelpCircle className="w-4 h-4 text-[#FF7054]" />
                  <span>60-Sec Product Tour</span>
                </button>
              )}
            </div>

            {/* 4 Value Pillars Checklist */}
            <div className="pt-3 border-t border-[#E2D9C8] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#17271F]">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7054] shrink-0" />
                <span>100% Human Approval</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7054] shrink-0" />
                <span>Verified Web Citations</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7054] shrink-0" />
                <span>Calibrated 0-100 Fit Score</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7054] shrink-0" />
                <span>Zero AI Hallucinations</span>
              </div>
            </div>
          </div>

          {/* ScoutStar Interactive Companion Hero Card */}
          <div className="bg-[#FFFFFF] border-2 border-[#17271F] rounded-2xl p-6 shadow-[5px_5px_0px_#17271F] flex flex-col items-center text-center max-w-xs shrink-0 self-center lg:self-auto">
            <ScoutMascot expression="waving" size="lg" animate={true} />
            <div className="mt-3">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#17271F] uppercase tracking-wider font-mono bg-[#D8FF65] px-2 py-0.5 rounded border border-[#17271F]">
                Meet ScoutStar ⭐
              </div>
              <h2 className="text-sm font-editorial font-bold text-[#17271F] mt-1.5">
                Your AI Research Companion
              </h2>
              <p className="text-xs text-[#4A5E52] mt-1 italic leading-relaxed">
                "I crawl public news, job postings, and technical blogs so you never send generic copy-paste emails."
              </p>
              <div className="mt-4 pt-3 border-t border-[#E2D9C8] text-[11px] text-[#17271F] font-semibold flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9DE3D0] animate-pulse" />
                <span>{signals.length} verified updates found today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC NEXT BEST ACTION CARD: GUIDES USER TOWARD IMMEDIATE VALUE
         ========================================================================= */}
      <div 
        data-scout-target="priority-shortlist"
        className="p-5 sm:p-6 bg-white border-2 border-[#17271F] rounded-2xl shadow-[4px_4px_0px_#17271F] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="p-2.5 rounded-xl bg-[#D8FF65] border-1.5 border-[#17271F] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-[#17271F]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#17271F] text-[#D8FF65] font-bold">
                {nextAction.badge}
              </span>
              <h2 className="text-sm sm:text-base font-editorial font-bold text-[#17271F]">
                Recommended Next Step: {nextAction.title}
              </h2>
            </div>
            <p className="text-xs text-[#4A5E52] leading-relaxed">
              {nextAction.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          {nextAction.secondaryText && (
            <button
              onClick={nextAction.secondaryAction}
              className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {nextAction.secondaryText}
            </button>
          )}
          <button
            onClick={nextAction.action}
            className="btn-tactile-coral px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#17271F]"
          >
            <span>{nextAction.buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE "HOW SCOUTSPARK WORKS" 4-STEP JOURNEY WITH LIVE PREVIEWS
         ========================================================================= */}
      <div 
        data-scout-target="workflow-preview"
        className="bg-white border-2 border-[#17271F] rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_#17271F] space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2D9C8]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#FF7054]">
              <Sparkles className="w-3.5 h-3.5" /> HOW SCOUTSPARK WORKS
            </div>
            <h2 className="text-2xl font-editorial font-bold text-[#17271F] mt-0.5">
              The 4-Step Journey: From Target Profile to Booked Call
            </h2>
            <p className="text-xs text-[#4A5E52] mt-0.5">
              Click any stage below to inspect real application data and how ScoutSpark connects the workflow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[#17271F] bg-[#FAF7F0] px-3 py-1.5 rounded-xl border border-[#17271F]">
              STAGE {activeWorkflowStep} OF 4
            </span>
          </div>
        </div>

        {/* 4 Step Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: 1, title: "1. Target Customer", subtitle: "Define ICP criteria", icon: <Target className="w-4 h-4" /> },
            { step: 2, title: "2. AI Discovery", subtitle: "Live web search & clues", icon: <Search className="w-4 h-4" /> },
            { step: 3, title: "3. Grounded Scoring", subtitle: "Evidence & fit scores", icon: <ShieldCheck className="w-4 h-4" /> },
            { step: 4, title: "4. Human Outreach", subtitle: "Approve & send drafts", icon: <Send className="w-4 h-4" /> },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveWorkflowStep(item.step)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                activeWorkflowStep === item.step
                  ? 'bg-[#17271F] text-[#F7F2E8] border-[#17271F] shadow-[3px_3px_0px_#FF7054]'
                  : 'bg-[#FAF7F0] text-[#17271F] border-[#E2D9C8] hover:border-[#17271F]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`p-1.5 rounded-lg ${activeWorkflowStep === item.step ? 'bg-[#2A4034] text-[#D8FF65]' : 'bg-white text-[#FF7054] border border-[#E2D9C8]'}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-mono font-bold ${activeWorkflowStep === item.step ? 'text-[#D8FF65]' : 'text-[#4A5E52]'}`}>
                  0{item.step}
                </span>
              </div>
              <div className="text-xs font-bold font-editorial">{item.title}</div>
              <div className={`text-[11px] ${activeWorkflowStep === item.step ? 'text-[#F7F2E8]/80' : 'text-[#4A5E52]'}`}>
                {item.subtitle}
              </div>
            </button>
          ))}
        </div>

        {/* Interactive Step Preview Panel (Showcasing real sample data) */}
        <div className="p-5 sm:p-6 bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl space-y-4">
          {activeWorkflowStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#17271F] text-[#D8FF65]">STEP 1 · TARGET CUSTOMER</span>
                  <h3 className="text-lg font-editorial font-bold text-[#17271F] mt-1">
                    Define who you sell to, and who to eliminate automatically
                  </h3>
                  <p className="text-xs text-[#4A5E52]">
                    ScoutStar uses your ICP to filter out irrelevant companies before you ever spend time reading them.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('settings')}
                  className="btn-tactile-coral px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <span>Configure My ICP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Real UI Preview of ICP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-xl border border-[#17271F]">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#4A5E52] font-bold">Target Roles</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-[#FAF7F0] rounded border border-[#E2D9C8] font-semibold text-[#17271F]">VP of Engineering</span>
                    <span className="px-2 py-0.5 bg-[#FAF7F0] rounded border border-[#E2D9C8] font-semibold text-[#17271F]">Head of Infrastructure</span>
                    <span className="px-2 py-0.5 bg-[#FAF7F0] rounded border border-[#E2D9C8] font-semibold text-[#17271F]">CTO</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#4A5E52] font-bold">Target Industries & Sizes</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-[#D8FF65]/30 rounded border border-[#17271F] font-semibold text-[#17271F]">Developer Tools</span>
                    <span className="px-2 py-0.5 bg-[#D8FF65]/30 rounded border border-[#17271F] font-semibold text-[#17271F]">Observability</span>
                    <span className="px-2 py-0.5 bg-[#FAF7F0] rounded border border-[#E2D9C8] text-[#4A5E52]">20-100 Employees</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#FF7054] font-bold">Disqualification Exclusions</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-[#FFEAE5] text-[#FF7054] rounded border border-[#FF7054] font-semibold">Crypto / Web3</span>
                    <span className="px-2 py-0.5 bg-[#FFEAE5] text-[#FF7054] rounded border border-[#FF7054] font-semibold">Agencies / Dev Shops</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeWorkflowStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#17271F] text-[#D8FF65]">STEP 2 · DISCOVERY & SEARCH</span>
                  <h3 className="text-lg font-editorial font-bold text-[#17271F] mt-1">
                    AI crawls the live web for buying signals, not stale phone lists
                  </h3>
                  <p className="text-xs text-[#4A5E52]">
                    Tavily Search + Google Gemini identify public postmortems, hiring surges, and tech stack migrations.
                  </p>
                </div>
                <button
                  onClick={onOpenDiscovery}
                  className="btn-tactile-coral px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Discovery</span>
                </button>
              </div>

              {/* Real UI Preview of Discovered Signal */}
              <div className="bg-white p-4 rounded-xl border border-[#17271F] space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2D9C8]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9DE3D0] animate-pulse" />
                    <span className="font-bold text-[#17271F]">Live Signal Found: KiteMetrics</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#4A5E52]">Source: kitemetrics.io/blog/postmortem-kafka-surge</span>
                </div>
                <p className="text-[11px] text-[#4A5E52]">
                  <strong className="text-[#17271F]">Verified Web Snippet: </strong>
                  "During our enterprise ingest surge last month, our Kafka buffer hit saturation, dropping spans and costing our team 36 hours of diagnosis..."
                </p>
                <div className="flex items-center gap-3 text-[10px] text-[#FF7054] font-semibold pt-1">
                  <span>⚡ Signal: Kafka Buffer Latency Spike</span>
                  <span>•</span>
                  <span>Confidence: 94%</span>
                  <span>•</span>
                  <span>Relevance: 88/100</span>
                </div>
              </div>
            </div>
          )}

          {activeWorkflowStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#17271F] text-[#D8FF65]">STEP 3 · EVIDENCE & SCORING</span>
                  <h3 className="text-lg font-editorial font-bold text-[#17271F] mt-1">
                    Every claim is verified. Unsupported claims are demoted to hypotheses.
                  </h3>
                  <p className="text-xs text-[#4A5E52]">
                    ScoutSpark separates source-backed facts from AI guesses so you never look foolish in front of a buyer.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('prospects')}
                  className="btn-tactile-coral px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <span>See Evaluated Leads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Real UI Preview of Grounded Dossier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-[#17271F] space-y-2">
                  <div className="text-[10px] font-mono font-bold uppercase text-[#9DE3D0] bg-[#17271F] px-2 py-0.5 rounded inline-block">
                    ✓ VERIFIED OBSERVED FACTS (2)
                  </div>
                  <ul className="space-y-1 text-[11px] text-[#17271F]">
                    <li>• Postmortem published on Kafka buffer saturation during enterprise surge.</li>
                    <li>• Actively hiring 4 distributed systems engineers for collectors.</li>
                  </ul>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#17271F] space-y-2">
                  <div className="text-[10px] font-mono font-bold uppercase text-[#FF7054] bg-[#FFEAE5] px-2 py-0.5 rounded border border-[#FF7054] inline-block">
                    ⚡ LABELED AI HYPOTHESES (1)
                  </div>
                  <p className="text-[11px] text-[#4A5E52]">
                    • Likely experiencing cloud storage tier cost spikes as trace cardinality triples at Series A. (Marked as hypothesis to double check).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeWorkflowStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#17271F] text-[#D8FF65]">STEP 4 · PERSONALIZED OUTREACH</span>
                  <h3 className="text-lg font-editorial font-bold text-[#17271F] mt-1">
                    Human-approved messages you copy and send from your own inbox
                  </h3>
                  <p className="text-xs text-[#4A5E52]">
                    Zero automated mass-sending. You review, approve, and send thoughtful emails directly to decision-makers.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('campaigns')}
                  className="btn-tactile-coral px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <span>View Sequences</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Real UI Preview of Draft */}
              <div className="bg-white p-4 rounded-xl border border-[#17271F] space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2D9C8]">
                  <span className="font-mono text-[11px] font-bold text-[#17271F]">
                    Subject: Your post on Kafka trace overhead & KiteMetrics' p99 latency
                  </span>
                  <span className="sticker-badge bg-[#9DE3D0] text-[#17271F] border-[#17271F] text-[9px]">
                    100% Personal Review
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#4A5E52] leading-relaxed line-clamp-3">
                  "Hi Elena, Read your candid postmortem on KiteMetrics' Kafka buffer saturation during last month's enterprise ingest surge. Loved the transparency on where your team spent 36 hours diagnosing span drops..."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          BEFORE VS. AFTER: WHY FOUNDERS SWITCH TO SCOUTSPARK
         ========================================================================= */}
      <div className="bg-white border-2 border-[#17271F] rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_#17271F] space-y-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#FF7054]">
            THE FOUNDER-LED SALES DIFFERENCE
          </span>
          <h2 className="text-2xl font-editorial font-bold text-[#17271F] mt-0.5">
            Traditional Cold Outreach vs. ScoutSpark Intelligent Scouting
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Legacy Cold Scraping */}
          <div className="p-5 bg-[#FAF7F0] rounded-2xl border-1.5 border-[#17271F]/30 space-y-3">
            <div className="flex items-center gap-2 text-[#FF7054] font-bold text-sm">
              <X className="w-4 h-4 text-[#FF7054]" />
              <span>Legacy Stale Databases & Mass Bots</span>
            </div>
            <ul className="space-y-2 text-[#4A5E52] text-[11px]">
              <li className="flex items-start gap-2">
                <span className="text-[#FF7054] font-bold">✕</span>
                <span>Stale, purchased CSV lists of people who changed jobs 8 months ago</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF7054] font-bold">✕</span>
                <span>Generic "Quick question" cold spam that gets your email domain blacklisted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF7054] font-bold">✕</span>
                <span>AI tools hallucinating company metrics with zero citations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF7054] font-bold">✕</span>
                <span>Automated mail merge software sending embarrassing mistakes without you</span>
              </li>
            </ul>
          </div>

          {/* ScoutSpark Method */}
          <div className="p-5 bg-[#D8FF65]/20 rounded-2xl border-2 border-[#17271F] space-y-3 shadow-[3px_3px_0px_#17271F]">
            <div className="flex items-center gap-2 text-[#17271F] font-bold text-sm font-editorial">
              <Check className="w-4 h-4 text-green-700 stroke-[3]" />
              <span>ScoutSpark Verified Research</span>
            </div>
            <ul className="space-y-2 text-[#17271F] text-[11px]">
              <li className="flex items-start gap-2">
                <span className="text-green-700 font-bold">✓</span>
                <span><strong>Live web search: </strong>Identifies recent postmortems, job surges, and stack updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-700 font-bold">✓</span>
                <span><strong>Grounded citations: </strong>Every observed fact cites its live public web source URL</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-700 font-bold">✓</span>
                <span><strong>Calibrated fit scoring: </strong>0-100 scores tuned to your target buyer and exclusions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-700 font-bold">✓</span>
                <span><strong>100% Human approval: </strong>You review, edit, and send from your personal inbox</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LIVE PIPELINE BOARD SNAPSHOT: CURRENT WORKSPACE STATUS
         ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-editorial font-bold text-[#17271F]">
              Your Outreach Pipeline Snapshot
            </h2>
            <p className="text-xs text-[#4A5E52]">Click any column to jump directly to that stage on your board</p>
          </div>
          <button
            onClick={() => onNavigateToTab('pipeline')}
            className="text-xs font-semibold text-[#17271F] hover:text-[#FF7054] flex items-center gap-1 cursor-pointer"
          >
            See full board <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'To search', count: stageCounts.to_research, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/30' },
            { label: 'Ready to check', count: stageCounts.ready_to_review, bg: 'bg-[#FFEAE5]', border: 'border-[#FF7054]' },
            { label: 'Ready to send', count: stageCounts.approved, bg: 'bg-[#D8FF65]/30', border: 'border-[#17271F]' },
            { label: 'Reached out', count: stageCounts.contacted, bg: 'bg-[#9DE3D0]/30', border: 'border-[#17271F]' },
            { label: 'Got a reply', count: stageCounts.replied, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/30' },
            { label: 'Meeting booked', count: stageCounts.meeting, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/30' },
            { label: 'Customer won!', count: stageCounts.won, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/30' },
            { label: 'Not a fit', count: stageCounts.not_a_fit, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/30' },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigateToTab('pipeline')}
              className={`p-3 rounded-xl border-1.5 ${item.border} ${item.bg} text-center cursor-pointer hover:-translate-y-0.5 transition-transform shadow-[2px_2px_0px_rgba(23,39,31,0.06)]`}
            >
              <div className="text-xl font-bold font-mono text-[#17271F]">{item.count}</div>
              <div className="text-[10px] font-semibold text-[#4A5E52] uppercase tracking-wider truncate mt-0.5">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TWO COLUMN GRID: HIGH FIT SHORTLIST & TODAY'S RESEARCH SIGNALS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Priority Shortlist (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-editorial font-bold text-[#17271F]">
                Priority Matches ({shortlist.length})
              </h2>
              <p className="text-xs text-[#4A5E52]">Businesses with strong fit scores and verified public clues</p>
            </div>
            <button
              onClick={() => onNavigateToTab('prospects')}
              className="text-xs font-semibold text-[#FF7054] hover:underline cursor-pointer"
            >
              See all {prospects.length}
            </button>
          </div>

          <div className="space-y-3">
            {shortlist.length > 0 ? (
              shortlist.map(prospect => (
                <div
                  key={prospect.id}
                  onClick={() => onSelectProspect(prospect)}
                  className="card-tactile p-4 rounded-xl cursor-pointer hover:border-[#17271F] group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#D8FF65] border-1.5 border-[#17271F] flex flex-col items-center justify-center font-mono font-bold text-[#17271F] shadow-[2px_2px_0px_#17271F] shrink-0">
                        <span className="text-lg leading-none">{prospect.fitScore}</span>
                        <span className="text-[8px] uppercase tracking-tight">MATCH</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-editorial font-bold text-[#17271F] group-hover:text-[#FF7054] transition-colors">
                            {prospect.companyName}
                          </h3>
                          <span className="text-[10px] font-mono text-[#4A5E52]">
                            {prospect.stage.split(' •')[0]}
                          </span>
                        </div>
                        <p className="text-xs text-[#4A5E52] mt-0.5 line-clamp-1">
                          {prospect.summary}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-[#17271F] mt-2">
                          <span className="font-semibold text-[#FF7054]">
                            {prospect.targetBuyer.name} ({prospect.targetBuyer.title})
                          </span>
                          <span>•</span>
                          <span className="text-[#4A5E52]">
                            {prospect.observedFacts.length} source details
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        prospect.pipelineStage === 'approved' 
                          ? 'bg-[#9DE3D0] text-[#17271F] border-[#17271F]' 
                          : prospect.pipelineStage === 'ready_to_review'
                          ? 'bg-[#FFEAE5] text-[#FF7054] border-[#FF7054]'
                          : 'bg-[#FAF7F0] text-[#4A5E52] border-[#E2D9C8]'
                      }`}>
                        {prospect.pipelineStage === 'approved'
                          ? 'ready to send'
                          : prospect.pipelineStage === 'ready_to_review'
                          ? 'ready to check'
                          : prospect.pipelineStage.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-[#4A5E52] flex items-center gap-0.5 mt-1">
                        Check details <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border-2 border-dashed border-[#17271F]/30 rounded-xl p-8 text-center space-y-3">
                <ScoutMascot expression="thinking" size="md" animate={true} />
                <h3 className="text-base font-bold text-[#17271F]">No leads yet</h3>
                <p className="text-xs text-[#4A5E52] max-w-sm mx-auto">
                  Click 'Start Scouting Leads' to search the public web or load sample companies.
                </p>
                <button
                  onClick={onOpenDiscovery}
                  className="btn-tactile-coral px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Scouting Leads</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Research Signals & Recent Activities (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Research Signals */}
          <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 shadow-[3px_3px_0px_#17271F]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2D9C8]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF7054]" />
                <h2 className="text-sm font-editorial font-bold text-[#17271F]">
                  Fresh Company Clues
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#4A5E52]">Live web citations</span>
            </div>

            <div className="space-y-3 mt-3">
              {signals.slice(0, 3).map(sig => (
                <div key={sig.id} className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17271F]">{sig.companyName}</span>
                    <span className="text-[10px] text-[#4A5E52] font-mono">{sig.timestamp}</span>
                  </div>
                  <p className="font-semibold text-xs text-[#17271F]">{sig.title}</p>
                  <p className="text-[11px] text-[#4A5E52] line-clamp-2">{sig.summary}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-[#FF7054] font-semibold">{sig.impactBadge}</span>
                    <span className="text-[#17271F] font-mono">Confidence: {sig.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-2xl p-4 shadow-[2px_2px_0px_#17271F]">
            <div className="flex items-center justify-between pb-2 border-b border-[#17271F]/15 mb-3">
              <h3 className="text-xs font-editorial font-bold text-[#17271F]">
                What happened recently
              </h3>
              <span className="text-[10px] text-[#4A5E52]">Activity history</span>
            </div>

            <div className="space-y-2.5">
              {activities.slice(0, 4).map(act => (
                <div key={act.id} className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#17271F]">{act.title}</span>
                    <span className="text-[10px] text-[#4A5E52]">{act.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#4A5E52] leading-snug">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
