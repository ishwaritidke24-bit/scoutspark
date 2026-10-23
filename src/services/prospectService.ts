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

const PROSPECTS_STORAGE_KEY = 'scoutspark_prospects_v1';
const ICP_STORAGE_KEY = 'scoutspark_icp_v1';
const ACTIVITIES_STORAGE_KEY = 'scoutspark_activities_v1';

class ProspectService {
  private getStoredProspects(): Prospect[] {
    try {
      const data = localStorage.getItem(PROSPECTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Unable to access localStorage, fallback to in-memory mock', e);
    }
    return MOCK_PROSPECTS;
  }

  private saveProspects(prospects: Prospect[]): void {
    try {
      localStorage.setItem(PROSPECTS_STORAGE_KEY, JSON.stringify(prospects));
    } catch (e) {
      console.warn('Unable to write to localStorage', e);
    }
  }

  public async getProspects(): Promise<Prospect[]> {
    // Deterministic simulation layer
    return [...this.getStoredProspects()];
  }

  public async getProspectById(id: string): Promise<Prospect | null> {
    const list = this.getStoredProspects();
    return list.find(p => p.id === id) || null;
  }

  public async updateProspectStage(id: string, stage: PipelineStage, outcomeNotes?: string): Promise<Prospect | null> {
    const list = this.getStoredProspects();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updated: Prospect = {
      ...list[index],
      pipelineStage: stage,
      outcomeNotes: outcomeNotes !== undefined ? outcomeNotes : list[index].outcomeNotes,
      lastUpdated: new Date().toISOString()
    };

    list[index] = updated;
    this.saveProspects(list);

    // Record activity
    await this.addActivity({
      type: 'pipeline_move',
      title: `Pipeline Stage Updated`,
      description: `Moved ${updated.companyName} to "${stage.replace('_', ' ').toUpperCase()}".`,
      prospectName: updated.companyName,
      user: 'Founder'
    });

    return updated;
  }

  public async updateEmailDraft(id: string, draftPatch: Partial<EmailDraft>): Promise<Prospect | null> {
    const list = this.getStoredProspects();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedDraft: EmailDraft = {
      ...list[index].emailDraft,
      ...draftPatch
    };

    const updated: Prospect = {
      ...list[index],
      emailDraft: updatedDraft,
      lastUpdated: new Date().toISOString()
    };

    list[index] = updated;
    this.saveProspects(list);

    await this.addActivity({
      type: 'draft_edited',
      title: 'Email Draft Customized',
      description: `Tailored outbound message draft for ${updated.targetBuyer.name} at ${updated.companyName}.`,
      prospectName: updated.companyName,
      user: 'Founder'
    });

    return updated;
  }

  public async approveEmailDraft(id: string, approvedBy: string = 'Founder'): Promise<Prospect | null> {
    const list = this.getStoredProspects();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedDraft: EmailDraft = {
      ...list[index].emailDraft,
      isApproved: true,
      approvedAt: new Date().toISOString(),
      approvedBy: `${approvedBy} (Human Verified)`
    };

    // When approved, automatically advance to 'approved' pipeline stage if it was in ready_to_review or to_research
    const newStage: PipelineStage = 
      list[index].pipelineStage === 'ready_to_review' || list[index].pipelineStage === 'to_research' 
        ? 'approved' 
        : list[index].pipelineStage;

    const updated: Prospect = {
      ...list[index],
      emailDraft: updatedDraft,
      pipelineStage: newStage,
      lastUpdated: new Date().toISOString()
    };

    list[index] = updated;
    this.saveProspects(list);

    await this.addActivity({
      type: 'approval',
      title: 'Outreach Approved by Human',
      description: `Approved email draft for ${updated.targetBuyer.name} at ${updated.companyName}. Ready for manual send.`,
      prospectName: updated.companyName,
      user: approvedBy
    });

    return updated;
  }

  public async getICP(): Promise<IdealCustomerProfile> {
    try {
      const data = localStorage.getItem(ICP_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Unable to access localStorage for ICP', e);
    }
    return INITIAL_ICP;
  }

  public async updateICP(icp: IdealCustomerProfile): Promise<IdealCustomerProfile> {
    const updated = {
      ...icp,
      lastUpdated: new Date().toISOString()
    };
    try {
      localStorage.setItem(ICP_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to write ICP to localStorage', e);
    }

    await this.addActivity({
      type: 'icp_updated',
      title: 'ICP Parameters Tuned',
      description: `Updated targeting criteria: ${icp.targetIndustries.length} industries, ${icp.companySizeRanges.join(', ')}.`,
      user: 'Founder'
    });

    return updated;
  }

  public async getSignals(): Promise<ResearchSignal[]> {
    return [...MOCK_SIGNALS];
  }

  public async getEvalMetrics(): Promise<EvaluationMetric[]> {
    return [...MOCK_EVAL_METRICS];
  }

  public async getActivities(): Promise<ActivityItem[]> {
    try {
      const data = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Unable to access activities in localStorage', e);
    }
    return INITIAL_ACTIVITIES;
  }

  public async addActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> {
    const current = await this.getActivities();
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      ...item
    };
    const updated = [newActivity, ...current].slice(0, 20);
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to save activities', e);
    }
    return newActivity;
  }

  public resetDemoData(): void {
    localStorage.removeItem(PROSPECTS_STORAGE_KEY);
    localStorage.removeItem(ICP_STORAGE_KEY);
    localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
  }
}

export const prospectService = new ProspectService();
