import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { Navigation } from '@/components/Navigation';
import { TenantHeader } from '@/components/TenantHeader';

export function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TenantHeader />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function CandidateLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session || session.role !== 'candidate') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TenantHeader />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}