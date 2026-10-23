import React, { useState, useEffect } from 'react';
import { ScoutMascot, ScoutExpression } from './ScoutMascot';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles, 
  AlertCircle, 
  ExternalLink,
  Globe,
  Search,
  RefreshCw,
  Cpu,
  Layers,
  ChevronRight,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { Prospect } from '../types';
import { prospectService } from '../services/prospectService';

interface GuidedDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProspect: (prospect: Prospect) => void;
  prospects: Prospect[];
  onDiscoveryComplete?: () => void;
}

interface ResearchConfigState {
  configured: boolean;
  provider: string;
  llmProvider: string;
  searchProvider: string;
  connectionStatus: string;
  mode: string;
  model: string;
  geminiConfigured: boolean;
  tavilyConfigured: boolean;
}

interface ResearchResultState {
  runId?: string;
  status: 'completed' | 'empty' | 'error';
  mode: 'live' | 'demo';
  queriesExecuted: string[];
  totalSourcesFound: number;
  uniqueCandidatesConsidered?: number;
  candidatesAccepted?: number;
  candidatesRejected?: number;
  candidatesFound?: number;
  candidatesSaved: number;
  savedProspectIds: string[];
  rejections?: Array<{
    companyName: string;
    domain?: string;
    reason: string;
  }>;
  evidenceValidations?: Array<{
    sourceId: string;
    candidateName: string;
    claim: string;
    status: 'verified' | 'unsupported_demoted' | 'source_mismatch';
    reason: string;
  }>;
  prospects: Prospect[];
  sources: Array<{
    sourceId: string;
    url: string;
    title: string;
    snippet: string;
    provider: string;
    publishedDate?: string;
    retrievedAt: string;
  }>;
  stepOutcomes: Array<{
    step: string;
    status: 'success' | 'warning' | 'error' | 'skipped';
    summary: string;
    details?: string;
  }>;
  warnings: string[];
  error?: string;
}

export const GuidedDiscoveryModal: React.FC<GuidedDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onSelectProspect,
  prospects,
  onDiscoveryComplete,
}) => {
  // Discovery mode & config state
  const [config, setConfig] = useState<ResearchConfigState | null>(null);
  const [configLoading, setConfigLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'live' | 'demo'>('live');
  
  // Search inputs
  const [userInstructions, setUserInstructions] = useState<string>('');
  const [maxProspects, setMaxProspects] = useState<number>(3);

  // Execution states
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResultState | null>(null);

  // Demo walkthrough states (for deterministic simulation mode)
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const targetProspect = prospects.find(p => p.id === 'prospect-01') || prospects[0];

  const demoSteps = [
    {
      title: "1. Public Signal Detection",
      subtitle: "Monitoring engineering incident archives & leadership hiring",
      expression: "focused" as ScoutExpression,
      speech: "Scanning public engineering postmortems...",
      details: [
        "Observed: Kafka cluster ingestion lag noted in KiteMetrics postmortem (Sept 2026)",
        "Observed: Executive hire Elena Rostova (ex-Stripe) appointed VP Engineering",
        "Observed: 3 open roles for Senior Kubernetes & eBPF profiling engineers"
      ],
      badge: "3 Verified Signals"
    },
    {
      title: "2. Factual Grounding vs. Hypotheses",
      subtitle: "Explicitly separating observed evidence from AI assumptions",
      expression: "curious" as ScoutExpression,
      speech: "Separating verifiable facts from hypotheses!",
      details: [
        "✓ Grounded Fact: Public retrospective confirms Kafka buffer saturation under 20M spans/sec",
        "✓ Grounded Fact: Hiring 3 infrastructure specialists reporting directly to Elena Rostova",
        "⚡ AI Hypothesis: Cloud storage tier cost is threatening unit economics (Confidence: 85%)",
        "⚡ AI Hypothesis: Elena is under a 90-day board mandate to improve p99 MTTR"
      ],
      badge: "Zero Hallucinated Claims"
    },
    {
      title: "3. ICP Fit Scoring & Angle Synthesis",
      subtitle: "Evaluating relevance against startup ideal customer profile",
      expression: "thinking" as ScoutExpression,
      speech: "Scoring ICP compatibility at 96/100!",
      details: [
        "Headcount: 42 employees (Target ICP: 20-50) → Full match",
        "Tech Stack: Kubernetes + Distributed Tracing → Ideal problem fit",
        "Buyer Persona: VP Engineering Elena Rostova → Direct technical authority",
        "Recommended Angle: Peer-level technical benchmark on 4x trace compression"
      ],
      badge: "Fit Score: 96 / 100"
    },
    {
      title: "4. Human-in-the-Loop Outreach Draft",
      subtitle: "Reviewable cold email ready for human founder approval",
      expression: "celebratory" as ScoutExpression,
      speech: "Outreach draft ready for your review & approval!",
      details: [
        "Recipient: Elena Rostova (VP Engineering, KiteMetrics)",
        "Tone: Peer-to-peer technical exchange, zero marketing fluff",
        "Human Safeguard: First version NEVER auto-sends. Manual approval required."
      ],
      badge: "Requires Human Approval"
    }
  ];

  // Load backend research config on open
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setSearchError(null);
      setIsSearching(false);
      setDemoStep(0);
      setIsDemoRunning(false);
      return;
    }

    let isMounted = true;
    setConfigLoading(true);

    prospectService.getResearchConfig()
      .then(cfg => {
        if (!isMounted) return;
        setConfig(cfg);
        // Default to live if configured, otherwise demo
        if (cfg.configured) {
          setActiveTab('live');
        } else {
          setActiveTab('demo');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn('Failed to load research config:', err);
        setActiveTab('demo');
      })
      .finally(() => {
        if (isMounted) setConfigLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Demo walkthrough timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (activeTab === 'demo' && isDemoRunning && demoStep < demoSteps.length - 1) {
      timer = setTimeout(() => {
        setDemoStep(prev => prev + 1);
      }, 2200);
    }
    return () => clearTimeout(timer);
  }, [activeTab, demoStep, isDemoRunning, demoSteps.length]);

  if (!isOpen) return null;

  // Execute live research run
  const handleExecuteResearch = async (forcedMode?: 'live' | 'demo') => {
    const runMode = forcedMode || activeTab;
    setIsSearching(true);
    setSearchError(null);
    setResult(null);

    try {
      const res = await prospectService.runResearch({
        maxProspects,
        mode: runMode,
        userInstructions: userInstructions.trim() || undefined,
      });

      setResult(res as ResearchResultState);

      // Trigger workspace refresh so newly saved prospects appear immediately
      if (res.candidatesSaved > 0 && onDiscoveryComplete) {
        onDiscoveryComplete();
      }
    } catch (err: any) {
      const errorMsg = err.detail || err.message || 'Live research request failed.';
      setSearchError(errorMsg);
    } finally {
      setIsSearching(false);
    }
  };

  const currentDemo = demoSteps[demoStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17271F]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl shadow-[6px_6px_0px_#17271F] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#17271F] text-[#F7F2E8] shrink-0">
          <div className="flex items-center gap-3">
            <ScoutMascot 
              expression={
                isSearching 
                  ? "focused" 
                  : searchError 
                  ? "thinking" 
                  : result 
                  ? "celebratory" 
                  : activeTab === 'live' 
                  ? "curious" 
                  : currentDemo.expression
              } 
              size="sm" 
              animate={true} 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border font-mono ${
                  activeTab === 'live'
                    ? 'bg-[#17271F] text-[#9DE3D0] border-[#9DE3D0]/60'
                    : 'bg-[#17271F] text-[#D8FF65] border-[#D8FF65]/40'
                }`}>
                  {activeTab === 'live' ? 'LangGraph Live Web Research' : 'Deterministic Simulation'}
                </span>
                {config && (
                  <span className="text-[11px] text-[#F7F2E8]/70 font-mono">
                    {config.configured ? `${config.llmProvider || 'Google Gemini'} (${config.model})` : 'Offline Mode'}
                  </span>
                )}
              </div>
              <h2 id="modal-title" className="text-base font-editorial font-bold text-white tracking-tight">
                {activeTab === 'live' ? 'Live Public Prospect Discovery' : 'Scout Research Pipeline in Action'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#F7F2E8]/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tab Bar */}
        <div className="flex border-b border-[#17271F]/20 bg-[#F7F2E8] px-6 py-2 items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveTab('live');
                setResult(null);
                setSearchError(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'live'
                  ? 'bg-[#17271F] text-[#F7F2E8] shadow-[2px_2px_0px_#9DE3D0]'
                  : 'text-[#4A5E52] hover:text-[#17271F] hover:bg-white/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#9DE3D0]" />
              <span>Live Public Web Search</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('demo');
                setResult(null);
                setSearchError(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'demo'
                  ? 'bg-[#17271F] text-[#F7F2E8] shadow-[2px_2px_0px_#D8FF65]'
                  : 'text-[#4A5E52] hover:text-[#17271F] hover:bg-white/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#D8FF65]" />
              <span>Demo Walkthrough</span>
            </button>
          </div>

          <div className="text-[11px] font-mono font-semibold">
            {configLoading ? (
              <span className="text-[#4A5E52]">Checking providers...</span>
            ) : config?.configured ? (
              <span className="text-[#17271F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#9DE3D0]" />
                <span>Credentials Configured ({config.model})</span>
              </span>
            ) : (
              <span className="text-[#FF7054] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF7054]" />
                API Keys Missing in backend/.env
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: LIVE SEARCH INTERFACE */}
          {activeTab === 'live' && (
            <div className="space-y-5">
              {/* Provider Config Warning if not configured */}
              {!configLoading && !config?.configured && (
                <div className="p-3.5 rounded-xl bg-[#FFEAE5] border-1.5 border-[#FF7054] text-xs text-[#17271F] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#FF7054]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Provider Credentials Required for Live Research</span>
                  </div>
                  <p className="text-[11px] text-[#4A5E52] leading-relaxed">
                    Live prospect discovery requires <code className="bg-white px-1 py-0.5 rounded border border-[#FF7054]/30 font-mono">GEMINI_API_KEY</code> and <code className="bg-white px-1 py-0.5 rounded border border-[#FF7054]/30 font-mono">TAVILY_API_KEY</code> in <code className="bg-white px-1 py-0.5 rounded border border-[#FF7054]/30 font-mono">backend/.env</code>.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => handleExecuteResearch('demo')}
                      className="btn-tactile-secondary px-2.5 py-1 rounded text-[11px] font-bold"
                    >
                      Run in Offline Demo Mode Instead
                    </button>
                  </div>
                </div>
              )}

              {/* Input Form (Shown when not searching and no completed result) */}
              {!isSearching && !result && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#17271F] text-[#9DE3D0]">
                        Bounded LangGraph Workflow
                      </div>
                      <h3 className="text-xl font-editorial font-bold text-[#17271F] mt-1.5">
                        Discover Live Accounts for Your Startup
                      </h3>
                      <p className="text-xs text-[#4A5E52] mt-0.5 leading-relaxed">
                        Scout will plan focused queries against your saved ICP, query public web sources via Tavily, ground citations, apply deterministic rules-based scoring, and draft personalized outreach.
                      </p>
                    </div>

                    <ScoutMascot 
                      expression="curious" 
                      size="lg" 
                      speechText="Ready to scan the public web for your next customer!" 
                      animate={true} 
                    />
                  </div>

                  {/* Search Options Box */}
                  <div className="bg-white border-1.5 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F] space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#17271F] mb-1">
                        Optional Focus Keywords or Instructions
                      </label>
                      <input
                        type="text"
                        value={userInstructions}
                        onChange={(e) => setUserInstructions(e.target.value)}
                        placeholder="e.g. Distributed tracing, Kafka lag postmortems, eBPF profiling..."
                        className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-3 py-2 text-xs text-[#17271F] focus:outline-none focus:ring-1 focus:ring-[#17271F]"
                      />
                      <span className="text-[10px] text-[#4A5E52] mt-1 block">
                        Leave blank to automatically research against your saved Ideal Customer Profile.
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E2D9C8]">
                      <div>
                        <span className="text-xs font-bold text-[#17271F]">Prospect Budget: </span>
                        <span className="text-xs text-[#4A5E52]">Max candidates to discover</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[2, 3, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setMaxProspects(num)}
                            className={`px-3 py-1 rounded text-xs font-bold font-mono transition-all ${
                              maxProspects === num
                                ? 'bg-[#17271F] text-[#D8FF65] border border-[#17271F]'
                                : 'bg-[#FAF7F0] text-[#17271F] border border-[#17271F]/40 hover:bg-[#E2D9C8]'
                            }`}
                          >
                            {num} accounts
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Error Box if previous attempt failed */}
                  {searchError && (
                    <div className="p-3.5 rounded-xl bg-[#FFEAE5] border border-[#FF7054] text-xs text-[#17271F] flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-[#FF7054] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#FF7054]">Research Run Failed: </span>
                        <p className="mt-0.5 text-[11px] leading-relaxed">{searchError}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Honest Loading State (Running synchronous LangGraph) */}
              {isSearching && (
                <div className="py-8 px-4 text-center space-y-4 bg-white border-1.5 border-[#17271F] rounded-xl shadow-[3px_3px_0px_#17271F]">
                  <ScoutMascot expression="thinking" size="xl" animate={true} />
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17271F] text-[#9DE3D0] text-xs font-mono font-bold animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Executing LangGraph Pipeline</span>
                    </div>
                    <h3 className="text-lg font-editorial font-bold text-[#17271F]">
                      Searching Public Web & Grounding Facts...
                    </h3>
                    <p className="text-xs text-[#4A5E52] leading-relaxed">
                      Scout is querying real public-web sources via Tavily, validating cited URLs, running deterministic rules scoring, and drafting human-approved outreach.
                    </p>
                  </div>

                  {/* Honest steps indicators */}
                  <div className="max-w-sm mx-auto pt-2 space-y-1.5 text-left text-xs font-mono text-[#4A5E52]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#9DE3D0] animate-ping" />
                      <span>Planning focused search queries (Gemini)...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D8FF65]" />
                      <span>Executing bounded web retrieval (Tavily)...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF7054]" />
                      <span>Quarantining ungrounded claims into hypotheses...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed Results View */}
              {!isSearching && result && (
                <div className="space-y-4">
                  {/* Result Header Banner */}
                  <div className="p-4 rounded-xl bg-white border-1.5 border-[#17271F] shadow-[3px_3px_0px_#17271F] flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-[#9DE3D0] text-[#17271F] border border-[#17271F]">
                          {result.mode === 'live' ? 'Live Provider Results' : 'Offline Demo Results'}
                        </span>
                        <span className="text-xs font-semibold text-[#4A5E52] font-mono">
                          {result.totalSourcesFound} sources • {result.uniqueCandidatesConsidered ?? result.candidatesFound} evaluated • {result.candidatesSaved} saved • {result.candidatesRejected ?? 0} rejected
                        </span>
                      </div>
                      <h3 className="text-lg font-editorial font-bold text-[#17271F] mt-1.5">
                        {result.candidatesSaved > 0 
                          ? `Discovered ${result.candidatesSaved} Qualified Accounts`
                          : 'Research Complete — No Suitable Prospects Found'}
                      </h3>
                      <p className="text-xs text-[#4A5E52] mt-0.5">
                        Saved persistently to your workspace. All claims cited against genuine search records.
                      </p>
                    </div>

                    <ScoutMascot 
                      expression={result.candidatesSaved > 0 ? "celebratory" : "thinking"} 
                      size="md" 
                      animate={true} 
                    />
                  </div>

                  {/* Real Search Queries Executed */}
                  {result.queriesExecuted.length > 0 && (
                    <div className="bg-[#FAF7F0] border border-[#17271F]/30 rounded-lg p-3 text-xs space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#4A5E52] flex items-center gap-1.5">
                        <Search className="w-3 h-3 text-[#17271F]" />
                        <span>Actual Web Queries Executed</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {result.queriesExecuted.map((q, idx) => (
                          <span key={idx} className="font-mono text-[11px] bg-white border border-[#17271F]/20 px-2 py-0.5 rounded text-[#17271F]">
                            "{q}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Relevance Gate Audit Log if rejections occurred */}
                  {result.rejections && result.rejections.length > 0 && (
                    <div className="bg-[#FAF7F0] border border-[#17271F]/30 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#17271F] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 text-[#FF7054]">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Relevance Gate Rejections ({result.rejections.length})
                        </span>
                        <span className="text-[10px] font-mono text-[#4A5E52]">Unrelated & Duplicate Accounts Filtered</span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {result.rejections.map((rej, idx) => (
                          <div key={idx} className="bg-white p-2 rounded border border-[#17271F]/15 flex items-start justify-between gap-2 text-xs">
                            <div>
                              <span className="font-semibold text-[#17271F]">{rej.companyName}</span>
                              {rej.domain && <span className="text-[10px] text-[#4A5E52] font-mono ml-1.5">({rej.domain})</span>}
                            </div>
                            <span className="text-[11px] text-[#FF7054] font-medium bg-[#FFEAE5] px-1.5 py-0.5 rounded border border-[#FF7054]/30">
                              {rej.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence Validation & Grounding Log */}
                  {result.evidenceValidations && result.evidenceValidations.length > 0 && (
                    <div className="bg-white border border-[#17271F]/30 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#17271F] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 text-[#17271F]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#9DE3D0]" />
                          Evidence Validation Outcomes
                        </span>
                        <span className="text-[10px] font-mono text-[#4A5E52]">{result.evidenceValidations.length} Claims Checked</span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                        {result.evidenceValidations.map((ev, idx) => (
                          <div key={idx} className="bg-[#FAF7F0] p-2 rounded border border-[#17271F]/15 text-xs flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <span className="font-semibold text-[#17271F]">{ev.candidateName}: </span>
                              <span className="italic text-[#4A5E52]">"{ev.claim}"</span>
                            </div>
                            <span className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              ev.status === 'verified'
                                ? 'bg-[#9DE3D0] text-[#17271F] border-[#17271F]/40'
                                : 'bg-[#FFEAE5] text-[#FF7054] border-[#FF7054]/40'
                            }`}>
                              {ev.status === 'verified' ? '✓ Grounded' : '⚡ Demoted to Hypothesis'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Discovered Candidates List */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#17271F] flex items-center justify-between">
                      <span>Saved Prospect Intelligence Records</span>
                      <span className="text-[11px] text-[#4A5E52]">Deterministic ICP Scoring</span>
                    </div>

                    {result.prospects.length === 0 ? (
                      <div className="p-6 bg-white border border-[#17271F] rounded-xl text-center space-y-2">
                        <p className="text-xs text-[#4A5E52]">
                          No prospects met the threshold or exclusions during this research run.
                        </p>
                        <button
                          onClick={() => setResult(null)}
                          className="btn-tactile-secondary px-3 py-1.5 rounded text-xs font-bold"
                        >
                          Adjust Instructions & Try Again
                        </button>
                      </div>
                    ) : (
                      result.prospects.map((candidate) => (
                        <div 
                          key={candidate.id}
                          className="bg-white border-1.5 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F] space-y-2.5 hover:border-[#FF7054] transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg border border-[#17271F] bg-[#D8FF65] flex flex-col items-center justify-center font-bold font-mono">
                                <span className="text-sm leading-none">{candidate.fitScore}</span>
                                <span className="text-[7px] uppercase">SCORE</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-editorial font-bold text-[#17271F]">
                                    {candidate.companyName}
                                  </h4>
                                  <span className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] text-[9px]">
                                    {candidate.fitLevel}
                                  </span>
                                  <span className="sticker-badge bg-[#9DE3D0] text-[#17271F] border-[#17271F] text-[9px] font-mono">
                                    🌐 Live Web
                                  </span>
                                </div>
                                <div className="text-xs text-[#4A5E52]">
                                  {candidate.industry} • {candidate.headquarters || 'Location not specified'}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                onClose();
                                onSelectProspect(candidate);
                              }}
                              className="btn-tactile-coral px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                            >
                              <span>Inspect Dossier</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Verified Facts & Sources */}
                          {candidate.observedFacts && candidate.observedFacts.length > 0 && (
                            <div className="pt-2 border-t border-[#E2D9C8] space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[#4A5E52]">
                                Observed Public Fact & Source Citation
                              </div>
                              <div className="text-xs text-[#17271F] flex items-start gap-2 bg-[#FAF7F0] p-2 rounded border border-[#17271F]/15">
                                <span className="shrink-0 text-xs text-[#17271F] font-bold">✓</span>
                                <div className="flex-1">
                                  <span>{candidate.observedFacts[0].fact}</span>
                                  {candidate.observedFacts[0].sourceUrl && (
                                    <a 
                                      href={candidate.observedFacts[0].sourceUrl} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="mt-1 text-[11px] text-[#FF7054] hover:underline flex items-center gap-1 font-mono break-all"
                                    >
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                      <span>{candidate.observedFacts[0].sourceUrl}</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Completed LangGraph Step Audit */}
                  <div className="bg-[#FAF7F0] border border-[#17271F]/20 rounded-xl p-3 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#4A5E52] flex items-center justify-between">
                      <span>LangGraph Execution Audit</span>
                      <span className="font-mono text-[#17271F]">{result.stepOutcomes.length} Nodes</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                      {result.stepOutcomes.map((outcome, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-[#17271F]/15">
                          <CheckCircle2 className="w-3 h-3 text-[#17271F] shrink-0" />
                          <span className="truncate">{outcome.summary}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DETERMINISTIC DEMO WALKTHROUGH */}
          {activeTab === 'demo' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#17271F] text-[#D8FF65]">
                    {currentDemo.badge}
                  </div>
                  <h3 className="text-xl font-editorial font-bold text-[#17271F] mt-2">
                    {currentDemo.title}
                  </h3>
                  <p className="text-xs text-[#4A5E52] mt-0.5">
                    {currentDemo.subtitle}
                  </p>
                </div>

                <ScoutMascot 
                  expression={currentDemo.expression} 
                  size="lg" 
                  speechText={currentDemo.speech} 
                  animate={true} 
                />
              </div>

              {/* Progress Steps Header */}
              <div className="grid grid-cols-4 border border-[#17271F]/20 rounded-xl overflow-hidden bg-[#F7F2E8]">
                {demoSteps.map((s, idx) => {
                  const isCompleted = idx < demoStep;
                  const isCurrent = idx === demoStep;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setDemoStep(idx);
                        setIsDemoRunning(false);
                      }}
                      className={`py-2 px-3 text-left border-r border-[#17271F]/15 last:border-r-0 transition-all ${
                        isCurrent 
                          ? 'bg-[#D8FF65]/40 border-b-2 border-b-[#17271F] font-semibold' 
                          : isCompleted 
                          ? 'bg-[#9DE3D0]/20 text-[#17271F]' 
                          : 'text-[#17271F]/50 opacity-60'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold tracking-wider">Step 0{idx + 1}</div>
                      <div className="text-xs truncate font-medium">{s.title.split('. ')[1]}</div>
                    </button>
                  );
                })}
              </div>

              {/* Details breakdown */}
              <div className="bg-white border-1.5 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F] space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4A5E52] flex items-center justify-between border-b border-[#E2D9C8] pb-1.5">
                  <span>Simulated Pipeline Output</span>
                  <span className="font-mono text-[11px] text-[#FF7054] font-semibold">TARGET: KiteMetrics</span>
                </div>
                
                <div className="space-y-2 pt-1">
                  {currentDemo.details.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#17271F]">
                      <div className="mt-0.5 shrink-0">
                        {item.startsWith('✓') ? (
                          <span className="inline-block w-4 h-4 text-center leading-4 rounded bg-[#9DE3D0] text-[#17271F] font-bold text-[10px]">✓</span>
                        ) : item.startsWith('⚡') ? (
                          <span className="inline-block w-4 h-4 text-center leading-4 rounded bg-[#D8FF65] text-[#17271F] font-bold text-[10px]">⚡</span>
                        ) : (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#17271F] mt-1.5" />
                        )}
                      </div>
                      <span className={item.startsWith('⚡') ? 'italic font-medium text-[#17271F]' : ''}>
                        {item.replace(/^[✓⚡]\s*/, '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Explicit Human In Control Guarantee */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FFEAE5] border border-[#FF7054]/40 text-xs text-[#17271F]">
            <ShieldCheck className="w-4 h-4 text-[#FF7054] shrink-0" />
            <div>
              <span className="font-bold">Human-in-the-Loop Safeguard: </span>
              ScoutSpark generates evidence-backed suggestions and reviewable outreach drafts, but never triggers outbound emails automatically.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F7F2E8] border-t border-[#17271F]/15 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#4A5E52]">
            <span className={`inline-block w-2 h-2 rounded-full ${activeTab === 'live' ? 'bg-[#9DE3D0]' : 'bg-[#D8FF65]'} animate-pulse`} />
            <span>
              {activeTab === 'live' 
                ? `${config?.llmProvider || 'Google Gemini'} (${config?.model || 'Configured'}) + ${config?.searchProvider || 'Tavily Search API'}` 
                : 'Deterministic Local Simulation'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'live' ? (
              result ? (
                <>
                  <button
                    onClick={() => {
                      setResult(null);
                      setSearchError(null);
                    }}
                    className="btn-tactile-secondary px-3.5 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    New Search
                  </button>
                  <button
                    onClick={onClose}
                    className="btn-tactile-coral px-4 py-2 rounded-lg text-xs font-bold"
                  >
                    Done & View Accounts
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleExecuteResearch()}
                  disabled={isSearching}
                  className="btn-tactile-coral px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Researching Web...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Find My Next Customers</span>
                    </>
                  )}
                </button>
              )
            ) : (
              /* Demo Walkthrough Buttons */
              demoStep < demoSteps.length - 1 ? (
                <button
                  onClick={() => {
                    setDemoStep(prev => prev + 1);
                    setIsDemoRunning(false);
                  }}
                  className="btn-tactile-secondary px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onSelectProspect(targetProspect);
                  }}
                  className="btn-tactile-coral px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Open Elena's Reviewable Record
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
