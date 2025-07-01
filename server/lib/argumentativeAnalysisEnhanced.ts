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
    const prompt = `You are an expert evaluator of academic and philosophical argumentation. Provide a completely UNFILTERED assessment of this paper's COGENCY - how well it proves what it sets out to prove.

**COGENCY DEFINITION:**
- Cogency = logical convincingness and proof strength
- The ONLY consideration is: does the argument successfully make its case?
- Adjust expectations based on the NON-TRIVIALITY of what's being proven
- More ambitious claims require proportionally stronger evidence
- Trivial claims need minimal proof; groundbreaking claims need exceptional proof

**UNFILTERED EVALUATION PRINCIPLES:**
- Give your RAW, honest assessment without diplomatic softening
- Score based PURELY on logical convincingness 
- Technical sophistication and formal rigor are ASSETS, not barriers
- Mathematical proofs, formal logic, specialized terminology = POSITIVE
- Judge arguments by the standards of their own domain
- 95-100: Exceptional proof quality relative to claim difficulty
- 90-94: Strong proof quality, publication-ready work  
- 85-89: Good proof quality with minor logical gaps
- 80-84: Adequate proof with notable weaknesses
- 70-79: Weak proof, significant logical problems
- Below 70: Fundamentally flawed argumentation

**DOMAIN-SPECIFIC EVALUATION STANDARDS:**
- **Mathematical/Logical Papers**: Proof sketches are standard; reward compression when lemmas are well-known
- **Formal Logic**: Cogency = mathematical validity; counterarguments less critical than in humanities
- **Philosophy**: Balance formal rigor with argumentative discourse norms
- **Empirical Sciences**: Evidence standards differ from formal proofs

**CRITICAL GUARDRAILS:**
- Do NOT penalize texts for lack of counterargument unless they make broad universal claims without qualification
- Do NOT penalize exposition-based argumentation for lacking "evidence" - exposition IS the evidence in philosophical analysis
- Do NOT confuse philosophical exposition with unsupported assertion
- Do NOT assume logic only exists in numbered steps or syllogistic format
- Do NOT penalize compressed reasoning or implicit synthesis if conceptually sound

**COMMON RUBRIC ERRORS TO AVOID:**
- Don't penalize dense prose if distinctions are meaningful and sustained
- Don't penalize implicit transitions if inferential structure is coherent  
- Don't conflate stylistic clarity with argumentative cogency
- Don't conflate reader-friendliness with logical validity

**BE COMPLETELY HONEST AND DIRECT IN YOUR ASSESSMENT**

**PAPER TO ANALYZE:**
Title: ${passage.title}
${passage.text}

**REQUIRED ANALYSIS:**

1. **ARGUMENT SUMMARY**: Provide a factual summary of the paper's main argument

2. **SUPERIOR RECONSTRUCTION**: Write an actual improved version of the paper that strengthens weaknesses, fills gaps, and enhances clarity while preserving the core thesis. This should be a substantive rewrite with better explanations, stronger evidence, and clearer structure - NOT just tips or suggestions.

3. **COMPREHENSIVE EVALUATION** using 4 core parameters (25 points each = 100 total):

   **EVALUATE ARGUMENTATIVE COGENCY, NOT SURFACE RHETORIC:**
   
   - **Inferential Structure (25 points)**: Does the text develop positions with coherent internal logic? Reward compressed reasoning. Do NOT penalize implicit transitions if logic is sound.
   
   - **Conceptual Control (25 points)**: Does the author draw meaningful distinctions and sustain them throughout? Reward dense prose if conceptual distinctions are real and stable.
   
   - **Argumentative Integrity (25 points)**: Does the author follow through on initial commitments? Do conclusions align with framing and claims? Internal consistency matters.
   
   - **Synthesis & Integration (25 points)**: Does the text weave multiple thinkers/ideas into unified argumentative trajectory? Recognize synthesis even when implicit.

4. **OVERALL JUDGMENT**: Comprehensive assessment of argumentative merit

For each parameter, provide:
- Score (0-25): Assessment out of 25 points 
- Assessment (detailed explanation)
- Supporting quotes (2-3 relevant excerpts from the text)

Respond in valid JSON format:
{
  "argumentSummary": "factual summary of the main argument",
  "superiorReconstruction": "improved version of the argument",
  "inferentialStructure": {
    "score": number,
    "assessment": "detailed evaluation",
    "quotes": ["quote1", "quote2", "quote3"]
  },
  "conceptualControl": {
    "score": number,
    "assessment": "detailed evaluation", 
    "quotes": ["quote1", "quote2", "quote3"]
  },
  "argumentativeIntegrity": {
    "score": number,
    "assessment": "detailed evaluation",
    "quotes": ["quote1", "quote2", "quote3"]
  },
  "synthesisIntegration": {
    "score": number,
    "assessment": "detailed evaluation",
    "quotes": ["quote1", "quote2", "quote3"]
  },
  "overallJudgment": "comprehensive assessment of argumentative merit"
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
            clarityOfArgument: paperAAnalysis.singlePaperAnalysis.coreParameters.clarityOfArgument.score,
            inferentialCohesion: paperAAnalysis.singlePaperAnalysis.coreParameters.inferentialCohesion.score,
            conceptualPrecision: paperAAnalysis.singlePaperAnalysis.coreParameters.conceptualPrecision.score,
            evidentialSupport: paperAAnalysis.singlePaperAnalysis.coreParameters.evidentialSupport.score,
            counterargumentHandling: paperAAnalysis.singlePaperAnalysis.coreParameters.counterargumentHandling.score,
            cognitiveRisk: paperAAnalysis.singlePaperAnalysis.coreParameters.cognitiveRisk.score,
            epistemicControl: paperAAnalysis.singlePaperAnalysis.coreParameters.epistemicControl.score
          },
          paperB: {
            clarityOfArgument: paperBAnalysis.singlePaperAnalysis.coreParameters.clarityOfArgument.score,
            inferentialCohesion: paperBAnalysis.singlePaperAnalysis.coreParameters.inferentialCohesion.score,
            conceptualPrecision: paperBAnalysis.singlePaperAnalysis.coreParameters.conceptualPrecision.score,
            evidentialSupport: paperBAnalysis.singlePaperAnalysis.coreParameters.evidentialSupport.score,
            counterargumentHandling: paperBAnalysis.singlePaperAnalysis.coreParameters.counterargumentHandling.score,
            cognitiveRisk: paperBAnalysis.singlePaperAnalysis.coreParameters.cognitiveRisk.score,
            epistemicControl: paperBAnalysis.singlePaperAnalysis.coreParameters.epistemicControl.score
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
          clarityOfArgument: paperAAnalysis.singlePaperAnalysis.coreParameters.clarityOfArgument.score,
          inferentialCohesion: paperAAnalysis.singlePaperAnalysis.coreParameters.inferentialCohesion.score,
          conceptualPrecision: paperAAnalysis.singlePaperAnalysis.coreParameters.conceptualPrecision.score,
          evidentialSupport: paperAAnalysis.singlePaperAnalysis.coreParameters.evidentialSupport.score,
          counterargumentHandling: paperAAnalysis.singlePaperAnalysis.coreParameters.counterargumentHandling.score,
          cognitiveRisk: paperAAnalysis.singlePaperAnalysis.coreParameters.cognitiveRisk.score,
          epistemicControl: paperAAnalysis.singlePaperAnalysis.coreParameters.epistemicControl.score
        },
        paperBScores: {
          clarityOfArgument: paperBAnalysis.singlePaperAnalysis.coreParameters.clarityOfArgument.score,
          inferentialCohesion: paperBAnalysis.singlePaperAnalysis.coreParameters.inferentialCohesion.score,
          conceptualPrecision: paperBAnalysis.singlePaperAnalysis.coreParameters.conceptualPrecision.score,
          evidentialSupport: paperBAnalysis.singlePaperAnalysis.coreParameters.evidentialSupport.score,
          counterargumentHandling: paperBAnalysis.singlePaperAnalysis.coreParameters.counterargumentHandling.score,
          cognitiveRisk: paperBAnalysis.singlePaperAnalysis.coreParameters.cognitiveRisk.score,
          epistemicControl: paperBAnalysis.singlePaperAnalysis.coreParameters.epistemicControl.score
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