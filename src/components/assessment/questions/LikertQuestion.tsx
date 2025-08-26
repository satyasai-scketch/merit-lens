import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LikertQuestionProps {
  scale: {
    min: number;
    max: number;
    labels: [string, string]; // [left label, right label]
  };
  value: number | null;
  onChange: (value: number) => void;
}

export default function LikertQuestion({ scale, value, onChange }: LikertQuestionProps) {
  const { min, max, labels } = scale;
  const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-6">
      {/* Scale Labels */}
      <div className="flex justify-between text-sm font-medium">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>

      {/* Scale Points */}
      <div className="flex justify-between items-center">
        {points.map((point) => (
          <div key={point} className="flex flex-col items-center space-y-2">
            <Button
              variant={value === point ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-12 h-12 rounded-full transition-all",
                value === point && "ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => onChange(point)}
              aria-label={`Rating ${point} out of ${max}`}
            >
              {point}
            </Button>
            <span className="text-xs text-muted-foreground">{point}</span>
          </div>
        ))}
      </div>

      {/* Value Indicator */}
      {value !== null && (
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            Selected: <strong>{value}</strong> out of {max}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-muted rounded-full">
          {value !== null && (
            <div
              className="h-2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((value - min) / (max - min)) * 100}%` }}
            />
          )}
        </div>
        <div className="flex justify-between mt-1">
          {points.map((point) => (
            <div
              key={point}
              className={cn(
                "w-1 h-4 bg-muted rounded-full",
                value === point && "bg-primary"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}