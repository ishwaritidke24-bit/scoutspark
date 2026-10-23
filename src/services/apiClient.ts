import { 
  Prospect, 
  IdealCustomerProfile, 
  ActivityItem, 
  PipelineStage, 
  EmailDraft 
} from '../types';

export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const IS_EXPLICIT_DEMO_MODE = 
  import.meta.env.VITE_DEMO_MODE === 'true';

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(`API Error ${status}: ${detail}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const errJson = await res.json();
        detail = errJson.detail || detail;
      } catch {
        // ignore JSON parse error on non-json error responses
      }
      throw new ApiError(res.status, detail);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      0,
      `Cannot connect to ScoutSpark backend at ${API_BASE_URL}. Ensure uvicorn is running.`
    );
  }
}

export const apiClient = {
  async checkHealth(): Promise<{ status: string; database: string; version: string }> {
    return request('/health');
  },

  async getDashboardSummary(): Promise<any> {
    return request('/api/v1/dashboard/summary');
  },

  async getProspects(params?: {
    query?: string;
    industry?: string;
    minFitScore?: number;
    pipelineStage?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<Prospect[]> {
    const queryParts: string[] = [];
    if (params?.query) queryParts.push(`query=${encodeURIComponent(params.query)}`);
    if (params?.industry && params.industry !== 'all') {
      queryParts.push(`industry=${encodeURIComponent(params.industry)}`);
    }
    if (params?.minFitScore && params.minFitScore > 0) {
      queryParts.push(`min_fit_score=${params.minFitScore}`);
    }
    if (params?.pipelineStage && params.pipelineStage !== 'all') {
      queryParts.push(`pipeline_stage=${encodeURIComponent(params.pipelineStage)}`);
    }
    if (params?.sortBy) queryParts.push(`sort_by=${encodeURIComponent(params.sortBy)}`);
    if (params?.sortDirection) queryParts.push(`sort_direction=${params.sortDirection}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return request<Prospect[]>(`/api/v1/prospects${queryString}`);
  },

  async getProspectById(id: string): Promise<Prospect> {
    return request<Prospect>(`/api/v1/prospects/${id}`);
  },

  async createProspect(data: Partial<Prospect>): Promise<Prospect> {
    return request<Prospect>('/api/v1/prospects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProspect(id: string, data: Partial<Prospect>): Promise<Prospect> {
    return request<Prospect>(`/api/v1/prospects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async updateStage(id: string, stage: PipelineStage, outcomeNotes?: string): Promise<Prospect> {
    return request<Prospect>(`/api/v1/prospects/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({
        pipelineStage: stage,
        outcomeNotes,
        user: 'Founder',
      }),
    });
  },

  async updateOutcome(id: string, outcomeNotes: string): Promise<Prospect> {
    return request<Prospect>(`/api/v1/prospects/${id}/outcome`, {
      method: 'PATCH',
      body: JSON.stringify({
        outcomeNotes,
        user: 'Founder',
      }),
    });
  },

  async deleteProspect(id: string): Promise<void> {
    return request<void>(`/api/v1/prospects/${id}`, {
      method: 'DELETE',
    });
  },

  async getICP(): Promise<IdealCustomerProfile> {
    return request<IdealCustomerProfile>('/api/v1/icp');
  },

  async updateICP(icp: Partial<IdealCustomerProfile>): Promise<IdealCustomerProfile> {
    return request<IdealCustomerProfile>('/api/v1/icp', {
      method: 'PUT',
      body: JSON.stringify(icp),
    });
  },

  async getActivities(limit: number = 20): Promise<ActivityItem[]> {
    return request<ActivityItem[]>(`/api/v1/activities?limit=${limit}`);
  },

  async getOutreachDrafts(prospectId?: string): Promise<any[]> {
    const qs = prospectId ? `?prospect_id=${encodeURIComponent(prospectId)}` : '';
    return request<any[]>(`/api/v1/outreach-drafts${qs}`);
  },

  async createOutreachDraft(draft: {
    prospectId: string;
    subject: string;
    body: string;
    notes?: string;
  }): Promise<any> {
    return request('/api/v1/outreach-drafts', {
      method: 'POST',
      body: JSON.stringify(draft),
    });
  },

  async updateOutreachDraft(draftId: string, patch: Partial<EmailDraft>): Promise<any> {
    return request(`/api/v1/outreach-drafts/${draftId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },

  async importCSV(file: File): Promise<{
    importedCount: number;
    errorCount: number;
    errors: Array<{ row: number; error: string }>;
    prospects: Prospect[];
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/api/v1/prospects/import`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const errJson = await res.json();
        detail = errJson.detail || detail;
      } catch {}
      throw new ApiError(res.status, detail);
    }

    return await res.json();
  },
};
