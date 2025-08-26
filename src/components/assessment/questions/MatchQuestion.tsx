import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, Unlink, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchPair {
  promptId: string;
  targetId: string;
}

interface MatchPrompt {
  id: string;
  label: string;
}

interface MatchTarget {
  id: string;
  label: string;
}

interface MatchQuestionProps {
  prompts: MatchPrompt[];
  targets: MatchTarget[];
  constraints?: {
    requiredPairs?: number;
    allowManyToOne?: boolean;
  };
  value: MatchPair[] | null;
  onChange: (value: MatchPair[]) => void;
}

export default function MatchQuestion({ 
  prompts, 
  targets, 
  constraints = {}, 
  value, 
  onChange 
}: MatchQuestionProps) {
  const [pairs, setPairs] = useState<MatchPair[]>(value || []);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [pairingMode, setPairingMode] = useState(false);

  const { requiredPairs = prompts.length, allowManyToOne = false } = constraints;

  useEffect(() => {
    if (value) {
      setPairs(value);
    }
  }, [value]);

  useEffect(() => {
    onChange(pairs);
  }, [pairs, onChange]);

  const createPair = (promptId: string, targetId: string) => {
    // Check if this target is already used (if many-to-one is not allowed)
    if (!allowManyToOne && pairs.some(p => p.targetId === targetId)) {
      return;
    }

    // Remove existing pair for this prompt
    const newPairs = pairs.filter(p => p.promptId !== promptId);
    newPairs.push({ promptId, targetId });
    setPairs(newPairs);
    setSelectedPrompt(null);
    setPairingMode(false);
  };

  const removePair = (promptId: string) => {
    setPairs(pairs.filter(p => p.promptId !== promptId));
  };

  const clearAll = () => {
    setPairs([]);
    setSelectedPrompt(null);
    setPairingMode(false);
  };

  const startPairing = (promptId: string) => {
    setSelectedPrompt(promptId);
    setPairingMode(true);
  };

  const cancelPairing = () => {
    setSelectedPrompt(null);
    setPairingMode(false);
  };

  const getPairForPrompt = (promptId: string) => {
    return pairs.find(p => p.promptId === promptId);
  };

  const getTargetLabel = (targetId: string) => {
    return targets.find(t => t.id === targetId)?.label || targetId;
  };

  const isTargetUsed = (targetId: string) => {
    return pairs.some(p => p.targetId === targetId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Match items from the left column to the right column.
          </p>
          <Badge variant={pairs.length >= requiredPairs ? "default" : "secondary"} className="mt-1">
            {pairs.length} / {requiredPairs} pairs made
          </Badge>
        </div>
        <Button size="sm" variant="outline" onClick={clearAll}>
          <RotateCcw className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>

      {pairingMode && (
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              Pairing mode: Select a target for "<strong>{prompts.find(p => p.id === selectedPrompt)?.label}</strong>"
            </span>
            <Button size="sm" variant="outline" onClick={cancelPairing}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Prompts (Left Column) */}
        <Card className="p-4">
          <h4 className="font-medium mb-3">Items to Match</h4>
          <div className="space-y-2">
            {prompts.map((prompt) => {
              const pair = getPairForPrompt(prompt.id);
              const isSelected = selectedPrompt === prompt.id;
              
              return (
                <Card
                  key={prompt.id}
                  className={cn(
                    "p-3 cursor-pointer transition-all border-2",
                    isSelected && "border-primary bg-primary/5",
                    pair && "bg-success/5 border-success/20"
                  )}
                  onClick={() => pairingMode ? cancelPairing() : startPairing(prompt.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{prompt.label}</span>
                    <div className="flex items-center space-x-2">
                      {pair ? (
                        <>
                          <Badge variant="default" className="text-xs">
                            → {getTargetLabel(pair.targetId)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePair(prompt.id);
                            }}
                          >
                            <Unlink className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                        size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            startPairing(prompt.id);
                          }}
                        >
                          <Link className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Targets (Right Column) */}
        <Card className="p-4">
          <h4 className="font-medium mb-3">Match Options</h4>
          <div className="space-y-2">
            {targets.map((target) => {
              const isUsed = isTargetUsed(target.id);
              const canSelect = pairingMode && (allowManyToOne || !isUsed);
              
              return (
                <Card
                  key={target.id}
                  className={cn(
                    "p-3 transition-all border-2",
                    canSelect && "cursor-pointer hover:border-primary hover:bg-primary/5",
                    isUsed && "bg-success/5 border-success/20",
                    !canSelect && pairingMode && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (canSelect && selectedPrompt) {
                      createPair(selectedPrompt, target.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{target.label}</span>
                    {isUsed && !allowManyToOne && (
                      <Badge variant="default" className="text-xs">
                        Matched
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Pairs Summary */}
      {pairs.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Current Matches</h4>
          <div className="space-y-2">
            {pairs.map((pair, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">
                  <strong>{prompts.find(p => p.id === pair.promptId)?.label}</strong>
                  {' → '}
                  <strong>{getTargetLabel(pair.targetId)}</strong>
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePair(pair.promptId)}
                >
                  <Unlink className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}