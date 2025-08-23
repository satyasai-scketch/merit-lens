import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RefreshCw, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { loadCandidates } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function RetestsPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [retestModalOpen, setRetestModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [retestReason, setRetestReason] = useState('');
  const [retestType, setRetestType] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadCandidates()
      .then(data => {
        setCandidates(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load candidates:', error);
        setLoading(false);
      });
  }, []);

  const getEligibilityBadge = (eligible: boolean) => {
    return eligible 
      ? <Badge className="status-in-progress">Eligible</Badge>
      : <Badge className="status-not-started">Not Eligible</Badge>;
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

  const handleScheduleRetest = () => {
    if (!selectedCandidate || !retestReason || !retestType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Add retest record (in real app, this would be an API call)
    const retestRecord = {
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.name,
      originalAttemptDate: selectedCandidate.lastAttemptDate,
      reason: retestReason,
      type: retestType,
      scheduledDate: new Date().toISOString(),
      status: 'scheduled'
    };

    // Update candidate eligibility
    setCandidates(prev => prev.map(candidate => 
      candidate.id === selectedCandidate.id 
        ? { ...candidate, eligibleRetest: false, retestScheduled: true }
        : candidate
    ));

    setRetestModalOpen(false);
    setRetestReason('');
    setRetestType('');
    setSelectedCandidate(null);

    toast({
      title: "Retest Scheduled",
      description: `Retest has been scheduled for ${selectedCandidate.name}.`
    });
  };

  const handleCompareResults = (candidate: any) => {
    setSelectedCandidate(candidate);
    setCompareModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Retest Management</h1>
        <p className="text-muted-foreground">
          Manage candidate retest requests and compare assessment results
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible for Retest</CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.eligibleRetest).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Candidates meeting retest criteria
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.retestReason).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Retest requests awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Scores</CardTitle>
            <Eye className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.lastComposite < 60).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Candidates below admission threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Retest Status</CardTitle>
          <CardDescription>
            Manage retest eligibility and schedule new assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Last Attempt</TableHead>
                <TableHead>Composite Score</TableHead>
                <TableHead>Recommendation</TableHead>
                <TableHead>Retest Eligible</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">{candidate.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(candidate.lastAttemptDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-lg">{candidate.lastComposite}</div>
                  </TableCell>
                  <TableCell>
                    {getBucketBadge(candidate.bucket)}
                  </TableCell>
                  <TableCell>
                    {getEligibilityBadge(candidate.eligibleRetest)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-32 truncate">
                      {candidate.retestReason || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {candidate.eligibleRetest && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setRetestModalOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Schedule
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCompareResults(candidate)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Compare
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Schedule Retest Modal */}
      <Dialog open={retestModalOpen} onOpenChange={setRetestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Retest</DialogTitle>
            <DialogDescription>
              Schedule a retest for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Retest Type</Label>
              <Select value={retestType} onValueChange={setRetestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select retest type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Assessment</SelectItem>
                  <SelectItem value="flat-only">FLAT Only</SelectItem>
                  <SelectItem value="non-cognitive">Aspiration, Values & Mindset</SelectItem>
                  <SelectItem value="technical-issue">Technical Issue Makeup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Retest</Label>
              <Textarea
                id="reason"
                value={retestReason}
                onChange={(e) => setRetestReason(e.target.value)}
                placeholder="Describe the reason for scheduling this retest..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setRetestModalOpen(false);
                  setRetestReason('');
                  setRetestType('');
                  setSelectedCandidate(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleScheduleRetest} className="flex-1">
                Schedule Retest
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Results Modal */}
      <Dialog open={compareModalOpen} onOpenChange={setCompareModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assessment Comparison</DialogTitle>
            <DialogDescription>
              Compare assessment results for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center text-muted-foreground">
              <p>Comparison feature would display side-by-side results from multiple attempts.</p>
              <p>This would include score differences, timing patterns, and response analysis.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Original Attempt</CardTitle>
                  <CardDescription>
                    {selectedCandidate?.lastAttemptDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Composite Score:</span>
                      <span className="font-mono">{selectedCandidate?.lastComposite}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recommendation:</span>
                      {selectedCandidate && getBucketBadge(selectedCandidate.bucket)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Retest Results</CardTitle>
                  <CardDescription>
                    Not yet available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    No retest data available
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}