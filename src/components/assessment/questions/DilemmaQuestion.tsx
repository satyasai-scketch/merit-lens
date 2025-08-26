import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface DilemmaValue {
  selectedIndex: number;
  rationale?: string;
}

interface DilemmaQuestionProps {
  options: string[];
  requireRationale?: boolean;
  value: DilemmaValue | null;
  onChange: (value: DilemmaValue) => void;
}

export default function DilemmaQuestion({ 
  options, 
  requireRationale = false, 
  value, 
  onChange 
}: DilemmaQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(value?.selectedIndex ?? null);
  const [rationale, setRationale] = useState(value?.rationale || '');

  useEffect(() => {
    if (selectedIndex !== null) {
      onChange({
        selectedIndex,
        rationale: requireRationale ? rationale : undefined
      });
    }
  }, [selectedIndex, rationale, requireRationale, onChange]);

  return (
    <div className="space-y-6">
      {/* Options */}
      <Card className="p-4">
        <RadioGroup 
          value={selectedIndex?.toString()} 
          onValueChange={(val) => setSelectedIndex(parseInt(val))}
        >
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50">
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`}
                  className="mt-1"
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer leading-relaxed"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </Card>

      {/* Rationale */}
      {requireRationale && (
        <Card className="p-4">
          <div className="space-y-3">
            <Label htmlFor="rationale" className="text-sm font-medium">
              Please explain your reasoning:
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain why you chose this option..."
              className="min-h-[100px]"
              required={requireRationale}
            />
            {requireRationale && rationale.trim().length === 0 && selectedIndex !== null && (
              <p className="text-destructive text-xs">
                A rationale is required for this question.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}