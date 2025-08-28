import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { session } from '@/lib/session';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'candidate' | 'admin' | 'super';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const currentSession = session.get();

  if (!currentSession) {
    // Redirect to login with return URL
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole && !session.canAccess(requiredRole)) {
    // User doesn't have required role, redirect to their appropriate home
    const roleHomePages = {
      candidate: '/candidate',
      admin: '/admin/dashboard',
      super: '/super/rubric'
    };
    return <Navigate to={roleHomePages[currentSession.role]} replace />;
  }

  return <>{children}</>;
}