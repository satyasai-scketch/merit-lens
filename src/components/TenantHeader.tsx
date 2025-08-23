import React from 'react';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TenantHeader() {
  const { session, clearSession } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  if (!session) return null;

  return (
    <header className="bg-card border-b border-border shadow-subtle">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold">
              {session.tenantName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {session.tenantName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Merit Assessment Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-4">
              Welcome, {session.userName}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/help')}
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}