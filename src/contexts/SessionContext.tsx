import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, getSession, setSession as saveSession, clearSession as removeSession } from '@/lib/data';

interface SessionContextType {
  session: Session | null;
  setSession: (session: Session) => void;
  clearSession: () => void;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load session from localStorage on mount
    const savedSession = getSession();
    setSessionState(savedSession);
    setIsLoading(false);
  }, []);

  const setSession = (newSession: Session) => {
    setSessionState(newSession);
    saveSession(newSession);
  };

  const clearSession = () => {
    setSessionState(null);
    removeSession();
  };

  return (
    <SessionContext.Provider value={{
      session,
      setSession,
      clearSession,
      isLoading
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}