import { PassageData, SupportingDocument, StyleOption, FeedbackData, SubmitFeedbackRequest } from "../../client/src/lib/types";
import { AnalysisResult } from "@shared/schema";

// 160 METRICS FRAMEWORK - NO CANNED RESPONSES ALLOWED
// Each metric must include: metric evaluation, direct quotations, explanation of how quotations support the score

const apiKey = process.env.DEEPSEEK_API_KEY;
console.log("DeepSeek API Key status:", apiKey ? "Present" : "Missing");

export async function analyzePassages(
  passageA: PassageData,
  passageB: PassageData
): Promise<AnalysisResult> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  const originalityMetrics = [
    "Novel perspective", "Uncommon connections", "Surprising but apt analogies", "Invention of new distinctions",
    "Reframing of common problem", "New conceptual synthesis", "Fresh metaphors", "Generating new questions",
    "Counterintuitive insight that holds", "Unusual compression (shortcuts that work)", "Distilling cliché into clarity",
    "Reinterpreting tradition", "Productive paradox", "Idiosyncratic voice", "Unusual but precise phrasing",
    "Structural inventiveness (form matches thought)", "Surprising yet valid inference", "Non-standard angle on standard issue",
    "Repurposing known concept in new domain", "Avoiding mimicry", "Shunning jargon clichés", "Generating conceptual friction",
    "Independent pattern recognition", "Unexpected causal explanation", "Tension between domains (philosophy + science, etc.)",
    "Provocative but defensible claim", "Lateral connections (cross-field links)", "Subversion of default framing",
    "Detection of neglected detail", "Reverse engineering assumptions", "Productive misfit with genre/style",
    "Intellectually playful but rigorous", "Constructive violation of expectations", "Voice not reducible to formula",
    "Revaluing the obvious", "Absence of derivative cadence", "Independent synthesis of sources",
    "Discovery of hidden symmetry", "Generating terms others adopt", "Staying power (insight lingers after reading)"
  ];

  const prompt = `You are an expert in evaluating the originality of intellectual writing across all disciplines.

PASSAGE TO ANALYZE:
${passage.text}

Evaluate this passage across all 40 originality metrics. For each metric, provide:
1. The metric name
2. A direct quotation from the passage that demonstrates this metric
3. An explanation of how that quotation supports the characterization/score
4. A score from 0-100

The 40 Originality Metrics:
${originalityMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

For each metric, use this format:
Metric Name
"Direct quotation from the text"
Explanation of how the quotation demonstrates this metric.
Score: X/100

Provide a comprehensive analysis covering all 40 metrics with quotations and explanations.`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in DeepSeek originality analysis:", error);
    throw error;
  }
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
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