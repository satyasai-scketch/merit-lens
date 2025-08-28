import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, FileText } from 'lucide-react';

export default function AssessmentsList() {
  const navigate = useNavigate();

  // Get all attempts from localStorage
  const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');

  const componentMap = {
    flat: 'Foreign Language Aptitude Test',
    aspiration: 'Academic Aspiration Survey', 
    values: 'Personal Values Assessment',
    mindset: 'Learning Mindset Inventory'
  };

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

  const handleViewAttempt = (attemptId: string, status: string) => {
    if (status === 'completed' || status === 'submitted') {
      navigate(`/candidate/results/${attemptId}`);
    } else {
      navigate(`/candidate/assessments/${attemptId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/candidate')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Assessment History</h1>
          <p className="text-muted-foreground">
            View all your assessment attempts and results
          </p>
        </div>
      </div>

      {attempts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Assessments Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't started any assessments. Return to the dashboard to begin.
            </p>
            <Button onClick={() => navigate('/candidate')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt: any) => (
            <Card key={attempt.attemptId} className="hover:shadow-moderate transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {componentMap[attempt.componentType as keyof typeof componentMap] || attempt.componentType}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      Started: {new Date(attempt.startedAt).toLocaleDateString()} at{' '}
                      {new Date(attempt.startedAt).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(attempt.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Attempt ID: {attempt.attemptId}
                  </div>
                  <Button
                    onClick={() => handleViewAttempt(attempt.attemptId, attempt.status)}
                    variant={attempt.status === 'completed' || attempt.status === 'submitted' ? 'outline' : 'default'}
                  >
                    {attempt.status === 'completed' || attempt.status === 'submitted' 
                      ? 'View Results' 
                      : 'Continue Assessment'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}