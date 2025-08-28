import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Play, CheckCircle, FileText, BookOpen, TrendingUp, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const assessmentComponents = [
  {
    id: 'flat',
    name: 'Foreign Language Aptitude Test',
    description: 'Evaluates your natural ability to learn new languages through pattern recognition and memory tasks.',
    estimatedMinutes: 35,
    icon: BookOpen,
    color: 'assessment-flat'
  },
  {
    id: 'aspiration',
    name: 'Academic Aspiration Survey',
    description: 'Assesses your motivation, goals, and commitment to language learning.',
    estimatedMinutes: 15,
    icon: Target,
    color: 'assessment-aspiration'
  },
  {
    id: 'values',
    name: 'Personal Values Assessment',
    description: 'Identifies your core values and how they align with academic and cultural goals.',
    estimatedMinutes: 20,
    icon: TrendingUp,
    color: 'assessment-values'
  },
  {
    id: 'mindset',
    name: 'Learning Mindset Inventory',
    description: 'Measures your approach to learning challenges and growth opportunities.',
    estimatedMinutes: 12,
    icon: FileText,
    color: 'assessment-mindset'
  }
];

export default function CandidateDashboard() {
  const { session } = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessmentStatus, setAssessmentStatus] = useState<Record<string, string>>({});
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    // Check consent status
    const consent = localStorage.getItem('assessment_consent');
    setHasConsented(!!consent);

    // Load assessment status from localStorage
    const status: Record<string, string> = {};
    assessmentComponents.forEach(component => {
      const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');
      const componentAttempts = attempts.filter((a: any) => a.componentType === component.id);
      
      if (componentAttempts.length === 0) {
        status[component.id] = 'not-started';
      } else {
        const latest = componentAttempts[componentAttempts.length - 1];
        status[component.id] = latest.status || 'not-started';
      }
    });
    setAssessmentStatus(status);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'submitted':
        return <Badge className="status-completed">Completed</Badge>;
      case 'in-progress':
        return <Badge className="status-in-progress">In Progress</Badge>;
      default:
        return <Badge className="status-not-started">Not Started</Badge>;
    }
  };

  const handleStartAssessment = (componentId: string) => {
    if (!hasConsented) {
      navigate('/candidate/consent');
      return;
    }

    // Create new attempt with more robust ID
    const timestamp = Date.now();
    const attemptId = `attempt_${componentId}_${timestamp}`;
    const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');
    
    attempts.push({
      attemptId,
      componentType: componentId,
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      candidateId: session?.userId,
      tenantId: session?.tenantId
    });

    localStorage.setItem('assessment_attempts', JSON.stringify(attempts));

    navigate(`/candidate/assessments/${attemptId}`);
  };

  const handleContinueAssessment = (componentId: string) => {
    const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');
    const inProgressAttempt = attempts.find((a: any) => 
      a.componentType === componentId && a.status === 'in-progress'
    );

    if (inProgressAttempt) {
      navigate(`/candidate/assessments/${inProgressAttempt.attemptId}`);
    }
  };

  const handleViewResults = (componentId: string) => {
    const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');
    const completedAttempt = attempts.find((a: any) => 
      a.componentType === componentId && (a.status === 'completed' || a.status === 'submitted')
    );

    if (completedAttempt) {
      navigate(`/candidate/results/${completedAttempt.attemptId}`);
    }
  };

  const completedCount = Object.values(assessmentStatus).filter(status => 
    status === 'completed' || status === 'submitted'
  ).length;

  const overallProgress = (completedCount / assessmentComponents.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Assessment Dashboard</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Complete all four assessment components to receive your comprehensive evaluation 
          and admission recommendation.
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed: {completedCount} of {assessmentComponents.length}</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Consent Check */}
      {!hasConsented && (
        <Card className="border-warning bg-warning-lighter">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium">Consent Required</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Please review and accept the assessment consent form before beginning.
                </p>
                <Button 
                  onClick={() => navigate('/candidate/consent')}
                  variant="outline"
                  size="sm"
                >
                  Review Consent Form
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Components */}
      <div className="grid gap-6 md:grid-cols-2">
        {assessmentComponents.map((component) => {
          const Icon = component.icon;
          const status = assessmentStatus[component.id] || 'not-started';
          
          return (
            <Card key={component.id} className={`assessment-card assessment-card-${component.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${component.color}/10`}>
                      <Icon className={`h-5 w-5 text-${component.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{component.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          ~{component.estimatedMinutes} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(status)}
                </div>
                <CardDescription className="mt-2">
                  {component.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {status === 'not-started' && (
                    <Button 
                      onClick={() => handleStartAssessment(component.id)}
                      className="gap-2"
                      disabled={!hasConsented}
                    >
                      <Play className="h-4 w-4" />
                      Start Assessment
                    </Button>
                  )}
                  
                  {status === 'in-progress' && (
                    <Button 
                      onClick={() => handleContinueAssessment(component.id)}
                      className="gap-2"
                    >
                      Continue Assessment
                    </Button>
                  )}
                  
                  {(status === 'completed' || status === 'submitted') && (
                    <Button 
                      onClick={() => handleViewResults(component.id)}
                      variant="outline"
                      className="gap-2"
                    >
                      View Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next Steps */}
      {completedCount === assessmentComponents.length && (
        <Card className="border-success bg-success-lighter">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <h3 className="text-lg font-semibold">All Assessments Complete!</h3>
              <p className="text-muted-foreground">
                Congratulations! You have completed all assessment components. 
                Your comprehensive results and admission recommendation are being processed.
              </p>
              <Button 
                onClick={() => navigate('/candidate/assessments')}
                className="mt-4"
              >
                View All Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}