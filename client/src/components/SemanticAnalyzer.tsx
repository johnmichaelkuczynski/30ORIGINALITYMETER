import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PassageData } from "@/lib/types";
import PassageInput from "./PassageInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ChatWithAI from "@/components/ChatWithAI";

interface SemanticAnalyzerProps {
  onSendToRewriter?: (text: string, title?: string) => void;
  onSendToHomework?: (text: string) => void;
}

export default function SemanticAnalyzer({ onSendToRewriter, onSendToHomework }: SemanticAnalyzerProps) {
  const { toast } = useToast();
  
  // Document mode state - either analyze single text or compare two texts
  const [isTwoPassageMode, setIsTwoPassageMode] = useState(false);
  
  // Analysis framework selection
  const [analysisFramework, setAnalysisFramework] = useState<'intelligence' | 'cogency' | 'originality' | 'quality'>('intelligence');
  
  // AI Provider selection
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'perplexity' | 'deepseek'>('anthropic');
  const [providerStatus, setProviderStatus] = useState<{
    deepseek: boolean;
    openai: boolean;
    anthropic: boolean;
    perplexity: boolean;
  }>({
    deepseek: true,
    openai: true,
    anthropic: true,
    perplexity: true
  });

  // Check API key status
  useEffect(() => {
    const checkProviders = async () => {
      try {
        const response = await fetch('/api/check-providers');
        if (response.ok) {
          const data = await response.json();
          setProviderStatus(data);
          
          // Auto-switch to available provider if current one is not available
          if (!data[provider]) {
            if (data.anthropic) {
              setProvider('anthropic');
            } else if (data.openai) {
              setProvider('openai');
            } else if (data.perplexity) {
              setProvider('perplexity');
            } else if (data.deepseek) {
              setProvider('deepseek');
            }
          }
        }
      } catch (error) {
        console.error('Error checking provider status:', error);
      }
    };

    checkProviders();
  }, [provider]);

  // Passage state
  const [passageA, setPassageA] = useState<PassageData>({
    title: "",
    text: "",
    userContext: ""
  });

  const [passageB, setPassageB] = useState<PassageData>({
    title: "",
    text: "",
    userContext: ""
  });

  // Analysis results state
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  
  // Reset passageB when switching to single mode
  useEffect(() => {
    if (!isTwoPassageMode) {
      setPassageB({
        title: "",
        text: "",
        userContext: ""
      });
      setComparisonResult(null);
    } else {
      setAnalysisResult(null);
    }
  }, [isTwoPassageMode]);

  // Analysis mutations
  const singleAnalysisMutation = useMutation({
    mutationFn: async (request: { text: string; provider: string }) => {
      const endpoint = `/api/analyze/${analysisFramework}`;
      return apiRequest(endpoint, {
        method: 'POST',
        body: { text: request.text, provider: request.provider }
      });
    },
    onSuccess: (data: any) => {
      setAnalysisResult(data);
      toast({
        title: "Analysis Complete",
        description: `${analysisFramework} analysis completed with score: ${data.overallScore}/100`
      });
    },
    onError: (error: Error) => {
      console.error("Single analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const comparisonAnalysisMutation = useMutation({
    mutationFn: async (request: { textA: string; textB: string; provider: string }) => {
      const endpoint = `/api/compare/${analysisFramework}`;
      return apiRequest(endpoint, {
        method: 'POST',
        body: { textA: request.textA, textB: request.textB, provider: request.provider }
      });
    },
    onSuccess: (data: any) => {
      setComparisonResult(data);
      toast({
        title: "Comparison Complete",
        description: `Text A: ${data.textA.overallScore}/100, Text B: ${data.textB.overallScore}/100`
      });
    },
    onError: (error: Error) => {
      console.error("Comparison analysis error:", error);
      toast({
        title: "Comparison Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Analysis function
  const handleAnalysis = () => {
    if (!passageA.text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter text to analyze",
        variant: "destructive"
      });
      return;
    }

    if (isTwoPassageMode) {
      if (!passageB.text.trim()) {
        toast({
          title: "Second Text Required",
          description: "Please enter both texts for comparison",
          variant: "destructive"
        });
        return;
      }
      
      comparisonAnalysisMutation.mutate({
        textA: passageA.text,
        textB: passageB.text,
        provider
      });
    } else {
      singleAnalysisMutation.mutate({
        text: passageA.text,
        provider
      });
    }
  };

  // Render functions for displaying results
  const renderParameterScores = (scores: any[]) => (
    <div className="space-y-4">
      {scores.map((score, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">{score.metric}</h4>
            <Badge variant={score.score >= 80 ? "default" : score.score >= 60 ? "secondary" : "destructive"}>
              {score.score}/100
            </Badge>
          </div>
          <Progress value={score.score} className="mb-3" />
          <p className="text-sm text-muted-foreground mb-2">{score.assessment}</p>
          <div className="flex gap-4 text-xs">
            <div>
              <span className="font-medium text-green-600">Strengths:</span>
              <span className="ml-1">{score.strengths?.join(", ") || "None noted"}</span>
            </div>
            <div>
              <span className="font-medium text-red-600">Areas for improvement:</span>
              <span className="ml-1">{score.weaknesses?.join(", ") || "None noted"}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>160-Parameter Analysis System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Framework Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Analysis Framework</Label>
            <RadioGroup 
              value={analysisFramework} 
              onValueChange={(value: 'intelligence' | 'cogency' | 'originality' | 'quality') => setAnalysisFramework(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intelligence" id="intelligence" />
                <Label htmlFor="intelligence">Intelligence (40 metrics)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cogency" id="cogency" />
                <Label htmlFor="cogency">Cogency (40 metrics)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="originality" id="originality" />
                <Label htmlFor="originality">Originality (40 metrics)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quality" id="quality" />
                <Label htmlFor="quality">Quality (40 metrics)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Analysis Mode Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Analysis Mode</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="two-passage-mode"
                checked={isTwoPassageMode}
                onCheckedChange={setIsTwoPassageMode}
              />
              <Label htmlFor="two-passage-mode">
                {isTwoPassageMode ? "Compare Two Texts" : "Analyze Single Text"}
              </Label>
            </div>
          </div>

          {/* AI Provider Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">AI Provider</Label>
            <RadioGroup 
              value={provider} 
              onValueChange={(value: 'openai' | 'anthropic' | 'perplexity' | 'deepseek') => setProvider(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="openai" id="openai" />
                <Label htmlFor="openai" className="flex items-center gap-2">
                  OpenAI GPT-4 
                  <Badge variant={providerStatus.openai ? "default" : "secondary"}>
                    {providerStatus.openai ? "Available" : "Available"}
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="anthropic" id="anthropic" />
                <Label htmlFor="anthropic" className="flex items-center gap-2">
                  Anthropic Claude 
                  <Badge variant={providerStatus.anthropic ? "default" : "secondary"}>
                    {providerStatus.anthropic ? "Available" : "Available"}
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="perplexity" id="perplexity" />
                <Label htmlFor="perplexity" className="flex items-center gap-2">
                  Perplexity AI 
                  <Badge variant={providerStatus.perplexity ? "default" : "secondary"}>
                    {providerStatus.perplexity ? "Available" : "Available"}
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deepseek" id="deepseek" />
                <Label htmlFor="deepseek" className="flex items-center gap-2">
                  DeepSeek 
                  <Badge variant={providerStatus.deepseek ? "default" : "secondary"}>
                    {providerStatus.deepseek ? "Available" : "Available"}
                  </Badge>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Text Input */}
      <div className="grid gap-6">
        <PassageInput
          passage={passageA}
          onChange={setPassageA}
          label={isTwoPassageMode ? "First Text" : "Passage Text to Analyze"}
          disabled={singleAnalysisMutation.isPending || comparisonAnalysisMutation.isPending}
        />
        
        {isTwoPassageMode && (
          <PassageInput
            passage={passageB}
            onChange={setPassageB}
            label="Second Text (for comparison)"
            disabled={singleAnalysisMutation.isPending || comparisonAnalysisMutation.isPending}
          />
        )}
      </div>

      {/* Analysis Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleAnalysis}
          disabled={singleAnalysisMutation.isPending || comparisonAnalysisMutation.isPending}
          size="lg"
          data-testid="button-analyze"
        >
          {singleAnalysisMutation.isPending || comparisonAnalysisMutation.isPending 
            ? "Analyzing..." 
            : `Analyze ${analysisFramework.charAt(0).toUpperCase() + analysisFramework.slice(1)}`
          }
        </Button>
      </div>

      {/* Single Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{analysisResult.frameworkType?.charAt(0).toUpperCase() + analysisResult.frameworkType?.slice(1)} Analysis Results</span>
              <Badge variant="outline" className="text-lg">
                {analysisResult.overallScore}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">Summary:</p>
              <p className="text-sm">{analysisResult.summary}</p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">Verdict:</p>
              <p className="text-sm">{analysisResult.verdict}</p>
            </div>

            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Parameter Scores</h3>
              <ScrollArea className="h-96">
                {renderParameterScores(analysisResult.scores || [])}
              </ScrollArea>
            </div>

            <div className="flex gap-2">
              {onSendToRewriter && (
                <Button
                  variant="outline"
                  onClick={() => onSendToRewriter(passageA.text, passageA.title)}
                >
                  Send to Rewriter
                </Button>
              )}
              {onSendToHomework && (
                <Button
                  variant="outline"
                  onClick={() => onSendToHomework(passageA.text)}
                >
                  Send to Homework Helper
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {comparisonResult && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                  Text A Analysis
                  <Badge variant="outline">
                    {comparisonResult.textA?.overallScore}/100
                  </Badge>
                </h3>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Summary:</strong> {comparisonResult.textA?.summary}</p>
                  <p className="text-sm"><strong>Verdict:</strong> {comparisonResult.textA?.verdict}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                  Text B Analysis
                  <Badge variant="outline">
                    {comparisonResult.textB?.overallScore}/100
                  </Badge>
                </h3>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Summary:</strong> {comparisonResult.textB?.summary}</p>
                  <p className="text-sm"><strong>Verdict:</strong> {comparisonResult.textB?.verdict}</p>
                </div>
              </div>
            </div>

            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Comparison Analysis</h3>
              <p className="text-sm">{comparisonResult.comparison}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat with AI */}
      <ChatWithAI onSendToInput={() => {}} />
    </div>
  );
}