import { 
  Prospect, 
  PipelineStage, 
  EmailDraft, 
  IdealCustomerProfile, 
  ResearchSignal, 
  EvaluationMetric, 
  ActivityItem 
} from '../types';
import { 
  MOCK_PROSPECTS, 
  INITIAL_ICP, 
  MOCK_SIGNALS, 
  MOCK_EVAL_METRICS, 
  INITIAL_ACTIVITIES 
} from './mockData';
import { apiClient, IS_EXPLICIT_DEMO_MODE } from './apiClient';

const PROSPECTS_STORAGE_KEY = 'scoutspark_prospects_v1';
const ICP_STORAGE_KEY = 'scoutspark_icp_v1';
const ACTIVITIES_STORAGE_KEY = 'scoutspark_activities_v1';

class ProspectService {
  private isDemoMode: boolean = IS_EXPLICIT_DEMO_MODE;

  // Local fallback storage only used if explicit demo mode is set
  private getLocalProspects(): Prospect[] {
    try {
      const data = localStorage.getItem(PROSPECTS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Unable to read localStorage', e);
    }
    return MOCK_PROSPECTS;
  }

  private saveLocalProspects(prospects: Prospect[]): void {
    try {
      localStorage.setItem(PROSPECTS_STORAGE_KEY, JSON.stringify(prospects));
    } catch (e) {
      console.warn('Unable to write localStorage', e);
    }
  }

  public saveLocalICP(icp: IdealCustomerProfile): void {
    try {
      localStorage.setItem(ICP_STORAGE_KEY, JSON.stringify(icp));
    } catch (e) {
      console.warn('Unable to write localStorage', e);
    }
  }

  public saveLocalActivities(activities: ActivityItem[]): void {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
    } catch (e) {
      console.warn('Unable to write localStorage', e);
    }
  }

  public getCachedProspects(): Prospect[] {
    return this.getLocalProspects();
  }

  public getCachedICP(): IdealCustomerProfile {
    try {
      const data = localStorage.getItem(ICP_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('LocalStorage ICP read error', e);
    }
    return INITIAL_ICP;
  }

  public getCachedActivities(): ActivityItem[] {
    try {
      const data = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('LocalStorage activities error', e);
    }
    return INITIAL_ACTIVITIES;
  }

  public getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  public setDemoMode(val: boolean): void {
    this.isDemoMode = val;
  }

  public async checkBackendHealth(timeoutMs: number = 7000): Promise<{ status: string; database: string; version: string }> {
    return await apiClient.checkHealth(timeoutMs);
  }

  public async getProspects(params?: {
    query?: string;
    industry?: string;
    minFitScore?: number;
    pipelineStage?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<Prospect[]> {
    if (this.isDemoMode) {
      let list = this.getLocalProspects();
      if (params?.query) {
        const q = params.query.toLowerCase();
        list = list.filter(p => 
          p.companyName.toLowerCase().includes(q) ||
          p.industry.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q)
        );
      }
      if (params?.industry && params.industry !== 'all') {
        list = list.filter(p => p.industry === params.industry);
      }
      if (params?.minFitScore && params.minFitScore > 0) {
        list = list.filter(p => p.fitScore >= params.minFitScore!);
      }
      if (params?.pipelineStage && params.pipelineStage !== 'all') {
        list = list.filter(p => p.pipelineStage === params.pipelineStage);
      }
      return list;
    }

    const list = await apiClient.getProspects(params);
    if (!params || Object.keys(params).length === 0) {
      this.saveLocalProspects(list);
    }
    return list;
  }

  public async getProspectById(id: string): Promise<Prospect | null> {
    if (this.isDemoMode) {
      const list = this.getLocalProspects();
      return list.find(p => p.id === id) || null;
    }
    try {
      return await apiClient.getProspectById(id);
    } catch {
      return null;
    }
  }

  public async createProspect(data: Partial<Prospect>): Promise<Prospect> {
    if (this.isDemoMode) {
      const list = this.getLocalProspects();
      const newP: Prospect = {
        id: data.id || `prospect-${Date.now()}`,
        companyName: data.companyName || 'New Prospect',
        domain: data.domain || 'domain.internal',
        industry: data.industry || 'B2B Software',
        subIndustry: data.subIndustry || '',
        headquarters: data.headquarters || 'Remote',
        employeeCount: data.employeeCount || '20-50 employees',
        stage: data.stage || 'Seed',
        fitScore: data.fitScore || 70,
        fitLevel: data.fitLevel || 'moderate',
        fitReasons: data.fitReasons || ['Manual entry'],
        summary: data.summary || '',
        pipelineStage: data.pipelineStage || 'to_research',
        observedFacts: data.observedFacts || [],
        hypotheses: data.hypotheses || [],
        missingInformation: data.missingInformation || [],
        recommendedAngle: data.recommendedAngle || { hook: '', valueProposition: '', suggestedCta: '' },
        targetBuyer: data.targetBuyer || { name: '', title: '', emailPlaceholder: '', linkedinNote: '', roleType: '' },
        emailDraft: data.emailDraft || { subject: '', body: '', customizationVariables: {}, isApproved: false },
        uncertaintyIndicators: data.uncertaintyIndicators || [],
        tags: data.tags || [],
        lastUpdated: new Date().toISOString(),
      };
      list.push(newP);
      this.saveLocalProspects(list);
      return newP;
    }
    return await apiClient.createProspect(data);
  }

  public async updateProspectStage(id: string, stage: PipelineStage, outcomeNotes?: string): Promise<Prospect | null> {
    if (this.isDemoMode) {
      const list = this.getLocalProspects();
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) return null;
      list[idx].pipelineStage = stage;
      if (outcomeNotes !== undefined) list[idx].outcomeNotes = outcomeNotes;
      list[idx].lastUpdated = new Date().toISOString();
      this.saveLocalProspects(list);
      return list[idx];
    }

    return await apiClient.updateStage(id, stage, outcomeNotes);
  }

  public async updateProspectOutcome(id: string, outcomeNotes: string): Promise<Prospect | null> {
    if (this.isDemoMode) {
      const list = this.getLocalProspects();
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) return null;
      list[idx].outcomeNotes = outcomeNotes;
      list[idx].lastUpdated = new Date().toISOString();
      this.saveLocalProspects(list);
      return list[idx];
    }

    return await apiClient.updateOutcome(id, outcomeNotes);
  }

  public async updateEmailDraft(id: string, draftPatch: Partial<EmailDraft>): Promise<Prospect | null> {
    if (this.isDemoMode) {
      const list = this.getLocalProspects();
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) return null;
      list[idx].emailDraft = { ...list[idx].emailDraft, ...draftPatch };
      list[idx].lastUpdated = new Date().toISOString();
      this.saveLocalProspects(list);
      return list[idx];
    }

    // In API mode, update the prospect directly with the new emailDraft payload
    const prospect = await apiClient.getProspectById(id);
    const updatedDraft = { ...prospect.emailDraft, ...draftPatch };
    return await apiClient.updateProspect(id, { emailDraft: updatedDraft });
  }

  public async approveEmailDraft(id: string, approvedBy: string = 'Founder'): Promise<Prospect | null> {
    const approvedPatch: Partial<EmailDraft> = {
      isApproved: true,
      approvedAt: new Date().toISOString(),
      approvedBy: `${approvedBy} (Human Verified)`,
    };

    if (this.isDemoMode) {
      const list = this.getLocalProspects();
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) return null;
      list[idx].emailDraft = { ...list[idx].emailDraft, ...approvedPatch };
      if (list[idx].pipelineStage === 'ready_to_review' || list[idx].pipelineStage === 'to_research') {
        list[idx].pipelineStage = 'approved';
      }
      list[idx].lastUpdated = new Date().toISOString();
      this.saveLocalProspects(list);
      return list[idx];
    }

    // In API mode, update draft and advance pipelineStage to 'approved'
    const prospect = await apiClient.getProspectById(id);
    const updatedDraft = { ...prospect.emailDraft, ...approvedPatch };
    const newStage: PipelineStage = 
      prospect.pipelineStage === 'ready_to_review' || prospect.pipelineStage === 'to_research'
        ? 'approved'
        : prospect.pipelineStage;

    return await apiClient.updateProspect(id, {
      emailDraft: updatedDraft,
      pipelineStage: newStage,
    });
  }

  public async getICP(): Promise<IdealCustomerProfile> {
    if (this.isDemoMode) {
      try {
        const data = localStorage.getItem(ICP_STORAGE_KEY);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.warn('LocalStorage ICP read error', e);
      }
      return INITIAL_ICP;
    }

    const result = await apiClient.getICP();
    this.saveLocalICP(result);
    return result;
  }

  public async updateICP(icp: IdealCustomerProfile): Promise<IdealCustomerProfile> {
    if (this.isDemoMode) {
      const updated = { ...icp, lastUpdated: new Date().toISOString() };
      try {
        localStorage.setItem(ICP_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage ICP write error', e);
      }
      return updated;
    }

    const saved = await apiClient.updateICP(icp);
    this.saveLocalICP(saved);
    return saved;
  }

  public getCachedSignals(): ResearchSignal[] {
    return [...MOCK_SIGNALS];
  }

  public getCachedMetrics(): EvaluationMetric[] {
    return [...MOCK_EVAL_METRICS];
  }

  public async getSignals(): Promise<ResearchSignal[]> {
    return this.getCachedSignals();
  }

  public async getEvalMetrics(): Promise<EvaluationMetric[]> {
    return this.getCachedMetrics();
  }

  public async getActivities(limit: number = 20): Promise<ActivityItem[]> {
    if (this.isDemoMode) {
      try {
        const data = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.warn('LocalStorage activities error', e);
      }
      return INITIAL_ACTIVITIES;
    }

    const acts = await apiClient.getActivities(limit);
    this.saveLocalActivities(acts);
    return acts;
  }

  public async addActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> {
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      ...item,
    };

    if (this.isDemoMode) {
      const current = await this.getActivities();
      const updated = [newActivity, ...current].slice(0, 20);
      try {
        localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save activities error', e);
      }
      return newActivity;
    }

    // In API mode, activities are recorded automatically by backend mutations
    return newActivity;
  }

  public async importCSV(file: File): Promise<{
    importedCount: number;
    errorCount: number;
    errors: Array<{ row: number; error: string }>;
    prospects: Prospect[];
  }> {
    if (this.isDemoMode) {
      throw new Error('CSV upload is only supported with active backend connection.');
    }
    return await apiClient.importCSV(file);
  }

  public async getResearchConfig(): Promise<{
    configured: boolean;
    llmProvider: string;
    searchProvider: string;
    provider: string;
    mode: string;
    model: string;
    geminiConfigured: boolean;
    tavilyConfigured: boolean;
    connectionStatus: string;
  }> {
    if (this.isDemoMode) {
      return {
        configured: false,
        llmProvider: 'Local Simulation',
        searchProvider: 'Offline Fixtures',
        provider: 'Local Mock Simulation',
        mode: 'demo',
        model: 'scout-mock-v1',
        geminiConfigured: false,
        tavilyConfigured: false,
        connectionStatus: 'offline_demo',
      };
    }
    return await apiClient.getResearchConfig();
  }

  public async runResearch(payload: {
    maxProspects?: number;
    mode?: 'live' | 'demo';
    userInstructions?: string;
  }) {
    if (this.isDemoMode) {
      return {
        runId: 'run-demo-sim',
        status: 'completed' as const,
        mode: 'demo' as const,
        queriesExecuted: ['Local simulated prospect scan'],
        totalSourcesFound: 2,
        uniqueCandidatesConsidered: 1,
        candidatesFound: 1,
        candidatesAccepted: 1,
        candidatesRejected: 0,
        candidatesSaved: 1,
        savedProspectIds: ['prospect-01'],
        rejections: [],
        evidenceValidations: [
          {
            sourceId: 'src-demo-01',
            candidateName: 'KiteMetrics',
            claim: 'Kafka buffer saturation noted in postmortem',
            status: 'verified' as const,
            reason: 'Grounded in public engineering archive snippet',
          }
        ],
        prospects: this.getLocalProspects().slice(0, 1),
        sources: [],
        stepOutcomes: [
          { step: 'validate_input', status: 'success' as const, summary: 'Input verified against ICP' },
          { step: 'search_sources', status: 'success' as const, summary: 'Simulated source scan complete' },
          { step: 'relevance_gate', status: 'success' as const, summary: 'Relevance gate passed 1 account' },
          { step: 'ground_and_validate', status: 'success' as const, summary: 'Evidence grounded in sources' },
          { step: 'qualify_and_score', status: 'success' as const, summary: 'ICP score calculated' },
        ],
        warnings: [],
      };
    }
    return await apiClient.runResearch(payload);
  }

  public resetDemoData(): void {
    localStorage.removeItem(PROSPECTS_STORAGE_KEY);
    localStorage.removeItem(ICP_STORAGE_KEY);
    localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
  }
}

export const prospectService = new ProspectService();
