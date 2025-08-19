// PERPLEXITY SERVICE - COMPLETELY REBUILT WITH UNIVERSAL PROTOCOL SYSTEM
import { PassageData } from "../../client/src/lib/types";
import { universalThreePhaseEvaluation, universalDualEvaluation, LLMProvider } from './universal-evaluation';

const apiKey = process.env.PERPLEXITY_API_KEY;

// PERPLEXITY LLM PROVIDER IMPLEMENTATION
const perplexityProvider: LLMProvider = {
  name: "Perplexity",
  apiCall: async (prompt: string, maxTokens: number = 2000): Promise<string> => {
    if (!apiKey) {
      throw new Error("Perplexity API key is not configured");
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
};

// SINGLE DOCUMENT ANALYSIS FUNCTIONS
export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'intelligence', perplexityProvider);
}

export async function analyzePrimaryIntelligence(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'intelligence', perplexityProvider);
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'originality', perplexityProvider);
}

export async function analyzePrimaryOriginality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'originality', perplexityProvider);
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'cogency', perplexityProvider);
}

export async function analyzePrimaryCogency(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'cogency', perplexityProvider);
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'quality', perplexityProvider);
}

export async function analyzePrimaryQuality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'quality', perplexityProvider);
}

// DUAL DOCUMENT ANALYSIS FUNCTIONS
export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'intelligence', perplexityProvider);
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'originality', perplexityProvider);
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'cogency', perplexityProvider);
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'quality', perplexityProvider);
}

// ANALYSIS ALIASES FOR BACKWARD COMPATIBILITY  
export async function analyzeQuality(passage: PassageData): Promise<any> {
  return analyzeOverallQuality(passage);
}

export async function analyzeQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return analyzeOverallQualityDual(passageA, passageB);
}