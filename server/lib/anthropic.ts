// ANTHROPIC SERVICE - COMPLETELY REBUILT WITH UNIVERSAL PROTOCOL SYSTEM
import { PassageData } from "../../client/src/lib/types";
import { universalThreePhaseEvaluation, universalDualEvaluation, LLMProvider } from './universal-evaluation';

const apiKey = process.env.ANTHROPIC_API_KEY;

// ANTHROPIC LLM PROVIDER IMPLEMENTATION
const anthropicProvider: LLMProvider = {
  name: "Anthropic",
  apiCall: async (prompt: string, maxTokens: number = 2000): Promise<string> => {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }
};

// SINGLE DOCUMENT ANALYSIS FUNCTIONS
export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'intelligence', anthropicProvider);
}

export async function analyzePrimaryIntelligence(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'intelligence', anthropicProvider);
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'originality', anthropicProvider);
}

export async function analyzePrimaryOriginality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'originality', anthropicProvider);
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'cogency', anthropicProvider);
}

export async function analyzePrimaryCogency(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'cogency', anthropicProvider);
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'quality', anthropicProvider);
}

export async function analyzePrimaryQuality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'quality', anthropicProvider);
}

// DUAL DOCUMENT ANALYSIS FUNCTIONS
export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'intelligence', anthropicProvider);
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'originality', anthropicProvider);
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'cogency', anthropicProvider);
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'quality', anthropicProvider);
}

// ANALYSIS ALIASES FOR BACKWARD COMPATIBILITY  
export async function analyzeQuality(passage: PassageData): Promise<any> {
  return analyzeOverallQuality(passage);
}

export async function analyzeQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return analyzeOverallQualityDual(passageA, passageB);
}