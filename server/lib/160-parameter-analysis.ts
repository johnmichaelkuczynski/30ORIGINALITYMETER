/**
 * 160-Parameter Analysis System - Pure LLM Passthrough
 * 
 * This system completely abandons hardcoded evaluation logic and relies
 * on LLMs to analyze text against the 160 parameters defined in the user's document.
 * 
 * Intelligence (40 metrics)
 * Cogency (40 metrics)  
 * Originality (40 metrics)
 * Overall Quality (40 metrics)
 */

import {
  INTELLIGENCE_ANALYSIS_PROMPT,
  COGENCY_ANALYSIS_PROMPT,
  ORIGINALITY_ANALYSIS_PROMPT,
  QUALITY_ANALYSIS_PROMPT,
  COMPARISON_ANALYSIS_PROMPT
} from './sophisticated-160-prompts';

// Define the 160 parameters exactly as specified in the user document
export const INTELLIGENCE_METRICS = [
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

export const COGENCY_METRICS = [
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

export const ORIGINALITY_METRICS = [
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

export const QUALITY_METRICS = [
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

export interface ParameterScore {
  metric: string;
  score: number; // 0-100 percentile score
  assessment: string;
  strengths: string[];
  weaknesses: string[];
}

export interface Analysis160Result {
  frameworkType: 'intelligence' | 'cogency' | 'originality' | 'quality';
  scores: ParameterScore[];
  overallScore: number;
  verdict: string;
  summary: string;
}

/**
 * Pure LLM analysis against 160 parameters - no hardcoded logic
 */
export async function analyze160Parameters(
  text: string,
  frameworkType: 'intelligence' | 'cogency' | 'originality' | 'quality',
  provider: 'openai' | 'anthropic' | 'perplexity' | 'deepseek'
): Promise<Analysis160Result> {
  
  let metrics: string[];
  switch (frameworkType) {
    case 'intelligence':
      metrics = INTELLIGENCE_METRICS;
      break;
    case 'cogency':
      metrics = COGENCY_METRICS;
      break;
    case 'originality':
      metrics = ORIGINALITY_METRICS;
      break;
    case 'quality':
      metrics = QUALITY_METRICS;
      break;
  }

  const prompt = create160ParameterPrompt(text, frameworkType, metrics);
  
  // Get LLM service based on provider
  let llmResponse: string;
  switch (provider) {
    case 'openai':
      const { analyzeWithOpenAI } = await import('./openai');
      llmResponse = await analyzeWithOpenAI(prompt);
      break;
    case 'anthropic':
      const { analyzeWithAnthropic } = await import('./anthropic');
      llmResponse = await analyzeWithAnthropic(prompt);
      break;
    case 'perplexity':
      const { analyzeWithPerplexity } = await import('./perplexity');
      llmResponse = await analyzeWithPerplexity(prompt);
      break;
    case 'deepseek':
    default:
      const { analyzeWithDeepSeek } = await import('./deepseek');
      llmResponse = await analyzeWithDeepSeek(prompt);
      break;
  }

  // Parse the LLM response into structured data
  return parseAnalysisResponse(llmResponse, frameworkType, metrics);
}

function create160ParameterPrompt(
  text: string,
  frameworkType: string,
  metrics: string[]
): string {
  // Use sophisticated prompts that model the Freud analysis style
  let basePrompt: string;
  
  switch (frameworkType) {
    case 'intelligence':
      basePrompt = INTELLIGENCE_ANALYSIS_PROMPT;
      break;
    case 'cogency':
      basePrompt = COGENCY_ANALYSIS_PROMPT;
      break;
    case 'originality':
      basePrompt = ORIGINALITY_ANALYSIS_PROMPT;
      break;
    case 'quality':
      basePrompt = QUALITY_ANALYSIS_PROMPT;
      break;
    default:
      // Fallback to generic sophisticated prompt
      basePrompt = INTELLIGENCE_ANALYSIS_PROMPT;
  }

  return `${basePrompt}

TEXT TO ANALYZE:
"""
${text}
"""

PARAMETERS TO EVALUATE:
${metrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

Provide sophisticated analysis for each parameter, using the calibration where genius-level work (Freud, Kant) scores 95-99, exceptional academic work scores 85-94, etc.

Format your response as JSON with this exact structure:
{
  "scores": [
    {
      "metric": "metric name",
      "score": number,
      "assessment": "Sophisticated analysis with quotes and explanation",
      "strengths": ["Specific textual evidence", "Another strength"],
      "weaknesses": ["Areas for improvement", "Or note excellence"]
    }
  ],
  "overallScore": number,
  "summary": "Performance summary in the style of sophisticated academic evaluation",
  "verdict": "Final assessment of intellectual caliber and population ranking"
}`;
}

function parseAnalysisResponse(
  response: string,
  frameworkType: 'intelligence' | 'cogency' | 'originality' | 'quality',
  metrics: string[]
): Analysis160Result {
  try {
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      frameworkType,
      scores: parsed.scores || [],
      overallScore: parsed.overallScore || 0,
      verdict: parsed.verdict || '',
      summary: parsed.summary || ''
    };
  } catch (error) {
    console.error('Error parsing 160-parameter analysis:', error);
    
    // Fallback: create basic structure
    return {
      frameworkType,
      scores: metrics.map(metric => ({
        metric,
        score: 50,
        assessment: 'Analysis parsing failed',
        strengths: ['Unable to parse response'],
        weaknesses: ['System error occurred']
      })),
      overallScore: 50,
      verdict: 'Analysis could not be completed due to parsing error',
      summary: 'The system encountered an error while processing the analysis'
    };
  }
}

/**
 * Compare two texts using 160-parameter analysis
 */
export async function compare160Parameters(
  textA: string,
  textB: string,
  frameworkType: 'intelligence' | 'cogency' | 'originality' | 'quality',
  provider: 'openai' | 'anthropic' | 'perplexity' | 'deepseek'
): Promise<{
  textA: Analysis160Result;
  textB: Analysis160Result;
  comparison: string;
}> {
  
  const [analysisA, analysisB] = await Promise.all([
    analyze160Parameters(textA, frameworkType, provider),
    analyze160Parameters(textB, frameworkType, provider)
  ]);

  // Generate comparison summary
  const comparisonPrompt = `Compare these two ${frameworkType} analyses and explain which text performs better and why:

TEXT A OVERALL SCORE: ${analysisA.overallScore}/100
TEXT B OVERALL SCORE: ${analysisB.overallScore}/100

TEXT A SUMMARY: ${analysisA.summary}
TEXT B SUMMARY: ${analysisB.summary}

Provide a 2-3 sentence comparison explaining the key differences and which text demonstrates superior ${frameworkType}.`;

  let comparison: string;
  switch (provider) {
    case 'openai':
      const { analyzeWithOpenAI } = await import('./openai');
      comparison = await analyzeWithOpenAI(comparisonPrompt);
      break;
    case 'anthropic':
      const { analyzeWithAnthropic } = await import('./anthropic');
      comparison = await analyzeWithAnthropic(comparisonPrompt);
      break;
    case 'perplexity':
      const { analyzeWithPerplexity } = await import('./perplexity');
      comparison = await analyzeWithPerplexity(comparisonPrompt);
      break;
    case 'deepseek':
    default:
      const { analyzeWithDeepSeek } = await import('./deepseek');
      comparison = await analyzeWithDeepSeek(comparisonPrompt);
      break;
  }

  return {
    textA: analysisA,
    textB: analysisB,
    comparison
  };
}