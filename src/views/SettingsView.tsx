import React, { useState, useEffect } from 'react';
import { IdealCustomerProfile } from '../types';
import { ScoutMascot } from '../components/ScoutMascot';
import { 
  Save, 
  RotateCcw, 
  Check, 
  Plus, 
  X, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  Globe, 
  SlidersHorizontal,
  Layers,
  Rocket,
  Terminal,
  Bot,
  Stethoscope,
  CreditCard,
  Shield,
  Zap,
  Trash2
} from 'lucide-react';

import { ScoutPageBanner } from '../components/ScoutPageBanner';
import { ViewTab } from '../types';

interface SettingsViewProps {
  icp: IdealCustomerProfile;
  onSaveICP: (updated: IdealCustomerProfile) => void;
  onResetICP: () => void;
  onNavigateToTab?: (tab: ViewTab) => void;
  onOpenDiscovery?: () => void;
  onOpenGuide?: () => void;
}

interface ICPPreset {
  id: string;
  title: string;
  badge: string;
  category: string;
  iconType: 'rocket' | 'terminal' | 'bot' | 'stethoscope' | 'creditCard' | 'shield';
  description: string;
  industries: string[];
  roles: string[];
  painPoint: string;
  geographies: string[];
  exclusions: string[];
}

const ICP_PRESETS: ICPPreset[] = [
  {
    id: 'b2b-saas',
    title: 'Early-Stage B2B SaaS',
    badge: '⚡ Popular',
    category: 'Sales & Growth',
    iconType: 'rocket',
    description: "Early-stage B2B software companies in India and the US with 10-50 employees that are hiring sales development representatives or account executives to scale pipeline.",
    industries: ['B2B SaaS', 'Cloud Software', 'Productivity'],
    roles: ['Founder / CEO', 'VP of Sales', 'Head of Growth'],
    painPoint: 'Wasting founder and sales rep time on manual prospect research and ungrounded cold emails',
    geographies: ['United States', 'India', 'Remote'],
    exclusions: ['Agencies', 'IT staffing', 'Consultancies']
  },
  {
    id: 'devtools',
    title: 'Developer Tools & Infra',
    badge: '🛠️ High-Fit',
    category: 'Infrastructure',
    iconType: 'terminal',
    description: "Developer tooling and cloud infrastructure startups with engineering teams building or scaling Kubernetes, CI/CD, observability, or distributed telemetry.",
    industries: ['Developer Tools', 'DevOps', 'Cloud Infrastructure'],
    roles: ['VP of Engineering', 'CTO', 'Platform Lead'],
    painPoint: 'Complex cloud telemetry bottlenecks and high compute costs',
    geographies: ['United States', 'Europe', 'Remote'],
    exclusions: ['Software outsourcing', 'Design agencies']
  },
  {
    id: 'ai-startups',
    title: 'AI & Agentic Tech',
    badge: '🤖 Trending',
    category: 'Artificial Intelligence',
    iconType: 'bot',
    description: "Fast-moving AI startups building autonomous agents, LLM applications, or automated workflows seeking enterprise pilot customers.",
    industries: ['Artificial Intelligence', 'Generative AI', 'B2B SaaS'],
    roles: ['CEO', 'Head of AI', 'Lead Product Manager'],
    painPoint: 'Need verified enterprise buyers willing to pilot new AI software',
    geographies: ['United States', 'India', 'Global Remote'],
    exclusions: ['Consumer mobile games', 'Crypto coins']
  },
  {
    id: 'healthtech',
    title: 'HealthTech & Clinical',
    badge: '🏥 Regulated',
    category: 'Healthcare',
    iconType: 'stethoscope',
    description: "Healthcare technology companies and clinical software providers that need HIPAA-compliant document processing and workflow automation.",
    industries: ['HealthTech', 'Healthcare IT', 'Digital Health'],
    roles: ['Head of Operations', 'CEO', 'Chief Medical Officer'],
    painPoint: 'HIPAA compliance overhead and manual patient intake workflows',
    geographies: ['United States', 'Canada'],
    exclusions: ['Physical dental offices', 'Pharmacies', 'Hospitals']
  },
  {
    id: 'fintech',
    title: 'FinTech & Payments',
    badge: '💳 Enterprise',
    category: 'Financial Services',
    iconType: 'creditCard',
    description: "FinTech and payments platforms handling high transaction volume, risk compliance, KYC automation, or automated billing systems.",
    industries: ['FinTech', 'Payments', 'Banking Software'],
    roles: ['Head of Product', 'VP of Risk & Compliance', 'Founder'],
    painPoint: 'Regulatory audit pressure and transaction scaling delays',
    geographies: ['United States', 'United Kingdom', 'India'],
    exclusions: ['Payday lenders', 'Retail bank branches']
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Defense',
    badge: '🔒 High Value',
    category: 'Security',
    iconType: 'shield',
    description: "Cloud security startups providing automated SOC2/ISO compliance, vulnerability scanning, or zero-trust identity management.",
    industries: ['Cybersecurity', 'Cloud Compliance', 'Infosec'],
    roles: ['CISO', 'VP of Information Security', 'VP of IT'],
    painPoint: 'SOC2 compliance audit deadlines and cloud configuration risks',
    geographies: ['United States', 'Europe', 'Remote'],
    exclusions: ['Physical guard agencies', 'Locksmiths']
  }
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  icp,
  onSaveICP,
  onResetICP,
  onNavigateToTab,
  onOpenDiscovery,
  onOpenGuide,
}) => {
  const [formData, setFormData] = useState<IdealCustomerProfile>(icp);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  // New tag input states
  const [newIndustry, setNewIndustry] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const [newGeo, setNewGeo] = useState<string>('');
  const [newExclusion, setNewExclusion] = useState<string>('');

  useEffect(() => {
    setFormData(icp);
  }, [icp]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveICP(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleAddTag = (
    field: 'targetIndustries' | 'targetRoles' | 'targetGeographies' | 'exclusions',
    value: string,
    clearFn: (val: string) => void
  ) => {
    if (!value.trim()) return;
    if (formData[field].includes(value.trim())) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    clearFn('');
  };

  const handleRemoveTag = (
    field: 'targetIndustries' | 'targetRoles' | 'targetGeographies' | 'exclusions',
    indexToRemove: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = ICP_PRESETS.find(x => x.id === presetId);
    if (!p) return;
    setFormData(prev => ({
      ...prev,
      companyDescription: p.description,
      targetIndustries: p.industries,
      targetRoles: p.roles,
      primaryPainPoint: p.painPoint,
      targetGeographies: p.geographies,
      exclusions: p.exclusions,
    }));
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* ScoutStar Contextual Guidance Banner */}
      <ScoutPageBanner
        expression="focused"
        title="Target Customer (ICP)"
        subtitle="Define what you sell, who your ideal customer is, and what dealbreakers to avoid. All future web searches and fit scores match against this profile."
        whatItDoes="Configures target industries, job roles, company sizes, geography, and disqualification exclusions."
        whenToUse="Set this up first! Also update it whenever you pivot your product focus or explore a new market."
        nextActionText="Find Matching Leads"
        onNextAction={onOpenDiscovery || (() => onNavigateToTab && onNavigateToTab('prospects'))}
        onOpenTour={onOpenGuide}
        badge="STEP 1"
        highlightText="Profile active: ScoutStar scores candidate businesses against your value proposition."
      />

      {/* Header */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-editorial font-bold text-[#17271F]">
              Your Ideal Customer & Business Info
            </h1>
            <span className="sticker-badge bg-[#D8FF65] text-[#17271F] border-[#17271F] text-[10px]">
              Current settings
            </span>
          </div>
          <p className="text-xs text-[#4A5E52] mt-0.5">
            Tell Scout what you sell and who you're looking for. This helps Scout score leads and write relevant emails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedToast && (
            <span className="text-xs font-bold text-green-700 bg-[#9DE3D0]/40 px-2.5 py-1 rounded-lg border border-[#17271F] animate-in fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}

          <button
            type="button"
            onClick={onResetICP}
            className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Reset to default example settings"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to defaults
          </button>
        </div>
      </div>

      {/* Pre-Built Customer Profiles: Dropdown & Suggestion Boxes */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-editorial font-bold text-[#17271F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF7054]" />
              <span>Suggested Customer Archetypes</span>
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#D8FF65] text-[#17271F] border border-[#17271F]">
              1-Click Setup
            </span>
          </div>
          <p className="text-xs text-[#4A5E52] mt-0.5">
            Select a pre-built profile from the dropdown menu or click any suggestion box to populate your ideal customer criteria.
          </p>
        </div>

        {/* Dropdown Menu */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-[#17271F] mb-1.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#FF7054]" />
            <span>Select from Dropdown Menu:</span>
          </label>
          <select
            value={selectedPresetId}
            onChange={(e) => handleApplyPreset(e.target.value)}
            className="w-full bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-lg px-3 py-2 text-xs font-semibold text-[#17271F] focus:outline-none focus:ring-2 focus:ring-[#D8FF65] cursor-pointer"
          >
            <option value="">-- Choose a pre-built customer profile (or customize below) --</option>
            {ICP_PRESETS.map((arch) => (
              <option key={arch.id} value={arch.id}>
                {arch.title} — {arch.category} ({arch.roles.join(', ')})
              </option>
            ))}
          </select>
        </div>

        {/* Suggestion Boxes (Cards) */}
        <div className="pt-2 border-t border-[#E2D9C8]">
          <span className="text-[10px] font-mono uppercase font-bold text-[#4A5E52] block mb-2">
            Or choose a suggestion box:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {ICP_PRESETS.map((arch) => {
              const isSelected = selectedPresetId === arch.id;
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => handleApplyPreset(arch.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#D8FF65]/30 border-[#17271F] shadow-[3px_3px_0px_#17271F]'
                      : 'bg-[#FAF7F0] border-[#17271F]/40 hover:border-[#17271F] hover:bg-white shadow-[1px_1px_0px_#17271F]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-[#17271F]">
                        {arch.title}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-[#17271F]/30 text-[#17271F]">
                        {arch.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A5E52] line-clamp-2 leading-relaxed">
                      {arch.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-[#17271F]/15 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-[#17271F] font-semibold truncate max-w-[170px]">
                      👤 {arch.roles[0]}
                    </span>
                    <span className="text-[#FF7054] font-bold">
                      {isSelected ? '✓ Loaded' : 'Use →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <form 
        data-scout-target="target-customer-form"
        onSubmit={handleSave} 
        className="space-y-6"
      >
        {/* Startup Identity & Offering */}
        <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2D9C8]">
            <Building2 className="w-4 h-4 text-[#FF7054]" />
            <h2 className="text-base font-editorial font-bold text-[#17271F]">
              About Your Business
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A5E52] mb-1">
                Your Business Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full text-xs font-semibold px-3 py-2 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8FF65]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A5E52] mb-1">
                What is your product called?
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full text-xs font-semibold px-3 py-2 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8FF65]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A5E52] mb-1">
              What does your business do? (in plain words)
            </label>
            <textarea
              data-scout-target="target-customer-description"
              rows={2}
              value={formData.companyDescription}
              onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8FF65]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A5E52] mb-1">
              How does it help your customers?
            </label>
            <textarea
              rows={2}
              value={formData.valueProposition}
              onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8FF65]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A5E52] mb-1">
              What big problem does it fix for them?
            </label>
            <textarea
              rows={2}
              value={formData.primaryPainPoint}
              onChange={(e) => setFormData({ ...formData, primaryPainPoint: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8FF65]"
            />
          </div>
        </div>

        {/* Target Industries */}
        <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2D9C8]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF7054]" />
              <h2 className="text-base font-editorial font-bold text-[#17271F]">
                Industries You Want to Reach
              </h2>
            </div>
            <span className="text-[11px] text-[#4A5E52] font-mono">{formData.targetIndustries.length} Selected</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.targetIndustries.map((ind, idx) => (
              <span
                key={idx}
                className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] text-xs py-1 px-2.5 flex items-center gap-1.5"
              >
                <span>{ind}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag('targetIndustries', idx)}
                  className="hover:text-[#FF7054]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              placeholder="Type an industry (e.g. Health Tech, Online Schools) and press Enter..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('targetIndustries', newIndustry, setNewIndustry);
                }
              }}
              className="flex-1 text-xs px-3 py-1.5 bg-[#FAF7F0] border border-[#17271F] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D8FF65]"
            />
            <button
              type="button"
              onClick={() => handleAddTag('targetIndustries', newIndustry, setNewIndustry)}
              className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Target Buyer Roles */}
        <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2D9C8]">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#FF7054]" />
              <h2 className="text-base font-editorial font-bold text-[#17271F]">
                People You Want to Speak With (Job Titles)
              </h2>
            </div>
            <span className="text-[11px] text-[#4A5E52] font-mono">{formData.targetRoles.length} Roles</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.targetRoles.map((role, idx) => (
              <span
                key={idx}
                className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] text-xs py-1 px-2.5 flex items-center gap-1.5"
              >
                <span>{role}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag('targetRoles', idx)}
                  className="hover:text-[#FF7054]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Type a job title (e.g. Head of Engineering, Founder) and press Enter..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('targetRoles', newRole, setNewRole);
                }
              }}
              className="flex-1 text-xs px-3 py-1.5 bg-[#FAF7F0] border border-[#17271F] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D8FF65]"
            />
            <button
              type="button"
              onClick={() => handleAddTag('targetRoles', newRole, setNewRole)}
              className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Company Size & Geographies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Geographies */}
          <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 shadow-[4px_4px_0px_#17271F] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2D9C8]">
              <Globe className="w-4 h-4 text-[#FF7054]" />
              <h2 className="text-sm font-editorial font-bold text-[#17271F]">
                Where They Are Located
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {formData.targetGeographies.map((geo, idx) => (
                <span
                  key={idx}
                  className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] text-[11px] py-0.5 px-2 flex items-center gap-1"
                >
                  <span>{geo}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag('targetGeographies', idx)}
                    className="hover:text-[#FF7054]"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newGeo}
                onChange={(e) => setNewGeo(e.target.value)}
                placeholder="Type a country or region (e.g. United States, Europe)..."
                className="flex-1 text-xs px-2.5 py-1 bg-[#FAF7F0] border border-[#17271F] rounded-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddTag('targetGeographies', newGeo, setNewGeo)}
                className="btn-tactile-secondary px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Negative Exclusions */}
          <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 shadow-[4px_4px_0px_#17271F] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2D9C8]">
              <Target className="w-4 h-4 text-[#FF7054]" />
              <h2 className="text-sm font-editorial font-bold text-[#17271F]">
                Companies to Skip (Negative Rules)
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {formData.exclusions.map((ex, idx) => (
                <span
                  key={idx}
                  className="sticker-badge bg-[#FFEAE5] text-[#FF7054] border-[#FF7054] text-[11px] py-0.5 px-2 flex items-center gap-1"
                >
                  <span>{ex}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag('exclusions', idx)}
                    className="hover:text-[#17271F]"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                placeholder="Type companies to skip (e.g. Non-profits, Agencies)..."
                className="flex-1 text-xs px-2.5 py-1 bg-[#FAF7F0] border border-[#17271F] rounded-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddTag('exclusions', newExclusion, setNewExclusion)}
                className="btn-tactile-secondary px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-xs text-[#4A5E52]">
            <ScoutMascot expression="idle" size="xs" animate={true} />
            <span>Saved automatically to your database and browser</span>
          </div>

          <button
            data-scout-target="target-customer-save-btn"
            type="submit"
            className="btn-tactile-coral px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#17271F]"
          >
            <Save className="w-4 h-4" /> Save Target Customer Settings
          </button>
        </div>
      </form>

      {/* Contextual Journey Next Step Banner */}
      {onNavigateToTab && (
        <div className="p-4 bg-white border-2 border-[#17271F] rounded-xl shadow-[3px_3px_0px_#17271F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-editorial font-bold text-[#17271F] flex items-center gap-1.5">
              <span>Logical Next Step:</span>
              <span className="text-[#FF7054]">Search for Leads Matching This Customer Profile</span>
            </div>
            <p className="text-[11px] text-[#4A5E52]">
              Once your profile is saved, run Discovery or browse your lead directory.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onOpenDiscovery && (
              <button
                onClick={onOpenDiscovery}
                className="btn-tactile-coral px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Find My Next…</span>
              </button>
            )}
            <button
              onClick={() => onNavigateToTab('prospects')}
              className="btn-tactile-secondary px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Browse Leads
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
