import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Award,
  BookOpen,
  ArrowLeft,
  Target
} from 'lucide-react';
import { api, type AttemptResult } from '../../lib/api';
import { toast } from '@/hooks/use-toast';

export default function CandidateResults() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [results, setResults] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;

    const loadResults = async () => {
      try {
        const resultData = await api.loadAttemptResults(attemptId);
        setResults(resultData);
      } catch (error) {
        console.error('Error loading results:', error);
        toast({
          title: "Results Not Available",
          description: "Your results are still being processed. Please check back later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [attemptId]);

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case 'Admit': return 'bg-success text-success-foreground';
      case 'Counselling': return 'bg-info text-info-foreground';
      case 'Bridge': return 'bg-warning text-warning-foreground';
      case 'Reject': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getBucketIcon = (bucket: string) => {
    switch (bucket) {
      case 'Admit': return <Award className="h-5 w-5" />;
      case 'Counselling': return <Target className="h-5 w-5" />;
      case 'Bridge': return <BookOpen className="h-5 w-5" />;
      case 'Reject': return <AlertCircle className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  const handleDownloadReport = () => {
    // Simulate report download
    const reportData = {
      candidateId: results?.candidateId,
      attemptId: results?.attemptId,
      scores: results?.scores,
      recommendation: results?.bucket,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-report-${attemptId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Your assessment report has been downloaded."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span>Results Not Available</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your assessment results are still being processed. This usually takes a few minutes.
              Please check back shortly.
            </p>
            <div className="flex space-x-2">
              <Link to="/candidate">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Button onClick={() => window.location.reload()}>
                Refresh Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessment Results</h1>
          <p className="text-muted-foreground mt-2">
            Completed on {new Date(results.completedDate).toLocaleDateString()}
          </p>
        </div>
        <Button onClick={handleDownloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Overall Recommendation */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          {getBucketIcon(results.bucket)}
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Overall Recommendation</CardTitle>
              <CardDescription>
                Based on your performance across all assessment components
              </CardDescription>
            </div>
            <Badge className={`${getBucketColor(results.bucket)} text-lg px-4 py-2`}>
              {getBucketIcon(results.bucket)}
              <span className="ml-2">{results.bucket}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Composite Score</h4>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-primary">
                  {results.scores.COMPOSITE}
                </div>
                <div className="flex-1">
                  <Progress value={results.scores.COMPOSITE} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Out of 100 points
                  </p>
                </div>
              </div>
            </div>
            {results.recommendedLevel && (
              <div>
                <h4 className="font-semibold mb-2">Recommended Level</h4>
                <div className="text-2xl font-semibold text-accent">
                  {results.recommendedLevel}
                </div>
                <p className="text-sm text-muted-foreground">
                  German proficiency level
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Component Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Component Scores</CardTitle>
          <CardDescription>
            Your performance on each assessment component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(results.scores).map(([component, score]) => {
              if (component === 'COMPOSITE') return null;
              
              const componentNames = {
                FLAT: 'Language Aptitude',
                ASP: 'Aspiration',
                VAL: 'Values',
                MS: 'Mindset'
              };

              return (
                <div key={component} className="text-center">
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-primary">{score}</div>
                    <Progress value={score} className="w-full mt-2" />
                  </div>
                  <h4 className="font-medium">{componentNames[component as keyof typeof componentNames]}</h4>
                  <Badge variant="outline" className="mt-1">
                    {component}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subskill Breakdown (if available) */}
      {results.subskillScores && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
            <CardDescription>
              Detailed performance on language skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results.subskillScores).map(([skill, score]) => (
                <div key={skill} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{skill}</span>
                      <span className="text-sm font-semibold">{score}%</span>
                    </div>
                    <Progress value={score} className="w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Drivers */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Drivers</CardTitle>
          <CardDescription>
            Factors that influenced your overall assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {results.drivers.map((driver, index) => (
              <li key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
          <CardDescription>
            Actions to take based on your results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {results.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Assessment Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Duration:</span>
              <div>{results.duration} minutes</div>
            </div>
            <div>
              <span className="font-medium">Confidence:</span>
              <div>{Math.round(results.confidence * 100)}%</div>
            </div>
            <div>
              <span className="font-medium">Attempt ID:</span>
              <div className="font-mono text-xs">{results.attemptId}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Link to="/candidate">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/candidate/assessments">
          <Button variant="outline">
            View All Assessments
          </Button>
        </Link>
      </div>
    </div>
  );
}