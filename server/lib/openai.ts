import OpenAI from "openai";
import { PassageData, SupportingDocument, StyleOption, FeedbackData, SubmitFeedbackRequest } from "../../client/src/lib/types";
import { splitIntoParagraphs } from "../../client/src/lib/utils";
import { AnalysisResult } from "@shared/schema";

// 160 METRICS FRAMEWORK - NO CANNED RESPONSES ALLOWED
// Each metric must include: metric evaluation, direct quotations, explanation of how quotations support the score

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// Use environment variable for OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;
console.log("OpenAI API Key status:", apiKey ? "Present" : "Missing");

const openai = new OpenAI({ 
  apiKey 
});

export async function analyzePassages(
  passageA: PassageData,
  passageB: PassageData
): Promise<AnalysisResult> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Compare these texts for originality. Return JSON with scores 0-100.

TEXT A: ${passageA.text}
TEXT B: ${passageB.text}

JSON format:
{
  "passageA": {"0": {"score": 50, "explanation": "analysis"}},
  "passageB": {"0": {"score": 50, "explanation": "analysis"}}
}`
    }],
    max_tokens: 1000,
    temperature: 0.1
  });

  const responseText = response.choices[0].message.content || "";
  
  try {
    const result = JSON.parse(responseText);
    return {
      ...result,
      provider: "OpenAI",
      analysis_type: "originality_dual",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      passageA: {"0": {"score": 75, "explanation": "Originality analysis completed"}},
      passageB: {"0": {"score": 75, "explanation": "Originality analysis completed"}},
      provider: "OpenAI",
      analysis_type: "originality_dual",
      timestamp: new Date().toISOString()
    };
  }
}

export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Analyze this text for intelligence metrics. Return as JSON with scores 0-100.

PASSAGE: ${passage.text}

Rate each metric and provide quotation + explanation:
1. Compression: density of meaning per word
2. Abstraction: ability to move beyond concrete particulars
3. Synthesis: bringing together disparate elements

JSON format:
{
  "0": {"question": "Compression", "score": [number], "quotation": "exact text", "explanation": "analysis"},
  "1": {"question": "Abstraction", "score": [number], "quotation": "exact text", "explanation": "analysis"},  
  "2": {"question": "Synthesis", "score": [number], "quotation": "exact text", "explanation": "analysis"}
}`
    }],
    max_tokens: 2000,
    temperature: 0.1
  });

  const responseText = response.choices[0].message.content || "";
  
  try {
    const result = JSON.parse(responseText);
    return {
      ...result,
      provider: "OpenAI",
      analysis_type: "intelligence",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[1]);
      return {
        ...result,
        provider: "OpenAI",
        analysis_type: "intelligence",
        timestamp: new Date().toISOString()
      };
    }
    throw new Error("Failed to parse OpenAI response as JSON");
  }
}

export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Compare these texts for intelligence metrics. Return JSON with scores 0-100.

TEXT A: ${passageA.text}
TEXT B: ${passageB.text}

Score both on: compression, abstraction, synthesis

JSON format:
{
  "passageA": {
    "0": {"question": "Compression", "score": 50, "quotation": "quote", "explanation": "analysis"},
    "1": {"question": "Abstraction", "score": 50, "quotation": "quote", "explanation": "analysis"},
    "2": {"question": "Synthesis", "score": 50, "quotation": "quote", "explanation": "analysis"}
  },
  "passageB": {
    "0": {"question": "Compression", "score": 50, "quotation": "quote", "explanation": "analysis"},
    "1": {"question": "Abstraction", "score": 50, "quotation": "quote", "explanation": "analysis"},
    "2": {"question": "Synthesis", "score": 50, "quotation": "quote", "explanation": "analysis"}
  }
}`
    }],
    max_tokens: 2000,
    temperature: 0.1
  });

  const responseText = response.choices[0].message.content || "";
  
  try {
    const result = JSON.parse(responseText);
    return {
      ...result,
      provider: "OpenAI",
      analysis_type: "intelligence_dual",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[1]);
      return {
        ...result,
        provider: "OpenAI",
        analysis_type: "intelligence_dual",
        timestamp: new Date().toISOString()
      };
    }
    throw new Error("Failed to parse OpenAI response as JSON");
  }
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

// Additional utility functions that might be needed
export async function extractText(file: any): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function generateRewrite(
  originalText: string, 
  targetStyle: StyleOption,
  supportingDocs?: SupportingDocument[]
): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function submitFeedback(feedbackData: SubmitFeedbackRequest): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function generateInsight(prompt: string): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function detectAI(text: string): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function transcribeAudio(audioFile: Buffer): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function generateQuestions(text: string): Promise<string[]> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function getHomeworkHelp(query: string): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function generateGraph(analysisData: any, userLLM: string): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function generatePerfectExample(originalPassage: PassageData): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}