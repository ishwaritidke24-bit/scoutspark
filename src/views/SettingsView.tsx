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
  Layers
} from 'lucide-react';

interface SettingsViewProps {
  icp: IdealCustomerProfile;
  onSaveICP: (updated: IdealCustomerProfile) => void;
  onResetICP: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  icp,
  onSaveICP,
  onResetICP,
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

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-editorial font-bold text-[#17271F]">
              Ideal Customer Profile (ICP) & Startup Settings
            </h1>
            <span className="sticker-badge bg-[#D8FF65] text-[#17271F] border-[#17271F] text-[10px]">
              Active Configuration
            </span>
          </div>
          <p className="text-xs text-[#4A5E52] mt-0.5">
            These parameters guide Scout's fit scoring, signal evaluation, and personalized email angle synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedToast && (
            <span className="text-xs font-bold text-green-700 bg-[#9DE3D0]/40 px-2.5 py-1 rounded-lg border border-[#17271F] animate-in fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved to LocalStorage
            </span>
          )}

          <button
            type="button"
            onClick={onResetICP}
            className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            title="Restore default seed ICP"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Startup Identity & Offering */}
        <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2D9C8]">
            <Building2 className="w-4 h-4 text-[#FF7054]" />
            <h2 className="text-base font-editorial font-bold text-[#17271F]">
              Your Startup Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A5E52] mb-1">
                Startup Name
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
                Product / Offering Title
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
              Company & Solution Description
            </label>
            <textarea
              rows={2}
              value={formData.companyDescription}
              onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8FF65]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A5E52] mb-1">
              Core Value Proposition (What you do for them)
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
              Primary Problem Solved (Pain Point)
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
                Target Industries & Verticals
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
              placeholder="Add industry (e.g. EdTech SaaS, LegalTech)..."
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
                Target Buyer Roles & Titles
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
              placeholder="Add role (e.g. Chief Information Security Officer)..."
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
                Target Geographies
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
                placeholder="Add region (e.g. Australia & NZ)..."
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
                Negative Exclusions
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
                placeholder="Add exclusion (e.g. Non-profits)..."
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
            <span>Persisted locally in browser storage for your session</span>
          </div>

          <button
            type="submit"
            className="btn-tactile-coral px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#17271F]"
          >
            <Save className="w-4 h-4" /> Save ICP Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
