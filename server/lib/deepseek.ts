import OpenAI from "openai";
import { PassageData } from "../../client/src/lib/types";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1"
});

if (!process.env.DEEPSEEK_API_KEY) {
  console.warn("DeepSeek API key not found. DeepSeek analysis will be unavailable.");
}

export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not configured");
    }

    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `You are an expert in evaluating the intelligence demonstrated in intellectual writing across all disciplines. 

Analyze the passage across these 20 intelligence metrics:

1. Compression - Density of meaning per word
2. Abstraction - Ability to move beyond surface detail
3. Inference Depth - Multi-step reasoning capability
4. Epistemic Friction - Acknowledging uncertainty or limits
5. Cognitive Distancing - Seeing from outside a frame
6. Counterfactual Reasoning - What-if scenario analysis
7. Analogical Depth - Quality of comparisons made
8. Semantic Topology - Connectedness of ideas
9. Asymmetry - Unexpected but apt perspective shifts
10. Conceptual Layering - Multiple levels operating simultaneously
11. Original Definition-Making - Creating new precise concepts
12. Precision of Terms - Exactness in language use
13. Distinction-Tracking - Keeping categories straight
14. Avoidance of Tautology - Not circular reasoning
15. Avoidance of Empty Generality - Specific rather than vague
16. Compression of Examples into Principle - Extracting general rules
17. Ability to Invert Perspective - Seeing from opposite angle
18. Anticipation of Objections - Foreseeing counterarguments
19. Integration of Disparate Domains - Connecting different fields
20. Self-Reflexivity - Awareness of own intellectual stance

For each metric, provide a score from 0-100 and a brief assessment.

Title: ${passageTitle}
${userContext ? `Context: ${userContext}` : ""}

Text:
${passage.text}

Return analysis in this JSON format:
{
  "intelligence": {
    "compression": {"score": 0-100, "assessment": "brief analysis"},
    "abstraction": {"score": 0-100, "assessment": "brief analysis"},
    "inferenceDepth": {"score": 0-100, "assessment": "brief analysis"},
    "epistemicFriction": {"score": 0-100, "assessment": "brief analysis"},
    "cognitiveDistancing": {"score": 0-100, "assessment": "brief analysis"},
    "counterfactualReasoning": {"score": 0-100, "assessment": "brief analysis"},
    "analogicalDepth": {"score": 0-100, "assessment": "brief analysis"},
    "semanticTopology": {"score": 0-100, "assessment": "brief analysis"},
    "asymmetry": {"score": 0-100, "assessment": "brief analysis"},
    "conceptualLayering": {"score": 0-100, "assessment": "brief analysis"},
    "originalDefinitionMaking": {"score": 0-100, "assessment": "brief analysis"},
    "precisionOfTerms": {"score": 0-100, "assessment": "brief analysis"},
    "distinctionTracking": {"score": 0-100, "assessment": "brief analysis"},
    "avoidanceOfTautology": {"score": 0-100, "assessment": "brief analysis"},
    "avoidanceOfEmptyGenerality": {"score": 0-100, "assessment": "brief analysis"},
    "compressionOfExamplesIntoPrinciple": {"score": 0-100, "assessment": "brief analysis"},
    "abilityToInvertPerspective": {"score": 0-100, "assessment": "brief analysis"},
    "anticipationOfObjections": {"score": 0-100, "assessment": "brief analysis"},
    "integrationOfDisparateDomains": {"score": 0-100, "assessment": "brief analysis"},
    "selfReflexivity": {"score": 0-100, "assessment": "brief analysis"}
  },
  "summary": "Overall assessment of the passage's intelligence across all 20 metrics"
}`
        }
      ],
      max_tokens: 8000,
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from DeepSeek API");
    }

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error in DeepSeek intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not configured");
    }

    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Compare these two passages across 20 intelligence metrics:

1. Compression - Density of meaning per word
2. Abstraction - Ability to move beyond surface detail
3. Inference Depth - Multi-step reasoning capability
4. Epistemic Friction - Acknowledging uncertainty or limits
5. Cognitive Distancing - Seeing from outside a frame
6. Counterfactual Reasoning - What-if scenario analysis
7. Analogical Depth - Quality of comparisons made
8. Semantic Topology - Connectedness of ideas
9. Asymmetry - Unexpected but apt perspective shifts
10. Conceptual Layering - Multiple levels operating simultaneously
11. Original Definition-Making - Creating new precise concepts
12. Precision of Terms - Exactness in language use
13. Distinction-Tracking - Keeping categories straight
14. Avoidance of Tautology - Not circular reasoning
15. Avoidance of Empty Generality - Specific rather than vague
16. Compression of Examples into Principle - Extracting general rules
17. Ability to Invert Perspective - Seeing from opposite angle
18. Anticipation of Objections - Foreseeing counterarguments
19. Integration of Disparate Domains - Connecting different fields
20. Self-Reflexivity - Awareness of own intellectual stance

For each metric, provide scores from 0-100 and brief assessments for both passages.

Passage A (${passageATitle}):
${passageA.text}

Passage B (${passageBTitle}):
${passageB.text}

Return analysis in this JSON format:
{
  "intelligence": {
    "compression": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "abstraction": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "inferenceDepth": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "epistemicFriction": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "cognitiveDistancing": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "counterfactualReasoning": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "analogicalDepth": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "semanticTopology": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "asymmetry": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "conceptualLayering": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "originalDefinitionMaking": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "precisionOfTerms": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "distinctionTracking": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "avoidanceOfTautology": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "avoidanceOfEmptyGenerality": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "compressionOfExamplesIntoPrinciple": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "abilityToInvertPerspective": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "anticipationOfObjections": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "integrationOfDisparateDomains": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "selfReflexivity": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}}
  },
  "summary": "Overall assessment comparing both passages across all 20 intelligence metrics"
}`
        }
      ],
      max_tokens: 8000,
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from DeepSeek API");
    }

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error in DeepSeek dual intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not configured");
    }

    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `You are an expert in evaluating the originality demonstrated in intellectual writing across all disciplines. 

Analyze the passage across these 20 originality metrics:

1. Transformational Synthesis - Does author transform inherited ideas into something new?
2. Generative Power - Does work open new lines of inquiry?
3. Disciplinary Repositioning - Does text challenge/redraw field's boundaries?
4. Conceptual Reframing - Are familiar problems recast in novel terms?
5. Analytic Re-Alignment - Does author redirect from false to better problems?
6. Unexpected Cross-Pollination - Does author import from distant domains?
7. Epistemic Reweighting - Are marginal ideas made central by principled arguments?
8. Constraint Innovation - Are new constraints introduced improving reasoning quality?
9. Ontology Re-specification - Is underlying structure of entities reconsidered?
10. Heuristic Leap - Is intuitive/lateral move introduced reframing field?
11. Problem Re-Indexing - Are known problems recoded into more productive forms?
12. Axiomatic Innovation - Does work posit new fundamental assumption/shift?
13. Moral/Political Recomputation - Are prevailing frames creatively re-evaluated?
14. Subtext Excavation - Does work uncover previously hidden conceptual background?
15. Second-Order Innovation - Is method itself subject to creative evolution?
16. Temporal Inversion - Does author treat past positions as unrealized futures?
17. Negative Space Manipulation - Does author point to gaps/absences as fruitful?
18. Unnatural Pairing - Does author combine rarely/never combined concepts?
19. Disciplinary Hijack - Is another field's frame adopted for new context?
20. Onto-Epistemic Fusion - Does work entangle ontology/epistemology productively?

Title: ${passageTitle}
${userContext ? `Context: ${userContext}` : ""}

Text:
${passage.text}

Return analysis in this JSON format:
{
  "originality": {
    "transformationalSynthesis": {"score": 0-100, "assessment": "brief analysis"},
    "generativePower": {"score": 0-100, "assessment": "brief analysis"},
    "disciplinaryRepositioning": {"score": 0-100, "assessment": "brief analysis"},
    "conceptualReframing": {"score": 0-100, "assessment": "brief analysis"},
    "analyticReAlignment": {"score": 0-100, "assessment": "brief analysis"},
    "unexpectedCrossPollination": {"score": 0-100, "assessment": "brief analysis"},
    "epistemicReweighting": {"score": 0-100, "assessment": "brief analysis"},
    "constraintInnovation": {"score": 0-100, "assessment": "brief analysis"},
    "ontologyReSpecification": {"score": 0-100, "assessment": "brief analysis"},
    "heuristicLeap": {"score": 0-100, "assessment": "brief analysis"},
    "problemReIndexing": {"score": 0-100, "assessment": "brief analysis"},
    "axiomaticInnovation": {"score": 0-100, "assessment": "brief analysis"},
    "moralPoliticalRecomputation": {"score": 0-100, "assessment": "brief analysis"},
    "subtextExcavation": {"score": 0-100, "assessment": "brief analysis"},
    "secondOrderInnovation": {"score": 0-100, "assessment": "brief analysis"},
    "temporalInversion": {"score": 0-100, "assessment": "brief analysis"},
    "negativeSpaceManipulation": {"score": 0-100, "assessment": "brief analysis"},
    "unnaturalPairing": {"score": 0-100, "assessment": "brief analysis"},
    "disciplinaryHijack": {"score": 0-100, "assessment": "brief analysis"},
    "ontoEpistemicFusion": {"score": 0-100, "assessment": "brief analysis"}
  },
  "summary": "Overall assessment of the passage's originality across all 20 metrics"
}`
        }
      ],
      max_tokens: 8000,
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from DeepSeek API");
    }

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error in DeepSeek originality analysis:", error);
    throw error;
  }
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not configured");
    }

    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Compare these two passages across 20 originality metrics:

1. Transformational Synthesis - Does author transform inherited ideas into something new?
2. Generative Power - Does work open new lines of inquiry?
3. Disciplinary Repositioning - Does text challenge/redraw field's boundaries?
4. Conceptual Reframing - Are familiar problems recast in novel terms?
5. Analytic Re-Alignment - Does author redirect from false to better problems?
6. Unexpected Cross-Pollination - Does author import from distant domains?
7. Epistemic Reweighting - Are marginal ideas made central by principled arguments?
8. Constraint Innovation - Are new constraints introduced improving reasoning quality?
9. Ontology Re-specification - Is underlying structure of entities reconsidered?
10. Heuristic Leap - Is intuitive/lateral move introduced reframing field?
11. Problem Re-Indexing - Are known problems recoded into more productive forms?
12. Axiomatic Innovation - Does work posit new fundamental assumption/shift?
13. Moral/Political Recomputation - Are prevailing frames creatively re-evaluated?
14. Subtext Excavation - Does work uncover previously hidden conceptual background?
15. Second-Order Innovation - Is method itself subject to creative evolution?
16. Temporal Inversion - Does author treat past positions as unrealized futures?
17. Negative Space Manipulation - Does author point to gaps/absences as fruitful?
18. Unnatural Pairing - Does author combine rarely/never combined concepts?
19. Disciplinary Hijack - Is another field's frame adopted for new context?
20. Onto-Epistemic Fusion - Does work entangle ontology/epistemology productively?

Passage A (${passageATitle}):
${passageA.text}

Passage B (${passageBTitle}):
${passageB.text}

Return analysis in this JSON format:
{
  "originality": {
    "transformationalSynthesis": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "generativePower": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "disciplinaryRepositioning": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "conceptualReframing": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "analyticReAlignment": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "unexpectedCrossPollination": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "epistemicReweighting": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "constraintInnovation": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "ontologyReSpecification": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "heuristicLeap": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "problemReIndexing": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "axiomaticInnovation": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "moralPoliticalRecomputation": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "subtextExcavation": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "secondOrderInnovation": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "temporalInversion": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "negativeSpaceManipulation": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "unnaturalPairing": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "disciplinaryHijack": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "ontoEpistemicFusion": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}}
  },
  "summary": "Overall assessment comparing both passages across all 20 originality metrics"
}`
        }
      ],
      max_tokens: 8000,
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from DeepSeek API");
    }

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error in DeepSeek dual originality analysis:", error);
    throw error;
  }
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not configured");
    }

    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `You are an expert in evaluating the cogency demonstrated in intellectual writing across all disciplines. 

Analyze the passage across these 20 cogency metrics:

1. Argumentative Continuity - Is each claim supported by those before?
2. Error-Resistance - Can argument absorb counterpoints without collapse?
3. Specificity of Commitment - Are claims stated precisely and clearly?
4. Provisionality Control - Does author know when to hedge vs commit?
5. Load Distribution - Are inferential loads distributed efficiently?
6. Error Anticipation - Are potential objections built into argument?
7. Epistemic Parsimony - Does argument avoid unnecessary complexity?
8. Scope Clarity - Is domain of applicability clear?
9. Evidence Calibration - Are claims weighted relative to their support?
10. Redundancy Avoidance - Are points repeated without need?
11. Conceptual Interlock - Do definitions and theses cohere together?
12. Temporal Stability - Does argument hold over time or revisions?
13. Distinction Awareness - Are relevant distinctions tracked and preserved?
14. Layered Persuasiveness - Does argument work for multiple reader levels?
15. Signal Discipline - Is signal-to-rhetoric ratio high?
16. Causal Alignment - Do causal claims line up with evidence/theory?
17. Counterexample Immunity - Is argument resilient to typical counterexamples?
18. Intelligibility of Objection - Would smart opponent know what to attack?
19. Dependence Hierarchy Awareness - Are structural dependencies tracked?
20. Context-Bounded Inference - Are inferences valid under clear assumptions?

Title: ${passageTitle}
${userContext ? `Context: ${userContext}` : ""}

Text:
${passage.text}

Return analysis in this JSON format:
{
  "cogency": {
    "argumentativeContinuity": {"score": 0-100, "assessment": "brief analysis"},
    "errorResistance": {"score": 0-100, "assessment": "brief analysis"},
    "specificityOfCommitment": {"score": 0-100, "assessment": "brief analysis"},
    "provisionalityControl": {"score": 0-100, "assessment": "brief analysis"},
    "loadDistribution": {"score": 0-100, "assessment": "brief analysis"},
    "errorAnticipation": {"score": 0-100, "assessment": "brief analysis"},
    "epistemicParsimony": {"score": 0-100, "assessment": "brief analysis"},
    "scopeClarity": {"score": 0-100, "assessment": "brief analysis"},
    "evidenceCalibration": {"score": 0-100, "assessment": "brief analysis"},
    "redundancyAvoidance": {"score": 0-100, "assessment": "brief analysis"},
    "conceptualInterlock": {"score": 0-100, "assessment": "brief analysis"},
    "temporalStability": {"score": 0-100, "assessment": "brief analysis"},
    "distinctionAwareness": {"score": 0-100, "assessment": "brief analysis"},
    "layeredPersuasiveness": {"score": 0-100, "assessment": "brief analysis"},
    "signalDiscipline": {"score": 0-100, "assessment": "brief analysis"},
    "causalAlignment": {"score": 0-100, "assessment": "brief analysis"},
    "counterexampleImmunity": {"score": 0-100, "assessment": "brief analysis"},
    "intelligibilityOfObjection": {"score": 0-100, "assessment": "brief analysis"},
    "dependenceHierarchyAwareness": {"score": 0-100, "assessment": "brief analysis"},
    "contextBoundedInference": {"score": 0-100, "assessment": "brief analysis"}
  },
  "summary": "Overall assessment of the passage's cogency across all 20 metrics"
}`
        }
      ],
      max_tokens: 8000,
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from DeepSeek API");
    }

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error in DeepSeek cogency analysis:", error);
    throw error;
  }
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not configured");
    }

    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Compare these two passages across 20 cogency metrics:

1. Argumentative Continuity - Is each claim supported by those before?
2. Error-Resistance - Can argument absorb counterpoints without collapse?
3. Specificity of Commitment - Are claims stated precisely and clearly?
4. Provisionality Control - Does author know when to hedge vs commit?
5. Load Distribution - Are inferential loads distributed efficiently?
6. Error Anticipation - Are potential objections built into argument?
7. Epistemic Parsimony - Does argument avoid unnecessary complexity?
8. Scope Clarity - Is domain of applicability clear?
9. Evidence Calibration - Are claims weighted relative to their support?
10. Redundancy Avoidance - Are points repeated without need?
11. Conceptual Interlock - Do definitions and theses cohere together?
12. Temporal Stability - Does argument hold over time or revisions?
13. Distinction Awareness - Are relevant distinctions tracked and preserved?
14. Layered Persuasiveness - Does argument work for multiple reader levels?
15. Signal Discipline - Is signal-to-rhetoric ratio high?
16. Causal Alignment - Do causal claims line up with evidence/theory?
17. Counterexample Immunity - Is argument resilient to typical counterexamples?
18. Intelligibility of Objection - Would smart opponent know what to attack?
19. Dependence Hierarchy Awareness - Are structural dependencies tracked?
20. Context-Bounded Inference - Are inferences valid under clear assumptions?

Passage A (${passageATitle}):
${passageA.text}

Passage B (${passageBTitle}):
${passageB.text}

Return analysis in this JSON format:
{
  "cogency": {
    "argumentativeContinuity": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "errorResistance": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "specificityOfCommitment": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "provisionalityControl": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "loadDistribution": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "errorAnticipation": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "epistemicParsimony": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "scopeClarity": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "evidenceCalibration": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "redundancyAvoidance": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "conceptualInterlock": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "temporalStability": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "distinctionAwareness": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "layeredPersuasiveness": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "signalDiscipline": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "causalAlignment": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "counterexampleImmunity": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "intelligibilityOfObjection": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "dependenceHierarchyAwareness": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "contextBoundedInference": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}}
  },
  "summary": "Overall assessment comparing both passages across all 20 cogency metrics"
}`
        }
      ],
      max_tokens: 8000,
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from DeepSeek API");
    }

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error in DeepSeek dual cogency analysis:", error);
    throw error;
  }
}

export async function analyzeQuality(passage: PassageData): Promise<any> {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not configured");
    }

    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `You are an expert in evaluating the overall quality demonstrated in intellectual writing across all disciplines. 

Analyze the passage across these 20 overall quality metrics:

1. Conceptual Compression - How much conceptual work is done per unit of language?
2. Epistemic Friction - Are claims under tension? Do they resist paraphrase?
3. Inference Control - Does the author show tight command over logical progression?
4. Asymmetry of Cognitive Labor - Is the writer doing more work than the reader?
5. Novelty-to-Baseline Ratio - How much content exceeds textbook-level summary?
6. Internal Differentiation - Are internal contrasts and tensions developed?
7. Problem Density - Are real problems identified vs solution-shaped without problem?
8. Compression Across Levels - Are sentence, paragraph, structural layers all working?
9. Semantic Specificity - Are key terms defined with rigor and used consistently?
10. Explanatory Yield - Does text resolve or clarify previously obscure phenomena?
11. Meta-Cognitive Signal - Does author display awareness of method limits/tensions?
12. Structural Integrity - Is argument/content architecture coherent at scale?
13. Generative Potential - Does writing suggest future questions/applications?
14. Signal-to-Rhetoric Ratio - What percent actually says something vs fluff?
15. Dialectical Engagement - Does work engage objections/alternatives intelligently?
16. Topological Awareness - Does author map conceptual terrain well?
17. Disambiguation Skill - Are ambiguous terms/ideas resolved precisely?
18. Cross-Disciplinary Fluency - Can text move fluently across relevant domains?
19. Psychological Realism - Are motivations/mental models psychologically plausible?
20. Intellectual Risk Quotient - Is author putting real intellectual position on line?

Title: ${passageTitle}
${userContext ? `Context: ${userContext}` : ""}

Text:
${passage.text}

Return analysis in this JSON format:
{
  "overallQuality": {
    "conceptualCompression": {"score": 0-100, "assessment": "brief analysis"},
    "epistemicFriction": {"score": 0-100, "assessment": "brief analysis"},
    "inferenceControl": {"score": 0-100, "assessment": "brief analysis"},
    "asymmetryOfCognitiveLabor": {"score": 0-100, "assessment": "brief analysis"},
    "noveltyToBaselineRatio": {"score": 0-100, "assessment": "brief analysis"},
    "internalDifferentiation": {"score": 0-100, "assessment": "brief analysis"},
    "problemDensity": {"score": 0-100, "assessment": "brief analysis"},
    "compressionAcrossLevels": {"score": 0-100, "assessment": "brief analysis"},
    "semanticSpecificity": {"score": 0-100, "assessment": "brief analysis"},
    "explanatoryYield": {"score": 0-100, "assessment": "brief analysis"},
    "metaCognitiveSignal": {"score": 0-100, "assessment": "brief analysis"},
    "structuralIntegrity": {"score": 0-100, "assessment": "brief analysis"},
    "generativePotential": {"score": 0-100, "assessment": "brief analysis"},
    "signalToRhetoricRatio": {"score": 0-100, "assessment": "brief analysis"},
    "dialecticalEngagement": {"score": 0-100, "assessment": "brief analysis"},
    "topologicalAwareness": {"score": 0-100, "assessment": "brief analysis"},
    "disambiguationSkill": {"score": 0-100, "assessment": "brief analysis"},
    "crossDisciplinaryFluency": {"score": 0-100, "assessment": "brief analysis"},
    "psychologicalRealism": {"score": 0-100, "assessment": "brief analysis"},
    "intellectualRiskQuotient": {"score": 0-100, "assessment": "brief analysis"}
  },
  "summary": "Overall assessment of the passage's quality across all 20 metrics"
}`
        }
      ],
      max_tokens: 8000,
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from DeepSeek API");
    }

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error in DeepSeek quality analysis:", error);
    throw error;
  }
}

export async function analyzeQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not configured");
    }

    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Compare these two passages across 20 overall quality metrics:

1. Conceptual Compression - How much conceptual work is done per unit of language?
2. Epistemic Friction - Are claims under tension? Do they resist paraphrase?
3. Inference Control - Does the author show tight command over logical progression?
4. Asymmetry of Cognitive Labor - Is the writer doing more work than the reader?
5. Novelty-to-Baseline Ratio - How much content exceeds textbook-level summary?
6. Internal Differentiation - Are internal contrasts and tensions developed?
7. Problem Density - Are real problems identified vs solution-shaped without problem?
8. Compression Across Levels - Are sentence, paragraph, structural layers all working?
9. Semantic Specificity - Are key terms defined with rigor and used consistently?
10. Explanatory Yield - Does text resolve or clarify previously obscure phenomena?
11. Meta-Cognitive Signal - Does author display awareness of method limits/tensions?
12. Structural Integrity - Is argument/content architecture coherent at scale?
13. Generative Potential - Does writing suggest future questions/applications?
14. Signal-to-Rhetoric Ratio - What percent actually says something vs fluff?
15. Dialectical Engagement - Does work engage objections/alternatives intelligently?
16. Topological Awareness - Does author map conceptual terrain well?
17. Disambiguation Skill - Are ambiguous terms/ideas resolved precisely?
18. Cross-Disciplinary Fluency - Can text move fluently across relevant domains?
19. Psychological Realism - Are motivations/mental models psychologically plausible?
20. Intellectual Risk Quotient - Is author putting real intellectual position on line?

Passage A (${passageATitle}):
${passageA.text}

Passage B (${passageBTitle}):
${passageB.text}

Return analysis in this JSON format:
{
  "overallQuality": {
    "conceptualCompression": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "epistemicFriction": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "inferenceControl": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "asymmetryOfCognitiveLabor": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "noveltyToBaselineRatio": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "internalDifferentiation": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "problemDensity": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "compressionAcrossLevels": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "semanticSpecificity": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "explanatoryYield": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "metaCognitiveSignal": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "structuralIntegrity": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "generativePotential": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "signalToRhetoricRatio": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "dialecticalEngagement": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "topologicalAwareness": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "disambiguationSkill": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "crossDisciplinaryFluency": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "psychologicalRealism": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}},
    "intellectualRiskQuotient": {"passageA": {"score": 0-100, "assessment": "brief analysis"}, "passageB": {"score": 0-100, "assessment": "brief analysis"}}
  },
  "summary": "Overall assessment comparing both passages across all 20 quality metrics"
}`
        }
      ],
      max_tokens: 8000,
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from DeepSeek API");
    }

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error in DeepSeek dual quality analysis:", error);
    throw error;
  }
}

// Overall Quality Analysis (40 metrics) - Single Passage
export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY environment variable is not set");
    }

    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are evaluating text for OVERALL QUALITY using exactly 40 specific metrics. Use the exact format with quote and analysis for each metric."
        },
        {
          role: "user",
          content: `You are evaluating text for OVERALL QUALITY using exactly 40 specific metrics. Use the exact format with quote and analysis for each metric.

Return a JSON object with this structure:
{
  "analysis": "Overall assessment paragraph",
  "metrics": [
    {
      "name": "Metric Name",
      "quote": "Exact quote from text demonstrating this metric",
      "analysis": "Brief explanation of why this quote demonstrates the metric",
      "score": X
    }
  ],
  "overallScore": X,
  "summary": "Brief summary"
}

The 40 Overall Quality metrics:
1. Clarity of expression, 2. Flow and readability, 3. Stylistic control, 4. Grammar and syntax precision, 5. Appropriate tone,
6. Balance of brevity and elaboration, 7. Coherence across sections, 8. Engagement/interest, 9. Rhythm of sentences, 10. Absence of filler,
11. Clear introduction of themes, 12. Effective closure/resolution, 13. Variety of sentence structure, 14. Apt vocabulary, 15. Avoiding clichés,
16. Consistency of style, 17. Accessibility, 18. Respect for audience intelligence, 19. Memorability of phrasing, 20. Avoidance of redundancy,
21. Natural transitions, 22. Balanced paragraphing, 23. Pacing, 24. Smooth handling of complexity, 25. Apt use of examples or illustration,
26. Ability to hold reader attention, 27. Economy of language, 28. Emphasis where needed, 29. Voice consistency, 30. Avoidance of awkwardness,
31. Seamless integration of quotes/sources, 32. Good proportion of abstract vs. concrete, 33. Non-mechanical style, 34. Absence of distracting errors, 35. Balance of analysis and narrative,
36. Cadence, 37. Avoidance of pedantry, 38. Polish, 39. Unifying theme or through-line, 40. Overall reader impact

Passage: ${passage.text}`
        }
      ],
      max_tokens: 8000,
      temperature: 0.2
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from DeepSeek API");
    }

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error in DeepSeek overall quality analysis:", error);
    throw error;
  }
}

// Overall Quality Analysis (40 metrics) - Dual Passage
export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY environment variable is not set");
    }

    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are evaluating two texts for OVERALL QUALITY using exactly 40 specific metrics. Analyze both texts and provide comparative analysis."
        },
        {
          role: "user",
          content: `You are evaluating two texts for OVERALL QUALITY using exactly 40 specific metrics. Analyze both texts and provide comparative analysis.

Return a JSON object with comparative structure for both passages using the same 40 Overall Quality metrics.

Passage A (${passageA.title || 'Passage A'}): ${passageA.text}

Passage B (${passageB.title || 'Passage B'}): ${passageB.text}`
        }
      ],
      max_tokens: 10000,
      temperature: 0.2
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from DeepSeek API");
    }

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Error in DeepSeek dual overall quality analysis:", error);
    throw error;
  }
}

// Legacy functions for backward compatibility
export async function analyzePassages(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    console.log("Legacy analyzePassages function called, using DeepSeek intelligence analysis");
    return analyzeIntelligenceDual(passageA, passageB);
  } catch (error) {
    console.error("Error in legacy DeepSeek analysis:", error);
    throw error;
  }
}

export async function analyzeSinglePassage(passage: PassageData): Promise<any> {
  try {
    console.log("Legacy analyzeSinglePassage function called, using DeepSeek intelligence analysis");
    return analyzeIntelligence(passage);
  } catch (error) {
    console.error("Error in legacy DeepSeek single analysis:", error);
    throw error;
  }
}