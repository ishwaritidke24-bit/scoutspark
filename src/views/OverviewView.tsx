import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Prospect, ResearchSignal, ActivityItem, PipelineStage, ViewTab } from '../types';
import { ScoutMascot, ScoutExpression } from '../components/ScoutMascot';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  Search, 
  Send, 
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Building2,
  Check
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
  const shouldReduceMotion = useReducedMotion();

  // Automatic Scout greeting state: shown automatically on first session visit
  const [showGreeting, setShowGreeting] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('scoutspark_greeting_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  // Mascot expression state: calm, warm, welcoming smile by default
  const [scoutHeroExpression, setScoutHeroExpression] = useState<ScoutExpression>('idle');
  const [activeStep, setActiveStep] = useState<number>(1);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const handleDismissGreeting = () => {
    setShowGreeting(false);
    try {
      sessionStorage.setItem('scoutspark_greeting_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleMascotClick = () => {
    // Subtle, friendly reaction: a warm, playful wink returning smoothly to default smile
    setShowGreeting(true);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    setScoutHeroExpression('pointing'); // friendly wink
    clickTimerRef.current = setTimeout(() => {
      setScoutHeroExpression('idle');
    }, 1400);
  };

  // Pipeline stage counts
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

  // Top 4 prospects by score
  const shortlist = [...prospects].sort((a, b) => b.fitScore - a.fitScore).slice(0, 4);

  // 3-step workflow items
  const workflowSteps = [
    {
      step: 1,
      stepNumber: '01',
      title: 'Find',
      desc: 'Discover potential customers.',
      icon: <Target className="w-5 h-5 text-[#FF7054]" />,
    },
    {
      step: 2,
      stepNumber: '02',
      title: 'Understand',
      desc: 'Research their needs and relevant signals.',
      icon: <Search className="w-5 h-5 text-[#17271F]" />,
    },
    {
      step: 3,
      stepNumber: '03',
      title: 'Connect',
      desc: 'Create personalized outreach.',
      icon: <Send className="w-5 h-5 text-[#FF7054]" />,
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* =========================================================================
          HERO SECTION: BALANCED TYPOGRAPHY, SCOUT'S AUTOMATIC DANCING GREETING
         ========================================================================= */}
      <section 
        data-scout-target="overview-hero"
        className="card-tactile p-6 sm:p-9 lg:p-11 rounded-3xl relative overflow-hidden bg-[#FAF7F0] border-2 border-[#17271F] shadow-[5px_5px_0px_#17271F]"
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-10">
          
          {/* Left Column: Balanced Headline, Single Supporting Sentence, Primary CTA */}
          <div className="max-w-2xl space-y-4">
            {/* Audience Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17271F] text-[#D8FF65] text-xs font-mono font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D8FF65]" />
              <span>FOR STARTUP FOUNDERS & BUILDERS</span>
            </div>

            {/* Exact Required Hero Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-editorial font-bold text-[#17271F] tracking-tight leading-[1.2]">
              Built something great? Let’s find the people who need it.
            </h1>

            {/* Exact Required Supporting Sentence */}
            <p className="text-base sm:text-lg text-[#4A5E52] leading-relaxed font-normal">
              ScoutSpark helps early-stage startups find the right prospects, understand their needs, and start meaningful conversations.
            </p>

            {/* Primary & Secondary Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <motion.button
                data-scout-target="start-scouting-btn"
                whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                onClick={onOpenDiscovery}
                className="btn-tactile-coral px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl text-base font-bold flex items-center gap-2.5 cursor-pointer shadow-[3px_3px_0px_#17271F] hover:shadow-[5px_5px_0px_#17271F] transition-all"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Find My Next Customer →</span>
              </motion.button>

              <button
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-tactile-secondary px-5 py-3.5 sm:py-4 rounded-2xl text-base font-semibold text-[#17271F] hover:text-[#FF7054] cursor-pointer"
              >
                See How It Works ↓
              </button>
            </div>

            {/* Concise Value Checklist */}
            <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#17271F] font-semibold border-t border-[#E2D9C8]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF7054] shrink-0" />
                <span>Verified web citations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF7054] shrink-0" />
                <span>Calibrated 0–100 fit score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF7054] shrink-0" />
                <span>100% human-approved outreach</span>
              </div>
            </div>
          </div>

          {/* Right Column: Scout's Automatic Dancing Welcome & Speech Bubble */}
          <div className="flex flex-col items-center lg:items-end justify-center shrink-0 self-center lg:self-auto relative w-full lg:w-auto">
            {/* Automatic Welcoming Speech Bubble */}
            <AnimatePresence>
              {showGreeting && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 5 }}
                  transition={{ delay: 0.25, duration: 0.25 }}
                  className="mb-3 bg-white border-2 border-[#17271F] p-4 sm:p-5 rounded-2xl shadow-[4px_4px_0px_#17271F] w-full max-w-xs sm:max-w-sm relative"
                >
                  {/* Tail pointing down toward mascot */}
                  <div className="absolute -bottom-2 left-1/2 lg:left-3/4 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-[#17271F] rotate-45" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold uppercase text-[#FF7054] tracking-wider">
                          Scout
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#D8FF65] animate-ping" />
                      </div>
                      <p className="text-base font-editorial font-bold text-[#17271F] leading-snug">
                        "Hey, builder! 👋 Ready to find the people who need what you're building?"
                      </p>
                      <p className="text-sm text-[#4A5E52] mt-0.5 font-normal">
                        I search live blogs, job postings, and tech updates for your ideal buyers.
                      </p>
                    </div>
                    <button
                      onClick={handleDismissGreeting}
                      className="text-[#4A5E52] hover:text-[#17271F] p-1 rounded-lg hover:bg-[#FAF7F0] cursor-pointer transition-colors shrink-0"
                      aria-label="Dismiss greeting"
                      title="Close greeting"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={onOpenDiscovery}
                    className="mt-3 w-full py-2 bg-[#D8FF65] hover:bg-[#c9f547] text-[#17271F] text-sm font-bold rounded-xl border-1.5 border-[#17271F] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#17271F] cursor-pointer transition-all active:translate-y-0.5"
                  >
                    <span>Start Scouting Leads</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mascot Avatar: Calm, Adorable, Friendly, and Interactive */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              onMouseEnter={() => setScoutHeroExpression('curious')}
              onMouseLeave={() => setScoutHeroExpression('idle')}
              onClick={handleMascotClick}
              className="cursor-pointer group flex flex-col items-center select-none"
              title="Scout — Your AI research co-pilot (click for a friendly wink!)"
            >
              <div className="p-3 sm:p-4 rounded-3xl bg-white border-2 border-[#17271F] shadow-[4px_4px_0px_#17271F] group-hover:shadow-[5px_5px_0px_#FF7054] group-hover:border-[#FF7054] transition-all">
                <ScoutMascot expression={scoutHeroExpression} size="xl" animate={!shouldReduceMotion} />
              </div>
              {/* Mascot Name Badge */}
              <div className="text-xs font-mono font-bold text-[#17271F] mt-2 bg-[#D8FF65] px-2.5 py-0.5 rounded-full border border-[#17271F] shadow-[1px_1px_0px_#17271F]">
                Scout ⭐
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          HOW SCOUTSPARK WORKS: 01 FIND, 02 UNDERSTAND, 03 CONNECT
         ========================================================================= */}
      <section id="how-it-works" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#FF7054]">
              <Sparkles className="w-3.5 h-3.5" /> HOW IT WORKS
            </div>
            <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#17271F] mt-0.5">
              Three simple steps to warm conversations
            </h2>
          </div>
          <span className="text-xs font-mono text-[#4A5E52] uppercase font-semibold">
            Interactive preview
          </span>
        </div>

        {/* 3 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workflowSteps.map(item => {
            const isSelected = activeStep === item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setActiveStep(item.step)}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#17271F] text-[#F7F2E8] border-[#17271F] shadow-[4px_4px_0px_#FF7054]'
                    : 'bg-white text-[#17271F] border-[#E2D9C8] hover:border-[#17271F] shadow-[2px_2px_0px_#17271F]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#2A4034] text-[#D8FF65]' : 'bg-[#FAF7F0] border border-[#E2D9C8]'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-[#D8FF65]' : 'text-[#4A5E52]'}`}>
                    {item.stepNumber}
                  </span>
                </div>
                <h3 className="text-lg font-editorial font-bold">{item.title}</h3>
                <p className={`text-sm mt-1 leading-relaxed ${isSelected ? 'text-[#F7F2E8]/85' : 'text-[#4A5E52]'}`}>
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Step Preview Card */}
        <div className="p-6 sm:p-7 bg-white border-2 border-[#17271F] rounded-3xl shadow-[3px_3px_0px_#17271F]">
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E2D9C8]">
                <div>
                  <h4 className="text-xl font-editorial font-bold text-[#17271F]">
                    01 — Find: Discover potential customers
                  </h4>
                  <p className="text-sm sm:text-base text-[#4A5E52] mt-0.5">
                    Define industries, buyer titles, and dealbreakers so Scout filters out irrelevant accounts.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('settings')}
                  className="btn-tactile-coral px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shrink-0"
                >
                  <span>Edit Target Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#17271F]/25 space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#4A5E52]">Target Roles</span>
                  <div className="flex flex-wrap gap-1.5 text-sm font-semibold text-[#17271F]">
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E2D9C8]">VP of Engineering</span>
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E2D9C8]">CTO</span>
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E2D9C8]">Head of Product</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#17271F]/25 space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#4A5E52]">Target Industries</span>
                  <div className="flex flex-wrap gap-1.5 text-sm font-semibold text-[#17271F]">
                    <span className="px-2.5 py-1 bg-[#D8FF65]/40 rounded-lg border border-[#17271F]">B2B SaaS</span>
                    <span className="px-2.5 py-1 bg-[#D8FF65]/40 rounded-lg border border-[#17271F]">Developer Tools</span>
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E2D9C8]">20–150 employees</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FFEAE5] rounded-xl border border-[#FF7054] space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#FF7054]">Dealbreaker Exclusions</span>
                  <div className="flex flex-wrap gap-1.5 text-sm font-semibold text-[#FF7054]">
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-[#FF7054]">Crypto / Web3</span>
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-[#FF7054]">Outsourcing Agencies</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E2D9C8]">
                <div>
                  <h4 className="text-xl font-editorial font-bold text-[#17271F]">
                    02 — Understand: Research their needs and signals
                  </h4>
                  <p className="text-sm sm:text-base text-[#4A5E52] mt-0.5">
                    Tavily Search and Gemini uncover real public engineering challenges, hiring surges, and tech migrations.
                  </p>
                </div>
                <button
                  onClick={onOpenDiscovery}
                  className="btn-tactile-coral px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Discovery</span>
                </button>
              </div>

              <div className="p-4 bg-[#FAF7F0] rounded-xl border-2 border-[#17271F] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-bold text-sm sm:text-base text-[#17271F]">Verified Signal: KiteMetrics</span>
                  </div>
                  <span className="text-xs font-mono text-[#4A5E52] bg-white px-2 py-0.5 rounded border border-[#E2D9C8]">
                    kitemetrics.internal/blog
                  </span>
                </div>
                <p className="text-sm sm:text-base text-[#17271F] leading-relaxed">
                  "During our enterprise ingest surge last month, our Kafka buffer hit saturation, dropping spans and costing our team 36 hours of diagnosis..."
                </p>
                <div className="pt-1.5 flex items-center gap-3 text-xs font-mono font-bold text-[#FF7054]">
                  <span>⚡ Signal: Kafka Buffer Latency Spike</span>
                  <span>•</span>
                  <span>Confidence: 94%</span>
                  <span>•</span>
                  <span>Fit Score: 96/100</span>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E2D9C8]">
                <div>
                  <h4 className="text-xl font-editorial font-bold text-[#17271F]">
                    03 — Connect: Create personalized outreach
                  </h4>
                  <p className="text-sm sm:text-base text-[#4A5E52] mt-0.5">
                    Messages are grounded in verified clues. You review, customize, and send directly from your inbox.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('pipeline')}
                  className="btn-tactile-coral px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shrink-0"
                >
                  <span>Open Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-[#FAF7F0] rounded-xl border-2 border-[#17271F] space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2D9C8] text-xs font-mono font-bold">
                  <span className="text-[#17271F]">
                    Subject: Your post on Kafka trace overhead & KiteMetrics' p99 latency
                  </span>
                  <span className="px-2 py-0.5 bg-[#9DE3D0] text-[#17271F] rounded border border-[#17271F]">
                    Human Verified
                  </span>
                </div>
                <p className="text-sm text-[#4A5E52] font-mono leading-relaxed">
                  "Hi Elena, Read your candid postmortem on KiteMetrics' Kafka buffer saturation during last month's enterprise ingest surge. Loved the transparency on where your team spent 36 hours diagnosing span drops..."
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          PIPELINE AT A GLANCE: 8 STAGE BOXES
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#17271F]">
              Your Outreach Pipeline
            </h2>
            <p className="text-sm text-[#4A5E52]">Click any stage to open your board</p>
          </div>
          <button
            onClick={() => onNavigateToTab('pipeline')}
            className="text-sm font-bold text-[#FF7054] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full Kanban Board</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'To search', count: stageCounts.to_research, bg: 'bg-white', border: 'border-[#17271F]' },
            { label: 'Ready to check', count: stageCounts.ready_to_review, bg: 'bg-[#FFEAE5]', border: 'border-[#FF7054]' },
            { label: 'Ready to send', count: stageCounts.approved, bg: 'bg-[#D8FF65]/40', border: 'border-[#17271F]' },
            { label: 'Reached out', count: stageCounts.contacted, bg: 'bg-[#9DE3D0]/40', border: 'border-[#17271F]' },
            { label: 'Got a reply', count: stageCounts.replied, bg: 'bg-white', border: 'border-[#17271F]/40' },
            { label: 'Meeting', count: stageCounts.meeting, bg: 'bg-white', border: 'border-[#17271F]/40' },
            { label: 'Won deal!', count: stageCounts.won, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/40' },
            { label: 'Not a fit', count: stageCounts.not_a_fit, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/40' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={shouldReduceMotion ? {} : { y: -2 }}
              onClick={() => onNavigateToTab('pipeline')}
              className={`p-3 rounded-2xl border-2 ${item.border} ${item.bg} text-center cursor-pointer shadow-[2px_2px_0px_#17271F] transition-all`}
            >
              <div className="text-2xl font-mono font-bold text-[#17271F]">{item.count}</div>
              <div className="text-xs font-bold text-[#17271F] truncate mt-1">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          PRIORITY MATCHES & RECENT SIGNALS
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Priority Leads (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#17271F]">
                Priority Matches ({shortlist.length})
              </h2>
              <p className="text-sm text-[#4A5E52]">Ranked by fit score and verified public clues</p>
            </div>
            <button
              onClick={() => onNavigateToTab('prospects')}
              className="text-sm font-bold text-[#FF7054] hover:underline cursor-pointer"
            >
              See all leads ({prospects.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {shortlist.length > 0 ? (
              shortlist.map(prospect => (
                <div
                  key={prospect.id}
                  onClick={() => onSelectProspect(prospect)}
                  className="card-tactile p-5 rounded-2xl cursor-pointer hover:border-[#17271F] group border-2 border-[#17271F] shadow-[3px_3px_0px_#17271F] transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Fit Score Badge */}
                      <div className="w-13 h-13 rounded-2xl bg-[#D8FF65] border-2 border-[#17271F] flex flex-col items-center justify-center font-mono font-bold text-[#17271F] shadow-[2px_2px_0px_#17271F] shrink-0">
                        <span className="text-lg leading-none">{prospect.fitScore}</span>
                        <span className="text-[9px] uppercase tracking-tight">FIT</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-editorial font-bold text-[#17271F] group-hover:text-[#FF7054] transition-colors">
                            {prospect.companyName}
                          </h3>
                          <span className="text-xs font-mono text-[#4A5E52] bg-[#FAF7F0] px-2 py-0.5 rounded border border-[#E2D9C8]">
                            {prospect.stage.split(' •')[0]}
                          </span>
                        </div>
                        <p className="text-sm text-[#4A5E52] line-clamp-1">
                          {prospect.summary}
                        </p>
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-[#17271F] font-semibold pt-1">
                          <span className="text-[#FF7054]">
                            👤 {prospect.targetBuyer.name} ({prospect.targetBuyer.title})
                          </span>
                          <span>•</span>
                          <span className="text-[#4A5E52]">
                            {prospect.observedFacts.length} verified facts
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-lg border ${
                        prospect.pipelineStage === 'approved' 
                          ? 'bg-[#9DE3D0] text-[#17271F] border-[#17271F]' 
                          : prospect.pipelineStage === 'ready_to_review'
                          ? 'bg-[#FFEAE5] text-[#FF7054] border-[#FF7054]'
                          : 'bg-[#FAF7F0] text-[#4A5E52] border-[#E2D9C8]'
                      }`}>
                        {prospect.pipelineStage === 'approved'
                          ? 'Ready to send'
                          : prospect.pipelineStage === 'ready_to_review'
                          ? 'Ready to check'
                          : prospect.pipelineStage.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-[#FF7054] font-bold group-hover:underline flex items-center gap-0.5">
                        Open dossier →
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border-2 border-dashed border-[#17271F]/40 rounded-2xl p-8 text-center space-y-3">
                <ScoutMascot expression="thinking" size="md" animate={true} />
                <h3 className="text-lg font-bold text-[#17271F]">No leads found yet</h3>
                <p className="text-sm text-[#4A5E52] max-w-sm mx-auto">
                  Click 'Find My Next Customer' to search the live web for matching prospects.
                </p>
                <button
                  onClick={onOpenDiscovery}
                  className="btn-tactile-coral px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Scouting Leads</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fresh Research Signals (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#17271F]">
                Fresh Web Clues
              </h2>
              <p className="text-sm text-[#4A5E52]">Recent signals detected from public web</p>
            </div>
            <span className="text-xs font-mono text-green-700 bg-[#9DE3D0]/40 px-2.5 py-1 rounded-full border border-green-700 font-bold">
              ● Live Citations
            </span>
          </div>

          <div className="space-y-3">
            {signals.slice(0, 3).map(sig => (
              <div key={sig.id} className="p-4 bg-white rounded-2xl border-2 border-[#17271F] shadow-[3px_3px_0px_#17271F] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-[#17271F]">{sig.companyName}</span>
                  <span className="text-xs text-[#4A5E52] font-mono">{sig.timestamp}</span>
                </div>
                <p className="font-semibold text-sm text-[#17271F]">{sig.title}</p>
                <p className="text-sm text-[#4A5E52] line-clamp-2">{sig.summary}</p>
                <div className="pt-2 flex items-center justify-between text-xs font-semibold border-t border-[#E2D9C8]">
                  <span className="text-[#FF7054]">{sig.impactBadge}</span>
                  <span className="text-[#17271F] font-mono">Confidence: {sig.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
