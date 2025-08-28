import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/uiA/card';
import { Button } from '@/components/uiA/button';
import { Progress } from '@/components/uiA/progress';
import { Badge } from '@/components/uiA/badge';
import { Switch } from '@/components/uiA/switch';
import { Label } from '@/components/uiA/label';
import { RadioGroup, RadioGroupItem } from '@/components/uiA/radio-group';
import { Checkbox } from '@/components/uiA/checkbox';
import { 
  Clock, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Home,
  BookOpen,
  Play
} from 'lucide-react';
import { session, attempts, type AttemptData } from '@/lib/session';
import { api, type AssessmentItem } from '../../lib/api';
import { toast } from '@/hooks/use-toast';
import QuestionNavigator, { type QuestionStatus } from '@/components/assessment/QuestionNavigator';
import QuestionRenderer from '@/components/assessment/QuestionRenderer';

export default function AssessmentDelivery() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [questionStatuses, setQuestionStatuses] = useState<Map<number, string>>(new Map());

  // Load attempt and assessment data
  useEffect(() => {
    if (!attemptId) return;

    const loadData = async () => {
      try {
        const attemptData = attempts.get(attemptId);
        if (!attemptData) {
          toast({
            title: "Attempt Not Found",
            description: "The assessment attempt could not be found.",
            variant: "destructive"
          });
          navigate('/candidate/assessments');
          return;
        }

        setAttempt(attemptData);

        // Load assessment items
        const assessmentData = await api.loadAssessments(attemptData.component);
        setItems(assessmentData.items);

        // Find current position
        const lastResponseIndex = attemptData.responses.length > 0 
          ? Math.max(...attemptData.responses.map((_, idx) => idx))
          : 0;
        setCurrentItemIndex(Math.min(lastResponseIndex, assessmentData.items.length - 1));

        // Load existing answer for current item
        const existingResponse = attemptData.responses[currentItemIndex];
        if (existingResponse) {
          setCurrentAnswer(existingResponse.answer);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading assessment:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load assessment data.",
          variant: "destructive"
        });
        navigate('/candidate/assessments');
      }
    };

    loadData();
  }, [attemptId, navigate]);

  // Timer logic
  useEffect(() => {
    const currentItem = items[currentItemIndex];
    if (!currentItem?.timerSec) return;

    setTimeRemaining(currentItem.timerSec);

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Auto-advance on timeout
          handleNextItem();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentItemIndex, items]);

  // Auto-save responses
  const saveResponse = useCallback((answer: any, timeSpent: number) => {
    if (!attempt || !items[currentItemIndex]) return;

    const updatedAttempt = { ...attempt };
    const response = {
      itemId: items[currentItemIndex].id,
      answer,
      timeSpent,
      timestamp: new Date().toISOString()
    };

    // Update or add response
    if (updatedAttempt.responses[currentItemIndex]) {
      updatedAttempt.responses[currentItemIndex] = response;
    } else {
      updatedAttempt.responses[currentItemIndex] = response;
    }

    updatedAttempt.lastSavedAt = new Date().toISOString();
    attempts.save(updatedAttempt);
    setAttempt(updatedAttempt);
  }, [attempt, items, currentItemIndex]);

  const handleNextItem = () => {
    if (currentAnswer !== null) {
      const currentItem = items[currentItemIndex];
      const timeSpent = currentItem?.timerSec ? currentItem.timerSec - (timeRemaining || 0) : 0;
      saveResponse(currentAnswer, timeSpent);
    }

    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setCurrentAnswer(null);
    } else {
      handleSubmitAssessment();
    }
  };

  const handlePreviousItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      // Load previous answer
      const prevResponse = attempt?.responses[currentItemIndex - 1];
      setCurrentAnswer(prevResponse?.answer || null);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!attempt) return;

    setIsSubmitting(true);
    try {
      // Save final response if there is one
      if (currentAnswer !== null) {
        const currentItem = items[currentItemIndex];
        const timeSpent = currentItem?.timerSec ? currentItem.timerSec - (timeRemaining || 0) : 0;
        saveResponse(currentAnswer, timeSpent);
      }

      // Submit to API (simulated)
      await api.submitAssessment(attempt.id, attempt.responses);

      // Mark as completed
      const completedAttempt = {
        ...attempt,
        status: 'completed' as const,
        lastSavedAt: new Date().toISOString()
      };
      attempts.save(completedAttempt);

      toast({
        title: "Assessment Submitted",
        description: "Your assessment has been submitted successfully. Results are being processed."
      });

      navigate(`/candidate/results/${attempt.id}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndExit = () => {
    if (currentAnswer !== null) {
      const currentItem = items[currentItemIndex];
      const timeSpent = currentItem?.timerSec ? currentItem.timerSec - (timeRemaining || 0) : 0;
      saveResponse(currentAnswer, timeSpent);
    }

    toast({
      title: "Progress Saved",
      description: "Your progress has been saved. You can continue later."
    });

    navigate('/candidate/assessments');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!attempt || !items.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span>Assessment Not Available</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The assessment could not be loaded. Please try again.
            </p>
            <Button onClick={() => navigate('/candidate/assessments')}>
              <Home className="h-4 w-4 mr-2" />
              Return to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentItem = items[currentItemIndex];
  const progress = ((currentItemIndex + 1) / items.length) * 100;
  const isLastItem = currentItemIndex === items.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Assessment Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {attempt.component.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Question {currentItemIndex + 1} of {items.length}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {timeRemaining !== null && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className={`text-sm font-mono ${timeRemaining <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveAndExit}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save & Exit
              </Button>
            </div>
          </div>

          <Progress value={progress} className="mt-4" />
        </div>
      </header>

      {/* Assessment Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-6">
          {/* Left Navigation */}
          <div className="w-64 flex-shrink-0">
            <QuestionNavigator
              questions={items.map((item, index) => ({
                id: item.id,
                type: item.type,
                number: index + 1,
                index: index,
                status: markedForReview.has(index) 
                  ? 'marked' 
                  : attempt?.responses[index]?.answer !== undefined 
                    ? 'answered' 
                    : index <= currentItemIndex 
                      ? 'seen_unanswered' 
                      : 'not_seen'
              }))}
              currentIndex={currentItemIndex}
              onNavigate={(index) => {
                // Save current answer before navigating
                if (currentAnswer !== null) {
                  const currentItem = items[currentItemIndex];
                  const timeSpent = currentItem?.timerSec ? currentItem.timerSec - (timeRemaining || 0) : 0;
                  saveResponse(currentAnswer, timeSpent);
                }
                
                setCurrentItemIndex(index);
                // Load answer for the target question
                const targetResponse = attempt?.responses[index];
                setCurrentAnswer(targetResponse?.answer || null);
              }}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card className="min-h-[400px]">
              <CardContent className="p-8">
                {/* Question Content */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">
                        {currentItem.type.toUpperCase()}
                      </Badge>
                      <h2 className="text-xl font-semibold">
                        {currentItem.stem}
                      </h2>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mark-review"
                        checked={markedForReview.has(currentItemIndex)}
                        onCheckedChange={(checked) => {
                          const newMarked = new Set(markedForReview);
                          if (checked) {
                            newMarked.add(currentItemIndex);
                          } else {
                            newMarked.delete(currentItemIndex);
                          }
                          setMarkedForReview(newMarked);
                        }}
                      />
                      <Label htmlFor="mark-review" className="text-sm">
                        Mark for Review
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Question Renderer */}
                <div className="mb-8">
                  <QuestionRenderer
                    item={currentItem}
                    value={currentAnswer}
                    onChange={setCurrentAnswer}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline"
                onClick={handlePreviousItem}
                disabled={currentItemIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Skip logic - go to next without saving answer
                    if (currentItemIndex < items.length - 1) {
                      setCurrentItemIndex(prev => prev + 1);
                      setCurrentAnswer(null);
                    } else {
                      handleSubmitAssessment();
                    }
                  }}
                >
                  Skip
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => {
                    // Mark for review and go to next
                    const newMarked = new Set(markedForReview);
                    newMarked.add(currentItemIndex);
                    setMarkedForReview(newMarked);
                    
                    // Save current answer if exists
                    if (currentAnswer !== null) {
                      const currentItem = items[currentItemIndex];
                      const timeSpent = currentItem?.timerSec ? currentItem.timerSec - (timeRemaining || 0) : 0;
                      saveResponse(currentAnswer, timeSpent);
                    }
                    
                    if (currentItemIndex < items.length - 1) {
                      setCurrentItemIndex(prev => prev + 1);
                      setCurrentAnswer(null);
                    } else {
                      handleSubmitAssessment();
                    }
                  }}
                >
                  Mark for Review & Next
                </Button>

                <Button 
                  onClick={isLastItem ? handleSubmitAssessment : handleNextItem}
                  disabled={currentAnswer === null || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : isLastItem ? 'Submit Assessment' : 'Next'}
                  {!isLastItem && <ChevronRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}