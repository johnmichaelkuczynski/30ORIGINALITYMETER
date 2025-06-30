import OpenAI from "openai";

interface PassageData {
  title: string;
  text: string;
  userContext: string;
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ArgumentativeResult {
  singlePaperAnalysis?: {
    overallCogencyScore: number;
    cogencyLabel: string;
    proofQuality: {
      provesWhatItSetsOut: number;
      worthinessOfGoal: number;
      nonTrivialityLevel: number;
      proofStrength: number;
      functionalWritingQuality: number;
    };
    detailedAssessment: {
      thesisClarity: string;
      evidenceQuality: string;
      logicalStructure: string;
      counterargumentHandling: string;
      significanceOfContribution: string;
    };
    overallJudgment: string;
  };
  comparativeAnalysis?: {
    winner: 'A' | 'B' | 'Tie';
    winnerScore: number;
    paperAScore: number;
    paperBScore: number;
    comparisonBreakdown: {
      paperA: {
        provesWhatItSetsOut: number;
        worthinessOfGoal: number;
        nonTrivialityLevel: number;
        proofStrength: number;
        functionalWritingQuality: number;
      };
      paperB: {
        provesWhatItSetsOut: number;
        worthinessOfGoal: number;
        nonTrivialityLevel: number;
        proofStrength: number;
        functionalWritingQuality: number;
      };
    };
    detailedComparison: string;
    reasoning: string;
  };
  reportContent: string;
}

/**
 * Analyzes a single paper for cogency and argumentative strength
 */
export async function analyzeSinglePaperCogency(
  passage: PassageData,
  title: string
): Promise<ArgumentativeResult> {
  const prompt = `You are an expert academic evaluator specializing in argumentative analysis and proof assessment. Analyze the following paper for its argumentative cogency and strength.

Paper Title: ${title || "Untitled Document"}
Paper Content: ${passage.text}

Evaluate this paper on the following dimensions and provide scores from 1-10:

1. PROVES WHAT IT SETS OUT TO PROVE (1-10): Does the paper successfully establish its thesis or research question?
2. WORTHINESS OF GOAL (1-10): Is what the paper attempts to prove valuable, significant, and worth proving?
3. NON-TRIVIALITY LEVEL (1-10): How non-trivial and substantial is the contribution? Does it go beyond obvious claims?
4. PROOF STRENGTH (1-10): How rigorous, convincing, and well-supported is the argumentation?
5. FUNCTIONAL WRITING QUALITY (1-10): How effectively written is the paper from a functional perspective (clarity, structure, accessibility)?

Provide your analysis in the following JSON format:

{
  "overallCogencyScore": [1-10],
  "cogencyLabel": "[Exceptional/Strong/Adequate/Weak/Poor]",
  "proofQuality": {
    "provesWhatItSetsOut": [1-10],
    "worthinessOfGoal": [1-10], 
    "nonTrivialityLevel": [1-10],
    "proofStrength": [1-10],
    "functionalWritingQuality": [1-10]
  },
  "detailedAssessment": {
    "thesisClarity": "[2-3 sentence assessment of thesis clarity and definition]",
    "evidenceQuality": "[2-3 sentence assessment of evidence and support quality]",
    "logicalStructure": "[2-3 sentence assessment of logical organization and flow]", 
    "counterargumentHandling": "[2-3 sentence assessment of how counterarguments are addressed]",
    "significanceOfContribution": "[2-3 sentence assessment of the paper's significance and contribution]"
  },
  "overallJudgment": "[Comprehensive 4-5 sentence overall assessment of the paper's cogency and argumentative strength]"
}

Be thorough, objective, and provide specific reasoning for your scores.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysisResult = JSON.parse(response.choices[0].message.content || '{}');
    
    // Generate comprehensive report
    const reportContent = await generateSinglePaperReport(analysisResult, passage, title);
    
    return {
      singlePaperAnalysis: analysisResult,
      reportContent
    };
  } catch (error) {
    console.error('Error in single paper cogency analysis:', error);
    throw new Error('Failed to analyze paper cogency');
  }
}

/**
 * Compares two papers to determine which makes its case better
 */
export async function compareArgumentativeStrength(
  passageA: PassageData,
  passageB: PassageData,
  titleA: string,
  titleB: string
): Promise<ArgumentativeResult> {
  const prompt = `You are an expert academic evaluator specializing in comparative argumentative analysis. Compare these two papers to determine which makes its case better.

Paper A Title: ${titleA || "Paper A"}
Paper A Content: ${passageA.text}

Paper B Title: ${titleB || "Paper B"}  
Paper B Content: ${passageB.text}

Evaluate each paper on these dimensions (1-10 scale):
1. PROVES WHAT IT SETS OUT TO PROVE: Success in establishing thesis/research question
2. WORTHINESS OF GOAL: Value and significance of what it attempts to prove
3. NON-TRIVIALITY LEVEL: Substantiality and depth of contribution
4. PROOF STRENGTH: Rigor and persuasiveness of argumentation  
5. FUNCTIONAL WRITING QUALITY: Clarity, structure, and accessibility

Determine which paper makes its case better and provide detailed comparison.

Respond in JSON format:

{
  "winner": "[A/B/Tie]",
  "winnerScore": [overall score 1-10],
  "paperAScore": [overall score 1-10],
  "paperBScore": [overall score 1-10],
  "comparisonBreakdown": {
    "paperA": {
      "provesWhatItSetsOut": [1-10],
      "worthinessOfGoal": [1-10],
      "nonTrivialityLevel": [1-10], 
      "proofStrength": [1-10],
      "functionalWritingQuality": [1-10]
    },
    "paperB": {
      "provesWhatItSetsOut": [1-10],
      "worthinessOfGoal": [1-10],
      "nonTrivialityLevel": [1-10],
      "proofStrength": [1-10], 
      "functionalWritingQuality": [1-10]
    }
  },
  "detailedComparison": "[Comprehensive 6-8 sentence comparison of the papers' argumentative strengths and weaknesses]",
  "reasoning": "[4-5 sentence explanation of why the winner was chosen and key differentiating factors]"
}

Be objective, specific, and provide clear reasoning for your judgments.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const comparisonResult = JSON.parse(response.choices[0].message.content || '{}');
    
    // Generate comprehensive report
    const reportContent = await generateComparativeReport(comparisonResult, passageA, passageB, titleA, titleB);
    
    return {
      comparativeAnalysis: comparisonResult,
      reportContent
    };
  } catch (error) {
    console.error('Error in comparative argumentative analysis:', error);
    throw new Error('Failed to compare argumentative strength');
  }
}

/**
 * Generates a comprehensive report for single paper analysis
 */
async function generateSinglePaperReport(
  analysis: any,
  passage: PassageData,
  title: string
): Promise<string> {
  const prompt = `Generate a comprehensive academic report analyzing the cogency and argumentative strength of this paper.

Paper Title: ${title || "Untitled Document"}
Analysis Results: ${JSON.stringify(analysis, null, 2)}

Create a detailed report (800-1200 words) that includes:

1. Executive Summary
2. Thesis and Scope Analysis  
3. Evidence and Support Evaluation
4. Logical Structure Assessment
5. Counterargument Analysis
6. Significance and Contribution Review
7. Writing Quality Assessment
8. Overall Cogency Evaluation
9. Recommendations for Improvement

Use professional academic language with specific examples and detailed reasoning. Format with clear headings and comprehensive analysis.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating single paper report:', error);
    return 'Report generation failed';
  }
}

/**
 * Generates a comprehensive comparative report
 */
async function generateComparativeReport(
  comparison: any,
  passageA: PassageData,
  passageB: PassageData,
  titleA: string,
  titleB: string
): Promise<string> {
  const prompt = `Generate a comprehensive comparative analysis report determining which paper makes its case better.

Paper A: ${titleA || "Paper A"}
Paper B: ${titleB || "Paper B"}
Comparison Results: ${JSON.stringify(comparison, null, 2)}

Create a detailed report (1000-1500 words) that includes:

1. Executive Summary with Winner Declaration
2. Comparative Thesis Analysis
3. Evidence and Support Comparison
4. Argumentative Structure Assessment
5. Proof Strength Evaluation
6. Writing Quality Comparison
7. Significance and Impact Analysis
8. Detailed Scoring Breakdown
9. Key Differentiating Factors
10. Final Judgment and Recommendations

Use professional academic language with specific examples, detailed reasoning, and clear comparative analysis. Format with clear headings and comprehensive evaluation.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating comparative report:', error);
    return 'Report generation failed';
  }
}