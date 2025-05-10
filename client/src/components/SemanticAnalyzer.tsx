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
  const [providerStatus, setProviderStatus] = useState<{
    openai: boolean;
    anthropic: boolean;
    perplexity: boolean;
  }>({
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
          
          // If the current provider is not available, default to one that is
          if (!data[provider]) {
            if (data.openai) setProvider('openai');
            else if (data.anthropic) setProvider('anthropic');
            else if (data.perplexity) setProvider('perplexity');
          }
        }
      } catch (error) {
        console.error("Failed to check provider status:", error);
      }
    }
    
    checkProviders();
  }, []);
  
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
        
        {/* Provider Selection */}
        <div className="mt-6">
          <h4 className="font-semibold text-slate-700 mb-3">Select AI Model Provider</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div 
              className={`relative cursor-pointer rounded-lg border p-3 flex items-center space-x-3 transition-all ${
                provider === 'openai' 
                  ? 'border-blue-300 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:bg-slate-50'
              } ${!providerStatus.openai ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => providerStatus.openai && setProvider('openai')}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#0284c7">
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-gray-900 cursor-pointer">
                  OpenAI
                </label>
                <p className="text-xs text-gray-500">
                  GPT-4o
                </p>
              </div>
              {provider === 'openai' && (
                <div className="absolute top-2 right-2">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div 
              className={`relative cursor-pointer rounded-lg border p-3 flex items-center space-x-3 transition-all ${
                provider === 'anthropic' 
                  ? 'border-violet-300 bg-violet-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:bg-slate-50'
              } ${!providerStatus.anthropic ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => providerStatus.anthropic && setProvider('anthropic')}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-violet-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM10.9262 23.5262H8V8H10.9262V14.4983H21.0738V8H24V23.5262H21.0738V17.0279H10.9262V23.5262Z" fill="#8a5cf6" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-gray-900 cursor-pointer">
                  Anthropic
                </label>
                <p className="text-xs text-gray-500">
                  Claude 3.7 Sonnet
                </p>
              </div>
              {provider === 'anthropic' && (
                <div className="absolute top-2 right-2">
                  <svg className="h-5 w-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div 
              className={`relative cursor-pointer rounded-lg border p-3 flex items-center space-x-3 transition-all ${
                provider === 'perplexity' 
                  ? 'border-emerald-300 bg-emerald-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:bg-slate-50'
              } ${!providerStatus.perplexity ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => providerStatus.perplexity && setProvider('perplexity')}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#10b981" />
                  <path d="M7 8.5H17M7 12H17M7 15.5H12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-gray-900 cursor-pointer">
                  Perplexity
                </label>
                <p className="text-xs text-gray-500">
                  Llama 3.1 Sonar
                </p>
              </div>
              {provider === 'perplexity' && (
                <div className="absolute top-2 right-2">
                  <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {analysisMode === "corpus" && (
            <div className="mt-2 text-xs text-slate-500 p-2 bg-amber-50 border border-amber-200 rounded">
              <p>Note: Corpus comparison mode currently only supports OpenAI as the provider.</p>
            </div>
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
