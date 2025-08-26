import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  Home, 
  BarChart3, 
  Users, 
  FileText, 
  Download,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { session, type Session } from '@/lib/session';
import { api, type Tenant } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayoutA({ children }: AppLayoutProps) {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionData = session.get();
    setCurrentSession(sessionData);
    
    if (sessionData) {
      api.loadTenant(sessionData.tenantId)
        .then(setTenant)
        .catch(console.error);
    }
  }, []);

  const handleLogout = () => {
    session.clear();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    navigate('/login');
  };

  const getNavigationItems = () => {
    if (!currentSession) return [];

    const common = [
      { path: '/settings', label: 'Settings', icon: Settings },
      { path: '/help', label: 'Help', icon: HelpCircle }
    ];

    switch (currentSession.role) {
      case 'candidate':
        return [
          { path: '/candidate', label: 'Dashboard', icon: Home },
          { path: '/candidate/assessments', label: 'Assessments', icon: FileText },
          ...common
        ];
      
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/admin/heatmap', label: 'Heatmap', icon: BarChart3 },
          { path: '/admin/retests', label: 'Retests', icon: RefreshCw },
          { path: '/admin/exports', label: 'Exports', icon: Download },
          ...common
        ];
      
      case 'super':
        return [
          { path: '/super/rubric', label: 'Rubric Config', icon: Settings },
          { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
          ...common
        ];
      
      default:
        return common;
    }
  };

  const navigationItems = getNavigationItems();

  if (!currentSession) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and tenant info */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">AP</span>
                </div>
                <span className="font-semibold text-foreground">Assessment Portal</span>
              </Link>
              
              {tenant && (
                <Badge variant="secondary" className="ml-4">
                  {tenant.name}
                </Badge>
              )}
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant={isActive ? "default" : "ghost"} 
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentSession.userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{currentSession.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentSession.email}
                    </p>
                    <Badge variant="outline" className="w-fit text-xs">
                      {currentSession.role}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/help" className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}