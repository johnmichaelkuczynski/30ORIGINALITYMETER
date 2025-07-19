import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResult } from "@/lib/types";

interface FrameworkMetricsDisplayProps {
  result: AnalysisResult;
  analysisType: "originality" | "cogency" | "intelligence" | "quality";
  isSinglePassageMode?: boolean;
}

export default function FrameworkMetricsDisplay({
  result,
  analysisType,
  isSinglePassageMode = false
}: FrameworkMetricsDisplayProps) {
  
  // Get the appropriate metrics based on analysis type - EXACT 80 metrics from the user's specification
  const getMetricsForFramework = (type: string) => {
    switch (type) {
      case "originality":
        return [
          'transformationalSynthesis', 'generativePower', 'disciplinaryRepositioning', 'conceptualReframing',
          'recursiveInnovation', 'unexpectedCrossPollination', 'epistemicReweighting', 'constraintInnovation',
          'ontologyRespecification', 'heuristicLeap', 'problemReIndexing', 'axiomaticInnovation',
          'moralPoliticalRecomputation', 'subtextExcavation', 'secondOrderInnovation', 'temporalInversion',
          'negativeSpaceManipulation', 'unnaturalPairing', 'disciplinaryHijack', 'ontoEpistemicFusion'
        ];
      case "intelligence":
        return [
          'compressionCapacity', 'multiLevelIntegration', 'inferenceArchitecture', 'constraintSatisfaction',
          'patternRecognition', 'abstractionControl', 'analogicalReasoning', 'causalModeling',
          'probabilisticReasoning', 'systemicThinking', 'metacognition', 'attentionalControl',
          'workingMemoryManagement', 'cognitiveFlexibility', 'executiveControl', 'strategicPlanning',
          'problemDecomposition', 'solutionSpace', 'cognitiveEfficiency', 'cognitiveProcessingSpeed'
        ];
      case "cogency":
        return [
          'argumentativeContinuity', 'errorResistance', 'specificityOfCommitment', 'provisionalityControl',
          'loadDistribution', 'errorAnticipation', 'epistemicParsimony', 'scopeClarity',
          'evidenceCalibration', 'redundancyAvoidance', 'conceptualInterlock', 'temporalStability',
          'distinctionAwareness', 'layeredPersuasiveness', 'signalDiscipline', 'causalAlignment',
          'counterexampleImmunity', 'intelligibilityOfObjection', 'dependenceHierarchyAwareness', 'contextBoundedInference'
        ];
      case "quality":
        return [
          'conceptualCompression', 'epistemicFriction', 'inferenceControl', 'asymmetryOfCognitiveLabor',
          'noveltyToBaselineRatio', 'internalDifferentiation', 'problemDensity', 'compressionAcrossLevels',
          'semanticSpecificity', 'explanatoryYield', 'metaCognitiveSignal', 'structuralIntegrity',
          'generativePotential', 'signalToRhetoricRatio', 'dialecticalEngagement', 'topologicalAwareness',
          'disambiguationSkill', 'crossDisciplinaryFluency', 'psychologicalRealism', 'intellectualRiskQuotient'
        ];
      default:
        return [];
    }
  };

  const formatMetricName = (metric: string) => {
    return metric.replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  };

  const getScoreColor = (score: number) => {
    // Convert 0-10 scale to 0-100 if needed
    const normalizedScore = score > 10 ? score : score * 10;
    
    if (normalizedScore >= 85) return "bg-green-500";
    if (normalizedScore >= 70) return "bg-yellow-500";
    if (normalizedScore >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const rawData = result[`raw${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}Analysis`];
  const metrics = getMetricsForFramework(analysisType);

  console.log("FrameworkMetricsDisplay debug:", { 
    analysisType, 
    rawData, 
    metrics,
    resultKeys: Object.keys(result),
    rawDataExists: !!rawData,
    rawDataType: typeof rawData
  });

  if (!rawData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            No {analysisType} analysis data available. Please run the analysis first.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Looking for: raw{analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}Analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {metrics.map((metric) => {
          const metricData = rawData[metric];
          if (!metricData) return null;

          const passageAData = metricData.passageA;
          const passageBData = metricData.passageB;

          return (
            <Card key={metric}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{formatMetricName(metric)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Passage A Data */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Your Document</h4>
                    {passageAData?.score && (
                      <Badge className={`${getScoreColor(passageAData.score)} text-white`}>
                        {passageAData.score > 10 ? passageAData.score : passageAData.score * 10}/100
                      </Badge>
                    )}
                  </div>
                  
                  {passageAData?.assessment && (
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Assessment:</p>
                      <p className="text-sm">{passageAData.assessment}</p>
                    </div>
                  )}

                  {passageAData?.quotation1 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Supporting Quote 1:</p>
                      <p className="text-sm italic">"{passageAData.quotation1}"</p>
                      {passageAData.justification1 && (
                        <p className="text-sm mt-1 text-muted-foreground">
                          <strong>Justification:</strong> {passageAData.justification1}
                        </p>
                      )}
                    </div>
                  )}

                  {passageAData?.quotation2 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Supporting Quote 2:</p>
                      <p className="text-sm italic">"{passageAData.quotation2}"</p>
                      {passageAData.justification2 && (
                        <p className="text-sm mt-1 text-muted-foreground">
                          <strong>Justification:</strong> {passageAData.justification2}
                        </p>
                      )}
                    </div>
                  )}

                  {passageAData?.strengths && passageAData.strengths.length > 0 && (
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Strengths:</p>
                      <ul className="text-sm space-y-1">
                        {passageAData.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="text-emerald-700">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {passageAData?.weaknesses && passageAData.weaknesses.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Weaknesses:</p>
                      <ul className="text-sm space-y-1">
                        {passageAData.weaknesses.map((weakness: string, idx: number) => (
                          <li key={idx} className="text-red-700">• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Passage B Data (for comparison mode) */}
                {!isSinglePassageMode && passageBData && (
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Comparison Document</h4>
                      {passageBData?.score && (
                        <Badge className={`${getScoreColor(passageBData.score)} text-white`}>
                          {passageBData.score > 10 ? passageBData.score : passageBData.score * 10}/100
                        </Badge>
                      )}
                    </div>
                    
                    {passageBData?.assessment && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Assessment:</p>
                        <p className="text-sm">{passageBData.assessment}</p>
                      </div>
                    )}

                    {passageBData?.quotation1 && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Supporting Quote 1:</p>
                        <p className="text-sm italic">"{passageBData.quotation1}"</p>
                        {passageBData.justification1 && (
                          <p className="text-sm mt-1 text-muted-foreground">
                            <strong>Justification:</strong> {passageBData.justification1}
                          </p>
                        )}
                      </div>
                    )}

                    {passageBData?.quotation2 && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Supporting Quote 2:</p>
                        <p className="text-sm italic">"{passageBData.quotation2}"</p>
                        {passageBData.justification2 && (
                          <p className="text-sm mt-1 text-muted-foreground">
                            <strong>Justification:</strong> {passageBData.justification2}
                          </p>
                        )}
                      </div>
                    )}

                    {passageBData?.strengths && passageBData.strengths.length > 0 && (
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Strengths:</p>
                        <ul className="text-sm space-y-1">
                          {passageBData.strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="text-emerald-700">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {passageBData?.weaknesses && passageBData.weaknesses.length > 0 && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Weaknesses:</p>
                        <ul className="text-sm space-y-1">
                          {passageBData.weaknesses.map((weakness: string, idx: number) => (
                            <li key={idx} className="text-red-700">• {weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall Verdict */}
      {rawData.verdict && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Verdict</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{rawData.verdict}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}