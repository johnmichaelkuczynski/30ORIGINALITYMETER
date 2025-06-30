import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
      clarityOfArgument: CoreParameter;
      inferentialCohesion: CoreParameter;
      conceptualPrecision: CoreParameter;
      evidentialSupport: CoreParameter;
      counterargumentHandling: CoreParameter;
      cognitiveRisk: CoreParameter;
      epistemicControl: CoreParameter;
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
        clarityOfArgument: number;
        inferentialCohesion: number;
        conceptualPrecision: number;
        evidentialSupport: number;
        counterargumentHandling: number;
        cognitiveRisk: number;
        epistemicControl: number;
      };
      paperB: {
        clarityOfArgument: number;
        inferentialCohesion: number;
        conceptualPrecision: number;
        evidentialSupport: number;
        counterargumentHandling: number;
        cognitiveRisk: number;
        epistemicControl: number;
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
    const analysisPrompt = `You are an expert evaluator of academic and intellectual arguments. Conduct a comprehensive analysis using the enhanced evaluation framework.

**CRITICAL SCORING PRINCIPLES:**
- Use a 0-100 scale where scores should be generous for quality work (typically 60-95 range)
- Academic writing should score 70-90+ for competent work
- Reserve scores below 60 only for seriously flawed arguments
- Value intellectual rigor, scholarly depth, and argumentative sophistication

**Paper Title:** ${passage.title || "Untitled Paper"}
**Paper Content:** ${passage.text}

**REQUIRED ANALYSIS:**

1. **ARGUMENT SUMMARY** (not characterization): Provide a clear, factual summary of the main argument and supporting claims made in the text.

2. **SUPERIOR RECONSTRUCTION**: Create an improved version of the argument that strengthens weak points while maintaining the core thesis.

3. **CORE PARAMETERS EVALUATION** (0-100 scale each):

   **Clarity of Argument**: Is the thesis clearly stated? Are supporting claims coherent and well organized?
   
   **Inferential Cohesion**: Does the argument proceed logically? Are conclusions well-supported by premises?
   
   **Conceptual Precision**: Are key terms well-defined and used consistently? Is terminology appropriate?
   
   **Evidential Support/Substantiation**: Are claims backed by evidence, reasoning, or examples? Is the text persuasive on its own terms?
   
   **Counterargument Handling**: Does the author anticipate objections or address alternative views? Is the rebuttal adequate?
   
   **Cognitive Risk**: Does the argument push into new terrain or tackle hard questions? Is there intellectual boldness?
   
   **Epistemic Control**: Does the author display command of relevant knowledge? Are ambiguities navigated well?

For each parameter, provide:
- Score (0-100)
- Detailed assessment
- 2-3 relevant quotes from the text when available

Respond in valid JSON format:
{
  "argumentSummary": "factual summary of the main argument",
  "superiorReconstruction": "improved version of the argument",
  "clarityOfArgument": {
    "score": number,
    "assessment": "detailed evaluation",
    "quotes": ["quote1", "quote2"]
  },
  "inferentialCohesion": {
    "score": number,
    "assessment": "detailed evaluation", 
    "quotes": ["quote1", "quote2"]
  },
  "conceptualPrecision": {
    "score": number,
    "assessment": "detailed evaluation",
    "quotes": ["quote1", "quote2"]
  },
  "evidentialSupport": {
    "score": number,
    "assessment": "detailed evaluation",
    "quotes": ["quote1", "quote2"]
  },
  "counterargumentHandling": {
    "score": number,
    "assessment": "detailed evaluation",
    "quotes": ["quote1", "quote2"]
  },
  "cognitiveRisk": {
    "score": number,
    "assessment": "detailed evaluation",
    "quotes": ["quote1", "quote2"]
  },
  "epistemicControl": {
    "score": number,
    "assessment": "detailed evaluation",
    "quotes": ["quote1", "quote2"]
  },
  "overallJudgment": "comprehensive evaluation with specific reasoning"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    const parsed = JSON.parse(content);

    // Calculate overall cogency score as average of all parameters
    const parameterScores = [
      parsed.clarityOfArgument.score,
      parsed.inferentialCohesion.score,
      parsed.conceptualPrecision.score,
      parsed.evidentialSupport.score,
      parsed.counterargumentHandling.score,
      parsed.cognitiveRisk.score,
      parsed.epistemicControl.score
    ];

    const overallScore = Math.round(parameterScores.reduce((a, b) => a + b, 0) / parameterScores.length);

    let cogencyLabel = "Excellent";
    if (overallScore < 60) cogencyLabel = "Poor";
    else if (overallScore < 70) cogencyLabel = "Fair";
    else if (overallScore < 80) cogencyLabel = "Good";
    else if (overallScore < 90) cogencyLabel = "Very Good";

    const result: EnhancedArgumentativeResult = {
      singlePaperAnalysis: {
        overallCogencyScore: overallScore,
        cogencyLabel,
        argumentSummary: parsed.argumentSummary,
        superiorReconstruction: parsed.superiorReconstruction,
        coreParameters: {
          clarityOfArgument: parsed.clarityOfArgument,
          inferentialCohesion: parsed.inferentialCohesion,
          conceptualPrecision: parsed.conceptualPrecision,
          evidentialSupport: parsed.evidentialSupport,
          counterargumentHandling: parsed.counterargumentHandling,
          cognitiveRisk: parsed.cognitiveRisk,
          epistemicControl: parsed.epistemicControl
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
 * Enhanced comparative analysis with 0-100 scoring and comprehensive parameters
 */
export async function compareArgumentativeStrengthEnhanced(
  passageA: PassageData,
  passageB: PassageData
): Promise<EnhancedArgumentativeResult> {
  try {
    const comparisonPrompt = `You are an expert evaluator comparing two academic papers to determine which makes its case better.

**SCORING PRINCIPLES:**
- Use 0-100 scale, be generous with quality work (typically 60-95 range)
- Academic writing should score 70-90+ for competent work
- Consider intellectual rigor and argumentative sophistication

**Paper A:** ${passageA.title}
${passageA.text}

**Paper B:** ${passageB.title}
${passageB.text}

**REQUIRED ANALYSIS:**

1. **ARGUMENT SUMMARIES**: Provide factual summaries of both papers' main arguments

2. **SUPERIOR RECONSTRUCTIONS**: Create improved versions of both arguments

3. **COMPARATIVE EVALUATION** using 7 core parameters (0-100 each):
   - Clarity of Argument
   - Inferential Cohesion  
   - Conceptual Precision
   - Evidential Support/Substantiation
   - Counterargument Handling
   - Cognitive Risk
   - Epistemic Control

4. **WINNER DETERMINATION**: Based on overall parameter scores

Respond in valid JSON format:
{
  "paperASummary": "factual summary of Paper A's argument",
  "paperBSummary": "factual summary of Paper B's argument", 
  "paperASuperiorReconstruction": "improved version of Paper A's argument",
  "paperBSuperiorReconstruction": "improved version of Paper B's argument",
  "paperAScores": {
    "clarityOfArgument": number,
    "inferentialCohesion": number,
    "conceptualPrecision": number,
    "evidentialSupport": number,
    "counterargumentHandling": number,
    "cognitiveRisk": number,
    "epistemicControl": number
  },
  "paperBScores": {
    "clarityOfArgument": number,
    "inferentialCohesion": number,
    "conceptualPrecision": number,
    "evidentialSupport": number,
    "counterargumentHandling": number,
    "cognitiveRisk": number,
    "epistemicControl": number
  },
  "winner": "A or B or Tie",
  "detailedComparison": "comprehensive comparison analysis",
  "reasoning": "specific justification for winner selection"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: comparisonPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    const parsed = JSON.parse(content);

    // Calculate overall scores
    const paperAScores = Object.values(parsed.paperAScores) as number[];
    const paperBScores = Object.values(parsed.paperBScores) as number[];
    
    const paperAOverall = Math.round(paperAScores.reduce((a, b) => a + b, 0) / paperAScores.length);
    const paperBOverall = Math.round(paperBScores.reduce((a, b) => a + b, 0) / paperBScores.length);

    const winnerScore = parsed.winner === 'A' ? paperAOverall : parsed.winner === 'B' ? paperBOverall : Math.max(paperAOverall, paperBOverall);

    const result: EnhancedArgumentativeResult = {
      comparativeAnalysis: {
        winner: parsed.winner,
        winnerScore,
        paperAScore: paperAOverall,
        paperBScore: paperBOverall,
        paperASummary: parsed.paperASummary,
        paperBSummary: parsed.paperBSummary,
        paperASuperiorReconstruction: parsed.paperASuperiorReconstruction,
        paperBSuperiorReconstruction: parsed.paperBSuperiorReconstruction,
        comparisonBreakdown: {
          paperA: parsed.paperAScores,
          paperB: parsed.paperBScores
        },
        detailedComparison: parsed.detailedComparison,
        reasoning: parsed.reasoning
      },
      reportContent: await generateEnhancedComparativeReport(parsed, passageA.title, passageB.title, paperAOverall, paperBOverall)
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
  return `# COMPREHENSIVE ARGUMENTATIVE ANALYSIS REPORT

## Paper: ${title || "Untitled Document"}

### Executive Summary
**Overall Cogency Score:** ${overallScore}/100 (${cogencyLabel})

This report provides a comprehensive evaluation of the paper's argumentative strength across seven core parameters using a 0-100 scoring scale.

### Argument Summary
${analysis.argumentSummary}

### Superior Argument Reconstruction
${analysis.superiorReconstruction}

### Core Parameters Analysis

#### 1. Clarity of Argument (${analysis.clarityOfArgument.score}/100)
${analysis.clarityOfArgument.assessment}

**Supporting Quotes:**
${analysis.clarityOfArgument.quotes.map((q: string) => `> "${q}"`).join('\n')}

#### 2. Inferential Cohesion (${analysis.inferentialCohesion.score}/100)
${analysis.inferentialCohesion.assessment}

**Supporting Quotes:**
${analysis.inferentialCohesion.quotes.map((q: string) => `> "${q}"`).join('\n')}

#### 3. Conceptual Precision (${analysis.conceptualPrecision.score}/100)
${analysis.conceptualPrecision.assessment}

**Supporting Quotes:**
${analysis.conceptualPrecision.quotes.map((q: string) => `> "${q}"`).join('\n')}

#### 4. Evidential Support/Substantiation (${analysis.evidentialSupport.score}/100)
${analysis.evidentialSupport.assessment}

**Supporting Quotes:**
${analysis.evidentialSupport.quotes.map((q: string) => `> "${q}"`).join('\n')}

#### 5. Counterargument Handling (${analysis.counterargumentHandling.score}/100)
${analysis.counterargumentHandling.assessment}

**Supporting Quotes:**
${analysis.counterargumentHandling.quotes.map((q: string) => `> "${q}"`).join('\n')}

#### 6. Cognitive Risk (${analysis.cognitiveRisk.score}/100)
${analysis.cognitiveRisk.assessment}

**Supporting Quotes:**
${analysis.cognitiveRisk.quotes.map((q: string) => `> "${q}"`).join('\n')}

#### 7. Epistemic Control (${analysis.epistemicControl.score}/100)
${analysis.epistemicControl.assessment}

**Supporting Quotes:**
${analysis.epistemicControl.quotes.map((q: string) => `> "${q}"`).join('\n')}

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
  return `# COMPREHENSIVE COMPARATIVE ANALYSIS REPORT

## Papers Compared
**Paper A:** ${titleA || "Untitled Document A"} (Score: ${scoreA}/100)
**Paper B:** ${titleB || "Untitled Document B"} (Score: ${scoreB}/100)

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