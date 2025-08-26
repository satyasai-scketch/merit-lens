import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SequenceQuestionProps {
  sequence: string[];
  allowPartialRecall?: boolean;
  value: string[] | null;
  onChange: (value: string[]) => void;
}

type Phase = 'show' | 'recall';

export default function SequenceQuestion({ 
  sequence, 
  allowPartialRecall = false, 
  value, 
  onChange 
}: SequenceQuestionProps) {
  const [phase, setPhase] = useState<Phase>('show');
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [recalled, setRecalled] = useState<string[]>(value || []);
  const [availableTokens] = useState([...sequence].sort());

  useEffect(() => {
    if (value) {
      setRecalled(value);
    }
  }, [value]);

  useEffect(() => {
    onChange(recalled);
  }, [recalled, onChange]);

  const startShow = useCallback(() => {
    setPhase('show');
    setCurrentShowIndex(0);
    
    // Show sequence with timing
    const interval = setInterval(() => {
      setCurrentShowIndex(prev => {
        if (prev >= sequence.length - 1) {
          clearInterval(interval);
          setTimeout(() => setPhase('recall'), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sequence]);

  const addToRecall = (token: string) => {
    if (!recalled.includes(token)) {
      setRecalled(prev => [...prev, token]);
    }
  };

  const removeFromRecall = (index: number) => {
    setRecalled(prev => prev.filter((_, i) => i !== index));
  };

  const clearRecall = () => {
    setRecalled([]);
  };

  const resetSequence = () => {
    setRecalled([]);
    startShow();
  };

  // Auto-start on mount
  useEffect(() => {
    const cleanup = startShow();
    return cleanup;
  }, [startShow]);

  if (phase === 'show') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Memorize this sequence. It will be shown once.
          </p>
          <div className="flex justify-center space-x-2">
            {sequence.map((token, index) => (
              <Card
                key={index}
                className={cn(
                  'p-4 min-w-[60px] text-center transition-all duration-300',
                  index <= currentShowIndex 
                    ? 'bg-primary text-primary-foreground scale-110' 
                    : 'bg-muted opacity-50'
                )}
              >
                <span className="font-mono text-lg">
                  {index <= currentShowIndex ? token : '?'}
                </span>
              </Card>
            ))}
          </div>
          <Badge variant="outline" className="mt-4">
            {currentShowIndex + 1} / {sequence.length}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Recreate the sequence by clicking tokens below.
        </p>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={resetSequence}>
            <Play className="h-3 w-3 mr-1" />
            Show Again
          </Button>
          <Button size="sm" variant="outline" onClick={clearRecall}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Answer Tray */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 min-h-[60px] items-center">
          {recalled.length === 0 ? (
            <span className="text-muted-foreground italic">Click tokens below to build your answer</span>
          ) : (
            recalled.map((token, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                onClick={() => removeFromRecall(index)}
                className="relative"
              >
                <span className="mr-2">{index + 1}.</span>
                {token}
                <Trash2 className="h-3 w-3 ml-2" />
              </Button>
            ))
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Progress: {recalled.length} / {sequence.length}
          {!allowPartialRecall && recalled.length < sequence.length && (
            <span className="text-warning ml-2">Complete sequence required</span>
          )}
        </div>
      </Card>

      {/* Token Bank */}
      <div>
        <p className="text-sm font-medium mb-2">Available tokens:</p>
        <div className="flex flex-wrap gap-2">
          {availableTokens.map((token, index) => (
            <Button
              key={index}
              variant={recalled.includes(token) ? "secondary" : "outline"}
              size="sm"
              onClick={() => addToRecall(token)}
              disabled={recalled.includes(token)}
            >
              {token}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}