// OPENAI SERVICE - COMPLETELY REBUILT WITH UNIVERSAL PROTOCOL SYSTEM
import { PassageData } from "../../client/src/lib/types";
import { universalThreePhaseEvaluation, universalDualEvaluation, LLMProvider } from './universal-evaluation';

const apiKey = process.env.OPENAI_API_KEY;

// OPENAI LLM PROVIDER IMPLEMENTATION
const openaiProvider: LLMProvider = {
  name: "OpenAI",
  apiCall: async (prompt: string, maxTokens: number = 2000): Promise<string> => {
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
};

// SINGLE DOCUMENT ANALYSIS FUNCTIONS
export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'intelligence', openaiProvider);
}

export async function analyzePrimaryIntelligence(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'intelligence', openaiProvider);
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'originality', openaiProvider);
}

export async function analyzePrimaryOriginality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'originality', openaiProvider);
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'cogency', openaiProvider);
}

export async function analyzePrimaryCogency(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'cogency', openaiProvider);
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'quality', openaiProvider);
}

export async function analyzePrimaryQuality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'quality', openaiProvider);
}

// DUAL DOCUMENT ANALYSIS FUNCTIONS
export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'intelligence', openaiProvider);
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'originality', openaiProvider);
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'cogency', openaiProvider);
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'quality', openaiProvider);
}

// ANALYSIS ALIASES FOR BACKWARD COMPATIBILITY  
export async function analyzeQuality(passage: PassageData): Promise<any> {
  return analyzeOverallQuality(passage);
}

export async function analyzeQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return analyzeOverallQualityDual(passageA, passageB);
}