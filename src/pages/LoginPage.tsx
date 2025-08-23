import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { loadTenants, loadUsers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'admin' | 'super'>('candidate');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setSession } = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    // Load tenants and users
    Promise.all([loadTenants(), loadUsers()])
      .then(([tenantsData, usersData]) => {
        setTenants(tenantsData);
        setUsers(usersData);
        if (tenantsData.length > 0) {
          setSelectedTenant(tenantsData[0].id);
        }
      })
      .catch(error => {
        console.error('Failed to load data:', error);
        toast({
          title: "Error",
          description: "Failed to load application data. Please refresh the page.",
          variant: "destructive"
        });
      });
  }, [toast]);

  const handleLogin = async () => {
    if (!selectedTenant || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please select both a role and institution.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Find matching user
      const user = users.find(u => u.tenantId === selectedTenant && u.role === selectedRole);
      const tenant = tenants.find(t => t.id === selectedTenant);

      if (!user || !tenant) {
        throw new Error('Invalid user or tenant selection');
      }

      // Create session
      const session = {
        userId: user.id,
        tenantId: tenant.id,
        role: selectedRole,
        userName: user.name,
        tenantName: tenant.name
      };

      setSession(session);

      // Navigate based on role
      switch (selectedRole) {
        case 'candidate':
          navigate('/candidate');
          break;
        case 'admin':
          navigate('/admin');
          break;
        case 'super':
          navigate('/super/rubric');
          break;
      }

      toast({
        title: "Login Successful",
        description: `Welcome, ${user.name}!`
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login Failed",
        description: "Unable to log in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = {
    candidate: {
      icon: GraduationCap,
      title: 'Student/Candidate',
      description: 'Take assessments and view your results',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    admin: {
      icon: Users,
      title: 'Institute Administrator',
      description: 'Manage intakes, view analytics, and oversee assessments',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    super: {
      icon: Shield,
      title: 'System Administrator',
      description: 'Configure rubrics and system-wide settings',
      color: 'bg-red-50 border-red-200 text-red-800'
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-strong">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Merit Assessment Portal</CardTitle>
          <CardDescription>
            Select your role and institution to access the assessment platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Role</label>
            <div className="grid gap-2">
              {(Object.keys(roleInfo) as Array<keyof typeof roleInfo>).map((role) => {
                const info = roleInfo[role];
                const Icon = info.icon;
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedRole === role
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{info.title}</div>
                        <div className="text-xs text-muted-foreground">{info.description}</div>
                      </div>
                      {selectedRole === role && (
                        <Badge variant="secondary" className="text-xs">Selected</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Institution Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Institution</label>
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger>
                <SelectValue placeholder="Select institution" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map(tenant => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full" 
            disabled={loading || !selectedTenant}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Logging in...
              </div>
            ) : (
              'Access Portal'
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Demo mode - select any role to explore the platform
          </div>
        </CardContent>
      </Card>
    </div>
  );
}