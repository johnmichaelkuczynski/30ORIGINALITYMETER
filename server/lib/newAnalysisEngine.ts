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

// 160 Metrics System - Exact from document
const INTELLIGENCE_METRICS = [
  "Compression (density of meaning per word)",
  "Abstraction (ability to move beyond surface detail)",
  "Inference depth (multi-step reasoning)",
  "Epistemic friction (acknowledging uncertainty or limits)",
  "Cognitive distancing (seeing from outside a frame)",
  "Counterfactual reasoning",
  "Analogical depth (quality of comparisons)",
  "Semantic topology (connectedness of ideas)",
  "Asymmetry (unexpected but apt perspective shifts)",
  "Conceptual layering (multiple levels at once)",
  "Original definition-making",
  "Precision of terms",
  "Distinction-tracking (keeping categories straight)",
  "Avoidance of tautology",
  "Avoidance of empty generality",
  "Compression of examples into principle",
  "Ability to invert perspective",
  "Anticipation of objections",
  "Integration of disparate domains",
  "Self-reflexivity (awareness of own stance)",
  "Elimination of redundancy",
  "Conceptual economy (no waste concepts)",
  "Epistemic risk-taking (sticking neck out coherently)",
  "Generativity (producing new questions/angles)",
  "Ability to revise assumptions midstream",
  "Distinguishing signal vs. noise",
  "Recognizing hidden assumptions",
  "Tracking causal chains",
  "Separating correlation from causation",
  "Managing complexity without collapse",
  "Detecting paradox or tension",
  "Apt compression into aphorism",
  "Clarity under pressure (handling difficult material)",
  "Distinguishing levels (fact vs. meta-level)",
  "Relating concrete to abstract seamlessly",
  "Control of scope (not sprawling aimlessly)",
  "Detecting pseudo-intelligence",
  "Balancing simplicity with depth",
  "Strategic omission (knowing what not to say)",
  "Transferability (insight applies beyond the case)"
];

const COGENCY_METRICS = [
  "Logical validity",
  "Absence of contradictions",
  "Strength of evidence/reasons",
  "Proportionality (conclusion matches support)",
  "Avoiding non sequiturs",
  "Explicit structure (clear argument shape)",
  "Distinction between premises and conclusion",
  "Consistent terminology",
  "Focus (avoiding drift)",
  "Avoiding circularity",
  "Handling counterexamples",
  "Responsiveness to objections",
  "Causal adequacy",
  "Inferential tightness",
  "Avoiding overgeneralization",
  "Avoiding straw man reasoning",
  "Recognizing scope limits",
  "Avoiding equivocation",
  "Hierarchy of reasons (primary vs. secondary)",
  "Consistency with background knowledge",
  "Recognizing exceptions",
  "Correct use of examples",
  "Avoidance of loaded language as substitute for reason",
  "Clear priority of claims",
  "Avoiding category mistakes",
  "Explicitness of assumptions",
  "Non-redundancy in support",
  "Alignment between thesis and support",
  "Avoidance of spurious precision",
  "Adequate differentiation (not lumping opposites)",
  "Soundness of analogies",
  "Progressive buildup (no jumps)",
  "Avoidance of double standards",
  "Balance of concession and assertion",
  "Clarity of logical connectives",
  "Preservation of distinctions across argument",
  "Avoiding irrelevant material",
  "Correct handling of probability",
  "Strength of causal explanation vs. correlation",
  "Stability under reformulation (holds when restated)"
];

const ORIGINALITY_METRICS = [
  "Novel perspective",
  "Uncommon connections",
  "Surprising but apt analogies",
  "Invention of new distinctions",
  "Reframing of common problem",
  "New conceptual synthesis",
  "Fresh metaphors",
  "Generating new questions",
  "Counterintuitive insight that holds",
  "Unusual compression (shortcuts that work)",
  "Distilling cliché into clarity",
  "Reinterpreting tradition",
  "Productive paradox",
  "Idiosyncratic voice",
  "Unusual but precise phrasing",
  "Structural inventiveness (form matches thought)",
  "Surprising yet valid inference",
  "Non-standard angle on standard issue",
  "Repurposing known concept in new domain",
  "Avoiding mimicry",
  "Shunning jargon clichés",
  "Generating conceptual friction",
  "Independent pattern recognition",
  "Unexpected causal explanation",
  "Tension between domains (philosophy + science, etc.)",
  "Provocative but defensible claim",
  "Lateral connections (cross-field links)",
  "Subversion of default framing",
  "Detection of neglected detail",
  "Reverse engineering assumptions",
  "Productive misfit with genre/style",
  "Intellectually playful but rigorous",
  "Constructive violation of expectations",
  "Voice not reducible to formula",
  "Revaluing the obvious",
  "Absence of derivative cadence",
  "Independent synthesis of sources",
  "Discovery of hidden symmetry",
  "Generating terms others adopt",
  "Staying power (insight lingers after reading)"
];

const OVERALL_QUALITY_METRICS = [
  "Clarity of expression",
  "Flow and readability",
  "Stylistic control",
  "Grammar and syntax precision",
  "Appropriate tone",
  "Balance of brevity and elaboration",
  "Coherence across sections",
  "Engagement/interest",
  "Rhythm of sentences",
  "Absence of filler",
  "Clear introduction of themes",
  "Effective closure/resolution",
  "Variety of sentence structure",
  "Apt vocabulary (not inflated)",
  "Avoiding clichés",
  "Consistency of style",
  "Accessibility (lay reader can follow)",
  "Respect for audience intelligence",
  "Memorability of phrasing",
  "Avoidance of redundancy",
  "Natural transitions",
  "Balanced paragraphing",
  "Pacing (not rushed, not dragging)",
  "Smooth handling of complexity",
  "Apt use of examples or illustration",
  "Ability to hold reader attention",
  "Economy of language",
  "Emphasis where needed",
  "Voice consistency",
  "Avoidance of awkwardness",
  "Seamless integration of quotes/sources",
  "Good proportion of abstract vs. concrete",
  "Non-mechanical style",
  "Absence of distracting errors",
  "Balance of analysis and narrative",
  "Cadence (natural spoken rhythm)",
  "Avoidance of pedantry",
  "Polish (reads as finished, not drafty)",
  "Unifying theme or through-line",
  "Overall reader impact (leaves an impression)"
];

// Data structures
export interface MetricAnalysis {
  metric: string;
  quotation: string;
  analysis: string;
  score: number;
}

export interface ComprehensiveAnalysisResult {
  intelligence: MetricAnalysis[];
  cogency: MetricAnalysis[];
  originality: MetricAnalysis[];
  overallQuality: MetricAnalysis[];
  summary: {
    intelligenceScore: number;
    cogencyScore: number;
    originalityScore: number;
    overallQualityScore: number;
    totalScore: number;
  };
}

// Sleep function for rate limiting
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Core analysis function for each metric
async function analyzeMetric(
  text: string,
  metric: string,
  category: string,
  provider: 'openai' | 'anthropic' | 'perplexity' = 'openai'
): Promise<MetricAnalysis> {
  const prompt = `You are analyzing text for the metric "${metric}" in the ${category} category.

CRITICAL REQUIREMENTS:
1. Find a SPECIFIC quotation from the text that demonstrates this metric
2. Write ONE FULL PARAGRAPH explaining how that quotation demonstrates the metric
3. Provide a score 0-100 based on the evidence

Text to analyze:
${text}

Respond in JSON format:
{
  "quotation": "exact quote from the text",
  "analysis": "full paragraph analysis",
  "score": number
}`;

  try {
    let response: string;

    if (provider === 'openai' && openaiApiKey) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      });
      response = completion.choices[0].message.content || '';
    } else if (provider === 'anthropic' && anthropicApiKey) {
      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 800,
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
          max_tokens: 800
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

    const parsed = JSON.parse(response);
    
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

// Main analysis function
export async function performComprehensiveAnalysis(
  text: string,
  provider: 'openai' | 'anthropic' | 'perplexity' = 'openai'
): Promise<ComprehensiveAnalysisResult> {
  console.log("Starting 160-metric comprehensive analysis...");
  
  const result: ComprehensiveAnalysisResult = {
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

  // Process Intelligence metrics (40 metrics)
  console.log("Analyzing Intelligence metrics (40 parameters)...");
  for (let i = 0; i < INTELLIGENCE_METRICS.length; i++) {
    const metric = INTELLIGENCE_METRICS[i];
    console.log(`Processing Intelligence ${i + 1}/40: ${metric}`);
    
    const analysis = await analyzeMetric(text, metric, "Intelligence", provider);
    result.intelligence.push(analysis);
    
    // 20-second delay between metrics to handle token limits
    if (i < INTELLIGENCE_METRICS.length - 1) {
      console.log("20-second delay for token management...");
      await sleep(20000);
    }
  }

  // Process Cogency metrics (40 metrics)
  console.log("Analyzing Cogency metrics (40 parameters)...");
  for (let i = 0; i < COGENCY_METRICS.length; i++) {
    const metric = COGENCY_METRICS[i];
    console.log(`Processing Cogency ${i + 1}/40: ${metric}`);
    
    const analysis = await analyzeMetric(text, metric, "Cogency", provider);
    result.cogency.push(analysis);
    
    if (i < COGENCY_METRICS.length - 1) {
      console.log("20-second delay for token management...");
      await sleep(20000);
    }
  }

  // Process Originality metrics (40 metrics)
  console.log("Analyzing Originality metrics (40 parameters)...");
  for (let i = 0; i < ORIGINALITY_METRICS.length; i++) {
    const metric = ORIGINALITY_METRICS[i];
    console.log(`Processing Originality ${i + 1}/40: ${metric}`);
    
    const analysis = await analyzeMetric(text, metric, "Originality", provider);
    result.originality.push(analysis);
    
    if (i < ORIGINALITY_METRICS.length - 1) {
      console.log("20-second delay for token management...");
      await sleep(20000);
    }
  }

  // Process Overall Quality metrics (40 metrics)
  console.log("Analyzing Overall Quality metrics (40 parameters)...");
  for (let i = 0; i < OVERALL_QUALITY_METRICS.length; i++) {
    const metric = OVERALL_QUALITY_METRICS[i];
    console.log(`Processing Overall Quality ${i + 1}/40: ${metric}`);
    
    const analysis = await analyzeMetric(text, metric, "Overall Quality", provider);
    result.overallQuality.push(analysis);
    
    if (i < OVERALL_QUALITY_METRICS.length - 1) {
      console.log("20-second delay for token management...");
      await sleep(20000);
    }
  }

  // Calculate summary scores
  result.summary.intelligenceScore = Math.round(
    result.intelligence.reduce((sum, analysis) => sum + analysis.score, 0) / result.intelligence.length
  );
  result.summary.cogencyScore = Math.round(
    result.cogency.reduce((sum, analysis) => sum + analysis.score, 0) / result.cogency.length
  );
  result.summary.originalityScore = Math.round(
    result.originality.reduce((sum, analysis) => sum + analysis.score, 0) / result.originality.length
  );
  result.summary.overallQualityScore = Math.round(
    result.overallQuality.reduce((sum, analysis) => sum + analysis.score, 0) / result.overallQuality.length
  );
  result.summary.totalScore = Math.round(
    (result.summary.intelligenceScore + result.summary.cogencyScore + 
     result.summary.originalityScore + result.summary.overallQualityScore) / 4
  );

  console.log("160-metric comprehensive analysis completed!");
  return result;
}