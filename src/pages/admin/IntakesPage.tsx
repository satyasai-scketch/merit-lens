import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, ExternalLink, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockIntakes = [
  {
    id: 'intake-2025-spring',
    name: 'Spring 2025 German A1-B2',
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    targetLevels: ['A1', 'A2', 'B1', 'B2'],
    status: 'active',
    invited: 150,
    completed: 108
  },
  {
    id: 'intake-2025-summer',
    name: 'Summer 2025 Intensive',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    targetLevels: ['B1', 'B2'],
    status: 'planned',
    invited: 0,
    completed: 0
  }
];

export default function IntakesPage() {
  const [intakes, setIntakes] = useState(mockIntakes);
  const [selectedIntake, setSelectedIntake] = useState<any>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newIntake, setNewIntake] = useState({
    name: '',
    startDate: '',
    endDate: '',
    targetLevels: [] as string[]
  });
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="status-in-progress">Active</Badge>;
      case 'planned':
        return <Badge className="status-not-started">Planned</Badge>;
      case 'completed':
        return <Badge className="status-completed">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCreateIntake = () => {
    if (!newIntake.name || !newIntake.startDate || !newIntake.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const intake = {
      id: `intake-${Date.now()}`,
      ...newIntake,
      status: 'planned',
      invited: 0,
      completed: 0
    };

    setIntakes(prev => [...prev, intake]);
    setNewIntake({ name: '', startDate: '', endDate: '', targetLevels: [] });
    setCreateModalOpen(false);

    toast({
      title: "Intake Created",
      description: `${intake.name} has been created successfully.`
    });
  };

  const generateInviteLink = (intakeId: string) => {
    return `${window.location.origin}/assessment/invite/${intakeId}`;
  };

  const copyInviteLink = (intakeId: string) => {
    const link = generateInviteLink(intakeId);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Invite link has been copied to clipboard."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intake Management</h1>
          <p className="text-muted-foreground">
            Manage assessment intakes and candidate invitations
          </p>
        </div>
        
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Intake
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Intake</DialogTitle>
              <DialogDescription>
                Set up a new assessment intake period for candidates.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Intake Name</Label>
                <Input
                  id="name"
                  value={newIntake.name}
                  onChange={(e) => setNewIntake(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Spring 2025 German A1-B2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newIntake.startDate}
                    onChange={(e) => setNewIntake(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newIntake.endDate}
                    onChange={(e) => setNewIntake(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Target Levels</Label>
                <div className="flex gap-2">
                  {['A1', 'A2', 'B1', 'B2'].map(level => (
                    <Button
                      key={level}
                      variant={newIntake.targetLevels.includes(level) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setNewIntake(prev => ({
                          ...prev,
                          targetLevels: prev.targetLevels.includes(level)
                            ? prev.targetLevels.filter(l => l !== level)
                            : [...prev.targetLevels, level]
                        }));
                      }}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateIntake} className="flex-1">
                  Create Intake
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Intakes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Intakes</CardTitle>
          <CardDescription>
            Manage and monitor your assessment intake periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intake Name</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Target Levels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {intakes.map((intake) => (
                <TableRow key={intake.id}>
                  <TableCell className="font-medium">{intake.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(intake.startDate).toLocaleDateString()} - {new Date(intake.endDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {intake.targetLevels.map(level => (
                        <Badge key={level} variant="outline" className="text-xs">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(intake.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {intake.completed}/{intake.invited} completed
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyInviteLink(intake.id)}
                        className="gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Copy Link
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setSelectedIntake(intake)}
                        className="gap-1"
                      >
                        <Settings className="h-3 w-3" />
                        Settings
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Intake Details Modal */}
      {selectedIntake && (
        <Dialog open={!!selectedIntake} onOpenChange={() => setSelectedIntake(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedIntake.name}</DialogTitle>
              <DialogDescription>
                Intake configuration and settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedIntake.invited}</div>
                      <div className="text-sm text-muted-foreground">Invited</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedIntake.completed}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Invite Link</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={generateInviteLink(selectedIntake.id)}
                      readOnly
                      className="flex-1"
                    />
                    <Button onClick={() => copyInviteLink(selectedIntake.id)}>
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Retest Policy</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    Candidates may request retests within 30 days for technical issues or assessment concerns.
                    Retests are reviewed on a case-by-case basis by institute administrators.
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}