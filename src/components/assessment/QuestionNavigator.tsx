import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuestionStatus {
  index: number;
  type: string;
  status: 'not_seen' | 'seen_unanswered' | 'answered' | 'marked';
}

interface QuestionNavigatorProps {
  questions: QuestionStatus[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

const getTypeCode = (type: string): string => {
  const codes: Record<string, string> = {
    single: 'SC',
    multi: 'MC',
    ranking: 'RNK',
    sequence: 'SEQ',
    audio: 'AUD',
    likert: 'LKR',
    forced_ranking: 'FR',
    dilemma: 'DIL',
    match: 'MAT'
  };
  return codes[type] || type.toUpperCase().slice(0, 3);
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'not_seen': return 'bg-muted text-muted-foreground';
    case 'seen_unanswered': return 'bg-warning/20 text-warning-foreground border-warning';
    case 'answered': return 'bg-success/20 text-success-foreground border-success';
    case 'marked': return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/20 dark:text-purple-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function QuestionNavigator({ questions, currentIndex, onNavigate }: QuestionNavigatorProps) {
  return (
    <Card className="w-64 h-fit sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Question Navigator</CardTitle>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-muted"></div>
            <span>Not seen</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-warning/20 border border-warning"></div>
            <span>Visited, unanswered</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-success/20 border border-success"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div>
            <span>Marked for review</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {questions.map((question) => (
          <Button
            key={question.index}
            variant="ghost"
            size="sm"
            className={cn(
              'w-full justify-between h-auto p-2 border',
              getStatusColor(question.status),
              currentIndex === question.index && 'ring-2 ring-primary'
            )}
            onClick={() => onNavigate(question.index)}
          >
            <span className="font-medium">Q{question.index + 1}</span>
            <Badge variant="outline" className="text-xs">
              {getTypeCode(question.type)}
            </Badge>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}