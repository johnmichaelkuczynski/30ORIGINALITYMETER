import { useState, useId } from "react";
import { AnalysisResult, PassageData } from "@/lib/types";
import SummarySection from "./SummarySection";
import AnalysisTabs from "./AnalysisTabs";
import DownloadReportButton from "./DownloadReportButton";
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

  return (
    <div className="space-y-6" id={resultsContainerId}>
      <div className="flex justify-between items-center">
        <DownloadReportButton 
          result={result}
          passageATitle={passageATitle}
          passageBTitle={passageBTitle}
          resultsContainerId={resultsContainerId}
          isSinglePassageMode={isSinglePassageMode}
        />
        
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
        result={result}
        passageATitle={passageATitle}
        passageBTitle={passageBTitle}
        isSinglePassageMode={isSinglePassageMode}
      />

      <AnalysisTabs
        result={result}
        setResult={setResult}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        passageA={passageA}
        passageB={passageB}
        passageATitle={passageATitle}
        passageBTitle={passageBTitle}
        isSinglePassageMode={isSinglePassageMode}
      />
    </div>
  );
}
