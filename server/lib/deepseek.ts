// DEEPSEEK SERVICE - COMPLETELY REBUILT WITH UNIVERSAL PROTOCOL SYSTEM
import { PassageData } from "../../client/src/lib/types";
import { universalThreePhaseEvaluation, universalDualEvaluation, LLMProvider } from './universal-evaluation';

const apiKey = process.env.DEEPSEEK_API_KEY;

// DEEPSEEK LLM PROVIDER IMPLEMENTATION
const deepseekProvider: LLMProvider = {
  name: "DeepSeek",
  apiCall: async (prompt: string, maxTokens: number = 2000): Promise<string> => {
    if (!apiKey) {
      throw new Error("DeepSeek API key is not configured");
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
};

// SINGLE DOCUMENT ANALYSIS FUNCTIONS
export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'intelligence', deepseekProvider);
}

export async function analyzePrimaryIntelligence(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'intelligence', deepseekProvider);
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'originality', deepseekProvider);
}

export async function analyzePrimaryOriginality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'originality', deepseekProvider);
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'cogency', deepseekProvider);
}

export async function analyzePrimaryCogency(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'cogency', deepseekProvider);
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'quality', deepseekProvider);
}

export async function analyzePrimaryQuality(passage: PassageData): Promise<any> {
  return universalThreePhaseEvaluation(passage.text, 'quality', deepseekProvider);
}

// DUAL DOCUMENT ANALYSIS FUNCTIONS
export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'intelligence', deepseekProvider);
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'originality', deepseekProvider);
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'cogency', deepseekProvider);
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return universalDualEvaluation(passageA.text, passageB.text, 'quality', deepseekProvider);
}

// LEGACY FUNCTION COMPATIBILITY
export async function evaluateWithDeepSeek(passageText: string, questions: string[], analysisType: string): Promise<any> {
  const analysisTypeMap: Record<string, 'intelligence' | 'originality' | 'cogency' | 'quality'> = {
    'intelligence': 'intelligence',
    'originality': 'originality', 
    'cogency': 'cogency',
    'quality': 'quality'
  };
  
  return universalThreePhaseEvaluation(passageText, analysisTypeMap[analysisType] || 'intelligence', deepseekProvider);
}