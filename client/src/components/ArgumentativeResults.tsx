import React from 'react';
import ArgumentativeAnalysis from "./ArgumentativeAnalysis";
import { PassageData } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface ArgumentativeResultsProps {
  passageA: PassageData;
  passageB?: PassageData;
  passageATitle: string;
  passageBTitle?: string;
  isSingleMode: boolean;
  onNewComparison: () => void;
}

export default function ArgumentativeResults({
  passageA,
  passageB,
  passageATitle,
  passageBTitle,
  isSingleMode,
  onNewComparison
}: ArgumentativeResultsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-900">
          {isSingleMode ? 'Cogency Analysis' : 'Argumentative Comparison'}
        </h2>
        
        <Button 
          variant="outline" 
          onClick={onNewComparison}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-secondary-700 hover:bg-gray-50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          New {isSingleMode ? "Analysis" : "Comparison"}
        </Button>
      </div>

      <ArgumentativeAnalysis
        passageA={passageA}
        passageB={passageB}
        passageATitle={passageATitle}
        passageBTitle={passageBTitle}
        isSingleMode={isSingleMode}
      />
    </div>
  );
}