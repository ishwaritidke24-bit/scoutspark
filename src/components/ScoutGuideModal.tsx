import React, { useState, useEffect } from 'react';
import { ScoutMascot, ScoutExpression } from './ScoutMascot';
import { ViewTab } from '../types';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Target, 
  Users, 
  Kanban, 
  Send, 
  FlaskConical, 
  Compass, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  MapPin,
  Check,
  RotateCcw
} from 'lucide-react';

interface ScoutGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: ViewTab) => void;
  onOpenDiscovery: () => void;
  initialStep?: number;
}

interface TourStep {
  title: string;
  badge: string;
  expression: ScoutExpression;
  tagline: string;
  description: string;
  whatItDoes: string;
  whenToUse: string;
  nextActionLabel: string;
  targetTab?: ViewTab;
  isDiscoveryAction?: boolean;
  highlights: string[];
}

export const ScoutGuideModal: React.FC<ScoutGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenDiscovery,
  initialStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [activeView, setActiveView] = useState<'tour' | 'workflow'>('tour');
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
      const savedPref = localStorage.getItem('scoutspark_hide_auto_tour') === 'true';
      setDontShowAgain(savedPref);
    }
  }, [isOpen, initialStep]);

  const steps: TourStep[] = [
    {
      title: "Welcome to ScoutSpark",
      badge: "START HERE",
      expression: "celebratory",
      tagline: "Find your next yes — without cold email spam.",
      description: "ScoutSpark helps startup founders and teams find real businesses that genuinely need your product, gathers verified public evidence, and prepares personalized outreach for you to review.",
      whatItDoes: "Searches the public web, filters companies against your target criteria, separates real facts from educated guesses, and prepares personalized messages.",
      whenToUse: "Whenever you are ready to find high-fit customer leads and conduct thoughtful outreach.",
      nextActionLabel: "Start with Target Customer",
      targetTab: "settings",
      highlights: [
        "100% human control: zero automated message sending",
        "Public web sources cited for every observed claim",
        "Clear separation of facts, hypotheses, and missing info"
      ]
    },
    {
      title: "1. Target Customer (ICP)",
      badge: "INTELLIGENCE",
      expression: "focused",
      tagline: "Tell ScoutStar who you want to reach.",
      description: "Before searching for leads, define what your product does, who needs it most, and who to avoid. ScoutStar uses this profile to score every lead.",
      whatItDoes: "Defines target industries, job roles, company size, geography, and dealbreaker exclusions.",
      whenToUse: "Set this up first! Also update it whenever you pivot your product or enter a new market.",
      nextActionLabel: "Jump to Target Customer",
      targetTab: "settings",
      highlights: [
        "Customize target roles (e.g. CTO, VP of Engineering)",
        "Set exclusions to eliminate irrelevant businesses automatically",
        "Grounds AI scoring against your exact value proposition"
      ]
    },
    {
      title: "2. Find My Next… (Discovery)",
      badge: "NEXT ACTION",
      expression: "curious",
      tagline: "Discover high-intent leads using AI web search.",
      description: "Click 'Find My Next…' at any time to run ScoutStar's research engine. You can search live across the public web or explore sample startup leads.",
      whatItDoes: "Executes targeted web queries, extracts companies with hiring or tech migration signals, and verifies claims against live sources.",
      whenToUse: "Whenever you need fresh leads or want to investigate companies in a specific sector.",
      nextActionLabel: "Open Discovery Modal",
      isDiscoveryAction: true,
      highlights: [
        "Live web search with Gemini + Tavily or offline practice mode",
        "Automatic relevance filters reject non-matching businesses",
        "Adds qualified prospects directly into your leads list"
      ]
    },
    {
      title: "3. Find Leads",
      badge: "WORKSPACE",
      expression: "thinking",
      tagline: "Inspect evidence, scores, and email drafts.",
      description: "Browse all discovered companies in one clean directory. Filter by industry, fit score, or stage, and click any lead to view full research dossiers.",
      whatItDoes: "Displays fit scores (0-100), source-backed facts, AI hypotheses, target buyer profiles, and personalized outreach drafts.",
      whenToUse: "To evaluate discovered companies, inspect evidence links, or upload your own CSV list.",
      nextActionLabel: "Go to Find Leads",
      targetTab: "prospects",
      highlights: [
        "Inspect verified facts with source citations",
        "Review target buyers and personalized email angles",
        "Import your existing lead lists via CSV with one click"
      ]
    },
    {
      title: "4. Your Outreach Pipeline",
      badge: "WORKSPACE",
      expression: "focused",
      tagline: "Track leads through your outreach journey.",
      description: "A tactile Kanban board that organizes leads by stage: from research to checking drafts, sending messages, and booking sales meetings.",
      whatItDoes: "Visualizes lead progress: To search → Ready to check → Ready to send → Reached out → Got a reply → Meeting booked → Won.",
      whenToUse: "Daily! Track which messages are ready for your review and log replies from interested prospects.",
      nextActionLabel: "View Pipeline Board",
      targetTab: "pipeline",
      highlights: [
        "Advance leads with simple 'Next stage' buttons",
        "Add quick notes on conversations and follow-up dates",
        "Zero auto-send: you approve and copy each email yourself"
      ]
    },
    {
      title: "5. Message Sequences & Accuracy Lab",
      badge: "OUTREACH & QUALITY",
      expression: "celebratory",
      tagline: "Proven multi-touch outreach & verified accuracy.",
      description: "Use Message Sequences for multi-touch follow-up templates, and visit the Accuracy Lab to see the 12 automated test cases ensuring zero AI hallucinations.",
      whatItDoes: "Message Sequences provides 3-touch follow-up copy. Accuracy Lab displays live hallucination defense metrics and test suite results.",
      whenToUse: "When crafting multi-touch email sequences or verifying how ScoutSpark ensures facts are strictly source-backed.",
      nextActionLabel: "Explore Accuracy Lab",
      targetTab: "eval-lab",
      highlights: [
        "Value-first follow-up sequences (Day 1 hook, Day 4 benchmark, Day 9 sandbox)",
        "12 deterministic test fixtures verifying zero hallucinated facts",
        "Strict provenance checks matching public web citations"
      ]
    }
  ];

  const handleFinish = () => {
    localStorage.setItem('scoutspark_onboarding_completed', 'true');
    if (dontShowAgain) {
      localStorage.setItem('scoutspark_hide_auto_tour', 'true');
    } else {
      localStorage.removeItem('scoutspark_hide_auto_tour');
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepAction = (step: TourStep) => {
    handleFinish();
    if (step.isDiscoveryAction) {
      onOpenDiscovery();
    } else if (step.targetTab) {
      onNavigateToTab(step.targetTab);
    }
  };

  if (!isOpen) return null;

  const current = steps[currentStep];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17271F]/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl shadow-[6px_6px_0px_#17271F] flex flex-col overflow-hidden max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#17271F] text-[#F7F2E8] shrink-0 border-b border-[#2A4034]">
          <div className="flex items-center gap-3">
            <ScoutMascot expression={current.expression} size="sm" animate={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#D8FF65] text-[#17271F] font-bold">
                  SCOUTSTAR GUIDE
                </span>
                <span className="text-xs text-[#9DE3D0] font-mono hidden sm:inline">
                  Interactive Product Walkthrough
                </span>
              </div>
              <h2 id="guide-title" className="text-base font-editorial font-bold text-white tracking-tight">
                {activeView === 'tour' ? `Step ${currentStep + 1} of ${steps.length}: ${current.title}` : 'How ScoutSpark Works (Workflow Map)'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-[#2A4034] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveView('tour')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  activeView === 'tour' ? 'bg-[#FAF7F0] text-[#17271F] font-bold' : 'text-[#F7F2E8]/80 hover:text-white'
                }`}
              >
                Tour
              </button>
              <button
                onClick={() => setActiveView('workflow')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  activeView === 'workflow' ? 'bg-[#FAF7F0] text-[#17271F] font-bold' : 'text-[#F7F2E8]/80 hover:text-white'
                }`}
              >
                Workflow Map
              </button>
            </div>

            <button
              onClick={handleFinish}
              className="p-1.5 rounded-lg text-[#F7F2E8]/70 hover:text-white hover:bg-white/10 transition-colors ml-1"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeView === 'tour' ? (
            <>
              {/* Step Hero Card */}
              <div className="bg-white border-1.5 border-[#17271F] rounded-xl p-5 shadow-[2px_2px_0px_#17271F] flex flex-col sm:flex-row items-start gap-4">
                <div className="shrink-0 flex sm:flex-col items-center gap-2">
                  <ScoutMascot expression={current.expression} size="lg" animate={true} />
                  <span className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] text-[9px]">
                    {current.badge}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-editorial font-bold text-[#17271F]">
                    {current.tagline}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A5E52] leading-relaxed">
                    {current.description}
                  </p>
                </div>
              </div>

              {/* Two Column Quick Reference: What it does & When to use */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-white rounded-xl border border-[#E2D9C8] space-y-1">
                  <div className="text-[11px] font-mono font-bold text-[#FF7054] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> What this section does
                  </div>
                  <p className="text-xs text-[#17271F] leading-snug">
                    {current.whatItDoes}
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[#E2D9C8] space-y-1">
                  <div className="text-[11px] font-mono font-bold text-[#17271F] uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> When you should use it
                  </div>
                  <p className="text-xs text-[#17271F] leading-snug">
                    {current.whenToUse}
                  </p>
                </div>
              </div>

              {/* Key Features Bullet List */}
              <div className="bg-[#FAF7F0] border border-[#17271F]/20 rounded-xl p-3.5">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4A5E52] mb-2">
                  Key highlights for founders:
                </div>
                <div className="space-y-1.5">
                  {current.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#17271F]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7054] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contextual Jump Button */}
              {(current.targetTab || current.isDiscoveryAction) && (
                <div className="flex items-center justify-between p-3 bg-[#D8FF65]/30 border border-[#17271F] rounded-xl text-xs">
                  <span className="font-semibold text-[#17271F]">
                    Want to try this right now?
                  </span>
                  <button
                    onClick={() => handleStepAction(current)}
                    className="btn-tactile-coral px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>{current.nextActionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Workflow Map View */
            <div className="space-y-5">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-editorial font-bold text-[#17271F]">
                  The ScoutSpark 4-Step Customer Workflow
                </h3>
                <p className="text-xs text-[#4A5E52]">
                  How all sections fit together into a reliable, human-in-the-loop sales process.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: 1,
                    tab: 'settings' as ViewTab,
                    name: 'Target Customer',
                    desc: 'Define who you are searching for: target industry, company size, and role titles.',
                    tip: 'ScoutStar matches all future web searches against this profile.'
                  },
                  {
                    step: 2,
                    tab: 'prospects' as ViewTab,
                    name: 'Find Leads & Discovery',
                    desc: 'Run AI search via "Find My Next…" or import a CSV to discover candidate companies.',
                    tip: 'Only companies with verified public web findings and high fit scores are kept.'
                  },
                  {
                    step: 3,
                    tab: 'pipeline' as ViewTab,
                    name: 'Review Pipeline',
                    desc: 'Open each company dossier. Read verified facts, check the personalized email draft, and approve it.',
                    tip: 'Moves leads from "Ready to check" to "Ready to send".'
                  },
                  {
                    step: 4,
                    tab: 'campaigns' as ViewTab,
                    name: 'Outreach & Sequences',
                    desc: 'Copy evidence-backed email hooks, send from your own inbox, and log replies and meetings.',
                    tip: 'Zero automated sending. You are in total control of every message.'
                  }
                ].map((item) => (
                  <div 
                    key={item.step} 
                    className="p-4 bg-white border-1.5 border-[#17271F] rounded-xl shadow-[2px_2px_0px_#17271F] flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#17271F] text-[#D8FF65] font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {item.step}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#17271F]">{item.name}</h4>
                          <span className="text-[10px] text-[#FF7054] font-semibold bg-[#FFEAE5] px-1.5 py-0.2 rounded border border-[#FF7054]">
                            Step {item.step}
                          </span>
                        </div>
                        <p className="text-xs text-[#4A5E52]">{item.desc}</p>
                        <p className="text-[11px] text-[#17271F] font-mono italic">💡 {item.tip}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleFinish();
                        onNavigateToTab(item.tab);
                      }}
                      className="btn-tactile-secondary px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1"
                    >
                      Go <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-3.5 bg-white border-t border-[#17271F] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-[#4A5E52] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-[#17271F] text-[#FF7054] focus:ring-0 w-3.5 h-3.5"
              />
              <span>Don't show automatically on startup</span>
            </label>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeView === 'tour' && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                {/* Dots indicator */}
                <div className="flex items-center gap-1 px-2">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentStep ? 'w-5 bg-[#FF7054]' : 'bg-[#E2D9C8] hover:bg-[#17271F]'
                      }`}
                      aria-label={`Go to step ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="btn-tactile-coral px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{currentStep === steps.length - 1 ? 'Finish Tour' : 'Next'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {activeView === 'workflow' && (
              <button
                onClick={handleFinish}
                className="btn-tactile-coral px-4 py-1.5 rounded-lg text-xs font-bold"
              >
                Close & Return to App
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
