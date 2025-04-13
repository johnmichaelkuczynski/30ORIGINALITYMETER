import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResult, PassageData } from "@/lib/types";
import PassageInput from "./PassageInput";
import AnalysisResults from "./AnalysisResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SemanticAnalyzer() {
  const { toast } = useToast();
  const [isSinglePassageMode, setIsSinglePassageMode] = useState(false);
  const [passageA, setPassageA] = useState<PassageData>({
    title: "",
    text: "",
  });
  const [passageB, setPassageB] = useState<PassageData>({
    title: "",
    text: "",
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      console.log("Analyzing in mode:", isSinglePassageMode ? "Single passage" : "Comparison");
      
      // Ensure passageB exists in single-passage mode with default values
      const payload = isSinglePassageMode 
        ? { 
            passageA,
            // We don't need passageB for the single passage endpoint
          } 
        : { 
            passageA, 
            passageB 
          };
      
      console.log("Request payload:", payload);
      
      try {
        const response = await apiRequest(
          "POST", 
          isSinglePassageMode ? "/api/analyze/single" : "/api/analyze", 
          payload
        );
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
    if (!passageA.text.trim()) {
      toast({
        title: "Incomplete Input",
        description: "Please enter text in the passage before analyzing.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isSinglePassageMode && !passageB.text.trim()) {
      toast({
        title: "Incomplete Input",
        description: "Please enter text in both passages before comparing.",
        variant: "destructive",
      });
      return;
    }
    
    analysisMutation.mutate();
  };

  const handleResetComparison = () => {
    setPassageA({ title: "", text: "" });
    setPassageB({ title: "", text: "" });
    setAnalysisResult(null);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleCompare();
    }
  };

  const handleModeToggle = (checked: boolean) => {
    setIsSinglePassageMode(checked);
    
    // Reset results when switching modes
    if (showResults) {
      setAnalysisResult(null);
      setShowResults(false);
    }
  };

  // Event listener for analyzing an improved passage
  useEffect(() => {
    const handleImprovedPassage = (event: Event) => {
      const customEvent = event as CustomEvent<{passage: PassageData}>;
      if (customEvent.detail && customEvent.detail.passage) {
        // Set the passage data and enable single passage mode
        setIsSinglePassageMode(true);
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
      
      {/* Mode Toggle */}
      <div className="flex justify-end">
        <div className="bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200 flex items-center space-x-4">
          <Label htmlFor="mode-toggle" className="text-sm text-secondary-600">
            Compare two passages
          </Label>
          <Switch 
            id="mode-toggle" 
            checked={isSinglePassageMode} 
            onCheckedChange={handleModeToggle}
          />
          <Label htmlFor="mode-toggle" className="text-sm text-secondary-600">
            Analyze single passage
          </Label>
        </div>
      </div>
      
      {/* Input Section */}
      <div className={`grid grid-cols-1 ${isSinglePassageMode ? "" : "lg:grid-cols-2"} gap-6`}>
        <PassageInput
          passage={passageA}
          onChange={setPassageA}
          label={isSinglePassageMode ? "" : "A"}
          disabled={analysisMutation.isPending}
        />
        
        {!isSinglePassageMode && (
          <PassageInput
            passage={passageB}
            onChange={setPassageB}
            label="B"
            disabled={analysisMutation.isPending}
          />
        )}
      </div>

      {/* Compare Button Card - More Prominent */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg border-2 border-green-100 overflow-hidden rounded-xl">
        <CardContent className="p-8 flex justify-center items-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-green-800">Ready to Analyze?</h3>
              <p className="text-base text-slate-600 mt-2">
                {isSinglePassageMode 
                  ? "Click the button below to analyze the semantic originality of your passage"
                  : "Click the button below to compare the semantic originality of both passages"
                }
              </p>
            </div>
            
            <Button
              size="lg"
              onClick={handleCompare}
              disabled={
                analysisMutation.isPending || 
                !passageA.text.trim() || 
                (!isSinglePassageMode && !passageB.text.trim())
              }
              className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg shadow-lg transition-all border-2 border-green-500 hover:border-green-600 cursor-pointer flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                {isSinglePassageMode ? (
                  <>
                    <circle cx="12" cy="12" r="9" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="8" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
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
                {isSinglePassageMode ? "ANALYZE PASSAGE" : "COMPARE PASSAGES"}
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
              passageATitle={passageA.title || (isSinglePassageMode ? "Your Passage" : "Passage A")} 
              passageBTitle={isSinglePassageMode ? "Norm" : (passageB.title || "Passage B")}
              onNewComparison={handleResetComparison}
              isSinglePassageMode={isSinglePassageMode}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
