import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Save, ArrowRight, ArrowLeft } from 'lucide-react';
import { loadAssessment, saveAttemptState, loadAttemptState } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function AssessmentDelivery() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [assessment, setAssessment] = useState<any>(null);
  const [attemptState, setAttemptState] = useState<any>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;

    // Load attempt state
    const state = loadAttemptState(attemptId);
    if (!state) {
      toast({
        title: "Assessment Not Found",
        description: "This assessment attempt could not be found.",
        variant: "destructive"
      });
      navigate('/candidate');
      return;
    }

    // Load assessment data
    loadAssessment(state.componentType as 'flat' | 'aspiration' | 'values' | 'mindset')
      .then(assessmentData => {
        setAssessment(assessmentData);
        setAttemptState(state);
        setCurrentItemIndex(state.currentItemIndex || 0);
        setResponses(state.responses || {});
        
        // Set timer for current item
        const currentItem = assessmentData.items[state.currentItemIndex || 0];
        if (currentItem?.timerSec) {
          setTimeRemaining(currentItem.timerSec);
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load assessment:', error);
        toast({
          title: "Error",
          description: "Failed to load assessment data.",
          variant: "destructive"
        });
        navigate('/candidate');
      });
  }, [attemptId, navigate, toast]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Time's up - auto advance
          handleNext(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto-save effect
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (attemptState) {
        saveCurrentState();
      }
    }, 10000); // Auto-save every 10 seconds

    return () => clearInterval(autoSave);
  }, [attemptState, currentItemIndex, responses]);

  const saveCurrentState = () => {
    if (!attemptState) return;
    
    const updatedState = {
      ...attemptState,
      currentItemIndex,
      responses,
      lastSavedAt: new Date().toISOString()
    };
    
    saveAttemptState(updatedState);
    setAttemptState(updatedState);
  };

  const handleResponse = (itemId: string, response: any) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: response
    }));
  };

  const handleNext = (isTimeout = false) => {
    if (!assessment) return;

    // Save current response if timeout and no response given
    const currentItem = assessment.items[currentItemIndex];
    if (isTimeout && !responses[currentItem.id]) {
      setResponses(prev => ({
        ...prev,
        [currentItem.id]: { type: 'timeout', value: null }
      }));
    }

    if (currentItemIndex < assessment.items.length - 1) {
      const nextIndex = currentItemIndex + 1;
      setCurrentItemIndex(nextIndex);
      
      // Set timer for next item
      const nextItem = assessment.items[nextIndex];
      if (nextItem?.timerSec) {
        setTimeRemaining(nextItem.timerSec);
      } else {
        setTimeRemaining(null);
      }
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      const prevIndex = currentItemIndex - 1;
      setCurrentItemIndex(prevIndex);
      
      // Set timer for previous item (reset to full time)
      const prevItem = assessment.items[prevIndex];
      if (prevItem?.timerSec) {
        setTimeRemaining(prevItem.timerSec);
      } else {
        setTimeRemaining(null);
      }
    }
  };

  const handleSubmit = () => {
    if (!attemptState) return;

    // Mark as completed
    const completedState = {
      ...attemptState,
      currentItemIndex,
      responses,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    saveAttemptState(completedState);

    // Update attempts list
    const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');
    const updatedAttempts = attempts.map((a: any) => 
      a.attemptId === attemptId ? { ...a, status: 'completed' } : a
    );
    localStorage.setItem('assessment_attempts', JSON.stringify(updatedAttempts));

    toast({
      title: "Assessment Submitted",
      description: "Your responses have been saved successfully."
    });

    navigate(`/candidate/results/${attemptId}`);
  };

  const handleSaveAndExit = () => {
    saveCurrentState();
    toast({
      title: "Progress Saved",
      description: "Your progress has been saved. You can continue later."
    });
    navigate('/candidate');
  };

  if (loading || !assessment || !attemptState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentItem = assessment.items[currentItemIndex];
  const progress = ((currentItemIndex + 1) / assessment.items.length) * 100;
  const isLastItem = currentItemIndex === assessment.items.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-subtle">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">{assessment.name}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentItemIndex + 1} of {assessment.items.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 ${timeRemaining <= 10 ? 'timer-critical' : timeRemaining <= 30 ? 'timer-warning' : ''}`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSaveAndExit}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save & Exit
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Assessment Content */}
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {currentItem.subskill && (
                  <Badge variant="secondary" className="mr-2">
                    {currentItem.subskill}
                  </Badge>
                )}
                Question {currentItemIndex + 1}
              </CardTitle>
              
              {timeRemaining !== null && timeRemaining <= 30 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {timeRemaining}s remaining
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg leading-relaxed">
              {currentItem.stem}
            </div>

            {/* Render different item types */}
            <div className="space-y-3">
              {currentItem.type === 'single' && (
                <div className="space-y-2">
                  {currentItem.options?.map((option: string, index: number) => (
                    <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                      <input
                        type="radio"
                        name={`item-${currentItem.id}`}
                        value={option}
                        checked={responses[currentItem.id]?.value === option}
                        onChange={(e) => handleResponse(currentItem.id, { type: 'single', value: e.target.value })}
                        className="text-primary"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentItem.type === 'multi' && (
                <div className="space-y-2">
                  {currentItem.options?.map((option: string, index: number) => (
                    <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                      <input
                        type="checkbox"
                        value={option}
                        checked={responses[currentItem.id]?.value?.includes(option) || false}
                        onChange={(e) => {
                          const currentValues = responses[currentItem.id]?.value || [];
                          const newValues = e.target.checked
                            ? [...currentValues, option]
                            : currentValues.filter((v: string) => v !== option);
                          handleResponse(currentItem.id, { type: 'multi', value: newValues });
                        }}
                        className="text-primary"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentItem.type === 'likert' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{currentItem.labels?.[0]}</span>
                    <span>{currentItem.labels?.[currentItem.labels.length - 1]}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    {Array.from({ length: currentItem.scale || 5 }, (_, i) => i + 1).map(value => (
                      <label key={value} className="flex flex-col items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`item-${currentItem.id}`}
                          value={value}
                          checked={responses[currentItem.id]?.value === value}
                          onChange={() => handleResponse(currentItem.id, { type: 'likert', value })}
                          className="text-primary"
                        />
                        <span className="text-sm">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add other item types as needed */}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentItemIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={() => handleNext()}
                disabled={!responses[currentItem.id]}
                className="gap-2"
              >
                {isLastItem ? 'Submit Assessment' : 'Next'}
                {!isLastItem && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}