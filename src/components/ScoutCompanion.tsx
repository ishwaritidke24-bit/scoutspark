import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ViewTab, Prospect, IdealCustomerProfile } from '../types';
import { ScoutMascot, ScoutExpression } from './ScoutMascot';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  Minimize2, 
  Send, 
  Volume2, 
  VolumeX, 
  Compass, 
  MessageSquare, 
  Target, 
  FileText, 
  CheckCircle2
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

export const ScoutCompanion: React.FC<ScoutCompanionProps> = ({
  currentTab,
  onNavigateToTab,
  onOpenDiscovery,
  onOpenTour,
  prospects,
  onSelectProspect,
}) => {
  // UI & Mode States
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeTab, setActivePanelTab] = useState<'chat' | 'page-guide'>('chat');

  // Expression & Speech States
  const [expression, setExpression] = useState<ScoutExpression>('idle');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(true);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState<boolean>(false);

  // Conversation State
  const [chatInput, setChatInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Computed data summaries
  const readyLeads = prospects.filter(p => p.pipelineStage === 'ready_to_review');
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

  // Initial greeting messages
  const initialMessages: ChatMessage[] = useMemo(() => {
    const defaultGreeting = readyLeads.length > 0 
      ? `Hey, scout! ⭐ I'm ScoutStar. You currently have ${readyLeads.length} leads in your workspace ready for review, including ${readyLeads[0].companyName}. What would you like to explore?`
      : `Hey there! ⭐ I'm ScoutStar, your B2B sales intelligence companion. I'm right here in your corner to help guide you through finding customers, calibrating your profile, and writing grounded outreach.`;

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
          'Who built ScoutSpark?'
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

  // Conversational response engine based on real application knowledge
  const generateScoutResponse = (userQuestion: string): ChatMessage => {
    const q = userQuestion.toLowerCase().trim();
    const timeStr = 'Just now';

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

    // What is ScoutSpark / Overview
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

    // What to do first / What's next
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

    // Target Customer / ICP
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

    // Scoring & Grounding
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
        suggestedReplies: ['What is ScoutSpark?', 'Show me my top leads']
      };
    }

    // Top Leads / Discovery
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
          suggestedReplies: ['What should I do first?', 'Calibrate Target Customer']
        };
      } else {
        return {
          id: String(Date.now()),
          sender: 'scout',
          text: `You haven't scouted any leads yet! Let's click Start Scouting to discover your first B2B matches.`,
          timestamp: timeStr,
          action: {
            label: 'Start Scouting',
            onClick: () => {
              setIsPanelOpen(false);
              onOpenDiscovery();
            }
          },
          suggestedReplies: ['What is ScoutSpark?', 'Take 60-Sec Tour']
        };
      }
    }

    // General fallback
    return {
      id: String(Date.now()),
      sender: 'scout',
      text: `I'm happy to help you with Target Customer criteria, live web discovery, pipeline tracking, or message sequences! Ask me anything.`,
      timestamp: timeStr,
      suggestedReplies: [
        'What should I do first?',
        'Show me my top leads',
        'Who built ScoutSpark?'
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

  // Celebration helper
  const triggerCelebration = () => {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.85, x: 0.85 }
    });
    setExpression('celebratory');
    setTimeout(() => setExpression('idle'), 2500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none pointer-events-none">
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
          /* Floating Character with Interactive Speech Bubble or Full Conversational Panel */
          <div className="relative flex flex-col items-end">
            {/* Expanded Companion Conversation & Guidance Panel */}
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
                          {isSpeaking ? 'SPEAKING' : isThinking ? 'THINKING' : 'ONLINE'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#9DE3D0] leading-none">
                        Interactive Guide & Companion
                      </div>
                    </div>
                  </div>

                  {/* Header Controls: Voice Mute/Unmute, Minimize, Close */}
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

                {/* Sub-Tabs: "Chat & Ask" vs "Quick Guide" */}
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
                    <span>Quick Shortcuts</span>
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
                        placeholder="Ask ScoutStar anything (e.g. 'What should I do first?')..."
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
                  /* Quick Shortcuts Sub-Tab */
                  <div className="p-4 space-y-3.5 text-xs overflow-y-auto max-h-[440px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF7054] font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Quick Navigation & Tools</span>
                      </div>
                      <h4 className="font-editorial font-bold text-base text-[#17271F]">
                        Where would you like to go?
                      </h4>
                      <p className="text-[12px] text-[#4A5E52] leading-relaxed">
                        Instant shortcuts to your workspace views and features:
                      </p>
                    </div>

                    {/* Shortcuts Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setIsPanelOpen(false);
                          onOpenDiscovery();
                        }}
                        className="p-2.5 bg-white border border-[#17271F] rounded-xl text-left hover:bg-[#D8FF65]/30 transition-colors flex items-center gap-2 cursor-pointer shadow-[1px_1px_0px_#17271F]"
                      >
                        <Target className="w-3.5 h-3.5 text-[#FF7054] shrink-0" />
                        <div>
                          <div className="font-bold text-[11px] text-[#17271F]">Start Scouting</div>
                          <div className="text-[9px] text-[#4A5E52]">Find new leads</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigateToTab('settings');
                          setIsPanelOpen(false);
                        }}
                        className="p-2.5 bg-white border border-[#17271F] rounded-xl text-left hover:bg-[#D8FF65]/30 transition-colors flex items-center gap-2 cursor-pointer shadow-[1px_1px_0px_#17271F]"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#FF7054] shrink-0" />
                        <div>
                          <div className="font-bold text-[11px] text-[#17271F]">Target Customer</div>
                          <div className="text-[9px] text-[#4A5E52]">Calibrate criteria</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigateToTab('prospects');
                          setIsPanelOpen(false);
                        }}
                        className="p-2.5 bg-white border border-[#17271F] rounded-xl text-left hover:bg-[#D8FF65]/30 transition-colors flex items-center gap-2 cursor-pointer shadow-[1px_1px_0px_#17271F]"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#FF7054] shrink-0" />
                        <div>
                          <div className="font-bold text-[11px] text-[#17271F]">Find Leads</div>
                          <div className="text-[9px] text-[#4A5E52]">{prospects.length} verified dossiers</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigateToTab('pipeline');
                          setIsPanelOpen(false);
                        }}
                        className="p-2.5 bg-white border border-[#17271F] rounded-xl text-left hover:bg-[#D8FF65]/30 transition-colors flex items-center gap-2 cursor-pointer shadow-[1px_1px_0px_#17271F]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7054] shrink-0" />
                        <div>
                          <div className="font-bold text-[11px] text-[#17271F]">Pipeline</div>
                          <div className="text-[9px] text-[#4A5E52]">Manage stages</div>
                        </div>
                      </button>
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
                        <Sparkles className="w-3.5 h-3.5" />
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
                          <HelpCircle className="w-3.5 h-3.5 text-[#FF7054]" />
                          <span>Take 60-Sec Tour</span>
                        </button>

                        <button
                          onClick={triggerCelebration}
                          className="text-[#4A5E52] hover:text-[#FF7054] font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-[#FF7054]" />
                          <span>Celebrate!</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unexpanded: Fixed Corner Mascot with Interactive Speech Bubble */
              <div className="flex items-center gap-2 group">
                {/* Context Speech Bubble (shown on non-dashboard tabs to avoid duplicate greeting) */}
                {currentTab !== 'dashboard' && (
                  <div 
                    onClick={() => {
                      setIsPanelOpen(true);
                      setExpression('talking');
                      speakText("Hey! Click me anytime for help, shortcuts, or to chat.");
                    }}
                    className="bg-white border-2 border-[#17271F] px-3.5 py-2 rounded-2xl text-xs font-medium text-[#17271F] shadow-[3px_3px_0px_#17271F] max-w-[220px] sm:max-w-[270px] cursor-pointer hover:border-[#FF7054] hover:shadow-[4px_4px_0px_#FF7054] transition-all group animate-in fade-in duration-200"
                    title="Click to talk with Scout"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#4A5E52] mb-0.5">
                      <span className="font-mono font-bold text-[#FF7054] uppercase flex items-center gap-1">
                        <span>Scout</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF65] animate-ping" />
                      </span>
                      <span className="group-hover:text-[#17271F] underline text-[9px]">Click to chat</span>
                    </div>
                    <p className="text-[11px] text-[#17271F] leading-snug line-clamp-2">
                      {readyLeads.length > 0 
                        ? `Psst! ${readyLeads.length} leads are waiting in Ready to Review!`
                        : currentTab === 'settings'
                        ? "Describe your ideal customer in plain English!"
                        : "I'm right here in your corner to help. Click to chat!"}
                    </p>
                  </div>
                )}

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
