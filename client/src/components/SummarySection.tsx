import { AnalysisResult, StyleOption } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { generateReportFromData } from "@/lib/reportGenerator";

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
  const [verdictTone, setVerdictTone] = useState<StyleOption>('academic');
  // Calculate aggregate scores
  const calculateAggregateScore = (
    originalityScore: number, 
    coherenceScore: number,
    accuracyScore?: number,
    depthScore?: number,
    clarityScore?: number
  ): number => {
    // Get scores with defaults if not provided
    const accuracy = accuracyScore || 5;
    const depth = depthScore || 5;
    const clarity = clarityScore || 5;
    
    // Calculate base score from originality and coherence
    let baseScore = 0;
    if (coherenceScore < 3) {
      // Very incoherent content gets heavily penalized regardless of originality
      baseScore = Math.min(4, (coherenceScore * 0.7) + (originalityScore * 0.3)); 
    } else if (coherenceScore >= 3 && coherenceScore < 6) {
      // Moderate coherence - weighted blend
      baseScore = (coherenceScore * 0.6) + (originalityScore * 0.4);
    } else {
      // Good coherence - more balanced weighting
      baseScore = (coherenceScore * 0.5) + (originalityScore * 0.5);
    }
    
    // New comprehensive score calculation with all five metrics
    // Originality (30%), Coherence (20%), Accuracy (20%), Depth (15%), Clarity (15%)
    return (originalityScore * 0.3) + (coherenceScore * 0.2) + 
           (accuracy * 0.2) + (depth * 0.15) + (clarity * 0.15);
  };

  const aggregateScoreA = calculateAggregateScore(
    result.derivativeIndex.passageA.score,
    result.coherence.passageA.score,
    result.accuracy?.passageA?.score,
    result.depth?.passageA?.score,
    result.clarity?.passageA?.score
  );

  const aggregateScoreB = isSinglePassageMode ? 0 : calculateAggregateScore(
    result.derivativeIndex.passageB.score,
    result.coherence.passageB.score,
    result.accuracy?.passageB?.score,
    result.depth?.passageB?.score,
    result.clarity?.passageB?.score
  );

  // Compare passages
  const moreOriginal = isSinglePassageMode ? null : 
    result.derivativeIndex.passageA.score > result.derivativeIndex.passageB.score ? 'A' : 
    result.derivativeIndex.passageB.score > result.derivativeIndex.passageA.score ? 'B' : null;
    
  const moreCoherent = isSinglePassageMode ? null :
    result.coherence.passageA.score > result.coherence.passageB.score ? 'A' : 
    result.coherence.passageB.score > result.coherence.passageA.score ? 'B' : null;
    
  // For metrics that may be undefined, we use fallback values
  const getScoreA = (metric: 'accuracy' | 'depth' | 'clarity'): number => {
    if (!result[metric]) return 0;
    return result[metric]?.passageA?.score ?? 0;
  };
  
  const getScoreB = (metric: 'accuracy' | 'depth' | 'clarity'): number => {
    if (!result[metric]) return 0;
    return result[metric]?.passageB?.score ?? 0; 
  };
  
  const moreAccurate = isSinglePassageMode || !result.accuracy ? null :
    getScoreA('accuracy') > getScoreB('accuracy') ? 'A' : 
    getScoreB('accuracy') > getScoreA('accuracy') ? 'B' : null;
    
  const moreDepth = isSinglePassageMode || !result.depth ? null :
    getScoreA('depth') > getScoreB('depth') ? 'A' : 
    getScoreB('depth') > getScoreA('depth') ? 'B' : null;
    
  const moreClear = isSinglePassageMode || !result.clarity ? null :
    getScoreA('clarity') > getScoreB('clarity') ? 'A' : 
    getScoreB('clarity') > getScoreA('clarity') ? 'B' : null;

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-primary-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-primary-800">Summary</h2>
      </div>
      <CardContent className="p-6">
        {isSinglePassageMode ? (
          // Single Passage Mode - Show single passage with bell curve
          <div className="mb-6">
            {/* Aggregate Quality Score - Large and Prominent Display */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-5 mb-5 border border-primary-200 shadow-sm">
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-primary-800 mb-2">Overall Quality Score</h3>
                <div className="flex items-center justify-center">
                  <div className={`text-4xl font-bold ${
                    aggregateScoreA >= 8 ? 'text-green-600' : 
                    aggregateScoreA >= 6 ? 'text-green-500' : 
                    aggregateScoreA >= 4 ? 'text-amber-500' : 
                    'text-red-500'
                  }`}>
                    {aggregateScoreA.toFixed(1)}
                  </div>
                  <div className="text-xl text-secondary-500 ml-1">/10</div>
                </div>
                <div className="text-sm text-secondary-600 text-center mt-2">
                  Combines originality, coherence, accuracy, depth and clarity metrics
                </div>
                
                {/* Score bar visualization */}
                <div className="w-full max-w-md mt-3">
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full ${
                        aggregateScoreA >= 8 ? 'bg-green-600' : 
                        aggregateScoreA >= 6 ? 'bg-green-500' : 
                        aggregateScoreA >= 4 ? 'bg-amber-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${aggregateScoreA * 10}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-secondary-500 mt-1">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-secondary-800">{passageATitle}</h3>
                <span className="text-sm text-secondary-500">
                  Originality Score: <span className="font-semibold">{result.derivativeIndex.passageA.score.toFixed(1)}</span>/10
                </span>
              </div>
              
              {/* Score bar with proper visualization */}
              <div className="mt-4 mb-10 relative w-full">
                {/* Score bar container */}
                <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden mb-1">
                  {/* Gradient background to show scale */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-600"></div>
                  
                  {/* Actual score fill */}
                  <div 
                    className={`absolute top-0 left-0 h-full ${
                      result.derivativeIndex.passageA.score > 8.4 ? 'bg-green-600' : 
                      result.derivativeIndex.passageA.score > 6.9 ? 'bg-green-500' : 
                      result.derivativeIndex.passageA.score > 3.9 ? 'bg-amber-500' : 
                      'bg-red-500'
                    } transition-all flex items-center justify-end pr-2`}
                    style={{ width: `${result.derivativeIndex.passageA.score * 10}%` }}
                  >
                    <span className="text-white text-xs font-bold">
                      {result.derivativeIndex.passageA.score.toFixed(1)}
                    </span>
                  </div>
                  
                  {/* Vertical markers for scale */}
                  <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white bg-opacity-70"></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white bg-opacity-70"></div>
                  <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white bg-opacity-70"></div>
                  
                  {/* Score indicator marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-md" 
                    style={{ 
                      left: `${result.derivativeIndex.passageA.score * 10}%`,
                      zIndex: 5
                    }}
                  ></div>
                </div>
                
                {/* Score tooltip - positioned above the score marker */}
                <div 
                  className="absolute -top-6 bg-white px-2 py-1 text-xs font-semibold text-primary-700 border border-primary-200 rounded-lg shadow-sm"
                  style={{ 
                    left: `${result.derivativeIndex.passageA.score * 10}%`,
                    transform: 'translateX(-50%)',
                    zIndex: 10
                  }}
                  title="Originality is calculated using conceptual innovation, methodological novelty, and contextual application"
                >
                  {result.derivativeIndex.passageA.score.toFixed(1)}/10
                </div>
                
                {/* Labels */}
                <div className="flex justify-between text-xs text-secondary-600 px-1 mt-1">
                  <div>Derivative</div>
                  <div>Average</div>
                  <div>Original</div>
                  <div>Innovative</div>
                </div>
                
                {/* Tooltip explanation */}
                <div className="mt-3 text-xs text-secondary-500 bg-gray-50 p-2 rounded-md">
                  Originality is calculated using conceptual innovation, methodological novelty, and contextual application. Higher scores indicate greater semantic distance from conventional texts.
                </div>
              </div>
              
              {/* Component scores with visual bars */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-secondary-700 mb-3">Originality Component Scores</h4>
                <div className="space-y-3">
                  {result.derivativeIndex.passageA.components.map((component, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div 
                          className="text-sm text-secondary-600 cursor-help"
                          title={`${component.name}: Evaluates how this passage introduces or reinvents concepts in its field`}
                        >
                          {component.name}
                        </div>
                        <span className={`text-sm font-medium ${
                          component.score > 8.4 ? 'text-green-600' : 
                          component.score > 6.9 ? 'text-green-500' : 
                          component.score > 3.9 ? 'text-amber-500' : 
                          'text-red-500'
                        }`}>
                          {component.score.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${
                            component.score > 8.4 ? 'bg-green-600' : 
                            component.score > 6.9 ? 'bg-green-500' : 
                            component.score > 3.9 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${component.score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Comparison Mode - Show both passages in separate boxes with clear labels
          <div className="space-y-6">
            {/* Aggregate Quality Score Comparison - Large Display */}
            <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-5 border border-primary-200 shadow-sm">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-primary-800 mb-2 text-center">Overall Quality: Passage A</h3>
                  <div className="flex items-center justify-center">
                    <div className={`text-4xl font-bold ${
                      aggregateScoreA >= 8 ? 'text-green-600' : 
                      aggregateScoreA >= 6 ? 'text-green-500' : 
                      aggregateScoreA >= 4 ? 'text-amber-500' : 
                      'text-red-500'
                    }`}>
                      {aggregateScoreA.toFixed(1)}
                    </div>
                    <div className="text-xl text-secondary-500 ml-1">/10</div>
                  </div>
                  
                  {/* Score bar visualization */}
                  <div className="w-full mt-3">
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full ${
                          aggregateScoreA >= 8 ? 'bg-green-600' : 
                          aggregateScoreA >= 6 ? 'bg-green-500' : 
                          aggregateScoreA >= 4 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${aggregateScoreA * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-5 border border-primary-200 shadow-sm">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-primary-800 mb-2 text-center">Overall Quality: Passage B</h3>
                  <div className="flex items-center justify-center">
                    <div className={`text-4xl font-bold ${
                      aggregateScoreB >= 8 ? 'text-green-600' : 
                      aggregateScoreB >= 6 ? 'text-green-500' : 
                      aggregateScoreB >= 4 ? 'text-amber-500' : 
                      'text-red-500'
                    }`}>
                      {aggregateScoreB.toFixed(1)}
                    </div>
                    <div className="text-xl text-secondary-500 ml-1">/10</div>
                  </div>
                  
                  {/* Score bar visualization */}
                  <div className="w-full mt-3">
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full ${
                          aggregateScoreB >= 8 ? 'bg-green-600' : 
                          aggregateScoreB >= 6 ? 'bg-green-500' : 
                          aggregateScoreB >= 4 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${aggregateScoreB * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 text-xs text-center text-secondary-600">
                Combines originality (30%), coherence (20%), accuracy (20%), depth (15%) and clarity (15%)
              </div>
            </div>
            
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
            
            {/* Box 3: Accuracy Comparison */}
            {result.accuracy && (
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-indigo-50 border-b">
                  <h3 className="font-medium text-indigo-800">Accuracy Comparison</h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* Passage A Accuracy */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-secondary-700">
                        Passage A – Accuracy Score: {result.accuracy.passageA.score.toFixed(1)}/10
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${
                            result.accuracy.passageA.score >= 7 ? 'bg-green-500' : 
                            result.accuracy.passageA.score >= 4 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${result.accuracy.passageA.score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Passage B Accuracy */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-secondary-700">
                        Passage B – Accuracy Score: {result.accuracy.passageB.score.toFixed(1)}/10
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${
                            result.accuracy.passageB.score >= 7 ? 'bg-green-500' : 
                            result.accuracy.passageB.score >= 4 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${result.accuracy.passageB.score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Winner Badge */}
                  {moreAccurate && (
                    <div className="flex justify-end">
                      <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                        Passage {moreAccurate} is more accurate
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Box 4: Depth Comparison */}
            {result.depth && (
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-amber-50 border-b">
                  <h3 className="font-medium text-amber-800">Depth Comparison</h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* Passage A Depth */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-secondary-700">
                        Passage A – Depth Score: {result.depth.passageA.score.toFixed(1)}/10
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${
                            result.depth.passageA.score >= 7 ? 'bg-green-500' : 
                            result.depth.passageA.score >= 4 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${result.depth.passageA.score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Passage B Depth */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-secondary-700">
                        Passage B – Depth Score: {result.depth.passageB.score.toFixed(1)}/10
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${
                            result.depth.passageB.score >= 7 ? 'bg-green-500' : 
                            result.depth.passageB.score >= 4 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${result.depth.passageB.score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Winner Badge */}
                  {moreDepth && (
                    <div className="flex justify-end">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                        Passage {moreDepth} has more depth
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Box 5: Clarity Comparison */}
            {result.clarity && (
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-teal-50 border-b">
                  <h3 className="font-medium text-teal-800">Clarity Comparison</h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* Passage A Clarity */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-secondary-700">
                        Passage A – Clarity Score: {result.clarity.passageA.score.toFixed(1)}/10
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${
                            result.clarity.passageA.score >= 7 ? 'bg-green-500' : 
                            result.clarity.passageA.score >= 4 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${result.clarity.passageA.score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Passage B Clarity */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-secondary-700">
                        Passage B – Clarity Score: {result.clarity.passageB.score.toFixed(1)}/10
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${
                            result.clarity.passageB.score >= 7 ? 'bg-green-500' : 
                            result.clarity.passageB.score >= 4 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${result.clarity.passageB.score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Winner Badge */}
                  {moreClear && (
                    <div className="flex justify-end">
                      <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">
                        Passage {moreClear} is clearer
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
            
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

        {/* Enhanced Comparison Verdict Section */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-secondary-800">
              {isSinglePassageMode ? "Analysis Summary" : "Comparison Verdict"}
            </h3>
            
            {!isSinglePassageMode && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary-600">Tone:</span>
                <Select value={verdictTone} onValueChange={(value) => setVerdictTone(value as StyleOption)}>
                  <SelectTrigger className="w-[180px] h-8 text-sm">
                    <SelectValue placeholder="Select Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic / Formal</SelectItem>
                    <SelectItem value="keep-voice">Clear & Plain-English</SelectItem>
                    <SelectItem value="punchy">Short & Punchy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            {!isSinglePassageMode && (
              <>
                {/* Header bar */}
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="font-medium text-slate-800">Detailed Comparative Analysis</h4>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => {
                        const verdict = document.getElementById('verdict-content');
                        if (verdict) {
                          navigator.clipboard.writeText(verdict.innerText);
                        }
                      }}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      <span className="text-xs">Copy</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => generateReportFromData(result, passageATitle, passageBTitle, isSinglePassageMode)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      <span className="text-xs">Download</span>
                    </Button>
                  </div>
                </div>
                
                {/* Verdict content */}
                <div id="verdict-content" className="p-5 space-y-4">
                  {/* Originality */}
                  <div>
                    <h5 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-1 mb-2">Originality</h5>
                    <p className="text-slate-700 leading-relaxed">
                      {verdictTone === 'academic' && `Passage ${moreOriginal || 'A'} scored ${moreOriginal === 'A' ? result.derivativeIndex.passageA.score.toFixed(1) : result.derivativeIndex.passageB.score.toFixed(1)} in originality, demonstrating ${
                        result.derivativeIndex.passageA.score > result.derivativeIndex.passageB.score
                        ? `a more sophisticated intellectual framework compared to Passage B (${result.derivativeIndex.passageB.score.toFixed(1)}). The primary distinction lies in ${passageATitle}'s willingness to engage with conceptual terrain that extends beyond established paradigms.`
                        : `greater conceptual innovation compared to Passage A (${result.derivativeIndex.passageA.score.toFixed(1)}). The distinguishing factor is ${passageBTitle}'s approach to reframing key concepts in a manner that challenges conventional understanding.`
                      }`}
                      
                      {verdictTone === 'keep-voice' && `Passage ${moreOriginal || 'A'} is more original (scoring ${moreOriginal === 'A' ? result.derivativeIndex.passageA.score.toFixed(1) : result.derivativeIndex.passageB.score.toFixed(1)}) because it ${
                        result.derivativeIndex.passageA.score > result.derivativeIndex.passageB.score
                        ? `introduces fresher ideas and perspectives compared to Passage B (${result.derivativeIndex.passageB.score.toFixed(1)}). The main difference is that ${passageATitle || 'Passage A'} explores concepts that feel less familiar and more thought-provoking.`
                        : `presents more innovative thinking compared to Passage A (${result.derivativeIndex.passageA.score.toFixed(1)}). What stands out is how ${passageBTitle || 'Passage B'} takes standard ideas but presents them in new, unexpected ways.`
                      }`}
                      
                      {verdictTone === 'punchy' && `Passage ${moreOriginal || 'A'}: ${moreOriginal === 'A' ? result.derivativeIndex.passageA.score.toFixed(1) : result.derivativeIndex.passageB.score.toFixed(1)}/10. ${
                        result.derivativeIndex.passageA.score > result.derivativeIndex.passageB.score
                        ? `Bolder, fresher, less derivative than B (${result.derivativeIndex.passageB.score.toFixed(1)}). Breaks new ground while B treads familiar territory.`
                        : `Innovative approach outshines A's conventionality (${result.derivativeIndex.passageA.score.toFixed(1)}). B dares to reimagine; A plays it safe.`
                      }`}
                    </p>
                  </div>
                  
                  {/* Coherence */}
                  <div>
                    <h5 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-1 mb-2">Coherence</h5>
                    <p className="text-slate-700 leading-relaxed">
                      {verdictTone === 'academic' && `Passage ${moreCoherent || 'A'} demonstrated superior coherence (${moreCoherent === 'A' ? result.coherence.passageA.score.toFixed(1) : result.coherence.passageB.score.toFixed(1)}/10), ${
                        result.coherence.passageA.score > result.coherence.passageB.score
                        ? `with a more logically structured argument compared to Passage B (${result.coherence.passageB.score.toFixed(1)}). ${passageATitle || 'Passage A'} exhibits stronger internal consistency, with premises that support conclusions in a more disciplined manner.`
                        : `presenting a more methodical development of ideas than Passage A (${result.coherence.passageA.score.toFixed(1)}). ${passageBTitle || 'Passage B'} maintains clearer transitions between concepts and employs more precise terminology throughout.`
                      }`}
                      
                      {verdictTone === 'keep-voice' && `Passage ${moreCoherent || 'A'} is more coherent (${moreCoherent === 'A' ? result.coherence.passageA.score.toFixed(1) : result.coherence.passageB.score.toFixed(1)}/10) because ${
                        result.coherence.passageA.score > result.coherence.passageB.score
                        ? `it's easier to follow than Passage B (${result.coherence.passageB.score.toFixed(1)}). The ideas connect better, and the overall structure makes more sense. There's less jumping between topics, and the main points build on each other naturally.`
                        : `it flows more smoothly than Passage A (${result.coherence.passageA.score.toFixed(1)}). The organization is clearer, and it's easier to see how each part relates to the whole. The argument is laid out step-by-step without confusing detours.`
                      }`}
                      
                      {verdictTone === 'punchy' && `Passage ${moreCoherent || 'A'}: ${moreCoherent === 'A' ? result.coherence.passageA.score.toFixed(1) : result.coherence.passageB.score.toFixed(1)}/10. ${
                        result.coherence.passageA.score > result.coherence.passageB.score
                        ? `Crystal clear compared to B's ${result.coherence.passageB.score.toFixed(1)}. Tight logic, precise flow. B wanders; A marches forward.`
                        : `Sharp and focused versus A's muddled ${result.coherence.passageA.score.toFixed(1)}. B stays on point; A meanders between ideas.`
                      }`}
                    </p>
                  </div>
                  
                  {/* Overall Assessment */}
                  <div>
                    <h5 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-1 mb-2">Overall Assessment</h5>
                    <p className="text-slate-700 leading-relaxed">
                      {verdictTone === 'academic' && `Considering both metrics, ${
                        aggregateScoreA > aggregateScoreB
                        ? `Passage A emerges as the superior text with a composite score of ${aggregateScoreA.toFixed(1)}/10 compared to Passage B's ${aggregateScoreB.toFixed(1)}/10. While ${result.derivativeIndex.passageB.score > result.derivativeIndex.passageA.score ? 'B exhibits greater originality' : 'both show comparable originality'}, A's structural integrity and logical coherence elevate its overall scholarly value.`
                        : aggregateScoreB > aggregateScoreA
                        ? `Passage B demonstrates greater overall quality with a composite score of ${aggregateScoreB.toFixed(1)}/10 compared to Passage A's ${aggregateScoreA.toFixed(1)}/10. B successfully balances ${result.derivativeIndex.passageB.score > result.derivativeIndex.passageA.score ? 'superior originality' : 'strong originality'} with ${result.coherence.passageB.score > result.coherence.passageA.score ? 'exceptional coherence' : 'solid coherence'}.`
                        : `both passages demonstrate equivalent overall quality, each scoring ${aggregateScoreA.toFixed(1)}/10. However, they achieve this through different strengths: Passage ${moreOriginal || 'A'} excels in originality while Passage ${moreCoherent || 'B'} demonstrates superior coherence. This illustrates how equally valuable scholarship can emerge from different intellectual approaches.`
                      }`}
                      
                      {verdictTone === 'keep-voice' && `Looking at both originality and coherence together, ${
                        aggregateScoreA > aggregateScoreB
                        ? `Passage A is overall better with a score of ${aggregateScoreA.toFixed(1)}/10 compared to Passage B's ${aggregateScoreB.toFixed(1)}/10. The main reason is that ${result.coherence.passageA.score > result.coherence.passageB.score ? 'A is much easier to follow' : 'A has a better balance of new ideas and clear writing'}.`
                        : aggregateScoreB > aggregateScoreA
                        ? `Passage B comes out on top with a score of ${aggregateScoreB.toFixed(1)}/10, while Passage A scores ${aggregateScoreA.toFixed(1)}/10. B succeeds because it ${result.derivativeIndex.passageB.score > result.derivativeIndex.passageA.score ? 'brings fresher ideas to the table' : 'combines solid ideas with clear organization'}.`
                        : `both passages are equally strong overall, with identical scores of ${aggregateScoreA.toFixed(1)}/10. They just have different strengths - Passage ${moreOriginal || 'A'} is more original, while Passage ${moreCoherent || 'B'} is easier to follow. This shows there's more than one way to write effectively.`
                      }`}
                      
                      {verdictTone === 'punchy' && (
                        aggregateScoreA > aggregateScoreB
                        ? `Final verdict: A wins (${aggregateScoreA.toFixed(1)} vs ${aggregateScoreB.toFixed(1)}). ${result.coherence.passageA.score > result.coherence.passageB.score ? "Superior structure trumps B's ambition" : "Better balanced, more complete package"}. Read A for substance, B for inspiration.`
                        : aggregateScoreB > aggregateScoreA
                        ? `Final verdict: B takes it (${aggregateScoreB.toFixed(1)} vs ${aggregateScoreA.toFixed(1)}). ${result.derivativeIndex.passageB.score > result.derivativeIndex.passageA.score ? "Fresh thinking beats familiar clarity" : "Sharper execution, more compelling overall"}. A plays it safe; B takes the prize.`
                        : `Final verdict: Dead heat: both ${aggregateScoreA.toFixed(1)}/10. A brings ${result.derivativeIndex.passageA.score > result.derivativeIndex.passageB.score ? "originality" : "coherence"}, B delivers ${result.coherence.passageB.score > result.coherence.passageA.score ? "clarity" : "innovation"}. Different paths, same destination.`
                      )}
                    </p>
                  </div>
                  
                  {/* Optional additional verdict from API */}
                  {result.verdict && (
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <p className="text-slate-600 italic">{result.verdict}</p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {isSinglePassageMode && (
              <div className="p-5">
                <p className="text-secondary-700">{result.verdict}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
