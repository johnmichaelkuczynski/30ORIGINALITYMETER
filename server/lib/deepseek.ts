import OpenAI from "openai";

interface PassageData {
  title: string;
  text: string;
  userContext?: string;
}

interface AnalysisResult {
  originality: number;
  coherence: number;
  accuracy: number;
  depth: number;
  clarity: number;
  derivative_index: number;
  conceptual_distance: number;
  lineage_score: number;
  semantic_novelty: number;
  explanation: string;
  recommendations: string;
  comparative_analysis?: string;
}

// DeepSeek API configuration using OpenAI-compatible interface
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1"
});

export interface AdvancedComparisonResult {
  originality_score: number;
  is_ripoff: boolean;
  is_development: boolean;
  development_mode: string;
  development_strength: number;
  doctrinal_alignment: {
    alignment_score: number;
    type: string;
    affinity_axis: string;
  };
  psychological_profiles: {
    text_a: {
      interests: string[];
      bias: string[];
      cognitive_strength: string[];
      posture: string;
    };
    text_b: {
      interests: string[];
      bias: string[];
      cognitive_strength: string[];
      posture: string;
    };
    match_score: number;
    narrative_relationship: string;
  };
  summary: string;
}

export async function analyzePassages(
  passageA: PassageData,
  passageB: PassageData
): Promise<AnalysisResult> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");

  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from DeepSeek");
    }

    let result: AnalysisResult;
    try {
      const parsed = JSON.parse(content);
      result = {
        originality: Math.max(0, Math.min(10, Number(parsed.originality) || 0)),
        coherence: Math.max(0, Math.min(10, Number(parsed.coherence) || 0)),
        accuracy: Math.max(0, Math.min(10, Number(parsed.accuracy) || 0)),
        depth: Math.max(0, Math.min(10, Number(parsed.depth) || 0)),
        clarity: Math.max(0, Math.min(10, Number(parsed.clarity) || 0)),
        derivative_index: Math.max(0, Math.min(10, Number(parsed.derivative_index) || 0)),
        conceptual_distance: Math.max(0, Math.min(10, Number(parsed.conceptual_distance) || 0)),
        lineage_score: Math.max(0, Math.min(10, Number(parsed.lineage_score) || 0)),
        semantic_novelty: Math.max(0, Math.min(10, Number(parsed.semantic_novelty) || 0)),
        explanation: parsed.explanation || "Analysis completed.",
        recommendations: parsed.recommendations || "Continue developing your ideas.",
        comparative_analysis: parsed.comparative_analysis || "Both passages analyzed."
      };
    } catch (parseError) {
      console.error("Error parsing DeepSeek JSON response:", parseError);
      throw new Error("Invalid JSON response from DeepSeek");
    }

    return result;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw new Error(`DeepSeek analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeSinglePassage(
  passage: PassageData
): Promise<AnalysisResult> {
  // For single passage analysis, we compare against a generic academic standard
  const comparisonPassage: PassageData = {
    title: "Academic Standard",
    text: "High-quality academic writing demonstrates clear thesis development, rigorous evidence evaluation, logical argumentation, and original insights that advance scholarly discourse.",
    userContext: "Standard academic expectations"
  };

  return analyzePassages(passage, comparisonPassage);
}

export async function generateTextFromNL(
  naturalLanguagePrompt: string,
  context?: string
): Promise<string> {
  const prompt = `${context ? `Context: ${context}\n\n` : ""}Generate high-quality text based on this request: ${naturalLanguagePrompt}

Provide thoughtful, well-structured content that demonstrates intellectual rigor and originality.`;

  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 3000
    });

    return response.choices[0].message.content || "Unable to generate content.";
  } catch (error) {
    console.error("Error in DeepSeek text generation:", error);
    throw new Error(`DeepSeek text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function advancedComparison(
  textA: PassageData,
  textB: PassageData
): Promise<AdvancedComparisonResult> {
  const prompt = `Perform an advanced comparative analysis of these two texts with psychological profiling and doctrinal alignment assessment.

TEXT A: ${textA.title}
${textA.text}

TEXT B: ${textB.title}  
${textB.text}

Analyze and provide a structured response with:
1. Originality score (0-10)
2. Whether one is a ripoff of the other
3. Development relationship analysis
4. Doctrinal alignment assessment
5. Psychological profiles of both authors
6. Comprehensive summary

Respond in valid JSON format matching this structure:
{
  "originality_score": number,
  "is_ripoff": boolean,
  "is_development": boolean,
  "development_mode": string,
  "development_strength": number,
  "doctrinal_alignment": {
    "alignment_score": number,
    "type": string,
    "affinity_axis": string
  },
  "psychological_profiles": {
    "text_a": {
      "interests": string[],
      "bias": string[],
      "cognitive_strength": string[],
      "posture": string
    },
    "text_b": {
      "interests": string[],
      "cognitive_strength": string[],
      "posture": string
    },
    "match_score": number,
    "narrative_relationship": string
  },
  "summary": string
}`;

  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from DeepSeek");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error in DeepSeek advanced comparison:", error);
    throw new Error(`DeepSeek advanced comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// RADICAL FIX: Add missing Originality analysis functions for 20-parameter framework
export async function analyzeOriginality(passage: PassageData): Promise<any> {
  const prompt = `You are an expert in evaluating the originality and quality of intellectual writing across all disciplines. Analyze this passage using the exact 20 originality parameters.

PASSAGE: ${passage.title}
${passage.text}

Analyze across these 20 originality parameters (score each 0-10):

1. Transformational Synthesis - Does the author transform inherited ideas into something new?
2. Generative Power - Does the work open new lines of inquiry or generate conceptual descendants?
3. Disciplinary Repositioning - Does the text challenge or redraw the field's internal boundaries?
4. Conceptual Reframing - Are familiar problems recast in novel terms or perspectives?
5. Analytic Re-Alignment - Does the author redirect attention from false problems to better ones?
6. Unexpected Cross-Pollination - Does the author import tools or concepts from distant domains?
7. Epistemic Reweighting - Are marginal ideas made central (or vice versa) by principled arguments?
8. Constraint Innovation - Are new constraints introduced that improve the quality of reasoning?
9. Ontology Re-specification - Is the underlying structure of the entities or kinds reconsidered?
10. Heuristic Leap - Is an intuitive or lateral move introduced that reframes the field?
11. Problem Re-Indexing - Are known problems recoded into more productive forms?
12. Axiomatic Innovation - Does the work posit a new fundamental assumption or shift?
13. Moral or Political Recomputation - Are prevailing moral/political frames creatively re-evaluated?
14. Semantic Innovation - Are new concepts or redefinitions introduced?
15. Methodological Innovation - Are new approaches or techniques developed?
16. Structural Innovation - Are new organizational or logical structures created?
17. Causal Innovation - Are new causal relationships or mechanisms proposed?
18. Temporal Innovation - Are new temporal frameworks or chronologies introduced?
19. Evidential Innovation - Are new forms of evidence or proof introduced?
20. Theoretical Innovation - Are new theories or theoretical frameworks developed?

For each parameter, provide:
- score (0-10)
- assessment (detailed explanation)
- strengths (specific examples from text)
- weaknesses (areas for improvement)

Respond in JSON format with this exact structure:
{
  "transformationalSynthesis": {
    "score": number,
    "assessment": "string",
    "strengths": ["string"],
    "weaknesses": ["string"]
  },
  "generativePower": {
    "score": number,
    "assessment": "string", 
    "strengths": ["string"],
    "weaknesses": ["string"]
  },
  [continue for all 20 parameters using camelCase names]
}`;

  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 8000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from DeepSeek");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error in DeepSeek originality analysis:", error);
    // FALLBACK: Return to OpenAI if DeepSeek fails
    console.log("DeepSeek failed, falling back to OpenAI service");
    const openaiService = await import('./openai');
    return openaiService.analyzeOriginality(passage);
  }
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  const prompt = `You are an expert in evaluating the originality and quality of intellectual writing across all disciplines. Compare these two passages using the exact 20 originality parameters.

PASSAGE A: ${passageA.title}
${passageA.text}

PASSAGE B: ${passageB.title}
${passageB.text}

For each passage, analyze across these 20 originality parameters (score each 0-10):
[Same 20 parameters as above]

Respond in JSON format with this exact structure:
{
  "transformationalSynthesis": {
    "passageA": {
      "score": number,
      "assessment": "string",
      "strengths": ["string"],
      "weaknesses": ["string"]
    },
    "passageB": {
      "score": number,
      "assessment": "string",
      "strengths": ["string"],
      "weaknesses": ["string"]
    }
  },
  [continue for all 20 parameters]
}`;

  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 12000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from DeepSeek");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error in DeepSeek dual originality analysis:", error);
    // FALLBACK: Return to OpenAI if DeepSeek fails
    console.log("DeepSeek failed, falling back to OpenAI service");
    const openaiService = await import('./openai');
    return openaiService.analyzeOriginalityDual(passageA, passageB);
  }
}

// Add missing functions for other frameworks
export async function analyzeCogency(passage: PassageData): Promise<any> {
  try {
    console.log("DeepSeek cogency analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeCogency(passage);
  } catch (error) {
    console.error("Error in DeepSeek cogency analysis:", error);
    throw error;
  }
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    console.log("DeepSeek dual cogency analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeCogencyDual(passageA, passageB);
  } catch (error) {
    console.error("Error in DeepSeek dual cogency analysis:", error);
    throw error;
  }
}

export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  try {
    console.log("DeepSeek intelligence analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeIntelligence(passage);
  } catch (error) {
    console.error("Error in DeepSeek intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    console.log("DeepSeek dual intelligence analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeIntelligenceDual(passageA, passageB);
  } catch (error) {
    console.error("Error in DeepSeek dual intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeQuality(passage: PassageData): Promise<any> {
  try {
    console.log("DeepSeek quality analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeQuality(passage);
  } catch (error) {
    console.error("Error in DeepSeek quality analysis:", error);
    throw error;
  }
}

export async function analyzeQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    console.log("DeepSeek dual quality analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeQualityDual(passageA, passageB);
  } catch (error) {
    console.error("Error in DeepSeek dual quality analysis:", error);
    throw error;
  }
}