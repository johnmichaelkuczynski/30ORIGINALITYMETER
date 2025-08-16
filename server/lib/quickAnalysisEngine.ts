import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

// Environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

// Initialize clients
const openai = new OpenAI({ apiKey: openaiApiKey });
const anthropic = new Anthropic({ apiKey: anthropicApiKey });

// Quick analysis - 5 key metrics per category (20 total)
const QUICK_INTELLIGENCE_METRICS = [
  "Compression (density of meaning per word)",
  "Abstraction (ability to move beyond surface detail)",
  "Inference depth (multi-step reasoning)",
  "Integration of disparate domains",
  "Meta-cognitive awareness"
];

const QUICK_COGENCY_METRICS = [
  "Logical validity",
  "Strength of evidence/reasons",
  "Explicit structure (clear argument shape)",
  "Handling counterexamples", 
  "Avoiding overgeneralization"
];

const QUICK_ORIGINALITY_METRICS = [
  "Conceptual novelty",
  "Semantic distance from existing ideas",
  "Transformational synthesis",
  "Counterintuitive insights",
  "Fresh angle development"
];

const QUICK_QUALITY_METRICS = [
  "Clarity of expression",
  "Precision of language",
  "Coherence of structure",
  "Depth of insight",
  "Overall intellectual merit"
];

interface QuickMetricResult {
  metric: string;
  quotation: string;
  analysis: string;
  score: number;
}

interface QuickAnalysisResult {
  intelligence: QuickMetricResult[];
  cogency: QuickMetricResult[];
  originality: QuickMetricResult[];
  overallQuality: QuickMetricResult[];
  summary: {
    intelligenceScore: number;
    cogencyScore: number;
    originalityScore: number;
    overallQualityScore: number;
    totalScore: number;
  };
}

// Helper function for delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Quick metric analysis - returns 1-2 sentences instead of full paragraph
async function analyzeQuickMetric(
  text: string,
  metric: string,
  category: string,
  provider: 'openai' | 'anthropic' | 'perplexity' = 'openai'
): Promise<QuickMetricResult> {
  try {
    const prompt = `Analyze this text for the metric "${metric}" in the ${category} category.

TEXT TO ANALYZE:
"${text}"

Return ONLY a JSON object with these fields:
{
  "quotation": "Direct quote from the text that best demonstrates this metric",
  "analysis": "Brief 1-2 sentence analysis explaining how the quotation demonstrates this metric",
  "score": "Integer from 0-100 representing how well the text performs on this metric"
}

Be precise and concise. The analysis should be exactly 1-2 sentences, not a full paragraph.`;

    let response = '';
    
    if (provider === 'openai' && openaiApiKey) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      });
      response = completion.choices[0].message.content || '';
    } else if (provider === 'anthropic' && anthropicApiKey) {
      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });
      response = completion.content[0].type === 'text' ? completion.content[0].text : '';
    } else if (provider === 'perplexity' && perplexityApiKey) {
      const perplexityResponse = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: "llama-3.1-sonar-small-128k-online",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      response = perplexityResponse.data.choices[0].message.content;
    } else {
      throw new Error('No available API provider');
    }

    // Clean response - remove markdown code blocks if present
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanResponse);
    
    return {
      metric,
      quotation: parsed.quotation || "No quotation found",
      analysis: parsed.analysis || "Analysis unavailable",
      score: Math.min(100, Math.max(0, parsed.score || 0))
    };

  } catch (error) {
    console.error(`Error analyzing metric ${metric}:`, error);
    return {
      metric,
      quotation: "Analysis error",
      analysis: "Unable to complete analysis for this metric.",
      score: 0
    };
  }
}

// Quick analysis function - completes in about 1 minute
export async function performQuickAnalysis(
  text: string,
  provider: 'openai' | 'anthropic' | 'perplexity' = 'openai'
): Promise<QuickAnalysisResult> {
  console.log("Starting quick 20-metric analysis...");
  
  const result: QuickAnalysisResult = {
    intelligence: [],
    cogency: [],
    originality: [],
    overallQuality: [],
    summary: {
      intelligenceScore: 0,
      cogencyScore: 0,
      originalityScore: 0,
      overallQualityScore: 0,
      totalScore: 0
    }
  };

  // Process Intelligence metrics (5 metrics)
  console.log("Analyzing Intelligence metrics (5 parameters)...");
  for (let i = 0; i < QUICK_INTELLIGENCE_METRICS.length; i++) {
    const metric = QUICK_INTELLIGENCE_METRICS[i];
    console.log(`Processing Intelligence ${i + 1}/5: ${metric}`);
    
    const analysis = await analyzeQuickMetric(text, metric, "Intelligence", provider);
    result.intelligence.push(analysis);
    
    if (i < QUICK_INTELLIGENCE_METRICS.length - 1) {
      await sleep(500); // 0.5 second delay
    }
  }

  // Process Cogency metrics (5 metrics)
  console.log("Analyzing Cogency metrics (5 parameters)...");
  for (let i = 0; i < QUICK_COGENCY_METRICS.length; i++) {
    const metric = QUICK_COGENCY_METRICS[i];
    console.log(`Processing Cogency ${i + 1}/5: ${metric}`);
    
    const analysis = await analyzeQuickMetric(text, metric, "Cogency", provider);
    result.cogency.push(analysis);
    
    if (i < QUICK_COGENCY_METRICS.length - 1) {
      await sleep(500);
    }
  }

  // Process Originality metrics (5 metrics)
  console.log("Analyzing Originality metrics (5 parameters)...");
  for (let i = 0; i < QUICK_ORIGINALITY_METRICS.length; i++) {
    const metric = QUICK_ORIGINALITY_METRICS[i];
    console.log(`Processing Originality ${i + 1}/5: ${metric}`);
    
    const analysis = await analyzeQuickMetric(text, metric, "Originality", provider);
    result.originality.push(analysis);
    
    if (i < QUICK_ORIGINALITY_METRICS.length - 1) {
      await sleep(500);
    }
  }

  // Process Overall Quality metrics (5 metrics)
  console.log("Analyzing Overall Quality metrics (5 parameters)...");
  for (let i = 0; i < QUICK_QUALITY_METRICS.length; i++) {
    const metric = QUICK_QUALITY_METRICS[i];
    console.log(`Processing Quality ${i + 1}/5: ${metric}`);
    
    const analysis = await analyzeQuickMetric(text, metric, "Overall Quality", provider);
    result.overallQuality.push(analysis);
    
    if (i < QUICK_QUALITY_METRICS.length - 1) {
      await sleep(500);
    }
  }

  // Calculate summary scores
  result.summary.intelligenceScore = Math.round(
    result.intelligence.reduce((sum, item) => sum + item.score, 0) / result.intelligence.length
  );
  result.summary.cogencyScore = Math.round(
    result.cogency.reduce((sum, item) => sum + item.score, 0) / result.cogency.length
  );
  result.summary.originalityScore = Math.round(
    result.originality.reduce((sum, item) => sum + item.score, 0) / result.originality.length
  );
  result.summary.overallQualityScore = Math.round(
    result.overallQuality.reduce((sum, item) => sum + item.score, 0) / result.overallQuality.length
  );
  result.summary.totalScore = Math.round(
    (result.summary.intelligenceScore + result.summary.cogencyScore + 
     result.summary.originalityScore + result.summary.overallQualityScore) / 4
  );

  console.log("Quick analysis completed!");
  return result;
}