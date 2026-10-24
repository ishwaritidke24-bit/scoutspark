import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ViewTab, Prospect, IdealCustomerProfile } from '../types';
import { ScoutMascot, ScoutExpression } from './ScoutMascot';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  Minimize2, 
  Maximize2,
  CheckCircle2,
  Send,
  Volume2,
  VolumeX,
  Compass,
  CornerDownRight,
  RefreshCw,
  Move,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type CompanionPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'banner-side';

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

interface ChatMessage {
  id: string;
  sender: 'scout' | 'user';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  suggestedReplies?: string[];
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
  // UI & Mode States
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeTab, setActivePanelTab] = useState<'chat' | 'page-guide'>('chat');
  
  // Position & Roaming State
  const [companionPos, setCompanionPos] = useState<CompanionPosition>('bottom-right');
  const [isAutoRoamEnabled, setIsAutoRoamEnabled] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Expression & Speech States
  const [expression, setExpression] = useState<ScoutExpression>('idle');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(true);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState<boolean>(false);

  // Conversation State
  const [chatInput, setChatInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Route tracking
  const [prevTab, setPrevTab] = useState<ViewTab>(currentTab);

  // Computed data summaries
  const readyLeads = prospects.filter(p => p.pipelineStage === 'ready_to_review');
  const approvedLeads = prospects.filter(p => p.pipelineStage === 'approved');
  const topScoredProspect = useMemo(() => {
    if (!prospects.length) return null;
    return [...prospects].sort((a, b) => b.fitScore - a.fitScore)[0];
  }, [prospects]);

  // Check speech synthesis availability
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSpeechAvailable(true);
    }
  }, []);

  // Voice speech synthesis helper
  const speakText = (text: string) => {
    if (!isSpeechAvailable || isVoiceMuted || typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      // Remove URLs, markdown, and emojis for cleaner speech
      const cleanText = text.replace(/[*_#`~[\]]/g, '').replace(/https?:\/\/\S+/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = 1.15;
      utterance.rate = 1.05;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setExpression('talking');
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setExpression('idle');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setExpression('idle');
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (isSpeechAvailable && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Initial greeting messages based on page
  const initialMessages: ChatMessage[] = useMemo(() => {
    const defaultGreeting = readyLeads.length > 0 
      ? `Hey, scout! ⭐ I'm ScoutStar. You currently have ${readyLeads.length} leads in your workspace ready for review, including ${readyLeads[0].companyName}. What would you like to explore?`
      : `Hey there! ⭐ I'm ScoutStar, your B2B sales intelligence companion. I can guide you through discovering leads, calibrating your target customer, or drafting grounded outreach. What can I help you with today?`;

    return [
      {
        id: 'welcome-1',
        sender: 'scout',
        text: defaultGreeting,
        timestamp: 'Just now',
        suggestedReplies: [
          'What is ScoutSpark?',
          'What should I do first?',
          'Show me my top leads',
          'Take 60-Sec Tour'
        ]
      }
    ];
  }, [readyLeads]);

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isPanelOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isPanelOpen]);

  // Adjust position when lead inspection drawer opens or closes
  useEffect(() => {
    if (isDrawerOpen) {
      // If right-side drawer is open, automatically move to bottom-left to prevent covering content
      setCompanionPos('bottom-left');
    }
  }, [isDrawerOpen]);

  // Handle route change: roam to banner side to introduce the page, wave, and speak
  useEffect(() => {
    if (currentTab !== prevTab) {
      setPrevTab(currentTab);

      // Check user reduced motion preference
      const prefersReducedMotion = typeof window !== 'undefined' 
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReducedMotion && isAutoRoamEnabled && !isDrawerOpen) {
        // Roam near the top banner
        setCompanionPos('top-right');
        setExpression('waving');

        // After 4.5 seconds, glide down to comfortable resting corner
        const timer = setTimeout(() => {
          setCompanionPos('bottom-right');
          setExpression('idle');
        }, 4500);

        return () => clearTimeout(timer);
      }
    }
  }, [currentTab, prevTab, isAutoRoamEnabled, isDrawerOpen]);

  // Quick replies generator based on current page
  const getContextSuggestedReplies = (): string[] => {
    switch (currentTab) {
      case 'dashboard':
        return [
          'What is ScoutSpark?',
          'What should I do first?',
          'Show me my top leads',
          'Take 60-Sec Tour'
        ];
      case 'settings':
        return [
          'How does ICP scoring work?',
          'What are negative exclusions?',
          'Find Matching Leads',
          'What should I set here?'
        ];
      case 'prospects':
        return [
          'How do I find 75%+ score leads?',
          'Can I import my own CSV?',
          'How does web verification work?',
          'Start Guided Discovery'
        ];
      case 'pipeline':
        return [
          'What are the 8 pipeline stages?',
          'How do I move leads forward?',
          'View Approved Messages',
          'Is there automatic sending?'
        ];
      case 'campaigns':
        return [
          'What is Touch 2 Benchmark?',
          'How are public facts cited?',
          'How do I copy these drafts?',
          'Return to Pipeline'
        ];
      case 'eval-lab':
        return [
          'Explain the 12 automated tests',
          'What is citation grounding?',
          'Who built ScoutSpark?',
          'Back to Workspace'
        ];
      default:
        return ['What should I do next?', 'Explain this page', 'Take 60-Sec Tour'];
    }
  };

  // Conversational response engine based on real application knowledge
  const generateScoutResponse = (userQuestion: string): ChatMessage => {
    const q = userQuestion.toLowerCase().trim();
    const timeStr = 'Just now';

    // 1. Creator attribution
    if (q.includes('creator') || q.includes('who built') || q.includes('who made') || q.includes('ishwari')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `ScoutSpark was designed and built by Ishwari Tidke! ⭐ It was engineered with tactile editorial design, real public web citations, and strict human-in-the-loop approvals.`,
        timestamp: timeStr,
        suggestedReplies: ['What is ScoutSpark?', 'What should I do first?']
      };
    }

    // 2. What is ScoutSpark / Overview
    if (q.includes('what is scoutspark') || q.includes('what does scoutspark do') || q.includes('purpose') || q.includes('about')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `ScoutSpark is reason-driven B2B lead intelligence! Instead of scraping stale, spammy contact lists, ScoutSpark finds qualified companies backed by verifiable public evidence (news, jobs, tech stack) and writes grounded, multi-touch email sequences you review before sending.`,
        timestamp: timeStr,
        action: {
          label: 'Take 60-Sec Tour',
          onClick: () => {
            setIsPanelOpen(false);
            onOpenTour();
          }
        },
        suggestedReplies: ['How does scoring work?', 'What should I do first?']
      };
    }

    // 3. What to do first / What's next
    if (q.includes('what should i do') || q.includes('first') || q.includes('next') || q.includes('where to start')) {
      if (readyLeads.length > 0 && onSelectProspect) {
        return {
          id: String(Date.now()),
          sender: 'scout',
          text: `You have ${readyLeads.length} leads in 'Ready to Review' state! I recommend reviewing ${readyLeads[0].companyName} (Score: ${readyLeads[0].fitScore}/100) and advancing it to your pipeline.`,
          timestamp: timeStr,
          action: {
            label: `Review ${readyLeads[0].companyName}`,
            onClick: () => {
              onSelectProspect(readyLeads[0]);
              setIsPanelOpen(false);
            }
          },
          suggestedReplies: ['How does scoring work?', 'Show me my top leads']
        };
      } else {
        return {
          id: String(Date.now()),
          sender: 'scout',
          text: `Here's the best workflow: 1. Calibrate your Target Customer (ICP). 2. Run Guided Discovery to find verified matches. 3. Review candidate dossiers and draft personalized messages!`,
          timestamp: timeStr,
          action: {
            label: 'Start Guided Discovery',
            onClick: () => {
              setIsPanelOpen(false);
              onOpenDiscovery();
            }
          },
          suggestedReplies: ['Take me to Target Customer', 'Show me my top leads']
        };
      }
    }

    // 4. Target Customer / ICP
    if (q.includes('target customer') || q.includes('icp') || q.includes('profile') || q.includes('exclusion')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `Your Target Customer profile anchors every search. You define target industries, decision maker titles (e.g. CTO, VP of Eng), company headcounts, and negative exclusion keywords so bad fits are disqualified automatically.`,
        timestamp: timeStr,
        action: {
          label: 'Calibrate Target Customer',
          onClick: () => {
            onNavigateToTab('settings');
            setIsPanelOpen(false);
          }
        },
        suggestedReplies: ['How does scoring work?', 'Find Matching Leads']
      };
    }

    // 5. Scoring & Grounding
    if (q.includes('score') || q.includes('scoring') || q.includes('grounding') || q.includes('citations') || q.includes('verify')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `Every company gets an ICP Fit Score from 0 to 100 based on role relevance, industry match, and active business signals. Crucially, every claim is backed by real public web links — unproven claims are explicitly tagged so you never send hallucinated statements.`,
        timestamp: timeStr,
        action: {
          label: 'Inspect Accuracy Lab',
          onClick: () => {
            onNavigateToTab('eval-lab');
            setIsPanelOpen(false);
          }
        },
        suggestedReplies: ['Explain the 12 automated tests', 'Show me my top leads']
      };
    }

    // 6. CSV Import
    if (q.includes('csv') || q.includes('import') || q.includes('upload') || q.includes('spreadsheet')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `Yes! On the Find Leads page, click 'Import CSV' to bring in your existing spreadsheets. ScoutSpark will parse company names, websites, and roles, then score them against your Target Customer criteria.`,
        timestamp: timeStr,
        action: {
          label: 'Go to Find Leads',
          onClick: () => {
            onNavigateToTab('prospects');
            setIsPanelOpen(false);
          }
        },
        suggestedReplies: ['How do I find 75%+ score leads?', 'Start Guided Discovery']
      };
    }

    // 7. Pipeline & Moving Leads
    if (q.includes('pipeline') || q.includes('stages') || q.includes('kanban') || q.includes('move')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `The Pipeline is an 8-stage Kanban board: Prospect → Research Completed → Ready to Review → Approved → Sequence Drafted → Sent → Meeting Booked → Closed Won. Use the right-arrow on any card to advance it as conversations progress!`,
        timestamp: timeStr,
        action: {
          label: 'Open Pipeline Board',
          onClick: () => {
            onNavigateToTab('pipeline');
            setIsPanelOpen(false);
          }
        },
        suggestedReplies: ['Is there automatic sending?', 'Show approved messages']
      };
    }

    // 8. Outreach & Sequences
    if (q.includes('sequence') || q.includes('campaign') || q.includes('email') || q.includes('touch') || q.includes('auto-send')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `Outreach uses a 3-touch cadence: Touch 1 is the Hook (pain point), Touch 2 is the Benchmark (peer proof point), and Touch 3 is a Frictionless Sandbox demo. ScoutSpark enforces a Zero-Auto-Send policy: you review, edit, and copy every message into your own email client.`,
        timestamp: timeStr,
        action: {
          label: 'View Message Sequences',
          onClick: () => {
            onNavigateToTab('campaigns');
            setIsPanelOpen(false);
          }
        },
        suggestedReplies: ['Return to Pipeline', 'What is Touch 2 Benchmark?']
      };
    }

    // 9. Accuracy Lab & 12 Tests
    if (q.includes('eval') || q.includes('test') || q.includes('accuracy') || q.includes('hallucination') || q.includes('fixture')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `In the Accuracy Lab, we track our Citation Grounding Engine against 12 automated evaluation test fixtures (EVAL-01 through EVAL-12). It guarantees 100% citation coverage, cross-checks URLs, and protects against AI hallucinations.`,
        timestamp: timeStr,
        action: {
          label: 'Open Accuracy Lab',
          onClick: () => {
            onNavigateToTab('eval-lab');
            setIsPanelOpen(false);
          }
        },
        suggestedReplies: ['Who built ScoutSpark?', 'Back to Workspace']
      };
    }

    // 10. Top Leads / Discovery
    if (q.includes('top lead') || q.includes('highest') || q.includes('qualified') || q.includes('find leads') || q.includes('search')) {
      if (topScoredProspect) {
        return {
          id: String(Date.now()),
          sender: 'scout',
          text: `Your top lead is ${topScoredProspect.companyName} with an ICP score of ${topScoredProspect.fitScore}/100 in ${topScoredProspect.industry}. We have ${topScoredProspect.observedFacts.length} verified web facts on file for them.`,
          timestamp: timeStr,
          action: {
            label: `Inspect ${topScoredProspect.companyName}`,
            onClick: () => {
              if (onSelectProspect) onSelectProspect(topScoredProspect);
              setIsPanelOpen(false);
            }
          },
          suggestedReplies: ['How do I find 75%+ score leads?', 'What should I do first?']
        };
      } else {
        return {
          id: String(Date.now()),
          sender: 'scout',
          text: `You haven't scouted any leads yet! Let's start Guided Discovery or import a CSV to discover your first B2B matches.`,
          timestamp: timeStr,
          action: {
            label: 'Start Guided Discovery',
            onClick: () => {
              setIsPanelOpen(false);
              onOpenDiscovery();
            }
          },
          suggestedReplies: ['What is ScoutSpark?', 'Take 60-Sec Tour']
        };
      }
    }

    // 11. Navigation helpers
    if (q.includes('take me to') || q.includes('go to') || q.includes('open')) {
      if (q.includes('target') || q.includes('settings')) {
        return {
          id: String(Date.now()),
          sender: 'scout',
          text: `Taking you to Target Customer settings...`,
          timestamp: timeStr,
          action: { label: 'Go Now', onClick: () => { onNavigateToTab('settings'); setIsPanelOpen(false); } }
        };
      }
      if (q.includes('lead') || q.includes('prospect')) {
        return {
          id: String(Date.now()),
          sender: 'scout',
          text: `Opening your evaluated lead directory...`,
          timestamp: timeStr,
          action: { label: 'Go Now', onClick: () => { onNavigateToTab('prospects'); setIsPanelOpen(false); } }
        };
      }
      if (q.includes('pipe')) {
        return {
          id: String(Date.now()),
          sender: 'scout',
          text: `Switching to your 8-stage Pipeline...`,
          timestamp: timeStr,
          action: { label: 'Go Now', onClick: () => { onNavigateToTab('pipeline'); setIsPanelOpen(false); } }
        };
      }
      if (q.includes('sequence') || q.includes('outreach')) {
        return {
          id: String(Date.now()),
          sender: 'scout',
          text: `Switching to Message Sequences studio...`,
          timestamp: timeStr,
          action: { label: 'Go Now', onClick: () => { onNavigateToTab('campaigns'); setIsPanelOpen(false); } }
        };
      }
      if (q.includes('test') || q.includes('lab')) {
        return {
          id: String(Date.now()),
          sender: 'scout',
          text: `Switching to Accuracy Lab and Test Suite...`,
          timestamp: timeStr,
          action: { label: 'Go Now', onClick: () => { onNavigateToTab('eval-lab'); setIsPanelOpen(false); } }
        };
      }
    }

    // 12. General fallback response
    return {
      id: String(Date.now()),
      sender: 'scout',
      text: `I'm not fully sure about that specific phrase, but I can help you with Target Customer criteria, lead scoring, pipeline management, or citation grounding. What would you like to check?`,
      timestamp: timeStr,
      suggestedReplies: [
        'What is ScoutSpark?',
        'What should I do first?',
        'Show me my top leads',
        'Take 60-Sec Tour'
      ]
    };
  };

  // Handle sending a message in the chat
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? chatInput).trim();
    if (!text) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsThinking(true);
    setExpression('thinking');

    // Simulate thinking delay (400ms) for natural feel
    setTimeout(() => {
      const response = generateScoutResponse(text);
      setMessages(prev => [...prev, response]);
      setIsThinking(false);
      setExpression('talking');

      // Speak text if voice mode is enabled
      speakText(response.text);

      // Return to idle expression after speaking or 2.5s
      setTimeout(() => {
        if (!isSpeaking) setExpression('idle');
      }, 2500);
    }, 450);
  };

  // Celebration helper for actions
  const triggerCelebration = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.85, x: companionPos.includes('right') ? 0.9 : 0.1 }
    });
    setExpression('celebratory');
    setTimeout(() => setExpression('idle'), 2500);
  };

  // Cycle position manually
  const handleCyclePosition = () => {
    const positions: CompanionPosition[] = ['bottom-right', 'top-right', 'bottom-left'];
    const nextIdx = (positions.indexOf(companionPos) + 1) % positions.length;
    setCompanionPos(positions[nextIdx]);
    setExpression('roaming');
    setTimeout(() => setExpression('idle'), 1200);
  };

  // Position CSS coordinate classes
  const getPositionClasses = (): string => {
    switch (companionPos) {
      case 'top-right':
        return 'top-20 right-5';
      case 'bottom-left':
        return 'bottom-5 left-5';
      case 'banner-side':
        return 'top-28 right-8';
      case 'bottom-right':
      default:
        return 'bottom-5 right-5';
    }
  };

  // Context page guidance details for "Page Guide" tab
  const getPageGuide = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Command Center',
          desc: 'Get an instant pulse on your lead generation health, review incoming web signals, and see the next recommended action.',
          tips: [
            'Inspect the 4-stage interactive journey to understand how raw signals become booked calls.',
            'Review leads in Ready to Review before sending outreach.',
            'Check public news and hiring signals on your monitored accounts.'
          ],
          primaryAction: 'Start Scouting Leads',
          onAction: () => { onOpenDiscovery(); setIsPanelOpen(false); }
        };
      case 'settings':
        return {
          title: 'Target Customer (ICP)',
          desc: 'Teach ScoutSpark exactly who you sell to so our discovery engines score accounts accurately.',
          tips: [
            'Add buyer role titles (e.g. Head of Engineering, VP Security).',
            'Specify target industries and ideal company headcounts.',
            'Include negative exclusion keywords to filter out non-fits automatically.'
          ],
          primaryAction: 'Find Matching Leads',
          onAction: () => { onNavigateToTab('prospects'); setIsPanelOpen(false); }
        };
      case 'prospects':
        return {
          title: 'Find Leads Directory',
          desc: 'Search, filter, and review verified company accounts backed by public web links.',
          tips: [
            'Filter by score 75%+ for highest target customer fit.',
            'Click any company card to inspect its full research dossier and public citations.',
            'Use CSV Import to evaluate an existing spreadsheet of accounts.'
          ],
          primaryAction: 'Start Guided Discovery',
          onAction: () => { onOpenDiscovery(); setIsPanelOpen(false); }
        };
      case 'pipeline':
        return {
          title: 'Pipeline Kanban',
          desc: 'Track sales conversations across 8 clear stages without losing context or deal notes.',
          tips: [
            'Click the arrow button on any lead card to advance it to the next stage.',
            'Log meeting notes directly on the prospect dossier.',
            'Zero auto-send: you approve and copy every email message.'
          ],
          primaryAction: 'View Approved Messages',
          onAction: () => { onNavigateToTab('campaigns'); setIsPanelOpen(false); }
        };
      case 'campaigns':
        return {
          title: 'Message Sequences',
          desc: 'Craft grounded 3-touch outreach sequences citing actual company pain points.',
          tips: [
            'Touch 1 Hook references verified pain points or recent company news.',
            'Touch 2 Benchmark provides relevant peer data to increase credibility.',
            'Use 1-click copy to paste straight into your personal email client.'
          ],
          primaryAction: 'Apply to Pipeline Lead',
          onAction: () => { onNavigateToTab('pipeline'); setIsPanelOpen(false); }
        };
      case 'eval-lab':
        return {
          title: 'Accuracy Lab & Tests',
          desc: 'Verify that every claim and metric is grounded in verifiable evidence, not AI guesses.',
          tips: [
            'All 12 test fixtures (EVAL-01 to EVAL-12) run through backend/tests.',
            'Review citation coverage and zero-hallucination defense mechanisms.',
            'Notice how unproven statements are strictly quarantined.'
          ],
          primaryAction: 'Back to Workspace',
          onAction: () => { onNavigateToTab('dashboard'); setIsPanelOpen(false); }
        };
      default:
        return {
          title: 'ScoutSpark Companion',
          desc: 'Navigate through your workspace and discover your next yes.',
          tips: ['Define target customer', 'Find qualified leads', 'Manage pipeline'],
          primaryAction: 'Start Scouting',
          onAction: () => { onOpenDiscovery(); setIsPanelOpen(false); }
        };
    }
  };

  const pageGuide = getPageGuide();

  return (
    <div 
      className={`fixed ${getPositionClasses()} z-40 select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Minimized Floating Star Button */}
      {isMinimized ? (
        <button
          onClick={() => {
            setIsMinimized(false);
            setIsPanelOpen(true);
            setExpression('waving');
          }}
          className="p-2.5 rounded-full bg-[#17271F] text-[#D8FF65] border-2 border-[#17271F] shadow-[3px_3px_0px_#FF7054] hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
          title="Open ScoutStar Companion & Chat"
          aria-label="Expand ScoutStar guide"
        >
          <ScoutMascot expression="idle" size="xs" animate={true} />
          <span className="text-xs font-editorial font-bold pr-1 text-[#F7F2E8] group-hover:text-[#D8FF65]">
            Talk with ScoutStar
          </span>
          <span className="w-2 h-2 rounded-full bg-[#D8FF65] animate-ping" />
        </button>
      ) : (
        /* Floating Character with Interactive Speech Bubble or Full Conversational Panel */
        <div className={`relative flex flex-col ${companionPos.includes('left') ? 'items-start' : 'items-end'}`}>
          {/* Expanded Companion Conversation & Guidance Panel */}
          {isPanelOpen ? (
            <div className="mb-3 w-[330px] sm:w-[400px] bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl shadow-[6px_6px_0px_#17271F] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[82vh]">
              {/* Panel Top Header */}
              <div className="px-4 py-3 bg-[#17271F] text-[#F7F2E8] flex items-center justify-between border-b border-[#2A4034] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <ScoutMascot expression={expression} size="xs" animate={true} />
                    {isSpeaking && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF7054] rounded-full border border-white animate-ping" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-editorial font-bold text-white flex items-center gap-1.5">
                      <span>ScoutStar</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#D8FF65] text-[#17271F] font-bold">
                        {isSpeaking ? 'SPEAKING' : isThinking ? 'THINKING' : 'READY'}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#9DE3D0] leading-none">
                      Interactive Sales Guide & Assistant
                    </div>
                  </div>
                </div>

                {/* Header Controls: Voice Mute/Unmute, Roam Position, Minimize, Close */}
                <div className="flex items-center gap-1">
                  {/* Voice Toggle */}
                  {isSpeechAvailable && (
                    <button
                      onClick={() => {
                        const nextMuted = !isVoiceMuted;
                        setIsVoiceMuted(nextMuted);
                        if (nextMuted) {
                          stopSpeaking();
                        } else {
                          speakText("Voice enabled! I'll read my answers aloud.");
                        }
                      }}
                      className={`p-1.5 rounded transition-colors ${
                        !isVoiceMuted 
                          ? 'bg-[#D8FF65] text-[#17271F]' 
                          : 'text-[#F7F2E8]/70 hover:text-white hover:bg-white/10'
                      }`}
                      title={isVoiceMuted ? 'Enable spoken voice' : 'Mute spoken voice'}
                      aria-label="Toggle voice"
                    >
                      {!isVoiceMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  {/* Roam Position Button */}
                  <button
                    onClick={handleCyclePosition}
                    className="p-1.5 rounded text-[#F7F2E8]/70 hover:text-white hover:bg-white/10 transition-colors"
                    title={`Move ScoutStar (currently: ${companionPos})`}
                    aria-label="Change companion position"
                  >
                    <Move className="w-3.5 h-3.5" />
                  </button>

                  {/* Minimize Button */}
                  <button
                    onClick={() => {
                      stopSpeaking();
                      setIsMinimized(true);
                    }}
                    className="p-1.5 rounded text-[#F7F2E8]/70 hover:text-white hover:bg-white/10 transition-colors"
                    title="Minimize companion"
                    aria-label="Minimize companion"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={() => {
                      stopSpeaking();
                      setIsPanelOpen(false);
                      setExpression('idle');
                    }}
                    className="p-1.5 rounded text-[#F7F2E8]/70 hover:text-white hover:bg-white/10 transition-colors"
                    title="Close panel"
                    aria-label="Close panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: "Chat with ScoutStar" vs "Page Guide" */}
              <div className="flex border-b border-[#E2D9C8] bg-[#F7F2E8] px-3 pt-2 text-xs font-semibold shrink-0">
                <button
                  onClick={() => setActivePanelTab('chat')}
                  className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'chat'
                      ? 'border-[#17271F] text-[#17271F]'
                      : 'border-transparent text-[#4A5E52] hover:text-[#17271F]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#FF7054]" />
                  <span>Chat & Ask</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF65]" />
                </button>

                <button
                  onClick={() => setActivePanelTab('page-guide')}
                  className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'page-guide'
                      ? 'border-[#17271F] text-[#17271F]'
                      : 'border-transparent text-[#4A5E52] hover:text-[#17271F]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-[#17271F]" />
                  <span>Page Guide</span>
                </button>
              </div>

              {/* Panel Content based on Active Sub-Tab */}
              {activeTab === 'chat' ? (
                /* Interactive Two-Way Chat Conversation */
                <div className="flex-1 flex flex-col min-h-0 bg-[#FAF7F0]">
                  {/* Messages Scroll Area */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[380px] text-xs">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed shadow-sm ${
                            msg.sender === 'user'
                              ? 'bg-[#17271F] text-[#F7F2E8] rounded-br-xs'
                              : 'bg-white border border-[#E2D9C8] text-[#17271F] rounded-bl-xs'
                          }`}
                        >
                          {msg.sender === 'scout' && (
                            <div className="flex items-center justify-between gap-2 mb-1 text-[10px] text-[#FF7054] font-mono font-bold">
                              <span>ScoutStar</span>
                              {isSpeechAvailable && (
                                <button
                                  onClick={() => speakText(msg.text)}
                                  className="text-[#4A5E52] hover:text-[#17271F] flex items-center gap-0.5 cursor-pointer"
                                  title="Listen to this message"
                                >
                                  <Volume2 className="w-2.5 h-2.5" />
                                  <span className="text-[9px]">Play</span>
                                </button>
                              )}
                            </div>
                          )}
                          <div>{msg.text}</div>

                          {/* Action button attached to message */}
                          {msg.action && (
                            <div className="mt-2.5 pt-2 border-t border-[#E2D9C8]/60">
                              <button
                                onClick={msg.action.onClick}
                                className="btn-tactile-coral w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_#17271F]"
                              >
                                <span>{msg.action.label}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Optional suggested replies chips from Scout */}
                        {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                            {msg.suggestedReplies.map((reply, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSendMessage(reply)}
                                className="text-[11px] bg-white hover:bg-[#D8FF65] text-[#17271F] border border-[#17271F] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer text-left shadow-[1px_1px_0px_#17271F]"
                              >
                                <span>{reply}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Thinking indicator */}
                    {isThinking && (
                      <div className="flex items-center gap-2 text-xs text-[#4A5E52] italic bg-white border border-[#E2D9C8] px-3 py-1.5 rounded-2xl w-fit">
                        <ScoutMascot expression="thinking" size="xs" animate={true} />
                        <span>ScoutStar is thinking...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Contextual Quick Question Suggestions */}
                  <div className="px-3 py-1.5 bg-[#F7F2E8] border-t border-[#E2D9C8] flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
                    <span className="text-[10px] font-mono text-[#FF7054] font-bold uppercase shrink-0">
                      Quick:
                    </span>
                    {getContextSuggestedReplies().map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(chip)}
                        className="whitespace-nowrap px-2 py-0.5 bg-white border border-[#D5CEBE] hover:border-[#17271F] rounded-md text-[#17271F] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Message Input Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="p-3 bg-white border-t border-[#17271F] flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask ScoutStar anything (e.g. 'What next?')..."
                      className="flex-1 bg-[#FAF7F0] border border-[#17271F] rounded-xl px-3 py-2 text-xs text-[#17271F] placeholder-[#4A5E52]/60 focus:outline-none focus:ring-1 focus:ring-[#FF7054]"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="btn-tactile-coral p-2 rounded-xl text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[2px_2px_0px_#17271F]"
                      title="Send message"
                      aria-label="Send message to ScoutStar"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                /* Page Guide Sub-Tab */
                <div className="p-4 space-y-3.5 text-xs overflow-y-auto max-h-[460px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF7054] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Contextual Overview</span>
                    </div>
                    <h4 className="font-editorial font-bold text-base text-[#17271F]">
                      {pageGuide.title}
                    </h4>
                    <p className="text-[12px] text-[#4A5E52] leading-relaxed">
                      {pageGuide.desc}
                    </p>
                  </div>

                  {/* Tips list */}
                  <div className="p-3 bg-white rounded-xl border border-[#E2D9C8] space-y-2">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#17271F]">
                      Key Actions on this Page:
                    </div>
                    {pageGuide.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#17271F]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7054] shrink-0 mt-0.5" />
                        <span className="leading-tight">{tip}</span>
                      </div>
                    ))}
                  </div>

                  {/* Roam Position Selector */}
                  <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-[#D5CEBE] flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#17271F] flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#FF7054]" />
                      <span>ScoutStar Position:</span>
                    </span>
                    <div className="flex gap-1">
                      {(['bottom-right', 'top-right', 'bottom-left'] as CompanionPosition[]).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => {
                            setCompanionPos(pos);
                            setExpression('roaming');
                            setTimeout(() => setExpression('idle'), 1000);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border transition-colors cursor-pointer ${
                            companionPos === pos
                              ? 'bg-[#17271F] text-[#D8FF65] border-[#17271F]'
                              : 'bg-white text-[#4A5E52] border-[#D5CEBE] hover:border-[#17271F]'
                          }`}
                        >
                          {pos === 'bottom-right' ? 'BR' : pos === 'top-right' ? 'TR' : 'BL'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={pageGuide.onAction}
                      className="btn-tactile-coral w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#17271F]"
                    >
                      <span>{pageGuide.primaryAction}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        onClick={() => {
                          setIsPanelOpen(false);
                          onOpenTour();
                        }}
                        className="text-[#17271F] hover:text-[#FF7054] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#FF7054]" />
                        <span>Take Full Tour</span>
                      </button>

                      <button
                        onClick={triggerCelebration}
                        className="text-[#4A5E52] hover:text-[#FF7054] font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-[#FF7054]" />
                        <span>Sparkle!</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unexpanded: Floating Roaming Mascot with Interactive Speech Bubble */
            <div className="flex items-center gap-2 group">
              {/* Context Speech Bubble */}
              <div 
                onClick={() => {
                  setIsPanelOpen(true);
                  setExpression('talking');
                  speakText(pageGuide.desc);
                }}
                className={`bg-white border-2 border-[#17271F] px-3.5 py-2 rounded-2xl text-xs font-medium text-[#17271F] shadow-[3px_3px_0px_#17271F] max-w-[210px] sm:max-w-[270px] cursor-pointer hover:border-[#FF7054] hover:shadow-[4px_4px_0px_#FF7054] transition-all group animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                  companionPos.includes('left') ? 'order-2' : 'order-1'
                }`}
                title="Click to talk with ScoutStar"
              >
                <div className="flex items-center justify-between text-[10px] text-[#4A5E52] mb-0.5">
                  <span className="font-mono font-bold text-[#FF7054] uppercase flex items-center gap-1">
                    <span>ScoutStar</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF65] animate-ping" />
                  </span>
                  <span className="group-hover:text-[#17271F] underline text-[9px]">Click to talk</span>
                </div>
                <p className="text-[11px] text-[#17271F] leading-snug line-clamp-2">
                  {readyLeads.length > 0 
                    ? `Psst! ${readyLeads.length} leads are waiting in Ready to Review!`
                    : pageGuide.desc}
                </p>
              </div>

              {/* Interactive Mascot Avatar */}
              <button
                onClick={() => {
                  setIsPanelOpen(true);
                  setExpression('waving');
                }}
                className={`p-2 rounded-2xl bg-[#FAF7F0] border-2 border-[#17271F] shadow-[3px_3px_0px_#17271F] hover:shadow-[5px_5px_0px_#FF7054] hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer relative ${
                  companionPos.includes('left') ? 'order-1' : 'order-2'
                }`}
                aria-label="Open ScoutStar conversation"
                title="Click to chat with ScoutStar"
              >
                <ScoutMascot expression={expression} size="sm" animate={true} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF7054] rounded-full border border-[#17271F] animate-pulse" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
