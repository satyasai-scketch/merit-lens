import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, FileSpreadsheet, Filter, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const exportTemplates = [
  {
    id: 'candidate-results',
    name: 'Candidate Results Report',
    description: 'Complete assessment results with scores and recommendations',
    formats: ['PDF', 'CSV'],
    icon: FileText
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'KPIs, trends, and distribution analysis',
    formats: ['PDF', 'Excel'],
    icon: FileSpreadsheet
  },
  {
    id: 'intake-summary',
    name: 'Intake Summary',
    description: 'Aggregate statistics and outcomes by intake',
    formats: ['PDF', 'CSV'],
    icon: FileText
  },
  {
    id: 'subskill-heatmap',
    name: 'Subskill Performance Heatmap',
    description: 'Detailed breakdown by subskill and level',
    formats: ['PNG', 'CSV'],
    icon: FileSpreadsheet
  }
];

export default function ExportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedIntake, setSelectedIntake] = useState('all');
  const [includePersonalData, setIncludePersonalData] = useState(false);
  const [includeDemographics, setIncludeDemographics] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!selectedTemplate || !selectedFormat) {
      toast({
        title: "Missing Selection",
        description: "Please select both a report template and format.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock data based on selection
      const exportData = {
        template: selectedTemplate,
        format: selectedFormat,
        dateRange,
        intake: selectedIntake,
        includePersonalData,
        includeDemographics,
        generatedAt: new Date().toISOString(),
        data: getMockExportData(selectedTemplate)
      };

      // Create and download file
      const filename = `${selectedTemplate}-${new Date().toISOString().split('T')[0]}.${selectedFormat.toLowerCase()}`;
      
      if (selectedFormat === 'CSV') {
        const csvContent = convertToCSV(exportData.data);
        downloadFile(csvContent, filename, 'text/csv');
      } else if (selectedFormat === 'JSON') {
        const jsonContent = JSON.stringify(exportData, null, 2);
        downloadFile(jsonContent, filename, 'application/json');
      } else {
        // For PDF, Excel, PNG - simulate with JSON
        const content = `Mock ${selectedFormat} export data:\n\n${JSON.stringify(exportData, null, 2)}`;
        downloadFile(content, filename, 'text/plain');
      }

      toast({
        title: "Export Complete",
        description: `Report exported successfully as ${selectedFormat}.`
      });

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred during export. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getMockExportData = (template: string) => {
    switch (template) {
      case 'candidate-results':
        return [
          { candidateId: 'C001', name: 'Asha Kumar', composite: 68, bucket: 'Counselling', flatScore: 65, aspScore: 72 },
          { candidateId: 'C002', name: 'Ravi Shah', composite: 79, bucket: 'Admit', flatScore: 76, aspScore: 84 }
        ];
      case 'analytics-dashboard':
        return {
          kpis: { invited: 150, started: 132, completed: 108 },
          buckets: { Admit: 52, Counselling: 31, Bridge: 19, Reject: 6 }
        };
      case 'intake-summary':
        return [
          { intake: 'Spring 2025', completed: 108, avgScore: 71.2, admitRate: 48.1 },
          { intake: 'Summer 2025', completed: 0, avgScore: 0, admitRate: 0 }
        ];
      default:
        return { message: 'Export data placeholder' };
    }
  };

  const convertToCSV = (data: any) => {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const rows = data.map(obj => headers.map(header => obj[header]));
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSelectedTemplate = () => {
    return exportTemplates.find(t => t.id === selectedTemplate);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Export</h1>
        <p className="text-muted-foreground">
          Export assessment data and analytics in various formats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Template
              </CardTitle>
              <CardDescription>
                Choose the type of report you want to export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {exportTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setSelectedFormat(''); // Reset format when template changes
                      }}
                      className={`p-4 border rounded-lg text-left transition-all hover:border-primary/50 ${
                        selectedTemplate === template.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                          <div className="flex gap-1 mt-2">
                            {template.formats.map(format => (
                              <Badge key={format} variant="outline" className="text-xs">
                                {format}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Format & Filters */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Export Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSelectedTemplate()?.formats.map(format => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Intake Filter</Label>
                  <Select value={selectedIntake} onValueChange={setSelectedIntake}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Intakes</SelectItem>
                      <SelectItem value="2025-spring">Spring 2025</SelectItem>
                      <SelectItem value="2025-summer">Summer 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="personalData"
                      checked={includePersonalData}
                      onCheckedChange={(checked) => setIncludePersonalData(!!checked)}
                    />
                    <Label htmlFor="personalData" className="text-sm">
                      Include personal identifiable information
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="demographics"
                      checked={includeDemographics}
                      onCheckedChange={(checked) => setIncludeDemographics(!!checked)}
                    />
                    <Label htmlFor="demographics" className="text-sm">
                      Include demographic data
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Export Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplate ? (
                <>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Template</div>
                    <div className="text-sm text-muted-foreground">
                      {getSelectedTemplate()?.name}
                    </div>
                  </div>
                  
                  {selectedFormat && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Format</div>
                      <Badge variant="outline">{selectedFormat}</Badge>
                    </div>
                  )}
                  
                  {selectedIntake !== 'all' && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Intake</div>
                      <div className="text-sm text-muted-foreground">{selectedIntake}</div>
                    </div>
                  )}
                  
                  {(dateRange.start || dateRange.end) && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Date Range</div>
                      <div className="text-sm text-muted-foreground">
                        {dateRange.start || 'Start'} → {dateRange.end || 'End'}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a report template to begin
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleExport}
                disabled={!selectedTemplate || !selectedFormat || isExporting}
                className="w-full gap-2"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Generating Export...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Report
                  </>
                )}
              </Button>
              
              {selectedTemplate && selectedFormat && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Export will be downloaded as {selectedFormat} file
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}