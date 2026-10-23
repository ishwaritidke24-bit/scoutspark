import React, { useState, useEffect } from 'react';
import { ScoutMascot, ScoutExpression } from './ScoutMascot';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import { Prospect } from '../types';

interface GuidedDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProspect: (prospect: Prospect) => void;
  prospects: Prospect[];
}

export const GuidedDiscoveryModal: React.FC<GuidedDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onSelectProspect,
  prospects,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const targetProspect = prospects.find(p => p.id === 'prospect-01') || prospects[0];

  const steps = [
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

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsRunning(true);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    if (isRunning && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2200);
    }
    return () => clearTimeout(timer);
  }, [isOpen, currentStep, isRunning, steps.length]);

  if (!isOpen) return null;

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17271F]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl shadow-[6px_6px_0px_#17271F] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#17271F] text-[#F7F2E8]">
          <div className="flex items-center gap-3">
            <ScoutMascot expression={current.expression} size="sm" animate={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D8FF65] bg-[#17271F] px-1.5 py-0.5 rounded border border-[#D8FF65]/40">
                  Deterministic Demo Engine
                </span>
                <span className="text-xs text-[#9DE3D0]">Local Mock Pipeline</span>
              </div>
              <h2 id="modal-title" className="text-base font-editorial font-bold text-white tracking-tight">
                Scout Research Pipeline in Action
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

        {/* Multi-step Progress Bar */}
        <div className="grid grid-cols-4 border-b border-[#17271F]/20 bg-[#F7F2E8]">
          {steps.map((s, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  setIsRunning(false);
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#17271F] text-[#D8FF65]">
                {current.badge}
              </div>
              <h3 className="text-xl font-editorial font-bold text-[#17271F] mt-2">
                {current.title}
              </h3>
              <p className="text-xs text-[#4A5E52] mt-0.5">
                {current.subtitle}
              </p>
            </div>

            <ScoutMascot 
              expression={current.expression} 
              size="lg" 
              speechText={current.speech} 
              animate={true} 
            />
          </div>

          {/* Details breakdown */}
          <div className="bg-white border-1.5 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F] space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#4A5E52] flex items-center justify-between border-b border-[#E2D9C8] pb-1.5">
              <span>Pipeline Stage Output</span>
              <span className="font-mono text-[11px] text-[#FF7054] font-semibold">TARGET: KiteMetrics</span>
            </div>
            
            <div className="space-y-2 pt-1">
              {current.details.map((item, idx) => (
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

          {/* Explicit Human In Control Notice */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FFEAE5] border border-[#FF7054]/40 text-xs text-[#17271F]">
            <ShieldCheck className="w-4 h-4 text-[#FF7054] shrink-0" />
            <div>
              <span className="font-bold">Human-in-the-Loop Guarantee: </span>
              ScoutSpark generates evidence-backed suggestions and email drafts, but never triggers outbound emails automatically.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F7F2E8] border-t border-[#17271F]/15">
          <div className="flex items-center gap-2 text-xs text-[#4A5E52]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#9DE3D0] animate-pulse" />
            <span>Deterministic Local Simulation</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentStep(prev => prev + 1);
                  setIsRunning(false);
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
