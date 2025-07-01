import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface PassageData {
  title: string;
  text: string;
  userContext: string;
}

interface CoreParameter {
  score: number;
  assessment: string;
  quotes: string[];
}

interface EnhancedArgumentativeResult {
  singlePaperAnalysis?: {
    overallCogencyScore: number;
    cogencyLabel: string;
    argumentSummary: string;
    superiorReconstruction: string;
    coreParameters: {
      inferentialStructure: CoreParameter;
      conceptualControl: CoreParameter;
      argumentativeIntegrity: CoreParameter;
      synthesisIntegration: CoreParameter;
    };
    overallJudgment: string;
  };
  comparativeAnalysis?: {
    winner: 'A' | 'B' | 'Tie';
    winnerScore: number;
    paperAScore: number;
    paperBScore: number;
    paperASummary: string;
    paperBSummary: string;
    paperASuperiorReconstruction: string;
    paperBSuperiorReconstruction: string;
    comparisonBreakdown: {
      paperA: {
        inferentialStructure: number;
        conceptualControl: number;
        argumentativeIntegrity: number;
        synthesisIntegration: number;
      };
      paperB: {
        inferentialStructure: number;
        conceptualControl: number;
        argumentativeIntegrity: number;
        synthesisIntegration: number;
      };
    };
    detailedComparison: string;
    reasoning: string;
  };
  reportContent: string;
}

/**
 * Enhanced single paper analysis with comprehensive 0-100 scoring and 7 core parameters
 */
export async function analyzeSinglePaperEnhanced(
  passage: PassageData
): Promise<EnhancedArgumentativeResult> {
  try {
    const prompt = `Analyze this academic text and score it on 4 parameters (0-25 each, total 100).

TEXT: ${passage.text.substring(0, 6000)}

Return ONLY valid JSON with this exact structure:
{
  "argumentSummary": "brief summary of main argument",
  "superiorReconstruction": "improved version of the argument",
  "inferentialStructure": {
    "score": 20,
    "assessment": "evaluation of logical reasoning quality",
    "quotes": ["quote1", "quote2"]
  },
  "conceptualControl": {
    "score": 20,
    "assessment": "evaluation of conceptual precision", 
    "quotes": ["quote1", "quote2"]
  },
  "argumentativeIntegrity": {
    "score": 20,
    "assessment": "evaluation of following through on commitments",
    "quotes": ["quote1", "quote2"]
  },
  "synthesisIntegration": {
    "score": 20,
    "assessment": "evaluation of unified argumentative trajectory",
    "quotes": ["quote1", "quote2"]
  },
  "overallJudgment": "comprehensive assessment"
}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    const parsed = JSON.parse(content);
    
    // Debug logging to see what we actually received
    console.log("Parsed AI response structure:", JSON.stringify(parsed, null, 2));
    
    // Validate that we have the expected structure
    if (!parsed.inferentialStructure || !parsed.conceptualControl || 
        !parsed.argumentativeIntegrity || !parsed.synthesisIntegration) {
      console.error("Missing required parameters in AI response:", parsed);
      throw new Error("AI response missing required parameter structure");
    }

    // Calculate overall score from core parameters (each out of 25, total 100)
    const parameterScores = [
      parsed.inferentialStructure.score,
      parsed.conceptualControl.score,
      parsed.argumentativeIntegrity.score,
      parsed.synthesisIntegration.score
    ];

    const overallScore = Math.round(parameterScores.reduce((a, b) => a + b, 0));
    
    // Determine cogency label
    let cogencyLabel: string;
    if (overallScore >= 90) cogencyLabel = "Exceptionally Cogent";
    else if (overallScore >= 80) cogencyLabel = "Highly Cogent";
    else if (overallScore >= 70) cogencyLabel = "Moderately Cogent";
    else if (overallScore >= 60) cogencyLabel = "Somewhat Cogent";
    else if (overallScore >= 50) cogencyLabel = "Minimally Cogent";
    else cogencyLabel = "Poorly Cogent";

    const result: EnhancedArgumentativeResult = {
      singlePaperAnalysis: {
        overallCogencyScore: overallScore,
        cogencyLabel,
        argumentSummary: parsed.argumentSummary,
        superiorReconstruction: parsed.superiorReconstruction,
        coreParameters: {
          inferentialStructure: parsed.inferentialStructure,
          conceptualControl: parsed.conceptualControl,
          argumentativeIntegrity: parsed.argumentativeIntegrity,
          synthesisIntegration: parsed.synthesisIntegration
        },
        overallJudgment: parsed.overallJudgment
      },
      reportContent: await generateEnhancedSingleReport(parsed, passage.title, overallScore, cogencyLabel)
    };

    return result;

  } catch (error) {
    console.error("Error in enhanced single paper analysis:", error);
    throw new Error(`Enhanced analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Enhanced comparative analysis with consistent scoring
 * First analyzes each document individually, then compares based on those scores
 */
export async function compareArgumentativeStrengthEnhanced(
  passageA: PassageData,
  passageB: PassageData
): Promise<EnhancedArgumentativeResult> {
  try {
    // First, get individual cogency analyses for both papers
    console.log("Running individual cogency analysis for Paper A...");
    const paperAAnalysis = await analyzeSinglePaperEnhanced(passageA);
    
    console.log("Running individual cogency analysis for Paper B...");
    const paperBAnalysis = await analyzeSinglePaperEnhanced(passageB);

    if (!paperAAnalysis.singlePaperAnalysis || !paperBAnalysis.singlePaperAnalysis) {
      throw new Error("Failed to generate individual paper analyses");
    }

    const paperAScore = paperAAnalysis.singlePaperAnalysis.overallCogencyScore;
    const paperBScore = paperBAnalysis.singlePaperAnalysis.overallCogencyScore;
    
    // Determine winner based on individual scores
    let winner: 'A' | 'B' | 'Tie';
    let winnerScore: number;
    
    if (Math.abs(paperAScore - paperBScore) <= 3) {
      winner = 'Tie';
      winnerScore = Math.max(paperAScore, paperBScore);
    } else if (paperAScore > paperBScore) {
      winner = 'A';
      winnerScore = paperAScore;
    } else {
      winner = 'B';
      winnerScore = paperBScore;
    }

    // Generate comparative reasoning using OpenAI
    const comparisonPrompt = `Based on individual cogency analyses, provide a detailed comparison:

**Paper A Analysis:**
- Title: ${passageA.title}
- Overall Score: ${paperAScore}/100
- Summary: ${paperAAnalysis.singlePaperAnalysis.argumentSummary}

**Paper B Analysis:**
- Title: ${passageB.title}
- Overall Score: ${paperBScore}/100  
- Summary: ${paperBAnalysis.singlePaperAnalysis.argumentSummary}

**Winner:** ${winner} ${winner !== 'Tie' ? `(Score: ${winnerScore})` : '(Scores too close to call)'}

Provide JSON response with:
{
  "detailedComparison": "Comprehensive comparison of argumentative strengths and weaknesses",
  "reasoning": "Detailed explanation of why ${winner === 'Tie' ? 'the papers are roughly equivalent' : `Paper ${winner} is superior`}"
}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: comparisonPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const comparisonResult = JSON.parse(response.choices[0].message.content || '{}');

    // Build the result using individual analyses but with comparison
    const result: EnhancedArgumentativeResult = {
      comparativeAnalysis: {
        winner,
        winnerScore,
        paperAScore,
        paperBScore,
        paperASummary: paperAAnalysis.singlePaperAnalysis.argumentSummary,
        paperBSummary: paperBAnalysis.singlePaperAnalysis.argumentSummary,
        paperASuperiorReconstruction: paperAAnalysis.singlePaperAnalysis.superiorReconstruction,
        paperBSuperiorReconstruction: paperBAnalysis.singlePaperAnalysis.superiorReconstruction,
        comparisonBreakdown: {
          paperA: {
            inferentialStructure: paperAAnalysis.singlePaperAnalysis.coreParameters.inferentialStructure.score,
            conceptualControl: paperAAnalysis.singlePaperAnalysis.coreParameters.conceptualControl.score,
            argumentativeIntegrity: paperAAnalysis.singlePaperAnalysis.coreParameters.argumentativeIntegrity.score,
            synthesisIntegration: paperAAnalysis.singlePaperAnalysis.coreParameters.synthesisIntegration.score
          },
          paperB: {
            inferentialStructure: paperBAnalysis.singlePaperAnalysis.coreParameters.inferentialStructure.score,
            conceptualControl: paperBAnalysis.singlePaperAnalysis.coreParameters.conceptualControl.score,
            argumentativeIntegrity: paperBAnalysis.singlePaperAnalysis.coreParameters.argumentativeIntegrity.score,
            synthesisIntegration: paperBAnalysis.singlePaperAnalysis.coreParameters.synthesisIntegration.score
          }
        },
        detailedComparison: comparisonResult.detailedComparison,
        reasoning: comparisonResult.reasoning
      },
      reportContent: await generateEnhancedComparativeReport({
        paperASummary: paperAAnalysis.singlePaperAnalysis.argumentSummary,
        paperBSummary: paperBAnalysis.singlePaperAnalysis.argumentSummary,
        paperASuperiorReconstruction: paperAAnalysis.singlePaperAnalysis.superiorReconstruction,
        paperBSuperiorReconstruction: paperBAnalysis.singlePaperAnalysis.superiorReconstruction,
        paperAScores: {
          inferentialStructure: paperAAnalysis.singlePaperAnalysis.coreParameters.inferentialStructure.score,
          conceptualControl: paperAAnalysis.singlePaperAnalysis.coreParameters.conceptualControl.score,
          argumentativeIntegrity: paperAAnalysis.singlePaperAnalysis.coreParameters.argumentativeIntegrity.score,
          synthesisIntegration: paperAAnalysis.singlePaperAnalysis.coreParameters.synthesisIntegration.score
        },
        paperBScores: {
          inferentialStructure: paperBAnalysis.singlePaperAnalysis.coreParameters.inferentialStructure.score,
          conceptualControl: paperBAnalysis.singlePaperAnalysis.coreParameters.conceptualControl.score,
          argumentativeIntegrity: paperBAnalysis.singlePaperAnalysis.coreParameters.argumentativeIntegrity.score,
          synthesisIntegration: paperBAnalysis.singlePaperAnalysis.coreParameters.synthesisIntegration.score
        },
        detailedComparison: comparisonResult.detailedComparison,
        reasoning: comparisonResult.reasoning,
        winner
      }, passageA.title, passageB.title, paperAScore, paperBScore)
    };

    return result;

  } catch (error) {
    console.error("Error in enhanced comparative analysis:", error);
    throw new Error(`Enhanced comparative analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate comprehensive single paper report
 */
async function generateEnhancedSingleReport(
  analysis: any,
  title: string,
  overallScore: number,
  cogencyLabel: string
): Promise<string> {
  return `# COMPREHENSIVE COGENCY ANALYSIS REPORT

## Paper: ${title || "Untitled Document"}

### Executive Summary
**Overall Cogency Score:** ${overallScore}/100 (${cogencyLabel})

This report provides a comprehensive evaluation of the paper's argumentative cogency across four core parameters using a 25-point scale (100 total).

### Argument Summary
${analysis.argumentSummary}

### Superior Argument Reconstruction
${analysis.superiorReconstruction}

### Core Parameters Analysis

#### 1. Inferential Structure (${analysis.inferentialStructure.score}/25)
${analysis.inferentialStructure.assessment}

**Supporting Quotes:**
${analysis.inferentialStructure.quotes.map((q: string) => `> "${q}"`).join('\n')}

#### 2. Conceptual Control (${analysis.conceptualControl.score}/25)
${analysis.conceptualControl.assessment}

**Supporting Quotes:**
${analysis.conceptualControl.quotes.map((q: string) => `> "${q}"`).join('\n')}

#### 3. Argumentative Integrity (${analysis.argumentativeIntegrity.score}/25)
${analysis.argumentativeIntegrity.assessment}

**Supporting Quotes:**
${analysis.argumentativeIntegrity.quotes.map((q: string) => `> "${q}"`).join('\n')}

#### 4. Synthesis & Integration (${analysis.synthesisIntegration.score}/25)
${analysis.synthesisIntegration.assessment}

**Supporting Quotes:**
${analysis.synthesisIntegration.quotes.map((q: string) => `> "${q}"`).join('\n')}


### Overall Judgment
${analysis.overallJudgment}

### Recommendations for Enhancement
Based on the analysis, consider strengthening areas with lower scores while maintaining the paper's argumentative strengths.`;
}

/**
 * Generate comprehensive comparative report
 */
async function generateEnhancedComparativeReport(
  analysis: any,
  titleA: string,
  titleB: string,
  scoreA: number,
  scoreB: number
): Promise<string> {
  return `# COMPREHENSIVE COMPARATIVE COGENCY ANALYSIS

## Papers Analyzed
- **Paper A:** ${titleA || "Untitled Document A"}
- **Paper B:** ${titleB || "Untitled Document B"}

### Executive Summary
**Winner:** Paper ${analysis.winner} makes its case better
**Winning Score:** ${analysis.winner === 'A' ? scoreA : analysis.winner === 'B' ? scoreB : Math.max(scoreA, scoreB)}/100

### Paper A: Argument Summary
${analysis.paperASummary}

### Paper B: Argument Summary  
${analysis.paperBSummary}

### Superior Argument Reconstructions

#### Paper A - Enhanced Version
${analysis.paperASuperiorReconstruction}

#### Paper B - Enhanced Version
${analysis.paperBSuperiorReconstruction}

### Comparative Parameter Analysis

| Parameter | Paper A | Paper B | Winner |
|-----------|---------|---------|--------|
| Clarity of Argument | ${analysis.paperAScores.clarityOfArgument}/100 | ${analysis.paperBScores.clarityOfArgument}/100 | ${analysis.paperAScores.clarityOfArgument > analysis.paperBScores.clarityOfArgument ? 'A' : analysis.paperBScores.clarityOfArgument > analysis.paperAScores.clarityOfArgument ? 'B' : 'Tie'} |
| Inferential Cohesion | ${analysis.paperAScores.inferentialCohesion}/100 | ${analysis.paperBScores.inferentialCohesion}/100 | ${analysis.paperAScores.inferentialCohesion > analysis.paperBScores.inferentialCohesion ? 'A' : analysis.paperBScores.inferentialCohesion > analysis.paperAScores.inferentialCohesion ? 'B' : 'Tie'} |
| Conceptual Precision | ${analysis.paperAScores.conceptualPrecision}/100 | ${analysis.paperBScores.conceptualPrecision}/100 | ${analysis.paperAScores.conceptualPrecision > analysis.paperBScores.conceptualPrecision ? 'A' : analysis.paperBScores.conceptualPrecision > analysis.paperAScores.conceptualPrecision ? 'B' : 'Tie'} |
| Evidential Support | ${analysis.paperAScores.evidentialSupport}/100 | ${analysis.paperBScores.evidentialSupport}/100 | ${analysis.paperAScores.evidentialSupport > analysis.paperBScores.evidentialSupport ? 'A' : analysis.paperBScores.evidentialSupport > analysis.paperAScores.evidentialSupport ? 'B' : 'Tie'} |
| Counterargument Handling | ${analysis.paperAScores.counterargumentHandling}/100 | ${analysis.paperBScores.counterargumentHandling}/100 | ${analysis.paperAScores.counterargumentHandling > analysis.paperBScores.counterargumentHandling ? 'A' : analysis.paperBScores.counterargumentHandling > analysis.paperAScores.counterargumentHandling ? 'B' : 'Tie'} |
| Cognitive Risk | ${analysis.paperAScores.cognitiveRisk}/100 | ${analysis.paperBScores.cognitiveRisk}/100 | ${analysis.paperAScores.cognitiveRisk > analysis.paperBScores.cognitiveRisk ? 'A' : analysis.paperBScores.cognitiveRisk > analysis.paperAScores.cognitiveRisk ? 'B' : 'Tie'} |
| Epistemic Control | ${analysis.paperAScores.epistemicControl}/100 | ${analysis.paperBScores.epistemicControl}/100 | ${analysis.paperAScores.epistemicControl > analysis.paperBScores.epistemicControl ? 'A' : analysis.paperBScores.epistemicControl > analysis.paperAScores.epistemicControl ? 'B' : 'Tie'} |

### Detailed Comparison
${analysis.detailedComparison}

### Winner Justification
${analysis.reasoning}

### Recommendations
Both papers demonstrate scholarly merit. The analysis identifies specific areas where each could be strengthened while acknowledging their respective argumentative contributions.`;
}