import { 
  Prospect, 
  IdealCustomerProfile, 
  ActivityItem, 
  PipelineStage, 
  EmailDraft 
} from '../types';

// Normalize raw base URL: strip trailing slashes and any trailing /api/v1 so API_BASE_URL is always the root origin
const rawBaseUrl = ((import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000').trim();
const strippedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
export const API_BASE_URL = strippedBaseUrl.replace(/\/api\/v1\/?$/, '');

export function buildApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export const IS_EXPLICIT_DEMO_MODE = 
  import.meta.env.VITE_DEMO_MODE === 'true';

export class ApiError extends Error {
  status: number;
  detail: string;
  isTimeout: boolean;
  isNotFound: boolean;
  isConnectionRefused: boolean;

  constructor(
    status: number, 
    detail: string, 
    flags: { isTimeout?: boolean; isNotFound?: boolean; isConnectionRefused?: boolean } = {}
  ) {
    super(`API Error ${status}: ${detail}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.isTimeout = Boolean(flags.isTimeout);
    this.isNotFound = status === 404 || Boolean(flags.isNotFound);
    this.isConnectionRefused = Boolean(flags.isConnectionRefused);
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = buildApiUrl(endpoint);
  const timeoutMs = options.timeoutMs ?? (endpoint.includes('health') ? 7000 : 15000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
      headers,
    });
    clearTimeout(timer);

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const errJson = await res.json();
        detail = errJson.detail || detail;
      } catch {
        // ignore JSON parse error on non-json error responses
      }
      throw new ApiError(res.status, detail, { isNotFound: res.status === 404 });
    }

    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timer);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === 'AbortError') {
      throw new ApiError(
        0,
        `Request to backend timed out after ${timeoutMs}ms. The server may be waking up from cold-start sleep.`,
        { isTimeout: true }
      );
    }
    const isLocalhost = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
    const message = isLocalhost
      ? `Cannot connect to local backend at ${API_BASE_URL}. Ensure the FastAPI server is running on port 8000.`
      : `Cannot connect to ScoutSpark backend at ${API_BASE_URL}. Ensure the backend service is running and CORS allows this origin.`;
    throw new ApiError(
      0,
      message,
      { isConnectionRefused: true }
    );
  }
}

export const apiClient = {
  async checkHealth(timeoutMs: number = 7000): Promise<{ status: string; database: string; version: string }> {
    try {
      return await request('/health', { timeoutMs });
    } catch (err: any) {
      // If /health returned 404, fallback to /api/v1/health in case server mounts under /api/v1
      if (err instanceof ApiError && err.status === 404) {
        return await request('/api/v1/health', { timeoutMs });
      }
      throw err;
    }
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

    const url = buildApiUrl('/api/v1/prospects/import');
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

  async getResearchConfig(): Promise<{
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
    return request('/api/v1/research/config');
  },

  async runResearch(payload: {
    maxProspects?: number;
    mode?: 'live' | 'demo';
    userInstructions?: string;
  }): Promise<{
    runId: string;
    status: 'completed' | 'empty' | 'error';
    mode: 'live' | 'demo';
    queriesExecuted: string[];
    totalSourcesFound: number;
    uniqueCandidatesConsidered: number;
    candidatesAccepted: number;
    candidatesRejected: number;
    candidatesSaved: number;
    savedProspectIds: string[];
    rejections: Array<{
      companyName: string;
      domain: string;
      reason: string;
      relevanceDecision: string;
    }>;
    evidenceValidations: Array<{
      fact: string;
      companyName: string;
      sourceUrl?: string;
      status: string;
      reason: string;
    }>;
    prospects: Prospect[];
    sources: Array<{
      sourceId: string;
      url: string;
      title: string;
      snippet: string;
      provider: string;
      publishedDate?: string;
      retrievedAt: string;
    }>;
    stepOutcomes: Array<{
      step: string;
      status: 'success' | 'warning' | 'error' | 'skipped';
      summary: string;
      detail?: string;
    }>;
    warnings: string[];
    error?: string;
  }> {
    return request('/api/v1/research/run', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 90000,
    });
  },
};

