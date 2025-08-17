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

Analyze these passages using the comprehensive 160-metric framework. For each analysis category, evaluate all 40 metrics with direct quotations from the text and explicit explanations.

Assign scores from 0-100 (where N/100 means 100-N people out of 100 are better).

Return a properly formatted JSON response with the exact structure expected by the system. Include detailed metric-by-metric analysis with quotations, explanations, and scores for each parameter.`;

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

export async function analyzeOriginality(passage: PassageData, parameterCount: number = 40): Promise<any> {
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

  // Select the appropriate number of metrics based on parameterCount
  const selectedMetrics = originalityMetrics.slice(0, parameterCount);
  
  const prompt = `You are an expert evaluator of intellectual writing using the comprehensive 160-metric framework. You must analyze this passage using the same rigorous methodology demonstrated in the uploaded reference document.

PASSAGE TO ANALYZE:
${passage.text}

CRITICAL: UNDERSTAND WHAT ORIGINALITY ACTUALLY MEANS
Originality means "rising above the norm" and demonstrating intellectual fertility - NOT being the first person in history to say something.

ORIGINALITY EVALUATION PRINCIPLES:
- A passage can be highly original even if similar points were made centuries ago by other thinkers
- Originality is about intellectual quality and fecundity of mind, not historical priority
- Judge whether the thinking demonstrates genuine insight and analytical power
- Focus on the quality of reasoning and depth of understanding, not novelty in history
- A mind that independently arrives at profound insights shows originality regardless of precedent

RED FLAGS FOR LOW SCORES (20-45/100 range):
- Shallow thinking that lacks analytical depth
- Superficial treatment of complex issues  
- Clichéd formulations without genuine understanding
- Empty abstractions without substantive content
- Mechanical repetition of talking points without insight

SIGNS OF GENUINE ORIGINALITY (70-100/100 range):
- Actually novel connections between previously unconnected ideas
- Genuinely fresh metaphors that illuminate rather than obfuscate
- New distinctions that cut reality at previously unrecognized joints
- Counterintuitive insights that prove revealing upon examination
- Original reframing that opens new avenues of inquiry

EXAMPLE CONTRAST:
EXAMPLE OF SHALLOW THINKING:
"Novel perspective
'We should all just get along and be nice to each other'
This is superficial moralizing without analytical depth or genuine philosophical insight.
Score: 25/100"

GENUINE ORIGINALITY:  
"Novel perspective
'Names refer directly to objects, not through descriptive mediation'
Demonstrates profound philosophical insight with analytical precision - shows a mind capable of grasping fundamental principles.
Score: 92/100"

The ${parameterCount} Originality Metrics to evaluate:
${selectedMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

SCORING STANDARDS - RECOGNIZE INTELLECTUAL FERTILITY:
- 90-100: Exceptional originality - profound insights showing a fecund, first-rate mind
- 70-89: Very good originality - substantial analytical depth and genuine understanding
- 50-69: Competent originality - adequate insight and independent reasoning
- 20-49: SHALLOW THINKING - superficial analysis, lacks genuine intellectual depth
- 0-19: Complete absence of analytical insight or incoherent

CRITICAL PRINCIPLE: A passage by Herbert Spencer about ethics and evolution should score highly for originality because it demonstrates the kind of profound systematic thinking that rises far above the norm - regardless of when it was written. Judge the intellectual quality and analytical power, not historical precedence.

Return ONLY this JSON structure with ${parameterCount} numbered entries (0 through ${parameterCount - 1}):
{
  "0": {
    "metric": "${selectedMetrics[0]}",
    "score": [number from 0-100],
    "quotation": "EXACT quotation from the passage demonstrating this metric",
    "explanation": "Specific explanation following the reference document's rigorous analytical standards"
  }
}`;

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

Evaluate BOTH passages across all 40 originality metrics. For each metric:
1. Find direct quotations that demonstrate this metric in each passage
2. Provide explanations of how those quotations demonstrate the metric
3. Assign scores from 0-100 (where N/100 means 100-N people out of 100 are better)

The 40 Originality Metrics:
${originalityMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

Return ONLY this JSON structure:
{
  "0": {
    "metric": "Novel perspective",
    "passageA": {
      "quotation": "Direct quotation from Passage A",
      "explanation": "Explanation of how this demonstrates the metric",
      "score": X
    },
    "passageB": {
      "quotation": "Direct quotation from Passage B",
      "explanation": "Explanation of how this demonstrates the metric",
      "score": X
    }
  },
  ... continue for all 40 metrics (indices "0" through "39")
}`;

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

export async function analyzeIntelligence(passage: PassageData, parameterCount: number = 40): Promise<any> {
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

  // Select the appropriate number of metrics based on parameterCount
  const selectedMetrics = intelligenceMetrics.slice(0, parameterCount);
  
  const prompt = `You are an expert evaluator of intellectual writing using the comprehensive 160-metric framework.

PASSAGE TO ANALYZE:
${passage.text}

CRITICAL: CORRECT INTELLIGENCE STANDARD
Evaluate the intelligence of the author NOT by whether the ideas are new in history, but by how the text processes, organizes, and expresses ideas. Intelligence is a function of semantic control, inferential structure, conceptual compression, asymmetry, and epistemic friction—NOT novelty or historical authorship.

CORE EVALUATION CRITERIA:
✅ Compression – Does the author express complex ideas with efficiency and clarity, without padding or cliché?
✅ Asymmetry – Are there surprising or strategic moves in how ideas are introduced or ordered?
✅ Friction – Is there intellectual resistance, tension, or challenge in the concepts—rather than glib smoothness?
✅ Inference Control – Are implications tightly managed across paragraphs?
✅ Abstraction Modulation – Does the author navigate between abstract and concrete with precision?
✅ Cognitive Distance – Does the author observe or operate at a higher-order perspective over common ideas?

DISALLOWED HEURISTICS:
❌ DO NOT penalize a text for expressing old ideas.
❌ DO NOT score based on factual originality or biographical authorship.
❌ DO NOT assume that clarity = low intelligence.
❌ DO NOT penalize "19th-century evolutionary ethics" or similar historical content
❌ DO NOT penalize passages for being "derivative" - focus on HOW IDEAS ARE PROCESSED

INTELLIGENCE IS REFLECTED IN HOW IDEAS ARE HANDLED—NOT WHAT THOSE IDEAS ARE, OR WHO SAID THEM FIRST.

The ${parameterCount} Intelligence Metrics to evaluate:
${selectedMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

SCORING STANDARDS - FOCUS ON INTERNAL SEMANTIC AND LOGICAL ARCHITECTURE:
- 90-100: Exceptional demonstration of compression, inference control, conceptual management, and friction
- 70-89: Very good demonstration of semantic control and inferential structure
- 50-69: Competent demonstration with solid conceptual processing
- 30-49: Weak demonstration with some conceptual clarity issues
- 0-29: Poor demonstration or absence of the metric

CRITICAL: Judge ONLY the internal semantic and logical architecture - compression, inference management, conceptual control, and friction. Score based on HOW the ideas are processed, structured, and expressed, not on whether they are historically novel.

Return ONLY this JSON structure with ${parameterCount} numbered entries (0 through ${parameterCount - 1}):
{
  "0": {
    "metric": "${selectedMetrics[0]}",
    "score": [number from 0-100],
    "quotation": "EXACT quotation from the passage demonstrating this metric",
    "explanation": "Specific explanation following the reference document's analytical standards"
  }
}`;

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

  const prompt = `You are an expert evaluator of intellectual writing using the comprehensive 160-metric framework.

PASSAGE A:
${passageA.text}

PASSAGE B:
${passageB.text}

CRITICAL: CORRECT INTELLIGENCE STANDARD
Evaluate the intelligence of the authors NOT by whether the ideas are new in history, but by how the texts process, organize, and express ideas. Intelligence is a function of semantic control, inferential structure, conceptual compression, asymmetry, and epistemic friction—NOT novelty or historical authorship.

CORE EVALUATION CRITERIA:
✅ Compression – Does the author express complex ideas with efficiency and clarity, without padding or cliché?
✅ Asymmetry – Are there surprising or strategic moves in how ideas are introduced or ordered?
✅ Friction – Is there intellectual resistance, tension, or challenge in the concepts—rather than glib smoothness?
✅ Inference Control – Are implications tightly managed across paragraphs?
✅ Abstraction Modulation – Does the author navigate between abstract and concrete with precision?
✅ Cognitive Distance – Does the author observe or operate at a higher-order perspective over common ideas?

DISALLOWED HEURISTICS:
❌ DO NOT penalize a text for expressing old ideas.
❌ DO NOT score based on factual originality or biographical authorship.
❌ DO NOT assume that clarity = low intelligence.
❌ DO NOT penalize passages for being "derivative" - focus on HOW IDEAS ARE PROCESSED

INTELLIGENCE IS REFLECTED IN HOW IDEAS ARE HANDLED—NOT WHAT THOSE IDEAS ARE, OR WHO SAID THEM FIRST.

Evaluate BOTH passages across all 40 intelligence metrics. For each metric:
1. Find direct quotations that demonstrate this metric in each passage
2. Provide explanations of how those quotations demonstrate the metric
3. Assign scores from 0-100 based on semantic control and inferential structure

The 40 Intelligence Metrics:
${intelligenceMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

Return ONLY this JSON structure:
{
  "0": {
    "metric": "Compression (density of meaning per word)",
    "passageA": {
      "quotation": "Direct quotation from Passage A",
      "explanation": "Explanation of how this demonstrates the metric",
      "score": X
    },
    "passageB": {
      "quotation": "Direct quotation from Passage B",
      "explanation": "Explanation of how this demonstrates the metric",
      "score": X
    }
  },
  ... continue for all 40 metrics (indices "0" through "39")
}`;

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
      console.log("Raw response for debugging:", responseText.substring(0, 500));
      // Try to extract JSON from code blocks if wrapped in markdown
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch (innerError) {
          console.error("Failed to parse extracted JSON:", innerError);
          console.error("Extracted content:", jsonMatch[1].substring(0, 200));
        }
      }
      
      // Try to find JSON without code blocks
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        try {
          const jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonStr);
        } catch (innerError) {
          console.error("Failed to parse extracted JSON without code blocks:", innerError);
        }
      }
      
      console.error("Failed to parse JSON response for dual intelligence analysis:", parseError);
      throw new Error("Invalid JSON response from AI service");
    }
  } catch (error) {
    console.error("Error in Anthropic dual intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeCogency(passage: PassageData, parameterCount: number = 40): Promise<any> {
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

  // Select the appropriate number of metrics based on parameterCount
  const selectedMetrics = cogencyMetrics.slice(0, parameterCount);
  
  const prompt = `You are an expert evaluator of intellectual writing using the comprehensive 160-metric framework. You must analyze this passage using the same rigorous methodology demonstrated in the uploaded reference document.

PASSAGE TO ANALYZE:
${passage.text}

CRITICAL EVALUATION REQUIREMENTS:
- Use DIRECT QUOTATIONS from the passage for each metric (never generic descriptions)
- Provide specific explanations of how each quotation demonstrates the metric
- Score from 0-100 where N/100 means 100-N people out of 100 are better
- Apply the same rigorous standards shown in the reference examples

EXAMPLE FORMAT - DISTINGUISH SUBSTANCE FROM BULLSHIT:

HIGH QUALITY EXAMPLE:
"Logical validity
'If x causes y, that is because there is some law of nature to the effect that if something has the properties that x has, then something else will have the properties that y has.'
Clear conditional structure with valid logical form - premises lead necessarily to conclusion.
Score: 88/100"

VACUOUS CONTENT EXAMPLE:
"Logical validity  
'Transcendental empiricism attempts to dissolve an epistemological dilemma by splitting the difference between diametrically opposed accounts.'
This describes a method abstractly without demonstrating logical validity - no actual logical structure is presented or analyzed.
Score: 35/100"

The ${parameterCount} Cogency Metrics to evaluate:
${selectedMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

SCORING STANDARDS - EVALUATE LOGICAL SUBSTANCE:
- 90-100: Exceptional cogency with clear, valid reasoning and strong logical structure
- 70-89: Very good cogency with solid logical foundations and sound arguments
- 50-69: Competent cogency with adequate logical support and reasonable structure
- 20-49: WEAK REASONING - circular logic, unsupported claims, logical fallacies, lack of genuine argumentation
- 0-19: Complete logical incoherence or absence of reasoning

IMPORTANT: Judge based on logical merit, not vocabulary complexity. Sophisticated arguments using technical terms should score highly if logically sound.

Return ONLY this JSON structure with ${parameterCount} numbered entries (0 through ${parameterCount - 1}):
{
  "0": {
    "metric": "${selectedMetrics[0]}",
    "score": [number from 0-100],
    "quotation": "EXACT quotation from the passage demonstrating this metric",
    "explanation": "Specific explanation following the reference document's rigorous analytical standards"
  }
}`;

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
        console.error("Failed to parse Anthropic Cogency JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
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

CRITICAL SCORING PROTOCOL:
- Scores are POPULATION PERCENTILES: N/100 means this text is more cogent than N people out of 100
- Score 71/100 = more cogent than 71 people, so 29 people are more cogent
- Score 85/100 = more cogent than 85 people, so 15 people are more cogent
- Score 35/100 = more cogent than 35 people, so 65 people are more cogent  
- No hardcoded biases - evaluate purely on argumentative strength and logical rigor

Evaluate BOTH passages across all 40 cogency metrics. For each passage and each metric, provide:
1. The metric name
2. A direct quotation from the passage that demonstrates this metric
3. An explanation of how that quotation supports the characterization/score
4. A score from 0-100 (population percentile - higher = fewer people more cogent than this demonstrates)

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

export async function analyzeOverallQuality(passage: PassageData, parameterCount: number = 40): Promise<any> {
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

  // Select the appropriate number of metrics based on parameterCount
  const selectedMetrics = qualityMetrics.slice(0, parameterCount);

  const prompt = `You are an expert evaluator of intellectual writing using the comprehensive 160-metric framework. You must analyze this passage using the same rigorous methodology demonstrated in the uploaded reference document.

PASSAGE TO ANALYZE:
${passage.text}

CRITICAL EVALUATION REQUIREMENTS:
- Use DIRECT QUOTATIONS from the passage for each metric (never generic descriptions)
- Provide specific explanations of how each quotation demonstrates the metric
- Score from 0-100 where N/100 means 100-N people out of 100 are better
- Apply the same rigorous standards shown in the reference examples

EXAMPLE FORMAT - DETECT PSEUDO-SOPHISTICATION:

EXAMPLE OF EMPTY CATEGORIZATION:
"Clarity of expression
'Transcendental empiricism is, among other things, a philosophy of mental content.'
This merely categorizes without explaining what makes it distinctive or how it works as a philosophy.
Score: 45/100"

HIGH QUALITY WRITING:
"Clarity of expression
'Names refer directly to objects, not through the mediation of descriptions.'
Cuts through philosophical confusion with precise, illuminating language that genuinely clarifies the issue.
Score: 85/100"

The ${parameterCount} Overall Quality Metrics to evaluate:
${selectedMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

SCORING STANDARDS - EVALUATE GENUINE QUALITY:
- 90-100: Exceptional quality with genuine insight and effective communication
- 70-89: Very good quality with substantive content and skilled execution
- 50-69: Competent quality with adequate substance and reasonable clarity
- 20-49: POOR QUALITY - lacks substance, unclear communication, no genuine advancement of understanding
- 0-19: Completely poor quality or incoherent

IMPORTANT: High-quality writing may use complex vocabulary when precision demands it. Judge based on whether the writing effectively serves its intellectual purpose.

Return ONLY this JSON structure with ${parameterCount} numbered entries (0 through ${parameterCount - 1}):
{
  "0": {
    "metric": "${selectedMetrics[0]}",
    "score": [number from 0-100],
    "quotation": "EXACT quotation from the passage demonstrating this metric",
    "explanation": "Specific explanation following the reference document's rigorous analytical standards"
  }
}`;

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
        console.error("Failed to parse Anthropic Overall Quality JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
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

CRITICAL SCORING PROTOCOL:
- Scores are POPULATION PERCENTILES: N/100 means this text has better quality than N people out of 100
- Score 71/100 = better quality than 71 people, so 29 people have better quality
- Score 85/100 = better quality than 85 people, so 15 people have better quality
- Score 35/100 = better quality than 35 people, so 65 people have better quality
- No hardcoded biases - evaluate purely on writing quality and intellectual merit

Evaluate BOTH passages across all 40 overall quality metrics. For each passage and each metric, provide:
1. The metric name
2. A direct quotation from the passage that demonstrates this metric
3. An explanation of how that quotation supports the characterization/score
4. A score from 0-100 (population percentile - higher = fewer people with better quality than this demonstrates)

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

// NEW FEATURE: Generate Perfect Example (100/100 score) 
export async function generatePerfectExample(originalPassage: PassageData): Promise<string> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const prompt = `You are an expert writer who can produce writing that scores 95-99/100 on all intellectual metrics.

ORIGINAL PASSAGE (that scored poorly):
${originalPassage.text}

Your task: Write a passage on the same general topic that would score 95-99/100 across all 160 metrics (Intelligence, Originality, Cogency, Overall Quality). 

KEY REQUIREMENTS:
1. Same general topic/subject matter as the original
2. Similar length (but can be longer if needed for quality)
3. Advocate similar views/arguments where reasonable (within the constraints of creating excellent writing)
4. Demonstrate ALL the qualities of exceptional intellectual writing:

INTELLIGENCE (95-99/100): High compression of meaning, sophisticated abstraction, multi-step reasoning, epistemic humility, cognitive distancing, counterfactual reasoning, deep analogies, semantic interconnectedness, conceptual layering, precise definitions, etc.

ORIGINALITY (95-99/100): Novel perspectives, uncommon connections, surprising but apt analogies, fresh metaphors, counterintuitive insights that hold, avoiding mimicry, generating conceptual friction, independent pattern recognition, etc.

COGENCY (95-99/100): Logical validity, absence of contradictions, strong evidence, proportional conclusions, explicit structure, tight inferences, handling counterexamples, avoiding overgeneralization, etc.

OVERALL QUALITY (95-99/100): Clear expression, excellent flow, stylistic control, perfect grammar, appropriate tone, coherence, engagement, natural transitions, economy of language, memorability, etc.

Generate a passage that would genuinely score 95-99/100. This will show the user exactly what the evaluation system considers "perfect" writing.

Return ONLY the generated passage text, no other commentary.`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    return message.content[0].text;
  } catch (error) {
    console.error("Error generating perfect example:", error);
    throw error;
  }
}