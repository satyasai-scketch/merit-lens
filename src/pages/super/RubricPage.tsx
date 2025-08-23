import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Calculator, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const defaultRubric = {
  componentWeights: {
    FLAT: 40,
    ASP: 20,
    VAL: 20,
    MS: 20
  },
  thresholds: {
    admit: 70,
    counselling: 55,
    bridge: 40
    // reject is < bridge
  },
  subskillWeights: {
    phonetic: 20,
    grammar: 25,
    vocab: 25,
    audio: 20,
    memory: 10
  }
};

const sampleCandidates = [
  { name: 'Sample A', scores: { FLAT: 75, ASP: 80, VAL: 65, MS: 85 } },
  { name: 'Sample B', scores: { FLAT: 62, ASP: 70, VAL: 75, MS: 60 } },
  { name: 'Sample C', scores: { FLAT: 45, ASP: 55, VAL: 50, MS: 40 } }
];

export default function RubricPage() {
  const [rubric, setRubric] = useState(defaultRubric);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const updateComponentWeight = (component: string, weight: number) => {
    setRubric(prev => ({
      ...prev,
      componentWeights: {
        ...prev.componentWeights,
        [component]: weight
      }
    }));
    setHasChanges(true);
  };

  const updateThreshold = (threshold: string, value: number) => {
    setRubric(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [threshold]: value
      }
    }));
    setHasChanges(true);
  };

  const updateSubskillWeight = (subskill: string, weight: number) => {
    setRubric(prev => ({
      ...prev,
      subskillWeights: {
        ...prev.subskillWeights,
        [subskill]: weight
      }
    }));
    setHasChanges(true);
  };

  const calculateComposite = (scores: any) => {
    const { FLAT, ASP, VAL, MS } = scores;
    const { componentWeights } = rubric;
    
    const composite = (
      (FLAT * componentWeights.FLAT) +
      (ASP * componentWeights.ASP) +
      (VAL * componentWeights.VAL) +
      (MS * componentWeights.MS)
    ) / 100;
    
    return Math.round(composite);
  };

  const getBucket = (composite: number) => {
    if (composite >= rubric.thresholds.admit) return 'Admit';
    if (composite >= rubric.thresholds.counselling) return 'Counselling';
    if (composite >= rubric.thresholds.bridge) return 'Bridge';
    return 'Reject';
  };

  const getBucketBadge = (bucket: string) => {
    switch (bucket) {
      case 'Admit':
        return <Badge className="bucket-admit">Admit</Badge>;
      case 'Counselling':
        return <Badge className="bucket-counselling">Counselling</Badge>;
      case 'Bridge':
        return <Badge className="bucket-bridge">Bridge</Badge>;
      case 'Reject':
        return <Badge className="bucket-reject">Reject</Badge>;
      default:
        return <Badge variant="secondary">{bucket}</Badge>;
    }
  };

  const handleSave = () => {
    // In real app, this would save to backend
    localStorage.setItem('assessment_rubric', JSON.stringify(rubric));
    setHasChanges(false);
    toast({
      title: "Rubric Saved",
      description: "Scoring rubric configuration has been saved successfully."
    });
  };

  const handleReset = () => {
    setRubric(defaultRubric);
    setHasChanges(true);
    toast({
      title: "Rubric Reset",
      description: "Rubric has been reset to default values."
    });
  };

  const totalComponentWeight = Object.values(rubric.componentWeights).reduce((sum, weight) => sum + weight, 0);
  const totalSubskillWeight = Object.values(rubric.subskillWeights).reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scoring Rubric Configuration</h1>
          <p className="text-muted-foreground">
            Configure component weights and decision thresholds for assessment scoring
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Weights */}
        <Card>
          <CardHeader>
            <CardTitle>Component Weights</CardTitle>
            <CardDescription>
              Relative importance of each assessment component in final scoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(rubric.componentWeights).map(([component, weight]) => (
              <div key={component} className="space-y-2">
                <div className="flex justify-between">
                  <Label>{component} ({component === 'FLAT' ? 'Language Aptitude' : component === 'ASP' ? 'Aspiration' : component === 'VAL' ? 'Values' : 'Mindset'})</Label>
                  <span className="text-sm font-mono">{weight}%</span>
                </div>
                <Slider
                  value={[weight]}
                  onValueChange={(values) => updateComponentWeight(component, values[0])}
                  max={60}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Total Weight:</span>
                <span className={`font-mono ${totalComponentWeight !== 100 ? 'text-destructive' : 'text-success'}`}>
                  {totalComponentWeight}%
                </span>
              </div>
              {totalComponentWeight !== 100 && (
                <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                  <AlertTriangle className="h-4 w-4" />
                  Weights must sum to 100%
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Decision Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle>Decision Thresholds</CardTitle>
            <CardDescription>
              Composite score cutoffs for admission recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Admit Threshold</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[rubric.thresholds.admit]}
                    onValueChange={(values) => updateThreshold('admit', values[0])}
                    max={100}
                    min={50}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12">{rubric.thresholds.admit}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Counselling Threshold</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[rubric.thresholds.counselling]}
                    onValueChange={(values) => updateThreshold('counselling', values[0])}
                    max={rubric.thresholds.admit - 1}
                    min={30}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12">{rubric.thresholds.counselling}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bridge Program Threshold</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[rubric.thresholds.bridge]}
                    onValueChange={(values) => updateThreshold('bridge', values[0])}
                    max={rubric.thresholds.counselling - 1}
                    min={20}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12">{rubric.thresholds.bridge}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Admit:</span>
                  <span className="font-mono">≥ {rubric.thresholds.admit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Counselling:</span>
                  <span className="font-mono">{rubric.thresholds.counselling} - {rubric.thresholds.admit - 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bridge:</span>
                  <span className="font-mono">{rubric.thresholds.bridge} - {rubric.thresholds.counselling - 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reject:</span>
                  <span className="font-mono">&lt; {rubric.thresholds.bridge}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FLAT Subskill Weights */}
      <Card>
        <CardHeader>
          <CardTitle>FLAT Subskill Weights</CardTitle>
          <CardDescription>
            Weight distribution for language aptitude subskills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {Object.entries(rubric.subskillWeights).map(([subskill, weight]) => (
              <div key={subskill} className="space-y-2">
                <div className="text-center">
                  <Label className="capitalize">{subskill}</Label>
                  <div className="text-sm font-mono">{weight}%</div>
                </div>
                <Slider
                  value={[weight]}
                  onValueChange={(values) => updateSubskillWeight(subskill, values[0])}
                  max={40}
                  min={5}
                  step={5}
                  orientation="vertical"
                  className="h-24 mx-auto"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t text-center">
            <span className={`text-sm font-mono ${totalSubskillWeight !== 100 ? 'text-destructive' : 'text-success'}`}>
              Total: {totalSubskillWeight}%
            </span>
            {totalSubskillWeight !== 100 && (
              <div className="flex items-center justify-center gap-2 text-destructive text-sm mt-1">
                <AlertTriangle className="h-4 w-4" />
                Subskill weights must sum to 100%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            See how current rubric settings affect sample candidate outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleCandidates.map((candidate, index) => {
              const composite = calculateComposite(candidate.scores);
              const bucket = getBucket(composite);
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-sm text-muted-foreground">
                      FLAT: {candidate.scores.FLAT} | ASP: {candidate.scores.ASP} | VAL: {candidate.scores.VAL} | MS: {candidate.scores.MS}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-mono">{composite}</div>
                    {getBucketBadge(bucket)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}