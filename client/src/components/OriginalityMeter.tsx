import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PassageData {
  title: string;
  text: string;
  userContext?: string;
}

interface AnalysisResult {
  [key: string]: {
    question: string;
    score: number;
    quotation: string;
    explanation: string;
  };
}

interface ComparisonResult {
  documentA: AnalysisResult;
  documentB: AnalysisResult;
  comparison: string;
}

export default function OriginalityMeter() {
  const { toast } = useToast();
  
  // UI State
  const [mode, setMode] = useState<'intelligence' | 'originality' | 'cogency' | 'overall_quality'>('originality');
  const [analysisMode, setAnalysisMode] = useState<'quick' | 'comprehensive'>('quick');
  const [provider, setProvider] = useState<'anthropic' | 'deepseek' | 'openai' | 'perplexity'>('anthropic');
  const [analysisType, setAnalysisType] = useState<'single' | 'compare'>('single');
  
  // Form Data
  const [passageA, setPassageA] = useState<PassageData>({
    title: '',
    text: '',
    userContext: ''
  });
  
  const [passageB, setPassageB] = useState<PassageData>({
    title: '',
    text: '',
    userContext: ''
  });
  
  // Results
  const [singleResult, setSingleResult] = useState<AnalysisResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  // Single Document Analysis
  const singleAnalysisMutation = useMutation({
    mutationFn: async ({ passage, mode, analysisMode }: {
      passage: PassageData;
      mode: string;
      analysisMode: string;
    }) => {
      const response = await fetch(`/api/analyze/single/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage, analysisMode })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSingleResult(data);
      setComparisonResult(null);
      toast({
        title: "Analysis Complete",
        description: "Your document has been analyzed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Two Document Comparison
  const comparisonAnalysisMutation = useMutation({
    mutationFn: async ({ passageA, passageB, mode, analysisMode }: {
      passageA: PassageData;
      passageB: PassageData;
      mode: string;
      analysisMode: string;
    }) => {
      const response = await fetch(`/api/analyze/compare/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passageA, passageB, analysisMode })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setComparisonResult(data);
      setSingleResult(null);
      toast({
        title: "Comparison Complete",
        description: "Your documents have been compared successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Comparison Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Download Report
  const downloadMutation = useMutation({
    mutationFn: async ({ analysisResult, mode, title }: {
      analysisResult: any;
      mode: string;
      title: string;
    }) => {
      const response = await fetch(`/api/download/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult, passageTitle: title })
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${mode}-analysis-${title.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your analysis report is downloading.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSingleAnalysis = () => {
    if (!passageA.text.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to analyze.",
        variant: "destructive",
      });
      return;
    }

    singleAnalysisMutation.mutate({
      passage: passageA,
      mode,
      analysisMode
    });
  };

  const handleComparisonAnalysis = () => {
    if (!passageA.text.trim() || !passageB.text.trim()) {
      toast({
        title: "Error",
        description: "Please enter text in both passages to compare.",
        variant: "destructive",
      });
      return;
    }

    comparisonAnalysisMutation.mutate({
      passageA,
      passageB,
      mode,
      analysisMode
    });
  };

  const handleDownload = () => {
    const result = analysisType === 'single' ? singleResult : comparisonResult;
    const title = analysisType === 'single' ? 
      (passageA.title || 'Untitled') : 
      `${passageA.title || 'Document-A'}-vs-${passageB.title || 'Document-B'}`;
    
    if (!result) {
      toast({
        title: "Error",
        description: "No analysis results to download.",
        variant: "destructive",
      });
      return;
    }

    downloadMutation.mutate({
      analysisResult: result,
      mode,
      title
    });
  };

  const renderSingleResults = () => {
    if (!singleResult) return null;

    const questions = Object.keys(singleResult);
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {mode.charAt(0).toUpperCase() + mode.slice(1)} Analysis Results
            <Button
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              size="sm"
              variant="outline"
              data-testid="button-download-single"
            >
              {downloadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Report
            </Button>
          </CardTitle>
          <CardDescription>
            Analysis of {passageA.title || 'Untitled Document'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((questionKey) => {
              const result = singleResult[questionKey];
              if (!result) return null;
              
              return (
                <div key={questionKey} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" data-testid={`badge-question-${questionKey}`}>
                      Question {questionKey}
                    </Badge>
                    <Badge 
                      variant={result.score >= 95 ? "default" : result.score >= 80 ? "secondary" : "destructive"}
                      data-testid={`badge-score-${questionKey}`}
                    >
                      {result.score}/100
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-2" data-testid={`text-question-${questionKey}`}>
                    {result.question}
                  </h4>
                  <blockquote className="italic text-muted-foreground mb-2 pl-4 border-l-2" data-testid={`text-quotation-${questionKey}`}>
                    "{result.quotation}"
                  </blockquote>
                  <p className="text-sm" data-testid={`text-explanation-${questionKey}`}>
                    {result.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderComparisonResults = () => {
    if (!comparisonResult) return null;
    
    return (
      <div className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Comparison Results
              <Button
                onClick={handleDownload}
                disabled={downloadMutation.isPending}
                size="sm"
                variant="outline"
                data-testid="button-download-comparison"
              >
                {downloadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download Report
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="documentA">Document A</TabsTrigger>
                <TabsTrigger value="documentB">Document B</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comparison" className="mt-4">
                <div className="prose max-w-none" data-testid="text-comparison-report">
                  {comparisonResult.comparison}
                </div>
              </TabsContent>
              
              <TabsContent value="documentA" className="mt-4">
                <div className="space-y-4">
                  {Object.keys(comparisonResult.documentA).map((questionKey) => {
                    const result = comparisonResult.documentA[questionKey];
                    if (!result) return null;
                    
                    return (
                      <div key={`a-${questionKey}`} className="border-l-4 border-green-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Question {questionKey}</Badge>
                          <Badge variant={result.score >= 95 ? "default" : result.score >= 80 ? "secondary" : "destructive"}>
                            {result.score}/100
                          </Badge>
                        </div>
                        <h4 className="font-semibold mb-2">{result.question}</h4>
                        <blockquote className="italic text-muted-foreground mb-2 pl-4 border-l-2">
                          "{result.quotation}"
                        </blockquote>
                        <p className="text-sm">{result.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="documentB" className="mt-4">
                <div className="space-y-4">
                  {Object.keys(comparisonResult.documentB).map((questionKey) => {
                    const result = comparisonResult.documentB[questionKey];
                    if (!result) return null;
                    
                    return (
                      <div key={`b-${questionKey}`} className="border-l-4 border-orange-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Question {questionKey}</Badge>
                          <Badge variant={result.score >= 95 ? "default" : result.score >= 80 ? "secondary" : "destructive"}>
                            {result.score}/100
                          </Badge>
                        </div>
                        <h4 className="font-semibold mb-2">{result.question}</h4>
                        <blockquote className="italic text-muted-foreground mb-2 pl-4 border-l-2">
                          "{result.quotation}"
                        </blockquote>
                        <p className="text-sm">{result.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Originality Meter</h1>
        <p className="text-xl text-muted-foreground">
          Evaluate intellectual writing across four dimensions with advanced AI analysis
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Configuration</CardTitle>
          <CardDescription>
            Choose your evaluation parameters and analysis settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Evaluation Mode</label>
              <Select value={mode} onValueChange={(value: any) => setMode(value)}>
                <SelectTrigger data-testid="select-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="originality">Originality</SelectItem>
                  <SelectItem value="intelligence">Intelligence</SelectItem>
                  <SelectItem value="cogency">Cogency</SelectItem>
                  <SelectItem value="overall_quality">Overall Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Mode</label>
              <Select value={analysisMode} onValueChange={(value: any) => setAnalysisMode(value)}>
                <SelectTrigger data-testid="select-analysis-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick (~30 seconds)</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive (4-phase)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Provider</label>
              <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
                <SelectTrigger data-testid="select-provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic">Anthropic (Default)</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Type</label>
              <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                <SelectTrigger data-testid="select-analysis-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Document</SelectItem>
                  <SelectItem value="compare">Compare Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document A / Single Document */}
        <Card>
          <CardHeader>
            <CardTitle>
              {analysisType === 'single' ? 'Document' : 'Document A'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title (Optional)</label>
              <Input
                placeholder="Enter document title..."
                value={passageA.title}
                onChange={(e) => setPassageA({ ...passageA, title: e.target.value })}
                data-testid="input-title-a"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Text Content</label>
              <Textarea
                placeholder="Paste or type your text here..."
                value={passageA.text}
                onChange={(e) => setPassageA({ ...passageA, text: e.target.value })}
                rows={12}
                data-testid="textarea-content-a"
              />
              <p className="text-xs text-muted-foreground">
                Word count: {passageA.text.split(/\s+/).filter(Boolean).length}
                {passageA.text.split(/\s+/).filter(Boolean).length > 1000 && 
                  " (Will be processed in chunks)"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Document B (only for comparison) */}
        {analysisType === 'compare' && (
          <Card>
            <CardHeader>
              <CardTitle>Document B</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title (Optional)</label>
                <Input
                  placeholder="Enter document title..."
                  value={passageB.title}
                  onChange={(e) => setPassageB({ ...passageB, title: e.target.value })}
                  data-testid="input-title-b"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Content</label>
                <Textarea
                  placeholder="Paste or type your text here..."
                  value={passageB.text}
                  onChange={(e) => setPassageB({ ...passageB, text: e.target.value })}
                  rows={12}
                  data-testid="textarea-content-b"
                />
                <p className="text-xs text-muted-foreground">
                  Word count: {passageB.text.split(/\s+/).filter(Boolean).length}
                  {passageB.text.split(/\s+/).filter(Boolean).length > 1000 && 
                    " (Will be processed in chunks)"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Analysis Button */}
      <div className="flex justify-center">
        <Button
          onClick={analysisType === 'single' ? handleSingleAnalysis : handleComparisonAnalysis}
          disabled={
            (analysisType === 'single' ? singleAnalysisMutation.isPending : comparisonAnalysisMutation.isPending)
          }
          size="lg"
          data-testid="button-analyze"
        >
          {(analysisType === 'single' ? singleAnalysisMutation.isPending : comparisonAnalysisMutation.isPending) ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : null}
          {analysisType === 'single' ? 'Analyze Document' : 'Compare Documents'}
        </Button>
      </div>

      {/* Results */}
      {analysisType === 'single' ? renderSingleResults() : renderComparisonResults()}
    </div>
  );
}