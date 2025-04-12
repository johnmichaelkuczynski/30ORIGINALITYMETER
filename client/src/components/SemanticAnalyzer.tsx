import { useState } from "react";
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
      console.log("Request payload:", {
        passageA,
        ...(isSinglePassageMode ? {} : { passageB }),
      });
      
      try {
        const response = await apiRequest("POST", isSinglePassageMode ? "/api/analyze/single" : "/api/analyze", {
          passageA,
          ...(isSinglePassageMode ? {} : { passageB }),
        });
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

  return (
    <div className="flex flex-col space-y-6" onKeyDown={handleKeyDown}>
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
      <Card className="bg-white shadow-md border border-gray-200 overflow-hidden">
        <CardContent className="p-6 flex justify-center items-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-secondary-800">Ready to Analyze?</h3>
              <p className="text-sm text-secondary-600">
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
              className="w-full py-6 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow-sm transition flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                {isSinglePassageMode ? (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="8" />
                  </>
                ) : (
                  <>
                    <path d="M18 4H6"></path>
                    <path d="M6 20h12"></path>
                    <path d="M12 4v16"></path>
                  </>
                )}
              </svg>
              <span className="text-lg">
                {isSinglePassageMode ? "Analyze Passage" : "Compare Passages"}
              </span>
            </Button>
            
            <div className="text-center mt-2">
              <p className="text-xs text-secondary-500">
                Tip: You can also press Ctrl+Enter to analyze
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
