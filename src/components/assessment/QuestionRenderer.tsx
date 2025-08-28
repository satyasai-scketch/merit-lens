import { AssessmentItem } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Question type components
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import RankingQuestion from './questions/RankingQuestion';
import SequenceQuestion from './questions/SequenceQuestion';
import AudioQuestion from './questions/AudioQuestion';
import LikertQuestion from './questions/LikertQuestion';
import ForcedRankingQuestion from './questions/ForcedRankingQuestion';
import DilemmaQuestion from './questions/DilemmaQuestion';
import MatchQuestion from './questions/MatchQuestion';

interface QuestionRendererProps {
  item: AssessmentItem;
  value: any;
  onChange: (value: any) => void;
}

export default function QuestionRenderer({ item, value, onChange }: QuestionRendererProps) {
  // Validate required fields and show graceful error
  const validateItem = (item: AssessmentItem): string | null => {
    switch (item.type) {
      case 'single':
      case 'multi':
        if (!item.options || item.options.length === 0) {
          return 'Options are missing for this question.';
        }
        break;
      case 'ranking':
        if (!item.tokens || item.tokens.length === 0) {
          return 'Tokens are missing for this ranking question.';
        }
        break;
      case 'sequence':
        if (!item.sequence || item.sequence.length === 0) {
          return 'Sequence data is missing for this question.';
        }
        break;
      case 'audio':
        if (!item.audio?.targetUrl || !item.audio?.choices) {
          return 'Audio data is missing for this question.';
        }
        break;
      case 'likert':
        if (!item.scale) {
          return 'Scale configuration is missing for this question.';
        }
        break;
      case 'forced_ranking':
        if (!item.options || item.options.length === 0) {
          return 'Options are missing for this ranking question.';
        }
        break;
      case 'dilemma':
        if (!item.options || item.options.length === 0) {
          return 'Options are missing for this dilemma question.';
        }
        break;
      case 'match':
        if (!item.prompts || !item.targets || item.prompts.length === 0 || item.targets.length === 0) {
          return 'Prompts or targets are missing for this matching question.';
        }
        break;
    }
    return null;
  };

  const validationError = validateItem(item);
  if (validationError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Configuration Error:</strong> {validationError}
          <br />
          <em>You can still skip this question to continue.</em>
        </AlertDescription>
      </Alert>
    );
  }

  // Render question based on type
  switch (item.type) {
    case 'single':
      return (
        <RadioGroup value={value?.toString()} onValueChange={(val) => onChange(parseInt(val))}>
          <div className="space-y-3">
            {item.options!.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      );

    case 'multi':
      return (
        <div className="space-y-3">
          {item.options!.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Checkbox 
                id={`option-${index}`}
                checked={(value || []).includes(index)}
                onCheckedChange={(checked) => {
                  const current = value || [];
                  if (checked) {
                    // Check maxSelect constraint
                    if (item.maxSelect && current.length >= item.maxSelect) return;
                    onChange([...current, index]);
                  } else {
                    onChange(current.filter((i: number) => i !== index));
                  }
                }}
              />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
          {item.minSelect && (!value || value.length < item.minSelect) && (
            <p className="text-xs text-muted-foreground">
              Please select at least {item.minSelect} option{item.minSelect > 1 ? 's' : ''}.
            </p>
          )}
          {item.maxSelect && value && value.length >= item.maxSelect && (
            <p className="text-xs text-muted-foreground">
              Maximum {item.maxSelect} option{item.maxSelect > 1 ? 's' : ''} allowed.
            </p>
          )}
        </div>
      );

    case 'ranking':
      return (
        <RankingQuestion
          tokens={item.tokens!}
          value={value}
          onChange={onChange}
        />
      );

    case 'sequence':
      return (
        <SequenceQuestion
          sequence={item.sequence!}
          allowPartialRecall={item.allowPartialRecall}
          value={value}
          onChange={onChange}
        />
      );

    case 'audio':
      return (
        <AudioQuestion
          audio={item.audio!}
          value={value}
          onChange={onChange}
        />
      );

    case 'likert':
      return (
        <LikertQuestion
          scale={typeof item.scale === 'number' ? { min: 1, max: item.scale, labels: ['Strongly Disagree', 'Strongly Agree'] } : item.scale!}
          value={value}
          onChange={onChange}
        />
      );

    case 'forced_ranking':
      return (
        <ForcedRankingQuestion
          options={item.options!}
          requiredCount={item.requiredCount}
          value={value}
          onChange={onChange}
        />
      );

    case 'dilemma':
      return (
        <DilemmaQuestion
          options={item.options!}
          requireRationale={item.requireRationale}
          value={value}
          onChange={onChange}
        />
      );

    case 'match':
      return (
        <MatchQuestion
          prompts={item.prompts!}
          targets={item.targets!}
          constraints={item.constraints}
          value={value}
          onChange={onChange}
        />
      );

    default:
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Unknown Question Type:</strong> {item.type}
            <br />
            <em>This question type is not supported. You can skip this question to continue.</em>
          </AlertDescription>
        </Alert>
      );
  }
}