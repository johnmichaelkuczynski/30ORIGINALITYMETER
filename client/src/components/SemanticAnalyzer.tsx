import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PassageData } from "@/lib/types";
import { 
  Analysis160Result, 
  ComparisonResult160, 
  AnalysisFramework, 
  LLMProvider,
  AnalysisRequest,
  ComparisonRequest
} from "@/lib/160-parameter-types";
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
  
  // New 160-parameter analysis system
  type DocumentMode = "single" | "comparison";
  
  const [documentMode, setDocumentMode] = useState<DocumentMode>("single");
  const [analysisFramework, setAnalysisFramework] = useState<AnalysisFramework>("intelligence");
  
  const isSingleMode = documentMode === "single";
  const isComparisonMode = documentMode === "comparison";

  // LLM Provider state
  const [provider, setProvider] = useState<LLMProvider>("openai");
  const [providerStatus, setProviderStatus] = useState<{
    deepseek: boolean;
    openai: boolean;
    anthropic: boolean;
    perplexity: boolean;
  }>({
    deepseek: true,
    openai: true,
    anthropic: false,
    perplexity: false
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
            if (data.openai) {
              setProvider('openai');
            } else if (data.anthropic) {
              setProvider('anthropic');
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
  const [analysisResult, setAnalysisResult] = useState<Analysis160Result | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult160 | null>(null);
  
  // Reset passageB when switching to single mode
  useEffect(() => {
    if (documentMode === "single") {
      setPassageB({
        title: "",
        text: "",
        userContext: ""
      });
      setComparisonResult(null);
    } else {
      setAnalysisResult(null);
    }
  }, [documentMode]);

  // New 160-parameter analysis mutations
  const singleAnalysisMutation = useMutation({
    mutationFn: async (request: AnalysisRequest) => {
      const endpoint = `/api/analyze/${analysisFramework}`;
      return apiRequest(endpoint, {
        method: 'POST',
        body: { text: request.text, provider: request.provider }
      });
    },
    onSuccess: (data: Analysis160Result) => {
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
    mutationFn: async (request: ComparisonRequest) => {
      const endpoint = `/api/compare/${analysisFramework}`;
      return apiRequest(endpoint, {
        method: 'POST',
        body: { textA: request.textA, textB: request.textB, provider: request.provider }
      });
    },
    onSuccess: (data: ComparisonResult160) => {
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

  // Analysis functions for the new 160-parameter system
  const handleAnalysis = () => {
    if (!passageA.text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter text to analyze",
        variant: "destructive"
      });
      return;
    }

    if (isSingleMode) {
      singleAnalysisMutation.mutate({
        text: passageA.text,
        provider
      });
    } else {
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
    }
  };

  // Render functions for displaying results
  const renderParameterScores = (scores: Analysis160Result['scores']) => (
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
              <span className="ml-1">{score.strengths.join(", ")}</span>
            </div>
            <div>
              <span className="font-medium text-red-600">Areas for improvement:</span>
              <span className="ml-1">{score.weaknesses.join(", ")}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Analysis Framework Selection */}
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
              onValueChange={(value: AnalysisFramework) => setAnalysisFramework(value)}
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

          {/* Document Mode Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Analysis Mode</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="comparison-mode"
                  checked={isComparisonMode}
                  onCheckedChange={(checked) => setDocumentMode(checked ? "comparison" : "single")}
                />
                <Label htmlFor="comparison-mode">
                  {isComparisonMode ? "Compare Two Texts" : "Analyze Single Text"}
                </Label>
              </div>
            </div>
          </div>

          {/* LLM Provider Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">AI Provider</Label>
            <RadioGroup 
              value={provider} 
              onValueChange={(value: LLMProvider) => setProvider(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="openai" id="openai" />
                <Label htmlFor="openai" className="flex items-center gap-2">
                  OpenAI GPT-4 
                  <Badge variant={providerStatus.openai ? "default" : "secondary"}>
                    {providerStatus.openai ? "Available" : "Key Missing"}
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="anthropic" id="anthropic" />
                <Label htmlFor="anthropic" className="flex items-center gap-2">
                  Anthropic Claude 
                  <Badge variant={providerStatus.anthropic ? "default" : "secondary"}>
                    {providerStatus.anthropic ? "Available" : "Key Missing"}
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="perplexity" id="perplexity" />
                <Label htmlFor="perplexity" className="flex items-center gap-2">
                  Perplexity AI 
                  <Badge variant={providerStatus.perplexity ? "default" : "secondary"}>
                    {providerStatus.perplexity ? "Available" : "Key Missing"}
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deepseek" id="deepseek" />
                <Label htmlFor="deepseek" className="flex items-center gap-2">
                  DeepSeek 
                  <Badge variant={providerStatus.deepseek ? "default" : "secondary"}>
                    {providerStatus.deepseek ? "Available" : "Key Missing"}
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
          label={isSingleMode ? "Text to Analyze" : "Text A"}
          disabled={singleAnalysisMutation.isPending || comparisonAnalysisMutation.isPending}
        />
        
        {isComparisonMode && (
          <PassageInput
            passage={passageB}
            onChange={setPassageB}
            label="Text B (for comparison)"
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

      {/* Results Section */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{analysisResult.frameworkType.charAt(0).toUpperCase() + analysisResult.frameworkType.slice(1)} Analysis Results</span>
              <Badge variant="outline" className="text-lg">
                {analysisResult.overallScore}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Progress value={analysisResult.overallScore} className="h-3" />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Summary</h3>
                <p className="text-muted-foreground">{analysisResult.summary}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Detailed Parameter Scores</h3>
                <ScrollArea className="h-96">
                  {renderParameterScores(analysisResult.scores)}
                </ScrollArea>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Final Verdict</h3>
                <p className="text-muted-foreground">{analysisResult.verdict}</p>
              </div>
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
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  Text A 
                  <Badge variant="outline">{comparisonResult.textA.overallScore}/100</Badge>
                </h3>
                <Progress value={comparisonResult.textA.overallScore} className="mb-3" />
                <p className="text-sm text-muted-foreground">{comparisonResult.textA.summary}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  Text B 
                  <Badge variant="outline">{comparisonResult.textB.overallScore}/100</Badge>
                </h3>
                <Progress value={comparisonResult.textB.overallScore} className="mb-3" />
                <p className="text-sm text-muted-foreground">{comparisonResult.textB.summary}</p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Comparison Analysis</h3>
              <p className="text-muted-foreground">{comparisonResult.comparison}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat with AI */}
      <ChatWithAI />
    </div>
  );
}