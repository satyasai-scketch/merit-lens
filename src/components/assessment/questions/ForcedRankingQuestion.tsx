import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ForcedRankingQuestionProps {
  options: string[];
  requiredCount?: number;
  value: string[] | null;
  onChange: (value: string[]) => void;
}

export default function ForcedRankingQuestion({ 
  options, 
  requiredCount = options.length, 
  value, 
  onChange 
}: ForcedRankingQuestionProps) {
  const [available, setAvailable] = useState<string[]>([]);
  const [ranked, setRanked] = useState<string[]>(value || []);

  useEffect(() => {
    if (value) {
      setRanked(value);
      setAvailable(options.filter(opt => !value.includes(opt)));
    } else {
      setAvailable([...options]);
      setRanked([]);
    }
  }, [options, value]);

  useEffect(() => {
    onChange(ranked);
  }, [ranked, onChange]);

  const moveToRank = (option: string, position: number) => {
    if (ranked.length >= requiredCount && !ranked.includes(option)) return;
    
    const newRanked = [...ranked];
    const newAvailable = [...available];

    // Remove from current position
    const rankedIndex = newRanked.indexOf(option);
    const availableIndex = newAvailable.indexOf(option);
    
    if (rankedIndex >= 0) {
      newRanked.splice(rankedIndex, 1);
    } else if (availableIndex >= 0) {
      newAvailable.splice(availableIndex, 1);
    }

    // Insert at new position
    if (position === -1) {
      // Move to available
      newAvailable.push(option);
    } else {
      // Move to rank position
      newRanked.splice(position, 0, option);
    }

    setRanked(newRanked);
    setAvailable(newAvailable);
  };

  const clearAll = () => {
    setAvailable([...options]);
    setRanked([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Drag items to rank them in order of importance (1 = highest priority).
          Required: {requiredCount} items.
        </p>
        <Button size="sm" variant="outline" onClick={clearAll}>
          <RotateCcw className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Available Items */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Available Options</h4>
            <Badge variant="outline">{available.length} remaining</Badge>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {available.length === 0 ? (
              <div className="text-center text-muted-foreground italic py-8">
                All items have been ranked
              </div>
            ) : (
              available.map((option) => (
                <Card key={option} className="p-3 cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(requiredCount, 4) }, (_, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant="outline"
                          onClick={() => moveToRank(option, i)}
                          disabled={ranked.length >= requiredCount}
                          className="w-8 h-8"
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>

        {/* Ranked Items */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Ranked Items</h4>
            <Badge variant={ranked.length >= requiredCount ? "default" : "secondary"}>
              {ranked.length} / {requiredCount}
            </Badge>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {Array.from({ length: requiredCount }, (_, index) => {
              const item = ranked[index];
              return (
                <Card
                  key={index}
                  className={cn(
                    "p-3 min-h-[50px] flex items-center",
                    item ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-dashed"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      {item ? (
                        <span className="font-medium">{item}</span>
                      ) : (
                        <span className="text-muted-foreground italic">
                          Click a number on an available item to place it here
                        </span>
                      )}
                    </div>
                    {item && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveToRank(item, -1)}
                      >
                        <ArrowRight className="h-3 w-3 rotate-180" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}