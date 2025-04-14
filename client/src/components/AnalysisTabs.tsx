import { useState } from "react";
import { AnalysisResult, PassageData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import FeedbackForm from "./FeedbackForm";

interface AnalysisTabsProps {
  result: AnalysisResult;
  setResult: (result: AnalysisResult) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  passageA: PassageData;
  passageB: PassageData;
  passageATitle: string;
  passageBTitle: string;
  isSinglePassageMode?: boolean;
}

export default function AnalysisTabs({
  result,
  setResult,
  activeTab,
  setActiveTab,
  passageA,
  passageB,
  passageATitle,
  passageBTitle,
  isSinglePassageMode = false,
}: AnalysisTabsProps) {
  const [viewType, setViewType] = useState<'label' | 'grid'>('label');
  const [emphasisOption, setEmphasisOption] = useState<'clarity' | 'novelty' | 'balanced'>('clarity');
  const tabs = [
    { id: "conceptual-lineage", label: "Conceptual Lineage" },
    { id: "semantic-distance", label: "Semantic Distance" },
    { id: "novelty-heatmap", label: "Novelty Heatmap" },
    { id: "derivative-index", label: "Derivative Index" },
    { id: "parasite-detection", label: "Parasite Detection" },
    { id: "coherence", label: "Coherence" },
  ];

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-4 text-center border-b-2 font-medium text-sm whitespace-nowrap min-w-max transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-secondary-500 hover:text-secondary-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <CardContent className="p-6">
        {/* Conceptual Lineage */}
        {activeTab === "conceptual-lineage" && (
          <div>
            <div className={`grid grid-cols-1 ${isSinglePassageMode ? "" : "md:grid-cols-2"} gap-8`}>
              <div>
                <h3 className="text-lg font-medium text-secondary-800 mb-4">{passageATitle} Conceptual Lineage</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-secondary-700 mb-1">Primary Influences</h4>
                    <p className="text-secondary-600">{result.conceptualLineage.passageA.primaryInfluences}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-secondary-700 mb-1">Intellectual Trajectory</h4>
                    <p className="text-secondary-600">{result.conceptualLineage.passageA.intellectualTrajectory}</p>
                  </div>
                </div>
              </div>
              
              {!isSinglePassageMode && (
                <div>
                  <h3 className="text-lg font-medium text-secondary-800 mb-4">{passageBTitle} Conceptual Lineage</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h4 className="font-medium text-secondary-700 mb-1">Primary Influences</h4>
                      <p className="text-secondary-600">{result.conceptualLineage.passageB.primaryInfluences}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h4 className="font-medium text-secondary-700 mb-1">Intellectual Trajectory</h4>
                      <p className="text-secondary-600">{result.conceptualLineage.passageB.intellectualTrajectory}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Feedback Form for Conceptual Lineage */}
            <FeedbackForm
              category="conceptualLineage"
              categoryName="Conceptual Lineage"
              result={result}
              passageA={passageA}
              passageB={passageB}
              isSinglePassageMode={isSinglePassageMode}
              onFeedbackProcessed={setResult}
            />
          </div>
        )}

        {/* Semantic Distance */}
        {activeTab === "semantic-distance" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-800 mb-2">Semantic Distance Analysis</h3>
              <p className="text-secondary-600">
                {isSinglePassageMode 
                  ? "Measuring how far the passage moves from common conceptual norms and establishes new territory."
                  : "Measuring how far each passage moves from its conceptual predecessors and establishes new territory."
                }
              </p>
            </div>
            
            <div className={`grid grid-cols-1 ${isSinglePassageMode ? "" : "md:grid-cols-2"} gap-8`}>
              <div className="bg-gray-50 p-5 rounded-lg">
                <h4 className="font-medium text-secondary-700 mb-4">
                  {isSinglePassageMode ? "Semantic Distance from Norm" : "Distance Comparison"}
                </h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-secondary-700">{passageATitle}</span>
                      <span className="text-sm text-secondary-500">{result.semanticDistance.passageA.label}</span>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500" 
                        style={{ width: `${result.semanticDistance.passageA.distance}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {!isSinglePassageMode && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-secondary-700">{passageBTitle}</span>
                        <span className="text-sm text-secondary-500">{result.semanticDistance.passageB.label}</span>
                      </div>
                      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500" 
                          style={{ width: `${result.semanticDistance.passageB.distance}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-secondary-700 mb-1">Key Findings</h4>
                  <ul className="list-disc pl-5 text-secondary-600 space-y-2">
                    {result.semanticDistance.keyFindings.map((finding, index) => (
                      <li key={index}>{finding}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-secondary-700 mb-1">Semantic Innovation</h4>
                  <p className="text-secondary-600">{result.semanticDistance.semanticInnovation}</p>
                </div>
              </div>
            </div>
            
            {/* Feedback Form for Semantic Distance */}
            <FeedbackForm
              category="semanticDistance"
              categoryName="Semantic Distance"
              result={result}
              passageA={passageA}
              passageB={passageB}
              isSinglePassageMode={isSinglePassageMode}
              onFeedbackProcessed={setResult}
            />
          </div>
        )}

        {/* Novelty Heatmap */}
        {activeTab === "novelty-heatmap" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-800 mb-2">Novelty Heatmap</h3>
              <p className="text-secondary-600">
                {isSinglePassageMode
                  ? "Visualizing where conceptual originality is concentrated in the passage."
                  : "Visualizing where conceptual originality is concentrated in each passage."
                }
              </p>
            </div>
            
            <div className={`grid grid-cols-1 ${isSinglePassageMode ? "" : "md:grid-cols-2"} gap-8`}>
              <div>
                <h4 className="font-medium text-secondary-700 mb-3">{passageATitle}</h4>
                <div className="space-y-3">
                  {result.noveltyHeatmap.passageA.map((paragraph, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-md" 
                      style={{ backgroundColor: `rgba(12, 150, 230, ${paragraph.heat / 100 * 0.5})` }}
                    >
                      <p className="text-secondary-700 text-sm">{paragraph.content}</p>
                      <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${paragraph.heat > 60 ? 'bg-primary-600' : paragraph.heat > 40 ? 'bg-primary-500' : 'bg-primary-400'}`} 
                          style={{ width: `${paragraph.heat}%` }}
                        ></div>
                      </div>
                      {paragraph.quote && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <blockquote className="text-secondary-700 italic text-sm pl-2 border-l-2 border-primary-400">
                            "{paragraph.quote}"
                          </blockquote>
                          {paragraph.explanation && (
                            <p className="mt-1 text-xs text-secondary-600">{paragraph.explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {!isSinglePassageMode && (
                <div>
                  <h4 className="font-medium text-secondary-700 mb-3">{passageBTitle}</h4>
                  <div className="space-y-3">
                    {result.noveltyHeatmap.passageB.map((paragraph, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-md" 
                        style={{ backgroundColor: `rgba(12, 150, 230, ${paragraph.heat / 100 * 0.5})` }}
                      >
                        <p className="text-secondary-700 text-sm">{paragraph.content}</p>
                        <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${paragraph.heat > 60 ? 'bg-primary-600' : paragraph.heat > 40 ? 'bg-primary-500' : 'bg-primary-400'}`} 
                            style={{ width: `${paragraph.heat}%` }}
                          ></div>
                        </div>
                        {paragraph.quote && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <blockquote className="text-secondary-700 italic text-sm pl-2 border-l-2 border-primary-400">
                              "{paragraph.quote}"
                            </blockquote>
                            {paragraph.explanation && (
                              <p className="mt-1 text-xs text-secondary-600">{paragraph.explanation}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Feedback Form for Novelty Heatmap */}
            <FeedbackForm
              category="noveltyHeatmap"
              categoryName="Novelty Heatmap"
              result={result}
              passageA={passageA}
              passageB={passageB}
              isSinglePassageMode={isSinglePassageMode}
              onFeedbackProcessed={setResult}
            />
          </div>
        )}

        {/* Derivative Index */}
        {activeTab === "derivative-index" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-800 mb-2">Derivative Index</h3>
              <p className="text-secondary-600">
                {isSinglePassageMode
                  ? "A comprehensive score from 0 (entirely derivative) to 10 (wholly original) for the passage."
                  : "A comprehensive score from 0 (entirely derivative) to 10 (wholly original) for each passage."
                }
              </p>
            </div>
            
            <div className={`grid grid-cols-1 ${isSinglePassageMode ? "" : "md:grid-cols-2"} gap-8`}>
              <div>
                <h4 className="font-medium text-secondary-700 mb-3">{passageATitle}</h4>
                <div className="bg-gray-50 p-5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-secondary-500">Derivative</span>
                    <span className="text-sm font-semibold text-primary-700">{result.derivativeIndex.passageA.score.toFixed(1)}/10</span>
                    <span className="text-xs text-secondary-500">Original</span>
                  </div>
                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div 
                      className="absolute top-0 bottom-0 left-0 flex items-center justify-center bg-primary-600 text-white text-xs font-medium" 
                      style={{ width: `${result.derivativeIndex.passageA.score * 10}%` }}
                    >
                      {result.derivativeIndex.passageA.score.toFixed(1)}
                    </div>
                  </div>
                  <h5 className="font-medium text-secondary-700 text-sm mb-2">Component Scores:</h5>
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
              
              {!isSinglePassageMode && (
                <div>
                  <h4 className="font-medium text-secondary-700 mb-3">{passageBTitle}</h4>
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-secondary-500">Derivative</span>
                      <span className="text-sm font-semibold text-primary-700">{result.derivativeIndex.passageB.score.toFixed(1)}/10</span>
                      <span className="text-xs text-secondary-500">Original</span>
                    </div>
                    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden mb-4">
                      <div 
                        className="absolute top-0 bottom-0 left-0 flex items-center justify-center bg-primary-600 text-white text-xs font-medium" 
                        style={{ width: `${result.derivativeIndex.passageB.score * 10}%` }}
                      >
                        {result.derivativeIndex.passageB.score.toFixed(1)}
                      </div>
                    </div>
                    <h5 className="font-medium text-secondary-700 text-sm mb-2">Component Scores:</h5>
                    <div className="space-y-2">
                      {result.derivativeIndex.passageB.components.map((component, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-secondary-600">{component.name}</span>
                          <span className="text-sm font-medium text-secondary-700">{component.score.toFixed(1)}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Feedback Form for Derivative Index */}
            <FeedbackForm
              category="derivativeIndex"
              categoryName="Derivative Index"
              result={result}
              passageA={passageA}
              passageB={passageB}
              isSinglePassageMode={isSinglePassageMode}
              onFeedbackProcessed={setResult}
            />
          </div>
        )}

        {/* Parasite Detection */}
        {activeTab === "parasite-detection" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-800 mb-2">Conceptual Parasite Detection</h3>
              <p className="text-secondary-600">
                {isSinglePassageMode
                  ? "Identifying if the passage operates within existing debates without adding original contributions."
                  : "Identifying passages that operate within existing debates without adding original contributions."
                }
              </p>
            </div>
            
            <div className={`grid grid-cols-1 ${isSinglePassageMode ? "" : "md:grid-cols-2"} gap-8`}>
              <div>
                <h4 className="font-medium text-secondary-700 mb-3">{passageATitle}</h4>
                <div className="bg-gray-50 p-5 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div 
                      className={`h-3 w-3 rounded-full ${
                        result.conceptualParasite.passageA.level === "High" ? "bg-warning-600" : 
                        result.conceptualParasite.passageA.level === "Moderate" ? "bg-warning-500" : 
                        "bg-warning-400"
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-secondary-700">
                      {result.conceptualParasite.passageA.level} Parasite Index
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-secondary-700 mb-1">Detected Parasitic Elements:</h5>
                      <ul className="list-disc pl-5 text-secondary-600 text-sm space-y-1">
                        {result.conceptualParasite.passageA.elements.map((element, index) => (
                          <li key={index}>{element}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-secondary-700 mb-1">Overall Assessment:</h5>
                      <p className="text-sm text-secondary-600">{result.conceptualParasite.passageA.assessment}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {!isSinglePassageMode && (
                <div>
                  <h4 className="font-medium text-secondary-700 mb-3">{passageBTitle}</h4>
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex items-center space-x-2 mb-4">
                      <div 
                        className={`h-3 w-3 rounded-full ${
                          result.conceptualParasite.passageB.level === "High" ? "bg-warning-600" : 
                          result.conceptualParasite.passageB.level === "Moderate" ? "bg-warning-500" : 
                          "bg-warning-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-secondary-700">
                        {result.conceptualParasite.passageB.level} Parasite Index
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-secondary-700 mb-1">Detected Parasitic Elements:</h5>
                        <ul className="list-disc pl-5 text-secondary-600 text-sm space-y-1">
                          {result.conceptualParasite.passageB.elements.map((element, index) => (
                            <li key={index}>{element}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-secondary-700 mb-1">Overall Assessment:</h5>
                        <p className="text-sm text-secondary-600">{result.conceptualParasite.passageB.assessment}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Feedback Form for Conceptual Parasite */}
            <FeedbackForm
              category="conceptualParasite"
              categoryName="Conceptual Parasite Detection"
              result={result}
              passageA={passageA}
              passageB={passageB}
              isSinglePassageMode={isSinglePassageMode}
              onFeedbackProcessed={setResult}
            />
          </div>
        )}

        {/* Coherence */}
        {activeTab === "coherence" && result.coherence && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-800 mb-2">Coherence Analysis</h3>
              <p className="text-secondary-600">
                {isSinglePassageMode
                  ? "Evaluating the logical and conceptual coherence of the passage, regardless of originality."
                  : "Evaluating the logical and conceptual coherence of each passage, regardless of originality."
                }
              </p>
            </div>
            
            <div className={`grid grid-cols-1 ${isSinglePassageMode ? "" : "md:grid-cols-2"} gap-8 mb-6`}>
              <div>
                <h4 className="font-medium text-secondary-700 mb-3">{passageATitle}</h4>
                <div className="bg-gray-50 p-5 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-secondary-700">Coherence Score</span>
                    <span className="text-sm font-semibold text-primary-700">
                      {result.coherence.passageA.score.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div 
                      className="absolute top-0 bottom-0 left-0 flex items-center justify-center bg-primary-600 text-white text-xs font-medium" 
                      style={{ width: `${result.coherence.passageA.score * 10}%` }}
                    >
                      {result.coherence.passageA.score.toFixed(1)}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-secondary-700 mb-1">Assessment:</h5>
                      <p className="text-sm text-secondary-600">{result.coherence.passageA.assessment}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-secondary-700 mb-1">Strengths:</h5>
                      <ul className="list-disc pl-5 text-secondary-600 text-sm space-y-1">
                        {result.coherence.passageA.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-secondary-700 mb-1">Weaknesses:</h5>
                      <ul className="list-disc pl-5 text-secondary-600 text-sm space-y-1">
                        {result.coherence.passageA.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {!isSinglePassageMode && (
                <div>
                  <h4 className="font-medium text-secondary-700 mb-3">{passageBTitle}</h4>
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-secondary-700">Coherence Score</span>
                      <span className="text-sm font-semibold text-primary-700">
                        {result.coherence.passageB.score.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden mb-4">
                      <div 
                        className="absolute top-0 bottom-0 left-0 flex items-center justify-center bg-primary-600 text-white text-xs font-medium" 
                        style={{ width: `${result.coherence.passageB.score * 10}%` }}
                      >
                        {result.coherence.passageB.score.toFixed(1)}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-secondary-700 mb-1">Assessment:</h5>
                        <p className="text-sm text-secondary-600">{result.coherence.passageB.assessment}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-secondary-700 mb-1">Strengths:</h5>
                        <ul className="list-disc pl-5 text-secondary-600 text-sm space-y-1">
                          {result.coherence.passageB.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-secondary-700 mb-1">Weaknesses:</h5>
                        <ul className="list-disc pl-5 text-secondary-600 text-sm space-y-1">
                          {result.coherence.passageB.weaknesses.map((weakness, index) => (
                            <li key={index}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Overall Coherence Category */}
            <div className="bg-gray-50 p-5 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-secondary-700">Overall Coherence Category</h4>
                <div 
                  className="ml-1 text-gray-500 cursor-help"
                  title="This is a high-level diagnosis based on both the Derivative Index and the Coherence Score. It's not a separate metric, but a qualitative synthesis."
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                {result.coherence.coherenceCategory === "Original and Coherent" && (
                  <div className="flex items-center space-x-2 text-green-700">
                    <span className="text-lg">✅</span>
                    <span className="text-base font-medium">Original and Coherent</span>
                  </div>
                )}
                {result.coherence.coherenceCategory === "Original but Incoherent" && (
                  <div className="flex items-center space-x-2 text-amber-700">
                    <span className="text-lg">⚠️</span>
                    <span className="text-base font-medium">Original but Incoherent</span>
                  </div>
                )}
                {result.coherence.coherenceCategory === "Conventional but Coherent" && (
                  <div className="flex items-center space-x-2 text-blue-700">
                    <span className="text-lg">🟡</span>
                    <span className="text-base font-medium">Conventional but Coherent</span>
                  </div>
                )}
                {result.coherence.coherenceCategory === "Derivative and Incoherent" && (
                  <div className="flex items-center space-x-2 text-red-700">
                    <span className="text-lg">❌</span>
                    <span className="text-base font-medium">Derivative and Incoherent</span>
                  </div>
                )}
                <p className="mt-3 text-sm text-secondary-600 text-center">
                  {result.coherence.coherenceCategory === "Original and Coherent" && 
                    "This passage achieves both originality and clear, coherent expression. Excellent balance of innovation and structure."}
                  {result.coherence.coherenceCategory === "Original but Incoherent" && 
                    "This passage appears to be original but lacks coherence. Consider refining structure or clarity."}
                  {result.coherence.coherenceCategory === "Conventional but Coherent" && 
                    "This passage is well-structured and coherent, but relies on conventional ideas. Consider adding more innovative concepts."}
                  {result.coherence.coherenceCategory === "Derivative and Incoherent" && 
                    "This passage lacks both originality and coherence. Consider significant revision of both content and structure."}
                </p>
              </div>
              
              {/* Visualization toggle */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-secondary-700">Display as:</div>
                  <div className="flex gap-2">
                    <button 
                      className={`px-3 py-1 text-xs rounded-full border ${viewType === 'label' ? 'bg-primary-100 border-primary-200 text-primary-800' : 'bg-white border-gray-200 text-gray-600'}`}
                      title="Show as diagnostic label"
                      onClick={() => setViewType('label')}
                    >
                      Label View
                    </button>
                    <button 
                      className={`px-3 py-1 text-xs rounded-full border ${viewType === 'grid' ? 'bg-primary-100 border-primary-200 text-primary-800' : 'bg-white border-gray-200 text-gray-600'}`}
                      title="Show as 2x2 grid"
                      onClick={() => setViewType('grid')}
                    >
                      Grid View
                    </button>
                  </div>
                </div>
                
                {/* Diagnostic Label View */}
                <div className={viewType === 'label' ? 'block' : 'hidden'}>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                    {result.coherence.coherenceCategory === "Original and Coherent" && (
                      <div className="flex items-center space-x-2 text-green-700">
                        <span className="text-lg">✅</span>
                        <span className="text-base font-medium">Original and Coherent</span>
                      </div>
                    )}
                    {result.coherence.coherenceCategory === "Original but Incoherent" && (
                      <div className="flex items-center space-x-2 text-amber-700">
                        <span className="text-lg">⚠️</span>
                        <span className="text-base font-medium">Original but Incoherent</span>
                      </div>
                    )}
                    {result.coherence.coherenceCategory === "Conventional but Coherent" && (
                      <div className="flex items-center space-x-2 text-blue-700">
                        <span className="text-lg">🟡</span>
                        <span className="text-base font-medium">Conventional but Coherent</span>
                      </div>
                    )}
                    {result.coherence.coherenceCategory === "Derivative and Incoherent" && (
                      <div className="flex items-center space-x-2 text-red-700">
                        <span className="text-lg">❌</span>
                        <span className="text-base font-medium">Derivative and Incoherent</span>
                      </div>
                    )}
                    <p className="mt-3 text-sm text-secondary-600 text-center">
                      {result.coherence.coherenceCategory === "Original and Coherent" && emphasisOption === 'clarity' && 
                        "This passage achieves excellent clarity and coherence while also being original. A well-structured, novel contribution."}
                      {result.coherence.coherenceCategory === "Original but Incoherent" && emphasisOption === 'clarity' && 
                        "While the passage shows originality, it lacks coherence. Focus on improving structure and clarity first."}
                      {result.coherence.coherenceCategory === "Conventional but Coherent" && emphasisOption === 'clarity' && 
                        "The passage is highly coherent with strong structure, though conventional in content. Excellent clarity is its strength."}
                      {result.coherence.coherenceCategory === "Derivative and Incoherent" && emphasisOption === 'clarity' && 
                        "This passage shows significant weakness in coherence and structure. Focus on clarifying ideas and improving flow."}
                      
                      {result.coherence.coherenceCategory === "Original and Coherent" && emphasisOption === 'novelty' && 
                        "This passage demonstrates exceptional originality with solid coherence. Its innovative approach makes it stand out."}
                      {result.coherence.coherenceCategory === "Original but Incoherent" && emphasisOption === 'novelty' && 
                        "The passage shows impressive originality despite coherence issues. Its innovative ideas have potential with refinement."}
                      {result.coherence.coherenceCategory === "Conventional but Coherent" && emphasisOption === 'novelty' && 
                        "Though well-structured, this passage lacks originality. Consider introducing more innovative concepts or perspectives."}
                      {result.coherence.coherenceCategory === "Derivative and Incoherent" && emphasisOption === 'novelty' && 
                        "This passage lacks originality and innovation. Focus on developing more original concepts and arguments."}
                      
                      {result.coherence.coherenceCategory === "Original and Coherent" && emphasisOption === 'balanced' && 
                        "This passage achieves both originality and clear, coherent expression. Excellent balance of innovation and structure."}
                      {result.coherence.coherenceCategory === "Original but Incoherent" && emphasisOption === 'balanced' && 
                        "This passage appears to be original but lacks coherence. Consider refining structure or clarity."}
                      {result.coherence.coherenceCategory === "Conventional but Coherent" && emphasisOption === 'balanced' && 
                        "This passage is well-structured and coherent, but relies on conventional ideas. Consider adding more innovative concepts."}
                      {result.coherence.coherenceCategory === "Derivative and Incoherent" && emphasisOption === 'balanced' && 
                        "This passage lacks both originality and coherence. Consider significant revision of both content and structure."}
                    </p>
                  </div>
                </div>
                
                {/* 2x2 Grid View */}
                <div className={`mt-2 ${viewType === 'grid' ? 'block' : 'hidden'}`}>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 text-center">
                      <div className="py-2 bg-gray-100 font-medium border-b">Coherent</div>
                      <div className="py-2 bg-gray-100 font-medium border-b border-l">Incoherent</div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className={`p-3 text-sm border-b ${result.coherence.coherenceCategory === "Original and Coherent" ? 'bg-green-50' : ''}`}>
                        <div className="flex justify-center mb-1">
                          <span className="text-lg">✅</span>
                        </div>
                        <div className="text-center text-xs font-medium">Original and Coherent</div>
                        <div className="text-center text-xs mt-1 text-gray-600">Best Case</div>
                      </div>
                      <div className={`p-3 text-sm border-b border-l ${result.coherence.coherenceCategory === "Original but Incoherent" ? 'bg-amber-50' : ''}`}>
                        <div className="flex justify-center mb-1">
                          <span className="text-lg">⚠️</span>
                        </div>
                        <div className="text-center text-xs font-medium">Original but Incoherent</div>
                        <div className="text-center text-xs mt-1 text-gray-600">High-Risk Genius</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className={`p-3 text-sm ${result.coherence.coherenceCategory === "Conventional but Coherent" ? 'bg-blue-50' : ''}`}>
                        <div className="flex justify-center mb-1">
                          <span className="text-lg">🟡</span>
                        </div>
                        <div className="text-center text-xs font-medium">Conventional but Coherent</div>
                        <div className="text-center text-xs mt-1 text-gray-600">Safe but Boring</div>
                      </div>
                      <div className={`p-3 text-sm border-l ${result.coherence.coherenceCategory === "Derivative and Incoherent" ? 'bg-red-50' : ''}`}>
                        <div className="flex justify-center mb-1">
                          <span className="text-lg">❌</span>
                        </div>
                        <div className="text-center text-xs font-medium">Derivative and Incoherent</div>
                        <div className="text-center text-xs mt-1 text-gray-600">Why does this exist?</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 px-3 py-2 bg-gray-50 rounded-lg text-xs text-secondary-600">
                    {emphasisOption === 'clarity' && (
                      <p>
                        This 2×2 grid classifies content based on coherence (logical flow and clarity) and originality.
                        When emphasizing clarity, coherent passages (left side) are preferred regardless of originality.
                      </p>
                    )}
                    {emphasisOption === 'novelty' && (
                      <p>
                        This 2×2 grid classifies content based on coherence and originality.
                        When emphasizing novelty, original passages (top row) are preferred even if they have some coherence issues.
                      </p>
                    )}
                    {emphasisOption === 'balanced' && (
                      <p>
                        This 2×2 grid classifies content based on coherence and originality.
                        A balanced approach values both aspects equally, with "Original and Coherent" being the ideal outcome.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Analysis Emphasis */}
                <div className="mt-4">
                  <div className="text-sm font-medium text-secondary-700 mb-2">Analysis Emphasis:</div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className={`px-3 py-1 text-xs rounded-full border ${
                        emphasisOption === 'clarity' 
                          ? 'bg-primary-100 border-primary-200 text-primary-800' 
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                      title="Give greater weight to structural coherence and clarity"
                      onClick={() => setEmphasisOption('clarity')}
                    >
                      Emphasize clarity
                    </button>
                    <button 
                      className={`px-3 py-1 text-xs rounded-full border ${
                        emphasisOption === 'novelty' 
                          ? 'bg-primary-100 border-primary-200 text-primary-800' 
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                      title="Give greater weight to conceptual novelty and innovation"
                      onClick={() => setEmphasisOption('novelty')}
                    >
                      Emphasize novelty
                    </button>
                    <button 
                      className={`px-3 py-1 text-xs rounded-full border ${
                        emphasisOption === 'balanced' 
                          ? 'bg-primary-100 border-primary-200 text-primary-800' 
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                      title="Give equal weight to both novelty and coherence"
                      onClick={() => setEmphasisOption('balanced')}
                    >
                      Balanced view
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feedback Form for Coherence */}
            <FeedbackForm
              category="coherence"
              categoryName="Coherence Analysis"
              result={result}
              passageA={passageA}
              passageB={passageB}
              isSinglePassageMode={isSinglePassageMode}
              onFeedbackProcessed={setResult}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
