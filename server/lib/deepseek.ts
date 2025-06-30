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
  const prompt = `You are an expert in evaluating the originality and quality of intellectual writing across all disciplines. Your task is to analyze two passages and provide a comprehensive comparison.

PASSAGE A (${passageA.title}):
${passageA.text}

Context: ${passageA.userContext}

PASSAGE B (${passageB.title}):
${passageB.text}

Context: ${passageB.userContext}

Analyze these passages across the following nine dimensions, providing scores from 0-10:

1. ORIGINALITY: How novel and innovative are the ideas?
2. COHERENCE: How logically consistent and well-structured is the writing?
3. ACCURACY: How factually and inferentially correct is the content?
4. DEPTH: How profound and non-trivial are the insights?
5. CLARITY: How clear and accessible is the writing?
6. DERIVATIVE INDEX: How much does this recycle existing ideas vs. creating new ones? (0 = highly derivative, 10 = highly original)
7. CONCEPTUAL DISTANCE: How far does this depart from existing paradigms?
8. LINEAGE SCORE: How well does this build upon intellectual traditions?
9. SEMANTIC NOVELTY: How semantically distinct are the concepts?

Provide detailed analysis for each dimension, then give overall recommendations.

Respond in valid JSON format with this structure:
{
  "originality": number,
  "coherence": number,
  "accuracy": number,
  "depth": number,
  "clarity": number,
  "derivative_index": number,
  "conceptual_distance": number,
  "lineage_score": number,
  "semantic_novelty": number,
  "explanation": "detailed analysis",
  "recommendations": "specific suggestions for improvement",
  "comparative_analysis": "comparison between the two passages"
}`;

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
      "bias": string[],
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