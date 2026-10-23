import React from 'react';
import { Prospect, ResearchSignal, ActivityItem, PipelineStage } from '../types';
import { ScoutMascot } from '../components/ScoutMascot';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Users, 
  ArrowUpRight,
  Target,
  FileCheck,
  Zap
} from 'lucide-react';

interface OverviewViewProps {
  prospects: Prospect[];
  signals: ResearchSignal[];
  activities: ActivityItem[];
  onOpenDiscovery: () => void;
  onSelectProspect: (prospect: Prospect) => void;
  onNavigateToTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  prospects,
  signals,
  activities,
  onOpenDiscovery,
  onSelectProspect,
  onNavigateToTab,
}) => {
  // Compute pipeline stage counts
  const stageCounts: Record<PipelineStage, number> = {
    to_research: prospects.filter(p => p.pipelineStage === 'to_research').length,
    ready_to_review: prospects.filter(p => p.pipelineStage === 'ready_to_review').length,
    approved: prospects.filter(p => p.pipelineStage === 'approved').length,
    contacted: prospects.filter(p => p.pipelineStage === 'contacted').length,
    replied: prospects.filter(p => p.pipelineStage === 'replied').length,
    meeting: prospects.filter(p => p.pipelineStage === 'meeting').length,
    won: prospects.filter(p => p.pipelineStage === 'won').length,
    not_a_fit: prospects.filter(p => p.pipelineStage === 'not_a_fit').length,
  };

  // High fit shortlist sorted by score
  const shortlist = [...prospects].sort((a, b) => b.fitScore - a.fitScore).slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Hero Banner */}
      <div className="card-tactile p-6 sm:p-8 rounded-2xl relative overflow-hidden bg-[#FAF7F0] border-2 border-[#17271F]">
        {/* Subtle decorative background sketch */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(#D8FF65_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17271F] text-[#D8FF65] text-xs font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF65] animate-ping" />
              SMART LEAD SEARCH FOR STARTUP FOUNDERS
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-bold text-[#17271F] tracking-tight leading-[1.15]">
              Stop guessing. Let's find your next customer.
            </h1>

            <p className="text-sm sm:text-base text-[#4A5E52] leading-relaxed font-normal">
              Find businesses that might need your product, see why they could be a good fit, and write messages that feel personal. You stay in control of every message.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenDiscovery}
                className="btn-tactile-coral px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Find my next customers</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => onNavigateToTab('prospects')}
                className="btn-tactile-secondary px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <span>See all 8 businesses</span>
              </button>

              <span className="text-xs text-[#4A5E52] italic flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FF7054]" />
                We never send messages without you
              </span>
            </div>
          </div>

          {/* Scout Mascot Feature Box */}
          <div className="bg-[#FFFFFF] border-2 border-[#17271F] rounded-2xl p-5 shadow-[4px_4px_0px_#17271F] flex flex-col items-center text-center max-w-xs shrink-0">
            <ScoutMascot expression="curious" size="lg" animate={true} />
            <div className="mt-3">
              <div className="text-xs font-bold text-[#17271F] uppercase tracking-wider font-mono">
                Meet Scout
              </div>
              <p className="text-xs text-[#4A5E52] mt-1 italic">
                "I dig through real news and company updates so you never have to send boring copy-paste emails."
              </p>
              <div className="mt-3 pt-2.5 border-t border-[#E2D9C8] text-[11px] text-[#17271F] font-semibold flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#9DE3D0]" />
                <span>5 fresh updates found today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Compact Workflow Strip */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 shadow-[3px_3px_0px_#17271F]">
        <div className="text-xs font-bold uppercase tracking-wider text-[#4A5E52] mb-3 flex items-center justify-between">
          <span>How Scout works with you</span>
          <span className="text-[11px] font-mono text-[#FF7054]">SOURCE-BACKED DETAILS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#17271F] text-[#D8FF65] font-mono text-xs font-bold flex items-center justify-center">1</span>
              <span className="text-xs font-bold text-[#17271F]">Pick your ideal customer</span>
            </div>
            <p className="text-[11px] text-[#4A5E52]">Tell Scout the kind of business, team size, and role you want to reach.</p>
          </div>

          <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#17271F] text-[#D8FF65] font-mono text-xs font-bold flex items-center justify-center">2</span>
              <span className="text-xs font-bold text-[#17271F]">Find real clues</span>
            </div>
            <p className="text-[11px] text-[#4A5E52]">Spot new hires, tech updates, and public news from real web sources.</p>
          </div>

          <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#17271F] text-[#D8FF65] font-mono text-xs font-bold flex items-center justify-center">3</span>
              <span className="text-xs font-bold text-[#17271F]">Separate source details from guesses</span>
            </div>
            <p className="text-[11px] text-[#4A5E52]">Keep source-backed details separate from what might be true.</p>
          </div>

          <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#17271F] text-[#D8FF65] font-mono text-xs font-bold flex items-center justify-center">4</span>
              <span className="text-xs font-bold text-[#17271F]">You stay in charge</span>
            </div>
            <p className="text-[11px] text-[#4A5E52]">Review and tweak your email draft before copying it. Nothing sends on its own.</p>
          </div>
        </div>
      </div>

      {/* Pipeline Snapshot Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-editorial font-bold text-[#17271F]">
            Your lead pipeline
          </h2>
          <button
            onClick={() => onNavigateToTab('pipeline')}
            className="text-xs font-semibold text-[#17271F] hover:text-[#FF7054] flex items-center gap-1"
          >
            See full board <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'To search', count: stageCounts.to_research, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/30' },
            { label: 'Ready to check', count: stageCounts.ready_to_review, bg: 'bg-[#FFEAE5]', border: 'border-[#FF7054]' },
            { label: 'Ready to send', count: stageCounts.approved, bg: 'bg-[#D8FF65]/30', border: 'border-[#17271F]' },
            { label: 'Reached out', count: stageCounts.contacted, bg: 'bg-[#9DE3D0]/30', border: 'border-[#17271F]' },
            { label: 'Got a reply', count: stageCounts.replied, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/30' },
            { label: 'Meeting booked', count: stageCounts.meeting, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/30' },
            { label: 'Customer won!', count: stageCounts.won, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/30' },
            { label: 'Not a fit', count: stageCounts.not_a_fit, bg: 'bg-[#FAF7F0]', border: 'border-[#17271F]/30' },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigateToTab('pipeline')}
              className={`p-3 rounded-xl border-1.5 ${item.border} ${item.bg} text-center cursor-pointer hover:-translate-y-0.5 transition-transform shadow-[2px_2px_0px_rgba(23,39,31,0.06)]`}
            >
              <div className="text-xl font-bold font-mono text-[#17271F]">{item.count}</div>
              <div className="text-[10px] font-semibold text-[#4A5E52] uppercase tracking-wider truncate mt-0.5">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: High Fit Shortlist & Today's Research Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Priority Shortlist (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-editorial font-bold text-[#17271F]">
                Best matches right now
              </h2>
              <p className="text-xs text-[#4A5E52]">Businesses that match your criteria with fresh public news</p>
            </div>
            <button
              onClick={() => onNavigateToTab('prospects')}
              className="text-xs font-semibold text-[#FF7054] hover:underline"
            >
              See all 8
            </button>
          </div>

          <div className="space-y-3">
            {shortlist.map(prospect => (
              <div
                key={prospect.id}
                onClick={() => onSelectProspect(prospect)}
                className="card-tactile p-4 rounded-xl cursor-pointer hover:border-[#17271F] group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#D8FF65] border-1.5 border-[#17271F] flex flex-col items-center justify-center font-mono font-bold text-[#17271F] shadow-[2px_2px_0px_#17271F] shrink-0">
                      <span className="text-lg leading-none">{prospect.fitScore}</span>
                      <span className="text-[8px] uppercase tracking-tight">MATCH</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-editorial font-bold text-[#17271F] group-hover:text-[#FF7054] transition-colors">
                          {prospect.companyName}
                        </h3>
                        <span className="text-[10px] font-mono text-[#4A5E52]">
                          {prospect.stage.split(' •')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A5E52] mt-0.5 line-clamp-1">
                        {prospect.summary}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#17271F] mt-2">
                        <span className="font-semibold text-[#FF7054]">
                          {prospect.targetBuyer.name} ({prospect.targetBuyer.title})
                        </span>
                        <span>•</span>
                        <span className="text-[#4A5E52]">
                          {prospect.observedFacts.length} source details
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      prospect.pipelineStage === 'approved' 
                        ? 'bg-[#9DE3D0] text-[#17271F] border-[#17271F]' 
                        : prospect.pipelineStage === 'ready_to_review'
                        ? 'bg-[#FFEAE5] text-[#FF7054] border-[#FF7054]'
                        : 'bg-[#FAF7F0] text-[#4A5E52] border-[#E2D9C8]'
                    }`}>
                      {prospect.pipelineStage === 'approved'
                        ? 'ready to send'
                        : prospect.pipelineStage === 'ready_to_review'
                        ? 'ready to check'
                        : prospect.pipelineStage.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-[#4A5E52] flex items-center gap-0.5 mt-1">
                      Check details <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Research Signals & Recent Activities (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Research Signals */}
          <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 shadow-[3px_3px_0px_#17271F]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2D9C8]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF7054]" />
                <h2 className="text-sm font-editorial font-bold text-[#17271F]">
                  Fresh company clues
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#4A5E52]">Public updates</span>
            </div>

            <div className="space-y-3 mt-3">
              {signals.slice(0, 3).map(sig => (
                <div key={sig.id} className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E2D9C8] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17271F]">{sig.companyName}</span>
                    <span className="text-[10px] text-[#4A5E52] font-mono">{sig.timestamp}</span>
                  </div>
                  <p className="font-semibold text-xs text-[#17271F]">{sig.title}</p>
                  <p className="text-[11px] text-[#4A5E52] line-clamp-2">{sig.summary}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-[#FF7054] font-semibold">{sig.impactBadge}</span>
                    <span className="text-[#17271F] font-mono">Confidence: {sig.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-2xl p-4 shadow-[2px_2px_0px_#17271F]">
            <div className="flex items-center justify-between pb-2 border-b border-[#17271F]/15 mb-3">
              <h3 className="text-xs font-editorial font-bold text-[#17271F]">
                What happened recently
              </h3>
              <span className="text-[10px] text-[#4A5E52]">Activity history</span>
            </div>

            <div className="space-y-2.5">
              {activities.slice(0, 4).map(act => (
                <div key={act.id} className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#17271F]">{act.title}</span>
                    <span className="text-[10px] text-[#4A5E52]">{act.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#4A5E52] leading-snug">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
