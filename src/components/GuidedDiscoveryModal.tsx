import React, { useState, useEffect, useRef } from 'react';
import { ScoutMascot, ScoutExpression } from './ScoutMascot';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
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
  Check,
  Kanban,
  Users,
  Target,
  Zap,
  Trash2,
  Rocket,
  Terminal,
  Bot,
  Stethoscope,
  CreditCard,
  Shield,
  Clock,
  Play,
  Pause,
  RotateCcw
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

interface CustomerArchetype {
  id: string;
  title: string;
  category: string;
  badge: string;
  iconType: 'rocket' | 'terminal' | 'bot' | 'stethoscope' | 'creditCard' | 'shield';
  description: string;
  industry: string;
  targetRoles: string;
  buyingIntent: string;
  location: string;
  exclusions: string;
}

const CUSTOMER_ARCHETYPES: CustomerArchetype[] = [
  {
    id: 'b2b-saas',
    title: 'B2B SaaS',
    category: 'Sales & Growth',
    badge: '⚡ Fast Match',
    iconType: 'rocket',
    description: "Early-stage B2B SaaS companies in the US and India with 10–50 employees hiring sales development reps to scale pipeline.",
    industry: 'B2B SaaS, Cloud Software',
    targetRoles: 'Founder, VP Sales, Head of Growth',
    buyingIntent: 'Hiring SDRs, expansion into new markets, recent seed funding',
    location: 'United States, India, Remote',
    exclusions: 'Agencies, consultancies, retail stores'
  },
  {
    id: 'devtools',
    title: 'Developer Tools',
    category: 'Infrastructure',
    badge: '🛠️ High Evidence',
    iconType: 'terminal',
    description: "Developer tools and cloud infrastructure startups scaling Kubernetes, CI/CD, and distributed telemetry.",
    industry: 'Developer Tools, DevOps, Cloud Infrastructure',
    targetRoles: 'VP Engineering, CTO, Platform Lead',
    buyingIntent: 'Kubernetes scaling, distributed systems complexity, hiring senior engineers',
    location: 'United States, Europe, Remote',
    exclusions: 'Consulting agencies, outsourcing shops'
  },
  {
    id: 'ai-startups',
    title: 'AI Startups',
    category: 'GenAI & Agents',
    badge: '🤖 Trending',
    iconType: 'bot',
    description: "AI startups building autonomous agents, LLM applications, or automated workflows seeking pilot customers.",
    industry: 'Artificial Intelligence, Generative AI, B2B SaaS',
    targetRoles: 'CEO, Head of AI, Lead Product Manager',
    buyingIntent: 'Product launch, enterprise pilot acquisition, model inference scaling',
    location: 'United States, India, Global Remote',
    exclusions: 'Consumer games, crypto tokens, design agencies'
  },
  {
    id: 'healthtech',
    title: 'HealthTech',
    category: 'Healthcare',
    badge: '🏥 Regulated B2B',
    iconType: 'stethoscope',
    description: "Healthcare technology companies building HIPAA-compliant software, patient workflows, and EHR integrations.",
    industry: 'HealthTech, Healthcare IT, Digital Health',
    targetRoles: 'Head of Operations, CEO, Chief Medical Officer',
    buyingIntent: 'HIPAA compliance, patient record workflow bottlenecks, clinic scaling',
    location: 'United States, Canada',
    exclusions: 'Physical dental clinics, local pharmacies, hospitals'
  },
  {
    id: 'fintech',
    title: 'FinTech',
    category: 'Financial Services',
    badge: '💳 High Value',
    iconType: 'creditCard',
    description: "Fintech and modern payments platforms handling transaction volume, automated billing, and risk compliance.",
    industry: 'FinTech, Payments, Banking Software',
    targetRoles: 'Head of Product, VP Risk, Founder',
    buyingIntent: 'Transaction scaling, fraud detection, international payout compliance',
    location: 'United States, United Kingdom, India',
    exclusions: 'Traditional retail banks, local credit unions, payday lenders'
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    category: 'Security',
    badge: '🔒 Enterprise',
    iconType: 'shield',
    description: "Cloud cybersecurity startups providing automated SOC2/ISO compliance and vulnerability scanning.",
    industry: 'Cybersecurity, Cloud Compliance, Infosec',
    targetRoles: 'CISO, VP Security, VP IT',
    buyingIntent: 'SOC2 compliance deadlines, cloud vulnerability audit, remote workforce defense',
    location: 'United States, Europe, Remote',
    exclusions: 'Physical security guard companies, locksmiths, local alarm installers'
  }
];

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

  // Customer Discovery Inputs
  const [customerDescription, setCustomerDescription] = useState<string>('');
  const [clientNameOrTarget, setClientNameOrTarget] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [targetRoles, setTargetRoles] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [buyingIntent, setBuyingIntent] = useState<string>('');
  const [exclusions, setExclusions] = useState<string>('');
  const [maxProspects, setMaxProspects] = useState<number>(2); // Default to 2 for fast ~5s searches
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('');
  const [showRefinements, setShowRefinements] = useState<boolean>(false);

  // Validation & Execution States
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchStepIndex, setSearchStepIndex] = useState<number>(0);
  const [searchElapsedSeconds, setSearchElapsedSeconds] = useState<number>(0);
  const [completedElapsedSeconds, setCompletedElapsedSeconds] = useState<number | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResultState | null>(null);
  const [addedLeadIds, setAddedLeadIds] = useState<Set<string>>(new Set());

  // Wall-clock timing refs to prevent drift, throttling, or duplicate intervals
  const searchStartTimeRef = useRef<number | null>(null);
  const searchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Demo Walkthrough States & Simulator Timer
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoCountdown, setDemoCountdown] = useState<number>(3);
  const targetProspect = prospects.find(p => p.id === 'prospect-01') || prospects[0];

  const honestSearchSteps = [
    { label: "1. Planning search queries", icon: "target" },
    { label: "2. Scanning public web sources", icon: "search" },
    { label: "3. Evaluating company fit & evidence", icon: "globe" },
    { label: "4. Grounding facts & drafting outreach", icon: "shield" }
  ];

  const demoSteps = [
    {
      title: "1. Scan the Public Web",
      subtitle: "Scout checks blogs, job listings, and news for public growth signals.",
      expression: "focused" as ScoutExpression,
      speech: "Looking for public growth signals...",
      details: [
        "KiteMetrics mentioned Kafka latency issues in an engineering post",
        "Elena Rostova joined as VP of Engineering",
        "Hiring 3 Senior Kubernetes and Infrastructure engineers"
      ],
      badge: "3 Signals Found"
    },
    {
      title: "2. Separate Facts from Guesses",
      subtitle: "Verified source facts are kept separate from unconfirmed hypotheses.",
      expression: "curious" as ScoutExpression,
      speech: "Verifying facts from public sources!",
      details: [
        "✓ Verified fact: Kafka broker lag cited under 20M spans/sec load",
        "✓ Verified fact: Recruiting engineers reporting to VP Elena Rostova",
        "⚡ Hypothesis: Telemetry storage costs may be straining budget",
        "⚡ Hypothesis: Team has mandate to cut cluster overhead"
      ],
      badge: "Evidence Grounded"
    },
    {
      title: "3. Score Customer Fit",
      subtitle: "Calculates match score from 0 to 100 based on your target criteria.",
      expression: "thinking" as ScoutExpression,
      speech: "Match score: 96 / 100!",
      details: [
        "Team Size: 42 people (Target: 10–50) → Strong match",
        "Tech Stack: Kubernetes & telemetry → Has the problem you solve",
        "Decision Maker: Elena Rostova (VP Engineering) → Verified buyer role",
        "Suggested Angle: Share benchmark data on 4x trace compression"
      ],
      badge: "Match Score: 96%"
    },
    {
      title: "4. Review Outreach Draft",
      subtitle: "A personal, honest draft is prepared for your review and approval.",
      expression: "celebratory" as ScoutExpression,
      speech: "Draft ready for your approval!",
      details: [
        "Recipient: Elena Rostova (VP Engineering, KiteMetrics)",
        "Opening Hook: Cites verified public signal (Kafka latency post)",
        "Human Control: You approve or edit every email before sending"
      ],
      badge: "Ready for Approval"
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
        if (!targetRoles && icp.targetRoles && icp.targetRoles.length > 0) {
          setTargetRoles(icp.targetRoles.join(', '));
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
      setSearchElapsedSeconds(0);
      setCompletedElapsedSeconds(null);
      setDemoStep(0);
      setIsDemoRunning(false);
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
        searchIntervalRef.current = null;
      }
      searchStartTimeRef.current = null;
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

  // Demo walkthrough timer with accurate countdown & auto-advance
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let countdownInterval: ReturnType<typeof setInterval>;

    if (activeTab === 'demo' && isDemoRunning && demoStep < demoSteps.length - 1) {
      setDemoCountdown(3);
      countdownInterval = setInterval(() => {
        setDemoCountdown(prev => Math.max(1, prev - 1));
      }, 1000);

      timer = setTimeout(() => {
        setDemoStep(prev => prev + 1);
        setDemoCountdown(3);
      }, 3000);
    } else if (demoStep >= demoSteps.length - 1) {
      setIsDemoRunning(false);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [activeTab, demoStep, isDemoRunning, demoSteps.length]);

  // Wall-clock grounded search stopwatch and step manager
  useEffect(() => {
    if (isSearching) {
      searchStartTimeRef.current = Date.now();
      setSearchElapsedSeconds(0);
      setSearchStepIndex(0);
      setCompletedElapsedSeconds(null);

      // Clean up previous interval if any
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
      }

      searchIntervalRef.current = setInterval(() => {
        if (!searchStartTimeRef.current) return;
        const now = Date.now();
        const elapsed = Math.max(0, Math.floor((now - searchStartTimeRef.current) / 1000));
        setSearchElapsedSeconds(elapsed);

        // Advance search step based on elapsed time without skipping
        const step = elapsed < 3 ? 0 : elapsed < 8 ? 1 : elapsed < 15 ? 2 : 3;
        setSearchStepIndex(step);
      }, 250);
    } else {
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
        searchIntervalRef.current = null;
      }
    }

    return () => {
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
        searchIntervalRef.current = null;
      }
    };
  }, [isSearching]);

  if (!isOpen) return null;

  // Handle applying a customer archetype from dropdown or box
  const handleApplyArchetype = (archetypeId: string) => {
    setSelectedArchetypeId(archetypeId);
    const arch = CUSTOMER_ARCHETYPES.find(a => a.id === archetypeId);
    if (!arch) return;

    setCustomerDescription(arch.description);
    setIndustry(arch.industry);
    setTargetRoles(arch.targetRoles);
    setBuyingIntent(arch.buyingIntent);
    setLocation(arch.location);
    setExclusions(arch.exclusions);
    setValidationError(null);
  };

  // Quick tag appenders
  const handleAppendRole = (role: string) => {
    setTargetRoles(prev => prev ? `${prev}, ${role}` : role);
  };

  const handleAppendIndustry = (ind: string) => {
    setIndustry(prev => prev ? `${prev}, ${ind}` : ind);
  };

  const handleAppendSignal = (sig: string) => {
    setBuyingIntent(prev => prev ? `${prev}, ${sig}` : sig);
  };

  // Render archetype icon helper
  const renderArchetypeIcon = (iconType: string) => {
    switch (iconType) {
      case 'rocket': return <Rocket className="w-4 h-4 text-[#FF7054]" />;
      case 'terminal': return <Terminal className="w-4 h-4 text-[#17271F]" />;
      case 'bot': return <Bot className="w-4 h-4 text-[#FF7054]" />;
      case 'stethoscope': return <Stethoscope className="w-4 h-4 text-[#17271F]" />;
      case 'creditCard': return <CreditCard className="w-4 h-4 text-[#FF7054]" />;
      case 'shield': return <Shield className="w-4 h-4 text-[#17271F]" />;
      default: return <Sparkles className="w-4 h-4 text-[#FF7054]" />;
    }
  };

  // Execute customer discovery
  const handleStartScouting = async (forcedMode?: 'live' | 'demo') => {
    const runMode = forcedMode || activeTab;

    // Validate Required Input
    const desc = customerDescription.trim();
    if (!desc) {
      setValidationError("Please describe your target client or ideal customer before we search.");
      return;
    }
    setValidationError(null);

    setIsSearching(true);
    setSearchError(null);
    setResult(null);

    // Build enhanced instructions combining description, client keyword, roles, and signals
    let enhancedInstructions = desc;
    if (clientNameOrTarget.trim()) {
      enhancedInstructions += ` Target Company/Client Keyword: ${clientNameOrTarget.trim()}.`;
    }
    if (targetRoles.trim()) {
      enhancedInstructions += ` Target Roles: ${targetRoles.trim()}.`;
    }

    // 1. Persist the Target Customer Profile (ICP)
    let updatedICP: IdealCustomerProfile | undefined = undefined;
    try {
      if (icp) {
        updatedICP = {
          ...icp,
          companyDescription: desc,
          targetIndustries: industry.trim() 
            ? industry.split(',').map(s => s.trim()).filter(Boolean) 
            : icp.targetIndustries,
          targetRoles: targetRoles.trim()
            ? targetRoles.split(',').map(s => s.trim()).filter(Boolean)
            : icp.targetRoles,
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

    // 2. Perform Parallel Fast Public-Web Discovery
    try {
      const res = await prospectService.runResearch({
        maxProspects,
        mode: runMode,
        userInstructions: enhancedInstructions,
        icp: updatedICP,
      });

      const finalElapsed = searchStartTimeRef.current
        ? Math.max(1, Math.floor((Date.now() - searchStartTimeRef.current) / 1000))
        : searchElapsedSeconds;
      setCompletedElapsedSeconds(finalElapsed);
      setResult(res as ResearchResultState);

      // Trigger workspace data refresh so newly saved prospects appear immediately
      if (res.candidatesSaved > 0 && onDiscoveryComplete) {
        onDiscoveryComplete();
      }
    } catch (err: any) {
      const finalElapsed = searchStartTimeRef.current
        ? Math.max(1, Math.floor((Date.now() - searchStartTimeRef.current) / 1000))
        : searchElapsedSeconds;
      setCompletedElapsedSeconds(finalElapsed);
      const errorMsg = err.detail || err.message || 'Customer discovery search failed.';
      setSearchError(errorMsg);
    } finally {
      setIsSearching(false);
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
        searchIntervalRef.current = null;
      }
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

  // Baseline estimated time based on mode and prospective candidates count
  const baseEstimate = activeTab === 'demo' ? 4 : (maxProspects >= 5 ? 16 : 10);

  // Dynamic, non-contradictory estimation logic:
  // 1. Estimated total is NEVER in the past (always >= searchElapsedSeconds + 2)
  // 2. Remaining time is NEVER negative (always >= 2)
  // 3. When search takes longer (e.g. cold start or deep web scraping), gracefully adapts
  const getTimingInfo = (elapsed: number, baseEst: number) => {
    if (elapsed < baseEst - 2) {
      const remaining = Math.max(2, baseEst - elapsed);
      return {
        estimatedTotal: baseEst,
        remaining,
        label: `~${baseEst}s (~${remaining}s remaining)`,
        note: null
      };
    }
    // Search is taking longer than baseline (e.g. cold start or deep web extraction)
    const adaptiveBuffer = elapsed < 20 ? 4 : elapsed < 35 ? 5 : 6;
    const adaptiveTotal = elapsed + adaptiveBuffer;
    const note = elapsed >= 25 
      ? 'deep web citations & evidence synthesis' 
      : elapsed >= 15 
      ? 'evaluating candidate relevance' 
      : 'analyzing live web results';

    return {
      estimatedTotal: adaptiveTotal,
      remaining: adaptiveBuffer,
      label: `~${adaptiveTotal}s (~${adaptiveBuffer}s remaining)`,
      note
    };
  };

  const timingInfo = getTimingInfo(searchElapsedSeconds, baseEstimate);

  // Smooth asymptotic progress calculation that never freezes at 95%
  const getSearchProgress = (elapsed: number, stepIdx: number): number => {
    if (stepIdx === 0) {
      return Math.min(28, 12 + Math.round(elapsed * 5));
    }
    if (stepIdx === 1) {
      const stepElapsed = Math.max(0, elapsed - 3);
      return Math.min(58, 28 + Math.round(stepElapsed * 6));
    }
    if (stepIdx === 2) {
      const stepElapsed = Math.max(0, elapsed - 8);
      return Math.min(80, 58 + Math.round(stepElapsed * 3));
    }
    const stepElapsed = Math.max(0, elapsed - 15);
    const bonus = Math.round(14 * (1 - Math.exp(-stepElapsed / 10)));
    return Math.min(94, 80 + bonus);
  };

  const currentDemo = demoSteps[demoStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#17271F]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[94vh] bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl shadow-[6px_6px_0px_#17271F] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        {/* Clean Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-[#17271F] text-[#F7F2E8] shrink-0">
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
                  {activeTab === 'live' ? 'Discovery' : 'Tour'}
                </span>
                {config && (
                  <span className="text-[11px] text-[#F7F2E8]/70 font-mono">
                    {config.configured ? 'Live Web' : 'Offline'}
                  </span>
                )}
              </div>
              <h2 id="modal-title" className="text-base sm:text-lg font-editorial font-bold text-white tracking-tight">
                {activeTab === 'live' ? 'Find Potential Customers' : 'How Scout Finds Leads'}
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

        {/* Clean Mode Selector Tab Bar */}
        <div className="flex border-b border-[#17271F]/20 bg-[#F7F2E8] px-4 sm:px-6 py-2 flex-wrap sm:flex-nowrap gap-2 items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveTab('live');
                setResult(null);
                setSearchError(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-[#17271F] text-[#F7F2E8] shadow-[2px_2px_0px_#FF7054]'
                  : 'text-[#4A5E52] hover:text-[#17271F] hover:bg-white/60'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#FF7054]" />
              <span>Live Search</span>
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
              <span>Demo Tour</span>
            </button>
          </div>

          <div className="text-[11px] font-mono font-semibold flex items-center gap-2">
            {configLoading ? (
              <span className="text-[#4A5E52]">Checking...</span>
            ) : config?.configured ? (
              <span className="text-[#17271F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#9DE3D0] animate-pulse" />
                <span>Ready</span>
              </span>
            ) : (
              <span className="text-[#FF7054] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF7054]" />
                Setup needed
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: LIVE SEARCH & TARGET CUSTOMER INPUT EXPERIENCE */}
          {activeTab === 'live' && (
            <div className="space-y-4">
              {/* Missing Keys Notice if not configured */}
              {!configLoading && !config?.configured && (
                <div className="p-3.5 rounded-xl bg-[#FFEAE5] border border-[#FF7054] text-xs text-[#17271F] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#FF7054]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Live Search Keys Needed</span>
                  </div>
                  <p className="text-xs text-[#4A5E52] leading-relaxed">
                    Add <code className="bg-white px-1 py-0.5 rounded border border-[#FF7054]/30 font-mono">GEMINI_API_KEY</code> and <code className="bg-white px-1 py-0.5 rounded border border-[#FF7054]/30 font-mono">TAVILY_API_KEY</code> to <code className="bg-white px-1 py-0.5 rounded border border-[#FF7054]/30 font-mono">backend/.env</code> for live web searching.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => handleStartScouting('demo')}
                      className="btn-tactile-secondary px-2.5 py-1 rounded text-xs font-bold cursor-pointer"
                    >
                      Run Offline Demo
                    </button>
                  </div>
                </div>
              )}

              {/* Form Input View (When not searching and no completed results) */}
              {!isSearching && !result && (
                <div className="space-y-4">
                  {/* Clean Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <h3 className="text-lg sm:text-xl font-editorial font-bold text-[#17271F]">
                        Who is your ideal customer?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4A5E52]">
                        Pick a template or describe who you want to find.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D8FF65]/30 border border-[#17271F] text-[11px] font-mono font-bold text-[#17271F] w-fit">
                      <Zap className="w-3.5 h-3.5 text-[#FF7054]" />
                      <span>Live Web Search (~5s)</span>
                    </div>
                  </div>

                  {/* QUICK TEMPLATES (CLEAN, COMPACT 6-CARD SELECTOR) */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#4A5E52] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF7054]" />
                        <span>Quick Templates:</span>
                      </span>
                      <span className="font-mono text-[10px] font-normal lowercase text-[#4A5E52]">
                        Click to auto-fill
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {CUSTOMER_ARCHETYPES.map((arch) => {
                        const isSelected = selectedArchetypeId === arch.id;
                        return (
                          <button
                            key={arch.id}
                            type="button"
                            onClick={() => handleApplyArchetype(arch.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-[#D8FF65]/40 border-[#17271F] shadow-[2px_2px_0px_#17271F]'
                                : 'bg-white border-[#17271F]/30 hover:border-[#17271F] hover:bg-[#FAF7F0]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {renderArchetypeIcon(arch.iconType)}
                              <span className="font-bold text-xs text-[#17271F] truncate">{arch.title}</span>
                            </div>
                            <div className="mt-1 text-[10px] text-[#4A5E52] font-mono truncate">
                              {arch.targetRoles.split(',')[0]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* MAIN INPUT CARD */}
                  <div className="bg-white border-2 border-[#17271F] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#17271F] space-y-3.5">
                    {/* Customer Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs sm:text-sm font-bold text-[#17271F] flex items-center gap-1.5">
                          <span>Describe your target customer:</span>
                          <span className="text-[#FF7054] font-mono">*</span>
                        </label>

                        {customerDescription && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerDescription('');
                              setSelectedArchetypeId('');
                            }}
                            className="text-xs text-[#FF7054] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Clear</span>
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={3}
                        value={customerDescription}
                        onChange={(e) => {
                          setCustomerDescription(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="e.g. Early-stage B2B SaaS companies in the US or India with 10–50 employees hiring sales reps..."
                        className={`w-full bg-[#FAF7F0] border rounded-xl p-3 text-xs sm:text-sm text-[#17271F] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D8FF65] transition-all ${
                          validationError ? 'border-[#FF7054] bg-[#FFEAE5]/40' : 'border-[#17271F]'
                        }`}
                      />

                      {validationError && (
                        <div className="mt-2 text-xs font-semibold text-[#FF7054] flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{validationError}</span>
                        </div>
                      )}
                    </div>

                    {/* Key Targeting Parameters (2 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E2D9C8]">
                      <div>
                        <label className="block text-xs font-bold text-[#17271F] mb-1">
                          Target Buyer Roles
                        </label>
                        <input
                          type="text"
                          value={targetRoles}
                          onChange={(e) => setTargetRoles(e.target.value)}
                          placeholder="e.g. Founder, VP Sales, CTO, Head of Growth"
                          className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#17271F] focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {['Founder', 'VP Sales', 'CTO', 'Head of Growth'].map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleAppendRole(role)}
                              className="text-[10px] bg-[#FAF7F0] hover:bg-[#D8FF65] text-[#17271F] border border-[#17271F]/40 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              + {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#17271F] mb-1">
                          Company or Keyword (Optional)
                        </label>
                        <input
                          type="text"
                          value={clientNameOrTarget}
                          onChange={(e) => setClientNameOrTarget(e.target.value)}
                          placeholder="e.g. Stripe, or 'Series A startups'"
                          className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#17271F] focus:outline-none"
                        />
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
                        <span>{showRefinements ? "Hide filters" : "+ More filters (Industry, Location, Exclusions)"}</span>
                      </button>

                      {showRefinements && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs animate-in fade-in duration-150">
                          <div>
                            <label className="block text-xs font-bold text-[#4A5E52] mb-1">
                              Industry
                            </label>
                            <input
                              type="text"
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                              placeholder="e.g. Developer Tools, B2B SaaS, FinTech"
                              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-[#17271F] focus:outline-none"
                            />
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {['B2B SaaS', 'DevTools', 'AI Startups', 'FinTech'].map((ind) => (
                                <button
                                  key={ind}
                                  type="button"
                                  onClick={() => handleAppendIndustry(ind)}
                                  className="text-[10px] bg-[#FAF7F0] hover:bg-[#D8FF65] text-[#17271F] border border-[#17271F]/40 px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  + {ind}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#4A5E52] mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="e.g. United States, India, Remote"
                              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-[#17271F] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#4A5E52] mb-1">
                              Buying Signal / Trigger
                            </label>
                            <input
                              type="text"
                              value={buyingIntent}
                              onChange={(e) => setBuyingIntent(e.target.value)}
                              placeholder="e.g. Hiring sales reps, recent funding, scaling"
                              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-[#17271F] focus:outline-none"
                            />
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {['Hiring SDRs', 'Recent Funding', 'Product Launch'].map((sig) => (
                                <button
                                  key={sig}
                                  type="button"
                                  onClick={() => handleAppendSignal(sig)}
                                  className="text-[10px] bg-[#FAF7F0] hover:bg-[#D8FF65] text-[#17271F] border border-[#17271F]/40 px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  + {sig}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#4A5E52] mb-1">
                              Exclusions
                            </label>
                            <input
                              type="text"
                              value={exclusions}
                              onChange={(e) => setExclusions(e.target.value)}
                              placeholder="e.g. Agencies, consultancies, retail"
                              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-[#17271F] focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Search Depth Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-[#E2D9C8]">
                      <div>
                        <span className="text-xs font-bold text-[#17271F]">Prospects to find:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMaxProspects(2)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                            maxProspects === 2
                              ? 'bg-[#17271F] text-[#D8FF65] border-2 border-[#17271F] shadow-[2px_2px_0px_#FF7054]'
                              : 'bg-[#FAF7F0] text-[#17271F] border border-[#17271F]/40 hover:bg-[#E2D9C8]'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 text-[#FF7054]" />
                          <span>⚡ Fast (2 leads · ~5s)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMaxProspects(3)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                            maxProspects === 3
                              ? 'bg-[#17271F] text-[#D8FF65] border-2 border-[#17271F] shadow-[2px_2px_0px_#FF7054]'
                              : 'bg-[#FAF7F0] text-[#17271F] border border-[#17271F]/40 hover:bg-[#E2D9C8]'
                          }`}
                        >
                          <Search className="w-3.5 h-3.5 text-[#9DE3D0]" />
                          <span>🔍 Deep (3 leads · ~10s)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Previous Error Notice if search failed */}
                  {searchError && (
                    <div className="p-3.5 rounded-xl bg-[#FFEAE5] border border-[#FF7054] text-xs text-[#17271F] flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-[#FF7054] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#FF7054]">Search could not be completed: </span>
                        <p className="mt-0.5 text-xs leading-relaxed">{searchError}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LIVELY REAL-TIME SEARCHING PROGRESS VIEW */}
              {isSearching && (
                <div className="py-8 px-5 text-center space-y-5 bg-white border-2 border-[#17271F] rounded-2xl shadow-[4px_4px_0px_#17271F]">
                  <ScoutMascot expression="thinking" size="xl" animate={true} />
                  
                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17271F] text-[#9DE3D0] text-xs font-mono font-bold animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D8FF65]" />
                      <span>Searching the Live Web</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-editorial font-bold text-[#17271F]">
                      Finding matching companies...
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-[#4A5E52]">
                      Reading public sources, checking fit, and verifying evidence.
                    </p>
                  </div>

                  {/* Animated Progress Bar & Seconds Timer */}
                  <div className="max-w-md mx-auto space-y-2">
                    <div className="w-full bg-[#E2D9C8] h-2.5 rounded-full overflow-hidden border border-[#17271F]">
                      <div 
                        className="bg-[#FF7054] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${getSearchProgress(searchElapsedSeconds, searchStepIndex)}%` }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[#4A5E52] gap-1">
                      <span className="flex items-center gap-1 font-bold text-[#17271F]">
                        <Clock className="w-3.5 h-3.5 text-[#FF7054]" />
                        <span>Elapsed: {searchElapsedSeconds}s</span>
                      </span>
                      <span>
                        Estimated total: <strong className="text-[#17271F]">{timingInfo.label}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Step-by-Step Status Checklist */}
                  <div className="max-w-md mx-auto pt-1 space-y-1.5 text-left text-xs font-mono">
                    {honestSearchSteps.map((step, idx) => {
                      const isCurrent = idx === searchStepIndex;
                      const isDone = idx < searchStepIndex;
                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border transition-all flex items-center justify-between ${
                            isCurrent
                              ? 'bg-[#D8FF65]/30 border-[#17271F] text-[#17271F] font-bold shadow-xs'
                              : isDone
                              ? 'bg-[#9DE3D0]/20 border-[#9DE3D0] text-[#17271F]'
                              : 'border-transparent text-[#4A5E52]/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              isCurrent ? 'bg-[#FF7054] animate-ping' : isDone ? 'bg-[#9DE3D0]' : 'bg-[#E2D9C8]'
                            }`} />
                            <span>{step.label}</span>
                          </div>
                          {isDone && <Check className="w-3.5 h-3.5 text-green-700" />}
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
                          {result.mode === 'live' ? 'Live Web' : 'Demo'}
                        </span>
                        <span className="text-xs font-semibold text-[#4A5E52] font-mono">
                          {completedElapsedSeconds !== null && (
                            <span className="text-[#17271F] font-bold">{completedElapsedSeconds}s • </span>
                          )}
                          {result.totalSourcesFound} sources • {result.candidatesSaved} matching leads
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-editorial font-bold text-[#17271F] mt-1">
                        {result.candidatesSaved > 0 
                          ? `Found ${result.candidatesSaved} Potential Customers`
                          : 'No Matching Companies Found'}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4A5E52] mt-0.5">
                        {result.candidatesSaved > 0
                          ? 'Verified with public web evidence. Ready to review and add to pipeline.'
                          : 'Try broadening your description or removing location/role constraints.'}
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
                          Try typing broader customer requirements or select one of the suggested archetypes.
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
                                    <h4 className="text-base sm:text-lg font-editorial font-bold text-[#17271F]">
                                      {candidate.companyName}
                                    </h4>
                                    <span className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] text-[10px]">
                                      {candidate.fitLevel}
                                    </span>
                                    <span className="sticker-badge bg-[#9DE3D0] text-[#17271F] border-[#17271F] text-[10px] font-mono">
                                      {candidate.provenance === 'researched' ? 'Verified Live Web' : 'Demo Record'}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-[#4A5E52] mt-1 line-clamp-2">
                                    {candidate.summary}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleAddToPipeline(candidate)}
                                  disabled={isAdded}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isAdded
                                      ? 'bg-green-100 text-green-800 border border-green-600'
                                      : 'btn-tactile-coral shadow-[2px_2px_0px_#17271F]'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>In Pipeline</span>
                                    </>
                                  ) : (
                                    <>
                                      <Kanban className="w-3.5 h-3.5" />
                                      <span>Add to Pipeline</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => {
                                    onClose();
                                    onSelectProspect(candidate);
                                  }}
                                  className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <span>View Dossier</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Verified Facts Preview */}
                            {candidate.observedFacts && candidate.observedFacts.length > 0 && (
                              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#17271F]/20 space-y-1 text-xs">
                                <div className="text-[10px] font-mono uppercase font-bold text-[#FF7054] flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <span>Verified Facts ({candidate.observedFacts.length}):</span>
                                </div>
                                <ul className="space-y-1 text-[#17271F]">
                                  {candidate.observedFacts.slice(0, 2).map((fact, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5 text-xs">
                                      <span className="text-green-600 font-bold shrink-0">✓</span>
                                      <span className="line-clamp-2">{fact.fact}</span>
                                      {fact.sourceUrl && (
                                        <a
                                          href={fact.sourceUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[#FF7054] hover:underline shrink-0 flex items-center ml-1"
                                          title={fact.sourceUrl}
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    </li>
                                  ))}
                                </ul>
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

          {/* TAB 2: STEP-BY-STEP DEMO WALKTHROUGH */}
          {activeTab === 'demo' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF7054]">
                  Interactive Tour
                </span>
                <h3 className="text-xl sm:text-2xl font-editorial font-bold text-[#17271F]">
                  How Scout Finds Customers
                </h3>
                <p className="text-xs sm:text-sm text-[#4A5E52]">
                  A 4-step walkthrough of Scout's evidence-grounded research pipeline.
                </p>
              </div>

              {/* Interactive Simulator Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#17271F]/20 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className={`w-2.5 h-2.5 rounded-full ${isDemoRunning ? 'bg-[#9DE3D0] animate-pulse' : 'bg-[#E2D9C8]'}`} />
                  <span className="text-[#17271F] font-semibold">
                    {isDemoRunning 
                      ? `Stage ${demoStep + 1} of ${demoSteps.length} · Auto-advancing in ~${demoCountdown}s`
                      : demoStep === demoSteps.length - 1
                      ? `Stage ${demoStep + 1} of ${demoSteps.length} · Complete`
                      : `Stage ${demoStep + 1} of ${demoSteps.length} · Paused`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (demoStep === demoSteps.length - 1) {
                        setDemoStep(0);
                        setIsDemoRunning(true);
                      } else {
                        setIsDemoRunning(!isDemoRunning);
                      }
                    }}
                    className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {isDemoRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[#FF7054]" />
                        <span>Pause</span>
                      </>
                    ) : demoStep === demoSteps.length - 1 ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-[#17271F]" />
                        <span>Replay</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-green-700" />
                        <span>Play Tour</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress step indicators (responsive 2-col on small mobile, 4-col on tablet+) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {demoSteps.map((step, idx) => {
                  const isCurrent = idx === demoStep;
                  const isDone = idx < demoStep;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setDemoStep(idx);
                        setIsDemoRunning(false);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#17271F] text-[#F7F2E8] border-[#17271F] shadow-[3px_3px_0px_#D8FF65]'
                          : isDone
                          ? 'bg-[#FAF7F0] text-[#17271F] border-[#17271F]/40'
                          : 'bg-white/40 text-[#4A5E52]/60 border-[#E2D9C8]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                        <span>STAGE 0{idx + 1}</span>
                        {isDone && <Check className="w-3 h-3 text-[#D8FF65]" />}
                      </div>
                      <div className="text-xs font-bold truncate">
                        {step.title.split('. ')[1]}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Content Card */}
              <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0px_#17271F] space-y-3.5">
                <div className="flex items-start justify-between gap-4 border-b border-[#E2D9C8] pb-3.5">
                  <div>
                    <span className="sticker-badge bg-[#D8FF65] text-[#17271F] border-[#17271F] text-[10px]">
                      {currentDemo.badge}
                    </span>
                    <h4 className="text-lg sm:text-xl font-editorial font-bold text-[#17271F] mt-1.5">
                      {currentDemo.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#4A5E52] mt-0.5">
                      {currentDemo.subtitle}
                    </p>
                  </div>

                  <ScoutMascot expression={currentDemo.expression} size="lg" animate={true} />
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#17271F]">
                    Verified Clues:
                  </div>
                  <div className="space-y-2">
                    {currentDemo.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#FAF7F0] rounded-xl border border-[#17271F]/20 text-xs sm:text-sm text-[#17271F] flex items-start gap-2"
                      >
                        <span className="font-bold text-[#FF7054] mt-0.5">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-[#F7F2E8] border-t border-[#17271F]/20 shrink-0">
          <div className="text-xs text-[#4A5E52]">
            {activeTab === 'live' ? (
              <span>Grounded in public web evidence. You approve every message.</span>
            ) : (
              <span>Step {demoStep + 1} of {demoSteps.length}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {activeTab === 'live' ? (
              result ? (
                <>
                  <button
                    onClick={() => {
                      setResult(null);
                      setSearchError(null);
                    }}
                    className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Search Again
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToTab) onNavigateToTab('pipeline');
                    }}
                    className="btn-tactile-coral px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#17271F]"
                  >
                    <Kanban className="w-4 h-4" />
                    <span>Open in Pipeline →</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToTab) onNavigateToTab('prospects');
                    }}
                    className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View All Leads</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleStartScouting()}
                  disabled={isSearching}
                  className="btn-tactile-coral px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#17271F]"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Searching Live Web ({searchElapsedSeconds}s)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D8FF65]" />
                      <span>Find Potential Customers</span>
                      <ArrowRight className="w-4 h-4" />
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
                  className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onSelectProspect(targetProspect);
                  }}
                  className="btn-tactile-coral px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#17271F]"
                >
                  <Sparkles className="w-4 h-4 text-[#D8FF65]" /> View Sample Prospect
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
