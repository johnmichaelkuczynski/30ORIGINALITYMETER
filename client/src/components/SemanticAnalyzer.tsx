import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResult, PassageData } from "@/lib/types";
import PassageInput from "./PassageInput";
import CorpusComparisonInput from "./CorpusComparisonInput";
import AnalysisResults from "./AnalysisResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SemanticAnalyzer() {
  const { toast } = useToast();
  
  // Analysis modes
  type AnalysisMode = "comparison" | "single" | "corpus";
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("comparison");
  const isSinglePassageMode = analysisMode === "single";
  const isCorpusMode = analysisMode === "corpus";
  
  // LLM Provider
  type LLMProvider = "openai" | "anthropic" | "perplexity";
  const [provider, setProvider] = useState<LLMProvider>("openai");
  
  const [passageA, setPassageA] = useState<PassageData>({
    title: "",
    text: "",
    userContext: "",
  });
  const [passageB, setPassageB] = useState<PassageData>({
    title: "",
    text: "",
    userContext: "",
  });
  const [corpus, setCorpus] = useState<{
    title: string;
    text: string;
  }>({
    title: "Reference Corpus",
    text: "",
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      console.log("Analyzing in mode:", analysisMode);
      
      let endpoint = "/api/analyze";
      let payload: any = {};
      
      if (analysisMode === "single") {
        endpoint = "/api/analyze/single";
        payload = { passageA, provider };
      } else if (analysisMode === "comparison") {
        endpoint = "/api/analyze";
        payload = { passageA, passageB, provider };
      } else if (analysisMode === "corpus") {
        endpoint = "/api/analyze/corpus";
        payload = { 
          passage: passageA,
          corpus: corpus.text,
          corpusTitle: corpus.title,
          provider
        };
      }
      
      console.log("Request payload:", payload);
      
      try {
        const response = await apiRequest("POST", endpoint, payload);
        const data = await response.json();
        console.log("Analysis response:", data);
        return data;
      } catch (err) {
        console.error("Error during analysis:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setShowResults(true);
    },
    onError: (error) => {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the passages. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCompare = () => {
    // Common validation - passage A is always required
    if (!passageA.text.trim()) {
      toast({
        title: "Incomplete Input",
        description: "Please enter text in the passage before analyzing.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate based on mode
    if (analysisMode === "comparison" && !passageB.text.trim()) {
      toast({
        title: "Incomplete Input",
        description: "Please enter text in both passages before comparing.",
        variant: "destructive",
      });
      return;
    }
    
    if (analysisMode === "corpus" && !corpus.text.trim()) {
      toast({
        title: "Incomplete Input",
        description: "Please enter or upload a reference corpus for comparison.",
        variant: "destructive",
      });
      return;
    }
    
    analysisMutation.mutate();
  };

  const handleResetComparison = () => {
    setPassageA({ title: "", text: "", userContext: "" });
    setPassageB({ title: "", text: "", userContext: "" });
    setCorpus({ title: "Reference Corpus", text: "" });
    setAnalysisResult(null);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleCompare();
    }
  };

  // Event listener for analyzing an improved passage
  useEffect(() => {
    const handleImprovedPassage = (event: Event) => {
      const customEvent = event as CustomEvent<{passage: PassageData}>;
      if (customEvent.detail && customEvent.detail.passage) {
        // Set the passage data and enable single passage mode
        setAnalysisMode("single");
        setPassageA(customEvent.detail.passage);
        
        // Trigger analysis
        setTimeout(() => {
          handleCompare();
        }, 100);
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
            className="grid grid-cols-1 md:grid-cols-3 gap-2"
          >
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
          className="grid grid-cols-1 md:grid-cols-3 gap-2"
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
        </div>
      </div>
      
      {/* Input Section */}
      {analysisMode === "corpus" ? (
        <CorpusComparisonInput
          passage={passageA}
          corpus={corpus}
          onPassageChange={setPassageA}
          onCorpusChange={setCorpus}
          disabled={analysisMutation.isPending}
        />
      ) : (
        <div className={`grid grid-cols-1 ${analysisMode === "single" ? "" : "lg:grid-cols-2"} gap-6`}>
          <PassageInput
            passage={passageA}
            onChange={setPassageA}
            label={analysisMode === "single" ? "" : "A"}
            disabled={analysisMutation.isPending}
            showUserContext={true}
          />
          
          {analysisMode === "comparison" && (
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
              </p>
            </div>
            
            <Button
              size="lg"
              onClick={handleCompare}
              disabled={
                analysisMutation.isPending || 
                !passageA.text.trim() || 
                (analysisMode === "comparison" && !passageB.text.trim()) ||
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
                    <rect x="2" y="4" width="6" height="16" rx="1" strokeWidth="2.5" />
                    <rect x="16" y="4" width="6" height="16" rx="1" strokeWidth="2.5" />
                    <line x1="8" y1="12" x2="16" y2="12" strokeWidth="2.5" />
                    <line x1="12" y1="8" x2="12" y2="16" strokeWidth="2.5" />
                  </>
                )}
              </svg>
              <span className="text-xl font-bold tracking-wide">
                {analysisMode === "single" && "ANALYZE PASSAGE"}
                {analysisMode === "comparison" && "COMPARE PASSAGES"}
                {analysisMode === "corpus" && "COMPARE TO CORPUS"}
              </span>
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm font-medium text-green-700 bg-green-50 py-2 px-4 rounded-lg inline-block border border-green-200">
                💡 Tip: You can also press Ctrl+Enter to analyze
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {(showResults || analysisMutation.isPending) && (
        <div className="mt-8">
          {analysisMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-secondary-600 font-medium">Analyzing originality...</p>
            </div>
          ) : analysisResult ? (
            <AnalysisResults 
              result={analysisResult}
              setResult={setAnalysisResult}
              passageA={passageA}
              passageB={passageB}
              passageATitle={passageA.title || (analysisMode === "single" ? "Your Passage" : "Passage A")} 
              passageBTitle={
                analysisMode === "single" 
                  ? "Norm" 
                  : analysisMode === "corpus"
                    ? corpus.title || "Reference Corpus"
                    : (passageB.title || "Passage B")
              }
              onNewComparison={handleResetComparison}
              isSinglePassageMode={analysisMode !== "comparison"}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
