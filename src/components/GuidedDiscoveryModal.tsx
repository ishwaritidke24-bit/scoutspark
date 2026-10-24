import React, { useState, useEffect } from 'react';
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
  Clock
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
    title: 'Early-Stage B2B SaaS',
    category: 'Sales & Growth',
    badge: '⚡ Fastest Match (~5s)',
    iconType: 'rocket',
    description: "Early-stage B2B SaaS companies in India and the US with 10-50 employees that are actively hiring sales development representatives or account executives to scale pipeline.",
    industry: 'B2B SaaS, Cloud Software',
    targetRoles: 'Founder, VP of Sales, Head of Growth',
    buyingIntent: 'Hiring SDRs, expansion into new markets, recent seed funding',
    location: 'United States, India, Remote',
    exclusions: 'Agencies, IT consultancies, retail stores'
  },
  {
    id: 'devtools',
    title: 'Developer Tools & DevOps',
    category: 'Infrastructure',
    badge: '🛠️ High Evidence',
    iconType: 'terminal',
    description: "Modern developer tooling and cloud infrastructure startups with engineering teams building or scaling Kubernetes, observability, CI/CD, or distributed telemetry.",
    industry: 'Developer Tools, DevOps, Cloud Infrastructure',
    targetRoles: 'VP of Engineering, CTO, Platform Lead',
    buyingIntent: 'Kubernetes scaling, distributed systems complexity, hiring senior engineers',
    location: 'United States, Europe, Remote',
    exclusions: 'Consulting agencies, software outsourcing shops'
  },
  {
    id: 'ai-startups',
    title: 'AI & Agentic Startups',
    category: 'GenAI & Agents',
    badge: '🤖 Trending',
    iconType: 'bot',
    description: "Fast-moving AI startups building autonomous agents, LLM applications, or automated workflows seeking prospective enterprise pilot customers and design partners.",
    industry: 'Artificial Intelligence, Generative AI, B2B SaaS',
    targetRoles: 'CEO, Head of AI, Lead Product Manager',
    buyingIntent: 'Product launch, enterprise pilot acquisition, model inference scaling',
    location: 'United States, India, Global Remote',
    exclusions: 'Consumer games, crypto tokens, design agencies'
  },
  {
    id: 'healthtech',
    title: 'HealthTech & Clinical SaaS',
    category: 'Healthcare',
    badge: '🏥 Regulated B2B',
    iconType: 'stethoscope',
    description: "Healthcare technology companies and clinical software providers that need HIPAA-compliant document processing, patient workflow automation, and EHR integrations.",
    industry: 'HealthTech, Healthcare IT, Digital Health',
    targetRoles: 'Head of Operations, CEO, Chief Medical Officer',
    buyingIntent: 'HIPAA compliance, patient record workflow bottlenecks, clinic scaling',
    location: 'United States, Canada',
    exclusions: 'Physical dental clinics, local pharmacies, hospitals'
  },
  {
    id: 'fintech',
    title: 'FinTech & Modern Payments',
    category: 'Financial Services',
    badge: '💳 High Value',
    iconType: 'creditCard',
    description: "FinTech and payments platforms handling transaction volume, risk compliance, KYC automation, or automated billing systems seeking growth tools.",
    industry: 'FinTech, Payments, Banking Software',
    targetRoles: 'Head of Product, VP of Risk & Compliance, Founder',
    buyingIntent: 'Transaction scaling, fraud detection, international payout compliance',
    location: 'United States, United Kingdom, India',
    exclusions: 'Traditional retail banks, local credit unions, payday lenders'
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Cloud Defense',
    category: 'Security',
    badge: '🔒 Enterprise',
    iconType: 'shield',
    description: "Cloud security startups providing automated SOC2/ISO compliance, vulnerability scanning, or zero-trust identity management for tech companies.",
    industry: 'Cybersecurity, Cloud Compliance, Infosec',
    targetRoles: 'CISO, VP of Information Security, VP of IT',
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
  const [searchError, setSearchError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResultState | null>(null);
  const [addedLeadIds, setAddedLeadIds] = useState<Set<string>>(new Set());

  // Demo Walkthrough States
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const targetProspect = prospects.find(p => p.id === 'prospect-01') || prospects[0];

  const honestSearchSteps = [
    { label: "1. Analyzing customer criteria & planning search...", icon: "target" },
    { label: "2. Searching live web in parallel via Tavily...", icon: "search" },
    { label: "3. Reading company pages & extracting verified facts...", icon: "globe" },
    { label: "4. Grounding citations & drafting personalized emails...", icon: "shield" }
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

  // Live searching stopwatch and progress step timer
  useEffect(() => {
    let secondTimer: ReturnType<typeof setInterval>;
    let stepTimer: ReturnType<typeof setInterval>;

    if (isSearching) {
      setSearchElapsedSeconds(0);
      setSearchStepIndex(0);

      secondTimer = setInterval(() => {
        setSearchElapsedSeconds(prev => prev + 1);
      }, 1000);

      stepTimer = setInterval(() => {
        setSearchStepIndex(prev => (prev < 3 ? prev + 1 : prev));
      }, 1800);
    }

    return () => {
      clearInterval(secondTimer);
      clearInterval(stepTimer);
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
      setValidationError("Please type your client or ideal customer in the space box before we search.");
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
    try {
      if (icp) {
        const updatedICP: IdealCustomerProfile = {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#17271F]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[94vh] bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl shadow-[6px_6px_0px_#17271F] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#17271F] text-[#F7F2E8] shrink-0">
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
                    {config.configured ? `⚡ Fast Parallel Search (${config.model})` : 'Offline Simulation'}
                  </span>
                )}
              </div>
              <h2 id="modal-title" className="text-base font-editorial font-bold text-white tracking-tight">
                {activeTab === 'live' ? 'Find Your Client & Ideal Customer' : 'See How Scout Finds Leads'}
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
                  ? 'bg-[#17271F] text-[#F7F2E8] shadow-[2px_2px_0px_#FF7054]'
                  : 'text-[#4A5E52] hover:text-[#17271F] hover:bg-white/60'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#FF7054]" />
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

          <div className="text-[11px] font-mono font-semibold flex items-center gap-2">
            {configLoading ? (
              <span className="text-[#4A5E52]">Checking providers...</span>
            ) : config?.configured ? (
              <span className="text-[#17271F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#9DE3D0] animate-pulse" />
                <span>Ready to Search</span>
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
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
                  {/* Title & Introduction */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-editorial font-bold text-[#17271F]">
                        Who are your clients or ideal customers?
                      </h3>
                      <p className="text-xs text-[#4A5E52] mt-0.5 leading-relaxed">
                        Type in the space box below, pick from the dropdown menu, or select any of the suggestion boxes.
                      </p>
                    </div>

                    {/* Speed Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D8FF65]/30 border border-[#17271F] text-[11px] font-mono font-bold text-[#17271F] w-fit">
                      <Zap className="w-3.5 h-3.5 text-[#FF7054]" />
                      <span>Speed: Parallel Web Queries (~5s)</span>
                    </div>
                  </div>

                  {/* 1. DROPDOWN MENU SUGGESTIONS */}
                  <div className="bg-white border-2 border-[#17271F] rounded-xl p-3.5 shadow-[2px_2px_0px_#17271F] space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#17271F] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#FF7054]" />
                        <span>Suggest in Dropdown Menu:</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#4A5E52] lowercase font-normal">
                        Select to auto-fill all boxes
                      </span>
                    </label>

                    <select
                      value={selectedArchetypeId}
                      onChange={(e) => handleApplyArchetype(e.target.value)}
                      className="w-full bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-lg px-3 py-2 text-xs font-semibold text-[#17271F] focus:outline-none focus:ring-2 focus:ring-[#D8FF65] cursor-pointer"
                    >
                      <option value="">-- Choose a pre-built customer profile (or type in the box below) --</option>
                      {CUSTOMER_ARCHETYPES.map((arch) => (
                        <option key={arch.id} value={arch.id}>
                          {arch.title} — {arch.category} ({arch.targetRoles})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. SUGGESTION BOXES (CLICKABLE CARDS) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#4A5E52]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF7054]" />
                        <span>Or click a Suggestion Box:</span>
                      </span>
                      <span className="font-mono text-[10px] font-normal lowercase">
                        1-click instant fill
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {CUSTOMER_ARCHETYPES.map((arch) => {
                        const isSelected = selectedArchetypeId === arch.id;
                        return (
                          <button
                            key={arch.id}
                            type="button"
                            onClick={() => handleApplyArchetype(arch.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-[#D8FF65]/30 border-[#17271F] shadow-[3px_3px_0px_#17271F]'
                                : 'bg-white border-[#17271F]/40 hover:border-[#17271F] hover:bg-[#FAF7F0] shadow-[1px_1px_0px_#17271F]'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-center gap-2">
                                  {renderArchetypeIcon(arch.iconType)}
                                  <span className="font-bold text-xs text-[#17271F] leading-tight">
                                    {arch.title}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FAF7F0] border border-[#17271F]/40 shrink-0 text-[#17271F]">
                                  {arch.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#4A5E52] line-clamp-2 leading-relaxed">
                                {arch.description}
                              </p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-[#17271F]/15 flex items-center justify-between text-[10px]">
                              <span className="font-mono text-[#17271F] font-semibold truncate max-w-[170px]">
                                👤 {arch.targetRoles}
                              </span>
                              <span className="text-[#FF7054] font-bold shrink-0">
                                {isSelected ? '✓ Selected' : 'Select →'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. DEDICATED SPACE BOX FOR USER'S CLIENT / IDEAL CUSTOMER */}
                  <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 shadow-[4px_4px_0px_#17271F] space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#17271F] flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#17271F] text-[#D8FF65] font-mono text-[10px]">
                            SPACE BOX
                          </span>
                          <span>Type Your Client / Ideal Customer:</span>
                          <span className="text-[#FF7054] font-mono">* Required</span>
                        </label>

                        {customerDescription && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerDescription('');
                              setSelectedArchetypeId('');
                            }}
                            className="text-[11px] text-[#FF7054] hover:underline flex items-center gap-1 cursor-pointer"
                            title="Clear space box"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Clear box</span>
                          </button>
                        )}
                      </div>

                      {/* Generous Space Textarea */}
                      <textarea
                        rows={4}
                        value={customerDescription}
                        onChange={(e) => {
                          setCustomerDescription(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="Type your client or ideal customer in plain English... e.g. Early-stage B2B SaaS companies in India and the US with 10-50 employees that are hiring sales development representatives or account executives to scale pipeline."
                        className={`w-full bg-[#FAF7F0] border-2 rounded-xl p-3.5 text-xs text-[#17271F] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D8FF65] transition-all ${
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

                    {/* Quick Space Parameter Boxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#E2D9C8]">
                      <div>
                        <label className="block text-[11px] font-bold text-[#17271F] mb-1">
                          Target Client / Specific Company (Optional)
                        </label>
                        <input
                          type="text"
                          value={clientNameOrTarget}
                          onChange={(e) => setClientNameOrTarget(e.target.value)}
                          placeholder="e.g. Stripe, Postman, or 'Seed stage tech startups'"
                          className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-3 py-2 text-xs text-[#17271F] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#17271F] mb-1">
                          Target Roles (Job Titles)
                        </label>
                        <input
                          type="text"
                          value={targetRoles}
                          onChange={(e) => setTargetRoles(e.target.value)}
                          placeholder="e.g. Founder, VP of Sales, CTO, Head of Growth"
                          className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-3 py-2 text-xs text-[#17271F] focus:outline-none"
                        />
                        {/* Quick Role Tags */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {['Founder / CEO', 'VP of Sales', 'CTO', 'Head of Growth'].map((role) => (
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
                    </div>

                    {/* Collapsible Refinements Accordion */}
                    <div className="pt-2 border-t border-[#E2D9C8]">
                      <button
                        type="button"
                        onClick={() => setShowRefinements(!showRefinements)}
                        className="text-xs font-semibold text-[#17271F] hover:text-[#FF7054] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#FF7054]" />
                        <span>{showRefinements ? "Hide Refinements (Industry, Location, Exclusions)" : "+ Add More Refinements (Industry, Location, Exclusions)"}</span>
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
                            <label className="block text-[11px] font-bold text-[#4A5E52] mb-1">
                              Target Geography / Location
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
                              Buying-Intent Signal or Trigger
                            </label>
                            <input
                              type="text"
                              value={buyingIntent}
                              onChange={(e) => setBuyingIntent(e.target.value)}
                              placeholder="e.g. Hiring engineers, migrating cloud, recent funding"
                              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs text-[#17271F] focus:outline-none"
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

                    {/* Fast Search Speed Control */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-[#E2D9C8]">
                      <div>
                        <span className="text-xs font-bold text-[#17271F]">Discovery Speed: </span>
                        <span className="text-[11px] text-[#4A5E52]">Fast scan returns top matches in seconds</span>
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
                          <span>⚡ Fast (2 leads, ~5s)</span>
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
                          <span>🔍 Deep (3 leads, ~10s)</span>
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
                        <p className="mt-0.5 text-[11px] leading-relaxed">{searchError}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LIVELY REAL-TIME SEARCHING PROGRESS VIEW */}
              {isSearching && (
                <div className="py-8 px-5 text-center space-y-6 bg-white border-2 border-[#17271F] rounded-2xl shadow-[5px_5px_0px_#17271F]">
                  <ScoutMascot expression="thinking" size="xl" animate={true} />
                  
                  <div className="space-y-2 max-w-lg mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17271F] text-[#9DE3D0] text-xs font-mono font-bold animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D8FF65]" />
                      <span>Parallel Live Web Discovery in Progress</span>
                    </div>

                    <h3 className="text-xl font-editorial font-bold text-[#17271F]">
                      Searching Public Web & Scoring Candidates...
                    </h3>
                    
                    <p className="text-xs text-[#4A5E52] leading-relaxed">
                      Executing parallel web searches via Tavily, reading company articles, and scoring matches against your criteria.
                    </p>
                  </div>

                  {/* Animated Progress Bar & Seconds Timer */}
                  <div className="max-w-md mx-auto space-y-2">
                    <div className="w-full bg-[#E2D9C8] h-2.5 rounded-full overflow-hidden border border-[#17271F]">
                      <div 
                        className="bg-[#FF7054] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(95, (searchStepIndex + 1) * 24 + searchElapsedSeconds * 6)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#4A5E52]">
                      <span className="flex items-center gap-1 font-bold text-[#17271F]">
                        <Clock className="w-3 h-3 text-[#FF7054]" />
                        <span>Elapsed: {searchElapsedSeconds}s</span>
                      </span>
                      <span>Estimated total: ~5-8s</span>
                    </div>
                  </div>

                  {/* Step-by-Step Status Checklist */}
                  <div className="max-w-md mx-auto pt-1 space-y-2 text-left text-xs font-mono">
                    {honestSearchSteps.map((step, idx) => {
                      const isCurrent = idx === searchStepIndex;
                      const isDone = idx < searchStepIndex;
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                            isCurrent
                              ? 'bg-[#D8FF65]/30 border-[#17271F] text-[#17271F] font-bold shadow-xs'
                              : isDone
                              ? 'bg-[#9DE3D0]/20 border-[#9DE3D0] text-[#17271F]'
                              : 'border-transparent text-[#4A5E52]/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
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
                          Try typing broader customer requirements in the space box or select one of the suggested archetypes.
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
                                      {candidate.provenance === 'researched' ? 'Verified Live Web' : 'Demo Record'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#4A5E52] mt-0.5 line-clamp-2">
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
                                  <span>Open Dossier</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Verified Facts Preview */}
                            {candidate.observedFacts && candidate.observedFacts.length > 0 && (
                              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#17271F]/20 space-y-1.5 text-xs">
                                <div className="text-[10px] font-mono uppercase font-bold text-[#FF7054] flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <span>Verified Evidence ({candidate.observedFacts.length} Clues):</span>
                                </div>
                                <ul className="space-y-1 text-[#17271F]">
                                  {candidate.observedFacts.slice(0, 2).map((fact, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5 text-[11px]">
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
                                          <ExternalLink className="w-2.5 h-2.5" />
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
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF7054]">
                  Interactive Walkthrough
                </span>
                <h3 className="text-2xl font-editorial font-bold text-[#17271F]">
                  How Scout Finds Qualified Companies
                </h3>
                <p className="text-xs text-[#4A5E52] leading-relaxed">
                  See the exact 4-stage reasoning pipeline ScoutSpark uses to gather clues, verify facts, calculate match scores, and draft human-approved messages.
                </p>
              </div>

              {/* Progress step indicators */}
              <div className="grid grid-cols-4 gap-2">
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
              <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-[#E2D9C8] pb-4">
                  <div>
                    <span className="sticker-badge bg-[#D8FF65] text-[#17271F] border-[#17271F] text-[10px]">
                      {currentDemo.badge}
                    </span>
                    <h4 className="text-xl font-editorial font-bold text-[#17271F] mt-1.5">
                      {currentDemo.title}
                    </h4>
                    <p className="text-xs text-[#4A5E52]">
                      {currentDemo.subtitle}
                    </p>
                  </div>

                  <ScoutMascot expression={currentDemo.expression} size="lg" animate={true} />
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#17271F]">
                    Audited Details & Evidence:
                  </div>
                  <div className="space-y-2">
                    {currentDemo.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#FAF7F0] rounded-xl border border-[#17271F]/20 text-xs text-[#17271F] flex items-start gap-2"
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
        <div className="flex items-center justify-between px-6 py-4 bg-[#F7F2E8] border-t border-[#17271F]/20 shrink-0">
          <div className="text-xs text-[#4A5E52]">
            {activeTab === 'live' ? (
              <span>Human-in-the-loop: Every message requires your explicit review.</span>
            ) : (
              <span>Step {demoStep + 1} of {demoSteps.length}</span>
            )}
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
                    className="btn-tactile-secondary px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
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
                      <span>Searching Live Web ({searchElapsedSeconds}s)...</span>
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
