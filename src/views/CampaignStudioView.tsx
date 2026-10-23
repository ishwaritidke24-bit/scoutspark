import React, { useState } from 'react';
import { ScoutMascot } from '../components/ScoutMascot';
import { 
  Send, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  ShieldCheck, 
  Layers, 
  Calendar, 
  Sparkles, 
  Target, 
  Compass,
  ArrowRight
} from 'lucide-react';

export const CampaignStudioView: React.FC = () => {
  const [activeTouch, setActiveTouch] = useState<number>(1);
  const [copiedTouch, setCopiedTouch] = useState<number | null>(null);

  // Editable sequence touches
  const [touches, setTouches] = useState([
    {
      step: 1,
      day: "Day 01",
      name: "The Incident Retrospective Hook",
      subject: "Your post on Kafka trace overhead & KiteMetrics' p99 latency",
      body: `Hi Elena,

Read your candid postmortem on KiteMetrics' Kafka buffer saturation during last month's enterprise ingest surge. Loved the transparency on where your team spent 36 hours diagnosing span drops.

Most Series A observability startups hit that exact wall when trace cardinality triples: you're either forced to sample aggressively (frustrating developers) or watch your storage tier eat your ARR.

We built a lightweight ingestion proxy specifically for fast-growing platforms handling >20M spans/sec. It drops storage costs by ~65% while keeping 100% trace fidelity for anomalous traces.

Would you be open to a 12-minute technical peer review on how Teams like Vector and HyperScale solved this without rewriting their collectors?

Best,
Alex Rivera
Founding Team, ScoutSpark`,
      isEditing: false,
      groundingEvidence: "Grounded in KiteMetrics Sept 2026 postmortem on Kafka lag."
    },
    {
      step: 2,
      day: "Day 04",
      name: "The Technical Benchmark Follow-up",
      subject: "Re: Kafka trace overhead & p99 benchmark comparisons",
      body: `Hi Elena,

Quick follow-up—our team just published our Q3 telemetry compression benchmark across 500M synthetic distributed trace spans.

The key finding: by compressing cold span attributes at the proxy layer before disk flush, you can keep p99 query latency under 80ms while avoiding cloud storage tier upgrades.

Happy to send over the 2-page benchmark PDF if helpful as your team gears up for Q4 capacity planning?

Best,
Alex Rivera`,
      isEditing: false,
      groundingEvidence: "Provides value-first technical benchmark without sales badgering."
    },
    {
      step: 3,
      day: "Day 09",
      name: "The Zero-Commitment Local Sandbox",
      subject: "KiteMetrics trace proxy sandbox (local Docker container)",
      body: `Hi Elena,

Assuming you're deep in the trenches scaling Elena's infrastructure team (congrats on the recent hiring momentum!).

If you ever want to test the compression curves without touching KiteMetrics' production cluster, we published a local Docker sandbox that runs entirely in your local dev environment.

Let me know if you'd like the repo link. Either way, cheering on KiteMetrics' growth!

Alex`,
      isEditing: false,
      groundingEvidence: "Frictionless, respectful closure acknowledging executive bandwidth constraints."
    }
  ]);

  const handleCopy = (step: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTouch(step);
    setTimeout(() => setCopiedTouch(null), 2000);
  };

  const handleUpdateBody = (step: number, newBody: string) => {
    setTouches(prev => prev.map(t => t.step === step ? { ...t, body: newBody } : t));
  };

  const handleToggleEdit = (step: number) => {
    setTouches(prev => prev.map(t => t.step === step ? { ...t, isEditing: !t.isEditing } : t));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-editorial font-bold text-[#17271F]">
                Campaign Studio
              </h1>
              <span className="sticker-badge bg-[#FFEAE5] text-[#FF7054] border-[#FF7054] text-[10px]">
                Draft & Review Mode Only
              </span>
            </div>
            <p className="text-xs text-[#4A5E52] mt-0.5">
              Design evidence-backed multi-touch outreach sequences. Review and copy drafts for manual founder delivery.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF7F0] p-3 rounded-xl border border-[#17271F] text-xs">
            <ShieldCheck className="w-4 h-4 text-[#FF7054] shrink-0" />
            <div>
              <span className="font-bold text-[#17271F]">Zero Outbound Automation: </span>
              <span className="text-[#4A5E52]">Emails are never dispatched automatically by ScoutSpark.</span>
            </div>
          </div>
        </div>

        {/* Campaign Target Persona Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#E2D9C8] text-xs">
          <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5E52] block">
              Target Cohort
            </span>
            <span className="font-bold text-[#17271F] mt-0.5 block">
              Series A Observability & DevTools
            </span>
            <span className="text-[11px] text-[#4A5E52] mt-0.5 block">
              20-60 employees • US & Western Europe
            </span>
          </div>

          <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5E52] block">
              Target Buyer Persona
            </span>
            <span className="font-bold text-[#17271F] mt-0.5 block">
              VP of Engineering / Head of Platform
            </span>
            <span className="text-[11px] text-[#4A5E52] mt-0.5 block">
              Technical decision maker with cloud budget authority
            </span>
          </div>

          <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5E52] block">
              Grounding Trigger Signal
            </span>
            <span className="font-bold text-[#FF7054] mt-0.5 block">
              Public Incident Retrospective / Span Lag
            </span>
            <span className="text-[11px] text-[#4A5E52] mt-0.5 block">
              Verifiable engineering blog post or public GitHub commit
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Sequence Timeline & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sequence Steps (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#4A5E52] px-1">
            Reviewable Sequence Steps
          </div>

          {touches.map(touch => {
            const isSelected = activeTouch === touch.step;
            return (
              <div
                key={touch.step}
                onClick={() => setActiveTouch(touch.step)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-[#17271F] shadow-[3px_3px_0px_#FF7054]'
                    : 'bg-[#FAF7F0] border-[#17271F]/20 hover:border-[#17271F]'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#FF7054]">{touch.day}</span>
                  <span className="text-[10px] uppercase font-bold bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#17271F]/20 text-[#17271F]">
                    Touch 0{touch.step}
                  </span>
                </div>
                <h3 className="font-editorial font-bold text-sm text-[#17271F] mt-1.5">
                  {touch.name}
                </h3>
                <p className="text-[11px] text-[#4A5E52] mt-1 line-clamp-1 italic">
                  {touch.groundingEvidence}
                </p>
              </div>
            );
          })}

          <div className="p-4 bg-[#FAF7F0] rounded-xl border-1.5 border-[#17271F] text-xs space-y-2 mt-4">
            <div className="flex items-center gap-2 font-bold text-[#17271F]">
              <ScoutMascot expression="curious" size="xs" animate={true} />
              <span>Scout's Sequence Guidance:</span>
            </div>
            <p className="text-[11px] text-[#4A5E52] leading-relaxed">
              "Never send more than 3 touches without new evidence. If the prospect doesn't engage, wait for the next verified public event."
            </p>
          </div>
        </div>

        {/* Selected Touch Draft Editor & Copy Controls (8 cols) */}
        <div className="lg:col-span-8">
          {(() => {
            const current = touches.find(t => t.step === activeTouch) || touches[0];
            return (
              <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2D9C8]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#FF7054]">
                        {current.day} • TOUCH 0{current.step}
                      </span>
                      <span className="sticker-badge bg-[#9DE3D0] text-[#17271F] border-[#17271F] text-[9px]">
                        Review Ready
                      </span>
                    </div>
                    <h2 className="text-lg font-editorial font-bold text-[#17271F] mt-0.5">
                      {current.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleEdit(current.step)}
                      className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      {current.isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                      <span>{current.isEditing ? 'Save' : 'Edit Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(current.step, `Subject: ${current.subject}\n\n${current.body}`)}
                      className="btn-tactile-lime px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      {copiedTouch === current.step ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTouch === current.step ? 'Copied!' : 'Copy Draft'}</span>
                    </button>
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#4A5E52] mb-1">
                    Subject Line
                  </label>
                  <div className="p-2.5 bg-[#FAF7F0] border border-[#17271F] rounded-lg text-xs font-bold text-[#17271F]">
                    {current.subject}
                  </div>
                </div>

                {/* Body Field */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#4A5E52] mb-1 flex items-center justify-between">
                    <span>Message Body</span>
                    <span className="text-[10px] text-[#4A5E52]">
                      {current.body.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </label>
                  {current.isEditing ? (
                    <textarea
                      rows={12}
                      value={current.body}
                      onChange={(e) => handleUpdateBody(current.step, e.target.value)}
                      className="w-full text-xs font-mono p-3 bg-[#FAF7F0] border-2 border-[#17271F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8FF65]"
                    />
                  ) : (
                    <div className="p-4 bg-[#FAF7F0] border border-[#E2D9C8] rounded-lg text-xs font-mono text-[#17271F] whitespace-pre-wrap leading-relaxed">
                      {current.body}
                    </div>
                  )}
                </div>

                {/* Grounding note */}
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8] text-xs text-[#4A5E52] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#9DE3D0] shrink-0" />
                  <span>
                    <strong className="text-[#17271F]">Grounding Context: </strong>
                    {current.groundingEvidence}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
