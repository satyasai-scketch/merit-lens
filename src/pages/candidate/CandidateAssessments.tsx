import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Play, AlertTriangle, Volume2 } from 'lucide-react';
import { consent, attempts, type AttemptData } from '@/lib/session'; // ⬅ keep for now unless moved into context
import { toast } from '@/hooks/use-toastA';
import { useSession } from '@/contexts/SessionContext';

const ASSESSMENT_COMPONENTS = [
  {
    id: 'flat',
    name: 'FLAT (Foreign Language Aptitude Test)',
    description: 'Comprehensive test of phonetic coding, grammar, vocabulary, audio processing, and working memory',
    estimatedMinutes: 25,
    itemCount: 24,
    skills: ['Phonetic Coding', 'Grammar Inference', 'Vocabulary', 'Audio Processing', 'Working Memory'],
    instructions: 'Answer all questions to the best of your ability. Each question is timed individually.',
    order: 1
  },
  {
    id: 'aspiration',
    name: 'Aspiration Assessment',
    description: 'Evaluate your motivation, goals, and commitment to language learning',
    estimatedMinutes: 10,
    itemCount: 12,
    skills: ['Motivation', 'Goal Setting', 'Commitment', 'Cultural Interest'],
    instructions: 'Respond honestly to questions about your language learning goals and motivations.',
    order: 2
  },
  {
    id: 'values',
    name: 'Personal Values Assessment',
    description: 'Understand your personal values and how they align with successful language learning',
    estimatedMinutes: 15,
    itemCount: 16,
    skills: ['Value Priorities', 'Cultural Sensitivity', 'Adaptability', 'Ethics'],
    instructions: 'Consider what is most important to you in various situations.',
    order: 3
  },
  {
    id: 'mindset',
    name: 'Growth Mindset Assessment',
    description: 'Assess your beliefs about learning, intelligence, and personal growth',
    estimatedMinutes: 8,
    itemCount: 10,
    skills: ['Growth Orientation', 'Resilience', 'Learning Beliefs', 'Challenge Response'],
    instructions: 'Reflect on your attitudes toward learning and personal development.',
    order: 4
  }
];

export default function CandidateAssessments() {
  const { session } = useSession();  // ⬅ get session from context
  const [hasConsent, setHasConsent] = useState(false);
  const [userAttempts, setUserAttempts] = useState<AttemptData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;

    const userHasConsent = consent.get(session.userId); // still uses consent lib
    setHasConsent(userHasConsent);
    setUserAttempts(attempts.getAll(session.userId));

    if (!userHasConsent) {
      toast({
        title: "Consent Required",
        description: "Please provide consent before starting assessments.",
        variant: "destructive"
      });
      navigate('/candidate/consent');
    }
  }, [session, navigate]);

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
      'not-started': 'Ready to Start'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || 'Unknown'}
      </Badge>
    );
  };

  const handleStartAssessment = (componentId: string) => {
    if (!session) return;

    const existingAttempt = userAttempts.find(
      a => a.component === componentId && a.status === 'in-progress'
    );

    if (existingAttempt) {
      navigate(`/candidate/assessments/${existingAttempt.id}`);
    } else {
      const newAttempt = attempts.create(session.userId, componentId as any);
      navigate(`/candidate/assessments/${newAttempt.id}`);
    }
  };

  const completedCount = ASSESSMENT_COMPONENTS.filter(
    comp => getComponentStatus(comp.id) === 'completed'
  ).length;

  if (!session || !hasConsent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assessment Components</h1>
        <p className="text-muted-foreground mt-2">
          Complete all four assessment components to receive your readiness evaluation.
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {completedCount} of {ASSESSMENT_COMPONENTS.length} components completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(completedCount / ASSESSMENT_COMPONENTS.length) * 100} className="w-full" />
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-info bg-info/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-info" />
            <CardTitle className="text-info">Assessment Guidelines</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1">
            <li>Complete assessments in a quiet environment without interruptions</li>
            <li>Answer all questions honestly - there are no "right" or "wrong" answers for most items</li>
            <li>Some questions are timed - work efficiently but don't rush</li>
            <li>You can save and resume progress, but avoid leaving assessments incomplete for long periods</li>
            <li>Audio questions require headphones or speakers - test your audio before starting</li>
          </ul>
        </CardContent>
      </Card>

      {/* Assessment Components */}
      <div className="space-y-4">
        {ASSESSMENT_COMPONENTS.map((component) => {
          const status = getComponentStatus(component.id);
          const attempt = userAttempts.find(a => a.component === component.id);
          const hasAudio = component.id === 'flat';

          return (
            <Card key={component.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-xl">{component.name}</CardTitle>
                        {hasAudio && <Volume2 className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <CardDescription className="mb-3">
                        {component.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {component.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {component.instructions}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      ~{component.estimatedMinutes} minutes
                    </div>
                    <div>
                      {component.itemCount} questions
                    </div>
                    {hasAudio && (
                      <div className="flex items-center">
                        <Volume2 className="h-4 w-4 mr-1" />
                        Audio required
                      </div>
                    )}
                  </div>
                  
                  <div className="space-x-2">
                    {status === 'completed' && attempt && (
                      <Link to={`/candidate/results/${attempt.id}`}>
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant={status === 'not-started' ? 'default' : 'secondary'}
                      onClick={() => handleStartAssessment(component.id)}
                    >
                      {status === 'not-started' ? 'Start Assessment' : 
                       status === 'in-progress' ? 'Continue' : 'Retake'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Return to Dashboard */}
      <div className="text-center">
        <Link to="/candidate">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
