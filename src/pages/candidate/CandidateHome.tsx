import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Play, AlertCircle } from 'lucide-react';
import { consent, attempts, type AttemptData } from '@/lib/session';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/contexts/SessionContext';

const ASSESSMENT_COMPONENTS = [
  {
    id: 'flat',
    name: 'FLAT (Language Aptitude)',
    description: 'Test of phonetic, grammar, vocabulary, audio, and memory skills',
    estimatedMinutes: 25,
    order: 1
  },
  {
    id: 'aspiration',
    name: 'Aspiration Assessment',
    description: 'Evaluate your motivation and goals for language learning',
    estimatedMinutes: 10,
    order: 2
  },
  {
    id: 'values',
    name: 'Values Assessment',
    description: 'Understand your personal values and cultural fit',
    estimatedMinutes: 15,
    order: 3
  },
  {
    id: 'mindset',
    name: 'Mindset Assessment', 
    description: 'Assess your approach to learning and growth',
    estimatedMinutes: 8,
    order: 4
  }
];

export default function CandidateHome() {
  const { session } = useSession();   // ✅ pull from context instead of session.get()
  const [hasConsent, setHasConsent] = useState(false);
  const [userAttempts, setUserAttempts] = useState<AttemptData[]>([]);

  useEffect(() => {
    if (!session) return;

    setHasConsent(consent.get(session.userId));
    setUserAttempts(attempts.getAll(session.userId));
  }, [session]);

  const getComponentStatus = (componentId: string) => {
    const attempt = userAttempts.find(a => a.component === componentId);
    if (!attempt) return 'not-started';
    return attempt.status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-status-in-progress" />;
      default:
        return <Play className="h-5 w-5 text-status-not-started" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'completed': 'default',
      'in-progress': 'secondary', 
      'not-started': 'outline'
    } as const;
    
    const labels = {
      'completed': 'Completed',
      'in-progress': 'In Progress',
      'not-started': 'Not Started'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || 'Unknown'}
      </Badge>
    );
  };

  const completedCount = ASSESSMENT_COMPONENTS.filter(comp => 
    getComponentStatus(comp.id) === 'completed'
  ).length;

  const progressPercentage = (completedCount / ASSESSMENT_COMPONENTS.length) * 100;

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {session.userName.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete your language assessment to determine your readiness level.
        </p>
      </div>

      {/* Consent Check */}
      {!hasConsent && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <CardTitle className="text-warning">Consent Required</CardTitle>
            </div>
            <CardDescription>
              You need to provide consent before starting your assessments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/candidate/consent">
              <Button>Review & Provide Consent</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Progress</CardTitle>
          <CardDescription>
            {completedCount} of {ASSESSMENT_COMPONENTS.length} components completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Components */}
      <div className="grid gap-4 md:grid-cols-2">
        {ASSESSMENT_COMPONENTS.map((component) => {
          const status = getComponentStatus(component.id);
          const attempt = userAttempts.find(a => a.component === component.id);
          const canStart = hasConsent || status !== 'not-started';

          return (
            <Card key={component.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <div>
                      <CardTitle className="text-lg">{component.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {component.description}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    ~{component.estimatedMinutes} minutes
                  </div>
                  
                  <div className="space-x-2">
                    {status === 'completed' && attempt && (
                      <Link to={`/candidate/results/${attempt.id}`}>
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                      </Link>
                    )}
                    
                    {canStart && (
                      <Link to="/candidate/assessments">
                        <Button size="sm" variant={status === 'not-started' ? 'default' : 'secondary'}>
                          {status === 'not-started' ? 'Start' : 
                           status === 'in-progress' ? 'Continue' : 'Retake'}
                        </Button>
                      </Link>
                    )}
                    
                    {!canStart && (
                      <Button size="sm" disabled>
                        Consent Required
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next Steps */}
      {completedCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            {completedCount === ASSESSMENT_COMPONENTS.length ? (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-success mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">All Assessments Complete!</h3>
                  <p className="text-muted-foreground">
                    Your results are being processed. You can view individual component results above.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Continue with the remaining assessment components to get your complete evaluation.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
