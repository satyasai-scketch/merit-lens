import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText, Database, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConsentPage() {
  const [consents, setConsents] = useState({
    dataProcessing: false,
    academicUse: false,
    storage: false,
    communication: false
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const allConsented = Object.values(consents).every(Boolean);

  const handleConsentChange = (key: keyof typeof consents, checked: boolean) => {
    setConsents(prev => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = () => {
    if (!allConsented) {
      toast({
        title: "Consent Required",
        description: "Please accept all consent items to proceed with assessments.",
        variant: "destructive"
      });
      return;
    }

    // Store consent in localStorage
    const consentRecord = {
      timestamp: new Date().toISOString(),
      consents,
      ipAddress: 'demo-ip', // In real app, would be captured server-side
      userAgent: navigator.userAgent
    };

    localStorage.setItem('assessment_consent', JSON.stringify(consentRecord));

    toast({
      title: "Consent Recorded",
      description: "Thank you for providing consent. You can now proceed with assessments."
    });

    navigate('/candidate');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <Shield className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-3xl font-bold">Assessment Consent</h1>
        <p className="text-muted-foreground">
          Please review and accept the following consent items before proceeding with your assessment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Processing and Privacy Consent</CardTitle>
          <CardDescription>
            We are committed to protecting your privacy and handling your data responsibly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="h-60 w-full border rounded-lg p-4">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold mb-2">Purpose of Data Collection</h3>
                <p>
                  Your assessment data will be used to evaluate your language learning aptitude, 
                  academic aspirations, personal values, and learning mindset for admission purposes 
                  to our language programs.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">Types of Data Collected</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Assessment responses and performance data</li>
                  <li>Timing and interaction patterns</li>
                  <li>Technical metadata (browser, device type)</li>
                  <li>Contact information for result delivery</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2">Data Storage and Security</h3>
                <p>
                  Your data will be stored securely using industry-standard encryption and 
                  access controls. Data will be retained for a maximum of 7 years for 
                  academic record-keeping purposes.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">Your Rights</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Right to access your data</li>
                  <li>Right to request corrections</li>
                  <li>Right to request deletion (subject to academic requirements)</li>
                  <li>Right to withdraw consent (may affect admission eligibility)</li>
                </ul>
              </section>
            </div>
          </ScrollArea>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="dataProcessing"
                checked={consents.dataProcessing}
                onCheckedChange={(checked) => handleConsentChange('dataProcessing', !!checked)}
              />
              <div className="flex-1">
                <label htmlFor="dataProcessing" className="text-sm font-medium cursor-pointer">
                  Data Processing Consent
                </label>
                <p className="text-xs text-muted-foreground">
                  I consent to the processing of my personal data for assessment and admission purposes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="academicUse"
                checked={consents.academicUse}
                onCheckedChange={(checked) => handleConsentChange('academicUse', !!checked)}
              />
              <div className="flex-1">
                <label htmlFor="academicUse" className="text-sm font-medium cursor-pointer">
                  Academic Research Consent
                </label>
                <p className="text-xs text-muted-foreground">
                  I consent to the use of my anonymized assessment data for academic research and program improvement.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="storage"
                checked={consents.storage}
                onCheckedChange={(checked) => handleConsentChange('storage', !!checked)}
              />
              <div className="flex-1">
                <label htmlFor="storage" className="text-sm font-medium cursor-pointer">
                  Data Storage Consent
                </label>
                <p className="text-xs text-muted-foreground">
                  I consent to the secure storage of my assessment data for up to 7 years for academic record-keeping.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="communication"
                checked={consents.communication}
                onCheckedChange={(checked) => handleConsentChange('communication', !!checked)}
              />
              <div className="flex-1">
                <label htmlFor="communication" className="text-sm font-medium cursor-pointer">
                  Communication Consent
                </label>
                <p className="text-xs text-muted-foreground">
                  I consent to receive assessment results and program-related communications via email.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => navigate('/candidate')}
              variant="outline"
              className="flex-1"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!allConsented}
              className="flex-1"
            >
              Accept & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}