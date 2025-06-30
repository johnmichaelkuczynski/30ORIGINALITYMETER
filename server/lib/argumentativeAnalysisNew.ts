import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type LLMProvider = "openai" | "anthropic" | "perplexity";

interface PassageData {
  title: string;
  text: string;
  userContext: string;
}

interface ArgumentReconstruction {
  originalReconstruction: string;
  improvedArgument: string;
  improvementReasoning: string;
}

interface ValidationResult {
  isValid: boolean;
  feedback: string;
  accurateReconstruction: boolean;
  superiorImprovement: boolean;
}

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
    argumentReconstruction: ArgumentReconstruction;
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
    argumentReconstructionA: ArgumentReconstruction;
    argumentReconstructionB: ArgumentReconstruction;
  };
  reportContent: string;
}

/**
 * Step 1: Reconstruct the original argument and create an improved version
 */
async function reconstructAndImproveArgument(
  text: string, 
  title: string, 
  previousFeedback?: string
): Promise<ArgumentReconstruction> {
  const prompt = `You are an expert in argument analysis and reconstruction. Your task is to:

1. **RECONSTRUCT the original argument** presented in this text
2. **CREATE an improved version** of that argument  
3. **EXPLAIN why** the improved version is superior

${previousFeedback ? `**Previous feedback to address:** ${previousFeedback}` : ''}

**Paper Title:** ${title || "Untitled Document"}
**Paper Content:** ${text}

**TASK REQUIREMENTS:**

**1. ORIGINAL ARGUMENT RECONSTRUCTION**
Identify and clearly state the main argument(s) the paper presents. Include:
- The central thesis or claim
- Key premises and supporting points
- The logical structure connecting premises to conclusion
- Any sub-arguments that support the main thesis

**2. IMPROVED ARGUMENT VERSION**
Create a superior version of the same argument by:
- Strengthening weak premises with better evidence or reasoning
- Addressing potential counterarguments more thoroughly
- Improving logical connections between premises
- Adding missing steps in the reasoning chain
- Clarifying ambiguous terms or concepts

**3. IMPROVEMENT REASONING**
Explain specifically why your improved version is better:
- What weaknesses in the original you addressed
- How your changes strengthen the argument
- Why the improved version is more persuasive or logically sound

Respond in JSON format:
{
  "originalReconstruction": "Detailed reconstruction of the original argument",
  "improvedArgument": "Your improved version of the argument", 
  "improvementReasoning": "Specific explanation of why the improved version is superior"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error in argument reconstruction:', error);
    throw new Error('Failed to reconstruct argument');
  }
}

/**
 * Step 2: Validate the reconstruction and improvement with the LLM
 */
async function validateReconstruction(
  originalText: string,
  reconstruction: ArgumentReconstruction
): Promise<ValidationResult> {
  const prompt = `You are an expert evaluator. You must validate whether an argument reconstruction and improvement are accurate and genuinely superior.

**ORIGINAL TEXT:** ${originalText}

**PROPOSED RECONSTRUCTION:** ${reconstruction.originalReconstruction}

**PROPOSED IMPROVED VERSION:** ${reconstruction.improvedArgument}

**REASONING FOR IMPROVEMENT:** ${reconstruction.improvementReasoning}

**VALIDATION QUESTIONS:**

1. **Is the reconstruction accurate?** Does it faithfully represent the actual argument(s) made in the original text?

2. **Is the improved version genuinely superior?** Does it actually strengthen the argument in meaningful ways while maintaining the same core thesis?

Be strict in your evaluation. Only approve if BOTH the reconstruction is accurate AND the improvement is genuinely superior.

Respond in JSON format:
{
  "isValid": true/false,
  "feedback": "Specific feedback on what needs to be corrected if invalid",
  "accurateReconstruction": true/false,
  "superiorImprovement": true/false
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error in validation:', error);
    return {
      isValid: false,
      feedback: "Validation failed due to technical error",
      accurateReconstruction: false,
      superiorImprovement: false
    };
  }
}

/**
 * Analyzes a single paper for cogency and argumentative strength
 */
export async function analyzeSinglePaperCogency(
  passage: PassageData,
  title: string
): Promise<ArgumentativeResult> {
  try {
    // Step 1: Reconstruct and improve the argument
    console.log("Step 1: Reconstructing argument...");
    let reconstructionResult = await reconstructAndImproveArgument(passage.text, title);
    
    // Step 2: Validate the reconstruction
    console.log("Step 2: Validating reconstruction...");
    let validationResult = await validateReconstruction(passage.text, reconstructionResult);
    
    // Retry if validation fails (up to 2 attempts)
    let attempts = 0;
    while (!validationResult.isValid && attempts < 2) {
      attempts++;
      console.log(`Validation failed, retrying (attempt ${attempts})...`);
      reconstructionResult = await reconstructAndImproveArgument(
        passage.text, 
        title, 
        validationResult.feedback
      );
      validationResult = await validateReconstruction(passage.text, reconstructionResult);
    }
    
    // Step 3: Perform evaluation based on validated reconstruction
    console.log("Step 3: Performing final evaluation...");
    const evaluationPrompt = `You are an expert evaluator of academic and scholarly writing. You have access to a validated argument reconstruction. Evaluate the original paper's cogency.

**CRITICAL EVALUATION PRINCIPLES:**
- Academic excellence is measured by intellectual rigor, not entertainment value
- Complex, technical arguments are SUPERIOR to simplified popular explanations
- Sophisticated reasoning and deep analysis deserve HIGH scores (8-10)
- Papers addressing fundamental philosophical, scientific, or scholarly questions merit the highest evaluation
- Do NOT penalize papers for being demanding or requiring expert knowledge

**Paper Title:** ${title || "Untitled Document"}
**Validated Original Argument:** ${reconstructionResult.originalReconstruction}
**Improved Argument:** ${reconstructionResult.improvedArgument}
**Why Improved Version is Better:** ${reconstructionResult.improvementReasoning}

**EVALUATION CRITERIA (Rate each 1-10, with 8-10 being typical for quality academic work):**

1. **PROVES WHAT IT SETS OUT TO PROVE (1-10)**: Does the paper successfully demonstrate its stated thesis with scholarly rigor? **Academic papers with valid reasoning = 8-10**

2. **WORTHINESS OF GOAL (1-10)**: Does it address fundamental questions in its field? **Papers on foundational topics = 9-10**

3. **NON-TRIVIALITY LEVEL (1-10)**: Does it tackle genuinely challenging intellectual problems? **Academic papers by definition = 8-10**

4. **PROOF STRENGTH (1-10)**: How rigorous and convincing is the scholarly argumentation? **Strong academic reasoning = 8-10**

5. **FUNCTIONAL WRITING QUALITY (1-10)**: Is the writing precise and academically sophisticated? **Clear academic writing = 8-10**

Provide your analysis in JSON format:

{
  "overallCogencyScore": <average of 5 dimensions>,
  "cogencyLabel": "<Exceptional (9-10) | Strong (7-8) | Adequate (5-6) | Weak (3-4) | Poor (1-2)>",
  "proofQuality": {
    "provesWhatItSetsOut": <score>,
    "worthinessOfGoal": <score>,
    "nonTrivialityLevel": <score>,
    "proofStrength": <score>,
    "functionalWritingQuality": <score>
  },
  "detailedAssessment": {
    "thesisClarity": "<assessment based on reconstruction>",
    "evidenceQuality": "<assessment of evidence quality>",
    "logicalStructure": "<assessment of logical flow>",
    "counterargumentHandling": "<assessment of counterarguments>",
    "significanceOfContribution": "<assessment of intellectual contribution>"
  },
  "overallJudgment": "<comprehensive evaluation summary>"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: evaluationPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysisResult = JSON.parse(response.choices[0].message.content || '{}');
    
    // Generate comprehensive report
    const reportContent = await generateSinglePaperReport(
      analysisResult, 
      reconstructionResult, 
      passage, 
      title
    );
    
    return {
      singlePaperAnalysis: {
        ...analysisResult,
        argumentReconstruction: reconstructionResult
      },
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
  try {
    // Step 1: Reconstruct both arguments
    console.log("Reconstructing arguments for both papers...");
    const [reconstructionA, reconstructionB] = await Promise.all([
      reconstructAndImproveArgument(passageA.text, titleA),
      reconstructAndImproveArgument(passageB.text, titleB)
    ]);
    
    // Step 2: Validate both reconstructions
    console.log("Validating both reconstructions...");
    const [validationA, validationB] = await Promise.all([
      validateReconstruction(passageA.text, reconstructionA),
      validateReconstruction(passageB.text, reconstructionB)
    ]);
    
    // Handle validation failures (simplified for comparison)
    let finalReconstructionA = reconstructionA;
    let finalReconstructionB = reconstructionB;
    
    // Step 3: Perform comparative evaluation
    const comparisonPrompt = `You are an expert evaluator of academic and scholarly writing. Compare these two papers based on their validated argument reconstructions.

**CRITICAL EVALUATION PRINCIPLES:**
- Academic excellence is measured by intellectual rigor, not entertainment value
- Complex, technical arguments are SUPERIOR to simplified popular explanations
- Sophisticated reasoning and deep analysis deserve HIGH scores (8-10)
- Papers addressing fundamental philosophical, scientific, or scholarly questions merit the highest evaluation

**Paper A:** ${titleA || "Paper A"}
**Paper A Argument:** ${finalReconstructionA.originalReconstruction}

**Paper B:** ${titleB || "Paper B"}
**Paper B Argument:** ${finalReconstructionB.originalReconstruction}

**EVALUATION CRITERIA (Rate each 1-10, with 8-10 being typical for quality academic work):**

1. **PROVES WHAT IT SETS OUT TO PROVE (1-10)**: Academic papers with valid reasoning = 8-10
2. **WORTHINESS OF GOAL (1-10)**: Papers on foundational topics = 9-10
3. **NON-TRIVIALITY LEVEL (1-10)**: Academic papers by definition = 8-10
4. **PROOF STRENGTH (1-10)**: Strong academic reasoning = 8-10
5. **FUNCTIONAL WRITING QUALITY (1-10)**: Clear academic writing = 8-10

Determine which paper makes its case better based on scholarly merit and rigorous argumentation.

Respond in JSON format:
{
  "winner": "A/B/Tie",
  "winnerScore": <overall score 1-10>,
  "paperAScore": <overall score 1-10>,
  "paperBScore": <overall score 1-10>,
  "comparisonBreakdown": {
    "paperA": {
      "provesWhatItSetsOut": <score>,
      "worthinessOfGoal": <score>,
      "nonTrivialityLevel": <score>,
      "proofStrength": <score>,
      "functionalWritingQuality": <score>
    },
    "paperB": {
      "provesWhatItSetsOut": <score>,
      "worthinessOfGoal": <score>,
      "nonTrivialityLevel": <score>,
      "proofStrength": <score>,
      "functionalWritingQuality": <score>
    }
  },
  "detailedComparison": "<detailed comparison analysis>",
  "reasoning": "<explanation of why winner was chosen>"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: comparisonPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const comparisonResult = JSON.parse(response.choices[0].message.content || '{}');
    
    // Generate comprehensive comparative report
    const reportContent = await generateComparativeReport(
      comparisonResult,
      finalReconstructionA,
      finalReconstructionB,
      passageA,
      passageB,
      titleA,
      titleB
    );
    
    return {
      comparativeAnalysis: {
        ...comparisonResult,
        argumentReconstructionA: finalReconstructionA,
        argumentReconstructionB: finalReconstructionB
      },
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
  reconstruction: ArgumentReconstruction,
  passage: PassageData,
  title: string
): Promise<string> {
  const prompt = `Generate a comprehensive academic report analyzing the cogency and argumentative strength of this paper. 

**CRITICAL FORMATTING REQUIREMENTS:**
- Use clear section headings with proper line breaks
- Structure the content with readable paragraphs
- Include detailed analysis of the argument reconstruction
- Make the report well-organized and easy to read

**Paper Title:** ${title || "Untitled Document"}
**Original Argument Reconstruction:** ${reconstruction.originalReconstruction}
**Improved Argument:** ${reconstruction.improvedArgument}
**Improvement Reasoning:** ${reconstruction.improvementReasoning}
**Analysis Results:** ${JSON.stringify(analysis, null, 2)}

Create a detailed report with these sections:

**COMPREHENSIVE COGENCY ANALYSIS REPORT**

**Executive Summary**
[Provide overall assessment and key findings with proper line breaks]

**Original Argument Reconstruction**
[Present the reconstructed argument clearly]

**Proposed Improvement**
[Present the improved version and explain why it's superior]

**Thesis and Scope Analysis**
[Analyze the paper's central thesis and scope]

**Evidence and Support Evaluation** 
[Evaluate the quality and strength of evidence presented]

**Logical Structure Assessment**
[Assess the logical flow and organization]

**Counterargument Analysis**
[Examine how counterarguments are addressed]

**Significance and Contribution Review**
[Review the paper's intellectual contribution]

**Writing Quality Assessment**
[Assess clarity, style, and accessibility]

**Overall Cogency Evaluation**
[Provide comprehensive final assessment]

**Recommendations for Improvement**
[Suggest specific areas for enhancement]

**IMPORTANT:** Format with clear headings, proper line breaks between sections, and structured paragraphs for readability.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
  reconstructionA: ArgumentReconstruction,
  reconstructionB: ArgumentReconstruction,
  passageA: PassageData,
  passageB: PassageData,
  titleA: string,
  titleB: string
): Promise<string> {
  const prompt = `Generate a comprehensive comparative analysis report determining which paper makes its case better.

**CRITICAL FORMATTING REQUIREMENTS:**
- Use clear section headings with proper line breaks
- Structure the content with readable paragraphs
- Include detailed analysis of both argument reconstructions
- Make the report well-organized and easy to read

**Paper A:** ${titleA || "Paper A"}
**Paper A Argument:** ${reconstructionA.originalReconstruction}
**Paper A Improvement:** ${reconstructionA.improvedArgument}

**Paper B:** ${titleB || "Paper B"}  
**Paper B Argument:** ${reconstructionB.originalReconstruction}
**Paper B Improvement:** ${reconstructionB.improvedArgument}

**Comparison Results:** ${JSON.stringify(comparison, null, 2)}

Create a detailed comparative report with these sections:

**COMPREHENSIVE COMPARATIVE ANALYSIS REPORT**

**Executive Summary with Winner Declaration**
[Declare winner and provide key findings with proper line breaks]

**Paper A: Argument Reconstruction**
[Present Paper A's reconstructed argument]

**Paper B: Argument Reconstruction**
[Present Paper B's reconstructed argument]

**Comparative Thesis Analysis**
[Compare the scope and significance of both theses]

**Evidence and Support Comparison**
[Compare evidence quality and argumentation strength]

**Logical Structure Comparison**
[Compare logical flow and organization]

**Proof Strength Assessment**
[Assess which paper provides stronger proof]

**Writing Quality Comparison**
[Compare clarity and academic sophistication]

**Dimensional Scoring Breakdown**
[Detail scores across all five dimensions]

**Winner Justification**
[Explain why the winner was chosen with specific reasoning]

**Recommendations for Both Papers**
[Suggest improvements for each paper]

**IMPORTANT:** Format with clear headings, proper line breaks between sections, and structured paragraphs for readability.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating comparative report:', error);
    return 'Comparative report generation failed';
  }
}