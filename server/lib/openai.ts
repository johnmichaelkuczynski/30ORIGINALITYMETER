import OpenAI from "openai";
import { PassageData, SupportingDocument, StyleOption, FeedbackData, SubmitFeedbackRequest } from "../../client/src/lib/types";
import { splitIntoParagraphs } from "../../client/src/lib/utils";
import { AnalysisResult } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// Use environment variable for OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;
console.log("OpenAI API Key status:", apiKey ? "Present" : "Missing");

const openai = new OpenAI({ 
  apiKey 
});

export async function analyzePassages(
  passageA: PassageData,
  passageB: PassageData
): Promise<AnalysisResult> {
  try {
    const paragraphsA = splitIntoParagraphs(passageA.text);
    const paragraphsB = splitIntoParagraphs(passageB.text);

    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in evaluating the originality and quality of intellectual writing across all disciplines. 

You must analyze text using the EXACT format demonstrated in this uploaded example:

**Example Format:**
Compression
"SE and TS don't have the same meaning. They have different propositions for their respective meanings..."
Elegant condensation of Twin-Earth into one decisive claim.
Score: 96/100

Abstraction
"Implicit in what Kripke said about proper names are many deep and important principles concerning the very nature of meaning..."
Takes a narrow semantic point and raises it to the level of philosophy of mind and meaning.
Score: 95/100

Each metric MUST follow this format:
- Metric name
- Quote from the text demonstrating that metric
- Brief analysis explaining why the quote demonstrates the metric
- Score: X/100

Analyze the passages across these 80 comprehensive quality metrics organized into 4 categories:

OVERALL QUALITY METRICS (20):
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

INTELLIGENCE METRICS (20):
21. Compression - Density of meaning per word
22. Abstraction - Ability to move beyond surface detail
23. Inference Depth - Multi-step reasoning capability
24. Epistemic Friction - Acknowledging uncertainty or limits
25. Cognitive Distancing - Seeing from outside a frame
26. Counterfactual Reasoning - What-if scenario analysis
27. Analogical Depth - Quality of comparisons made
28. Semantic Topology - Connectedness of ideas
29. Asymmetry - Unexpected but apt perspective shifts
30. Conceptual Layering - Multiple levels operating simultaneously
31. Original Definition-Making - Creating new precise concepts
32. Precision of Terms - Exactness in language use
33. Distinction-Tracking - Keeping categories straight
34. Avoidance of Tautology - Not circular reasoning
35. Avoidance of Empty Generality - Specific rather than vague
36. Compression of Examples into Principle - Extracting general rules
37. Ability to Invert Perspective - Seeing from opposite angle
38. Anticipation of Objections - Foreseeing counterarguments
39. Integration of Disparate Domains - Connecting different fields
40. Self-Reflexivity - Awareness of own intellectual stance

COGENCY METRICS (20):
41. Argumentative Continuity - Is each claim supported by those before?
42. Error-Resistance - Can argument absorb counterpoints without collapse?
43. Specificity of Commitment - Are claims stated precisely and clearly?
44. Provisionality Control - Does author know when to hedge vs commit?
45. Load Distribution - Are inferential loads distributed efficiently?
46. Error Anticipation - Are potential objections built into argument?
47. Epistemic Parsimony - Does argument avoid unnecessary complexity?
48. Scope Clarity - Is domain of applicability clear?
49. Evidence Calibration - Are claims weighted relative to their support?
50. Redundancy Avoidance - Are points repeated without need?
51. Conceptual Interlock - Do definitions and theses cohere together?
52. Temporal Stability - Does argument hold over time or revisions?
53. Distinction Awareness - Are relevant distinctions tracked and preserved?
54. Layered Persuasiveness - Does argument work for multiple reader levels?
55. Signal Discipline - Is signal-to-rhetoric ratio high?
56. Causal Alignment - Do causal claims line up with evidence/theory?
57. Counterexample Immunity - Is argument resilient to typical counterexamples?
58. Intelligibility of Objection - Would smart opponent know what to attack?
59. Dependence Hierarchy Awareness - Are structural dependencies tracked?
60. Context-Bounded Inference - Are inferences valid under clear assumptions?

ORIGINALITY METRICS (20):
61. Transformational Synthesis - Does author transform inherited ideas into something new?
62. Generative Power - Does work open new lines of inquiry?
63. Disciplinary Repositioning - Does text challenge/redraw field's boundaries?
64. Conceptual Reframing - Are familiar problems recast in novel terms?
65. Analytic Re-Alignment - Does author redirect from false to better problems?
66. Unexpected Cross-Pollination - Does author import from distant domains?
67. Epistemic Reweighting - Are marginal ideas made central by principled arguments?
68. Constraint Innovation - Are new constraints introduced improving reasoning quality?
69. Ontology Re-specification - Is underlying structure of entities reconsidered?
70. Heuristic Leap - Is intuitive/lateral move introduced reframing field?
71. Problem Re-Indexing - Are known problems recoded into more productive forms?
72. Axiomatic Innovation - Does work posit new fundamental assumption/shift?
73. Moral/Political Recomputation - Are prevailing frames creatively re-evaluated?
74. Subtext Excavation - Does work uncover previously hidden conceptual background?
75. Second-Order Innovation - Is method itself subject to creative evolution?
76. Temporal Inversion - Does author treat past positions as unrealized futures?
77. Negative Space Manipulation - Does author point to gaps/absences as fruitful?
78. Unnatural Pairing - Does author combine rarely/never combined concepts?
79. Disciplinary Hijack - Is another field's frame adopted for new context?
80. Onto-Epistemic Fusion - Does work entangle ontology/epistemology productively?

For each metric, provide a score from 0-100 and a brief assessment.

Return your analysis in this JSON format:
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
  "summary": "Overall assessment of both passages across all 80 metrics"
}

Provide detailed analysis of how both passages score across all 80 metrics.`,
        },
        {
          role: "user",
          content: `Please analyze and compare these two passages using all 80 metrics:

Passage A (${passageATitle}):
${passageA.text}

Passage B (${passageBTitle}):
${passageB.text}

Return the analysis in the exact JSON format specified above.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error in OpenAI analysis:", error);
    throw error;
  }
}

export async function analyzeSinglePassage(
  passage: PassageData
): Promise<any> {
  try {
    const paragraphs = splitIntoParagraphs(passage.text);
    const passageTitle = passage.title || "Passage";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in evaluating the originality and quality of intellectual writing across all disciplines. 

Analyze the passage across these 80 comprehensive quality metrics organized into 4 categories:

OVERALL QUALITY METRICS (20):
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

INTELLIGENCE METRICS (20):
21. Compression - Density of meaning per word
22. Abstraction - Ability to move beyond surface detail
23. Inference Depth - Multi-step reasoning capability
24. Epistemic Friction - Acknowledging uncertainty or limits
25. Cognitive Distancing - Seeing from outside a frame
26. Counterfactual Reasoning - What-if scenario analysis
27. Analogical Depth - Quality of comparisons made
28. Semantic Topology - Connectedness of ideas
29. Asymmetry - Unexpected but apt perspective shifts
30. Conceptual Layering - Multiple levels operating simultaneously
31. Original Definition-Making - Creating new precise concepts
32. Precision of Terms - Exactness in language use
33. Distinction-Tracking - Keeping categories straight
34. Avoidance of Tautology - Not circular reasoning
35. Avoidance of Empty Generality - Specific rather than vague
36. Compression of Examples into Principle - Extracting general rules
37. Ability to Invert Perspective - Seeing from opposite angle
38. Anticipation of Objections - Foreseeing counterarguments
39. Integration of Disparate Domains - Connecting different fields
40. Self-Reflexivity - Awareness of own intellectual stance

COGENCY METRICS (20):
41. Argumentative Continuity - Is each claim supported by those before?
42. Error-Resistance - Can argument absorb counterpoints without collapse?
43. Specificity of Commitment - Are claims stated precisely and clearly?
44. Provisionality Control - Does author know when to hedge vs commit?
45. Load Distribution - Are inferential loads distributed efficiently?
46. Error Anticipation - Are potential objections built into argument?
47. Epistemic Parsimony - Does argument avoid unnecessary complexity?
48. Scope Clarity - Is domain of applicability clear?
49. Evidence Calibration - Are claims weighted relative to their support?
50. Redundancy Avoidance - Are points repeated without need?
51. Conceptual Interlock - Do definitions and theses cohere together?
52. Temporal Stability - Does argument hold over time or revisions?
53. Distinction Awareness - Are relevant distinctions tracked and preserved?
54. Layered Persuasiveness - Does argument work for multiple reader levels?
55. Signal Discipline - Is signal-to-rhetoric ratio high?
56. Causal Alignment - Do causal claims line up with evidence/theory?
57. Counterexample Immunity - Is argument resilient to typical counterexamples?
58. Intelligibility of Objection - Would smart opponent know what to attack?
59. Dependence Hierarchy Awareness - Are structural dependencies tracked?
60. Context-Bounded Inference - Are inferences valid under clear assumptions?

ORIGINALITY METRICS (20):
61. Transformational Synthesis - Does author transform inherited ideas into something new?
62. Generative Power - Does work open new lines of inquiry?
63. Disciplinary Repositioning - Does text challenge/redraw field's boundaries?
64. Conceptual Reframing - Are familiar problems recast in novel terms?
65. Analytic Re-Alignment - Does author redirect from false to better problems?
66. Unexpected Cross-Pollination - Does author import from distant domains?
67. Epistemic Reweighting - Are marginal ideas made central by principled arguments?
68. Constraint Innovation - Are new constraints introduced improving reasoning quality?
69. Ontology Re-specification - Is underlying structure of entities reconsidered?
70. Heuristic Leap - Is intuitive/lateral move introduced reframing field?
71. Problem Re-Indexing - Are known problems recoded into more productive forms?
72. Axiomatic Innovation - Does work posit new fundamental assumption/shift?
73. Moral/Political Recomputation - Are prevailing frames creatively re-evaluated?
74. Subtext Excavation - Does work uncover previously hidden conceptual background?
75. Second-Order Innovation - Is method itself subject to creative evolution?
76. Temporal Inversion - Does author treat past positions as unrealized futures?
77. Negative Space Manipulation - Does author point to gaps/absences as fruitful?
78. Unnatural Pairing - Does author combine rarely/never combined concepts?
79. Disciplinary Hijack - Is another field's frame adopted for new context?
80. Onto-Epistemic Fusion - Does work entangle ontology/epistemology productively?

For each metric, provide a score from 0-100 and a brief assessment.

Return your analysis in this JSON format:
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
  "summary": "Overall assessment of the passage across all 80 metrics"
}

Provide detailed analysis of how the passage scores across all 80 metrics.`,
        },
        {
          role: "user",
          content: `Please analyze this passage using all 80 metrics:

Passage (${passageTitle}):
${passage.text}

Return the analysis in the exact JSON format specified above.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error in OpenAI single passage analysis:", error);
    throw error;
  }
}

// ===== COMPREHENSIVE 40-METRIC ANALYSIS FUNCTIONS =====
// These functions replicate the exact format from the uploaded 160-metric document

// Intelligence Analysis (40 metrics) - Single Passage
export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are evaluating text for INTELLIGENCE using exactly 40 specific metrics. You must analyze the text in the EXACT format demonstrated in the uploaded example:

**Example Format:**
Compression
"SE and TS don't have the same meaning. They have different propositions for their respective meanings..."
Elegant condensation of Twin-Earth into one decisive claim.
Score: 96/100

Abstraction
"Implicit in what Kripke said about proper names are many deep and important principles concerning the very nature of meaning..."
Takes a narrow semantic point and raises it to the level of philosophy of mind and meaning.
Score: 95/100

Return a JSON object with this exact structure:
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

The 40 Intelligence metrics you must evaluate:
1. Compression (density of meaning per word)
2. Abstraction (ability to move beyond surface detail)
3. Inference depth (multi-step reasoning)
4. Epistemic friction (acknowledging uncertainty or limits)
5. Cognitive distancing (seeing from outside a frame)
6. Counterfactual reasoning
7. Analogical depth (quality of comparisons)
8. Semantic topology (connectedness of ideas)
9. Asymmetry (unexpected but apt perspective shifts)
10. Conceptual layering (multiple levels at once)
11. Original definition-making
12. Precision of terms
13. Distinction-tracking (keeping categories straight)
14. Avoidance of tautology
15. Avoidance of empty generality
16. Compression of examples into principle
17. Ability to invert perspective
18. Anticipation of objections
19. Integration of disparate domains
20. Self-reflexivity (awareness of own stance)
21. Elimination of redundancy
22. Conceptual economy (no waste concepts)
23. Epistemic risk-taking (sticking neck out coherently)
24. Generativity (producing new questions/angles)
25. Ability to revise assumptions midstream
26. Distinguishing signal vs. noise
27. Recognizing hidden assumptions
28. Tracking causal chains
29. Separating correlation from causation
30. Managing complexity without collapse
31. Detecting paradox or tension
32. Apt compression into aphorism
33. Clarity under pressure (handling difficult material)
34. Distinguishing levels (fact vs. meta-level)
35. Relating concrete to abstract seamlessly
36. Control of scope (not sprawling aimlessly)
37. Detecting pseudo-intelligence
38. Balancing simplicity with depth
39. Strategic omission (knowing what not to say)
40. Transferability (insight applies beyond the case)

For sophisticated philosophical or academic texts, scores should typically range from 85-99. For lower-quality texts, scores may range from 40-70. Each metric must include a specific quote and targeted analysis that explains exactly why that quote demonstrates the intelligence metric.`
        },
        {
          role: "user",
          content: `Please analyze this passage for INTELLIGENCE using the exact 40-metric format:

Passage: ${passage.text}

Return the analysis in the exact JSON format specified above.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error in OpenAI intelligence analysis:", error);
    throw error;
  }
}

// Intelligence Analysis (40 metrics) - Dual Passage
export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are evaluating two texts for INTELLIGENCE using exactly 40 specific metrics. You must analyze both texts in the EXACT format demonstrated in the uploaded example, providing comparative analysis.

Return a JSON object with this structure:
{
  "passageA": {
    "analysis": "Overall assessment paragraph",
    "metrics": [
      {
        "name": "Metric Name",
        "quote": "Exact quote from passage A demonstrating this metric",
        "analysis": "Brief explanation of why this quote demonstrates the metric",
        "score": X
      }
    ],
    "overallScore": X,
    "summary": "Brief summary"
  },
  "passageB": {
    "analysis": "Overall assessment paragraph", 
    "metrics": [
      {
        "name": "Metric Name",
        "quote": "Exact quote from passage B demonstrating this metric",
        "analysis": "Brief explanation of why this quote demonstrates the metric",
        "score": X
      }
    ],
    "overallScore": X,
    "summary": "Brief summary"
  },
  "comparison": "Comparative analysis of both passages across intelligence metrics"
}

Use the same 40 Intelligence metrics as in single passage analysis.`
        },
        {
          role: "user",
          content: `Please analyze these two passages for INTELLIGENCE using the exact 40-metric format:

Passage A (${passageA.title || 'Passage A'}): ${passageA.text}

Passage B (${passageB.title || 'Passage B'}): ${passageB.text}

Return the analysis in the exact JSON format specified above.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 10000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error in OpenAI dual intelligence analysis:", error);
    throw error;
  }
}

// Originality Analysis (40 metrics) - Single Passage
export async function analyzeOriginality(passage: PassageData): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are evaluating text for ORIGINALITY using exactly 40 specific metrics. You must analyze the text in the EXACT format demonstrated in the uploaded example.

Return a JSON object with this exact structure:
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

The 40 Originality metrics you must evaluate:
1. Novel perspective
2. Uncommon connections
3. Surprising but apt analogies
4. Invention of new distinctions
5. Reframing of common problem
6. New conceptual synthesis
7. Fresh metaphors
8. Generating new questions
9. Counterintuitive insight that holds
10. Unusual compression (shortcuts that work)
11. Distilling cliché into clarity
12. Reinterpreting tradition
13. Productive paradox
14. Idiosyncratic voice
15. Unusual but precise phrasing
16. Structural inventiveness (form matches thought)
17. Surprising yet valid inference
18. Non-standard angle on standard issue
19. Repurposing known concept in new domain
20. Avoiding mimicry
21. Shunning jargon clichés
22. Generating conceptual friction
23. Independent pattern recognition
24. Unexpected causal explanation
25. Tension between domains (philosophy + science, etc.)
26. Provocative but defensible claim
27. Lateral connections (cross-field links)
28. Subversion of default framing
29. Detection of neglected detail
30. Reverse engineering assumptions
31. Productive misfit with genre/style
32. Intellectually playful but rigorous
33. Constructive violation of expectations
34. Voice not reducible to formula
35. Revaluing the obvious
36. Absence of derivative cadence
37. Independent synthesis of sources
38. Discovery of hidden symmetry
39. Generating terms others adopt
40. Staying power (insight lingers after reading)

Each metric must include a specific quote and targeted analysis that explains exactly why that quote demonstrates the originality metric.`
        },
        {
          role: "user",
          content: `Please analyze this passage for ORIGINALITY using the exact 40-metric format:

Passage: ${passage.text}

Return the analysis in the exact JSON format specified above.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error in OpenAI originality analysis:", error);
    throw error;
  }
}

// Originality Analysis (40 metrics) - Dual Passage
export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are evaluating two texts for ORIGINALITY using exactly 40 specific metrics. You must analyze both texts in the EXACT format demonstrated in the uploaded example, providing comparative analysis.

Return a JSON object with this structure:
{
  "passageA": {
    "analysis": "Overall assessment paragraph",
    "metrics": [
      {
        "name": "Metric Name",
        "quote": "Exact quote from passage A demonstrating this metric",
        "analysis": "Brief explanation of why this quote demonstrates the metric",
        "score": X
      }
    ],
    "overallScore": X,
    "summary": "Brief summary"
  },
  "passageB": {
    "analysis": "Overall assessment paragraph", 
    "metrics": [
      {
        "name": "Metric Name",
        "quote": "Exact quote from passage B demonstrating this metric",
        "analysis": "Brief explanation of why this quote demonstrates the metric",
        "score": X
      }
    ],
    "overallScore": X,
    "summary": "Brief summary"
  },
  "comparison": "Comparative analysis of both passages across originality metrics"
}

Use the same 40 Originality metrics as in single passage analysis.`
        },
        {
          role: "user",
          content: `Please analyze these two passages for ORIGINALITY using the exact 40-metric format:

Passage A (${passageA.title || 'Passage A'}): ${passageA.text}

Passage B (${passageB.title || 'Passage B'}): ${passageB.text}

Return the analysis in the exact JSON format specified above.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 10000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error in OpenAI dual originality analysis:", error);
    throw error;
  }
}

// Cogency Analysis (40 metrics) - Single Passage
export async function analyzeCogency(passage: PassageData): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are evaluating text for COGENCY using exactly 40 specific metrics. You must analyze the text in the EXACT format demonstrated in the uploaded example.

Return a JSON object with this exact structure:
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

The 40 Cogency metrics you must evaluate:
1. Logical validity
2. Absence of contradictions
3. Strength of evidence/reasons
4. Proportionality (conclusion matches support)
5. Avoiding non sequiturs
6. Explicit structure (clear argument shape)
7. Distinction between premises and conclusion
8. Consistent terminology
9. Focus (avoiding drift)
10. Avoiding circularity
11. Handling counterexamples
12. Responsiveness to objections
13. Causal adequacy
14. Inferential tightness
15. Avoiding overgeneralization
16. Avoiding straw man reasoning
17. Recognizing scope limits
18. Avoiding equivocation
19. Hierarchy of reasons (primary vs. secondary)
20. Consistency with background knowledge
21. Recognizing exceptions
22. Correct use of examples
23. Avoidance of loaded language as substitute for reason
24. Clear priority of claims
25. Avoiding category mistakes
26. Explicitness of assumptions
27. Non-redundancy in support
28. Alignment between thesis and support
29. Avoidance of spurious precision
30. Adequate differentiation (not lumping opposites)
31. Soundness of analogies
32. Progressive buildup (no jumps)
33. Avoidance of double standards
34. Balance of concession and assertion
35. Clarity of logical connectives
36. Preservation of distinctions across argument
37. Avoiding irrelevant material
38. Correct handling of probability
39. Strength of causal explanation vs. correlation
40. Stability under reformulation (holds when restated)

Each metric must include a specific quote and targeted analysis that explains exactly why that quote demonstrates the cogency metric.`
        },
        {
          role: "user",
          content: `Please analyze this passage for COGENCY using the exact 40-metric format:

Passage: ${passage.text}

Return the analysis in the exact JSON format specified above.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error in OpenAI cogency analysis:", error);
    throw error;
  }
}

// Cogency Analysis (40 metrics) - Dual Passage
export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are evaluating two texts for COGENCY using exactly 40 specific metrics. You must analyze both texts in the EXACT format demonstrated in the uploaded example, providing comparative analysis.

Return a JSON object with this structure:
{
  "passageA": {
    "analysis": "Overall assessment paragraph",
    "metrics": [
      {
        "name": "Metric Name",
        "quote": "Exact quote from passage A demonstrating this metric",
        "analysis": "Brief explanation of why this quote demonstrates the metric",
        "score": X
      }
    ],
    "overallScore": X,
    "summary": "Brief summary"
  },
  "passageB": {
    "analysis": "Overall assessment paragraph", 
    "metrics": [
      {
        "name": "Metric Name",
        "quote": "Exact quote from passage B demonstrating this metric",
        "analysis": "Brief explanation of why this quote demonstrates the metric",
        "score": X
      }
    ],
    "overallScore": X,
    "summary": "Brief summary"
  },
  "comparison": "Comparative analysis of both passages across cogency metrics"
}

Use the same 40 Cogency metrics as in single passage analysis.`
        },
        {
          role: "user",
          content: `Please analyze these two passages for COGENCY using the exact 40-metric format:

Passage A (${passageA.title || 'Passage A'}): ${passageA.text}

Passage B (${passageB.title || 'Passage B'}): ${passageB.text}

Return the analysis in the exact JSON format specified above.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 10000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error in OpenAI dual cogency analysis:", error);
    throw error;
  }
}

// Overall Quality Analysis (40 metrics) - Single Passage
export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are evaluating text for OVERALL QUALITY using exactly 40 specific metrics. You must analyze the text in the EXACT format demonstrated in the uploaded example.

Return a JSON object with this exact structure:
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

The 40 Overall Quality metrics you must evaluate:
1. Clarity of expression
2. Flow and readability
3. Stylistic control
4. Grammar and syntax precision
5. Appropriate tone
6. Balance of brevity and elaboration
7. Coherence across sections
8. Engagement/interest
9. Rhythm of sentences
10. Absence of filler
11. Clear introduction of themes
12. Effective closure/resolution
13. Variety of sentence structure
14. Apt vocabulary (not inflated)
15. Avoiding clichés
16. Consistency of style
17. Accessibility (lay reader can follow)
18. Respect for audience intelligence
19. Memorability of phrasing
20. Avoidance of redundancy
21. Natural transitions
22. Balanced paragraphing
23. Pacing (not rushed, not dragging)
24. Smooth handling of complexity
25. Apt use of examples or illustration
26. Ability to hold reader attention
27. Economy of language
28. Emphasis where needed
29. Voice consistency
30. Avoidance of awkwardness
31. Seamless integration of quotes/sources
32. Good proportion of abstract vs. concrete
33. Non-mechanical style
34. Absence of distracting errors
35. Balance of analysis and narrative
36. Cadence (natural spoken rhythm)
37. Avoidance of pedantry
38. Polish (reads as finished, not drafty)
39. Unifying theme or through-line
40. Overall reader impact (leaves an impression)

Each metric must include a specific quote and targeted analysis that explains exactly why that quote demonstrates the overall quality metric.`
        },
        {
          role: "user",
          content: `Please analyze this passage for OVERALL QUALITY using the exact 40-metric format:

Passage: ${passage.text}

Return the analysis in the exact JSON format specified above.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error in OpenAI overall quality analysis:", error);
    throw error;
  }
}

// Overall Quality Analysis (40 metrics) - Dual Passage
export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are evaluating two texts for OVERALL QUALITY using exactly 40 specific metrics. You must analyze both texts in the EXACT format demonstrated in the uploaded example, providing comparative analysis.

Return a JSON object with this structure:
{
  "passageA": {
    "analysis": "Overall assessment paragraph",
    "metrics": [
      {
        "name": "Metric Name",
        "quote": "Exact quote from passage A demonstrating this metric",
        "analysis": "Brief explanation of why this quote demonstrates the metric",
        "score": X
      }
    ],
    "overallScore": X,
    "summary": "Brief summary"
  },
  "passageB": {
    "analysis": "Overall assessment paragraph", 
    "metrics": [
      {
        "name": "Metric Name",
        "quote": "Exact quote from passage B demonstrating this metric",
        "analysis": "Brief explanation of why this quote demonstrates the metric",
        "score": X
      }
    ],
    "overallScore": X,
    "summary": "Brief summary"
  },
  "comparison": "Comparative analysis of both passages across overall quality metrics"
}

Use the same 40 Overall Quality metrics as in single passage analysis.`
        },
        {
          role: "user",
          content: `Please analyze these two passages for OVERALL QUALITY using the exact 40-metric format:

Passage A (${passageA.title || 'Passage A'}): ${passageA.text}

Passage B (${passageB.title || 'Passage B'}): ${passageB.text}

Return the analysis in the exact JSON format specified above.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 10000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error in OpenAI dual overall quality analysis:", error);
    throw error;
  }
}
