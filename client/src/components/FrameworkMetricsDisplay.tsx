import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResult } from "@/lib/types";
import MathRenderer from "./MathRenderer";

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
  
  // Get the appropriate metrics based on analysis type - EXACT 40 metrics per dimension from user specification
  const getMetricsForFramework = (type: string) => {
    switch (type) {
      case "intelligence":
        return [
          'compression', 'abstraction', 'inferenceDepth', 'epistemicFriction', 'cognitiveDistancing',
          'counterfactualReasoning', 'analogicalDepth', 'semanticTopology', 'asymmetry', 'conceptualLayering',
          'originalDefinitionMaking', 'precisionOfTerms', 'distinctionTracking', 'avoidanceOfTautology', 'avoidanceOfEmptyGenerality',
          'compressionOfExamplesIntoPrinciple', 'abilityToInvertPerspective', 'anticipationOfObjections', 'integrationOfDisparateDomains', 'selfReflexivity',
          'eliminationOfRedundancy', 'conceptualEconomy', 'epistemicRiskTaking', 'generativity', 'abilityToReviseAssumptions',
          'distinguishingSignalVsNoise', 'recognizingHiddenAssumptions', 'trackingCausalChains', 'separatingCorrelationFromCausation', 'managingComplexityWithoutCollapse',
          'detectingParadoxOrTension', 'aptCompressionIntoAphorism', 'clarityUnderPressure', 'distinguishingLevels', 'relatingConcreteToAbstract',
          'controlOfScope', 'detectingPseudoIntelligence', 'balancingSimplicityWithDepth', 'strategicOmission', 'transferability'
        ];
      case "cogency":
        return [
          'logicalValidity', 'absenceOfContradictions', 'strengthOfEvidence', 'proportionality', 'avoidingNonSequiturs',
          'explicitStructure', 'distinctionBetweenPremisesAndConclusion', 'consistentTerminology', 'focus', 'avoidingCircularity',
          'handlingCounterexamples', 'responsivenessToObjections', 'causalAdequacy', 'inferentialTightness', 'avoidingOvergeneralization',
          'avoidingStrawManReasoning', 'recognizingScopeLimits', 'avoidingEquivocation', 'hierarchyOfReasons', 'consistencyWithBackgroundKnowledge',
          'recognizingExceptions', 'correctUseOfExamples', 'avoidanceOfLoadedLanguage', 'clearPriorityOfClaims', 'avoidingCategoryMistakes',
          'explicitnessOfAssumptions', 'nonRedundancyInSupport', 'alignmentBetweenThesisAndSupport', 'avoidanceOfSpuriousPrecision', 'adequateDifferentiation',
          'soundnessOfAnalogies', 'progressiveBuildup', 'avoidanceOfDoubleStandards', 'balanceOfConcessionAndAssertion', 'clarityOfLogicalConnectives',
          'preservationOfDistinctions', 'avoidingIrrelevantMaterial', 'correctHandlingOfProbability', 'strengthOfCausalExplanation', 'stabilityUnderReformulation'
        ];
      case "originality":
        return [
          'novelPerspective', 'uncommonConnections', 'surprisingButAptAnalogies', 'inventionOfNewDistinctions', 'reframingOfCommonProblem',
          'newConceptualSynthesis', 'freshMetaphors', 'generatingNewQuestions', 'counterintuitiveInsight', 'unusualCompression',
          'distillingClicheIntoClarity', 'reinterpretingTradition', 'productiveParadox', 'idiosyncraticVoice', 'unusualButPrecisePhrasing',
          'structuralInventiveness', 'surprisingYetValidInference', 'nonStandardAngle', 'repurposingKnownConcept', 'avoidingMimicry',
          'shunningJargonCliches', 'generatingConceptualFriction', 'independentPatternRecognition', 'unexpectedCausalExplanation', 'tensionBetweenDomains',
          'provocativeButDefensibleClaim', 'lateralConnections', 'subversionOfDefaultFraming', 'detectionOfNeglectedDetail', 'reverseEngineeringAssumptions',
          'productiveMisfitWithGenre', 'intellectuallyPlayfulButRigorous', 'constructiveViolationOfExpectations', 'voiceNotReducibleToFormula', 'revaluingTheObvious',
          'absenceOfDerivativeCadence', 'independentSynthesisOfSources', 'discoveryOfHiddenSymmetry', 'generatingTermsOthersAdopt', 'stayingPower'
        ];
      case "quality":
        return [
          'clarityOfExpression', 'flowAndReadability', 'stylisticControl', 'grammarAndSyntaxPrecision', 'appropriateTone',
          'balanceOfBrevityAndElaboration', 'coherenceAcrossSections', 'engagement', 'rhythmOfSentences', 'absenceOfFiller',
          'clearIntroductionOfThemes', 'effectiveClosure', 'varietyOfSentenceStructure', 'aptVocabulary', 'avoidingCliches',
          'consistencyOfStyle', 'accessibility', 'respectForAudienceIntelligence', 'memorabilityOfPhrasing', 'avoidanceOfRedundancy',
          'naturalTransitions', 'balancedParagraphing', 'pacing', 'smoothHandlingOfComplexity', 'aptUseOfExamples',
          'abilityToHoldReaderAttention', 'economyOfLanguage', 'emphasisWhereNeeded', 'voiceConsistency', 'avoidanceOfAwkwardness',
          'seamlessIntegrationOfQuotes', 'goodProportionOfAbstractVsConcrete', 'nonMechanicalStyle', 'absenceOfDistractingErrors', 'balanceOfAnalysisAndNarrative',
          'cadence', 'avoidanceOfPedantry', 'polish', 'unifyingTheme', 'overallReaderImpact'
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
    // Scores are already 0-100 population percentiles
    const normalizedScore = score;
    
    if (normalizedScore >= 85) return "bg-green-500";
    if (normalizedScore >= 70) return "bg-yellow-500";
    if (normalizedScore >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  // Handle different data structures for different analysis types
  let rawData;
  if (analysisType === "quality") {
    // Quality analysis returns data directly in the result object
    rawData = result;
  } else {
    // Other analysis types use the raw[Type]Analysis structure
    rawData = result[`raw${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}Analysis`];
  }
  
  const metrics = getMetricsForFramework(analysisType);

  console.log("FrameworkMetricsDisplay debug:", { 
    analysisType, 
    rawData, 
    metrics,
    resultKeys: Object.keys(result),
    rawDataExists: !!rawData,
    rawDataType: typeof rawData,
    firstMetricData: metrics.length > 0 ? rawData?.[metrics[0]] : null,
    dataStructure: rawData ? Object.keys(rawData) : []
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

          // Handle both structures: single document (flat) and dual document (nested)
          let passageAData, passageBData;
          
          if (analysisType === "quality") {
            // Quality analysis has direct structure with score, assessment, quote1, quote2
            if (isSinglePassageMode) {
              passageAData = {
                score: metricData.score,
                assessment: metricData.assessment,
                quotation1: metricData.quote1,
                quotation2: metricData.quote2,
                justification1: metricData.justification1,
                justification2: metricData.justification2
              };
              passageBData = null;
            } else {
              // For dual mode, quality should have passageA/passageB structure
              passageAData = metricData.passageA;
              passageBData = metricData.passageB;
            }
          } else {
            // Other analysis types use the standard structure
            passageAData = metricData.passageA || (isSinglePassageMode ? metricData : null);
            passageBData = metricData.passageB;
          }

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
                        {passageAData.score}/100
                      </Badge>
                    )}
                  </div>
                  
                  {passageAData?.assessment && (
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Assessment:</p>
                      <MathRenderer text={passageAData.assessment} className="text-sm" />
                    </div>
                  )}

                  {(passageAData?.quotation1 || passageAData?.quote1) && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Supporting Quote 1:</p>
                      <div className="text-sm italic">
                        "<MathRenderer text={passageAData.quotation1 || passageAData.quote1} />"
                      </div>
                      {(passageAData.justification1 || passageAData.justification) && (
                        <div className="text-sm mt-1 text-muted-foreground">
                          <strong>Justification:</strong> <MathRenderer text={passageAData.justification1 || passageAData.justification} />
                        </div>
                      )}
                    </div>
                  )}

                  {(passageAData?.quotation2 || passageAData?.quote2) && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Supporting Quote 2:</p>
                      <div className="text-sm italic">
                        "<MathRenderer text={passageAData.quotation2 || passageAData.quote2} />"
                      </div>
                      {passageAData.justification2 && (
                        <div className="text-sm mt-1 text-muted-foreground">
                          <strong>Justification:</strong> <MathRenderer text={passageAData.justification2} />
                        </div>
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
                          {passageBData.score}/100
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
      {(rawData.verdict || rawData.overallJudgment) && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Verdict</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{rawData.verdict || rawData.overallJudgment}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}