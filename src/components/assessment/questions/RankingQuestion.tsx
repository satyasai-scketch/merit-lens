import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankingQuestionProps {
  tokens: string[];
  value: string[] | null;
  onChange: (value: string[]) => void;
}

export default function RankingQuestion({ tokens, value, onChange }: RankingQuestionProps) {
  const [orderedTokens, setOrderedTokens] = useState<string[]>(value || [...tokens]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!value || value.length === 0) {
      setOrderedTokens([...tokens]);
    } else {
      setOrderedTokens(value);
    }
  }, [tokens, value]);

  useEffect(() => {
    onChange(orderedTokens);
  }, [orderedTokens, onChange]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedTokens.length) return;
    
    const newTokens = [...orderedTokens];
    const [movedItem] = newTokens.splice(fromIndex, 1);
    newTokens.splice(toIndex, 0, movedItem);
    setOrderedTokens(newTokens);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveItem(index, index - 1);
        setFocusedIndex(Math.max(0, index - 1));
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveItem(index, index + 1);
        setFocusedIndex(Math.min(orderedTokens.length - 1, index + 1));
        break;
      case 'Home':
        event.preventDefault();
        moveItem(index, 0);
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        moveItem(index, orderedTokens.length - 1);
        setFocusedIndex(orderedTokens.length - 1);
        break;
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Drag items or use keyboard arrows to reorder. Press Home/End to move to first/last position.
      </p>
      <div className="space-y-2">
        {orderedTokens.map((token, index) => (
          <Card
            key={`${token}-${index}`}
            className={cn(
              'p-4 cursor-move border-2 transition-all',
              focusedIndex === index && 'ring-2 ring-primary border-primary'
            )}
            tabIndex={0}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="button"
            aria-label={`Item ${index + 1}: ${token}. Press arrow keys to reorder.`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="font-medium">{token}</span>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => moveItem(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => moveItem(index, index + 1)}
                  disabled={index === orderedTokens.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}