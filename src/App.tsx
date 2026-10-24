import React, { useState, useEffect } from 'react';
import { 
  Prospect, 
  IdealCustomerProfile, 
  ResearchSignal, 
  EvaluationMetric, 
  ActivityItem, 
  ViewTab,
  PipelineStage,
  EmailDraft
} from './types';
import { prospectService } from './services/prospectService';
import { API_BASE_URL } from './services/apiClient';
import { Navbar } from './components/Navbar';
import { ScoutMascot } from './components/ScoutMascot';
import { GuidedDiscoveryModal } from './components/GuidedDiscoveryModal';
import { ScoutGuideModal } from './components/ScoutGuideModal';
import { ScoutCompanion } from './components/ScoutCompanion';
import { ProspectDetailDrawer } from './components/ProspectDetailDrawer';
import { OverviewView } from './views/OverviewView';
import { ProspectsView } from './views/ProspectsView';
import { PipelineView } from './views/PipelineView';
import { CampaignStudioView } from './views/CampaignStudioView';
import { EvaluationLabView } from './views/EvaluationLabView';
import { SettingsView } from './views/SettingsView';
import { ShieldCheck, AlertCircle, RefreshCw, Database, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [icp, setIcp] = useState<IdealCustomerProfile | null>(null);
  const [signals, setSignals] = useState<ResearchSignal[]>([]);
  const [metrics, setMetrics] = useState<EvaluationMetric[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>('connecting');

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setConnectionError(null);

      // Check health first
      const health = await prospectService.checkBackendHealth();
      if (health) {
        setBackendStatus(health.database === 'local_demo' ? 'local_demo' : 'connected');
      }

      const [prospectsData, icpData, signalsData, metricsData, activitiesData] = await Promise.all([
        prospectService.getProspects(),
        prospectService.getICP(),
        prospectService.getSignals(),
        prospectService.getEvalMetrics(),
        prospectService.getActivities(),
      ]);
      setProspects(prospectsData);
      setIcp(icpData);
      setSignals(signalsData);
      setMetrics(metricsData);
      setActivities(activitiesData);
      setConnectionError(null);
    } catch (err: any) {
      console.error('Failed to load data from backend:', err);
      setConnectionError(
        err.detail || err.message || `Cannot connect to ScoutSpark backend at ${API_BASE_URL}.`
      );
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (id: string, stage: PipelineStage, notes?: string) => {
    try {
      const updated = await prospectService.updateProspectStage(id, stage, notes);
      if (updated) {
        setProspects(prev => prev.map(p => p.id === id ? updated : p));
        if (selectedProspect && selectedProspect.id === id) {
          setSelectedProspect(updated);
        }
        const newActs = await prospectService.getActivities();
        setActivities(newActs);
      }
    } catch (err: any) {
      alert(`Failed to update stage: ${err.message || 'Network error'}`);
    }
  };

  const handleUpdateEmailDraft = async (id: string, draftPatch: Partial<EmailDraft>) => {
    try {
      const updated = await prospectService.updateEmailDraft(id, draftPatch);
      if (updated) {
        setProspects(prev => prev.map(p => p.id === id ? updated : p));
        if (selectedProspect && selectedProspect.id === id) {
          setSelectedProspect(updated);
        }
        const newActs = await prospectService.getActivities();
        setActivities(newActs);
      }
    } catch (err: any) {
      alert(`Failed to update draft: ${err.message || 'Network error'}`);
    }
  };

  const handleApproveDraft = async (id: string) => {
    try {
      const updated = await prospectService.approveEmailDraft(id, 'Founder');
      if (updated) {
        setProspects(prev => prev.map(p => p.id === id ? updated : p));
        if (selectedProspect && selectedProspect.id === id) {
          setSelectedProspect(updated);
        }
        const newActs = await prospectService.getActivities();
        setActivities(newActs);
      }
    } catch (err: any) {
      alert(`Failed to approve draft: ${err.message || 'Network error'}`);
    }
  };

  const handleSaveICP = async (updatedIcp: IdealCustomerProfile) => {
    try {
      const saved = await prospectService.updateICP(updatedIcp);
      setIcp(saved);
      const newActs = await prospectService.getActivities();
      setActivities(newActs);
    } catch (err: any) {
      alert(`Failed to save ICP: ${err.message || 'Network error'}`);
    }
  };

  const handleSwitchToLocalDemo = () => {
    prospectService.setDemoMode(true);
    setConnectionError(null);
    setBackendStatus('local_demo');
    loadAllData();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data and pipeline stages back to factory default?')) {
      prospectService.resetDemoData();
      loadAllData();
      setSelectedProspect(null);
    }
  };

  if (loading && !icp) {
    return (
      <div className="min-h-screen bg-[#F7F2E8] flex flex-col items-center justify-center p-6 text-center">
        <ScoutMascot expression="thinking" size="xl" animate={true} />
        <h2 className="text-xl font-editorial font-bold text-[#17271F] mt-4">
          Getting ScoutSpark ready...
        </h2>
        <p className="text-xs text-[#4A5E52] mt-1 font-mono">
          Loading your saved leads and settings
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F2E8] text-[#17271F]">
      {/* Backend Connection Error Alert Banner */}
      {connectionError && (
        <div className="bg-[#FFEAE5] border-b-2 border-[#FF7054] px-4 py-3 text-xs text-[#17271F] shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#FF7054] shrink-0" />
              <div>
                <span className="font-bold text-[#FF7054]">Server Not Connected: </span>
                <span>We couldn't connect to the backend server. You can try reconnecting or use offline practice mode.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={loadAllData}
                className="btn-tactile-coral px-3 py-1 rounded text-[11px] font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Try connecting again
              </button>
              <button
                onClick={handleSwitchToLocalDemo}
                className="btn-tactile-secondary px-3 py-1 rounded text-[11px] font-semibold"
              >
                Use practice mode without server
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetData={handleResetData}
        prospectsCount={prospects.length}
        activeProvenance={
          selectedProspect 
            ? selectedProspect.provenance 
            : prospects.length > 0 && prospects.every(p => p.provenance === 'researched')
            ? 'researched'
            : prospects.some(p => p.provenance === 'researched')
            ? 'mixed'
            : 'demo'
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <OverviewView
            prospects={prospects}
            signals={signals}
            activities={activities}
            onOpenDiscovery={() => setIsDiscoveryOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            onSelectProspect={setSelectedProspect}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'prospects' && (
          <ProspectsView
            prospects={prospects}
            onSelectProspect={setSelectedProspect}
            onUpdateStage={(id, stage) => handleUpdateStage(id, stage)}
            onRefresh={loadAllData}
            onOpenDiscovery={() => setIsDiscoveryOpen(true)}
            onNavigateToTab={setCurrentTab}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {currentTab === 'pipeline' && (
          <PipelineView
            prospects={prospects}
            onSelectProspect={setSelectedProspect}
            onUpdateStage={handleUpdateStage}
            onOpenDiscovery={() => setIsDiscoveryOpen(true)}
            onNavigateToTab={setCurrentTab}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {currentTab === 'campaigns' && (
          <CampaignStudioView 
            onNavigateToTab={setCurrentTab}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {currentTab === 'eval-lab' && (
          <EvaluationLabView 
            metrics={metrics} 
            onNavigateToTab={setCurrentTab}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {currentTab === 'settings' && icp && (
          <SettingsView
            icp={icp}
            onSaveICP={handleSaveICP}
            onResetICP={() => {
              prospectService.resetDemoData();
              loadAllData();
            }}
            onNavigateToTab={setCurrentTab}
            onOpenDiscovery={() => setIsDiscoveryOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}
      </main>

      {/* Prospect Detail Drawer */}
      <ProspectDetailDrawer
        prospect={selectedProspect}
        isOpen={Boolean(selectedProspect)}
        onClose={() => setSelectedProspect(null)}
        onUpdateStage={handleUpdateStage}
        onUpdateEmailDraft={handleUpdateEmailDraft}
        onApproveDraft={handleApproveDraft}
      />

      {/* Guided Discovery Interactive Modal */}
      <GuidedDiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onSelectProspect={(prospect) => {
          setSelectedProspect(prospect);
          setCurrentTab('prospects');
        }}
        prospects={prospects}
        onDiscoveryComplete={loadAllData}
        icp={icp}
        onSaveICP={handleSaveICP}
        onNavigateToTab={setCurrentTab}
        onUpdateStage={handleUpdateStage}
      />

      {/* ScoutStar Interactive Onboarding & Workflow Guide Modal */}
      <ScoutGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateToTab={(tab) => {
          setCurrentTab(tab);
          setIsGuideOpen(false);
        }}
        onOpenDiscovery={() => {
          setIsGuideOpen(false);
          setIsDiscoveryOpen(true);
        }}
      />

      {/* ScoutStar Persistent Animated Companion (Available Across All Pages) */}
      <ScoutCompanion
        currentTab={currentTab}
        onNavigateToTab={setCurrentTab}
        onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        onOpenTour={() => setIsGuideOpen(true)}
        prospects={prospects}
        icp={icp}
        onSelectProspect={setSelectedProspect}
        isDrawerOpen={Boolean(selectedProspect)}
      />

      {/* Global Creator Footer */}
      <footer className="mt-auto border-t-2 border-[#17271F] bg-[#FAF7F0] py-8 text-xs text-[#4A5E52]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ScoutMascot expression="idle" size="xs" animate={true} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-editorial font-bold text-sm text-[#17271F]">ScoutSpark</span>
                  <span className="text-[#4A5E52]">• Find your next yes.</span>
                </div>
                <p className="text-[11px] text-[#4A5E52] mt-0.5">
                  Reason-driven lead research and outreach for early-stage B2B founders
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-[#17271F]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF7054]" />
                You approve every message before it sends
              </span>
              <span>•</span>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="text-[#17271F] hover:text-[#FF7054] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3 text-[#FF7054]" />
                <span>ScoutStar Guide & Tour</span>
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentTab('eval-lab')}
                className="text-[#FF7054] hover:underline font-medium"
              >
                Accuracy Lab & Tests
              </button>
            </div>
          </div>

          {/* Deliberate Creator Attribution */}
          <div className="pt-4 border-t border-[#E2D9C8] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#4A5E52]">
            <div className="font-mono font-medium text-[#17271F]">
              © 2026 ScoutSpark · Designed & Built by Ishwari Tidke
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#4A5E52]">
              <span>Zero-Spam Policy</span>
              <span>•</span>
              <span>Public Web Citations</span>
              <span>•</span>
              <span>Human in the Loop</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
