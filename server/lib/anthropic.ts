import Anthropic from '@anthropic-ai/sdk';
import { PassageData, SupportingDocument, StyleOption, FeedbackData, SubmitFeedbackRequest } from "../../client/src/lib/types";
import { splitIntoParagraphs } from "../../client/src/lib/utils";
import { AnalysisResult } from "@shared/schema";

// 160 METRICS FRAMEWORK - NO CANNED RESPONSES ALLOWED
// Each metric must include: metric evaluation, direct quotations, explanation of how quotations support the score

const apiKey = process.env.ANTHROPIC_API_KEY;
console.log("Anthropic API Key status:", apiKey ? "Present" : "Missing");

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

export async function analyzePassages(
  passageA: PassageData,
  passageB: PassageData
): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const prompt = `You are an expert in evaluating the originality and quality of intellectual writing across all disciplines.

PASSAGE A:
${passageA.text}

PASSAGE B:
${passageB.text}

Analyze these passages using the comprehensive 160-metric framework. For each analysis category, evaluate all 40 metrics with direct quotations from the text and explicit explanations of how those quotations support each score.

Return a properly formatted JSON response with the exact structure expected by the system. Include detailed metric-by-metric analysis with quotations and explanations for each parameter.`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    
    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse JSON response from Anthropic");
      }
    }

    return result;
  } catch (error) {
    console.error("Error in Anthropic analysis:", error);
    throw error;
  }
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

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

Return your analysis as a JSON object with this exact structure:
{
  "0": {
    "metric": "Metric Name",
    "quotation": "Direct quotation from the text",
    "explanation": "Explanation of how the quotation demonstrates this metric",
    "score": X
  },
  "1": {
    "metric": "Next Metric Name", 
    "quotation": "Direct quotation from the text",
    "explanation": "Explanation of how the quotation demonstrates this metric",
    "score": X
  },
  ... (continue for all 40 metrics with keys "0" through "39")
}

CRITICAL: Return ONLY the JSON object, no other text. Each metric must have a direct quotation from the passage and clear explanation of how that quotation supports the score.`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        // If JSON parsing fails, return the text for debugging
        console.error("Failed to parse Anthropic JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
  } catch (error) {
    console.error("Error in Anthropic originality analysis:", error);
    throw error;
  }
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

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

PASSAGE A:
${passageA.text}

PASSAGE B:
${passageB.text}

Evaluate BOTH passages across all 40 originality metrics. For each metric, provide comparative analysis of both passages.

The 40 Originality Metrics:
${originalityMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

Return your analysis as a JSON object with this exact structure for comparative analysis:
{
  "0": {
    "metric": "Novel perspective",
    "passageA": {
      "quotation": "Direct quotation from Passage A",
      "explanation": "Explanation of how the quotation demonstrates this metric for Passage A",
      "score": X
    },
    "passageB": {
      "quotation": "Direct quotation from Passage B", 
      "explanation": "Explanation of how the quotation demonstrates this metric for Passage B",
      "score": X
    }
  },
  ... continue for all 40 metrics (indices "0" through "39")
}

Provide comprehensive analysis covering all 40 metrics for both passages with direct quotations and explanations. Return ONLY the JSON object, no additional text.`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if wrapped in markdown
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse JSON response for dual originality analysis:", parseError);
        throw new Error("Invalid JSON response from AI service");
      }
    }
  } catch (error) {
    console.error("Error in Anthropic dual originality analysis:", error);
    throw error;
  }
}

export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const intelligenceMetrics = [
    "Compression (density of meaning per word)", "Abstraction (ability to move beyond surface detail)",
    "Inference depth (multi-step reasoning)", "Epistemic friction (acknowledging uncertainty or limits)",
    "Cognitive distancing (seeing from outside a frame)", "Counterfactual reasoning", "Analogical depth (quality of comparisons)",
    "Semantic topology (connectedness of ideas)", "Asymmetry (unexpected but apt perspective shifts)",
    "Conceptual layering (multiple levels at once)", "Original definition-making", "Precision of terms",
    "Distinction-tracking (keeping categories straight)", "Avoidance of tautology", "Avoidance of empty generality",
    "Compression of examples into principle", "Ability to invert perspective", "Anticipation of objections",
    "Integration of disparate domains", "Self-reflexivity (awareness of own stance)", "Elimination of redundancy",
    "Conceptual economy (no waste concepts)", "Epistemic risk-taking (sticking neck out coherently)",
    "Generativity (producing new questions/angles)", "Ability to revise assumptions midstream",
    "Distinguishing signal vs. noise", "Recognizing hidden assumptions", "Tracking causal chains",
    "Separating correlation from causation", "Managing complexity without collapse", "Detecting paradox or tension",
    "Apt compression into aphorism", "Clarity under pressure (handling difficult material)",
    "Distinguishing levels (fact vs. meta-level)", "Relating concrete to abstract seamlessly",
    "Control of scope (not sprawling aimlessly)", "Detecting pseudo-intelligence", "Balancing simplicity with depth",
    "Strategic omission (knowing what not to say)", "Transferability (insight applies beyond the case)"
  ];

  const prompt = `You are an expert in evaluating the intelligence of intellectual writing across all disciplines.

PASSAGE TO ANALYZE:
${passage.text}

Evaluate this passage across all 40 intelligence metrics. For each metric, provide:
1. The metric name
2. A direct quotation from the passage that demonstrates this metric
3. An explanation of how that quotation supports the characterization/score
4. A score from 0-100

The 40 Intelligence Metrics:
${intelligenceMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

Return your analysis as a JSON object with this exact structure:
{
  "0": {
    "metric": "Metric Name",
    "quotation": "Direct quotation from the text",
    "explanation": "Explanation of how the quotation demonstrates this metric",
    "score": X
  },
  "1": {
    "metric": "Next Metric Name", 
    "quotation": "Direct quotation from the text",
    "explanation": "Explanation of how the quotation demonstrates this metric",
    "score": X
  },
  ... (continue for all 40 metrics with keys "0" through "39")
}

CRITICAL: Return ONLY the JSON object, no other text. Each metric must have a direct quotation from the passage and clear explanation of how that quotation supports the score.`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        // If JSON parsing fails, return the text for debugging
        console.error("Failed to parse Anthropic Intelligence JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
  } catch (error) {
    console.error("Error in Anthropic intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const intelligenceMetrics = [
    "Compression (density of meaning per word)", "Abstraction (ability to move beyond surface detail)",
    "Inference depth (multi-step reasoning)", "Epistemic friction (acknowledging uncertainty or limits)",
    "Cognitive distancing (seeing from outside a frame)", "Counterfactual reasoning", "Analogical depth (quality of comparisons)",
    "Semantic topology (connectedness of ideas)", "Asymmetry (unexpected but apt perspective shifts)",
    "Conceptual layering (multiple levels at once)", "Original definition-making", "Precision of terms",
    "Distinction-tracking (keeping categories straight)", "Avoidance of tautology", "Avoidance of empty generality",
    "Compression of examples into principle", "Ability to invert perspective", "Anticipation of objections",
    "Integration of disparate domains", "Self-reflexivity (awareness of own stance)", "Elimination of redundancy",
    "Conceptual economy (no waste concepts)", "Epistemic risk-taking (sticking neck out coherently)",
    "Generativity (producing new questions/angles)", "Ability to revise assumptions midstream",
    "Distinguishing signal vs. noise", "Recognizing hidden assumptions", "Tracking causal chains",
    "Separating correlation from causation", "Managing complexity without collapse", "Detecting paradox or tension",
    "Apt compression into aphorism", "Clarity under pressure (handling difficult material)",
    "Distinguishing levels (fact vs. meta-level)", "Relating concrete to abstract seamlessly",
    "Control of scope (not sprawling aimlessly)", "Detecting pseudo-intelligence", "Balancing simplicity with depth",
    "Strategic omission (knowing what not to say)", "Transferability (insight applies beyond the case)"
  ];

  const prompt = `You are an expert in evaluating the intelligence of intellectual writing across all disciplines.

PASSAGE A:
${passageA.text}

PASSAGE B:
${passageB.text}

Evaluate BOTH passages across all 40 intelligence metrics. For each metric, provide comparative analysis of both passages.

The 40 Intelligence Metrics:
${intelligenceMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

Return your analysis as a JSON object with this exact structure for comparative analysis:
{
  "0": {
    "metric": "Compression (density of meaning per word)",
    "passageA": {
      "quotation": "Direct quotation from Passage A",
      "explanation": "Explanation of how the quotation demonstrates this metric for Passage A",
      "score": X
    },
    "passageB": {
      "quotation": "Direct quotation from Passage B", 
      "explanation": "Explanation of how the quotation demonstrates this metric for Passage B",
      "score": X
    }
  },
  "1": {
    "metric": "Next Metric Name",
    "passageA": {
      "quotation": "Direct quotation from Passage A",
      "explanation": "Explanation for Passage A",
      "score": X
    },
    "passageB": {
      "quotation": "Direct quotation from Passage B",
      "explanation": "Explanation for Passage B", 
      "score": X
    }
  }
  ... continue for all 40 metrics (indices "0" through "39")
}

Provide comprehensive analysis covering all 40 metrics for both passages with direct quotations and explanations. Return ONLY the JSON object, no additional text.`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if wrapped in markdown
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse JSON response for dual intelligence analysis:", parseError);
        throw new Error("Invalid JSON response from AI service");
      }
    }
  } catch (error) {
    console.error("Error in Anthropic dual intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const cogencyMetrics = [
    "Logical validity", "Absence of contradictions", "Strength of evidence/reasons", "Proportionality (conclusion matches support)",
    "Avoiding non sequiturs", "Explicit structure (clear argument shape)", "Distinction between premises and conclusion",
    "Consistent terminology", "Focus (avoiding drift)", "Avoiding circularity", "Handling counterexamples",
    "Responsiveness to objections", "Causal adequacy", "Inferential tightness", "Avoiding overgeneralization",
    "Avoiding straw man reasoning", "Recognizing scope limits", "Avoiding equivocation", "Hierarchy of reasons (primary vs. secondary)",
    "Consistency with background knowledge", "Recognizing exceptions", "Correct use of examples",
    "Avoidance of loaded language as substitute for reason", "Clear priority of claims", "Avoiding category mistakes",
    "Explicitness of assumptions", "Non-redundancy in support", "Alignment between thesis and support",
    "Avoidance of spurious precision", "Adequate differentiation (not lumping opposites)", "Soundness of analogies",
    "Progressive buildup (no jumps)", "Avoidance of double standards", "Balance of concession and assertion",
    "Clarity of logical connectives", "Preservation of distinctions across argument", "Avoiding irrelevant material",
    "Correct handling of probability", "Strength of causal explanation vs. correlation", "Stability under reformulation (holds when restated)"
  ];

  const prompt = `You are an expert in evaluating the cogency of intellectual writing across all disciplines.

PASSAGE TO ANALYZE:
${passage.text}

Evaluate this passage across all 40 cogency metrics. For each metric, provide:
1. The metric name
2. A direct quotation from the passage that demonstrates this metric
3. An explanation of how that quotation supports the characterization/score
4. A score from 0-100

The 40 Cogency Metrics:
${cogencyMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

For each metric, use this format:
Metric Name
"Direct quotation from the text"
Explanation of how the quotation demonstrates this metric.
Score: X/100

Provide a comprehensive analysis covering all 40 metrics with quotations and explanations.`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    return message.content[0].text;
  } catch (error) {
    console.error("Error in Anthropic cogency analysis:", error);
    throw error;
  }
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const cogencyMetrics = [
    "Logical validity", "Absence of contradictions", "Strength of evidence/reasons", "Proportionality (conclusion matches support)",
    "Avoiding non sequiturs", "Explicit structure (clear argument shape)", "Distinction between premises and conclusion",
    "Consistent terminology", "Focus (avoiding drift)", "Avoiding circularity", "Handling counterexamples",
    "Responsiveness to objections", "Causal adequacy", "Inferential tightness", "Avoiding overgeneralization",
    "Avoiding straw man reasoning", "Recognizing scope limits", "Avoiding equivocation", "Hierarchy of reasons (primary vs. secondary)",
    "Consistency with background knowledge", "Recognizing exceptions", "Correct use of examples",
    "Avoidance of loaded language as substitute for reason", "Clear priority of claims", "Avoiding category mistakes",
    "Explicitness of assumptions", "Non-redundancy in support", "Alignment between thesis and support",
    "Avoidance of spurious precision", "Adequate differentiation (not lumping opposites)", "Soundness of analogies",
    "Progressive buildup (no jumps)", "Avoidance of double standards", "Balance of concession and assertion",
    "Clarity of logical connectives", "Preservation of distinctions across argument", "Avoiding irrelevant material",
    "Correct handling of probability", "Strength of causal explanation vs. correlation", "Stability under reformulation (holds when restated)"
  ];

  const prompt = `You are an expert in evaluating the cogency of intellectual writing across all disciplines.

PASSAGE A:
${passageA.text}

PASSAGE B:
${passageB.text}

Evaluate BOTH passages across all 40 cogency metrics. For each passage and each metric, provide:
1. The metric name
2. A direct quotation from the passage that demonstrates this metric
3. An explanation of how that quotation supports the characterization/score
4. A score from 0-100

The 40 Cogency Metrics:
${cogencyMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

For each passage and metric, use this format:
PASSAGE A - Metric Name
"Direct quotation from Passage A"
Explanation of how the quotation demonstrates this metric.
Score: X/100

PASSAGE B - Metric Name
"Direct quotation from Passage B"
Explanation of how the quotation demonstrates this metric.
Score: X/100

Provide comprehensive analysis covering all 40 metrics for both passages with quotations and explanations (80 total entries).`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if wrapped in markdown
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse JSON response for dual cogency analysis:", parseError);
        throw new Error("Invalid JSON response from AI service");
      }
    }
  } catch (error) {
    console.error("Error in Anthropic dual cogency analysis:", error);
    throw error;
  }
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const qualityMetrics = [
    "Clarity of expression", "Flow and readability", "Stylistic control", "Grammar and syntax precision",
    "Appropriate tone", "Balance of brevity and elaboration", "Coherence across sections", "Engagement/interest",
    "Rhythm of sentences", "Absence of filler", "Clear introduction of themes", "Effective closure/resolution",
    "Variety of sentence structure", "Apt vocabulary (not inflated)", "Avoiding clichés", "Consistency of style",
    "Accessibility (lay reader can follow)", "Respect for audience intelligence", "Memorability of phrasing",
    "Avoidance of redundancy", "Natural transitions", "Balanced paragraphing", "Pacing (not rushed, not dragging)",
    "Smooth handling of complexity", "Apt use of examples or illustration", "Ability to hold reader attention",
    "Economy of language", "Emphasis where needed", "Voice consistency", "Avoidance of awkwardness",
    "Seamless integration of quotes/sources", "Good proportion of abstract vs. concrete", "Non-mechanical style",
    "Absence of distracting errors", "Balance of analysis and narrative", "Cadence (natural spoken rhythm)",
    "Avoidance of pedantry", "Polish (reads as finished, not drafty)", "Unifying theme or through-line",
    "Overall reader impact (leaves an impression)"
  ];

  const prompt = `You are an expert in evaluating the overall quality of intellectual writing across all disciplines.

PASSAGE TO ANALYZE:
${passage.text}

Evaluate this passage across all 40 overall quality metrics. For each metric, provide:
1. The metric name
2. A direct quotation from the passage that demonstrates this metric
3. An explanation of how that quotation supports the characterization/score
4. A score from 0-100

The 40 Overall Quality Metrics:
${qualityMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

For each metric, use this format:
Metric Name
"Direct quotation from the text"
Explanation of how the quotation demonstrates this metric.
Score: X/100

Provide a comprehensive analysis covering all 40 metrics with quotations and explanations.`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    return message.content[0].text;
  } catch (error) {
    console.error("Error in Anthropic overall quality analysis:", error);
    throw error;
  }
}

export async function analyzeQuality(passage: PassageData): Promise<any> {
  return analyzeOverallQuality(passage);
}

export async function analyzeQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return analyzeOverallQualityDual(passageA, passageB);
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const qualityMetrics = [
    "Clarity of expression", "Flow and readability", "Stylistic control", "Grammar and syntax precision",
    "Appropriate tone", "Balance of brevity and elaboration", "Coherence across sections", "Engagement/interest",
    "Rhythm of sentences", "Absence of filler", "Clear introduction of themes", "Effective closure/resolution",
    "Variety of sentence structure", "Apt vocabulary (not inflated)", "Avoiding clichés", "Consistency of style",
    "Accessibility (lay reader can follow)", "Respect for audience intelligence", "Memorability of phrasing",
    "Avoidance of redundancy", "Natural transitions", "Balanced paragraphing", "Pacing (not rushed, not dragging)",
    "Smooth handling of complexity", "Apt use of examples or illustration", "Ability to hold reader attention",
    "Economy of language", "Emphasis where needed", "Voice consistency", "Avoidance of awkwardness",
    "Seamless integration of quotes/sources", "Good proportion of abstract vs. concrete", "Non-mechanical style",
    "Absence of distracting errors", "Balance of analysis and narrative", "Cadence (natural spoken rhythm)",
    "Avoidance of pedantry", "Polish (reads as finished, not drafty)", "Unifying theme or through-line",
    "Overall reader impact (leaves an impression)"
  ];

  const prompt = `You are an expert in evaluating the overall quality of intellectual writing across all disciplines.

PASSAGE A:
${passageA.text}

PASSAGE B:
${passageB.text}

Evaluate BOTH passages across all 40 overall quality metrics. For each passage and each metric, provide:
1. The metric name
2. A direct quotation from the passage that demonstrates this metric
3. An explanation of how that quotation supports the characterization/score
4. A score from 0-100

The 40 Overall Quality Metrics:
${qualityMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

For each passage and metric, use this format:
PASSAGE A - Metric Name
"Direct quotation from Passage A"
Explanation of how the quotation demonstrates this metric.
Score: X/100

PASSAGE B - Metric Name
"Direct quotation from Passage B"
Explanation of how the quotation demonstrates this metric.
Score: X/100

Provide comprehensive analysis covering all 40 metrics for both passages with quotations and explanations (80 total entries).`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    return message.content[0].text;
  } catch (error) {
    console.error("Error in Anthropic dual overall quality analysis:", error);
    throw error;
  }
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