import { PassageData } from "../../client/src/lib/types";

const apiKey = process.env.DEEPSEEK_API_KEY;
console.log("DeepSeek API Key status:", apiKey ? "Present" : "Missing");

// SINGLE-PHASE EVALUATION PROTOCOL FOR DEEPSEEK (Simplified for stability)
async function evaluateWithDeepSeek(
  passageText: string, 
  questions: string[], 
  evaluationType: string
): Promise<any> {
  
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  console.log(`Starting ${evaluationType} evaluation for text length: ${passageText.length}`);

  // Simplified evaluation to avoid timeouts
  const prompt = `Analyze this text and score each metric 0-100. Return JSON only.

TEXT: ${passageText}

Score these metrics against general population (not academic standards):
${questions.map((q, i) => `${i}. ${q}`).join('\n')}

JSON format:
{
  "0": {"question": "${questions[0]}", "score": 50, "quotation": "text quote", "explanation": "brief analysis"},
  "1": {"question": "${questions[1]}", "score": 50, "quotation": "text quote", "explanation": "brief analysis"}
}`;

  try {
    console.log('Making DeepSeek API call...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.1,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    console.log('DeepSeek API call successful');
    
    // Parse response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse JSON response");
      }
    }

    // Add metadata and return
    return {
      ...result,
      provider: "DeepSeek",
      analysis_type: evaluationType,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error in ${evaluationType} evaluation:`, error);
    throw error;
  }
}

// INTELLIGENCE QUESTIONS (Simplified set for testing stability)
const INTELLIGENCE_QUESTIONS = [
  "Compression: density of meaning per word.",
  "Abstraction: ability to move beyond concrete particulars to broader principles or patterns.",
  "Synthesis: bringing together disparate elements to form coherent, unified understanding."
];

// ORIGINALITY QUESTIONS (9 questions from user protocol)  
const ORIGINALITY_QUESTIONS = [
  "Transformational Synthesis: Does the author transform inherited ideas through creative combination rather than simply aggregating existing views?",
  "Conceptual Innovation: Does the work introduce genuinely new concepts, frameworks, or ways of thinking?",
  "Novel Perspective: Does the author offer a fresh angle or viewpoint that hasn't been widely considered in the domain?",
  "Creative Problem-Solving: Does the work present innovative solutions to existing problems or identify previously unrecognized problems?",
  "Paradigm Extension: Does the work push beyond conventional boundaries or challenge established paradigms?",
  "Synthetic Originality: Does the author create new understanding by synthesizing ideas from different domains in ways not previously attempted?",
  "Methodological Innovation: Does the work introduce new methods, approaches, or analytical techniques?",
  "Counter-Intuitive Insights: Does the work reveal surprising truths that go against conventional wisdom or obvious assumptions?",
  "Generative Potential: Does the work open up new lines of inquiry or research directions?"
];

// COGENCY QUESTIONS (12 questions from user protocol)
const COGENCY_QUESTIONS = [
  "Argumentative Continuity: Is each claim supported by those before it?",
  "Logical Consistency: Are all statements and conclusions free from contradiction?",
  "Evidence Quality: Is the supporting evidence relevant, sufficient, and credible?",
  "Reasoning Validity: Do conclusions follow logically from premises?",
  "Premise Strength: Are the foundational assumptions reasonable and well-justified?",
  "Counter-argument Consideration: Are alternative views acknowledged and addressed?",
  "Coherent Structure: Does the argument follow a clear, logical progression?",
  "Definitional Clarity: Are key terms and concepts clearly defined and consistently used?",
  "Scope Appropriateness: Are claims limited to what the evidence actually supports?",
  "Causal Reasoning: Are cause-effect relationships properly established and justified?",
  "Inference Quality: Are implicit reasoning steps sound and warranted?",
  "Conclusion Proportionality: Are conclusions proportionate to the strength of supporting arguments?"
];

// OVERALL QUALITY QUESTIONS (14 questions from user protocol)
const OVERALL_QUALITY_QUESTIONS = [
  "Conceptual Compression: How much conceptual work is done per unit of text?",
  "Intellectual Density: How much thinking and analysis is packed into the writing?",
  "Precision of Expression: How exactly does the language convey intended meanings?",
  "Depth of Insight: How profound are the understandings revealed?",
  "Explanatory Power: How well does the work illuminate its subject matter?",
  "Practical Significance: How much does this matter for understanding or action?",
  "Theoretical Contribution: How much does this advance our conceptual understanding?",
  "Integration Achievement: How successfully does the work synthesize complex material?",
  "Clarity of Communication: How effectively are complex ideas made accessible?",
  "Analytical Rigor: How thorough and systematic is the examination?",
  "Evidence Integration: How skillfully is supporting material woven into the argument?",
  "Contextual Awareness: How well does the work situate itself within relevant discourse?",
  "Problem Significance: How important are the issues being addressed?",
  "Solution Quality: How effective are proposed answers or approaches?"
];

// Export analysis functions
export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  return evaluateWithDeepSeek(passage.text, INTELLIGENCE_QUESTIONS, "intelligence");
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  return evaluateWithDeepSeek(passage.text, ORIGINALITY_QUESTIONS, "originality");
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  return evaluateWithDeepSeek(passage.text, COGENCY_QUESTIONS, "cogency");
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  return evaluateWithDeepSeek(passage.text, OVERALL_QUALITY_QUESTIONS, "overall_quality");
}

// Dual analysis functions - USE SAME METHODOLOGY AS SINGLE ANALYSIS
export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  console.log("Starting dual intelligence analysis using single analysis methodology");
  
  try {
    // Analyze each passage separately using the SAME method as single analysis
    const resultA = await evaluateWithDeepSeek(passageA.text, INTELLIGENCE_QUESTIONS, "intelligence");
    const resultB = await evaluateWithDeepSeek(passageB.text, INTELLIGENCE_QUESTIONS, "intelligence");
    
    // Combine results into dual format expected by frontend
    const combinedResult: any = {};
    
    // For each metric, combine the results from both passages
    INTELLIGENCE_QUESTIONS.forEach((question, index) => {
      const key = index.toString();
      combinedResult[key] = {
        question: question,
        passageA: resultA[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" },
        passageB: resultB[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" }
      };
    });
    
    return {
      ...combinedResult,
      provider: "DeepSeek",
      analysis_type: "intelligence_dual",
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error in dual intelligence evaluation:", error);
    throw error;
  }
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  console.log("Starting dual originality analysis using single analysis methodology");
  
  try {
    const resultA = await evaluateWithDeepSeek(passageA.text, ORIGINALITY_QUESTIONS, "originality");
    const resultB = await evaluateWithDeepSeek(passageB.text, ORIGINALITY_QUESTIONS, "originality");
    
    const combinedResult: any = {};
    ORIGINALITY_QUESTIONS.forEach((question, index) => {
      const key = index.toString();
      combinedResult[key] = {
        question: question,
        passageA: resultA[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" },
        passageB: resultB[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" }
      };
    });
    
    return {
      ...combinedResult,
      provider: "DeepSeek",
      analysis_type: "originality_dual",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in dual originality evaluation:", error);
    throw error;
  }
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  console.log("Starting dual cogency analysis using single analysis methodology");
  
  try {
    const resultA = await evaluateWithDeepSeek(passageA.text, COGENCY_QUESTIONS, "cogency");
    const resultB = await evaluateWithDeepSeek(passageB.text, COGENCY_QUESTIONS, "cogency");
    
    const combinedResult: any = {};
    COGENCY_QUESTIONS.forEach((question, index) => {
      const key = index.toString();
      combinedResult[key] = {
        question: question,
        passageA: resultA[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" },
        passageB: resultB[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" }
      };
    });
    
    return {
      ...combinedResult,
      provider: "DeepSeek",
      analysis_type: "cogency_dual",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in dual cogency evaluation:", error);
    throw error;
  }
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  console.log("Starting dual quality analysis using single analysis methodology");
  
  try {
    const resultA = await evaluateWithDeepSeek(passageA.text, OVERALL_QUALITY_QUESTIONS, "overall_quality");
    const resultB = await evaluateWithDeepSeek(passageB.text, OVERALL_QUALITY_QUESTIONS, "overall_quality");
    
    const combinedResult: any = {};
    OVERALL_QUALITY_QUESTIONS.forEach((question, index) => {
      const key = index.toString();
      combinedResult[key] = {
        question: question,
        passageA: resultA[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" },
        passageB: resultB[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" }
      };
    });
    
    return {
      ...combinedResult,
      provider: "DeepSeek",
      analysis_type: "quality_dual",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in dual quality evaluation:", error);
    throw error;
  }
}

// Note: Removed evaluateWithDeepSeekDual function as dual analysis now uses 
// the same single-document methodology for consistency

// Basic analysis functions (placeholder)
export async function analyzePassages(passageA: PassageData, passageB: PassageData): Promise<any> {
  throw new Error("Comparative analysis not yet implemented for DeepSeek");
}

export async function extractText(file: any): Promise<string> {
  throw new Error("Text extraction not implemented for DeepSeek");
}

export async function generateRewrite(originalText: string, targetStyle: any, supportingDocs?: any[]): Promise<any> {
  throw new Error("Text rewriting not implemented for DeepSeek");
}