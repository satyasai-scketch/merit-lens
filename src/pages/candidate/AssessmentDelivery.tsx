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

    // Load attempt state - check both attempt state and attempts list
    let state = loadAttemptState(attemptId);
    
    if (!state) {
      // Try to find in attempts list and create state if found
      const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');
      const attempt = attempts.find((a: any) => a.attemptId === attemptId);
      
      if (attempt) {
        // Create initial attempt state
        state = {
          attemptId: attempt.attemptId,
          componentType: attempt.componentType,
          currentItemIndex: 0,
          responses: {},
          startedAt: attempt.startedAt,
          lastSavedAt: new Date().toISOString(),
          status: 'in-progress'
        };
        saveAttemptState(state);
      }
    }
    
    if (!state) {
      // Show error page instead of toast and redirect
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show error page if assessment attempt not found
  if (!assessment || !attemptState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-4 p-6">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold">Assessment Not Found</h1>
          <p className="text-muted-foreground">
            This assessment attempt could not be found. Please return to the Assessments page to start or continue your assessments.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/candidate/assessments')}
              className="w-full"
            >
              Back to Assessments
            </Button>
            <Button 
              onClick={() => navigate('/candidate')}
              variant="outline"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
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

              {currentItem.type === 'ranking' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Drag items to reorder them, or use the buttons to move items up/down:</p>
                  <div className="space-y-2">
                    {(responses[currentItem.id]?.value || currentItem.options || currentItem.tokens || []).map((item: string, index: number) => (
                      <div key={item} className="flex items-center gap-3 p-3 border rounded-lg">
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="flex-1">{item}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const currentList = responses[currentItem.id]?.value || currentItem.options || currentItem.tokens || [];
                              if (index > 0) {
                                const newList = [...currentList];
                                [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
                                handleResponse(currentItem.id, { type: 'ranking', value: newList });
                              }
                            }}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const currentList = responses[currentItem.id]?.value || currentItem.options || currentItem.tokens || [];
                              if (index < currentList.length - 1) {
                                const newList = [...currentList];
                                [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
                                handleResponse(currentItem.id, { type: 'ranking', value: newList });
                              }
                            }}
                            disabled={index === (responses[currentItem.id]?.value || currentItem.options || currentItem.tokens || []).length - 1}
                          >
                            ↓
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentItem.type === 'sequence' && (
                <div className="space-y-4">
                  {!responses[currentItem.id] ? (
                    <div className="text-center space-y-4">
                      <div className="p-6 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground mb-4">Memorize this sequence:</p>
                        <div className="flex justify-center gap-2 mb-4">
                          {currentItem.sequence?.map((item: string, index: number) => (
                            <span key={index} className="px-3 py-2 bg-primary/10 rounded-lg font-mono text-lg">
                              {item}
                            </span>
                          ))}
                        </div>
                        <Button
                          onClick={() => {
                            handleResponse(currentItem.id, { type: 'sequence', phase: 'input', value: [] });
                          }}
                        >
                          I'm Ready - Start Input
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Enter the sequence in the correct order:</p>
                      <div className="flex justify-center gap-2 mb-4">
                        {(responses[currentItem.id]?.value || []).map((item: string, index: number) => (
                          <span key={index} className="px-3 py-2 bg-primary/10 rounded-lg font-mono text-lg">
                            {item}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {currentItem.sequence?.map((item: string) => (
                          <Button
                            key={item}
                            variant="outline"
                            onClick={() => {
                              const current = responses[currentItem.id]?.value || [];
                              const newValue = [...current, item];
                              handleResponse(currentItem.id, { type: 'sequence', phase: 'input', value: newValue });
                            }}
                            disabled={(responses[currentItem.id]?.value || []).includes(item)}
                          >
                            {item}
                          </Button>
                        ))}
                      </div>
                      {responses[currentItem.id]?.value?.length > 0 && (
                        <div className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleResponse(currentItem.id, { type: 'sequence', phase: 'input', value: [] });
                            }}
                          >
                            Clear & Start Over
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {currentItem.type === 'audio' && (
                <div className="space-y-4">
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">Listen to the target audio:</p>
                    <audio controls className="w-full mb-3">
                      <source src={currentItem.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <p className="text-xs text-muted-foreground">
                      Audio transcription available on request for accessibility.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Select the matching audio:</p>
                    {currentItem.choices?.map((choice: string, index: number) => (
                      <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                        <input
                          type="radio"
                          name={`item-${currentItem.id}`}
                          value={choice}
                          checked={responses[currentItem.id]?.value === choice}
                          onChange={(e) => handleResponse(currentItem.id, { type: 'audio', value: e.target.value })}
                          className="text-primary"
                        />
                        <audio controls className="flex-1">
                          <source src={choice} type="audio/mpeg" />
                          Option {index + 1}
                        </audio>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {currentItem.type === 'dilemma' && (
                <div className="space-y-2">
                  {currentItem.options?.map((option: string, index: number) => (
                    <label key={index} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                      <input
                        type="radio"
                        name={`item-${currentItem.id}`}
                        value={option}
                        checked={responses[currentItem.id]?.value === option}
                        onChange={(e) => handleResponse(currentItem.id, { type: 'dilemma', value: e.target.value })}
                        className="text-primary mt-1"
                      />
                      <span className="flex-1">{option}</span>
                    </label>
                  ))}
                </div>
              )}
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