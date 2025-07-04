import OpenAI from "openai";
import { detectGenreAndGetCriteria, GenreClassification } from "./genreDetection";

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
    genreClassification: {
      genre: string;
      confidence: number;
      reasoning: string;
      evaluationExplanation: string;
    };
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
    // First, detect the genre and get appropriate evaluation criteria
    console.log("Detecting genre for evaluation...");
    const genreInfo: GenreClassification = await detectGenreAndGetCriteria(passage.text);
    console.log("Genre detected:", genreInfo.genre, "with confidence:", genreInfo.confidence);

    // Build cogency-focused evaluation prompt
    const prompt = `You are an expert evaluator of intellectual cogency. Evaluate this work for actual cognitive rigor and argumentative excellence, not formalism.

DOCUMENT GENRE: ${genreInfo.genre}
EVALUATION APPROACH: Assess actual cogency, not formal compliance

CORE COGENCY CRITERIA:

1. INFERENTIAL STRUCTURE: Control over reasoning, layered argumentation, resolution of tensions
- HIGH SCORES (20-25): Recursive evaluation, confronts objections, resolves contradictions
- LOW SCORES (0-10): Assertions without argument, collapses under ambiguity

2. CONCEPTUAL CONTROL: Semantic compression, precise distinctions, terminological consistency  
- HIGH SCORES (20-25): Novel distinctions, tight formulations, maintains coherence
- LOW SCORES (0-10): Jargon without insight, vague or collapsed concepts

3. ARGUMENTATIVE INTEGRITY: Completes inferential trajectories, addresses self-critique
- HIGH SCORES (20-25): Confronts own claims with objections, philosophical closure
- LOW SCORES (0-10): Avoids tension, no self-critique, incomplete arguments

4. SYNTHESIS & INTEGRATION: Unified flow across conceptual domains, multiple scales of reasoning
- HIGH SCORES (20-25): Integrates multiple domains, local and global coherence
- LOW SCORES (0-10): Fragmented, no unifying framework

TEXT TO EVALUATE: ${passage.text.substring(0, 6000)}

EVALUATION PRINCIPLES:
- Reward cognitive friction and tension resolution
- Value semantic compression and conceptual innovation
- Recognize recursive argumentation and self-critique
- Do NOT penalize for narrative style, analogical reasoning, or lack of formal proofs
- Philosophical excellence through reasoning deserves 20-25/25 scores
- Focus on whether the author shows intellectual command, not formal compliance

HIGHEST-SCORING TEXTS:
- Confront their own claims with objections and resolve them
- Maintain internal coherence while developing novel distinctions  
- Compress complex ideas into tight formulations
- Display layered reasoning across multiple scales

LOWEST-SCORING TEXTS:
- Assert rather than argue
- Collapse under ambiguity or vagueness
- Substitute jargon for insight
- Avoid objections, tension, or conceptual self-critique

CRITICAL SCORING INSTRUCTION: Each parameter score must be between 0-25, NOT 0-100!
Examples: 22/25, 24/25, 18/25 - NEVER 22/100, 24/100, 18/100

For high-quality philosophical work like this epistemology paper, appropriate scores would be:
- Excellent: 22-25/25
- Good: 18-21/25  
- Fair: 14-17/25
- Poor: 0-13/25

Return ONLY valid JSON:
{
  "argumentSummary": "brief summary of main argument",
  "superiorReconstruction": "thoughtful improvement suggestions",
  "inferentialStructure": {
    "score": 22,
    "assessment": "evaluation of reasoning control and tension resolution - do NOT penalize for lack of formal proofs in philosophical work",
    "quotes": ["relevant quote 1", "relevant quote 2"]
  },
  "conceptualControl": {
    "score": 22,
    "assessment": "evaluation of semantic compression and conceptual precision - reward philosophical sophistication, not simplicity",
    "quotes": ["relevant quote 1", "relevant quote 2"]
  },
  "argumentativeIntegrity": {
    "score": 22,
    "assessment": "evaluation of self-critique and argumentative completion - value philosophical rigor over formalism",
    "quotes": ["relevant quote 1", "relevant quote 2"]
  },
  "synthesisIntegration": {
    "score": 22,
    "assessment": "evaluation of unified flow and multi-scale reasoning - assess intellectual coherence, not accessibility",
    "quotes": ["relevant quote 1", "relevant quote 2"]
  },
  "overallJudgment": "assessment of intellectual cogency and argumentative excellence"
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

    // Calculate weighted overall score based on genre importance
    // Each score is out of 25, weights sum to 100, final score out of 100
    const weightedScore = (
      (parsed.inferentialStructure.score * genreInfo.evaluationWeights.inferentialStructure / 25) +
      (parsed.conceptualControl.score * genreInfo.evaluationWeights.conceptualControl / 25) +
      (parsed.argumentativeIntegrity.score * genreInfo.evaluationWeights.argumentativeIntegrity / 25) +
      (parsed.synthesisIntegration.score * genreInfo.evaluationWeights.synthesisIntegration / 25)
    );

    const overallScore = Math.round(weightedScore);
    
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
        genreClassification: {
          genre: genreInfo.genre,
          confidence: genreInfo.confidence,
          reasoning: genreInfo.reasoning,
          evaluationExplanation: `This ${genreInfo.genre} was evaluated using weighted criteria: Inferential Structure (${genreInfo.evaluationWeights.inferentialStructure}%), Conceptual Control (${genreInfo.evaluationWeights.conceptualControl}%), Argumentative Integrity (${genreInfo.evaluationWeights.argumentativeIntegrity}%), Synthesis & Integration (${genreInfo.evaluationWeights.synthesisIntegration}%). These weights reflect the intellectual priorities appropriate to this genre.`
        },
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