import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronRight, HelpCircle, FileText, Shield, Clock } from 'lucide-react';

const faqData = [
  {
    category: 'Assessments',
    icon: FileText,
    questions: [
      {
        q: 'How long does each assessment take to complete?',
        a: 'The total assessment time is approximately 80-90 minutes: FLAT (35 min), Aspiration Survey (15 min), Values Assessment (20 min), and Learning Mindset Inventory (12 min). You can take breaks between components.'
      },
      {
        q: 'Can I pause and continue an assessment later?',
        a: 'Yes, you can save your progress and continue later. Use the "Save & Exit" button during any assessment. Your responses are automatically saved every 10 seconds.'
      },
      {
        q: 'What happens if I run out of time on a question?',
        a: 'If the timer expires, the system will automatically move to the next question. Your response will be recorded as "no answer" for that item, but this won\'t disqualify you from the assessment.'
      },
      {
        q: 'Can I go back to previous questions?',
        a: 'Within the same assessment component, you can navigate to previous questions using the "Previous" button. However, once you submit a component, you cannot return to it.'
      },
      {
        q: 'What if I experience technical issues during the assessment?',
        a: 'If you encounter technical problems, contact your institute administrator immediately. Your progress is automatically saved, and you may be eligible for a retest if technical issues significantly impacted your assessment.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    icon: Shield,
    questions: [
      {
        q: 'How is my personal data protected?',
        a: 'We use industry-standard encryption and security measures to protect your data. All assessment responses are stored securely and only accessible to authorized personnel at your institute.'
      },
      {
        q: 'Who can see my assessment results?',
        a: 'Your results are only visible to you and authorized administrators at your chosen institute. We do not share individual results with third parties without your explicit consent.'
      },
      {
        q: 'How long is my data stored?',
        a: 'Assessment data is retained for up to 7 years for academic record-keeping purposes. You have the right to request access, correction, or deletion of your data (subject to academic requirements).'
      },
      {
        q: 'Can I withdraw my consent?',
        a: 'Yes, you can withdraw your consent at any time. However, this may affect your eligibility for admission or program participation. Contact your institute administrator to discuss your options.'
      }
    ]
  },
  {
    category: 'Results & Scoring',
    icon: HelpCircle,
    questions: [
      {
        q: 'How are my scores calculated?',
        a: 'Your composite score is calculated using weighted averages of four components: Language Aptitude (FLAT), Academic Aspiration, Personal Values, and Learning Mindset. Each component contributes differently to your final score.'
      },
      {
        q: 'What do the recommendation categories mean?',
        a: 'Admit: You meet all requirements for direct admission. Counselling: Additional discussion recommended. Bridge: Preparatory program suggested. These recommendations help determine the best learning path for you.'
      },
      {
        q: 'When will I receive my results?',
        a: 'Results are typically available immediately after completing all four assessment components. You will receive an email notification when your comprehensive report is ready.'
      },
      {
        q: 'Can I request a retest?',
        a: 'Retests may be available in specific circumstances such as technical issues or significant life events that affected your performance. Contact your institute administrator to discuss eligibility.'
      },
      {
        q: 'How do I interpret my subskill scores?',
        a: 'Subskill scores show your performance in specific areas like phonetic sensitivity, grammar inference, vocabulary retention, audio processing, and working memory. These help identify your strengths and areas for development.'
      }
    ]
  },
  {
    category: 'Technical Support',
    icon: Clock,
    questions: [
      {
        q: 'What browser should I use?',
        a: 'We recommend using the latest version of Chrome, Firefox, Safari, or Edge. Ensure JavaScript is enabled and cookies are allowed for the best experience.'
      },
      {
        q: 'Do I need any special software?',
        a: 'No additional software is required. The assessment runs entirely in your web browser. For audio components, ensure your speakers or headphones are working properly.'
      },
      {
        q: 'What should I do if the page won\'t load?',
        a: 'Try refreshing the page, clearing your browser cache, or using a different browser. If problems persist, check your internet connection and contact technical support.'
      },
      {
        q: 'Can I use a mobile device?',
        a: 'While the assessment is mobile-responsive, we strongly recommend using a desktop or laptop computer for the best experience, especially for the language aptitude test components.'
      }
    ]
  }
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>(['Assessments']);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about the assessment portal, 
          privacy policies, and technical support.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Categories */}
      <div className="space-y-4">
        {filteredFAQ.map((category) => {
          const Icon = category.icon;
          const isOpen = openCategories.includes(category.category);
          
          return (
            <Card key={category.category}>
              <Collapsible 
                open={isOpen} 
                onOpenChange={() => toggleCategory(category.category)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">{category.category}</CardTitle>
                        <Badge variant="secondary">{category.questions.length}</Badge>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {category.questions.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="font-medium text-foreground">{item.q}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.a}
                        </p>
                        {index < category.questions.length - 1 && (
                          <hr className="my-4 border-border" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {filteredFAQ.length === 0 && searchTerm && (
        <Card>
          <CardContent className="pt-6 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try different keywords or browse our categories above.
            </p>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Contact your institute administrator for additional support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Technical Issues</h4>
                <p className="text-sm text-muted-foreground">
                  For browser problems, login issues, or assessment errors
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Assessment Questions</h4>
                <p className="text-sm text-muted-foreground">
                  For questions about scores, retests, or results interpretation
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This help center covers general questions about the assessment platform. 
                For program-specific questions, admission requirements, or administrative matters, 
                please contact your institute directly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}