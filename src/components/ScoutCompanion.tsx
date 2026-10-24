import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ViewTab, Prospect, IdealCustomerProfile } from '../types';
import { ScoutMascot, ScoutExpression } from './ScoutMascot';
import { 
  X as CloseIcon, 
  Sparkles as SparklesIcon, 
  ArrowRight as ArrowRightIcon, 
  HelpCircle as HelpCircleIcon, 
  Minimize2 as MinimizeIcon, 
  Send as SendIcon, 
  Volume2 as VolumeOnIcon, 
  VolumeX as VolumeOffIcon, 
  Compass as CompassIcon, 
  Move as MoveIcon, 
  MessageSquare as ChatIcon, 
  Target as TargetIcon, 
  FileText as FileIcon, 
  Navigation as NavIcon, 
  Home as HomeIcon, 
  Play as PlayIcon, 
  Pause as PauseIcon, 
  CheckCircle2 as CheckIcon 
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

interface RoamDestination {
  id: string;
  targetKey: string;
  expression: ScoutExpression;
  speechText: string;
  pauseMs: number;
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
  const [activeTab, setActivePanelTab] = useState<'chat' | 'roam'>('chat');
  
  // Roaming & Position States
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 100, y: 120 });
  const [isAutoRoamActive, setIsAutoRoamActive] = useState<boolean>(true);
  const [destinationIndex, setDestinationIndex] = useState<number>(0);
  const [currentSpeech, setCurrentSpeech] = useState<string>("Hey, scout! ⭐ I'm ScoutStar. Let's find your next yes!");
  const [expression, setExpression] = useState<ScoutExpression>('waving');
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  // Speech & Voice States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(true);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState<boolean>(false);

  // Conversation States
  const [chatInput, setChatInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ready and approved leads
  const readyLeads = prospects.filter(p => p.pipelineStage === 'ready_to_review');
  const topScoredProspect = useMemo(() => {
    if (!prospects.length) return null;
    return [...prospects].sort((a, b) => b.fitScore - a.fitScore)[0];
  }, [prospects]);

  // Route-specific multi-stop destination cycles
  const routeDestinations: Record<ViewTab, RoamDestination[]> = useMemo(() => ({
    dashboard: [
      {
        id: 'hero',
        targetKey: 'overview-hero',
        expression: 'waving',
        speechText: "Hey, scout! ⭐ I'm ScoutStar. Let's find your next yes!",
        pauseMs: 7000,
      },
      {
        id: 'start-btn',
        targetKey: 'start-scouting-btn',
        expression: 'pointing',
        speechText: "Click Start Scouting to search the live web for ideal customers!",
        pauseMs: 7500,
      },
      {
        id: 'top-right-spot',
        targetKey: 'resting-tr',
        expression: 'curious',
        speechText: "I crawl public news, job postings, and blogs so you never send cold spam.",
        pauseMs: 7000,
      },
      {
        id: 'next-action',
        targetKey: 'priority-shortlist',
        expression: 'focused',
        speechText: readyLeads.length > 0 
          ? `You have ${readyLeads.length} leads in Ready to Review!`
          : "Check your recommended next steps and pipeline snapshot.",
        pauseMs: 7500,
      },
      {
        id: 'home-corner',
        targetKey: 'resting-bl',
        expression: 'idle',
        speechText: "Resting here for a moment. Click me anytime to chat!",
        pauseMs: 6500,
      }
    ],
    settings: [
      {
        id: 'desc-field',
        targetKey: 'target-customer-description',
        expression: 'pointing',
        speechText: "Describe your ideal customer in plain English! What do they build?",
        pauseMs: 7500,
      },
      {
        id: 'form-card',
        targetKey: 'target-customer-form',
        expression: 'focused',
        speechText: "Set target industries, buyer roles, and disqualification rules.",
        pauseMs: 7000,
      },
      {
        id: 'save-btn',
        targetKey: 'target-customer-save-btn',
        expression: 'waving',
        speechText: "Hit Save when ready, and ScoutSpark will score against this profile!",
        pauseMs: 7000,
      },
      {
        id: 'resting-bl',
        targetKey: 'resting-bl',
        expression: 'idle',
        speechText: "Resting comfortably while you fine-tune your target customer.",
        pauseMs: 6500,
      }
    ],
    prospects: [
      {
        id: 'filter-bar',
        targetKey: 'find-leads-actions',
        expression: 'curious',
        speechText: "Your evaluated lead directory! Filter by score, industry, or search.",
        pauseMs: 7500,
      },
      {
        id: 'top-card',
        targetKey: 'first-lead-card',
        expression: 'pointing',
        speechText: "Every company is backed by verified public facts with real source links!",
        pauseMs: 7500,
      },
      {
        id: 'tr-zone',
        targetKey: 'resting-tr',
        expression: 'waving',
        speechText: "You can also click Import CSV to score an existing spreadsheet.",
        pauseMs: 7000,
      },
      {
        id: 'resting-corner',
        targetKey: 'resting-bl',
        expression: 'idle',
        speechText: "Click any company to open its detailed research dossier!",
        pauseMs: 6500,
      }
    ],
    pipeline: [
      {
        id: 'ready-col',
        targetKey: 'pipeline-column-ready',
        expression: 'pointing',
        speechText: "Ready to Review! Inspect these leads before approving outreach.",
        pauseMs: 7500,
      },
      {
        id: 'kanban-board',
        targetKey: 'pipeline-board',
        expression: 'focused',
        speechText: "Track conversations across all 8 stages from research to won deals.",
        pauseMs: 7500,
      },
      {
        id: 'tr-corner',
        targetKey: 'resting-tr',
        expression: 'waving',
        speechText: "Advance leads with one-click arrows as conversations move forward.",
        pauseMs: 7000,
      },
      {
        id: 'resting-bl',
        targetKey: 'resting-bl',
        expression: 'idle',
        speechText: "Zero auto-send: you approve and copy every email message yourself!",
        pauseMs: 6500,
      }
    ],
    campaigns: [
      {
        id: 'sequence-card',
        targetKey: 'sequence-composer',
        expression: 'focused',
        speechText: "3-touch sequences citing real company pain points with zero generic fluff.",
        pauseMs: 7500,
      },
      {
        id: 'tr-zone',
        targetKey: 'resting-tr',
        expression: 'waving',
        speechText: "1-click copy to paste straight into your personal email client.",
        pauseMs: 7000,
      },
      {
        id: 'resting-bl',
        targetKey: 'resting-bl',
        expression: 'idle',
        speechText: "Value-first outreach builds genuine credibility with founders.",
        pauseMs: 6500,
      }
    ],
    'eval-lab': [
      {
        id: 'accuracy-card',
        targetKey: 'accuracy-metrics',
        expression: 'focused',
        speechText: "Live grounding metrics guaranteeing zero made-up claims!",
        pauseMs: 7500,
      },
      {
        id: 'tests-table',
        targetKey: 'accuracy-tests',
        expression: 'pointing',
        speechText: "12 automated evaluation tests verifying hallucination defense.",
        pauseMs: 7500,
      },
      {
        id: 'resting-bl',
        targetKey: 'resting-bl',
        expression: 'idle',
        speechText: "We never guess: unverified statements are strictly tagged.",
        pauseMs: 6500,
      }
    ]
  }), [readyLeads.length]);

  // Current list of destinations for the active tab
  const destinations = routeDestinations[currentTab] || routeDestinations.dashboard;
  const currentDest = destinations[destinationIndex % destinations.length];

  // Check speech synthesis & motion preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        setIsSpeechAvailable(true);
      }
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Compute on-screen viewport coordinates for a targetKey
  const computePositionForTarget = useCallback((targetKey: string): { x: number; y: number } => {
    if (typeof window === 'undefined') return { x: 50, y: 120 };

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const compWidth = isMinimized ? 150 : isPanelOpen ? 370 : 280;
    const compHeight = isMinimized ? 44 : isPanelOpen ? 460 : 76;

    // Viewport-relative resting positions
    if (targetKey === 'resting-br' || isDrawerOpen) {
      if (isDrawerOpen) {
        // If lead drawer is open on the right, rest safely at bottom-left
        return { x: 24, y: Math.max(76, vh - compHeight - 24) };
      }
      return {
        x: Math.max(20, vw - compWidth - 24),
        y: Math.max(76, vh - compHeight - 24)
      };
    }

    if (targetKey === 'resting-bl') {
      return { x: 24, y: Math.max(76, vh - compHeight - 24) };
    }

    if (targetKey === 'resting-tr') {
      return {
        x: Math.max(20, vw - compWidth - 28),
        y: 85
      };
    }

    // Try finding DOM element with data-scout-target
    const el = document.querySelector(`[data-scout-target="${targetKey}"]`);
    if (!el) {
      // Element not in DOM right now; alternate between top-right and bottom-left
      return destinationIndex % 2 === 0
        ? { x: Math.max(20, vw - compWidth - 28), y: 85 }
        : { x: 24, y: Math.max(76, vh - compHeight - 24) };
    }

    const rect = el.getBoundingClientRect();

    // If element is partially visible or in viewport
    let x = rect.right + 16;
    let y = rect.top + Math.max(0, (rect.height - compHeight) / 2);

    // If right side overflows viewport, flip to left of element
    if (x + compWidth > vw - 16) {
      x = rect.left - compWidth - 16;
    }

    // If left side also overflows, center above or below
    if (x < 16) {
      x = Math.max(16, Math.min(vw - compWidth - 16, rect.left));
      if (rect.top > compHeight + 30) {
        y = rect.top - compHeight - 12;
      } else {
        y = rect.bottom + 12;
      }
    }

    // Always clamp to visible viewport
    x = Math.max(16, Math.min(vw - compWidth - 16, x));
    y = Math.max(76, Math.min(vh - compHeight - 16, y));

    return { x, y };
  }, [isPanelOpen, isMinimized, isDrawerOpen, destinationIndex]);

  // Recalculate coordinates whenever current destination, panel state, or viewport changes
  const applyCoordinates = useCallback(() => {
    if (!currentDest) return;
    const pos = computePositionForTarget(currentDest.targetKey);
    setCoords(pos);
  }, [currentDest, computePositionForTarget]);

  // Reset destination to 0 whenever route changes
  useEffect(() => {
    setDestinationIndex(0);
    const firstDest = destinations[0];
    if (firstDest) {
      setCurrentSpeech(firstDest.speechText);
      setExpression(firstDest.expression);
      const pos = computePositionForTarget(firstDest.targetKey);
      setCoords(pos);
    }
  }, [currentTab, destinations, computePositionForTarget]);

  // Keep coordinates accurate on window scroll and resize
  useEffect(() => {
    applyCoordinates();

    let animId: number;
    const handleScrollResize = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        applyCoordinates();
      });
    };

    window.addEventListener('scroll', handleScrollResize, { passive: true });
    window.addEventListener('resize', handleScrollResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScrollResize);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [applyCoordinates]);

  // Detect when user is typing in any form input on the page to pause roaming
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        setIsUserInteracting(true);
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        // Resume after short delay
        setTimeout(() => setIsUserInteracting(false), 2000);
      }
    };

    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);

    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // AUTONOMOUS ROAMING ENGINE: Automatically cycles between destinations
  useEffect(() => {
    // Pause conditions: panel open, auto-roam toggled off, or user typing
    if (isPanelOpen || !isAutoRoamActive || isUserInteracting) {
      return;
    }

    const currentPauseTime = currentDest?.pauseMs || 7000;

    const timer = setTimeout(() => {
      // 1. Advance to next destination in cycle
      const nextIdx = (destinationIndex + 1) % destinations.length;
      const nextDest = destinations[nextIdx];

      // 2. Play roaming wind expression during glide
      setExpression('roaming');

      // 3. Update speech bubble and destination coordinates
      setCurrentSpeech(nextDest.speechText);
      setDestinationIndex(nextIdx);

      const nextPos = computePositionForTarget(nextDest.targetKey);
      setCoords(nextPos);

      // 4. Settle on destination expression after glide transition (800ms)
      setTimeout(() => {
        setExpression(nextDest.expression);
      }, 800);

    }, currentPauseTime);

    return () => clearTimeout(timer);
  }, [
    destinationIndex,
    destinations,
    currentDest,
    isPanelOpen,
    isAutoRoamActive,
    isUserInteracting,
    computePositionForTarget
  ]);

  // Voice speech synthesis helper
  const speakText = (text: string) => {
    if (!isSpeechAvailable || isVoiceMuted || typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
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

  // Initial greeting messages for chat
  const initialMessages: ChatMessage[] = useMemo(() => {
    const defaultGreeting = readyLeads.length > 0 
      ? `Hey, scout! ⭐ I'm ScoutStar. You currently have ${readyLeads.length} leads in your workspace ready for review, including ${readyLeads[0].companyName}. What would you like to explore?`
      : `Hey there! ⭐ I'm ScoutStar, your B2B sales intelligence companion. I roam around ScoutSpark with you to guide you through finding customers, calibrating your profile, and writing grounded outreach.`;

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
          'Where can you roam?'
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

  // Conversational response engine
  const generateScoutResponse = (userQuestion: string): ChatMessage => {
    const q = userQuestion.toLowerCase().trim();
    const timeStr = 'Just now';

    // Roam questions
    if (q.includes('roam') || q.includes('move') || q.includes('fly') || q.includes('where can you')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `I roam automatically between key tools on every page! Watch me glide to the action buttons, forms, and results, or click below to steer me directly:`,
        timestamp: timeStr,
        suggestedReplies: [
          'Glide to Main Action',
          'Glide to Form / Inputs',
          'Glide to Navigation',
          'Rest at Corner'
        ]
      };
    }

    if (q.includes('glide to main action') || q.includes('show main action')) {
      const target = currentTab === 'dashboard' ? 'start-scouting-btn' : 'find-leads-actions';
      const pos = computePositionForTarget(target);
      setCoords(pos);
      setExpression('pointing');
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `Gliding beside the primary action for this section! 👉 Click it whenever you're ready.`,
        timestamp: timeStr,
      };
    }

    if (q.includes('glide to form') || q.includes('glide to input')) {
      if (currentTab !== 'settings') onNavigateToTab('settings');
      const pos = computePositionForTarget('target-customer-description');
      setCoords(pos);
      setExpression('pointing');
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `Flying beside the Target Customer form! Here is where you tell me who you're looking for in plain English.`,
        timestamp: timeStr,
      };
    }

    if (q.includes('glide to navigation') || q.includes('show navigation')) {
      const pos = computePositionForTarget('resting-tr');
      setCoords(pos);
      setExpression('waving');
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `Here is the top navigation bar with your Workspace, Outreach, Intelligence & Quality sections!`,
        timestamp: timeStr,
      };
    }

    if (q.includes('rest at corner') || q.includes('go home')) {
      const pos = computePositionForTarget('resting-bl');
      setCoords(pos);
      setExpression('idle');
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `Resting comfortably in the corner. Click me or ask a question anytime you need help!`,
        timestamp: timeStr,
      };
    }

    // Creator attribution
    if (q.includes('creator') || q.includes('who built') || q.includes('who made') || q.includes('ishwari')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `ScoutSpark was designed and built by Ishwari Tidke! ⭐ Built with tactile editorial design, verifiable public web citations, and strict human-in-the-loop approvals.`,
        timestamp: timeStr,
        suggestedReplies: ['What is ScoutSpark?', 'What should I do first?']
      };
    }

    // What is ScoutSpark
    if (q.includes('what is scoutspark') || q.includes('what does scoutspark do') || q.includes('purpose') || q.includes('about')) {
      return {
        id: String(Date.now()),
        sender: 'scout',
        text: `ScoutSpark is reason-driven B2B lead intelligence! Instead of scraping stale, spammy contact lists, ScoutSpark finds qualified companies backed by verifiable public evidence (news, jobs, tech stack) and writes grounded email sequences you review before sending.`,
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

    // What to do first
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
          text: `Here's the best workflow: 1. Click Start Scouting. 2. Describe your ideal customer in plain English. 3. Review candidate dossiers and draft personalized messages!`,
          timestamp: timeStr,
          action: {
            label: 'Start Scouting Customers',
            onClick: () => {
              setIsPanelOpen(false);
              onOpenDiscovery();
            }
          },
          suggestedReplies: ['Take me to Target Customer', 'Show me my top leads']
        };
      }
    }

    // General fallback
    return {
      id: String(Date.now()),
      sender: 'scout',
      text: `I'm happy to help you with Target Customer criteria, live web discovery, pipeline tracking, or roaming around the page!`,
      timestamp: timeStr,
      suggestedReplies: [
        'Where can you roam?',
        'What should I do first?',
        'Show me my top leads'
      ]
    };
  };

  // Handle sending a message in the chat
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? chatInput).trim();
    if (!text) return;

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

    setTimeout(() => {
      const response = generateScoutResponse(text);
      setMessages(prev => [...prev, response]);
      setIsThinking(false);
      setExpression('talking');

      speakText(response.text);

      setTimeout(() => {
        if (!isSpeaking) setExpression('idle');
      }, 2500);
    }, 450);
  };

  // Manual jump to specific destination
  const handleJumpToDestination = (dest: RoamDestination) => {
    setExpression('roaming');
    setCurrentSpeech(dest.speechText);
    const pos = computePositionForTarget(dest.targetKey);
    setCoords(pos);
    setTimeout(() => {
      setExpression(dest.expression);
    }, 700);
  };

  // Celebration helper
  const triggerCelebration = () => {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.85, x: coords.x > window.innerWidth / 2 ? 0.85 : 0.15 }
    });
    setExpression('celebratory');
    setTimeout(() => setExpression('idle'), 2500);
  };

  return (
    <div 
      className="fixed z-40 select-none pointer-events-none"
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        transition: isReducedMotion ? 'none' : 'left 0.8s cubic-bezier(0.16, 1, 0.3, 1), top 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div className="pointer-events-auto">
        {/* Minimized Floating Star Button */}
        {isMinimized ? (
          <button
            onClick={() => {
              setIsMinimized(false);
              setIsPanelOpen(true);
              setExpression('waving');
            }}
            className="p-2.5 rounded-full bg-[#17271F] text-[#D8FF65] border-2 border-[#17271F] shadow-[3px_3px_0px_#FF7054] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
            title="Open ScoutStar Companion & Chat"
            aria-label="Expand ScoutStar guide"
          >
            <ScoutMascot expression="idle" size="xs" animate={true} />
            <span className="text-xs font-editorial font-bold pr-1 text-[#F7F2E8] group-hover:text-[#D8FF65]">
              ScoutStar
            </span>
            <span className="w-2 h-2 rounded-full bg-[#D8FF65] animate-ping" />
          </button>
        ) : (
          /* Floating Character with Context Speech Bubble or Full Conversational Panel */
          <div className="relative flex flex-col items-end">
            {/* Expanded Companion Conversation & Roaming Panel */}
            {isPanelOpen ? (
              <div className="mb-3 w-[330px] sm:w-[380px] bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl shadow-[6px_6px_0px_#17271F] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
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
                          {isAutoRoamActive ? 'ROAMING' : 'PAUSED'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#9DE3D0] leading-none">
                        Interactive Guide & Companion
                      </div>
                    </div>
                  </div>

                  {/* Header Controls: Auto-Roam Pause/Play, Voice Mute/Unmute, Minimize, Close */}
                  <div className="flex items-center gap-1">
                    {/* Auto-Roam Toggle */}
                    <button
                      onClick={() => setIsAutoRoamActive(!isAutoRoamActive)}
                      className={`p-1.5 rounded transition-colors ${
                        isAutoRoamActive 
                          ? 'bg-[#D8FF65] text-[#17271F]' 
                          : 'text-[#F7F2E8]/70 hover:text-white hover:bg-white/10'
                      }`}
                      title={isAutoRoamActive ? 'Pause automatic roaming' : 'Resume automatic roaming'}
                      aria-label="Toggle automatic roaming"
                    >
                      {isAutoRoamActive ? <PauseIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5" />}
                    </button>

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
                        {!isVoiceMuted ? <VolumeOnIcon className="w-3.5 h-3.5" /> : <VolumeOffIcon className="w-3.5 h-3.5" />}
                      </button>
                    )}

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
                      <MinimizeIcon className="w-3.5 h-3.5" />
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
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs: "Chat & Ask" vs "Roam Stops" */}
                <div className="flex border-b border-[#E2D9C8] bg-[#F7F2E8] px-3 pt-2 text-xs font-semibold shrink-0">
                  <button
                    onClick={() => setActivePanelTab('chat')}
                    className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'chat'
                        ? 'border-[#17271F] text-[#17271F]'
                        : 'border-transparent text-[#4A5E52] hover:text-[#17271F]'
                    }`}
                  >
                    <ChatIcon className="w-3.5 h-3.5 text-[#FF7054]" />
                    <span>Chat & Ask</span>
                  </button>

                  <button
                    onClick={() => setActivePanelTab('roam')}
                    className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'roam'
                        ? 'border-[#17271F] text-[#17271F]'
                        : 'border-transparent text-[#4A5E52] hover:text-[#17271F]'
                    }`}
                  >
                    <CompassIcon className="w-3.5 h-3.5 text-[#17271F]" />
                    <span>Roam Stops ({destinations.length})</span>
                  </button>
                </div>

                {/* Panel Content based on Active Sub-Tab */}
                {activeTab === 'chat' ? (
                  /* Interactive Two-Way Chat Conversation */
                  <div className="flex-1 flex flex-col min-h-0 bg-[#FAF7F0]">
                    {/* Messages Scroll Area */}
                    <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[340px] text-xs">
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
                                    <VolumeOnIcon className="w-2.5 h-2.5" />
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
                                  <ArrowRightIcon className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Optional suggested replies chips */}
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
                        placeholder="Ask ScoutStar anything (e.g. 'Where can you roam?')..."
                        className="flex-1 bg-[#FAF7F0] border border-[#17271F] rounded-xl px-3 py-2 text-xs text-[#17271F] placeholder-[#4A5E52]/60 focus:outline-none focus:ring-1 focus:ring-[#FF7054]"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="btn-tactile-coral p-2 rounded-xl text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[2px_2px_0px_#17271F]"
                        title="Send message"
                        aria-label="Send message to ScoutStar"
                      >
                        <SendIcon className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Roam Stops Sub-Tab */
                  <div className="p-4 space-y-3.5 text-xs overflow-y-auto max-h-[440px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF7054] font-bold uppercase tracking-wider">
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>Autonomous Movement Loop</span>
                      </div>
                      <h4 className="font-editorial font-bold text-base text-[#17271F]">
                        Roaming stops for this page
                      </h4>
                      <p className="text-[12px] text-[#4A5E52] leading-relaxed">
                        ScoutStar travels between these visible spots every 7 seconds. Click any stop to jump there immediately!
                      </p>
                    </div>

                    {/* Stops List */}
                    <div className="space-y-2">
                      {destinations.map((dest, idx) => {
                        const isCurrent = (destinationIndex % destinations.length) === idx;
                        return (
                          <button
                            key={dest.id}
                            onClick={() => handleJumpToDestination(dest)}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-[#D8FF65]/30 border-[#17271F] shadow-[2px_2px_0px_#17271F] font-bold'
                                : 'bg-white border-[#E2D9C8] hover:border-[#17271F]'
                            }`}
                          >
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#17271F] text-[#D8FF65] shrink-0 mt-0.5 font-bold">
                              0{idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] text-[#17271F] truncate font-semibold">
                                {dest.targetKey}
                              </div>
                              <div className="text-[10px] text-[#4A5E52] line-clamp-1 italic">
                                "{dest.speechText}"
                              </div>
                            </div>
                            {isCurrent && (
                              <span className="w-2 h-2 rounded-full bg-[#FF7054] animate-ping shrink-0 mt-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Primary Action Button */}
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setIsPanelOpen(false);
                          onOpenDiscovery();
                        }}
                        className="btn-tactile-coral w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#17271F]"
                      >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>Start Customer Discovery</span>
                      </button>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          onClick={() => {
                            setIsPanelOpen(false);
                            onOpenTour();
                          }}
                          className="text-[#17271F] hover:text-[#FF7054] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <HelpCircleIcon className="w-3.5 h-3.5 text-[#FF7054]" />
                          <span>Take 60-Sec Tour</span>
                        </button>

                        <button
                          onClick={triggerCelebration}
                          className="text-[#4A5E52] hover:text-[#FF7054] font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <SparklesIcon className="w-3 h-3 text-[#FF7054]" />
                          <span>Celebrate!</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unexpanded: Floating Roaming Mascot with Interactive Speech Bubble */
              <div className="flex items-center gap-2 group">
                {/* Context Speech Bubble that updates dynamically with each destination */}
                <div 
                  onClick={() => {
                    setIsPanelOpen(true);
                    setExpression('talking');
                    speakText(currentSpeech);
                  }}
                  className="bg-white border-2 border-[#17271F] px-3.5 py-2 rounded-2xl text-xs font-medium text-[#17271F] shadow-[3px_3px_0px_#17271F] max-w-[220px] sm:max-w-[270px] cursor-pointer hover:border-[#FF7054] hover:shadow-[4px_4px_0px_#FF7054] transition-all group animate-in fade-in duration-200"
                  title="Click to talk with ScoutStar"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#4A5E52] mb-0.5">
                    <span className="font-mono font-bold text-[#FF7054] uppercase flex items-center gap-1">
                      <span>ScoutStar</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF65] animate-ping" />
                    </span>
                    <span className="group-hover:text-[#17271F] underline text-[9px]">Click to chat</span>
                  </div>
                  <p className="text-[11px] text-[#17271F] leading-snug line-clamp-2">
                    {currentSpeech}
                  </p>
                </div>

                {/* Interactive Mascot Avatar */}
                <button
                  onClick={() => {
                    setIsPanelOpen(true);
                    setExpression('waving');
                  }}
                  className="p-2 rounded-2xl bg-[#FAF7F0] border-2 border-[#17271F] shadow-[3px_3px_0px_#17271F] hover:shadow-[5px_5px_0px_#FF7054] hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer relative"
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
    </div>
  );
};
