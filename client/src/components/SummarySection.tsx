import { AnalysisResult } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface SummarySectionProps {
  result: AnalysisResult;
  passageATitle: string;
  passageBTitle: string;
  isSinglePassageMode?: boolean;
}

export default function SummarySection({
  result,
  passageATitle,
  passageBTitle,
  isSinglePassageMode = false,
}: SummarySectionProps) {
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-primary-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-primary-800">Summary</h2>
      </div>
      <CardContent className="p-6">
        {isSinglePassageMode ? (
          // Single Passage Mode - Show single passage with bell curve
          <div className="mb-6">
            <div className="bg-gray-50 p-5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-secondary-800">{passageATitle}</h3>
                <span className="text-sm text-secondary-500">
                  Originality Score: <span className="font-semibold">{result.derivativeIndex.passageA.score.toFixed(1)}</span>/10
                </span>
              </div>
              
              {/* Bell curve style gauge */}
              <div className="mt-4 mb-5 relative w-full h-16">
                <div className="absolute top-0 left-0 w-full h-10 bg-gray-100 rounded-lg"></div>
                
                {/* Bell curve shape */}
                <div className="absolute top-0 left-0 w-full h-10 overflow-hidden">
                  <svg viewBox="0 0 100 30" className="w-full h-10 fill-none">
                    <path
                      d="M0,30 C20,30 20,5 50,5 C80,5 80,30 100,30 Z"
                      fill="rgba(12, 150, 230, 0.1)"
                      stroke="none"
                    />
                    <path
                      d="M0,30 C20,30 20,5 50,5 C80,5 80,30 100,30"
                      stroke="rgba(12, 150, 230, 0.5)"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                </div>
                
                {/* Score indicator */}
                <div 
                  className="absolute top-0 w-1 h-14 bg-primary-600 rounded transition-all" 
                  style={{ 
                    left: `${result.derivativeIndex.passageA.score * 10}%`,
                    transform: 'translateX(-50%)'
                  }}
                ></div>
                <div 
                  className="absolute top-14 bg-white px-2 py-1 text-xs font-semibold text-primary-700 border border-primary-200 rounded shadow-sm transition-all"
                  style={{ 
                    left: `${result.derivativeIndex.passageA.score * 10}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {result.derivativeIndex.passageA.score.toFixed(1)}
                </div>
                
                {/* Labels */}
                <div className="absolute top-0 left-0 mt-11 text-xs text-secondary-500">
                  Common
                </div>
                <div className="absolute top-0 left-1/4 mt-11 text-xs text-secondary-500 transform -translate-x-1/2">
                  Derivative
                </div>
                <div className="absolute top-0 left-1/2 mt-11 text-xs text-secondary-500 transform -translate-x-1/2">
                  Average
                </div>
                <div className="absolute top-0 left-3/4 mt-11 text-xs text-secondary-500 transform -translate-x-1/2">
                  Original
                </div>
                <div className="absolute top-0 right-0 mt-11 text-xs text-secondary-500">
                  Innovative
                </div>
              </div>
              
              {/* Component scores */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-secondary-700 mb-2">Originality Component Scores</h4>
                <div className="space-y-2">
                  {result.derivativeIndex.passageA.components.map((component, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">{component.name}</span>
                      <span className="text-sm font-medium text-secondary-700">{component.score.toFixed(1)}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Comparison Mode - Show both passages
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
        )}
        
        {/* Quality Assessment Summary */}
        {result.coherence && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-secondary-800 mb-3">Quality Assessment</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {/* Calculate aggregate score */}
              {(() => {
                // We're calculating this in summary just like in the detailed tab
                const originalityScore = result.derivativeIndex.passageA.score;
                const coherenceScore = result.coherence.passageA.score;
                
                // Heavier penalty for low coherence than low originality
                let aggregateScore: number;
                
                if (coherenceScore < 3) {
                  // Very incoherent content gets heavily penalized regardless of originality
                  aggregateScore = Math.min(4, (coherenceScore * 0.7) + (originalityScore * 0.3)); 
                } else if (coherenceScore >= 3 && coherenceScore < 6) {
                  // Moderate coherence - weighted blend
                  aggregateScore = (coherenceScore * 0.6) + (originalityScore * 0.4);
                } else {
                  // Good coherence - more balanced weighting
                  aggregateScore = (coherenceScore * 0.5) + (originalityScore * 0.5);
                }
                
                // Quality label
                const qualityLabel = 
                  aggregateScore >= 8 ? 'Excellent Quality' : 
                  aggregateScore >= 6 ? 'Good Quality' : 
                  aggregateScore >= 4 ? 'Fair Quality' : 'Poor Quality';
                
                return (
                  <div className="text-center mb-4">
                    <span className={`inline-block px-3 py-1 rounded-md text-md font-medium border ${
                      aggregateScore >= 8 ? 'bg-green-100 text-green-800 border-green-200' : 
                      aggregateScore >= 6 ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                      aggregateScore >= 4 ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                      'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {qualityLabel}: {aggregateScore.toFixed(1)}/10
                    </span>
                  </div>
                );
              })()}
              
              {/* Display the two component scores */}
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="bg-white p-3 rounded border">
                  <h4 className="text-sm font-medium text-secondary-700 mb-2">Originality</h4>
                  <div className="flex items-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                      <div 
                        className="h-full bg-primary-500" 
                        style={{ width: `${result.derivativeIndex.passageA.score * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{result.derivativeIndex.passageA.score.toFixed(1)}/10</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="text-sm font-medium text-secondary-700 mb-2">Coherence</h4>
                  <div className="flex items-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                      <div 
                        className="h-full bg-success-500" 
                        style={{ width: `${result.coherence.passageA.score * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{result.coherence.passageA.score.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-secondary-600 mt-1">
                <p>The quality score combines originality and coherence, with coherence given slightly more weight.</p>
              </div>
            </div>
          </div>
        )}

        {/* Verdict */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            {isSinglePassageMode ? "Analysis Summary" : "Comparison Verdict"}
          </h3>
          <div className="bg-primary-50 p-4 rounded-md">
            <p className="text-secondary-700">{result.verdict}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
