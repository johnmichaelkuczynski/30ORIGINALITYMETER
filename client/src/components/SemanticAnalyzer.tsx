import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResult, PassageData } from "@/lib/types";
import PassageInput from "./PassageInput";
import CorpusComparisonInput from "./CorpusComparisonInput";
import AnalysisResults from "./AnalysisResults";
import ArgumentativeResults from "./ArgumentativeResults";
import ArgumentativeAnalysis from "./ArgumentativeAnalysis";
import NaturalLanguageGenerator from "./NaturalLanguageGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ChatWithAI from "@/components/ChatWithAI";

interface SemanticAnalyzerProps {
  onSendToRewriter?: (text: string, title?: string) => void;
  onSendToHomework?: (text: string) => void;
}

export default function SemanticAnalyzer({ onSendToRewriter, onSendToHomework }: SemanticAnalyzerProps) {
  const { toast } = useToast();
  
  // Analysis modes
  type AnalysisMode = "comparison" | "single" | "corpus" | "generate" | "argumentative" | "single-cogency";
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("comparison");
  const isSinglePassageMode = analysisMode === "single";
  const isCorpusMode = analysisMode === "corpus";
  const isGenerateMode = analysisMode === "generate";
  const isArgumentativeMode = analysisMode === "argumentative";
  const isSingleCogencyMode = analysisMode === "single-cogency";
  
  // LLM Provider
  type LLMProvider = "deepseek" | "openai" | "anthropic" | "perplexity";
  const [provider, setProvider] = useState<LLMProvider>("deepseek");
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
  
  // Check which providers are available
  useEffect(() => {
    async function checkProviders() {
      try {
        const response = await fetch('/api/provider-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProviderStatus(data);
          
          // Select the first available provider (prioritize DeepSeek as default)
          if (!data[provider]) {
            if (data.deepseek) {
              setProvider('deepseek');
            } else if (data.openai) {
              setProvider('openai');
            } else if (data.anthropic) {
              setProvider('anthropic');
            } else if (data.perplexity) {
              setProvider('perplexity');
            }
          }
        }
      } catch (error) {
        console.error("Error checking provider status:", error);
      }
    }
    
    checkProviders();
  }, [provider]);
  
  // Passages input state
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
  
  // Reset passageB when switching to single mode
  useEffect(() => {
    if (analysisMode === "single") {
      setPassageB({
        title: "",
        text: "",
        userContext: ""
      });
    }
  }, [analysisMode]);
  
  // State for corpus comparison
  const [corpus, setCorpus] = useState<PassageData>({
    title: "Reference Corpus",
    text: "",
    userContext: ""
  });
  
  // Analysis results
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Single document cogency analysis mutation
  const singleCogencyMutation = useMutation({
    mutationFn: async () => {
      console.log("Analyzing single document cogency");
      const endpoint = '/api/analyze/argumentative';
      const payload = {
        passageA,
        passageB: null,
        passageATitle: passageA.title || "Document A",
        passageBTitle: null,
        isSingleMode: true,
        provider: "openai"
      };
      
      console.log("Single cogency request payload:", payload);
      const response = await apiRequest('POST', endpoint, payload);
      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Single cogency analysis successful:", data);
      setAnalysisResult(data);
      setShowResults(true);
      
      // Scroll to the results
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    },
    onError: (error) => {
      console.error("Single cogency analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your document. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async () => {
      console.log("Analyzing in mode:", analysisMode);
      let endpoint = '';
      let payload = {};
      
      if (analysisMode === "corpus") {
        endpoint = '/api/analyze/corpus';
        payload = {
          passage: passageA,
          corpus: corpus,
          provider
        };
      } else if (analysisMode === "single") {
        endpoint = '/api/analyze/single';
        payload = {
          passageA,
          provider
        };
      } else {
        endpoint = '/api/analyze';
        payload = {
          passageA,
          passageB,
          provider
        };
      }
      
      console.log("Request payload:", payload);
      const response = await apiRequest('POST', endpoint, payload);
      const result = await response.json();
      return result as AnalysisResult;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setShowResults(true);
      
      // Scroll to the results
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    },
    onError: (error) => {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your passages. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handler for comparison
  const handleCompare = () => {
    // Validation
    if (passageA.text.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter text for passage A.",
        variant: "destructive",
      });
      return;
    }
    
    if (analysisMode === "comparison" && passageB.text.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter text for passage B.",
        variant: "destructive",
      });
      return;
    }
    
    if (analysisMode === "corpus" && corpus.text.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter text for the reference corpus.",
        variant: "destructive",
      });
      return;
    }
    
    // For argumentative analysis mode, directly show results without API call
    if (analysisMode === "argumentative") {
      console.log("Starting argumentative analysis mode");
      setShowResults(true);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    
    // For single document cogency mode, call the API directly
    if (analysisMode === "single-cogency") {
      console.log("Starting single document cogency analysis");
      singleCogencyMutation.mutate();
      return;
    }
    
    // Log analysis request for other modes
    console.log(`Analyzing in mode: ${analysisMode}`);
    console.log("Request payload:", {
      passageA: {
        title: passageA.title,
        text: passageA.text.substring(0, 50) + "..." // Log just the beginning for brevity
      },
      ...(analysisMode === "comparison" ? {
        passageB: {
          title: passageB.title,
          text: passageB.text.substring(0, 50) + "..."
        }
      } : {}),
      ...(analysisMode === "corpus" ? {
        corpus: {
          title: corpus.title,
          text: corpus.text.substring(0, 50) + "..."
        }
      } : {}),
      provider
    });
    
    // Perform analysis for other modes
    analysisMutation.mutate();
  };
  
  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleCompare();
    }
  };
  
  // Listen for events to analyze improved passages
  useEffect(() => {
    const handleImprovedPassage = (customEvent: any) => {
      if (customEvent.detail && customEvent.detail.passage) {
        // Make sure we have valid text content
        if (!customEvent.detail.passage.text || customEvent.detail.passage.text.trim() === '') {
          console.error("Received empty passage text for re-analysis");
          toast({
            title: "Error",
            description: "Cannot analyze empty text. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Set the passage data and enable single passage mode
        setAnalysisMode("single");
        setPassageA({
          ...customEvent.detail.passage,
          // Ensure we have a title even if empty
          title: customEvent.detail.passage.title || "Improved Passage"
        });
        
        // Log the passage being sent for analysis
        console.log("Re-analyzing passage:", {
          title: customEvent.detail.passage.title || "Improved Passage",
          textLength: customEvent.detail.passage.text?.length || 0
        });
        
        // Trigger analysis (with a slight delay to ensure state is updated)
        setTimeout(() => {
          handleCompare();
        }, 200);
      }
    };

    // Add event listener
    document.addEventListener('analyze-improved-passage', handleImprovedPassage);
    
    // Clean up
    return () => {
      document.removeEventListener('analyze-improved-passage', handleImprovedPassage);
    };
  }, [handleCompare]);

  return (
    <div className="flex flex-col space-y-6" onKeyDown={handleKeyDown}>
      {/* Originality Meter Description */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-bold text-green-800 mb-1">What is Originality Meter?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Originality Meter is an AI-powered app that analyzes philosophical and scholarly writing for true conceptual originality—not just rewording or citation games. It evaluates your work based on semantic distance, lineage, parasite detection, and more. Stop wondering if your ideas are original. Measure them.
            </p>
          </div>
        </div>
      </div>
      
      {/* Analysis Mode Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="mb-2">
          <h3 className="text-base font-medium text-secondary-700">Select Analysis Mode</h3>
          <p className="text-sm text-secondary-500">Choose how you want to analyze your text</p>
        </div>
        
        {/* LLM Provider Selector */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="mb-2">
            <h4 className="text-sm font-medium text-secondary-700">AI Provider</h4>
            <p className="text-xs text-secondary-500">Select which AI model to use for analysis</p>
          </div>
          
          <RadioGroup
            value={provider}
            onValueChange={(value) => setProvider(value as LLMProvider)}
            className="grid grid-cols-1 md:grid-cols-4 gap-2"
          >
            <div className={`flex items-center space-x-2 rounded-md border p-2 ${provider === "deepseek" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}>
              <RadioGroupItem value="deepseek" id="deepseek" />
              <Label htmlFor="deepseek" className="font-medium text-sm">
                DeepSeek (Default)
              </Label>
            </div>
            
            <div className={`flex items-center space-x-2 rounded-md border p-2 ${provider === "openai" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}>
              <RadioGroupItem value="openai" id="openai" />
              <Label htmlFor="openai" className="font-medium text-sm">
                OpenAI (GPT-4o)
              </Label>
            </div>
            
            <div className={`flex items-center space-x-2 rounded-md border p-2 ${provider === "anthropic" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}>
              <RadioGroupItem value="anthropic" id="anthropic" />
              <Label htmlFor="anthropic" className="font-medium text-sm">
                Anthropic (Claude)
              </Label>
            </div>
            
            <div className={`flex items-center space-x-2 rounded-md border p-2 ${provider === "perplexity" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}>
              <RadioGroupItem value="perplexity" id="perplexity" />
              <Label htmlFor="perplexity" className="font-medium text-sm">
                Perplexity
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <RadioGroup
          value={analysisMode}
          onValueChange={(value) => {
            setAnalysisMode(value as AnalysisMode);
            // Reset results when switching modes
            if (showResults) {
              setAnalysisResult(null);
              setShowResults(false);
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
        >
          <div className={`flex items-center space-x-2 rounded-md border p-3 ${analysisMode === "comparison" ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
            <RadioGroupItem value="comparison" id="comparison" />
            <Label htmlFor="comparison" className="font-medium">
              Compare Two Passages
            </Label>
          </div>
          
          <div className={`flex items-center space-x-2 rounded-md border p-3 ${analysisMode === "single" ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single" className="font-medium">
              Analyze Single Passage
            </Label>
          </div>
          
          <div className={`flex items-center space-x-2 rounded-md border p-3 ${analysisMode === "corpus" ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
            <RadioGroupItem value="corpus" id="corpus" />
            <Label htmlFor="corpus" className="font-medium">
              Compare to Corpus
            </Label>
          </div>
          
          <div className={`flex items-center space-x-2 rounded-md border p-3 ${analysisMode === "generate" ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
            <RadioGroupItem value="generate" id="generate" />
            <Label htmlFor="generate" className="font-medium">
              Generate Original Text
            </Label>
          </div>
          
          <div className={`flex items-center space-x-2 rounded-md border p-3 ${analysisMode === "single-cogency" ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
            <RadioGroupItem value="single-cogency" id="single-cogency" />
            <Label htmlFor="single-cogency" className="font-medium text-sm">
              Single Document Cogency
            </Label>
          </div>
          
          <div className={`flex items-center space-x-2 rounded-md border p-3 ${analysisMode === "argumentative" ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
            <RadioGroupItem value="argumentative" id="argumentative" />
            <Label htmlFor="argumentative" className="font-medium text-sm">
              Cogency Test
            </Label>
          </div>
        </RadioGroup>
        
        <div className="mt-3 text-xs text-slate-500">
          {analysisMode === "comparison" && (
            <p>Compare two passages to see which one is more original and how they relate conceptually.</p>
          )}
          {analysisMode === "single" && (
            <p>Analyze a single passage against general intellectual norms to measure its originality.</p>
          )}
          {analysisMode === "corpus" && (
            <p>Compare your passage against a larger body of work to see how it aligns with a specific style or theorist.</p>
          )}
          {analysisMode === "generate" && (
            <p>Generate highly original text using natural language instructions that specify topic, length, authors, conceptual density, and other parameters.</p>
          )}
          {analysisMode === "single-cogency" && (
            <p>Test how well a single document proves what it sets out to prove using 7 core parameters: clarity of argument, inferential cohesion, conceptual precision, evidential support, counterargument handling, cognitive risk, and epistemic control.</p>
          )}
          {analysisMode === "argumentative" && (
            <p>Test how well a document proves what it sets out to prove. Works for single documents or document comparisons using consistent scoring.</p>
          )}
        </div>
      </div>
      
      {/* Input Section */}
      {analysisMode === "generate" ? (
        <NaturalLanguageGenerator 
          onTextGenerated={(text, title) => {
            // Create a passage data object from the generated text
            const generatedPassage: PassageData = {
              title: title || "Generated Passage",
              text,
              userContext: ""
            };
            
            // Set the passage and switch to single analysis mode
            setPassageA(generatedPassage);
            
            // Allow user to see the text before analyzing
            toast({
              title: "Text Generated Successfully",
              description: "Your text has been generated. You can analyze it by clicking the 'Analyze Text' button.",
              variant: "default",
            });
          }}
          onAnalyzeGenerated={(passage) => {
            // Set the passage
            setPassageA(passage);
            
            // Switch to single analysis mode and trigger analysis
            setAnalysisMode("single");
            setTimeout(() => handleCompare(), 200);
          }}
        />
      ) : analysisMode === "corpus" ? (
        <CorpusComparisonInput
          passage={passageA}
          corpus={corpus}
          onPassageChange={setPassageA}
          onCorpusChange={setCorpus}
          disabled={analysisMutation.isPending}
        />
      ) : (
        <div className={`grid grid-cols-1 ${(analysisMode === "single") ? "" : "lg:grid-cols-2"} gap-6`}>
          <PassageInput
            passage={passageA}
            onChange={setPassageA}
            label={(analysisMode === "single") ? "" : "A"}
            disabled={analysisMutation.isPending}
            showUserContext={true}
          />
          
          {(analysisMode === "comparison" || analysisMode === "argumentative") && (
            <PassageInput
              passage={passageB}
              onChange={setPassageB}
              label="B"
              disabled={analysisMutation.isPending}
              showUserContext={false}
            />
          )}
        </div>
      )}

      {/* Compare Button Card - More Prominent */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg border-2 border-green-100 overflow-hidden rounded-xl">
        <CardContent className="p-8 flex justify-center items-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-green-800">Ready to Analyze?</h3>
              <p className="text-base text-slate-600 mt-2">
                {analysisMode === "single" && "Click the button below to analyze the semantic originality of your passage"}
                {analysisMode === "comparison" && "Click the button below to compare the semantic originality of both passages"}
                {analysisMode === "corpus" && "Click the button below to compare your passage against the reference corpus"}
                {analysisMode === "argumentative" && "Click the button below to determine which paper makes its case better"}
              </p>
            </div>
            
            <Button
              size="lg"
              onClick={handleCompare}
              disabled={
                analysisMutation.isPending || 
                !passageA.text.trim() || 
                ((analysisMode === "comparison" || analysisMode === "argumentative") && !passageB.text.trim()) ||
                (analysisMode === "corpus" && !corpus.text.trim())
              }
              className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg shadow-lg transition-all border-2 border-green-500 hover:border-green-600 cursor-pointer flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                {analysisMode === "single" ? (
                  <>
                    <circle cx="12" cy="12" r="9" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="8" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </>
                ) : analysisMode === "corpus" ? (
                  <>
                    <rect x="2" y="4" width="9" height="16" rx="1" strokeWidth="2.5" />
                    <rect x="15" y="4" width="7" height="16" rx="1" strokeWidth="2.5" />
                    <line x1="11" y1="12" x2="15" y2="12" strokeWidth="2.5" />
                  </>
                ) : (
                  <>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </>
                )}
              </svg>
              ANALYZE PASSAGE
              {analysisMutation.isPending && (
                <span className="ml-3 inline-block animate-spin">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </span>
              )}
            </Button>
            
            <p className="text-xs text-center text-slate-500 mt-2">
              <span role="img" aria-label="tip">💡</span> Tip: You can also press Ctrl+Enter to analyze
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Results Section */}
      <div id="results-section">
        {showResults && analysisMode === "argumentative" && (
          <ArgumentativeAnalysis
            passageA={passageA}
            passageB={passageB}
            onResults={(result) => {
              // Handle the cogency test results here
              console.log("Cogency test results:", result);
            }}
            onNewComparison={() => setShowResults(false)}
          />
        )}
        
        {showResults && analysisResult && analysisMode === "single-cogency" && (
          <ArgumentativeResults
            result={analysisResult}
            isSingleMode={true}
            passageATitle={passageA.title || "Document A"}
            passageBTitle=""
          />
        )}
        
        {showResults && analysisResult && analysisMode !== "argumentative" && analysisMode !== "single-cogency" && (
          <AnalysisResults 
            result={analysisResult}
            setResult={(newResult) => setAnalysisResult(newResult)}
            passageA={passageA}
            passageB={analysisMode === "comparison" ? passageB : {
              title: "",
              text: "",
              userContext: ""
            }}
            passageATitle={passageA.title || "Passage A"}
            passageBTitle={passageB.title || "Passage B"}
            onNewComparison={() => setShowResults(false)}
            isSinglePassageMode={analysisMode === "single"}
            onSendToRewriter={onSendToRewriter}
            onSendToHomework={onSendToHomework}
          />
        )}
      </div>

      {/* Chat with AI Section */}
      <ChatWithAI
        currentPassage={passageA.text ? passageA : undefined}
        analysisResult={analysisResult || undefined}
        onSendToInput={(text: string, title?: string) => {
          // Set the text as Passage A for analysis
          setPassageA({
            title: title || "Generated from Chat",
            text: text,
            userContext: ""
          });
          
          // Switch to single passage mode for generated content
          setAnalysisMode("single");
          
          // Clear any existing results
          setShowResults(false);
          setAnalysisResult(null);
          
          // Scroll to top to show the new input
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSendToRewriter={onSendToRewriter}
        onSendToHomework={onSendToHomework}
      />
    </div>
  );
}