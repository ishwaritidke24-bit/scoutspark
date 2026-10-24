import React, { useState } from 'react';
import { Prospect, PipelineStage, ViewTab } from '../types';
import { ScoutMascot } from '../components/ScoutMascot';
import { ScoutPageBanner } from '../components/ScoutPageBanner';
import { 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  Edit3, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  MessageSquare,
  Sparkles,
  Users,
  Send,
  HelpCircle
} from 'lucide-react';

interface PipelineViewProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onUpdateStage: (id: string, stage: PipelineStage, notes?: string) => void;
  onOpenDiscovery?: () => void;
  onNavigateToTab?: (tab: ViewTab) => void;
  onOpenGuide?: () => void;
}

interface StageColumn {
  id: PipelineStage;
  title: string;
  subtitle: string;
  emptyTip: string;
  color: string;
  bgColor: string;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  prospects,
  onSelectProspect,
  onUpdateStage,
  onOpenDiscovery,
  onNavigateToTab,
  onOpenGuide,
}) => {
  const [editingNoteProspectId, setEditingNoteProspectId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  const columns: StageColumn[] = [
    { 
      id: 'to_research', 
      title: 'To search', 
      subtitle: 'Needs a quick web search for clues', 
      emptyTip: 'Run Discovery to search the public web for fresh clues.',
      color: '#4A5E52', 
      bgColor: 'bg-[#FAF7F0]' 
    },
    { 
      id: 'ready_to_review', 
      title: 'Ready to check', 
      subtitle: 'Clues found, email draft ready for you', 
      emptyTip: 'Leads with verified facts and prepared drafts appear here.',
      color: '#FF7054', 
      bgColor: 'bg-[#FFEAE5]' 
    },
    { 
      id: 'approved', 
      title: 'Ready to send', 
      subtitle: 'You checked it and gave it a thumbs up', 
      emptyTip: 'Approve a draft in the lead dossier to move it here.',
      color: '#17271F', 
      bgColor: 'bg-[#9DE3D0]/30' 
    },
    { 
      id: 'contacted', 
      title: 'Reached out', 
      subtitle: 'Message copied and sent from your email', 
      emptyTip: 'After sending an approved message, advance it here.',
      color: '#17271F', 
      bgColor: 'bg-[#D8FF65]/30' 
    },
    { 
      id: 'replied', 
      title: 'Got a reply', 
      subtitle: 'They wrote back to your outreach!', 
      emptyTip: 'Move leads here when a prospect responds to your email.',
      color: '#FF7054', 
      bgColor: 'bg-[#FAF7F0]' 
    },
    { 
      id: 'meeting', 
      title: 'Meeting booked', 
      subtitle: 'Demo or discovery call is on your calendar', 
      emptyTip: 'Move leads here when a meeting or demo call is scheduled.',
      color: '#17271F', 
      bgColor: 'bg-[#9DE3D0]' 
    },
    { 
      id: 'won', 
      title: 'Customer won!', 
      subtitle: 'Signed up or converted to paying pilot', 
      emptyTip: 'Celebrate wins! Closed-won customers live here.',
      color: '#17271F', 
      bgColor: 'bg-[#D8FF65]' 
    },
    { 
      id: 'not_a_fit', 
      title: 'Not a fit', 
      subtitle: 'Passed on or not looking right now', 
      emptyTip: 'Keep your pipeline focused by disqualifying non-fits.',
      color: '#4A5E52', 
      bgColor: 'bg-[#FAF7F0]' 
    },
  ];

  const handleMoveStage = (prospect: Prospect, direction: 'prev' | 'next') => {
    const currentIndex = columns.findIndex(c => c.id === prospect.pipelineStage);
    if (currentIndex === -1) return;

    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < columns.length) {
      onUpdateStage(prospect.id, columns[newIndex].id);
    }
  };

  const handleSaveNote = (prospectId: string) => {
    const p = prospects.find(item => item.id === prospectId);
    if (p) {
      onUpdateStage(prospectId, p.pipelineStage, tempNote);
    }
    setEditingNoteProspectId(null);
  };

  const firstReadyLead = prospects.find(p => p.pipelineStage === 'ready_to_review');

  return (
    <div className="space-y-6 pb-12">
      {/* ScoutStar Contextual Guidance Banner */}
      <ScoutPageBanner
        expression="focused"
        title="Pipeline"
        subtitle="Manage your sales momentum stage by stage — from checking facts to approving personalized email drafts, sending outreach, and booking calls."
        whatItDoes="Visualizes all active leads across 8 Kanban stages with easy 1-click stage advancement, custom notes, and approval tags."
        whenToUse="Daily workflow: review waiting drafts, advance leads as you message them, and track meeting bookings."
        nextActionText={firstReadyLead ? `Review ${firstReadyLead.companyName}` : onOpenDiscovery ? "Find My Next Leads" : "View Leads"}
        onNextAction={firstReadyLead ? () => onSelectProspect(firstReadyLead) : onOpenDiscovery || (() => onNavigateToTab && onNavigateToTab('prospects'))}
        onOpenTour={onOpenGuide}
        badge="STEP 4"
        highlightText="100% Human Review: No emails ever send automatically without you."
      />

      {/* Header */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 shadow-[4px_4px_0px_#17271F] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-editorial font-bold text-[#17271F]">
              Your Outreach Pipeline
            </h1>
            <span className="sticker-badge bg-[#D8FF65] text-[#17271F] border-[#17271F] text-[10px]">
              {prospects.length} Active Leads
            </span>
          </div>
          <p className="text-xs text-[#4A5E52] mt-0.5">
            See where each business is in your process—from finding clues to sending messages and booking calls.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenDiscovery && (
            <button
              onClick={onOpenDiscovery}
              className="btn-tactile-coral px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Find My Next…</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs bg-[#FAF7F0] p-2 rounded-xl border border-[#17271F]">
            <ShieldCheck className="w-4 h-4 text-[#FF7054] shrink-0" />
            <span className="text-[#17271F] font-medium text-[11px]">
              Zero auto-send: You review and approve every email yourself.
            </span>
          </div>
        </div>
      </div>

      {/* Full Pipeline Empty State */}
      {prospects.length === 0 ? (
        <div className="bg-white border-2 border-[#17271F] rounded-2xl p-12 text-center shadow-[4px_4px_0px_#17271F] space-y-4 max-w-lg mx-auto my-8">
          <ScoutMascot expression="curious" size="xl" animate={true} />
          <div className="space-y-1">
            <h3 className="text-xl font-editorial font-bold text-[#17271F]">
              Your pipeline is currently empty
            </h3>
            <p className="text-xs text-[#4A5E52] leading-relaxed">
              When you discover leads or import candidates, they'll land here so you can review their facts, approve their email drafts, and track replies.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {onOpenDiscovery && (
              <button
                onClick={onOpenDiscovery}
                className="btn-tactile-coral px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Find My Next Customers</span>
              </button>
            )}
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('settings')}
                className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Set Target Customer First</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Kanban Board Container (Scrollable horizontally) */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1380px]">
            {columns.map(col => {
              const stageProspects = prospects.filter(p => p.pipelineStage === col.id);

              return (
                <div
                  key={col.id}
                  className="w-72 flex-shrink-0 bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl p-3.5 shadow-[3px_3px_0px_#17271F] flex flex-col min-h-[580px]"
                >
                  {/* Column Header */}
                  <div className="pb-3 border-b-2 border-[#17271F]/20 mb-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-editorial font-bold text-[#17271F] uppercase tracking-wide">
                        {col.title}
                      </h2>
                      <span className="w-5 h-5 rounded-full bg-[#17271F] text-[#D8FF65] font-mono text-[11px] font-bold flex items-center justify-center">
                        {stageProspects.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#4A5E52] mt-0.5 leading-snug">
                      {col.subtitle}
                    </p>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {stageProspects.length === 0 ? (
                      <div className="h-32 border border-dashed border-[#17271F]/20 rounded-xl flex flex-col items-center justify-center p-3 text-center text-[11px] text-[#4A5E52]/70 space-y-1">
                        <span className="font-semibold text-[#17271F]/80">Empty stage</span>
                        <p className="text-[10px] leading-tight text-[#4A5E52]/80">
                          {col.emptyTip}
                        </p>
                      </div>
                    ) : (
                      stageProspects.map(prospect => (
                        <div
                          key={prospect.id}
                          className="bg-white border-1.5 border-[#17271F] rounded-xl p-3.5 shadow-[2px_2px_0px_#17271F] hover:shadow-[3px_3px_0px_#17271F] transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Card Top */}
                            <div className="flex items-start justify-between gap-2">
                              <div 
                                onClick={() => onSelectProspect(prospect)}
                                className="cursor-pointer group flex-1"
                              >
                                <h3 className="font-editorial font-bold text-sm text-[#17271F] group-hover:text-[#FF7054] transition-colors leading-snug">
                                  {prospect.companyName}
                                </h3>
                                <p className="text-[11px] text-[#4A5E52]">
                                  {prospect.subIndustry}
                                </p>
                              </div>

                              <span className="font-mono text-xs font-bold bg-[#D8FF65] text-[#17271F] border border-[#17271F] px-1.5 py-0.5 rounded shrink-0">
                                {prospect.fitScore}%
                              </span>
                            </div>

                            {/* Buyer info */}
                            <div className="mt-2.5 p-1.5 bg-[#FAF7F0] rounded border border-[#E2D9C8] text-[11px] text-[#17271F]">
                              <span className="font-bold">{prospect.targetBuyer.name}</span>
                              <span className="text-[#4A5E52] block text-[10px]">
                                {prospect.targetBuyer.title}
                              </span>
                            </div>

                            {/* Outcome / Notes Badge */}
                            {prospect.outcomeNotes && (
                              <div className="mt-2 text-[10px] bg-[#FFEAE5] border border-[#FF7054]/40 text-[#17271F] p-1.5 rounded leading-tight">
                                <span className="font-semibold text-[#FF7054]">Note: </span>
                                {prospect.outcomeNotes}
                              </div>
                            )}

                            {/* Inline note edit box */}
                            {editingNoteProspectId === prospect.id ? (
                              <div className="mt-2 space-y-1">
                                <input
                                  type="text"
                                  value={tempNote}
                                  onChange={(e) => setTempNote(e.target.value)}
                                  placeholder="Add a quick note about what happened..."
                                  className="w-full text-[10px] p-1.5 border border-[#17271F] rounded bg-[#FAF7F0] focus:outline-none"
                                />
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => setEditingNoteProspectId(null)}
                                    className="px-2 py-0.5 text-[10px] text-[#4A5E52]"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveNote(prospect.id)}
                                    className="btn-tactile-coral px-2 py-0.5 rounded text-[10px] font-bold"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>

                          {/* Card Actions Bottom */}
                          <div className="mt-3 pt-2.5 border-t border-[#E2D9C8] flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingNoteProspectId(prospect.id);
                                  setTempNote(prospect.outcomeNotes || '');
                                }}
                                className="p-1 text-[#4A5E52] hover:text-[#17271F] rounded hover:bg-[#FAF7F0]"
                                title="Add/Edit Note"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onSelectProspect(prospect)}
                                className="text-[10px] text-[#FF7054] font-semibold hover:underline"
                              >
                                Open dossier
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveStage(prospect, 'prev')}
                                disabled={col.id === columns[0].id}
                                className="p-1 rounded bg-[#FAF7F0] border border-[#17271F]/30 hover:bg-[#17271F] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="Move to previous stage"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMoveStage(prospect, 'next')}
                                disabled={col.id === columns[columns.length - 1].id}
                                className="p-1 rounded bg-[#FAF7F0] border border-[#17271F]/30 hover:bg-[#17271F] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="Move to next stage"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contextual Journey Next Step Banner */}
      {onNavigateToTab && prospects.length > 0 && (
        <div className="p-4 bg-white border-2 border-[#17271F] rounded-xl shadow-[3px_3px_0px_#17271F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-editorial font-bold text-[#17271F] flex items-center gap-1.5">
              <span>Logical Next Step:</span>
              <span className="text-[#FF7054]">Review Multi-Touch Message Sequences</span>
            </div>
            <p className="text-[11px] text-[#4A5E52]">
              Need follow-up copy or benchmark data to send after Day 1? Check our battle-tested sequences.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToTab('campaigns')}
              className="btn-tactile-coral px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View Message Sequences</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateToTab('prospects')}
              className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Find Leads
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
