import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AudioChoice {
  url: string;
  label?: string;
}

interface AudioQuestionProps {
  audio: {
    targetUrl: string;
    choices: string[] | AudioChoice[];
    transcript?: string;
  };
  value: number | null;
  onChange: (value: number) => void;
}

export default function AudioQuestion({ audio, value, onChange }: AudioQuestionProps) {
  const [targetPlaying, setTargetPlaying] = useState(false);
  const [playingChoice, setPlayingChoice] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioErrors, setAudioErrors] = useState<Set<string>>(new Set());
  
  const targetRef = useRef<HTMLAudioElement>(null);
  const choiceRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const handleAudioError = (audioUrl: string) => {
    setAudioErrors(prev => new Set([...prev, audioUrl]));
  };

  const playTargetAudio = () => {
    if (targetRef.current) {
      if (targetPlaying) {
        targetRef.current.pause();
        setTargetPlaying(false);
      } else {
        targetRef.current.play().catch(() => handleAudioError(audio.targetUrl));
        setTargetPlaying(true);
      }
    }
  };

  const playChoiceAudio = (index: number) => {
    const audioRef = choiceRefs.current[index];
    if (audioRef) {
      // Stop any currently playing choice
      choiceRefs.current.forEach((ref, i) => {
        if (ref && i !== index) {
          ref.pause();
        }
      });
      
      if (playingChoice === index) {
        audioRef.pause();
        setPlayingChoice(null);
      } else {
        audioRef.play().catch(() => {
          const choiceUrl = typeof audio.choices[index] === 'string' 
            ? audio.choices[index] as string
            : (audio.choices[index] as AudioChoice).url;
          handleAudioError(choiceUrl);
        });
        setPlayingChoice(index);
      }
    }
  };

  const getChoiceUrl = (choice: string | AudioChoice, index: number): string => {
    return typeof choice === 'string' ? choice : choice.url;
  };

  const getChoiceLabel = (choice: string | AudioChoice, index: number): string => {
    if (typeof choice === 'string') return `Option ${index + 1}`;
    return choice.label || `Option ${index + 1}`;
  };

  return (
    <div className="space-y-6">
      {audioErrors.size > 0 && (
        <Alert>
          <AlertDescription>
            Some audio files failed to load. You can still answer based on available options.
          </AlertDescription>
        </Alert>
      )}

      {/* Target Audio */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Target Audio</h4>
          {audio.transcript && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <FileText className="h-3 w-3 mr-1" />
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            onClick={playTargetAudio}
            disabled={audioErrors.has(audio.targetUrl)}
          >
            {targetPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <Volume2 className="h-4 w-4 ml-2" />
          </Button>
          <Badge variant="outline">Target</Badge>
        </div>

        {showTranscript && audio.transcript && (
          <div className="mt-3 p-3 bg-muted rounded text-sm">
            <strong>Transcript:</strong> {audio.transcript}
          </div>
        )}

        <audio
          ref={targetRef}
          src={audio.targetUrl}
          onEnded={() => setTargetPlaying(false)}
          onError={() => handleAudioError(audio.targetUrl)}
        />
      </Card>

      {/* Choice Options */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Select the audio that best matches the target:
        </p>
        
        <RadioGroup value={value?.toString()} onValueChange={(val) => onChange(parseInt(val))}>
          <div className="space-y-3">
            {audio.choices.map((choice, index) => {
              const choiceUrl = getChoiceUrl(choice, index);
              const choiceLabel = getChoiceLabel(choice, index);
              const hasError = audioErrors.has(choiceUrl);
              
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem 
                        value={index.toString()} 
                        id={`choice-${index}`}
                      />
                      <Label htmlFor={`choice-${index}`} className="font-medium">
                        {choiceLabel}
                      </Label>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playChoiceAudio(index)}
                      disabled={hasError}
                    >
                      {playingChoice === index ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {hasError && (
                    <p className="text-destructive text-xs mt-2">Audio failed to load</p>
                  )}
                  
                  <audio
                    ref={el => choiceRefs.current[index] = el}
                    src={choiceUrl}
                    onEnded={() => setPlayingChoice(null)}
                    onError={() => handleAudioError(choiceUrl)}
                  />
                </Card>
              );
            })}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}