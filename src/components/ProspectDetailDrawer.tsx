import React, { useState, useEffect } from 'react';
import { 
  Prospect, 
  PipelineStage, 
  EmailDraft, 
  ObservedFact, 
  Hypothesis 
} from '../types';
import { ScoutMascot } from './ScoutMascot';
import { 
  X, 
  Check, 
  Copy, 
  Edit3, 
  Save, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Send, 
  Building2, 
  Users, 
  MapPin, 
  Target, 
  Compass, 
  Clock, 
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProspectDetailDrawerProps {
  prospect: Prospect | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStage: (id: string, stage: PipelineStage, notes?: string) => void;
  onUpdateEmailDraft: (id: string, draftPatch: Partial<EmailDraft>) => void;
  onApproveDraft: (id: string) => void;
}

export const ProspectDetailDrawer: React.FC<ProspectDetailDrawerProps> = ({
  prospect,
  isOpen,
  onClose,
  onUpdateStage,
  onUpdateEmailDraft,
  onApproveDraft,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'outreach'>('evidence');
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [subjectText, setSubjectText] = useState<string>('');
  const [bodyText, setBodyText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [outcomeNote, setOutcomeNote] = useState<string>('');
  const [showOutcomeInput, setShowOutcomeInput] = useState<boolean>(false);

  useEffect(() => {
    if (prospect) {
      setSubjectText(prospect.emailDraft.subject);
      setBodyText(prospect.emailDraft.body);
      setIsEditingEmail(false);
      setOutcomeNote(prospect.outcomeNotes || '');
    }
  }, [prospect]);

  if (!isOpen || !prospect) return null;

  const handleCopyEmail = () => {
    const fullText = `Subject: ${subjectText}\n\n${bodyText}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSaveEmail = () => {
    onUpdateEmailDraft(prospect.id, {
      subject: subjectText,
      body: bodyText
    });
    setIsEditingEmail(false);
  };

  const handleApprove = () => {
    // Trigger celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#D8FF65', '#FF7054', '#9DE3D0', '#17271F']
    });
    onApproveDraft(prospect.id);
  };

  const stageOptions: { value: PipelineStage; label: string }[] = [
    { value: 'to_research', label: 'To Search' },
    { value: 'ready_to_review', label: 'Ready to Check' },
    { value: 'approved', label: 'Approved (Checked by You)' },
    { value: 'contacted', label: 'Message Sent' },
    { value: 'replied', label: 'Got a Reply' },
    { value: 'meeting', label: 'Meeting Booked' },
    { value: 'won', label: 'Customer Won!' },
    { value: 'not_a_fit', label: 'Not a Fit' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#17271F] bg-[#D8FF65] border-[#17271F]';
    if (score >= 75) return 'text-[#17271F] bg-[#9DE3D0] border-[#17271F]';
    if (score >= 60) return 'text-[#17271F] bg-[#FFEAE5] border-[#FF7054]';
    return 'text-[#17271F] bg-[#E2D9C8] border-[#4A5E52]';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#17271F]/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#FAF7F0] h-full shadow-[-8px_0px_0px_#17271F] border-l-2 border-[#17271F] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-label="Prospect Intelligence Dossier"
      >
        {/* Drawer Header */}
        <div className="p-6 bg-[#17271F] text-[#F7F2E8] border-b-2 border-[#17271F] flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center font-bold font-mono shadow-[2px_2px_0px_#D8FF65] ${getScoreColor(prospect.fitScore)}`}>
                <span className="text-xl leading-none">{prospect.fitScore}</span>
                <span className="text-[9px] uppercase tracking-tighter mt-0.5">MATCH SCORE</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-editorial font-bold text-white tracking-tight">
                    {prospect.companyName}
                  </h2>
                  <span className="sticker-badge bg-[#D8FF65] text-[#17271F] border-[#17271F] text-[10px]">
                    {prospect.fitLevel}
                  </span>
                  {prospect.provenance === 'researched' ? (
                    <span className="sticker-badge bg-[#9DE3D0] text-[#17271F] border-[#17271F] text-[10px] font-mono">
                      🌐 Found Online
                    </span>
                  ) : prospect.provenance === 'csv' ? (
                    <span className="sticker-badge bg-[#FFEAE5] text-[#FF7054] border-[#FF7054] text-[10px] font-mono">
                      Imported List
                    </span>
                  ) : (
                    <span className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] text-[10px] font-mono">
                      Sample Lead
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#9DE3D0] mt-1">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {prospect.subIndustry}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {prospect.headquarters}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#F7F2E8]/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pipeline Stage Quick Switcher */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#9DE3D0] font-medium">Stage:</span>
              <select
                value={prospect.pipelineStage}
                onChange={(e) => onUpdateStage(prospect.id, e.target.value as PipelineStage)}
                className="bg-[#243B30] text-white border border-[#9DE3D0]/40 rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#D8FF65]"
              >
                {stageOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#17271F] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOutcomeInput(!showOutcomeInput)}
                className="text-xs text-[#D8FF65] hover:underline flex items-center gap-1 font-medium"
              >
                <Edit3 className="w-3 h-3" /> {prospect.outcomeNotes ? 'Edit Note' : '+ Add Note'}
              </button>
            </div>
          </div>

          {/* Outcome Note field if expanded */}
          {showOutcomeInput && (
            <div className="mt-3 p-2.5 bg-[#243B30] rounded-lg border border-[#9DE3D0]/30 flex items-center gap-2">
              <input
                type="text"
                value={outcomeNote}
                onChange={(e) => setOutcomeNote(e.target.value)}
                placeholder="e.g. Replied asking for pricing, meeting set for Thursday..."
                className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <button
                onClick={() => {
                  onUpdateStage(prospect.id, prospect.pipelineStage, outcomeNote);
                  setShowOutcomeInput(false);
                }}
                className="btn-tactile-lime px-2.5 py-1 rounded text-[11px] font-bold"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#17271F]/15 bg-[#F7F2E8] px-6">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'evidence'
                ? 'border-[#17271F] text-[#17271F]'
                : 'border-transparent text-[#4A5E52] hover:text-[#17271F]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#FF7054]" />
            What we found ({prospect.observedFacts.length})
          </button>

          <button
            onClick={() => setActiveTab('outreach')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'outreach'
                ? 'border-[#17271F] text-[#17271F]'
                : 'border-transparent text-[#4A5E52] hover:text-[#17271F]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#FF7054]" />
            Message Draft {prospect.emailDraft.isApproved && '✓'}
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'evidence' ? (
            <div className="space-y-6">
              {/* Executive Company Summary */}
              <div className="bg-white border-1.5 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F]">
                <div className="flex items-center justify-between text-xs font-bold text-[#4A5E52] uppercase tracking-wider mb-1.5">
                  <span>Company Summary</span>
                  <span className="font-mono text-[#17271F]">{prospect.stage}</span>
                </div>
                <p className="text-sm text-[#17271F] font-medium leading-relaxed">
                  {prospect.summary}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#E2D9C8]">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#17271F] bg-[#FAF7F0] border border-[#17271F]/30 px-2 py-0.5 rounded">
                    <Users className="w-3 h-3 text-[#FF7054]" /> {prospect.employeeCount}
                  </span>
                  {prospect.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] text-[#4A5E52] bg-[#FAF7F0] border border-[#E2D9C8] px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fit Reasons Breakdown */}
              <div className="bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#17271F] uppercase tracking-wider mb-2.5">
                  <Target className="w-4 h-4 text-[#FF7054]" />
                  <span>Why this company fits what you are looking for</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#17271F]">
                  {prospect.fitReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF7054] mt-1.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CRITICAL SECTION: Observed Facts vs Hypotheses */}
              <div className="space-y-4">
                {/* Section A: What we found */}
                <div className="bg-white border-1.5 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2D9C8]">
                    <div className="flex items-center gap-2">
                      <span className="sticker-badge bg-[#9DE3D0] text-[#17271F] border-[#17271F] text-[10px]">
                        What we found ({prospect.observedFacts.length})
                      </span>
                    </div>
                    <span className="text-[11px] text-[#4A5E52] italic font-mono">Found in source snippets</span>
                  </div>

                  <div className="space-y-3 mt-3">
                    {prospect.observedFacts.map(fact => (
                      <div key={fact.id} className="p-3 bg-[#FAF7F0] rounded-lg border border-[#E2D9C8] text-xs space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-[#17271F] leading-snug">
                            {fact.fact}
                          </p>
                          <span className="shrink-0 text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#17271F]/30 text-[#17271F]">
                            Found in source
                          </span>
                        </div>
                        {fact.sourceUrl && (
                          <div className="pt-1">
                            <a
                              href={fact.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#FF7054] hover:underline flex items-center gap-1 font-mono break-all"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span>{fact.sourceUrl}</span>
                            </a>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-[#4A5E52] pt-1 border-t border-[#E2D9C8]/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {fact.date || 'Recently found online'}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-[#4A5E52]">
                            Where this came from: {fact.source}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-[11px] text-[#4A5E52] italic flex items-center gap-1 bg-[#FAF7F0] p-2 rounded border border-[#E2D9C8]">
                    <Info className="w-3.5 h-3.5 shrink-0 text-[#4A5E52]" />
                    <span>About these details: These points were found in online source snippets. They reflect what public sources state, not independent verification. Unconfirmed ideas are listed below as guesses.</span>
                  </div>
                </div>

                {/* Section B: What might be true */}
                <div className="bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#17271F]/15">
                    <div className="flex items-center gap-2">
                      <span className="sticker-badge bg-[#D8FF65] text-[#17271F] border-[#17271F] text-[10px]">
                        What might be true ({prospect.hypotheses.length})
                      </span>
                    </div>
                    <span className="text-[11px] text-[#4A5E52] italic">Unconfirmed guesses to double-check</span>
                  </div>

                  <div className="space-y-3 mt-3">
                    {prospect.hypotheses.map(hyp => (
                      <div key={hyp.id} className="p-3 bg-white rounded-lg border border-[#17271F]/20 text-xs space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-[#17271F] italic leading-snug">
                            "{hyp.hypothesis}"
                          </p>
                          <span className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            hyp.confidence === 'high' ? 'bg-[#D8FF65] text-[#17271F] border-[#17271F]' : 'bg-[#FFEAE5] text-[#FF7054] border-[#FF7054]'
                          }`}>
                            {hyp.confidence === 'high' ? 'High Confidence' : 'Unconfirmed Guess'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4A5E52]">
                          <span className="font-semibold text-[#17271F]">Why we think this might be true: </span>
                          {hyp.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: What we still don't know */}
                <div className="bg-[#FFEAE5]/40 border-1.5 border-[#FF7054]/50 rounded-xl p-4 shadow-[2px_2px_0px_rgba(255,112,84,0.3)]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FF7054] uppercase tracking-wider mb-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF7054]" />
                    <span>What we still don't know</span>
                  </div>

                  <div className="space-y-2 text-xs text-[#17271F]">
                    {prospect.missingInformation.map((info, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-[#FF7054] font-bold">?</span>
                        <span>{info}</span>
                      </div>
                    ))}
                    {prospect.uncertaintyIndicators.map((unc, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[#4A5E52] italic">
                        <span className="text-[#4A5E52]">•</span>
                        <span>Keep in mind: {unc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Outreach Studio */
            <div className="space-y-6">
              {/* Target Buyer Persona */}
              <div className="bg-white border-1.5 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F] flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#4A5E52]">
                    Person to Contact
                  </div>
                  <h3 className="text-base font-editorial font-bold text-[#17271F] mt-0.5">
                    {prospect.targetBuyer.name}
                  </h3>
                  <p className="text-xs text-[#4A5E52]">{prospect.targetBuyer.title}</p>
                  <p className="text-xs text-[#FF7054] font-medium mt-1">
                    {prospect.targetBuyer.roleType}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[11px] font-mono bg-[#FAF7F0] border border-[#17271F]/30 px-2 py-1 rounded text-[#17271F]">
                    {prospect.targetBuyer.emailPlaceholder}
                  </span>
                  <div className="text-[10px] text-[#4A5E52] mt-1 italic">
                    Sample email format
                  </div>
                </div>
              </div>

              {/* Recommended Outreach Strategy Angle */}
              <div className="bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-xl p-4 shadow-[2px_2px_0px_#17271F] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#17271F] uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-[#FF7054]" />
                  <span>Suggested Talking Points</span>
                </div>
                <div className="space-y-2 text-xs text-[#17271F]">
                  <div>
                    <span className="font-bold text-[#4A5E52]">Opening line: </span>
                    <span>{prospect.recommendedAngle.hook}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#4A5E52]">Why it helps them: </span>
                    <span>{prospect.recommendedAngle.valueProposition}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#4A5E52]">Next step to suggest: </span>
                    <span className="font-medium text-[#17271F] bg-[#D8FF65]/30 px-1 rounded">
                      {prospect.recommendedAngle.suggestedCta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Human-In-The-Loop Outreach Editor */}
              <div className="bg-white border-2 border-[#17271F] rounded-xl p-5 shadow-[4px_4px_0px_#17271F] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2D9C8]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-editorial font-bold text-[#17271F]">
                      Personalized Email Draft
                    </span>
                    {prospect.emailDraft.isApproved ? (
                      <span className="sticker-badge bg-[#9DE3D0] text-[#17271F] border-[#17271F] text-[10px]">
                        ✓ Approved by You
                      </span>
                    ) : (
                      <span className="sticker-badge bg-[#FFEAE5] text-[#FF7054] border-[#FF7054] text-[10px]">
                        Waiting for Your Review
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingEmail ? (
                      <button
                        onClick={handleSaveEmail}
                        className="btn-tactile-lime px-2.5 py-1 rounded text-xs flex items-center gap-1 font-bold"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingEmail(true)}
                        className="btn-tactile-secondary px-2.5 py-1 rounded text-xs flex items-center gap-1 font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Text
                      </button>
                    )}
                    <button
                      onClick={handleCopyEmail}
                      className="btn-tactile-secondary px-2.5 py-1 rounded text-xs flex items-center gap-1 font-semibold"
                      title="Copy to clipboard for your email client"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy Message'}
                    </button>
                  </div>
                </div>

                {/* Email Subject Field */}
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5E52] uppercase mb-1">
                    Subject Line
                  </label>
                  {isEditingEmail ? (
                    <input
                      type="text"
                      value={subjectText}
                      onChange={(e) => setSubjectText(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8FF65]"
                    />
                  ) : (
                    <div className="text-xs font-bold text-[#17271F] bg-[#FAF7F0] px-3 py-2 rounded-lg border border-[#E2D9C8]">
                      {subjectText}
                    </div>
                  )}
                </div>

                {/* Email Body Field */}
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5E52] uppercase mb-1 flex items-center justify-between">
                    <span>Message Body</span>
                    <span className="text-[10px] font-normal text-[#4A5E52]">
                      {bodyText.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </label>
                  {isEditingEmail ? (
                    <textarea
                      rows={11}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      className="w-full text-xs leading-relaxed font-mono px-3 py-2 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8FF65]"
                    />
                  ) : (
                    <div className="text-xs leading-relaxed text-[#17271F] font-mono whitespace-pre-wrap bg-[#FAF7F0] p-3.5 rounded-lg border border-[#E2D9C8]">
                      {bodyText}
                    </div>
                  )}
                </div>

                {/* Notes & Safety Guarantee */}
                <div className="bg-[#FAF7F0] p-3 rounded-lg border border-[#E2D9C8] text-[11px] text-[#4A5E52] space-y-1">
                  <div className="font-semibold text-[#17271F] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF7054]" />
                    Human Control Promise:
                  </div>
                  <div>
                    {prospect.emailDraft.notes || "Draft created using source-backed details. ScoutSpark will never send emails automatically."}
                  </div>
                </div>

                {/* Main Action Bar */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ScoutMascot 
                      expression={prospect.emailDraft.isApproved ? 'celebratory' : 'curious'} 
                      size="sm" 
                      animate={true} 
                    />
                    <span className="text-xs text-[#4A5E52]">
                      {prospect.emailDraft.isApproved 
                        ? `Approved by you (${prospect.emailDraft.approvedBy || 'You'})` 
                        : "Waiting for your approval"}
                    </span>
                  </div>

                  {!prospect.emailDraft.isApproved ? (
                    <button
                      onClick={handleApprove}
                      className="btn-tactile-coral px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Approve Message Draft
                    </button>
                  ) : (
                    <button
                      onClick={handleCopyEmail}
                      className="btn-tactile-lime px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Message to Clipboard
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#F7F2E8] border-t border-[#17271F]/15 flex items-center justify-between text-xs text-[#4A5E52] flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9DE3D0]" />
            <span>Last checked: {new Date(prospect.lastUpdated).toLocaleDateString()}</span>
          </div>

          <button
            onClick={onClose}
            className="btn-tactile-secondary px-3 py-1.5 rounded text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
