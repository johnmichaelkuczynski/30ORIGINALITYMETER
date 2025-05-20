import { useState, useId } from "react";
import { AnalysisResult, PassageData } from "@/lib/types";
import SummarySection from "./SummarySection";
import AnalysisTabs from "./AnalysisTabs";
import DownloadReportButton from "./DownloadReportButton";
import PassageGenerator from "./PassageGenerator";
import ComprehensiveReport from "./ComprehensiveReport";
import { Button } from "@/components/ui/button";

interface AnalysisResultsProps {
  result: AnalysisResult;
  setResult: (result: AnalysisResult) => void;
  passageA: PassageData;
  passageB: PassageData;
  passageATitle: string;
  passageBTitle: string;
  onNewComparison: () => void;
  isSinglePassageMode?: boolean;
}

export default function AnalysisResults({
  result,
  setResult,
  passageA,
  passageB,
  passageATitle,
  passageBTitle,
  onNewComparison,
  isSinglePassageMode = false,
}: AnalysisResultsProps) {

  const [activeTab, setActiveTab] = useState("conceptual-lineage");
  const resultsContainerId = useId().replace(/:/g, '') + "-results";

  // Make a deep copy of the result to prevent modifying the original
  // and ensure passageB data is properly removed in single passage mode
  const processedResult = JSON.parse(JSON.stringify(result));
  
  // Force clean up passageB data in single passage mode
  if (isSinglePassageMode) {
    // For each property in the result object that has passageB
    Object.keys(processedResult).forEach(key => {
      if (processedResult[key] && typeof processedResult[key] === 'object' && 'passageB' in processedResult[key]) {
        // Remove passageB from the structure
        processedResult[key].passageB = null;
      }
    });
    
    // Special handling for noveltyHeatmap array
    if (processedResult.noveltyHeatmap && processedResult.noveltyHeatmap.passageB) {
      processedResult.noveltyHeatmap.passageB = [];
    }
  }

  return (
    <div className="space-y-6" id={resultsContainerId}>
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-3">
          <DownloadReportButton 
            result={processedResult}
            passageATitle={passageATitle}
            passageBTitle={isSinglePassageMode ? "" : passageBTitle}
            resultsContainerId={resultsContainerId}
            isSinglePassageMode={isSinglePassageMode}
          />
          
          <ComprehensiveReport
            result={processedResult}
            passageA={passageA}
            passageB={isSinglePassageMode ? undefined : passageB}
            isSinglePassageMode={isSinglePassageMode}
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={onNewComparison}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-secondary-700 hover:bg-gray-50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          New {isSinglePassageMode ? "Analysis" : "Comparison"}
        </Button>
      </div>

      <SummarySection 
        result={processedResult}
        passageATitle={passageATitle}
        passageBTitle={isSinglePassageMode ? "" : passageBTitle}
        isSinglePassageMode={isSinglePassageMode}
      />

      <AnalysisTabs
        result={processedResult}
        setResult={setResult}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        passageA={passageA}
        passageB={isSinglePassageMode ? {
    title: "",
    text: "",
    userContext: ""
  } : passageB}
        passageATitle={passageATitle}
        passageBTitle={isSinglePassageMode ? "" : passageBTitle}
        isSinglePassageMode={isSinglePassageMode}
      />

      {isSinglePassageMode && (
        <PassageGenerator
          analysisResult={result}
          passage={passageA}
          onReanalyze={(improvedPassage) => {
            // When user wants to re-analyze the improved passage
            onNewComparison();
            setTimeout(() => {
              // Wait a moment to ensure the form is reset then programmatically trigger analysis
              const analyzeEvent = new CustomEvent('analyze-improved-passage', {
                detail: { passage: improvedPassage }
              });
              document.dispatchEvent(analyzeEvent);
            }, 100);
          }}
        />
      )}
    </div>
  );
}
