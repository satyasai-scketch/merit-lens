// Session management for demo - stores current user/tenant in localStorage
// TODO: Replace with proper authentication when backend is ready

export interface Session {
  userId: string;
  role: 'candidate' | 'admin' | 'super';
  tenantId: string;
  userName: string;
  email: string;
}

const SESSION_KEY = 'assessment_portal_session';

export const session = {
  get(): Session | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  set(sessionData: Session): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  },

  clear(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  isLoggedIn(): boolean {
    return this.get() !== null;
  },

  hasRole(role: string): boolean {
    const current = this.get();
    return current?.role === role;
  },

  canAccess(requiredRole: 'candidate' | 'admin' | 'super'): boolean {
    const current = this.get();
    if (!current) return false;

    // Role hierarchy: super > admin > candidate
    const roleHierarchy = { candidate: 1, admin: 2, super: 3 };
    return roleHierarchy[current.role] >= roleHierarchy[requiredRole];
  }
};

// Consent management
const CONSENT_KEY = 'assessment_portal_consent';

export const consent = {
  get(userId: string): boolean {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      const consents = stored ? JSON.parse(stored) : {};
      return consents[userId] === true;
    } catch {
      return false;
    }
  },

  set(userId: string, given: boolean): void {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      const consents = stored ? JSON.parse(stored) : {};
      consents[userId] = given;
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consents));
    } catch (error) {
      console.error('Error storing consent:', error);
    }
  }
};

// Assessment attempt management
export interface AttemptData {
  id: string;
  candidateId: string;
  component: 'flat' | 'aspiration' | 'values' | 'mindset';
  status: 'not-started' | 'in-progress' | 'completed';
  responses: Array<{
    itemId: string;
    answer: any;
    timeSpent: number;
    timestamp: string;
  }>;
  startedAt: string;
  lastSavedAt: string;
}

const ATTEMPTS_KEY = 'assessment_portal_attempts';

export const attempts = {
  getAll(candidateId: string): AttemptData[] {
    try {
      const stored = localStorage.getItem(ATTEMPTS_KEY);
      const allAttempts = stored ? JSON.parse(stored) : {};
      return allAttempts[candidateId] || [];
    } catch {
      return [];
    }
  },

  get(attemptId: string): AttemptData | null {
    try {
      const stored = localStorage.getItem(ATTEMPTS_KEY);
      const allAttempts = stored ? JSON.parse(stored) : {};
      
      for (const candidateAttempts of Object.values(allAttempts)) {
        const attempt = (candidateAttempts as AttemptData[]).find(a => a.id === attemptId);
        if (attempt) return attempt;
      }
      return null;
    } catch {
      return null;
    }
  },

  save(attempt: AttemptData): void {
    try {
      const stored = localStorage.getItem(ATTEMPTS_KEY);
      const allAttempts = stored ? JSON.parse(stored) : {};
      
      if (!allAttempts[attempt.candidateId]) {
        allAttempts[attempt.candidateId] = [];
      }
      
      const candidateAttempts = allAttempts[attempt.candidateId];
      const existingIndex = candidateAttempts.findIndex((a: AttemptData) => a.id === attempt.id);
      
      if (existingIndex >= 0) {
        candidateAttempts[existingIndex] = attempt;
      } else {
        candidateAttempts.push(attempt);
      }
      
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(allAttempts));
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  },

  create(candidateId: string, component: 'flat' | 'aspiration' | 'values' | 'mindset'): AttemptData {
    const attempt: AttemptData = {
      id: `${component}-${candidateId}-${Date.now()}`,
      candidateId,
      component,
      status: 'in-progress',
      responses: [],
      startedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString()
    };
    
    this.save(attempt);
    return attempt;
  }
};