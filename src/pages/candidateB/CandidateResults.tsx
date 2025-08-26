import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Download, TrendingUp, Target, BookOpen, FileText } from 'lucide-react';
import { loadAttemptResults } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function CandidateResults() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;

    loadAttemptResults(attemptId)
      .then(resultsData => {
        setResults(resultsData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load results:', error);
        // If no specific results file exists, show generic completion message
        setResults(null);
        setLoading(false);
      });
  }, [attemptId]);

  const handleDownloadReport = () => {
    // Simulate PDF download
    const reportData = {
      attemptId,
      timestamp: new Date().toISOString(),
      results: results || { message: 'Assessment completed successfully' }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-report-${attemptId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Your assessment report has been downloaded successfully."
    });
  };

  const getBucketBadge = (bucket: string) => {
    switch (bucket) {
      case 'Admit':
        return <Badge className="bucket-admit">Admit</Badge>;
      case 'Counselling':
        return <Badge className="bucket-counselling">Counselling Required</Badge>;
      case 'Bridge':
        return <Badge className="bucket-bridge">Bridge Program</Badge>;
      case 'Reject':
        return <Badge className="bucket-reject">Not Recommended</Badge>;
      default:
        return <Badge variant="secondary">{bucket}</Badge>;
    }
  };

  const ScoreGauge = ({ score, label }: { score: number; label: string }) => (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-2">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${score * 2.51} 251`}
            className="text-primary"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
        </div>
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!results) {
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
            <h1 className="text-3xl font-bold">Assessment Complete</h1>
            <p className="text-muted-foreground">Your assessment has been submitted successfully</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Assessment Submitted</h3>
            <p className="text-muted-foreground mb-4">
              Thank you for completing your assessment. Your responses have been saved and will be processed shortly.
            </p>
            <Button onClick={handleDownloadReport} className="gap-2">
              <Download className="h-4 w-4" />
              Download Completion Certificate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Assessment Results</h1>
          <p className="text-muted-foreground">
            Completed on {new Date(results.timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Overall Result */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Overall Assessment Result</CardTitle>
              <CardDescription>
                Composite Score: {results.scores.COMPOSITE}/100 (Confidence: {Math.round(results.confidence * 100)}%)
              </CardDescription>
            </div>
            {getBucketBadge(results.bucket)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <ScoreGauge score={results.scores.FLAT} label="Language Aptitude" />
            <ScoreGauge score={results.scores.ASP} label="Aspiration" />
            <ScoreGauge score={results.scores.VAL} label="Values" />
            <ScoreGauge score={results.scores.MS} label="Mindset" />
            <ScoreGauge score={results.scores.COMPOSITE} label="Composite" />
          </div>
        </CardContent>
      </Card>

      {/* Subskill Breakdown */}
      {results.subskillScores && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Language Aptitude Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results.subskillScores).map(([skill, score]: [string, any]) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{skill}</span>
                    <span>{score}/100</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Development Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <Target className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-info">
              <BookOpen className="h-5 w-5" />
              Development Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.developmentAreas.map((area: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-info rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Key Drivers */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Drivers</CardTitle>
          <CardDescription>
            Key factors that influenced your overall assessment result
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {results.drivers.map((driver: string, index: number) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{driver}</span>
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
            Follow these recommendations to proceed with your language learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {results.nextSteps.map((step: string, index: number) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Download Report */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Button onClick={handleDownloadReport} className="gap-2">
              <Download className="h-4 w-4" />
              Download Detailed Report
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Download a comprehensive PDF report of your assessment results
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}