// Data access layer - currently reads from static JSON, ready to wire to APIs later
// TODO: Replace these functions with actual API calls when backend is ready

import { toast } from "@/hooks/use-toastA";

export interface Tenant {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
}

export interface User {
  id: string;
  tenantId: string;
  role: 'candidate' | 'admin' | 'super';
  email: string;
  name: string;
}

export interface AssessmentItem {
  id: string;
  type: 'single' | 'multi' | 'ranking' | 'sequence' | 'audio' | 'likert' | 'dilemma' | 'forced_ranking' | 'match';
  stem: string;
  options?: string[];
  timerSec?: number;
  scale?: number | { min: number; max: number; labels: [string, string]; };
  labels?: string[];
  subskill?: string;
  value?: string;
  reverse?: boolean;
  
  // Ranking question properties
  tokens?: string[];
  
  // Sequence question properties
  sequence?: string[];
  allowPartialRecall?: boolean;
  
  // Audio question properties
  audio?: {
    targetUrl: string;
    choices: string[];
    transcript?: string;
  };
  
  // Multi-select constraints
  minSelect?: number;
  maxSelect?: number;
  
  // Forced ranking properties
  requiredCount?: number;
  
  // Dilemma properties
  requireRationale?: boolean;
  
  // Match question properties
  prompts?: Array<{ id: string; label: string; }>;
  targets?: Array<{ id: string; label: string; }>;
  constraints?: {
    requiredPairs?: number;
    allowManyToOne?: boolean;
  };
}

export interface AttemptResult {
  attemptId: string;
  candidateId: string;
  scores: {
    FLAT?: number;
    ASP?: number;
    VAL?: number;
    MS?: number;
    COMPOSITE: number;
  };
  subskillScores?: Record<string, number>;
  bucket: 'Admit' | 'Counselling' | 'Bridge' | 'Reject';
  recommendedLevel?: string;
  drivers: string[];
  nextSteps: string[];
  completedDate: string;
  duration: number;
  confidence: number;
}

export interface DashboardData {
  kpis: {
    invited: number;
    started: number;
    completed: number;
    avgMinutes: number;
    completionRate: number;
  };
  buckets: Record<string, number>;
  trend: Array<{ date: string; completed: number; started: number; }>;
  funnel: Array<{ stage: string; count: number; percentage: number; }>;
  levelDistribution: Array<{ level: string; count: number; }>;
}

// Generic fetch helper
async function fetchJson<T>(path: string): Promise<T> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    toast({
      title: "Data Loading Error",
      description: `Failed to load data from ${path}`,
      variant: "destructive"
    });
    throw error;
  }
}

// API functions - TODO: Replace with actual endpoints
export const api = {
  // Tenant data
  async loadTenant(tenantId: string): Promise<Tenant> {
    const tenants = await fetchJson<Tenant[]>('/mock-data/tenants.json');
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);
    return tenant;
  },

  async loadTenants(): Promise<Tenant[]> {
    return fetchJson<Tenant[]>('/mock-data/tenants.json');
  },

  // User data
  async loadUsers(): Promise<User[]> {
    return fetchJson<User[]>('/mock-data/users.json');
  },

  async loadUser(userId: string): Promise<User> {
    const users = await this.loadUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error(`User ${userId} not found`);
    return user;
  },

  // Assessment data
  async loadAssessments(componentType: 'flat' | 'aspiration' | 'values' | 'mindset'): Promise<{ items: AssessmentItem[]; blueprint?: any; values?: string[]; }> {
    return fetchJson<{ items: AssessmentItem[]; blueprint?: any; values?: string[]; }>(`/mock-data/assessments_${componentType}.json`);
  },

  // Results data
  async loadAttemptResults(attemptId: string): Promise<AttemptResult> {
    // TODO: Replace with API call
    return fetchJson<AttemptResult>(`/mock-data/results_${attemptId}.json`);
  },

  // Dashboard data
  async loadDashboard(intakeId?: string): Promise<DashboardData> {
    // TODO: Add intake filtering when API is ready
    return fetchJson<DashboardData>('/mock-data/admin_dashboard.json');
  },

  // Heatmap data
  async loadHeatmap(intakeId?: string): Promise<any> {
    // TODO: Add intake filtering when API is ready
    return fetchJson<any>('/mock-data/heatmap.json');
  },

  // Candidates data
  async loadCandidates(intakeId?: string): Promise<any[]> {
    // TODO: Add intake filtering when API is ready
    return fetchJson<any[]>('/mock-data/candidates.json');  
  },

  // Submission - TODO: Replace with actual API call
  async submitAssessment(attemptId: string, responses: any[]): Promise<{ success: boolean; message: string; }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, just return success - scoring happens on backend
    return {
      success: true,
      message: "Assessment submitted successfully. Results are being processed."
    };
  }
};