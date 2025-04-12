import { AnalysisResult } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface SummarySectionProps {
  result: AnalysisResult;
  passageATitle: string;
  passageBTitle: string;
}

export default function SummarySection({
  result,
  passageATitle,
  passageBTitle,
}: SummarySectionProps) {
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-primary-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-primary-800">Summary</h2>
      </div>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Passage A Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-secondary-800">{passageATitle}</h3>
              <span className="text-sm text-secondary-500">
                Score: <span className="font-semibold">{result.derivativeIndex.passageA.score.toFixed(1)}</span>/10
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-primary-500" 
                style={{ width: `${result.derivativeIndex.passageA.score * 10}%` }}
              ></div>
            </div>
          </div>
          
          {/* Passage B Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-secondary-800">{passageBTitle}</h3>
              <span className="text-sm text-secondary-500">
                Score: <span className="font-semibold">{result.derivativeIndex.passageB.score.toFixed(1)}</span>/10
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-primary-500" 
                style={{ width: `${result.derivativeIndex.passageB.score * 10}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Verdict */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-secondary-800 mb-2">Verdict</h3>
          <div className="bg-primary-50 p-4 rounded-md">
            <p className="text-secondary-700">{result.verdict}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
