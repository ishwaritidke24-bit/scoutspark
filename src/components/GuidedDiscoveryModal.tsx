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
  Layers,
  ChevronRight,
  Sliders,
  Building2,
  Plus,
  RotateCcw,
  Check,
  Kanban,
  Users
} from 'lucide-react';
import { Prospect, PipelineStage, IdealCustomerProfile, ViewTab } from '../types';
import { prospectService } from '../services/prospectService';
import confetti from 'canvas-confetti';

interface GuidedDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProspect: (prospect: Prospect) => void;
  prospects: Prospect[];
  onDiscoveryComplete?: () => void;
  icp?: IdealCustomerProfile | null;
  onSaveICP?: (updated: IdealCustomerProfile) => Promise<void> | void;
  onNavigateToTab?: (tab: ViewTab) => void;
  onUpdateStage?: (id: string, stage: PipelineStage) => void;
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
  icp,
  onSaveICP,
  onNavigateToTab,
  onUpdateStage,
}) => {
  // Config & Mode States
  const [config, setConfig] = useState<ResearchConfigState | null>(null);
  const [configLoading, setConfigLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'live' | 'demo'>('live');

  // Customer Discovery Inputs (Part B Core)
  const [customerDescription, setCustomerDescription] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [companySize, setCompanySize] = useState<string>('10-50 employees');
  const [buyingIntent, setBuyingIntent] = useState<string>('');
  const [exclusions, setExclusions] = useState<string>('');
  const [maxProspects, setMaxProspects] = useState<number>(3);
  const [showRefinements, setShowRefinements] = useState<boolean>(false);

  // Validation & Execution States
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchStepIndex, setSearchStepIndex] = useState<number>(0);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResultState | null>(null);
  const [addedLeadIds, setAddedLeadIds] = useState<Set<string>>(new Set());

  // Demo Walkthrough States
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const targetProspect = prospects.find(p => p.id === 'prospect-01') || prospects[0];

  const honestSearchSteps = [
    { label: "1. Understanding target customer criteria...", icon: "target" },
    { label: "2. Searching public web sources via Tavily...", icon: "search" },
    { label: "3. Checking candidate company websites & reading evidence...", icon: "globe" },
    { label: "4. Grounding facts & calculating ICP match scores...", icon: "shield" }
  ];

  const demoSteps = [
    {
      title: "1. Finding Clues Online",
      subtitle: "Looking at public updates, job posts, and engineering blogs",
      expression: "focused" as ScoutExpression,
      speech: "Checking what this company is working on...",
      details: [
        "Found: KiteMetrics mentioned a Kafka cluster delay in a public post (Sept 2026)",
        "Found: Elena Rostova (formerly at Stripe) joined as VP of Engineering",
        "Found: 3 open jobs for Senior Kubernetes and eBPF engineers"
      ],
      badge: "3 Real Clues Found"
    },
    {
      title: "2. Source Details vs. Educated Guesses",
      subtitle: "Keeping source-backed details separate from unconfirmed guesses",
      expression: "curious" as ScoutExpression,
      speech: "Separating source details from our best guesses!",
      details: [
        "✓ Found in source: Their blog mentions Kafka delays under high volume (20M spans/sec)",
        "✓ Found in source: They are hiring 3 engineers reporting to Elena Rostova",
        "⚡ What might be true: High storage bills might be hurting profit margins",
        "⚡ What might be true: Elena has been asked by the board to speed up incident fixes"
      ],
      badge: "Zero Made-Up Claims"
    },
    {
      title: "3. Checking How Well They Fit",
      subtitle: "Comparing them with the kind of customers you want to reach",
      expression: "thinking" as ScoutExpression,
      speech: "Match score is 96 out of 100!",
      details: [
        "Team Size: 42 people (Your target: 20-50) → Perfect match",
        "Tools Used: Kubernetes and tracing tools → They have the exact problem you fix",
        "Key Person: Elena Rostova (VP Engineering) → Has decision-making power",
        "Recommended Angle: Share technical benchmark data showing 4x trace compression"
      ],
      badge: "Match Score: 96 / 100"
    },
    {
      title: "4. Draft a Helpful Message",
      subtitle: "Write a personal message for you to review and approve",
      expression: "celebratory" as ScoutExpression,
      speech: "Message draft ready for your review!",
      details: [
        "Recipient: Elena Rostova (VP Engineering, KiteMetrics)",
        "Tone: Practical and respectful, zero sales fluff",
        "Human Control: We never send emails automatically. You stay in control of every message."
      ],
      badge: "You Decide Before Sending"
    }
  ];

  // Pre-populate from existing ICP when opened
  useEffect(() => {
    if (isOpen) {
      if (icp) {
        if (!customerDescription && icp.companyDescription) {
          setCustomerDescription(icp.companyDescription);
        }
        if (!industry && icp.targetIndustries && icp.targetIndustries.length > 0) {
          setIndustry(icp.targetIndustries.join(', '));
        }
        if (!location && icp.targetGeographies && icp.targetGeographies.length > 0) {
          setLocation(icp.targetGeographies.join(', '));
        }
        if (!buyingIntent && icp.primaryPainPoint) {
          setBuyingIntent(icp.primaryPainPoint);
        }
        if (!exclusions && icp.exclusions && icp.exclusions.length > 0) {
          setExclusions(icp.exclusions.join(', '));
        }
      }
      setValidationError(null);
      setSearchError(null);
    }
  }, [isOpen, icp]);

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

  // Simulated honest progress indicator timer while live searching
  useEffect(() => {
    let stepTimer: ReturnType<typeof setInterval>;
    if (isSearching) {
      setSearchStepIndex(0);
      stepTimer = setInterval(() => {
        setSearchStepIndex(prev => (prev < 3 ? prev + 1 : prev));
      }, 3500);
    }
    return () => clearInterval(stepTimer);
  }, [isSearching]);

  if (!isOpen) return null;

  // Handle Quick Example Chips
  const handleSelectExample = (exampleText: string, exampleIndustry?: string, exampleIntent?: string) => {
    setCustomerDescription(exampleText);
    if (exampleIndustry) setIndustry(exampleIndustry);
    if (exampleIntent) setBuyingIntent(exampleIntent);
    setValidationError(null);
  };

  // Execute customer discovery
  const handleStartScouting = async (forcedMode?: 'live' | 'demo') => {
    const runMode = forcedMode || activeTab;

    // Validate Required Input: What kind of customers are you looking for?
    const desc = customerDescription.trim();
    if (!desc) {
      setValidationError("Please describe the companies you are looking for before we search.");
      return;
    }
    setValidationError(null);

    setIsSearching(true);
    setSearchError(null);
    setResult(null);

    // 1. Persist the Target Customer Profile (ICP)
    try {
      if (icp) {
        const updatedICP: IdealCustomerProfile = {
          ...icp,
          companyDescription: desc,
          targetIndustries: industry.trim() 
            ? industry.split(',').map(s => s.trim()).filter(Boolean) 
            : icp.targetIndustries,
          targetGeographies: location.trim() 
            ? location.split(',').map(s => s.trim()).filter(Boolean) 
            : icp.targetGeographies,
          primaryPainPoint: buyingIntent.trim() || icp.primaryPainPoint,
          exclusions: exclusions.trim() 
            ? exclusions.split(',').map(s => s.trim()).filter(Boolean) 
            : icp.exclusions,
        };

        if (onSaveICP) {
          await onSaveICP(updatedICP);
        } else {
          await prospectService.updateICP(updatedICP);
        }
      }
    } catch (saveErr) {
      console.warn("Could not persist updated ICP prior to search:", saveErr);
    }

    // 2. Perform Real Public-Web Discovery
    try {
      const res = await prospectService.runResearch({
        maxProspects,
        mode: runMode,
        userInstructions: desc,
      });

      setResult(res as ResearchResultState);

      // Trigger workspace data refresh so newly saved prospects appear immediately
      if (res.candidatesSaved > 0 && onDiscoveryComplete) {
        onDiscoveryComplete();
      }
    } catch (err: any) {
      const errorMsg = err.detail || err.message || 'Customer discovery search failed.';
      setSearchError(errorMsg);
    } finally {
      setIsSearching(false);
    }
  };

  // Add individual candidate lead to pipeline
  const handleAddToPipeline = async (candidate: Prospect) => {
    try {
      if (onUpdateStage) {
        onUpdateStage(candidate.id, 'ready_to_review');
      } else {
        await prospectService.updateProspectStage(candidate.id, 'ready_to_review');
      }

      setAddedLeadIds(prev => new Set(prev).add(candidate.id));

      // Celebration confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.65 }
      });

      if (onDiscoveryComplete) {
        onDiscoveryComplete();
      }
    } catch (err: any) {
      alert(`Could not add to pipeline: ${err.message || 'Error'}`);
    }
  };

  const currentDemo = demoSteps[demoStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17271F]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl shadow-[6px_6px_0px_#17271F] flex flex-col overflow-hidden"
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
                  {activeTab === 'live' ? 'Customer Discovery' : 'Interactive Demo'}
                </span>
                {config && (
                  <span className="text-[11px] text-[#F7F2E8]/70 font-mono">
                    {config.configured ? `${config.llmProvider || 'Google Gemini'} (${config.model})` : 'Offline Mode'}
                  </span>
                )}
              </div>
              <h2 id="modal-title" className="text-base font-editorial font-bold text-white tracking-tight">
                {activeTab === 'live' ? 'Who are you looking to find?' : 'See How Scout Finds Leads'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#F7F2E8]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-[#17271F] text-[#F7F2E8] shadow-[2px_2px_0px_#9DE3D0]'
                  : 'text-[#4A5E52] hover:text-[#17271F] hover:bg-white/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#9DE3D0]" />
              <span>Live Web Search</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('demo');
                setResult(null);
                setSearchError(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'demo'
                  ? 'bg-[#17271F] text-[#F7F2E8] shadow-[2px_2px_0px_#D8FF65]'
                  : 'text-[#4A5E52] hover:text-[#17271F] hover:bg-white/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#D8FF65]" />
              <span>Step-by-Step Demo</span>
            </button>
          </div>

          <div className="text-[11px] font-mono font-semibold">
            {configLoading ? (
              <span className="text-[#4A5E52]">Checking providers...</span>
            ) : config?.configured ? (
              <span className="text-[#17271F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#9DE3D0]" />
                <span>Ready to Search ({config.model})</span>
              </span>
            ) : (
              <span className="text-[#FF7054] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF7054]" />
                Keys Missing in backend/.env
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: LIVE SEARCH & TARGET CUSTOMER INPUT EXPERIENCE */}
          {activeTab === 'live' && (
            <div className="space-y-5">
              {/* Missing Keys Notice if not configured */}
              {!configLoading && !config?.configured && (
                <div className="p-3.5 rounded-xl bg-[#FFEAE5] border border-[#FF7054] text-xs text-[#17271F] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#FF7054]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Live Search Keys Needed</span>
                  </div>
                  <p className="text-[11px] text-[#4A5E52] leading-relaxed">
                    Live prospect discovery searches public web pages via Tavily and scores with Gemini. Please add <code className="bg-white px-1 py-0.5 rounded border border-[#FF7054]/30 font-mono">GEMINI_API_KEY</code> and <code className="bg-white px-1 py-0.5 rounded border border-[#FF7054]/30 font-mono">TAVILY_API_KEY</code> to <code className="bg-white px-1 py-0.5 rounded border border-[#FF7054]/30 font-mono">backend/.env</code>.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => handleStartScouting('demo')}
                      className="btn-tactile-secondary px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer"
                    >
                      Run with Offline Demo Simulation
                    </button>
                  </div>
                </div>
              )}

              {/* Form Input View (When not searching and no completed results) */}
              {!isSearching && !result && (
                <div className="space-y-4">
                  {/* Title & Natural Guidance */}
                  <div>
                    <h3 className="text-2xl font-editorial font-bold text-[#17271F]">
                      Who are you looking to find?
                    </h3>
                    <p className="text-xs text-[#4A5E52] mt-1 leading-relaxed">
                      Describe your ideal customers. ScoutSpark will search for relevant companies and show you the public evidence behind each match.
                    </p>
                  </div>

                  {/* Required Target Customer Description Input */}
                  <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 shadow-[3px_3px_0px_#17271F] space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#17271F] flex items-center gap-1.5">
                          <span>What kind of customers are you looking for?</span>
                          <span className="text-[#FF7054] font-mono">* Required</span>
                        </label>
                      </div>

                      <textarea
                        rows={3}
                        value={customerDescription}
                        onChange={(e) => {
                          setCustomerDescription(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="e.g. I'm looking for early-stage SaaS companies in India that are hiring developers and could benefit from AI-powered developer tools."
                        className={`w-full bg-[#FAF7F0] border-1.5 rounded-xl p-3 text-xs text-[#17271F] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D8FF65] transition-all ${
                          validationError ? 'border-[#FF7054] bg-[#FFEAE5]/40' : 'border-[#17271F]'
                        }`}
                      />

                      {/* Validation Error Message */}
                      {validationError && (
                        <div className="mt-2 text-xs font-semibold text-[#FF7054] flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{validationError}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Starter Example Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#4A5E52]">
                        Click an example to test:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSelectExample(
                            "I'm looking for early-stage SaaS companies in India that are hiring developers and could benefit from AI-powered developer tools.",
                            "Developer Tools, B2B SaaS",
                            "Hiring engineers, using Kubernetes"
                          )}
                          className="text-[11px] bg-[#FAF7F0] hover:bg-[#D8FF65]/40 text-[#17271F] border border-[#17271F]/30 hover:border-[#17271F] px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer"
                        >
                          ⚡ Early-stage dev tools in India hiring engineers
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectExample(
                            "Find healthcare technology startups in the US that need better document processing and workflow automation.",
                            "Healthcare, HealthTech",
                            "HIPAA compliance, patient records"
                          )}
                          className="text-[11px] bg-[#FAF7F0] hover:bg-[#D8FF65]/40 text-[#17271F] border border-[#17271F]/30 hover:border-[#17271F] px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer"
                        >
                          🏥 US HealthTech startups needing workflow automation
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Refinements Accordion */}
                    <div className="pt-2 border-t border-[#E2D9C8]">
                      <button
                        type="button"
                        onClick={() => setShowRefinements(!showRefinements)}
                        className="text-xs font-semibold text-[#17271F] hover:text-[#FF7054] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#FF7054]" />
                        <span>{showRefinements ? "Hide Optional Refinements" : "+ Add Optional Refinements (Industry, Location, Exclusions)"}</span>
                      </button>

                      {showRefinements && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-in fade-in duration-150 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-[#4A5E52] mb-1">
                              Industry or Category
                            </label>
                            <input
                              type="text"
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                              placeholder="e.g. Developer Tools, Healthcare, FinTech"
                              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs text-[#17271F] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#4A5E52] mb-1">
                              Target Location / Geography
                            </label>
                            <input
                              type="text"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="e.g. United States, India, Remote"
                              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs text-[#17271F] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#4A5E52] mb-1">
                              Buying-Intent Signal or Pain Point
                            </label>
                            <input
                              type="text"
                              value={buyingIntent}
                              onChange={(e) => setBuyingIntent(e.target.value)}
                              placeholder="e.g. Hiring engineers, migrating cloud, recent funding"
                              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs text-[#17271F] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#4A5E52] mb-1">
                              Exclusions to Disqualify
                            </label>
                            <input
                              type="text"
                              value={exclusions}
                              onChange={(e) => setExclusions(e.target.value)}
                              placeholder="e.g. Agencies, non-profits, consulting firms"
                              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs text-[#17271F] focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* How many companies to discover */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E2D9C8]">
                      <div>
                        <span className="text-xs font-bold text-[#17271F]">Companies to discover: </span>
                        <span className="text-[11px] text-[#4A5E52]">Keeps searches fast and focused</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[2, 3, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setMaxProspects(num)}
                            className={`px-3 py-1 rounded text-xs font-bold font-mono transition-all cursor-pointer ${
                              maxProspects === num
                                ? 'bg-[#17271F] text-[#D8FF65] border border-[#17271F]'
                                : 'bg-[#FAF7F0] text-[#17271F] border border-[#17271F]/40 hover:bg-[#E2D9C8]'
                            }`}
                          >
                            {num} leads
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Previous Error Notice if search failed */}
                  {searchError && (
                    <div className="p-3.5 rounded-xl bg-[#FFEAE5] border border-[#FF7054] text-xs text-[#17271F] flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-[#FF7054] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#FF7054]">Search could not be completed: </span>
                        <p className="mt-0.5 text-[11px] leading-relaxed">{searchError}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Honest Multi-Stage Progress State */}
              {isSearching && (
                <div className="py-8 px-4 text-center space-y-5 bg-white border-2 border-[#17271F] rounded-2xl shadow-[4px_4px_0px_#17271F]">
                  <ScoutMascot expression="thinking" size="xl" animate={true} />
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17271F] text-[#9DE3D0] text-xs font-mono font-bold animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Searching the Live Web</span>
                    </div>
                    <h3 className="text-xl font-editorial font-bold text-[#17271F]">
                      Searching Public Web & Verifying Sources...
                    </h3>
                    <p className="text-xs text-[#4A5E52] leading-relaxed">
                      ScoutSpark is querying the live web, checking corporate websites, extracting verified clues, and scoring matches against your criteria.
                    </p>
                  </div>

                  {/* Honest steps indicators */}
                  <div className="max-w-md mx-auto pt-2 space-y-2 text-left text-xs font-mono">
                    {honestSearchSteps.map((step, idx) => {
                      const isCurrent = idx === searchStepIndex;
                      const isDone = idx < searchStepIndex;
                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg border transition-all flex items-center gap-2.5 ${
                            isCurrent
                              ? 'bg-[#FAF7F0] border-[#17271F] text-[#17271F] font-bold shadow-xs'
                              : isDone
                              ? 'bg-[#9DE3D0]/20 border-[#9DE3D0] text-[#17271F]'
                              : 'border-transparent text-[#4A5E52]/60'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            isCurrent ? 'bg-[#FF7054] animate-ping' : isDone ? 'bg-[#9DE3D0]' : 'bg-[#E2D9C8]'
                          }`} />
                          <span>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed Results View with Working Lead Actions */}
              {!isSearching && result && (
                <div className="space-y-4">
                  {/* Results Header Summary */}
                  <div className="p-4 rounded-xl bg-white border-2 border-[#17271F] shadow-[3px_3px_0px_#17271F] flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-[#9DE3D0] text-[#17271F] border border-[#17271F]">
                          {result.mode === 'live' ? 'Live Web Results' : 'Demo Results'}
                        </span>
                        <span className="text-xs font-semibold text-[#4A5E52] font-mono">
                          {result.totalSourcesFound} websites read • {result.candidatesSaved} matching leads saved • {result.candidatesRejected ?? 0} skipped
                        </span>
                      </div>
                      <h3 className="text-xl font-editorial font-bold text-[#17271F] mt-1.5">
                        {result.candidatesSaved > 0 
                          ? `Found ${result.candidatesSaved} Companies Matching Your Target`
                          : 'Search Finished — No Matching Companies Found'}
                      </h3>
                      <p className="text-xs text-[#4A5E52] mt-0.5">
                        {result.candidatesSaved > 0
                          ? 'Each company is backed by verified public evidence with zero hallucinated facts.'
                          : 'Try broadening your description or removing location/size constraints.'}
                      </p>
                    </div>

                    <ScoutMascot 
                      expression={result.candidatesSaved > 0 ? "celebratory" : "thinking"} 
                      size="md" 
                      animate={true} 
                    />
                  </div>

                  {/* Discovered Candidates List */}
                  <div className="space-y-3">
                    {result.prospects.length === 0 ? (
                      <div className="p-8 bg-white border-2 border-[#17271F] rounded-2xl text-center space-y-3">
                        <ScoutMascot expression="thinking" size="lg" animate={true} />
                        <h4 className="text-base font-editorial font-bold text-[#17271F]">
                          We couldn't find matching companies on this pass
                        </h4>
                        <p className="text-xs text-[#4A5E52] max-w-md mx-auto">
                          Try describing your target customer in broader terms or explore a different industry segment.
                        </p>
                        <button
                          onClick={() => setResult(null)}
                          className="btn-tactile-coral px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Edit Target Description & Try Again
                        </button>
                      </div>
                    ) : (
                      result.prospects.map((candidate) => {
                        const isAdded = addedLeadIds.has(candidate.id) || candidate.pipelineStage === 'ready_to_review' || candidate.pipelineStage === 'approved';

                        return (
                          <div 
                            key={candidate.id}
                            className="bg-white border-2 border-[#17271F] rounded-2xl p-4 shadow-[3px_3px_0px_#17271F] space-y-3 hover:border-[#FF7054] transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl border border-[#17271F] bg-[#D8FF65] flex flex-col items-center justify-center font-bold font-mono shrink-0 shadow-[2px_2px_0px_#17271F]">
                                  <span className="text-base leading-none">{candidate.fitScore}</span>
                                  <span className="text-[7px] uppercase">SCORE</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-base font-editorial font-bold text-[#17271F]">
                                      {candidate.companyName}
                                    </h4>
                                    <span className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] text-[9px]">
                                      {candidate.fitLevel}
                                    </span>
                                    <span className="sticker-badge bg-[#9DE3D0] text-[#17271F] border-[#17271F] text-[9px] font-mono">
                                      🌐 Verified Web
                                    </span>
                                  </div>
                                  <div className="text-xs text-[#4A5E52] mt-0.5">
                                    {candidate.industry} • {candidate.headquarters || 'Location not specified'} • {candidate.domain}
                                  </div>
                                </div>
                              </div>

                              {/* Working Lead Action Buttons */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleAddToPipeline(candidate)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isAdded 
                                      ? 'bg-[#9DE3D0] text-[#17271F] border border-[#17271F]'
                                      : 'btn-tactile-coral'
                                  }`}
                                  title="Add to Pipeline in Ready to Review stage"
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>In Pipeline</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Add to Pipeline</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => {
                                    onClose();
                                    onSelectProspect(candidate);
                                  }}
                                  className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Open full dossier & message drafts"
                                >
                                  <span>View Lead Details</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Why it matches */}
                            <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8] text-xs text-[#17271F]">
                              <span className="font-bold text-[#FF7054]">Why it fits: </span>
                              <span>{candidate.summary}</span>
                            </div>

                            {/* Verified Facts & Sources with Clickable URLs */}
                            {candidate.observedFacts && candidate.observedFacts.length > 0 && (
                              <div className="pt-2 border-t border-[#E2D9C8] space-y-1">
                                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4A5E52]">
                                  Verified Evidence Snippet:
                                </div>
                                <div className="text-xs text-[#17271F] flex items-start gap-2 bg-white p-2.5 rounded-lg border border-[#17271F]/15">
                                  <span className="shrink-0 text-xs text-[#17271F] font-bold">✓</span>
                                  <div className="flex-1 space-y-1">
                                    <p className="italic text-[#17271F]">"{candidate.observedFacts[0].fact}"</p>
                                    {candidate.observedFacts[0].sourceUrl && (
                                      <a 
                                        href={candidate.observedFacts[0].sourceUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-[11px] text-[#FF7054] hover:underline flex items-center gap-1 font-mono break-all font-semibold"
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
                        );
                      })
                    )}
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
                      className={`py-2 px-3 text-left border-r border-[#17271F]/15 last:border-r-0 transition-all cursor-pointer ${
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
              <div className="bg-white border-2 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F] space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4A5E52] flex items-center justify-between border-b border-[#E2D9C8] pb-1.5">
                  <span>Interactive Walkthrough</span>
                  <span className="font-mono text-[11px] text-[#FF7054] font-semibold">EXAMPLE: KiteMetrics</span>
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
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FFEAE5] border border-[#FF7054]/40 text-xs text-[#17271F]">
            <ShieldCheck className="w-4 h-4 text-[#FF7054] shrink-0" />
            <div>
              <span className="font-bold">Human Control Promise: </span>
              ScoutSpark finds leads and writes draft messages, but never sends an email without your explicit review and approval.
            </div>
          </div>
        </div>

        {/* Modal Footer with Meaningful Working Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#F7F2E8] border-t border-[#17271F]/15 shrink-0 gap-3">
          <div className="flex items-center gap-2 text-xs text-[#4A5E52]">
            <span className={`inline-block w-2 h-2 rounded-full ${activeTab === 'live' ? 'bg-[#9DE3D0]' : 'bg-[#D8FF65]'} animate-pulse`} />
            <span className="text-[11px] font-mono">
              {activeTab === 'live' 
                ? `${config?.llmProvider || 'Google Gemini'} (${config?.model || 'Configured'}) + ${config?.searchProvider || 'Tavily Search API'}` 
                : 'Offline Demo Mode'}
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
                    className="btn-tactile-secondary px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Refine & Search Again
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToTab) onNavigateToTab('pipeline');
                    }}
                    className="btn-tactile-coral px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#17271F]"
                  >
                    <Kanban className="w-3.5 h-3.5" />
                    <span>Done & View in Pipeline</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToTab) onNavigateToTab('prospects');
                    }}
                    className="btn-tactile-secondary px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View All Leads</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleStartScouting()}
                  disabled={isSearching}
                  className="btn-tactile-coral px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#17271F]"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Searching the Live Web...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#D8FF65]" />
                      <span>Find My Customers</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
                  className="btn-tactile-secondary px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onSelectProspect(targetProspect);
                  }}
                  className="btn-tactile-coral px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Open Elena's Lead Profile
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
