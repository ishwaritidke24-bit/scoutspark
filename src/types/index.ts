export type PipelineStage = 
  | 'to_research' 
  | 'ready_to_review' 
  | 'approved' 
  | 'contacted' 
  | 'replied' 
  | 'meeting' 
  | 'won' 
  | 'not_a_fit';

export interface ObservedFact {
  id: string;
  fact: string;
  source: string;
  sourceUrl?: string;
  date?: string;
  verified: boolean;
}

export interface Hypothesis {
  id: string;
  hypothesis: string;
  rationale: string;
  confidence: 'high' | 'medium' | 'speculative';
}

export interface TargetBuyer {
  name: string;
  title: string;
  emailPlaceholder: string;
  linkedinNote: string;
  roleType: string;
}

export interface EmailDraft {
  subject: string;
  body: string;
  customizationVariables: Record<string, string>;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

export interface RecommendedAngle {
  hook: string;
  valueProposition: string;
  suggestedCta: string;
}

export interface Prospect {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  subIndustry: string;
  headquarters: string;
  employeeCount: string;
  stage: string;
  fitScore: number;
  fitLevel: 'exceptional' | 'strong' | 'moderate' | 'unlikely';
  fitReasons: string[];
  summary: string;
  pipelineStage: PipelineStage;
  observedFacts: ObservedFact[];
  hypotheses: Hypothesis[];
  missingInformation: string[];
  recommendedAngle: RecommendedAngle;
  targetBuyer: TargetBuyer;
  emailDraft: EmailDraft;
  uncertaintyIndicators: string[];
  lastUpdated: string;
  outcomeNotes?: string;
  tags: string[];
  provenance?: 'demo' | 'researched' | 'csv' | string;
}

export interface IdealCustomerProfile {
  companyName: string;
  productName: string;
  companyDescription: string;
  valueProposition: string;
  targetIndustries: string[];
  targetRoles: string[];
  targetGeographies: string[];
  companySizeRanges: string[];
  fundingStages: string[];
  exclusions: string[];
  primaryPainPoint: string;
  lastUpdated: string;
}

export interface ResearchSignal {
  id: string;
  type: 'hiring_surge' | 'tech_stack_migration' | 'executive_hire' | 'funding_round' | 'product_launch';
  companyName: string;
  prospectId?: string;
  title: string;
  summary: string;
  timestamp: string;
  confidence: number;
  relevanceScore: number;
  impactBadge: string;
}

export interface EvaluationMetric {
  id: string;
  name: string;
  category: 'accuracy' | 'grounding' | 'ranking' | 'efficiency';
  score: string;
  target: string;
  status: 'healthy' | 'improving' | 'needs_tuning';
  benchmarkNotes: string;
  description: string;
  trend: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'approval' | 'pipeline_move' | 'research_signal' | 'draft_edited' | 'icp_updated';
  title: string;
  description: string;
  prospectName?: string;
  user: string;
}

export type ViewTab = 'dashboard' | 'prospects' | 'pipeline' | 'campaigns' | 'eval-lab' | 'settings';

export type BackendStatus = 'connecting' | 'waking_up' | 'connected' | 'disconnected' | 'local_demo';
