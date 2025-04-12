import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResult, PassageData } from "@/lib/types";
import PassageInput from "./PassageInput";
import AnalysisResults from "./AnalysisResults";
import { Button } from "@/components/ui/button";

export default function SemanticAnalyzer() {
  const { toast } = useToast();
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
      const response = await apiRequest("POST", "/api/analyze", {
        passageA,
        passageB,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setShowResults(true);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the passages. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCompare = () => {
    if (!passageA.text.trim() || !passageB.text.trim()) {
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

  return (
    <div className="flex flex-col space-y-6" onKeyDown={handleKeyDown}>
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PassageInput
          passage={passageA}
          onChange={setPassageA}
          label="A"
          disabled={analysisMutation.isPending}
        />
        <PassageInput
          passage={passageB}
          onChange={setPassageB}
          label="B"
          disabled={analysisMutation.isPending}
        />
      </div>

      {/* Compare Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleCompare}
          disabled={analysisMutation.isPending || !passageA.text.trim() || !passageB.text.trim()}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow-sm transition flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M18 4H6"></path>
            <path d="M6 20h12"></path>
            <path d="M12 4v16"></path>
          </svg>
          <span>Compare Passages</span>
        </Button>
      </div>

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
              passageATitle={passageA.title || "Passage A"} 
              passageBTitle={passageB.title || "Passage B"}
              onNewComparison={handleResetComparison}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
