import React, { useState } from 'react';
import { Prospect, PipelineStage } from '../types';
import { ScoutMascot } from '../components/ScoutMascot';
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
  Sparkles
} from 'lucide-react';

interface PipelineViewProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onUpdateStage: (id: string, stage: PipelineStage, notes?: string) => void;
}

interface StageColumn {
  id: PipelineStage;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  prospects,
  onSelectProspect,
  onUpdateStage,
}) => {
  const [editingNoteProspectId, setEditingNoteProspectId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  const columns: StageColumn[] = [
    { id: 'to_research', title: 'To Research', subtitle: 'Queued for public evidence check', color: '#4A5E52', bgColor: 'bg-[#FAF7F0]' },
    { id: 'ready_to_review', title: 'Ready to Review', subtitle: 'Signals grounded, draft prepared', color: '#FF7054', bgColor: 'bg-[#FFEAE5]' },
    { id: 'approved', title: 'Approved', subtitle: 'Human verified for founder outbound', color: '#17271F', bgColor: 'bg-[#9DE3D0]/30' },
    { id: 'contacted', title: 'Contacted', subtitle: 'Outbound dispatched manually', color: '#17271F', bgColor: 'bg-[#D8FF65]/30' },
    { id: 'replied', title: 'Replied', subtitle: 'Prospect engaged / responded', color: '#FF7054', bgColor: 'bg-[#FAF7F0]' },
    { id: 'meeting', title: 'Meeting Booked', subtitle: 'Discovery call on calendar', color: '#17271F', bgColor: 'bg-[#9DE3D0]' },
    { id: 'won', title: 'Won / Converted', subtitle: 'Signed customer or pilot', color: '#17271F', bgColor: 'bg-[#D8FF65]' },
    { id: 'not_a_fit', title: 'Not a Fit', subtitle: 'Disqualified or blocked', color: '#4A5E52', bgColor: 'bg-[#FAF7F0]' },
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 shadow-[4px_4px_0px_#17271F] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-editorial font-bold text-[#17271F]">
              Outreach & Acquisition Pipeline
            </h1>
            <span className="sticker-badge bg-[#D8FF65] text-[#17271F] border-[#17271F] text-[10px]">
              8 Active Accounts
            </span>
          </div>
          <p className="text-xs text-[#4A5E52] mt-0.5">
            Track founder-controlled progress from public signal detection to human outbound and conversation outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-[#FAF7F0] p-2.5 rounded-xl border border-[#17271F]">
          <ShieldCheck className="w-4 h-4 text-[#FF7054] shrink-0" />
          <span className="text-[#17271F] font-medium">
            Human-in-the-Loop Protocol: First version never auto-sends.
          </span>
        </div>
      </div>

      {/* Kanban Board Container (Scrollable horizontally if needed) */}
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
                    <div className="h-32 border border-dashed border-[#17271F]/20 rounded-xl flex items-center justify-center text-[11px] text-[#4A5E52]/60 italic">
                      No accounts in stage
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
                              className="cursor-pointer group"
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
                                placeholder="Enter outcome notes..."
                                className="w-full text-[10px] p-1.5 border border-[#17271F] rounded bg-[#FAF7F0] focus:outline-none"
                              />
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => setEditingNoteProspectId(null)}
                                  className="text-[10px] px-2 py-0.5 text-[#4A5E52]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveNote(prospect.id)}
                                  className="btn-tactile-lime text-[10px] px-2 py-0.5 rounded font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Card Controls */}
                        <div className="mt-3 pt-2.5 border-t border-[#E2D9C8] flex items-center justify-between text-xs">
                          {/* Note icon */}
                          <button
                            onClick={() => {
                              setEditingNoteProspectId(prospect.id);
                              setTempNote(prospect.outcomeNotes || '');
                            }}
                            className="text-[#4A5E52] hover:text-[#17271F] p-1"
                            title="Add / Edit outcome note"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect link */}
                          <button
                            onClick={() => onSelectProspect(prospect)}
                            className="text-[11px] font-semibold text-[#FF7054] hover:underline"
                          >
                            Inspect
                          </button>

                          {/* Move arrows */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveStage(prospect, 'prev')}
                              disabled={col.id === columns[0].id}
                              className="p-1 rounded bg-[#FAF7F0] border border-[#17271F]/30 hover:bg-[#17271F] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="Move to previous stage"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveStage(prospect, 'next')}
                              disabled={col.id === columns[columns.length - 1].id}
                              className="p-1 rounded bg-[#FAF7F0] border border-[#17271F]/30 hover:bg-[#17271F] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="Advance to next stage"
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
    </div>
  );
};
