import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Database, Users, FileText } from 'lucide-react';
import { consent } from '@/lib/session';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/contexts/SessionContext';

export default function CandidateConsent() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDataProcessing, setAgreedToDataProcessing] = useState(false);
  const [agreedToAssessment, setAgreedToAssessment] = useState(false);
  const navigate = useNavigate();

   const { session, isLoading } = useSession();
  
  const handleSubmitConsent = () => {
    if (!session) return;

    if (!agreedToTerms || !agreedToDataProcessing || !agreedToAssessment) {
      toast({
        title: "All Consents Required",
        description: "Please agree to all consent items to continue",
        variant: "destructive"
      });
      return;
    }

    // Store consent
    consent.set(session.userId, true);
    
    toast({
      title: "Consent Recorded",
      description: "Thank you for providing consent. You can now start your assessments."
    });

    navigate('/candidate');
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  const canSubmit = agreedToTerms && agreedToDataProcessing && agreedToAssessment;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Consent & Privacy</h1>
        <p className="text-muted-foreground mt-2">
          Please review and provide consent for the assessment process and data handling.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Consent Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Terms of Service</CardTitle>
              </div>
              <CardDescription>
                Agreement to the assessment platform terms and conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-32 w-full border rounded p-3">
                <div className="text-sm space-y-2">
                  <p><strong>Assessment Platform Terms</strong></p>
                  <p>By using this assessment platform, you agree to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Provide honest and accurate responses during assessments</li>
                    <li>Complete assessments in a single session without external assistance</li>
                    <li>Use the platform only for authorized assessment purposes</li>
                    <li>Respect the intellectual property of assessment materials</li>
                  </ul>
                  <p>The assessment results will be used solely for educational placement and counselling purposes.</p>
                </div>
              </ScrollArea>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the Terms of Service
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Data Processing Consent</CardTitle>
              </div>
              <CardDescription>
                Permission to collect, process, and store your assessment data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-32 w-full border rounded p-3">
                <div className="text-sm space-y-2">
                  <p><strong>Data Processing Notice (GDPR Compliant)</strong></p>
                  <p>We will collect and process the following data:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Assessment responses and performance metrics</li>
                    <li>Completion timestamps and session duration</li>
                    <li>Technical data for platform improvement</li>
                    <li>Educational background and language goals</li>
                  </ul>
                  <p>Your data will be:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Stored securely and encrypted</li>
                    <li>Shared only with authorized educational staff</li>
                    <li>Retained for the duration of your enrollment</li>
                    <li>Anonymized for research purposes with your separate consent</li>
                  </ul>
                </div>
              </ScrollArea>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="data-processing" 
                  checked={agreedToDataProcessing}
                  onCheckedChange={(checked) => setAgreedToDataProcessing(checked as boolean)}
                />
                <label htmlFor="data-processing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I consent to data processing as described above
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Assessment Consent</CardTitle>
              </div>
              <CardDescription>
                Understanding of the assessment process and result usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-32 w-full border rounded p-3">
                <div className="text-sm space-y-2">
                  <p><strong>Assessment Process Agreement</strong></p>
                  <p>I understand that:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>The assessment consists of 4 components measuring different aspects of language readiness</li>
                    <li>Results will be used for educational placement and counselling recommendations</li>
                    <li>I may receive recommendations for additional preparation or counselling</li>
                    <li>Assessment results are valid for the current academic intake only</li>
                    <li>I have the right to discuss my results with educational counsellors</li>
                    <li>Retests may be available based on institutional policy</li>
                  </ul>
                </div>
              </ScrollArea>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="assessment" 
                  checked={agreedToAssessment}
                  onCheckedChange={(checked) => setAgreedToAssessment(checked as boolean)}
                />
                <label htmlFor="assessment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I understand and consent to the assessment process
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button 
              onClick={handleSubmitConsent}
              disabled={!canSubmit}
              className="flex-1"
            >
              Agree & Continue to Assessments
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/candidate')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Information Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-success" />
                <CardTitle className="text-lg">Your Privacy Rights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Eye className="h-4 w-4 mt-0.5 text-info" />
                <div>
                  <p className="font-medium">Right to Access</p>
                  <p className="text-muted-foreground">View your data anytime</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Database className="h-4 w-4 mt-0.5 text-info" />
                <div>
                  <p className="font-medium">Right to Portability</p>
                  <p className="text-muted-foreground">Export your assessment data</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Users className="h-4 w-4 mt-0.5 text-info" />
                <div>
                  <p className="font-medium">Right to Withdraw</p>
                  <p className="text-muted-foreground">Withdraw consent anytime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Questions?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground mb-3">
                If you have questions about the consent process or data handling, please contact:
              </p>
              <div className="space-y-2">
                <p><strong>Data Protection Officer</strong></p>
                <p className="text-muted-foreground">privacy@assessment-portal.edu</p>
                <p className="text-muted-foreground">Support available 9 AM - 5 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}