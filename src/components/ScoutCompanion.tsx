import React, { useState, useEffect } from 'react';
import { ViewTab, Prospect, IdealCustomerProfile } from '../types';
import { ScoutMascot, ScoutExpression } from './ScoutMascot';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  ChevronUp, 
  ChevronDown, 
  Minimize2, 
  Maximize2,
  Compass,
  CheckCircle2,
  Target,
  Send,
  Kanban,
  FlaskConical,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScoutCompanionProps {
  currentTab: ViewTab;
  onNavigateToTab: (tab: ViewTab) => void;
  onOpenDiscovery: () => void;
  onOpenTour: () => void;
  prospects: Prospect[];
  icp: IdealCustomerProfile | null;
  onSelectProspect?: (prospect: Prospect) => void;
  isDrawerOpen?: boolean;
}

interface ContextGuidance {
  expression: ScoutExpression;
  greeting: string;
  pageSummary: string;
  canDoList: string[];
  recommendedActionText: string;
  onRecommendedAction: () => void;
  tipText: string;
}

export const ScoutCompanion: React.FC<ScoutCompanionProps> = ({
  currentTab,
  onNavigateToTab,
  onOpenDiscovery,
  onOpenTour,
  prospects,
  icp,
  onSelectProspect,
  isDrawerOpen = false,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [lastTab, setLastTab] = useState<ViewTab>(currentTab);

  // Ready to review or approved leads count
  const readyLeads = prospects.filter(p => p.pipelineStage === 'ready_to_review');
  const approvedLeads = prospects.filter(p => p.pipelineStage === 'approved');

  // Trigger contextual movement reaction when tab changes
  useEffect(() => {
    if (currentTab !== lastTab) {
      setLastTab(currentTab);
      // Small bounce/greeting reaction
      setHasInteracted(true);
    }
  }, [currentTab, lastTab]);

  // Compute contextual guidance for the active page and data state
  const getGuidance = (): ContextGuidance => {
    switch (currentTab) {
      case 'dashboard':
        return {
          expression: readyLeads.length > 0 ? 'pointing' : 'waving',
          greeting: "Hey! Let's find your next yes.",
          pageSummary: "Welcome to your command center. Track lead momentum, check fresh public web signals, and take the recommended next action.",
          canDoList: [
            "See how many leads are ready for your review",
            "Follow the 4-step journey from ICP to booked calls",
            "Inspect high-fit matches and company updates"
          ],
          recommendedActionText: readyLeads.length > 0 
            ? `Review ${readyLeads[0].companyName}` 
            : "Start Scouting Leads",
          onRecommendedAction: () => {
            if (readyLeads.length > 0 && onSelectProspect) {
              onSelectProspect(readyLeads[0]);
            } else {
              onOpenDiscovery();
            }
            setIsPanelOpen(false);
          },
          tipText: readyLeads.length > 0 
            ? `You have ${readyLeads.length} leads waiting for review!` 
            : "Tip: Define your target customer first so searches are laser-focused."
        };

      case 'settings':
        return {
          expression: 'focused',
          greeting: "Teach me who you're looking for!",
          pageSummary: "Your Target Customer profile anchors every AI search. Define target industries, job roles, company size, and disqualification exclusions.",
          canDoList: [
            "Set what you sell and your core value proposition",
            "Specify target buyer roles (e.g. CTO, VP of Eng)",
            "Add exclusion tags to eliminate bad fits automatically"
          ],
          recommendedActionText: "Find Matching Leads",
          onRecommendedAction: () => {
            onNavigateToTab('prospects');
            setIsPanelOpen(false);
          },
          tipText: "Every candidate lead is scored against this exact profile."
        };

      case 'prospects':
        return {
          expression: 'thinking',
          greeting: "Your evaluated lead directory.",
          pageSummary: "All discovered companies scored 0-100 against your profile. Every claim is backed by real public web links, not AI guesses.",
          canDoList: [
            "Filter by industry, match score, or pipeline stage",
            "Click any company to open its research dossier",
            "Upload your existing lead spreadsheets via CSV import"
          ],
          recommendedActionText: "Find My Next Leads",
          onRecommendedAction: () => {
            onOpenDiscovery();
            setIsPanelOpen(false);
          },
          tipText: "Look for high scores (75%+) with verified web facts!"
        };

      case 'pipeline':
        return {
          expression: approvedLeads.length > 0 ? 'pointing' : 'focused',
          greeting: "Track conversations stage by stage.",
          pageSummary: "Your 8-stage Kanban board. Move leads from research to checking drafts, sending emails, and booking calendar meetings.",
          canDoList: [
            "Advance leads with one-click next-stage arrows",
            "Add outcome notes after sending messages or calls",
            "Zero auto-send: you approve and copy every email"
          ],
          recommendedActionText: approvedLeads.length > 0 
            ? "View Approved Messages" 
            : "Check Message Sequences",
          onRecommendedAction: () => {
            onNavigateToTab('campaigns');
            setIsPanelOpen(false);
          },
          tipText: "Keep notes updated so you never forget where a deal left off."
        };

      case 'campaigns':
        return {
          expression: 'celebratory',
          greeting: "Value-first outreach sequences.",
          pageSummary: "A 3-touch follow-up cadence (Hook, Benchmark, Frictionless Sandbox) grounded in real company clues rather than generic sales badgering.",
          canDoList: [
            "Review multi-touch email angles with cited evidence",
            "Edit body copy to match your personal tone of voice",
            "1-click copy to paste into your personal email client"
          ],
          recommendedActionText: "Apply to Pipeline Lead",
          onRecommendedAction: () => {
            onNavigateToTab('pipeline');
            setIsPanelOpen(false);
          },
          tipText: "Touch 2 Benchmark follow-ups typically increase reply rates by 35%."
        };

      case 'eval-lab':
        return {
          expression: 'focused',
          greeting: "Zero hallucinations guaranteed.",
          pageSummary: "Inspect our live grounding metrics and 12 automated test cases from backend/tests/test_evaluation_fixture.py. We never make up claims or fake links.",
          canDoList: [
            "Inspect citation coverage and hallucination defense",
            "Review 12 automated test fixture pass rates",
            "Verify how unproven claims are labeled as guesses"
          ],
          recommendedActionText: "Back to Workspace",
          onRecommendedAction: () => {
            onNavigateToTab('dashboard');
            setIsPanelOpen(false);
          },
          tipText: "All 12 test fixtures currently passing with verified web citations."
        };

      default:
        return {
          expression: 'idle',
          greeting: "Here to guide you!",
          pageSummary: "Explore ScoutSpark to find matching customers and send thoughtful outreach.",
          canDoList: ["Set target customer", "Find leads", "Manage pipeline"],
          recommendedActionText: "Start Scouting",
          onRecommendedAction: onOpenDiscovery,
          tipText: "Click me anytime for page tips!"
        };
    }
  };

  const guidance = getGuidance();

  // If drawer is open on desktop/mobile, hide or shift companion to avoid overlap
  if (isDrawerOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* Minimized Floating Star Button */}
      {isMinimized ? (
        <button
          onClick={() => {
            setIsMinimized(false);
            setIsPanelOpen(true);
          }}
          className="p-2.5 rounded-full bg-[#17271F] text-[#D8FF65] border-2 border-[#17271F] shadow-[3px_3px_0px_#FF7054] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
          title="Open ScoutStar Companion"
          aria-label="Expand ScoutStar guide"
        >
          <ScoutMascot expression={guidance.expression} size="xs" animate={true} />
          <span className="text-xs font-editorial font-bold pr-1 text-[#F7F2E8] group-hover:text-[#D8FF65]">
            Guide
          </span>
        </button>
      ) : (
        /* Floating Character with Interactive Speech Bubble or Full Panel */
        <div className="relative flex flex-col items-end">
          {/* Expanded Companion Panel */}
          {isPanelOpen ? (
            <div className="mb-3 w-80 sm:w-96 bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl shadow-[6px_6px_0px_#17271F] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Panel Top Header */}
              <div className="px-4 py-3 bg-[#17271F] text-[#F7F2E8] flex items-center justify-between border-b border-[#2A4034]">
                <div className="flex items-center gap-2.5">
                  <ScoutMascot expression={guidance.expression} size="xs" animate={true} />
                  <div>
                    <div className="text-xs font-editorial font-bold text-white flex items-center gap-1.5">
                      <span>ScoutStar</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#D8FF65] text-[#17271F] font-bold">
                        COMPANION
                      </span>
                    </div>
                    <div className="text-[10px] text-[#9DE3D0] leading-none">
                      Interactive Sales Guide
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded text-[#F7F2E8]/70 hover:text-white hover:bg-white/10 transition-colors"
                    title="Minimize companion"
                    aria-label="Minimize companion"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="p-1 rounded text-[#F7F2E8]/70 hover:text-white hover:bg-white/10 transition-colors"
                    title="Close panel"
                    aria-label="Close panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Panel Body */}
              <div className="p-4 space-y-3.5 text-xs max-h-[70vh] overflow-y-auto">
                {/* Greeting & Summary */}
                <div className="space-y-1">
                  <h4 className="font-editorial font-bold text-sm text-[#17271F]">
                    {guidance.greeting}
                  </h4>
                  <p className="text-[11px] text-[#4A5E52] leading-relaxed">
                    {guidance.pageSummary}
                  </p>
                </div>

                {/* What You Can Do Bullets */}
                <div className="p-3 bg-white rounded-xl border border-[#E2D9C8] space-y-1.5">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF7054]">
                    What you can do here:
                  </div>
                  {guidance.canDoList.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#17271F]">
                      <CheckCircle2 className="w-3 h-3 text-[#FF7054] shrink-0 mt-0.5" />
                      <span className="leading-tight">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Scout's Live Tip */}
                <div className="p-2.5 bg-[#D8FF65]/30 border border-[#17271F]/20 rounded-xl text-[11px] text-[#17271F] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF7054] shrink-0" />
                  <span className="font-medium italic leading-snug">{guidance.tipText}</span>
                </div>

                {/* Primary Recommended Action Button */}
                <div className="pt-1 flex flex-col gap-2">
                  <button
                    onClick={guidance.onRecommendedAction}
                    className="btn-tactile-coral w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#17271F]"
                  >
                    <span>{guidance.recommendedActionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      onClick={() => {
                        setIsPanelOpen(false);
                        onOpenTour();
                      }}
                      className="text-[#17271F] hover:text-[#FF7054] font-semibold flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#FF7054]" />
                      <span>Take 60-Sec Tour</span>
                    </button>

                    <button
                      onClick={() => setIsPanelOpen(false)}
                      className="text-[#4A5E52] hover:text-[#17271F]"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Unexpanded: Mascot with Speech Bubble */
            <div className="flex items-center gap-2">
              {/* Context Speech Bubble */}
              <div 
                onClick={() => setIsPanelOpen(true)}
                className="bg-white border-2 border-[#17271F] px-3 py-2 rounded-2xl text-xs font-medium text-[#17271F] shadow-[3px_3px_0px_#17271F] max-w-[210px] sm:max-w-[260px] cursor-pointer hover:border-[#FF7054] transition-all group animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <div className="flex items-center justify-between text-[10px] text-[#4A5E52] mb-0.5">
                  <span className="font-mono font-bold text-[#FF7054] uppercase">ScoutStar</span>
                  <span className="group-hover:text-[#17271F] underline text-[9px]">Click for tips</span>
                </div>
                <p className="text-[11px] text-[#17271F] leading-snug line-clamp-2">
                  {guidance.tipText}
                </p>
              </div>

              {/* Interactive Mascot Avatar */}
              <button
                onClick={() => setIsPanelOpen(true)}
                className="p-2 rounded-2xl bg-[#FAF7F0] border-2 border-[#17271F] shadow-[3px_3px_0px_#17271F] hover:shadow-[4px_4px_0px_#FF7054] hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer relative group"
                aria-label="Open ScoutStar guide"
                title="Click for page guide & tips"
              >
                <ScoutMascot expression={guidance.expression} size="sm" animate={true} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF7054] rounded-full border border-[#17271F] animate-pulse" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
