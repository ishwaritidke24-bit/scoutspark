import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { 
  Prospect, 
  IdealCustomerProfile, 
  ResearchSignal, 
  EvaluationMetric, 
  ActivityItem, 
  ViewTab,
  PipelineStage,
  EmailDraft,
  BackendStatus
} from './types';
import { prospectService } from './services/prospectService';
import { API_BASE_URL } from './services/apiClient';
import { Navbar } from './components/Navbar';
import { ScoutMascot } from './components/ScoutMascot';
import { ScoutCompanion } from './components/ScoutCompanion';
import { ProspectDetailDrawer } from './components/ProspectDetailDrawer';
import { OverviewView } from './views/OverviewView';
import { ProspectsView } from './views/ProspectsView';
import { PipelineView } from './views/PipelineView';

// Lazily load secondary views and modals to minimize initial JS bundle & accelerate page load
const CampaignStudioView = lazy(() => import('./views/CampaignStudioView').then(m => ({ default: m.CampaignStudioView })));
const EvaluationLabView = lazy(() => import('./views/EvaluationLabView').then(m => ({ default: m.EvaluationLabView })));
const SettingsView = lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));
const GuidedDiscoveryModal = lazy(() => import('./components/GuidedDiscoveryModal').then(m => ({ default: m.GuidedDiscoveryModal })));
const ScoutGuideModal = lazy(() => import('./components/ScoutGuideModal').then(m => ({ default: m.ScoutGuideModal })));

import { ShieldCheck, AlertCircle, RefreshCw, HelpCircle, CloudLightning } from 'lucide-react';

const ViewLoader: React.FC = () => (
  <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
    <div className="w-7 h-7 rounded-full border-2 border-[#17271F] border-t-[#FF7054] animate-spin" />
    <span className="text-xs font-mono text-[#4A5E52]">Loading workspace module...</span>
  </div>
);

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  
  // Instant synchronous cache hydration: zero blank screen, zero blocking loader
  const [prospects, setProspects] = useState<Prospect[]>(() => prospectService.getCachedProspects());
  const [icp, setIcp] = useState<IdealCustomerProfile>(() => prospectService.getCachedICP());
  const [signals, setSignals] = useState<ResearchSignal[]>(() => prospectService.getCachedSignals());
  const [metrics, setMetrics] = useState<EvaluationMetric[]>(() => prospectService.getCachedMetrics());
  const [activities, setActivities] = useState<ActivityItem[]>(() => prospectService.getCachedActivities());
  
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('connecting');

  const syncRetryTimerRef = useRef<any>(null);
  const retryCountRef = useRef<number>(0);

  // Non-blocking background sync on mount
  useEffect(() => {
    syncWithBackend();

    return () => {
      if (syncRetryTimerRef.current) {
        clearTimeout(syncRetryTimerRef.current);
      }
    };
  }, []);

  // When in practice mode (local_demo), poll quietly in the background so that
  // when the real cloud or local backend becomes healthy, we automatically switch to live mode!
  useEffect(() => {
    if (backendStatus === 'local_demo') {
      const pollTimer = setInterval(async () => {
        try {
          const health = await prospectService.checkBackendHealth(5000);
          if (health && health.status === 'ok') {
            console.info('Backend detected healthy. Automatically upgrading from practice mode to live mode.');
            clearInterval(pollTimer);
            syncWithBackend(true);
          }
        } catch {
          // Stay quietly in practice mode
        }
      }, 15000);

      return () => clearInterval(pollTimer);
    }
  }, [backendStatus]);

  const syncWithBackend = async (isManualRetry: boolean = false) => {
    try {
      setIsSyncing(true);
      if (isManualRetry) {
        setConnectionError(null);
      }

      // Fast probe to verify real backend connectivity
      const health = await prospectService.checkBackendHealth(7000);
      if (health && health.status === 'ok') {
        // Backend is healthy and reachable!
        prospectService.setDemoMode(false);
        setBackendStatus('connected');
        setConnectionError(null);
        retryCountRef.current = 0;

        // Fetch fresh cloud/server data in parallel
        const [prospectsData, icpData, signalsData, metricsData, activitiesData] = await Promise.all([
          prospectService.getProspects(),
          prospectService.getICP(),
          prospectService.getSignals(),
          prospectService.getEvalMetrics(),
          prospectService.getActivities(),
        ]);
        if (prospectsData && prospectsData.length > 0) setProspects(prospectsData);
        if (icpData) setIcp(icpData);
        if (signalsData) setSignals(signalsData);
        if (metricsData) setMetrics(metricsData);
        if (activitiesData) setActivities(activitiesData);
      }
    } catch (err: any) {
      console.warn('Backend connection attempt:', err.message);

      const isLocalhost = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
      const isColdStartWaking = (err.isTimeout || err.name === 'AbortError') && !isLocalhost;
      const is404 = err.status === 404 || err.isNotFound;

      // If user has explicitly selected practice mode, do not disrupt them with error alerts
      if (prospectService.getIsDemoMode()) {
        setBackendStatus('local_demo');
        return;
      }

      if (isColdStartWaking && retryCountRef.current < 10) {
        // Genuine remote cloud cold-start (~15-25s on Render free tier)
        retryCountRef.current += 1;
        setBackendStatus('waking_up');
        syncRetryTimerRef.current = setTimeout(() => {
          syncWithBackend();
        }, 5000);
      } else {
        // Server unavailable, 404, local server not running, or retries exhausted
        setBackendStatus('disconnected');
        if (is404) {
          setConnectionError(
            `Backend service returned 404 Not Found at ${API_BASE_URL}. Check your Vercel VITE_API_BASE_URL or Render web service configuration.`
          );
        } else if (isLocalhost) {
          setConnectionError(
            `Local backend is not running at ${API_BASE_URL}. Start it with 'uvicorn app.main:app' or continue using practice mode.`
          );
        } else {
          setConnectionError(
            err.detail || err.message || `Cannot connect to ScoutSpark backend at ${API_BASE_URL}.`
          );
        }
      }
    } finally {
      setIsSyncing(false);
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
    if (syncRetryTimerRef.current) {
      clearTimeout(syncRetryTimerRef.current);
    }
    prospectService.setDemoMode(true);
    setConnectionError(null);
    setBackendStatus('local_demo');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data and pipeline stages back to factory default?')) {
      prospectService.resetDemoData();
      setProspects(prospectService.getCachedProspects());
      setIcp(prospectService.getCachedICP());
      setActivities(prospectService.getCachedActivities());
      setSelectedProspect(null);
      syncWithBackend(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F2E8] text-[#17271F]">
      {/* Cloud Server Cold-Start Waking Banner (Render free tier wakes in ~15-25s) */}
      {backendStatus === 'waking_up' && (
        <div className="bg-[#FFF8E7] border-b-2 border-[#17271F] px-4 py-2 text-xs text-[#17271F] shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7054] animate-ping shrink-0" />
              <CloudLightning className="w-4 h-4 text-[#FF7054] shrink-0" />
              <div>
                <span className="font-bold text-[#17271F]">Cloud Server Waking Up: </span>
                <span className="text-[#4A5E52]">
                  The Render cloud backend is booting up (~15-25s). You can explore, filter leads, and inspect sequences immediately in practice mode.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => syncWithBackend(true)}
                disabled={isSyncing}
                className="btn-tactile-secondary px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Checking...' : 'Check now'}</span>
              </button>
              <button
                onClick={handleSwitchToLocalDemo}
                className="btn-tactile-lime px-2.5 py-1 rounded text-[11px] font-bold text-[#17271F] cursor-pointer"
              >
                Practice mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backend Connection Error Alert Banner */}
      {connectionError && backendStatus === 'disconnected' && (
        <div className="bg-[#FFEAE5] border-b-2 border-[#FF7054] px-4 py-3 text-xs text-[#17271F] shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#FF7054] shrink-0" />
              <div>
                <span className="font-bold text-[#FF7054]">Server Offline / Unavailable: </span>
                <span>{connectionError}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  retryCountRef.current = 0;
                  syncWithBackend(true);
                }}
                disabled={isSyncing}
                className="btn-tactile-coral px-3 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Checking...' : 'Try connecting again'}</span>
              </button>
              <button
                onClick={handleSwitchToLocalDemo}
                className="btn-tactile-secondary px-3 py-1 rounded text-[11px] font-semibold cursor-pointer"
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
        backendStatus={backendStatus}
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
        <Suspense fallback={<ViewLoader />}>
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
              onRefresh={() => syncWithBackend(true)}
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
                setIcp(prospectService.getCachedICP());
                setProspects(prospectService.getCachedProspects());
                syncWithBackend(true);
              }}
              onNavigateToTab={setCurrentTab}
              onOpenDiscovery={() => setIsDiscoveryOpen(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
            />
          )}
        </Suspense>
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

      {/* Lazily Mounted Interactive Modals */}
      <Suspense fallback={null}>
        {isDiscoveryOpen && (
          <GuidedDiscoveryModal
            isOpen={isDiscoveryOpen}
            onClose={() => setIsDiscoveryOpen(false)}
            onSelectProspect={(prospect) => {
              setSelectedProspect(prospect);
              setCurrentTab('prospects');
            }}
            prospects={prospects}
            onDiscoveryComplete={() => syncWithBackend(true)}
            icp={icp}
            onSaveICP={handleSaveICP}
            onNavigateToTab={setCurrentTab}
            onUpdateStage={handleUpdateStage}
          />
        )}

        {isGuideOpen && (
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
        )}
      </Suspense>

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
                className="text-[#FF7054] hover:underline font-medium cursor-pointer"
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
