import { AnalysisResult } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  // Calculate aggregate scores
  const calculateAggregateScore = (originalityScore: number, coherenceScore: number): number => {
    if (coherenceScore < 3) {
      // Very incoherent content gets heavily penalized regardless of originality
      return Math.min(4, (coherenceScore * 0.7) + (originalityScore * 0.3)); 
    } else if (coherenceScore >= 3 && coherenceScore < 6) {
      // Moderate coherence - weighted blend
      return (coherenceScore * 0.6) + (originalityScore * 0.4);
    } else {
      // Good coherence - more balanced weighting
      return (coherenceScore * 0.5) + (originalityScore * 0.5);
    }
  };

  const aggregateScoreA = calculateAggregateScore(
    result.derivativeIndex.passageA.score,
    result.coherence.passageA.score
  );

  const aggregateScoreB = isSinglePassageMode ? 0 : calculateAggregateScore(
    result.derivativeIndex.passageB.score,
    result.coherence.passageB.score
  );

  // Compare passages
  const moreOriginal = isSinglePassageMode ? null : 
    result.derivativeIndex.passageA.score > result.derivativeIndex.passageB.score ? 'A' : 
    result.derivativeIndex.passageB.score > result.derivativeIndex.passageA.score ? 'B' : null;
    
  const moreCoherent = isSinglePassageMode ? null :
    result.coherence.passageA.score > result.coherence.passageB.score ? 'A' : 
    result.coherence.passageB.score > result.coherence.passageA.score ? 'B' : null;

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
          // Comparison Mode - Show both passages in separate boxes with clear labels
          <div className="space-y-6">
            {/* Box 1: Originality Comparison */}
            <div className="border rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-green-50 border-b">
                <h3 className="font-medium text-green-800">Originality Comparison</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Passage A Originality */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-secondary-700">
                      Passage A – Originality Score: {result.derivativeIndex.passageA.score.toFixed(1)}/10
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full ${
                          result.derivativeIndex.passageA.score >= 7 ? 'bg-green-500' : 
                          result.derivativeIndex.passageA.score >= 4 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${result.derivativeIndex.passageA.score * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Passage B Originality */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-secondary-700">
                      Passage B – Originality Score: {result.derivativeIndex.passageB.score.toFixed(1)}/10
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full ${
                          result.derivativeIndex.passageB.score >= 7 ? 'bg-green-500' : 
                          result.derivativeIndex.passageB.score >= 4 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${result.derivativeIndex.passageB.score * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Winner Badge */}
                {moreOriginal && (
                  <div className="flex justify-end">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      Passage {moreOriginal} is more original
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            {/* Box 2: Coherence Comparison */}
            <div className="border rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-blue-50 border-b">
                <h3 className="font-medium text-blue-800">Coherence Comparison</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Passage A Coherence */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-secondary-700">
                      Passage A – Coherence Score: {result.coherence.passageA.score.toFixed(1)}/10
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full ${
                          result.coherence.passageA.score >= 7 ? 'bg-green-500' : 
                          result.coherence.passageA.score >= 4 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${result.coherence.passageA.score * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Passage B Coherence */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-secondary-700">
                      Passage B – Coherence Score: {result.coherence.passageB.score.toFixed(1)}/10
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full ${
                          result.coherence.passageB.score >= 7 ? 'bg-green-500' : 
                          result.coherence.passageB.score >= 4 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${result.coherence.passageB.score * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Winner Badge */}
                {moreCoherent && (
                  <div className="flex justify-end">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Passage {moreCoherent} is more coherent
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            {/* Box 3: Aggregate Evaluation */}
            <div className="border rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-purple-50 border-b">
                <h3 className="font-medium text-purple-800">Overall Quality Assessment</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Passage A Composite */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">
                      Passage A – Composite Score: {aggregateScoreA.toFixed(1)}/10
                    </h4>
                    <div className="flex items-center">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mr-2">
                        <div 
                          className={`h-full ${
                            aggregateScoreA >= 7 ? 'bg-green-500' : 
                            aggregateScoreA >= 4 ? 'bg-amber-500' : 
                            'bg-red-500'
                          } transition-all`}
                          style={{ width: `${aggregateScoreA * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Passage B Composite */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">
                      Passage B – Composite Score: {aggregateScoreB.toFixed(1)}/10
                    </h4>
                    <div className="flex items-center">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mr-2">
                        <div 
                          className={`h-full ${
                            aggregateScoreB >= 7 ? 'bg-green-500' : 
                            aggregateScoreB >= 4 ? 'bg-amber-500' : 
                            'bg-red-500'
                          } transition-all`}
                          style={{ width: `${aggregateScoreB * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-secondary-600 mt-2 bg-gray-100 p-2 rounded">
                  <p>This score weights originality and coherence, with slightly more weight given to coherence.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verdict - Revised to be more structured */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium text-secondary-800 mb-3">
            {isSinglePassageMode ? "Analysis Summary" : "Comparison Verdict"}
          </h3>
          <div className="bg-primary-50 p-4 rounded-md space-y-3">
            {!isSinglePassageMode && (
              <>
                <div>
                  <p className="text-sm font-medium text-secondary-800">Originality:</p> 
                  <p className="text-secondary-700">{
                    result.derivativeIndex.passageA.score > result.derivativeIndex.passageB.score
                      ? `Passage A explores ${passageATitle ? passageATitle + ' ' : ''}more novel concepts, earning a higher originality score.`
                      : result.derivativeIndex.passageB.score > result.derivativeIndex.passageA.score
                      ? `Passage B demonstrates ${passageBTitle ? passageBTitle + ' ' : ''}more conceptual innovation, earning a higher originality score.`
                      : `Both passages demonstrate similar levels of originality in their approach.`
                  }</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-secondary-800">Coherence:</p>
                  <p className="text-secondary-700">{
                    result.coherence.passageA.score > result.coherence.passageB.score
                      ? `Passage A presents ${passageATitle ? passageATitle + ' ' : ''}ideas more cohesively, with better logical flow and clarity.`
                      : result.coherence.passageB.score > result.coherence.passageA.score
                      ? `Passage B structures ${passageBTitle ? passageBTitle + ' ' : ''}arguments more coherently, with superior logical organization.`
                      : `Both passages demonstrate comparable levels of coherence and logical structure.`
                  }</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-secondary-800">Overall:</p>
                  <p className="text-secondary-700">{result.verdict}</p>
                </div>
              </>
            )}
            {isSinglePassageMode && (
              <p className="text-secondary-700">{result.verdict}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
