import { useState } from "react";
import { AnalysisResult, PassageData } from "@/lib/types";
import FrameworkMetricsDisplay from "./FrameworkMetricsDisplay";
import PDFExporter from "./PDFExporter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalysisResultsProps {
  result: AnalysisResult;
  setResult: (result: AnalysisResult) => void;
  passageA: PassageData;
  passageB: PassageData;
  passageATitle: string;
  passageBTitle: string;
  onNewComparison: () => void;
  isSinglePassageMode?: boolean;
  onSendToRewriter?: (text: string, title?: string) => void;
  onSendToHomework?: (text: string) => void;
  analysisType?: "originality" | "cogency" | "intelligence" | "quality";
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
  onSendToRewriter,
  onSendToHomework,
  analysisType = "originality",
}: AnalysisResultsProps) {

  // TXT Download functionality
  const downloadTxtReport = async () => {
    try {
      const endpoint = `/api/download-${analysisType}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisResult: result,
          passageTitle: passageATitle,
          isSinglePassageMode,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${analysisType}-analysis-report.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const getFrameworkTitle = (type: string) => {
    switch (type) {
      case "originality": return "Originality Meter";
      case "cogency": return "Cogency Meter";
      case "intelligence": return "Intelligence Meter";
      case "quality": return "Overall Quality Meter";
      default: return "Analysis Results";
    }
  };

  const getFrameworkDescription = (type: string) => {
    switch (type) {
      case "originality": return "40 parameters measuring transformational synthesis, generative power, and conceptual innovation";
      case "cogency": return "40 parameters measuring argumentative continuity, error resistance, and logical convincingness";
      case "intelligence": return "40 parameters measuring compression capacity, inference architecture, and cognitive sophistication";
      case "quality": return "40 parameters measuring conceptual compression, epistemic friction, and overall scholarly merit";
      default: return "Comprehensive analysis results";
    }
  };

  return (
    <div id="analysis-results-content" className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                {getFrameworkTitle(analysisType)}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {getFrameworkDescription(analysisType)}
              </p>
            </div>
            <div className="flex gap-3">
              <PDFExporter 
                elementId="analysis-results-content"
                filename={`${analysisType}-analysis-${passageATitle || 'document'}`}
                title="Export PDF"
              />
              <Button
                onClick={downloadTxtReport}
                variant="outline"
                className="px-4 py-2"
              >
                Download TXT Report
              </Button>
              <Button 
                variant="outline" 
                onClick={onNewComparison}
                className="px-4 py-2"
              >
                New {isSinglePassageMode ? "Analysis" : "Comparison"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Action Buttons for Improvement */}
      {(onSendToRewriter || onSendToHomework) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3">
              Improve Your Content
            </h3>
            <p className="text-muted-foreground mb-4">
              Based on the analysis, you can enhance your content using our improvement tools:
            </p>
            <div className="flex flex-wrap gap-2">
              {onSendToRewriter && (
                <Button 
                  onClick={() => onSendToRewriter(passageA.text, passageA.title || passageATitle)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Send to Document Rewriter
                </Button>
              )}
              {onSendToHomework && (
                <Button 
                  onClick={() => onSendToHomework(passageA.text)}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Send to Homework Helper
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Framework Metrics Display - Shows all 80 metrics with scores, quotes, and justifications */}
      <FrameworkMetricsDisplay
        result={result}
        analysisType={analysisType}
        isSinglePassageMode={isSinglePassageMode}
      />
    </div>
  );
}