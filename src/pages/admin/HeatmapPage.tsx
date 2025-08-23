import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, Filter } from 'lucide-react';
import { loadHeatmap } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function HeatmapPage() {
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIntake, setSelectedIntake] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadHeatmap()
      .then(data => {
        setHeatmapData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load heatmap:', error);
        setLoading(false);
      });
  }, []);

  const getHeatmapColor = (value: number) => {
    if (value >= 75) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 45) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getHeatmapIntensity = (value: number) => {
    const intensity = Math.min(100, Math.max(20, value));
    if (value >= 75) return `bg-green-500 opacity-${Math.floor(intensity / 10) * 10}`;
    if (value >= 60) return `bg-yellow-500 opacity-${Math.floor(intensity / 10) * 10}`;
    if (value >= 45) return `bg-orange-500 opacity-${Math.floor(intensity / 10) * 10}`;
    return `bg-red-500 opacity-${Math.floor(intensity / 10) * 10}`;
  };

  const handleExport = (format: 'csv' | 'png') => {
    if (!heatmapData) return;

    if (format === 'csv') {
      // Create CSV data
      const headers = ['Subskill', ...heatmapData.levels];
      const rows = heatmapData.subskills.map((subskill: string, index: number) => 
        [subskill, ...heatmapData.matrix[index]]
      );
      
      const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `heatmap-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Simulate PNG export
      toast({
        title: "Export Started",
        description: "PNG export functionality would be implemented with canvas rendering."
      });
    }

    toast({
      title: "Export Complete",
      description: `Heatmap data exported as ${format.toUpperCase()}`
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!heatmapData) {
    return <div>Failed to load heatmap data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subskill Performance Heatmap</h1>
          <p className="text-muted-foreground">
            Average scores by subskill and proficiency level
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport('csv')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('png')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export PNG
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Intake Period</label>
              <Select value={selectedIntake} onValueChange={setSelectedIntake}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intakes</SelectItem>
                  <SelectItem value="2025-spring">Spring 2025</SelectItem>
                  <SelectItem value="2025-summer">Summer 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>FLAT Subskill Performance</CardTitle>
              <CardDescription>
                Based on {heatmapData.candidateCount} candidates • 
                Last updated: {new Date(heatmapData.lastUpdated).toLocaleDateString()}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span>Low</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-red-500 opacity-30 rounded"></div>
                  <div className="w-4 h-4 bg-orange-500 opacity-50 rounded"></div>
                  <div className="w-4 h-4 bg-yellow-500 opacity-70 rounded"></div>
                  <div className="w-4 h-4 bg-green-500 opacity-90 rounded"></div>
                </div>
                <span>High</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4 font-medium">Subskill</th>
                  {heatmapData.levels.map((level: string) => (
                    <th key={level} className="text-center p-4 font-medium min-w-24">
                      {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.subskills.map((subskill: string, rowIndex: number) => (
                  <tr key={subskill} className="border-t">
                    <td className="p-4 font-medium">{subskill}</td>
                    {heatmapData.matrix[rowIndex].map((value: number, colIndex: number) => (
                      <td key={colIndex} className="p-2">
                        <div className="relative">
                          <div 
                            className={`w-full h-12 rounded-lg flex items-center justify-center text-white font-medium transition-all hover:scale-105 cursor-pointer ${getHeatmapColor(value)}`}
                            style={{ opacity: Math.max(0.3, value / 100) }}
                            title={`${subskill} - ${heatmapData.levels[colIndex]}: ${value}%`}
                          >
                            {value}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strongest Subskill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">Audio Processing</div>
              <div className="text-sm text-muted-foreground">
                Average score: 74.2 across all levels
              </div>
              <Badge className="status-completed">Excellent</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">Grammar (B2)</div>
              <div className="text-sm text-muted-foreground">
                Score: 42 - significantly below target
              </div>
              <Badge className="bucket-bridge">Improvement Needed</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Level Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">A1 → A2</div>
              <div className="text-sm text-muted-foreground">
                Strongest progression path observed
              </div>
              <Badge className="status-in-progress">Trending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}