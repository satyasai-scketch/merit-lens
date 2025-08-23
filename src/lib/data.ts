// Data Access Layer - mockable for future API integration
// TODO: Replace with API calls to backend endpoints

export interface Tenant {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  website: string;
}

export interface User {
  id: string;
  tenantId: string;
  role: 'candidate' | 'admin' | 'super';
  email: string;
  name: string;
  currentIntakeId?: string;
}

export interface Assessment {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  items: AssessmentItem[];
}

export interface AssessmentItem {
  id: string;
  type: 'single' | 'multi' | 'ranking' | 'sequence' | 'audio' | 'likert' | 'dilemma';
  stem: string;
  subskill?: string;
  value?: string;
  options?: string[];
  tokens?: string[];
  sequence?: string[];
  audioUrl?: string;
  choices?: string[];
  scale?: number;
  labels?: string[];
  timerSec?: number;
  reverse?: boolean;
}

export interface AttemptResult {
  attemptId: string;
  candidateId: string;
  tenantId: string;
  timestamp: string;
  scores: {
    FLAT: number;
    ASP: number;
    VAL: number;
    MS: number;
    COMPOSITE: number;
  };
  subskillScores?: Record<string, number>;
  bucket: 'Admit' | 'Counselling' | 'Bridge' | 'Reject';
  confidence: number;
  drivers: string[];
  nextSteps: string[];
  strengths: string[];
  developmentAreas: string[];
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
  trend: Array<{ date: string; completed: number }>;
  funnel: Array<{ stage: string; count: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
}

export interface HeatmapData {
  subskills: string[];
  levels: string[];
  matrix: number[][];
  candidateCount: number;
  lastUpdated: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  eligibleRetest: boolean;
  lastComposite: number;
  bucket: string;
  lastAttemptDate: string;
  retestReason: string | null;
}

// Base URL for mock data - TODO: Replace with API base URL
const MOCK_BASE = '/mock-data';

// Generic fetch helper with error handling
async function fetchMockData<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${MOCK_BASE}/${path}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading mock data from ${path}:`, error);
    throw error;
  }
}

// Tenant operations
export async function loadTenant(tenantId: string): Promise<Tenant | null> {
  // TODO: Replace with API call: GET /api/tenants/${tenantId}
  const tenants = await fetchMockData<Tenant[]>('tenants.json');
  return tenants.find(t => t.id === tenantId) || null;
}

export async function loadTenants(): Promise<Tenant[]> {
  // TODO: Replace with API call: GET /api/tenants
  return await fetchMockData<Tenant[]>('tenants.json');
}

// User operations
export async function loadUser(userId: string): Promise<User | null> {
  // TODO: Replace with API call: GET /api/users/${userId}
  const users = await fetchMockData<User[]>('users.json');
  return users.find(u => u.id === userId) || null;
}

export async function loadUsers(tenantId?: string): Promise<User[]> {
  // TODO: Replace with API call: GET /api/users?tenantId=${tenantId}
  const users = await fetchMockData<User[]>('users.json');
  return tenantId ? users.filter(u => u.tenantId === tenantId) : users;
}

// Assessment operations
export async function loadAssessment(componentType: 'flat' | 'aspiration' | 'values' | 'mindset'): Promise<Assessment> {
  // TODO: Replace with API call: GET /api/assessments/${componentType}
  return await fetchMockData<Assessment>(`assessments_${componentType}.json`);
}

// Dashboard operations
export async function loadDashboard(intakeId?: string): Promise<DashboardData> {
  // TODO: Replace with API call: GET /api/dashboard?intakeId=${intakeId}
  return await fetchMockData<DashboardData>('admin_dashboard.json');
}

// Heatmap operations
export async function loadHeatmap(intakeId?: string): Promise<HeatmapData> {
  // TODO: Replace with API call: GET /api/heatmap?intakeId=${intakeId}
  return await fetchMockData<HeatmapData>('heatmap.json');
}

// Candidate operations
export async function loadCandidates(intakeId?: string): Promise<Candidate[]> {
  // TODO: Replace with API call: GET /api/candidates?intakeId=${intakeId}
  return await fetchMockData<Candidate[]>('candidates.json');
}

// Results operations
export async function loadAttemptResults(attemptId: string): Promise<AttemptResult> {
  // TODO: Replace with API call: GET /api/attempts/${attemptId}/results
  return await fetchMockData<AttemptResult>(`results_${attemptId}.json`);
}

// Session management (local storage for demo)
export interface Session {
  userId: string;
  tenantId: string;
  role: 'candidate' | 'admin' | 'super';
  userName: string;
  tenantName: string;
}

export function getSession(): Session | null {
  try {
    const sessionData = localStorage.getItem('assessment_session');
    return sessionData ? JSON.parse(sessionData) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  localStorage.setItem('assessment_session', JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem('assessment_session');
}

// Assessment attempt management (local storage for demo)
export interface AttemptState {
  attemptId: string;
  componentType: string;
  currentItemIndex: number;
  responses: Record<string, any>;
  startedAt: string;
  lastSavedAt: string;
  status: 'in-progress' | 'completed' | 'submitted';
}

export function saveAttemptState(attempt: AttemptState): void {
  const key = `attempt_${attempt.attemptId}`;
  localStorage.setItem(key, JSON.stringify({
    ...attempt,
    lastSavedAt: new Date().toISOString()
  }));
}

export function loadAttemptState(attemptId: string): AttemptState | null {
  try {
    const data = localStorage.getItem(`attempt_${attemptId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearAttemptState(attemptId: string): void {
  localStorage.removeItem(`attempt_${attemptId}`);
}