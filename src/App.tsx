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
import { Navbar } from './components/Navbar';
import { ScoutMascot } from './components/ScoutMascot';
import { GuidedDiscoveryModal } from './components/GuidedDiscoveryModal';
import { ProspectDetailDrawer } from './components/ProspectDetailDrawer';
import { OverviewView } from './views/OverviewView';
import { ProspectsView } from './views/ProspectsView';
import { PipelineView } from './views/PipelineView';
import { CampaignStudioView } from './views/CampaignStudioView';
import { EvaluationLabView } from './views/EvaluationLabView';
import { SettingsView } from './views/SettingsView';
import { ShieldCheck, AlertCircle, RefreshCw, Database, Sparkles, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [icp, setIcp] = useState<IdealCustomerProfile | null>(null);
  const [signals, setSignals] = useState<ResearchSignal[]>([]);
  const [metrics, setMetrics] = useState<EvaluationMetric[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState<boolean>(false);
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
        err.detail || err.message || 'Cannot connect to ScoutSpark backend at http://localhost:8000.'
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
          Loading ScoutSpark Workspace...
        </h2>
        <p className="text-xs text-[#4A5E52] mt-1 font-mono">
          Connecting to SQLite persistent store
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
                <span className="font-bold text-[#FF7054]">Backend Offline: </span>
                <span>{connectionError}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={loadAllData}
                className="btn-tactile-coral px-3 py-1 rounded text-[11px] font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
              <button
                onClick={handleSwitchToLocalDemo}
                className="btn-tactile-secondary px-3 py-1 rounded text-[11px] font-semibold"
              >
                Switch to Offline Demo Mode
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
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <OverviewView
            prospects={prospects}
            signals={signals}
            activities={activities}
            onOpenDiscovery={() => setIsDiscoveryOpen(true)}
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
          />
        )}

        {currentTab === 'pipeline' && (
          <PipelineView
            prospects={prospects}
            onSelectProspect={setSelectedProspect}
            onUpdateStage={handleUpdateStage}
          />
        )}

        {currentTab === 'campaigns' && (
          <CampaignStudioView />
        )}

        {currentTab === 'eval-lab' && (
          <EvaluationLabView metrics={metrics} />
        )}

        {currentTab === 'settings' && icp && (
          <SettingsView
            icp={icp}
            onSaveICP={handleSaveICP}
            onResetICP={() => {
              prospectService.resetDemoData();
              loadAllData();
            }}
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
      />

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-[#17271F] bg-[#FAF7F0] py-8 text-xs text-[#4A5E52]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ScoutMascot expression="idle" size="xs" animate={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial font-bold text-sm text-[#17271F]">ScoutSpark</span>
                <span className="text-[#4A5E52]">• Find your next yes.</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                  backendStatus === 'connected' 
                    ? 'bg-[#9DE3D0] text-[#17271F] border-[#17271F]' 
                    : backendStatus === 'local_demo'
                    ? 'bg-[#D8FF65] text-[#17271F] border-[#17271F]'
                    : 'bg-[#FFEAE5] text-[#FF7054] border-[#FF7054]'
                }`}>
                  {backendStatus === 'connected' ? 'SQLite Backend: Connected' : backendStatus === 'local_demo' ? 'Local Demo Mode' : 'Backend Disconnected'}
                </span>
              </div>
              <p className="text-[11px] text-[#4A5E52] mt-0.5">
                B2B Prospect Intelligence for Early-Stage Startups
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-[#17271F]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF7054]" />
              Human-in-the-Loop Safeguard: Active
            </span>
            <span>•</span>
            <span className="font-mono text-[#17271F]">
              DEMO WORKSPACE — SIMULATED DATA
            </span>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('eval-lab')}
              className="text-[#FF7054] hover:underline font-medium"
            >
              Evaluation Lab
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
