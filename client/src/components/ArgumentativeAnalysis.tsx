import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PassageData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Gavel, Target, CheckCircle, TrendingUp, FileText, Award, Download, Mail, MessageCircle, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ArgumentativeResult {
  singlePaperAnalysis?: {
    overallCogencyScore: number;
    cogencyLabel: string;
    proofQuality: {
      provesWhatItSetsOut: number;
      worthinessOfGoal: number;
      nonTrivialityLevel: number;
      proofStrength: number;
      functionalWritingQuality: number;
    };
    detailedAssessment: {
      thesisClarity: string;
      evidenceQuality: string;
      logicalStructure: string;
      counterargumentHandling: string;
      significanceOfContribution: string;
    };
    overallJudgment: string;
  };
  comparativeAnalysis?: {
    winner: 'A' | 'B' | 'Tie';
    winnerScore: number;
    paperAScore: number;
    paperBScore: number;
    comparisonBreakdown: {
      paperA: {
        provesWhatItSetsOut: number;
        worthinessOfGoal: number;
        nonTrivialityLevel: number;
        proofStrength: number;
        functionalWritingQuality: number;
      };
      paperB: {
        provesWhatItSetsOut: number;
        worthinessOfGoal: number;
        nonTrivialityLevel: number;
        proofStrength: number;
        functionalWritingQuality: number;
      };
    };
    detailedComparison: string;
    reasoning: string;
  };
  reportContent: string;
}

interface ArgumentativeAnalysisProps {
  passageA: PassageData;
  passageB?: PassageData;
  passageATitle: string;
  passageBTitle?: string;
  isSingleMode: boolean;
}

export default function ArgumentativeAnalysis({
  passageA,
  passageB,
  passageATitle,
  passageBTitle,
  isSingleMode
}: ArgumentativeAnalysisProps) {
  const [result, setResult] = useState<ArgumentativeResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant'; content: string}>>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { toast } = useToast();

  const runArgumentativeAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze/argumentative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passageA,
          passageB: isSingleMode ? null : passageB,
          isSingleMode,
          passageATitle,
          passageBTitle
        }),
      });

      if (!response.ok) {
        throw new Error('Argumentative analysis failed');
      }

      const data = await response.json();
      setResult(data);
      
      toast({
        title: 'Analysis Complete',
        description: isSingleMode 
          ? 'Cogency analysis finished successfully.' 
          : 'Comparative argumentative analysis completed.',
      });
    } catch (error) {
      console.error('Error in argumentative analysis:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to complete argumentative analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    if (!result) return;
    
    try {
      const response = await fetch('/api/download-argumentative-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result,
          passageATitle,
          passageBTitle,
          isSingleMode
        }),
      });

      if (!response.ok) {
        throw new Error('Report download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = isSingleMode 
        ? `cogency-analysis-${passageATitle || 'document'}.pdf`
        : `argumentative-comparison-${passageATitle || 'A'}-vs-${passageBTitle || 'B'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Report Downloaded',
        description: 'Argumentative analysis report has been saved to your device.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Unable to download report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const emailReport = async () => {
    if (!result || !emailAddress) return;
    
    try {
      const response = await fetch('/api/email-argumentative-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result,
          emailAddress,
          passageATitle,
          passageBTitle,
          isSingleMode
        }),
      });

      if (!response.ok) {
        throw new Error('Email sending failed');
      }

      toast({
        title: 'Report Emailed',
        description: `Argumentative analysis report sent to ${emailAddress}`,
      });
      setEmailAddress('');
    } catch (error) {
      toast({
        title: 'Email Failed',
        description: 'Unable to send report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-blue-100 text-blue-800';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const ScoreBar = ({ score, max = 10, color = 'bg-blue-500' }: { score: number; max?: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${(score / max) * 100}%` }}
      ></div>
    </div>
  );

  if (!result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            {isSingleMode ? 'Cogency Analysis' : 'Which One Makes Its Case Better?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {isSingleMode 
                ? 'Analyze how well this paper proves what it sets out to prove, evaluating thesis strength, evidence quality, and argumentative cogency.'
                : 'Compare two papers to determine which makes its case better through comprehensive evaluation of proof quality, thesis strength, and argumentative effectiveness.'
              }
            </p>
            <Button 
              onClick={runArgumentativeAnalysis}
              disabled={isAnalyzing}
              className="gap-2"
            >
              <Gavel className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : isSingleMode ? 'Analyze Cogency' : 'Compare Arguments'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSingleMode && result.singlePaperAnalysis) {
    const analysis = result.singlePaperAnalysis;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Cogency Analysis: {passageATitle || 'Document'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="report">Full Report</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="text-center py-6">
                  <div className={`text-4xl font-bold ${getScoreColor(analysis.overallCogencyScore)}`}>
                    {analysis.overallCogencyScore}/10
                  </div>
                  <Badge className={`${getScoreBadgeColor(analysis.overallCogencyScore)} text-lg px-4 py-1 mt-2`}>
                    {analysis.cogencyLabel}
                  </Badge>
                  <p className="text-gray-600 mt-4 text-sm">Overall Cogency Score</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Overall Judgment</h3>
                  <p className="text-sm leading-relaxed">{analysis.overallJudgment}</p>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Proof Quality Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Proves What It Sets Out</span>
                          <span className={`font-semibold ${getScoreColor(analysis.proofQuality.provesWhatItSetsOut)}`}>
                            {analysis.proofQuality.provesWhatItSetsOut}/10
                          </span>
                        </div>
                        <ScoreBar score={analysis.proofQuality.provesWhatItSetsOut} color="bg-green-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Worthiness of Goal</span>
                          <span className={`font-semibold ${getScoreColor(analysis.proofQuality.worthinessOfGoal)}`}>
                            {analysis.proofQuality.worthinessOfGoal}/10
                          </span>
                        </div>
                        <ScoreBar score={analysis.proofQuality.worthinessOfGoal} color="bg-blue-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Non-triviality Level</span>
                          <span className={`font-semibold ${getScoreColor(analysis.proofQuality.nonTrivialityLevel)}`}>
                            {analysis.proofQuality.nonTrivialityLevel}/10
                          </span>
                        </div>
                        <ScoreBar score={analysis.proofQuality.nonTrivialityLevel} color="bg-purple-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Proof Strength</span>
                          <span className={`font-semibold ${getScoreColor(analysis.proofQuality.proofStrength)}`}>
                            {analysis.proofQuality.proofStrength}/10
                          </span>
                        </div>
                        <ScoreBar score={analysis.proofQuality.proofStrength} color="bg-orange-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Writing Quality</span>
                          <span className={`font-semibold ${getScoreColor(analysis.proofQuality.functionalWritingQuality)}`}>
                            {analysis.proofQuality.functionalWritingQuality}/10
                          </span>
                        </div>
                        <ScoreBar score={analysis.proofQuality.functionalWritingQuality} color="bg-indigo-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="assessment" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detailed Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Thesis Clarity</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {analysis.detailedAssessment.thesisClarity}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Evidence Quality</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {analysis.detailedAssessment.evidenceQuality}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Logical Structure</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {analysis.detailedAssessment.logicalStructure}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Counterargument Handling</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {analysis.detailedAssessment.counterargumentHandling}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Significance of Contribution</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {analysis.detailedAssessment.significanceOfContribution}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="report" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Analysis Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: result.reportContent }} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <Button onClick={downloadReport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
              
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                />
                <Button 
                  onClick={emailReport} 
                  disabled={!emailAddress}
                  variant="outline" 
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
              
              <Button 
                onClick={runArgumentativeAnalysis}
                disabled={isAnalyzing}
                variant="outline"
                className="gap-2"
              >
                <Gavel className="h-4 w-4" />
                Reanalyze
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSingleMode && result.comparativeAnalysis) {
    const comparison = result.comparativeAnalysis;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Which One Makes Its Case Better?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="winner" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="winner">Winner</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                <TabsTrigger value="report">Full Report</TabsTrigger>
              </TabsList>

              <TabsContent value="winner" className="space-y-4">
                <div className="text-center py-6">
                  <div className="text-2xl font-bold mb-4">
                    {comparison.winner === 'Tie' ? 'No Clear Winner' : 
                     comparison.winner === 'A' ? `${passageATitle || 'Paper A'} Wins` : 
                     `${passageBTitle || 'Paper B'} Wins`}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className={`p-4 rounded-lg border-2 ${comparison.winner === 'A' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <div className="font-medium">{passageATitle || 'Paper A'}</div>
                      <div className={`text-2xl font-bold ${getScoreColor(comparison.paperAScore)}`}>
                        {comparison.paperAScore}/10
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border-2 ${comparison.winner === 'B' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <div className="font-medium">{passageBTitle || 'Paper B'}</div>
                      <div className={`text-2xl font-bold ${getScoreColor(comparison.paperBScore)}`}>
                        {comparison.paperBScore}/10
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Reasoning</h3>
                  <p className="text-sm leading-relaxed">{comparison.reasoning}</p>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{comparison.detailedComparison}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{passageATitle || 'Paper A'} Scores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Proves What It Sets Out</span>
                          <span className={`font-semibold ${getScoreColor(comparison.comparisonBreakdown.paperA.provesWhatItSetsOut)}`}>
                            {comparison.comparisonBreakdown.paperA.provesWhatItSetsOut}/10
                          </span>
                        </div>
                        <ScoreBar score={comparison.comparisonBreakdown.paperA.provesWhatItSetsOut} color="bg-green-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Worthiness of Goal</span>
                          <span className={`font-semibold ${getScoreColor(comparison.comparisonBreakdown.paperA.worthinessOfGoal)}`}>
                            {comparison.comparisonBreakdown.paperA.worthinessOfGoal}/10
                          </span>
                        </div>
                        <ScoreBar score={comparison.comparisonBreakdown.paperA.worthinessOfGoal} color="bg-blue-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Non-triviality</span>
                          <span className={`font-semibold ${getScoreColor(comparison.comparisonBreakdown.paperA.nonTrivialityLevel)}`}>
                            {comparison.comparisonBreakdown.paperA.nonTrivialityLevel}/10
                          </span>
                        </div>
                        <ScoreBar score={comparison.comparisonBreakdown.paperA.nonTrivialityLevel} color="bg-purple-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Proof Strength</span>
                          <span className={`font-semibold ${getScoreColor(comparison.comparisonBreakdown.paperA.proofStrength)}`}>
                            {comparison.comparisonBreakdown.paperA.proofStrength}/10
                          </span>
                        </div>
                        <ScoreBar score={comparison.comparisonBreakdown.paperA.proofStrength} color="bg-orange-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Writing Quality</span>
                          <span className={`font-semibold ${getScoreColor(comparison.comparisonBreakdown.paperA.functionalWritingQuality)}`}>
                            {comparison.comparisonBreakdown.paperA.functionalWritingQuality}/10
                          </span>
                        </div>
                        <ScoreBar score={comparison.comparisonBreakdown.paperA.functionalWritingQuality} color="bg-indigo-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{passageBTitle || 'Paper B'} Scores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Proves What It Sets Out</span>
                          <span className={`font-semibold ${getScoreColor(comparison.comparisonBreakdown.paperB.provesWhatItSetsOut)}`}>
                            {comparison.comparisonBreakdown.paperB.provesWhatItSetsOut}/10
                          </span>
                        </div>
                        <ScoreBar score={comparison.comparisonBreakdown.paperB.provesWhatItSetsOut} color="bg-green-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Worthiness of Goal</span>
                          <span className={`font-semibold ${getScoreColor(comparison.comparisonBreakdown.paperB.worthinessOfGoal)}`}>
                            {comparison.comparisonBreakdown.paperB.worthinessOfGoal}/10
                          </span>
                        </div>
                        <ScoreBar score={comparison.comparisonBreakdown.paperB.worthinessOfGoal} color="bg-blue-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Non-triviality</span>
                          <span className={`font-semibold ${getScoreColor(comparison.comparisonBreakdown.paperB.nonTrivialityLevel)}`}>
                            {comparison.comparisonBreakdown.paperB.nonTrivialityLevel}/10
                          </span>
                        </div>
                        <ScoreBar score={comparison.comparisonBreakdown.paperB.nonTrivialityLevel} color="bg-purple-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Proof Strength</span>
                          <span className={`font-semibold ${getScoreColor(comparison.comparisonBreakdown.paperB.proofStrength)}`}>
                            {comparison.comparisonBreakdown.paperB.proofStrength}/10
                          </span>
                        </div>
                        <ScoreBar score={comparison.comparisonBreakdown.paperB.proofStrength} color="bg-orange-500" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Writing Quality</span>
                          <span className={`font-semibold ${getScoreColor(comparison.comparisonBreakdown.paperB.functionalWritingQuality)}`}>
                            {comparison.comparisonBreakdown.paperB.functionalWritingQuality}/10
                          </span>
                        </div>
                        <ScoreBar score={comparison.comparisonBreakdown.paperB.functionalWritingQuality} color="bg-indigo-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="report" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Comparison Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: result.reportContent }} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <Button onClick={downloadReport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
              
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                />
                <Button 
                  onClick={emailReport} 
                  disabled={!emailAddress}
                  variant="outline" 
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
              
              <Button 
                onClick={runArgumentativeAnalysis}
                disabled={isAnalyzing}
                variant="outline"
                className="gap-2"
              >
                <Gavel className="h-4 w-4" />
                Reanalyze
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}