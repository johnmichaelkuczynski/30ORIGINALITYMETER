import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, Loader2, FileText } from "lucide-react";
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
  
  // File upload refs
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);
  
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
  
  // Chunk selection state
  const [chunksA, setChunksA] = useState<string[]>([]);
  const [chunksB, setChunksB] = useState<string[]>([]);
  const [selectedChunksA, setSelectedChunksA] = useState<number[]>([]);
  const [selectedChunksB, setSelectedChunksB] = useState<number[]>([]);
  const [showChunkSelectorA, setShowChunkSelectorA] = useState(false);
  const [showChunkSelectorB, setShowChunkSelectorB] = useState(false);

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

  // File Upload Mutation
  const fileUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'File upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data, file) => {
      toast({
        title: "File Processed",
        description: `${file.name} has been processed successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "File Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Function to split text into chunks
  const splitIntoChunks = (text: string, maxWords = 1000): string[] => {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return [text];
    
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += maxWords) {
      const chunk = words.slice(i, i + maxWords).join(' ');
      chunks.push(chunk);
    }
    return chunks;
  };

  // Handle file upload for passage A
  const handleFileUploadA = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a TXT, PDF, or DOCX file.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await fileUploadMutation.mutateAsync(file);
      setPassageA(prev => ({
        ...prev,
        text: result.content,
        title: result.filename || prev.title
      }));
      
      // Check if chunking is needed and set up chunk selector
      const wordCount = result.content.split(/\s+/).filter(Boolean).length;
      if (wordCount > 1000) {
        const chunks = splitIntoChunks(result.content);
        setChunksA(chunks);
        setSelectedChunksA(Array.from({length: chunks.length}, (_, i) => i)); // Select all by default
        setShowChunkSelectorA(true);
      } else {
        setChunksA([]);
        setSelectedChunksA([]);
        setShowChunkSelectorA(false);
      }
    } catch (error) {
      // Error handling is done in mutation
    }
    
    // Reset file input
    if (fileInputARef.current) {
      fileInputARef.current.value = '';
    }
  };

  // Handle file upload for passage B
  const handleFileUploadB = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a TXT, PDF, or DOCX file.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await fileUploadMutation.mutateAsync(file);
      setPassageB(prev => ({
        ...prev,
        text: result.content,
        title: result.filename || prev.title
      }));
      
      // Check if chunking is needed and set up chunk selector
      const wordCount = result.content.split(/\s+/).filter(Boolean).length;
      if (wordCount > 1000) {
        const chunks = splitIntoChunks(result.content);
        setChunksB(chunks);
        setSelectedChunksB(Array.from({length: chunks.length}, (_, i) => i)); // Select all by default
        setShowChunkSelectorB(true);
      } else {
        setChunksB([]);
        setSelectedChunksB([]);
        setShowChunkSelectorB(false);
      }
    } catch (error) {
      // Error handling is done in mutation
    }
    
    // Reset file input
    if (fileInputBRef.current) {
      fileInputBRef.current.value = '';
    }
  };

  // Handle text change for passage A (detect chunking need)
  const handlePassageATextChange = (text: string) => {
    setPassageA(prev => ({ ...prev, text }));
    
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount > 1000) {
      const chunks = splitIntoChunks(text);
      setChunksA(chunks);
      if (selectedChunksA.length === 0) {
        setSelectedChunksA(Array.from({length: chunks.length}, (_, i) => i)); // Select all by default
      }
      setShowChunkSelectorA(true);
    } else {
      setChunksA([]);
      setSelectedChunksA([]);
      setShowChunkSelectorA(false);
    }
  };

  // Handle text change for passage B (detect chunking need)
  const handlePassageBTextChange = (text: string) => {
    setPassageB(prev => ({ ...prev, text }));
    
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount > 1000) {
      const chunks = splitIntoChunks(text);
      setChunksB(chunks);
      if (selectedChunksB.length === 0) {
        setSelectedChunksB(Array.from({length: chunks.length}, (_, i) => i)); // Select all by default
      }
      setShowChunkSelectorB(true);
    } else {
      setChunksB([]);
      setSelectedChunksB([]);
      setShowChunkSelectorB(false);
    }
  };

  const handleSingleAnalysis = () => {
    if (!passageA.text.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to analyze.",
        variant: "destructive",
      });
      return;
    }

    // If document needs chunking and chunks are selected, use only selected chunks
    let textToAnalyze = passageA.text;
    if (showChunkSelectorA && selectedChunksA.length > 0 && selectedChunksA.length < chunksA.length) {
      textToAnalyze = selectedChunksA.map(index => chunksA[index]).join('\n\n');
    }

    singleAnalysisMutation.mutate({
      passage: { ...passageA, text: textToAnalyze },
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

    // If documents need chunking and chunks are selected, use only selected chunks
    let textToAnalyzeA = passageA.text;
    let textToAnalyzeB = passageB.text;
    
    if (showChunkSelectorA && selectedChunksA.length > 0 && selectedChunksA.length < chunksA.length) {
      textToAnalyzeA = selectedChunksA.map(index => chunksA[index]).join('\n\n');
    }
    
    if (showChunkSelectorB && selectedChunksB.length > 0 && selectedChunksB.length < chunksB.length) {
      textToAnalyzeB = selectedChunksB.map(index => chunksB[index]).join('\n\n');
    }

    comparisonAnalysisMutation.mutate({
      passageA: { ...passageA, text: textToAnalyzeA },
      passageB: { ...passageB, text: textToAnalyzeB },
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
                  <SelectItem value="anthropic">ZHI 1</SelectItem>
                  <SelectItem value="openai">ZHI 2</SelectItem>
                  <SelectItem value="deepseek">ZHI 3</SelectItem>
                  <SelectItem value="perplexity">ZHI 4</SelectItem>
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Text Content</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileUploadA}
                    ref={fileInputARef}
                    className="hidden"
                    data-testid="file-input-a"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputARef.current?.click()}
                    disabled={fileUploadMutation.isPending}
                    data-testid="button-upload-a"
                  >
                    {fileUploadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <FileText className="h-4 w-4 mr-1" />
                    )}
                    Upload File
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="Paste or type your text here, or upload a document (TXT, PDF, DOCX)..."
                value={passageA.text}
                onChange={(e) => handlePassageATextChange(e.target.value)}
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

            {/* Chunk Selector for Document A */}
            {showChunkSelectorA && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Select Chunks to Analyze</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChunksA(Array.from({length: chunksA.length}, (_, i) => i))}
                      data-testid="button-select-all-a"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChunksA([])}
                      data-testid="button-select-none-a"
                    >
                      Select None
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded p-3">
                  {chunksA.map((chunk, index) => {
                    const wordCount = chunk.split(/\s+/).filter(Boolean).length;
                    const preview = chunk.substring(0, 100) + (chunk.length > 100 ? '...' : '');
                    const isSelected = selectedChunksA.includes(index);
                    
                    return (
                      <div key={index} className="flex items-start gap-3 p-2 border rounded">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedChunksA([...selectedChunksA, index]);
                            } else {
                              setSelectedChunksA(selectedChunksA.filter(i => i !== index));
                            }
                          }}
                          className="mt-1"
                          data-testid={`checkbox-chunk-a-${index}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">Chunk {index + 1}</span>
                            <span className="text-xs text-muted-foreground">({wordCount} words)</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{preview}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedChunksA.length} of {chunksA.length} chunks selected
                  {selectedChunksA.length > 0 && selectedChunksA.length < chunksA.length && 
                    " (This will significantly reduce processing time)"
                  }
                </p>
              </div>
            )}
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Text Content</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".txt,.pdf,.docx"
                      onChange={handleFileUploadB}
                      ref={fileInputBRef}
                      className="hidden"
                      data-testid="file-input-b"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputBRef.current?.click()}
                      disabled={fileUploadMutation.isPending}
                      data-testid="button-upload-b"
                    >
                      {fileUploadMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <FileText className="h-4 w-4 mr-1" />
                      )}
                      Upload File
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder="Paste or type your text here, or upload a document (TXT, PDF, DOCX)..."
                  value={passageB.text}
                  onChange={(e) => handlePassageBTextChange(e.target.value)}
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

              {/* Chunk Selector for Document B */}
              {showChunkSelectorB && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Select Chunks to Analyze</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedChunksB(Array.from({length: chunksB.length}, (_, i) => i))}
                        data-testid="button-select-all-b"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedChunksB([])}
                        data-testid="button-select-none-b"
                      >
                        Select None
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded p-3">
                    {chunksB.map((chunk, index) => {
                      const wordCount = chunk.split(/\s+/).filter(Boolean).length;
                      const preview = chunk.substring(0, 100) + (chunk.length > 100 ? '...' : '');
                      const isSelected = selectedChunksB.includes(index);
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-2 border rounded">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedChunksB([...selectedChunksB, index]);
                              } else {
                                setSelectedChunksB(selectedChunksB.filter(i => i !== index));
                              }
                            }}
                            className="mt-1"
                            data-testid={`checkbox-chunk-b-${index}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">Chunk {index + 1}</span>
                              <span className="text-xs text-muted-foreground">({wordCount} words)</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{preview}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedChunksB.length} of {chunksB.length} chunks selected
                    {selectedChunksB.length > 0 && selectedChunksB.length < chunksB.length && 
                      " (This will significantly reduce processing time)"
                    }
                  </p>
                </div>
              )}
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