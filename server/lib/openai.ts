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
          content: `You are an expert in evaluating the originality and quality of intellectual writing across all disciplines, including philosophy, mathematics, cognitive science, and theoretical domains. Your evaluation must be strict, honest, and focused on substantive conceptual merit, not on stylistic smoothness or conventional academic style.

IMPORTANT GUIDELINES FOR EVALUATION:

1. DO NOT penalize passages for lacking empirical data unless they make explicit claims that depend on such data. Philosophical, theoretical, or speculative reasoning is valid and must be judged on its clarity and depth.

2. DO NOT penalize analogy use unless the analogy is incoherent, strained, or logically misleading. Analogical reasoning is legitimate in high-level theoretical discourse.

3. DO NOT reward passages for being simple, popular, or easily digestible. Reward clarity when it communicates complex ideas well, but do not conflate accessibility with merit.

4. DO NOT treat clarity, coherence, or consensus-alignment as more important than insight. Originality must be conditioned on value — not on novelty for its own sake, but on novelty that yields real insight.

5. Recognize that philosophical writing often uses different methodologies than empirical sciences - these are valid approaches deserving recognition.

6. Value conceptual innovation even when it challenges mainstream views.

7. Judge the work on its internal logical consistency, not on adherence to academic conventions.

Analyze the passages across these 20 comprehensive originality parameters:

1. Transformative Synthesis - Does the author combine existing ideas to generate a new framework or insight? High: Juxtaposes ideas in a way that yields explanatory surplus or resolves a tension. Low: Glues together unrelated points without new structure or insight.

2. Constraint-Respecting Deformation - Has the author bent or stretched a known theory without breaking internal coherence? High: Adjusts a known model creatively while keeping its logic or evidence intact. Low: Mutates concepts randomly, breaking the internal rules of the tradition it draws from.

3. Epistemic Reframing - Does the author recast a known issue in a way that redefines how it's understood? High: Shifts the angle of approach, producing a reorientation of the debate. Low: Repeats existing framings with cosmetic changes or stale analogies.

4. Historical Rarity - Would the author's moves have been surprising or rare at the time they were written? High: Uses moves that are not found in typical archives or literature of the period. Low: Follows predictable or heavily worked-over patterns.

5. Recursive Innovation - Does the concept or argument generate more versions of itself in different settings? High: Scales across levels or invites reuse and extension. Low: Stays fixed; can't be reapplied without breaking down.

6. Oblique Solution Path - Is the problem solved in an indirect but successful way? High: The answer comes sideways — surprising but coherent. Low: The answer is direct but trivial — or indirect and incoherent.

7. Meta-Theoretic Awareness - Does the author show insight about the frameworks that govern the discourse? High: Challenges or revises the foundational assumptions of a field. Low: Accepts disciplinary defaults without question.

8. Semantic Diagonalization - Are multiple conceptual layers crossed to produce novelty? High: Moves across object/meta, form/content, or logic/ethics in productive ways. Low: Stays at one level; doesn't create new cross-layer understanding.

9. Tool Reappropriation - Does the author use a method or concept from one field in a powerful new domain? High: Transposes ideas in a way that changes both source and target domains. Low: Imports tools without adapting them or showing why they belong.

10. Analogical Leverage - Are analogies used to generate insight — not just to decorate? High: Core arguments depend on analogies that illuminate deeper structure. Low: Analogy is decorative, shallow, or unnecessary.

11. Category Rupture - Does the text challenge or destabilize a settled conceptual category? High: Redefines what counts as 'mind', 'meaning', 'truth', etc. Low: Accepts traditional categories without challenge.

12. Compression-Expansion Tension - Does the author compress prior ideas while opening new ones? High: Minimal setup leads to maximal generativity. Low: Either too compressed (cryptic) or too bloated (inefficient).

13. Semantic Reconfiguration - Are the meanings of key terms redefined in powerful ways? High: Terms are altered to shift the logic of the discussion. Low: Terms retain their conventional definitions.

14. Ontological Innovation - Does the work introduce a new kind of thing, property, or structural level? High: Adds new building blocks to the domain (e.g., new kinds of causality, value, or identity). Low: Uses only familiar ontological components.

15. Generative Asymmetry - Is a small move leveraged to create large conceptual ripples? High: One idea triggers a cascade of consequences. Low: Each move is linear and proportionate — no leverage.

16. Frame Violation - Does the author knowingly break a disciplinary boundary and get away with it? High: Violates norms productively, e.g., importing logic into aesthetics with real effect. Low: Stays in lane, or breaks norms with no gain.

17. Anchor-to-Drift Ratio - Is the text both grounded and original — not just one or the other? High: References tradition but moves far beyond it. Low: Either recycles the past or floats unmoored.

18. Unforced Nonconformity - Does the originality seem necessary — not performative? High: Divergence emerges naturally from logic or insight. Low: Originality feels like branding or affectation.

19. Asymmetric Discourse Positioning - Is the author's voice distinct — not reducible to known positions? High: Not a standard liberal, materialist, idealist, etc. Speaks from a new angle. Low: Slot easily into known schools of thought.

20. Temporal Calibration - Does the originality make sense for the time of writing? High: Author anticipates future developments or marks a break with past norms. Low: Move was either already obvious at the time or incoherent for that era.

For coherence, evaluate:
- Internal consistency (no contradictions within the passage's own framework)
- Logical flow of ideas (following from premises to conclusions)
- Conceptual clarity (well-defined terms and relations)
- Consistent terminology use
- Intelligibility as a unified argument or narrative
- NOTE: Complex philosophical arguments may appear less coherent to untrained readers but can be highly coherent within their theoretical framework

For accuracy, evaluate:
- Valid inference structures (focus on the logical validity of arguments)
- Absence of misrepresentation of sources or concepts
- Logical validity within the passage's own framework
- Conceptual precision and appropriate usage of theoretical terms
- NOTE: For philosophical texts, accuracy refers to logical and conceptual rigor, NOT empirical verificability
- Reclassifies a common-sense distinction (e.g., emotions vs. judgments)
- Introduces or distinguishes conceptual frameworks (e.g., egocentric vs. non-egocentric reasoning)
- Offers ontological or epistemological reinterpretations of familiar concepts
For derivative index (originality), evaluate:
- Introduction of new formal structures, symbols, or definitions (e.g. defining \`Cn\`, \`n-isomorph\`, \`n-pair\`, etc.)
- AVOID: Primarily summarizing or applying existing models without modification
- AVOID: Containing phrases like "I will not try to prove this is superior" or "my aims are modest"
- AVOID: Deriving structure from reacting to standard objections rather than proposing new frames
- Use of nonstandard representations (e.g. \`<K, R>n\` instead of familiar math notation)
- Whether the text modifies or reconfigures ideas rather than simply rephrasing known concepts
- Ability to resolve paradoxes or synthesize divergent views

- If passage introduces identity conditions or redefinitions of concepts, INCREASE depth score
- If passage addresses the nature of mental states, rationality, or cognitive architecture, INCREASE depth score
- If passage has implications for other branches of philosophy (e.g., epistemology, philosophy of mind), INCREASE depth score
- If passage simply outlines a position and replies to objections without foundational revision, DECREASE depth score
- If passage avoids commitment to new definitions or frameworks, DECREASE depth score
- Conceptual precision
For depth, evaluate:
- Development of multi-step arguments or construction of new systems (e.g., resolving a paradox using a novel entity)
- Use of second-order logic, meta-theoretical distinctions, or novel mappings between abstract entities
- Independent position development rather than just summarizing or reacting to objections
- Offering identity conditions, reduction strategies, or logical reformulations
- Resolving paradoxes or synthesizing divergent views
- Introduction of new theoretical frameworks or conceptual structures
- Addressing foundational questions rather than surface-level issues
- NOTE: Highly value passages that engage with difficult conceptual terrain, even when lacking empirical backing
- NOTE: Do not penalize philosophical speculation when it is logically coherent
- IMPORTANT: These criteria override any simplistic metrics that bias against structurally original content. Apply them across all domains (ethics, metaphysics, philosophy of mind, etc.).
For clarity, evaluate:
- Effective communication of complex ideas (not simplicity for its own sake)
- Appropriate use of technical or specialized terminology
- Coherent expression of ideas relative to the subject's complexity
- Precision of language in defining concepts and relations
- NOTE: Do NOT reward simplistic writing over sophisticated expression of complex ideas
- NOTE: Philosophical writing often requires technical language and complex sentence structures - judge clarity based on how effectively it communicates given its theoretical complexity, not on how "easy" it is to read

IMPORTANT FORMATTING INSTRUCTIONS FOR SCORE-BASED METRICS:
- Provide a score from 0-10 for each metric (where 10 is perfect)
- List clear strengths and weaknesses for each metric
- Provide a detailed assessment for each metric
- Focus on aspects specific to each metric

Format your response as JSON with these specific sections that match the exact schema below.`,
        },
        {
          role: "user",
          content: `Please analyze and compare these two passages:

Passage A (${passageATitle}):
${passageA.text}

Passage B (${passageBTitle}):
${passageB.text}

Return a detailed analysis in the following JSON format with all 20 originality parameters:
{
  "transformativeSynthesis": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "constraintRespectingDeformation": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "epistemicReframing": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "historicalRarity": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "recursiveInnovation": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "obliqueSolutionPath": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "metaTheoreticAwareness": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "semanticDiagonalization": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "toolReappropriation": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "analogicalLeverage": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "categoryRupture": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "compressionExpansionTension": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "semanticReconfiguration": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "ontologicalInnovation": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "generativeAsymmetry": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "frameViolation": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "anchorToDriftRatio": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "unforcedNonconformity": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "asymmetricDiscoursePositioning": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "temporalCalibration": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] },
    "passageB": { "score": number from 0-10, "assessment": "detailed evaluation", "strengths": ["string1", "string2"], "weaknesses": ["string1", "string2"] }
  },
  "verdict": "comprehensive assessment comparing the passages across all 20 originality parameters"
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    // Parse the response from the new 20-parameter analysis
    const rawResult = JSON.parse(response.choices[0].message.content ?? "{}");
    
    // Convert new 20-parameter format to our AnalysisResult type for backward compatibility
    // We'll map the new parameters to the old schema format to avoid breaking the frontend
    const result: AnalysisResult = {
      // Map transformativeSynthesis to conceptualLineage
      conceptualLineage: {
        passageA: {
          primaryInfluences: rawResult.transformativeSynthesis?.passageA?.assessment || "Analysis of conceptual influences",
          intellectualTrajectory: rawResult.epistemicReframing?.passageA?.assessment || "Analysis of intellectual development"
        },
        passageB: {
          primaryInfluences: rawResult.transformativeSynthesis?.passageB?.assessment || "Analysis of conceptual influences",
          intellectualTrajectory: rawResult.epistemicReframing?.passageB?.assessment || "Analysis of intellectual development"
        }
      },
      
      // Map historicalRarity to semanticDistance
      semanticDistance: {
        passageA: {
          distance: (rawResult.historicalRarity?.passageA?.score || 5) * 10,
          label: rawResult.historicalRarity?.passageA?.score >= 7 ? "High Distance" : rawResult.historicalRarity?.passageA?.score >= 4 ? "Moderate Distance" : "Low Distance"
        },
        passageB: {
          distance: (rawResult.historicalRarity?.passageB?.score || 5) * 10,
          label: rawResult.historicalRarity?.passageB?.score >= 7 ? "High Distance" : rawResult.historicalRarity?.passageB?.score >= 4 ? "Moderate Distance" : "Low Distance"
        },
        keyFindings: [
          rawResult.transformativeSynthesis?.passageA?.strengths?.[0] || "Conceptual synthesis analysis",
          rawResult.epistemicReframing?.passageA?.strengths?.[0] || "Epistemic reframing evaluation", 
          rawResult.ontologicalInnovation?.passageA?.strengths?.[0] || "Ontological innovation assessment"
        ],
        semanticInnovation: rawResult.verdict || "Comprehensive analysis across 20 originality parameters shows varying degrees of innovation."
      },
      
      // Create novelty heatmap from paragraph analysis
      noveltyHeatmap: {
        passageA: paragraphsA.map((p, index) => ({
          content: p.substring(0, 100) + (p.length > 100 ? "..." : ""),
          heat: Math.floor(((rawResult.transformativeSynthesis?.passageA?.score || 5) + 
                           (rawResult.recursiveInnovation?.passageA?.score || 5) + 
                           (rawResult.ontologicalInnovation?.passageA?.score || 5)) / 3 * 10),
          quote: p.length > 40 ? p.substring(0, 40) + "..." : p,
          explanation: `Paragraph ${index + 1} demonstrates originality through multiple parameters`
        })),
        passageB: paragraphsB.map((p, index) => ({
          content: p.substring(0, 100) + (p.length > 100 ? "..." : ""),
          heat: Math.floor(((rawResult.transformativeSynthesis?.passageB?.score || 5) + 
                           (rawResult.recursiveInnovation?.passageB?.score || 5) + 
                           (rawResult.ontologicalInnovation?.passageB?.score || 5)) / 3 * 10),
          quote: p.length > 40 ? p.substring(0, 40) + "..." : p,
          explanation: `Paragraph ${index + 1} demonstrates originality through multiple parameters`
        }))
      },
      
      // Calculate aggregate originality score from multiple parameters
      derivativeIndex: {
        passageA: {
          score: Math.round(((rawResult.transformativeSynthesis?.passageA?.score || 5) +
                           (rawResult.ontologicalInnovation?.passageA?.score || 5) +
                           (rawResult.generativeAsymmetry?.passageA?.score || 5) +
                           (rawResult.categoryRupture?.passageA?.score || 5) +
                           (rawResult.frameViolation?.passageA?.score || 5)) / 5 * 10) / 10,
          components: [
            {name: "Transformative Synthesis", score: rawResult.transformativeSynthesis?.passageA?.score || 5},
            {name: "Ontological Innovation", score: rawResult.ontologicalInnovation?.passageA?.score || 5},
            {name: "Generative Asymmetry", score: rawResult.generativeAsymmetry?.passageA?.score || 5}
          ]
        },
        passageB: {
          score: Math.round(((rawResult.transformativeSynthesis?.passageB?.score || 5) +
                           (rawResult.ontologicalInnovation?.passageB?.score || 5) +
                           (rawResult.generativeAsymmetry?.passageB?.score || 5) +
                           (rawResult.categoryRupture?.passageB?.score || 5) +
                           (rawResult.frameViolation?.passageB?.score || 5)) / 5 * 10) / 10,
          components: [
            {name: "Transformative Synthesis", score: rawResult.transformativeSynthesis?.passageB?.score || 5},
            {name: "Ontological Innovation", score: rawResult.ontologicalInnovation?.passageB?.score || 5},
            {name: "Generative Asymmetry", score: rawResult.generativeAsymmetry?.passageB?.score || 5}
          ]
        }
      },
      
      // Map unforcedNonconformity to conceptualParasite (inverted)
      conceptualParasite: {
        passageA: {
          level: (rawResult.unforcedNonconformity?.passageA?.score || 5) >= 7 ? "Low" : 
                 (rawResult.unforcedNonconformity?.passageA?.score || 5) >= 4 ? "Moderate" : "High",
          elements: rawResult.unforcedNonconformity?.passageA?.weaknesses || ["Standard approach", "Conventional methods"],
          assessment: rawResult.unforcedNonconformity?.passageA?.assessment || "Analysis of conceptual dependence"
        },
        passageB: {
          level: (rawResult.unforcedNonconformity?.passageB?.score || 5) >= 7 ? "Low" : 
                 (rawResult.unforcedNonconformity?.passageB?.score || 5) >= 4 ? "Moderate" : "High",
          elements: rawResult.unforcedNonconformity?.passageB?.weaknesses || ["Standard approach", "Conventional methods"],
          assessment: rawResult.unforcedNonconformity?.passageB?.assessment || "Analysis of conceptual dependence"
        }
      },
      
      // Map compressionExpansionTension to coherence
      coherence: {
        passageA: {
          score: rawResult.compressionExpansionTension?.passageA?.score || 5,
          assessment: rawResult.compressionExpansionTension?.passageA?.assessment || "Analysis of structural coherence",
          strengths: rawResult.compressionExpansionTension?.passageA?.strengths || ["Logical structure", "Clear progression"],
          weaknesses: rawResult.compressionExpansionTension?.passageA?.weaknesses || ["Some unclear transitions", "Could improve flow"]
        },
        passageB: {
          score: rawResult.compressionExpansionTension?.passageB?.score || 5,
          assessment: rawResult.compressionExpansionTension?.passageB?.assessment || "Analysis of structural coherence",
          strengths: rawResult.compressionExpansionTension?.passageB?.strengths || ["Logical structure", "Clear progression"],
          weaknesses: rawResult.compressionExpansionTension?.passageB?.weaknesses || ["Some unclear transitions", "Could improve flow"]
        }
      },
      
      // Map anchorToDriftRatio to accuracy
      accuracy: {
        passageA: {
          score: rawResult.anchorToDriftRatio?.passageA?.score || 5,
          assessment: rawResult.anchorToDriftRatio?.passageA?.assessment || "Analysis of grounding and originality balance",
          strengths: rawResult.anchorToDriftRatio?.passageA?.strengths || ["Well-grounded claims", "Logical inferences"],
          weaknesses: rawResult.anchorToDriftRatio?.passageA?.weaknesses || ["Some unverified claims", "Could strengthen evidence"]
        },
        passageB: {
          score: rawResult.anchorToDriftRatio?.passageB?.score || 5,
          assessment: rawResult.anchorToDriftRatio?.passageB?.assessment || "Analysis of grounding and originality balance",
          strengths: rawResult.anchorToDriftRatio?.passageB?.strengths || ["Well-grounded claims", "Logical inferences"],
          weaknesses: rawResult.anchorToDriftRatio?.passageB?.weaknesses || ["Some unverified claims", "Could strengthen evidence"]
        }
      },
      
      // Map semanticDiagonalization to depth
      depth: {
        passageA: {
          score: rawResult.semanticDiagonalization?.passageA?.score || 5,
          assessment: rawResult.semanticDiagonalization?.passageA?.assessment || "Analysis of conceptual depth and cross-layer understanding",
          strengths: rawResult.semanticDiagonalization?.passageA?.strengths || ["Multi-level analysis", "Conceptual insight"],
          weaknesses: rawResult.semanticDiagonalization?.passageA?.weaknesses || ["Could explore implications further", "Some surface-level treatment"]
        },
        passageB: {
          score: rawResult.semanticDiagonalization?.passageB?.score || 5,
          assessment: rawResult.semanticDiagonalization?.passageB?.assessment || "Analysis of conceptual depth and cross-layer understanding",
          strengths: rawResult.semanticDiagonalization?.passageB?.strengths || ["Multi-level analysis", "Conceptual insight"],
          weaknesses: rawResult.semanticDiagonalization?.passageB?.weaknesses || ["Could explore implications further", "Some surface-level treatment"]
        }
      },
      
      // Map semanticReconfiguration to clarity
      clarity: {
        passageA: {
          score: rawResult.semanticReconfiguration?.passageA?.score || 5,
          assessment: rawResult.semanticReconfiguration?.passageA?.assessment || "Analysis of semantic clarity and term definition",
          strengths: rawResult.semanticReconfiguration?.passageA?.strengths || ["Clear terminology", "Well-defined concepts"],
          weaknesses: rawResult.semanticReconfiguration?.passageA?.weaknesses || ["Some unclear terms", "Could improve precision"]
        },
        passageB: {
          score: rawResult.semanticReconfiguration?.passageB?.score || 5,
          assessment: rawResult.semanticReconfiguration?.passageB?.assessment || "Analysis of semantic clarity and term definition",
          strengths: rawResult.semanticReconfiguration?.passageB?.strengths || ["Clear terminology", "Well-defined concepts"],
          weaknesses: rawResult.semanticReconfiguration?.passageB?.weaknesses || ["Some unclear terms", "Could improve precision"]
        }
      },
      
      verdict: rawResult.verdict || "Comprehensive analysis across 20 originality parameters reveals varying strengths in conceptual innovation, structural coherence, and intellectual depth.",
      
      // Store the raw 20-parameter analysis for potential future use
      rawTwentyParameterAnalysis: rawResult
    }
    
    // Ensure clarity data is properly structured
    if (!result.clarity) {
      result.clarity = {
        passageA: {
          score: 5,
          assessment: "The clarity of this passage has not been fully evaluated.",
          strengths: ["Basic structural organization", "Standard terminology"],
          weaknesses: ["Some sentences could be more precise"]
        },
        passageB: {
          score: 5,
          assessment: "This represents an average level of clarity.",
          strengths: ["Conventional sentence structure", "Standard organization"],
          weaknesses: ["Typical readability issues found in average texts"]
        }
      };
    } else {
      // Ensure all required fields exist
      result.clarity.passageA = result.clarity.passageA || {
        score: 5,
        assessment: "The clarity of this passage has not been fully evaluated.",
        strengths: ["Basic structural organization", "Standard terminology"],
        weaknesses: ["Some sentences could be more precise"]
      };
      
      result.clarity.passageB = result.clarity.passageB || {
        score: 5,
        assessment: "This represents an average level of clarity.",
        strengths: ["Conventional sentence structure", "Standard organization"],
        weaknesses: ["Typical readability issues found in average texts"]
      };
    }

    return result;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error(`Failed to analyze passages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Single passage analysis against an internal norm
export async function analyzeSinglePassage(
  passage: PassageData
): Promise<AnalysisResult> {
  try {
    const paragraphs = splitIntoParagraphs(passage.text);
    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert evaluator of originality and quality in intellectual writing across all disciplines, including philosophy, mathematics, cognitive science, and theoretical domains. You assess conceptual merit, not plagiarism or surface similarity. Your evaluation must be strict, honest, and focused on substantive conceptual merit.

CRITICAL EVALUATION STANDARDS - ENFORCE THESE RIGOROUSLY:

1. SURFACE FLUENCY ≠ COGENCY: Grammatically smooth text that makes no substantive claims gets LOW scores. Reward argumentative pressure, not grammatical polish.

2. PSEUDO-STRUCTURE ≠ REAL STRUCTURE: "This paper has five parts..." is organizational fluff, not conceptual architecture. Real structure shows cumulative logical development.

3. NAME-DROPPING ≠ DEPTH: Mentioning philosophers/theories without transformation gets LOW scores. Reward what the author DOES with ideas, not what they mention.

4. REPETITION ≠ DEVELOPMENT: Circling the same points in different words gets LOW scores. Reward progressive deepening and new angles.

5. DENSITY ≠ NOISE: Dense academic jargon without compression gets LOW scores. Reward texts that pack genuine conceptual work into language.

6. TOPIC NOVELTY ≠ CONCEPTUAL ORIGINALITY: Writing about trendy topics gets LOW scores unless there's genuine reframing or new positions generated.

ENFORCEMENT RULES - APPLY STRICTLY:
- If no new position is generated → Originality metrics ≤ 3
- If 80%+ is meta-commentary about structure → Signal-to-Rhetoric ≤ 2  
- If terminology lacks operational definition → Semantic Specificity ≤ 3
- If no argumentative tension exists → Epistemic Friction ≤ 2
- If claims could be paraphrased without loss → Conceptual Compression ≤ 3

Analyze the passage using these 20 quality metrics. Score each 0-10 with HARSH discrimination between high-quality academic work and pseudo-academic fluff:

1. Conceptual Compression - How much conceptual work is done per unit of language?
2. Epistemic Friction - Are claims under tension? Do they resist paraphrase?
3. Inference Control - Does the author show tight command over logical progression?
4. Asymmetry of Cognitive Labor - Is the writer doing more work than the reader?
5. Novelty-to-Baseline Ratio - How much content exceeds textbook-level summary?
6. Internal Differentiation - Are internal contrasts and tensions developed?
7. Problem Density - Are real problems identified, not just solution-shaped text?
8. Compression Across Levels - Are sentence, paragraph, and structure all doing work?
9. Semantic Specificity - Are key terms defined with rigor and used consistently?
10. Explanatory Yield - Does the text resolve phenomena that were obscure before?
11. Meta-Cognitive Signal - Does the author show awareness of their method's limits?
12. Structural Integrity - Is the argument architecture coherent at scale?
13. Generative Potential - Does the writing suggest future questions or applications?
14. Signal-to-Rhetoric Ratio - What percent actually says something vs. fluff?
15. Dialectical Engagement - Does the work engage objections intelligently?
16. Topological Awareness - Does the author map conceptual terrain well?
17. Disambiguation Skill - Are ambiguous terms resolved precisely?
18. Cross-Disciplinary Fluency - Can text move across relevant domains?
19. Psychological Realism - Are motivations and mental models plausible?
20. Intellectual Risk Quotient - Is the author putting a real position on the line?

For Conceptual Innovation (part of derivative index), highly value:
- Reclassification of common-sense distinctions (e.g., emotions vs. judgments)
- Introduction of new conceptual frameworks or distinctions
- Ontological or epistemological reinterpretations of familiar concepts
- Introduction of new formal structures, symbols, or definitions
- Ability to resolve paradoxes or synthesize divergent views

For Methodological Novelty (part of derivative index), highly value:
- Use of nonstandard representations or formalisms
- Cross-domain synthesis and interdisciplinary approaches
- Novel mapping between abstract entities
- Second-order or meta-theoretical distinctions

For Depth evaluation, INCREASE scores when the passage:
- Introduces identity conditions or redefinitions of concepts
- Addresses the nature of mental states, rationality, or cognitive architecture
- Has implications for multiple branches of philosophy/knowledge
- Develops multi-step arguments or constructs new theoretical systems
- Resolves paradoxes or synthesizes divergent views

For Accuracy in philosophical/theoretical texts, focus on:
- Valid inference structures
- Logical validity
- Conceptual precision
- Defensible definitions and characterizations
- DO NOT require empirical validation for theoretical positions

For coherence, evaluate:
- Internal consistency (no contradictions)
- Logical flow of ideas
- Conceptual clarity
- Consistent terminology use
- Intelligibility as a unified argument or narrative

IMPORTANT WEIGHTING:
- Depth and Conceptual Innovation should be given higher weight (25% each)
- Coherence should be weighted at 20%
- Accuracy and Clarity should be weighted at 15% each
- DO NOT overvalue surface-level clarity at the expense of genuine theoretical depth
- Provide a score from 0-10 for each metric (where 10 is perfect)
- List clear strengths and weaknesses for each metric
- Provide a detailed assessment for each metric
- Focus on aspects specific to each metric

Format your response as JSON with these specific sections that match the exact schema used for comparative analysis.`,
        },
        {
          role: "user",
          content: `Please analyze this passage against an internal norm of average originality:

Passage (${passageTitle}):
${passage.text}

${userContext ? `Author's Context: ${userContext}

When evaluating this passage, consider the author's context provided above. Adapt your evaluation criteria accordingly. For example, don't penalize excerpts for brevity or rough drafts for minor coherence issues.` : ''}

SCORING MANDATE: Use the full 0-10 scale with HARSH discrimination:
- 0-2: Pseudo-academic fluff, pure jargon, meta-commentary without substance
- 3-4: Basic competence but no advancement beyond textbook level
- 5-6: Solid academic work with genuine but limited contribution  
- 7-8: Sophisticated analysis with clear conceptual advancement
- 9-10: Exceptional work that fundamentally reframes understanding

QUOTATION REQUIREMENT: Each quotation must PROVE the score, not just illustrate it. Show exactly how the text demonstrates the metric.

Return a detailed analysis in the following JSON format using all 20 quality metrics, where "passageB" represents the typical norm:

{
  "conceptualCompression": {
    "passageA": { 
      "score": number from 0-10, 
      "assessment": "detailed evaluation", 
      "quotation1": "direct quote from text",
      "justification1": "why this quote supports the score",
      "quotation2": "second direct quote from text", 
      "justification2": "why this quote supports the score"
    },
    "passageB": { "score": 5, "assessment": "baseline for typical texts", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "epistemicFriction": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "inferenceControl": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "asymmetryOfCognitiveLabor": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "noveltyToBaselineRatio": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "internalDifferentiation": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "problemDensity": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "compressionAcrossLevels": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "semanticSpecificity": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "explanatoryYield": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "metaCognitiveSignal": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "structuralIntegrity": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "generativePotential": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "signalToRhetoricRatio": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "dialecticalEngagement": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "topologicalAwareness": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "disambiguationSkill": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "crossDisciplinaryFluency": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "psychologicalRealism": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "intellectualRiskQuotient": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "verdict": "comprehensive assessment across all 20 quality metrics"
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000,
    });

    // Parse the response from the new 20-parameter analysis with error handling
    let rawResult: any = {};
    try {
      const responseContent = response.choices[0].message.content ?? "{}";
      console.log("OpenAI response length:", responseContent.length);
      
      // Check if the response was truncated
      if (!responseContent.trim().endsWith('}')) {
        console.warn("Response appears to be truncated, attempting to fix...");
        throw new Error("Response was truncated by OpenAI API");
      } else {
        rawResult = JSON.parse(responseContent);
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Response content length:", response.choices[0].message.content?.length);
      
      // Return a fallback result if JSON parsing fails
      throw new Error(`Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
    
    // Extract the new quality metrics and store them for the frontend
    const qualityMetrics = {
      conceptualCompression: rawResult.conceptualCompression || null,
      epistemicFriction: rawResult.epistemicFriction || null,
      inferenceControl: rawResult.inferenceControl || null,
      asymmetryOfCognitiveLabor: rawResult.asymmetryOfCognitiveLabor || null,
      noveltyToBaselineRatio: rawResult.noveltyToBaselineRatio || null,
      internalDifferentiation: rawResult.internalDifferentiation || null,
      problemDensity: rawResult.problemDensity || null,
      compressionAcrossLevels: rawResult.compressionAcrossLevels || null,
      semanticSpecificity: rawResult.semanticSpecificity || null,
      explanatoryYield: rawResult.explanatoryYield || null,
      metaCognitiveSignal: rawResult.metaCognitiveSignal || null,
      structuralIntegrity: rawResult.structuralIntegrity || null,
      generativePotential: rawResult.generativePotential || null,
      signalToRhetoricRatio: rawResult.signalToRhetoricRatio || null,
      dialecticalEngagement: rawResult.dialecticalEngagement || null,
      topologicalAwareness: rawResult.topologicalAwareness || null,
      disambiguationSkill: rawResult.disambiguationSkill || null,
      crossDisciplinaryFluency: rawResult.crossDisciplinaryFluency || null,
      psychologicalRealism: rawResult.psychologicalRealism || null,
      intellectualRiskQuotient: rawResult.intellectualRiskQuotient || null
    };
    
    // Convert new 20-parameter format to legacy AnalysisResult type for backward compatibility
    const result: AnalysisResult = {
      // Map conceptualCompression to conceptualLineage for compatibility
      conceptualLineage: {
        passageA: {
          primaryInfluences: rawResult.conceptualCompression?.passageA?.assessment || "Analysis of conceptual influences",
          intellectualTrajectory: rawResult.epistemicFriction?.passageA?.assessment || "Analysis of intellectual development"
        },
        passageB: {
          primaryInfluences: "Typical writing draws from established academic traditions and common frameworks",
          intellectualTrajectory: "Standard texts follow conventional intellectual patterns"
        }
      },
      
      // Map historicalRarity to semanticDistance
      semanticDistance: {
        passageA: {
          distance: (rawResult.historicalRarity?.passageA?.score || 5) * 10,
          label: rawResult.historicalRarity?.passageA?.score >= 7 ? "High Distance" : rawResult.historicalRarity?.passageA?.score >= 4 ? "Moderate Distance" : "Low Distance"
        },
        passageB: {
          distance: 50,
          label: "Average Distance (Norm Baseline)"
        },
        keyFindings: [
          rawResult.transformativeSynthesis?.passageA?.strengths?.[0] || "Conceptual synthesis analysis",
          rawResult.epistemicReframing?.passageA?.strengths?.[0] || "Epistemic reframing evaluation", 
          rawResult.ontologicalInnovation?.passageA?.strengths?.[0] || "Ontological innovation assessment"
        ],
        semanticInnovation: rawResult.verdict || "Comprehensive analysis across 20 originality parameters reveals varying degrees of innovation."
      },
      
      // Create novelty heatmap from paragraph analysis
      noveltyHeatmap: {
        passageA: paragraphs.map((p, index) => ({
          content: p.substring(0, 100) + (p.length > 100 ? "..." : ""),
          heat: Math.floor(((rawResult.transformativeSynthesis?.passageA?.score || 5) + 
                           (rawResult.recursiveInnovation?.passageA?.score || 5) + 
                           (rawResult.ontologicalInnovation?.passageA?.score || 5)) / 3 * 10),
          quote: p.length > 40 ? p.substring(0, 40) + "..." : p,
          explanation: `Paragraph ${index + 1} demonstrates originality through multiple parameters`
        })),
        passageB: [
          {
            content: "Typical writing in this domain follows conventional structures and patterns",
          heat: 50,
          quote: "Standard academic phrasing and terminology",
          explanation: "This represents the conventional approach found in most scholarly writing."
        },
        {
          content: "Standard introduction of established concepts without novel framing",
          heat: 50,
          quote: "As scholars have long established...",
          explanation: "This exemplifies typical references to established authorities without new insight."
        }
        ]
      },
      
      // Calculate aggregate originality score from multiple parameters
      derivativeIndex: {
        passageA: {
          score: Math.round(((rawResult.transformativeSynthesis?.passageA?.score || 5) +
                           (rawResult.ontologicalInnovation?.passageA?.score || 5) +
                           (rawResult.generativeAsymmetry?.passageA?.score || 5) +
                           (rawResult.categoryRupture?.passageA?.score || 5) +
                           (rawResult.frameViolation?.passageA?.score || 5)) / 5 * 10) / 10,
          components: [
            {name: "Transformative Synthesis", score: rawResult.transformativeSynthesis?.passageA?.score || 5},
            {name: "Ontological Innovation", score: rawResult.ontologicalInnovation?.passageA?.score || 5},
            {name: "Generative Asymmetry", score: rawResult.generativeAsymmetry?.passageA?.score || 5}
          ]
        },
        passageB: {
          score: 5,
          components: [
            {name: "Transformative Synthesis", score: 5},
            {name: "Ontological Innovation", score: 5},
            {name: "Generative Asymmetry", score: 5}
          ]
        }
      },
      
      // Map unforcedNonconformity to conceptualParasite (inverted)
      conceptualParasite: {
        passageA: {
          level: (rawResult.unforcedNonconformity?.passageA?.score || 5) >= 7 ? "Low" : 
                 (rawResult.unforcedNonconformity?.passageA?.score || 5) >= 4 ? "Moderate" : "High",
          elements: rawResult.unforcedNonconformity?.passageA?.weaknesses || ["Some derivative elements", "Standard patterns"],
          assessment: rawResult.unforcedNonconformity?.passageA?.assessment || "Analysis of conceptual dependence"
        },
        passageB: {
          level: "Moderate",
          elements: ["Conventional frameworks", "Standard academic patterns"],
          assessment: "Typical texts show moderate dependence on established patterns"
        }
      },
      
      // Map compressionExpansionTension to coherence
      coherence: {
        passageA: {
          score: rawResult.compressionExpansionTension?.passageA?.score || 5,
          assessment: rawResult.compressionExpansionTension?.passageA?.assessment || "Analysis of structural coherence",
          strengths: rawResult.compressionExpansionTension?.passageA?.strengths || ["Logical structure", "Clear progression"],
          weaknesses: rawResult.compressionExpansionTension?.passageA?.weaknesses || ["Some unclear transitions", "Could improve flow"]
        },
        passageB: {
          score: 6,
          assessment: "Typical texts maintain standard coherence levels with conventional logical flow",
          strengths: ["Standard logical flow", "Conventional structure"],
          weaknesses: ["Typical clarity issues", "Standard organizational patterns"]
        }
      },
      
      // Map anchorToDriftRatio to accuracy
      accuracy: {
        passageA: {
          score: rawResult.anchorToDriftRatio?.passageA?.score || 5,
          assessment: rawResult.anchorToDriftRatio?.passageA?.assessment || "Analysis of grounding and originality balance",
          strengths: rawResult.anchorToDriftRatio?.passageA?.strengths || ["Well-grounded claims", "Logical inferences"],
          weaknesses: rawResult.anchorToDriftRatio?.passageA?.weaknesses || ["Some unverified claims", "Could strengthen evidence"]
        },
        passageB: {
          score: 5,
          assessment: "Typical texts maintain average accuracy with standard verification practices",
          strengths: ["Standard factual content", "Conventional logical structure"],
          weaknesses: ["Some unverified assertions", "Typical evidentiary gaps"]
        }
      },
      
      // Map semanticDiagonalization to depth
      depth: {
        passageA: {
          score: rawResult.semanticDiagonalization?.passageA?.score || 5,
          assessment: rawResult.semanticDiagonalization?.passageA?.assessment || "Analysis of conceptual depth and cross-layer understanding",
          strengths: rawResult.semanticDiagonalization?.passageA?.strengths || ["Multi-level analysis", "Conceptual insight"],
          weaknesses: rawResult.semanticDiagonalization?.passageA?.weaknesses || ["Could explore implications further", "Some surface-level treatment"]
        },
        passageB: {
          score: 5,
          assessment: "Typical texts engage with concepts at conventional depths",
          strengths: ["Standard level of conceptual engagement", "Conventional analysis"],
          weaknesses: ["Lacks deeper exploration", "Surface-level treatment common"]
        }
      },
      
      // Map semanticReconfiguration to clarity
      clarity: {
        passageA: {
          score: rawResult.semanticReconfiguration?.passageA?.score || 5,
          assessment: rawResult.semanticReconfiguration?.passageA?.assessment || "Analysis of semantic clarity and term definition",
          strengths: rawResult.semanticReconfiguration?.passageA?.strengths || ["Clear terminology", "Well-defined concepts"],
          weaknesses: rawResult.semanticReconfiguration?.passageA?.weaknesses || ["Some unclear terms", "Could improve precision"]
        },
        passageB: {
          score: 5,
          assessment: "Typical texts maintain standard clarity with conventional terminology",
          strengths: ["Conventional sentence structure", "Standard organization"],
          weaknesses: ["Typical readability issues", "Standard precision levels"]
        }
      },
      
      verdict: rawResult.verdict || "Comprehensive analysis across 20 quality metrics reveals varying strengths in conceptual innovation, structural coherence, and intellectual depth.",
      
      // Store the raw 20-parameter analysis for potential future use
      rawTwentyParameterAnalysis: rawResult,
      
      // Include the new quality metrics for the frontend
      ...qualityMetrics
    };
    
    // Store userContext in the result if it was provided
    if (userContext) {
      result.userContext = userContext;
    }
    
    return result;
  } catch (error) {
    console.error("Error calling OpenAI for single passage analysis:", error);
    throw new Error(`Failed to analyze passage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Intelligence Meter - Analyzes cognitive sophistication and thinking quality
 */
export async function analyzeIntelligence(
  passage: PassageData
): Promise<AnalysisResult> {
  try {
    const paragraphs = splitIntoParagraphs(passage.text);
    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert evaluator of cognitive sophistication and intellectual ability. Analyze the thinking quality, reasoning architecture, and intellectual capabilities demonstrated in text across all disciplines. Focus on the depth and sophistication of cognitive processes, not topic knowledge or academic style.

INTELLIGENCE EVALUATION CRITERIA:

Assess cognitive capabilities through these 20 intelligence metrics. Score each 0-10 with strict standards:

1. Compression Capacity - Can complex ideas be expressed in compact form without loss? High: Dense formulations yield insight with minimal words. Low: Rambling, bloated expression reveals conceptual weakness.

2. Multi-Level Integration - Can the author operate across multiple levels (abstract/concrete, meta/object)? High: Seamless transitions between layers of analysis. Low: Stuck on one plane.

3. Dynamic Constraint Handling - Does the thinker maintain coherence under complex constraints? High: Manages tradeoffs without collapsing precision. Low: Ignores or oversimplifies conflicting demands.

4. Inference Architecture - Are ideas constructed with deep, layered inferential scaffolding? High: Multi-step reasoning with structural memory. Low: Shallow or linear logic.

5. Epistemic Risk Management - Does the thinker show awareness of the riskiness of their claims? High: Risky claims managed with discipline. Low: Reckless or excessively cautious.

6. Cognitive Friction Tolerance - Can the thinker endure unresolved tensions? High: Holds dissonance productively. Low: Rushes to resolution or avoids it.

7. Strategic Ambiguity Deployment - Can ambiguity be used intentionally and effectively? High: Selective ambiguity to provoke thought. Low: Unintentional or incoherent.

8. Representational Versatility - Can the thinker switch formats as needed? High: Moves between diagrams, prose, math, analogy. Low: Rigidly sticks to one mode.

9. Recursive Self-Monitoring - Does the thinker reflect on their own moves? High: Meta-awareness present. Low: Blind to own method.

10. Conceptual Novelty with Coherence - Are new ideas viable and structured? High: Original and operationalizable. Low: Performative or incoherent.

11. Noise Suppression - Can the thinker focus on signal? High: Ignores distractions. Low: Chases tangents.

12. Abductive Strength - Are best-explanation arguments creatively but plausibly formed? High: Surprising but cogent hypotheses. Low: Appealing but unsupported.

13. Causal Finesse - Are causal relations modeled with nuance? High: Layered causal logic. Low: Simple linear cause-effect.

14. Boundary Perception - Are the limits of scope/method recognized? High: Aware of constraints. Low: Overreach or blind spots.

15. Temporal Layering - Can change over time be tracked structurally? High: Coherent historical/evolutionary logic. Low: Timeless or inert.

16. Intellectual Empathy - Are opposing views reconstructed fairly? High: Strong steelmanning. Low: Straw men.

17. Conceptual Mobility - Can the thinker shift between domains? High: Fluid conceptual transitions. Low: Stuck in one paradigm.

18. Error Assimilation - Can mistakes be integrated into thinking? High: Errors are processed productively. Low: Hidden or denied.

19. Pattern Extraction - Can deep structure be detected across variation? High: Generalizes across difference. Low: Stays at surface.

20. Semantic Topology Awareness - Are dependencies between ideas tracked? High: Conceptual terrain is mapped. Low: Flat or meandering flow.

SCORING STANDARDS (Apply rigorously):
- 9-10: Exceptional cognitive sophistication, demonstrates advanced reasoning architecture
- 7-8: Strong thinking quality with clear intellectual capabilities
- 5-6: Competent reasoning with some limitations
- 3-4: Basic cognitive function but limited sophistication  
- 0-2: Weak reasoning, poor cognitive control

For each metric, provide:
- Score (0-10)
- Assessment (detailed evaluation)
- Quotation1 (direct quote demonstrating the score)
- Justification1 (explanation of why the quote supports the score)
- Quotation2 (second supporting quote)
- Justification2 (explanation of the second quote)

Return in this exact JSON format:
{
  "compressionCapacity": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline cognitive capacity", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "multiLevelIntegration": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "dynamicConstraintHandling": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "inferenceArchitecture": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "epistemicRiskManagement": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "cognitiveFrictionTolerance": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "strategicAmbiguityDeployment": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "representationalVersatility": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "recursiveSelfMonitoring": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "conceptualNoveltyWithCoherence": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "noiseSuppression": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "abductiveStrength": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "causalFinesse": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "boundaryPerception": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "temporalLayering": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "intellectualEmpathy": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "conceptualMobility": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "errorAssimilation": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "patternExtraction": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "semanticTopologyAwareness": {
    "passageA": { "score": number from 0-10, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" },
    "passageB": { "score": 5, "assessment": "baseline", "quotation1": "typical example", "justification1": "standard reasoning", "quotation2": "another example", "justification2": "typical justification" }
  },
  "verdict": "comprehensive intelligence assessment across all 20 cognitive capabilities"
}`,
        },
        {
          role: "user",
          content: `Please analyze the intelligence and cognitive sophistication demonstrated in this passage:

Title: ${passageTitle}
${userContext ? `Context: ${userContext}` : ""}

Text:
${passage.text}

Evaluate using all 20 intelligence metrics with quotations and justifications.`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000,
    });

    // Parse the response with error handling
    let rawResult: any = {};
    try {
      const responseContent = response.choices[0].message.content ?? "{}";
      console.log("Intelligence analysis response length:", responseContent.length);
      
      if (!responseContent.trim().endsWith('}')) {
        console.warn("Intelligence response appears to be truncated");
        throw new Error("Response was truncated by OpenAI API");
      } else {
        rawResult = JSON.parse(responseContent);
      }
    } catch (parseError) {
      console.error("JSON parsing error in intelligence analysis:", parseError);
      throw new Error(`Failed to parse intelligence analysis response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
    
    // Extract intelligence metrics for storage
    const intelligenceMetrics = {
      compressionCapacity: rawResult.compressionCapacity || null,
      multiLevelIntegration: rawResult.multiLevelIntegration || null,
      dynamicConstraintHandling: rawResult.dynamicConstraintHandling || null,
      inferenceArchitecture: rawResult.inferenceArchitecture || null,
      epistemicRiskManagement: rawResult.epistemicRiskManagement || null,
      cognitiveFrictionTolerance: rawResult.cognitiveFrictionTolerance || null,
      strategicAmbiguityDeployment: rawResult.strategicAmbiguityDeployment || null,
      representationalVersatility: rawResult.representationalVersatility || null,
      recursiveSelfMonitoring: rawResult.recursiveSelfMonitoring || null,
      conceptualNoveltyWithCoherence: rawResult.conceptualNoveltyWithCoherence || null,
      noiseSuppression: rawResult.noiseSuppression || null,
      abductiveStrength: rawResult.abductiveStrength || null,
      causalFinesse: rawResult.causalFinesse || null,
      boundaryPerception: rawResult.boundaryPerception || null,
      temporalLayering: rawResult.temporalLayering || null,
      intellectualEmpathy: rawResult.intellectualEmpathy || null,
      conceptualMobility: rawResult.conceptualMobility || null,
      errorAssimilation: rawResult.errorAssimilation || null,
      patternExtraction: rawResult.patternExtraction || null,
      semanticTopologyAwareness: rawResult.semanticTopologyAwareness || null
    };
    
    // Convert intelligence metrics to legacy AnalysisResult format for compatibility
    const result: AnalysisResult = {
      // Map compressionCapacity to conceptualLineage for compatibility
      conceptualLineage: {
        passageA: {
          primaryInfluences: rawResult.compressionCapacity?.passageA?.assessment || "Intelligence analysis of compression capacity",
          intellectualTrajectory: rawResult.multiLevelIntegration?.passageA?.assessment || "Analysis of multi-level integration"
        },
        passageB: {
          primaryInfluences: "Baseline compression capacity for typical cognitive function",
          intellectualTrajectory: "Standard multi-level integration patterns"
        }
      },
      
      // Map dynamicConstraintHandling to semanticDistance
      semanticDistance: {
        passageA: {
          distance: (rawResult.dynamicConstraintHandling?.passageA?.score || 5) * 10,
          label: rawResult.dynamicConstraintHandling?.passageA?.score >= 7 ? "High Sophistication" : 
                 rawResult.dynamicConstraintHandling?.passageA?.score >= 4 ? "Moderate Sophistication" : "Basic Sophistication"
        },
        passageB: {
          distance: 50,
          label: "Baseline Sophistication"
        },
        keyFindings: [
          rawResult.dynamicConstraintHandling?.passageA?.assessment || "Analysis of constraint handling capabilities",
          rawResult.inferenceArchitecture?.passageA?.assessment || "Evaluation of reasoning architecture",
          rawResult.cognitiveFrictionTolerance?.passageA?.assessment || "Assessment of cognitive friction tolerance"
        ],
        semanticInnovation: rawResult.verdict || "Comprehensive intelligence analysis across 20 cognitive capabilities reveals varying strengths in reasoning architecture, constraint handling, and conceptual sophistication."
      },
      
      // Map inferenceArchitecture to noveltyHeatmap
      noveltyHeatmap: {
        passageA: paragraphs.map((paragraph, index) => ({
          content: paragraph.substring(0, 100) + (paragraph.length > 100 ? "..." : ""),
          heat: Math.round((rawResult.inferenceArchitecture?.passageA?.score || 5) * 10),
          quote: rawResult.inferenceArchitecture?.passageA?.quote1 || paragraph.substring(0, 50) + "...",
          explanation: `Inference architecture evaluation: ${rawResult.inferenceArchitecture?.passageA?.assessment || "Analysis of reasoning structure"}`
        })),
        passageB: paragraphs.map((paragraph, index) => ({
          content: paragraph.substring(0, 100) + (paragraph.length > 100 ? "..." : ""),
          heat: 50,
          quote: "Standard inference patterns",
          explanation: "Baseline inference patterns in typical reasoning"
        }))
      },
      
      // Map epistemicRiskManagement to derivativeIndex
      derivativeIndex: {
        passageA: {
          score: rawResult.epistemicRiskManagement?.passageA?.score || 5,
          components: [
            {name: "Epistemic Risk Management", score: rawResult.epistemicRiskManagement?.passageA?.score || 5},
            {name: "Cognitive Friction Tolerance", score: rawResult.cognitiveFrictionTolerance?.passageA?.score || 5},
            {name: "Inference Architecture", score: rawResult.inferenceArchitecture?.passageA?.score || 5}
          ]
        },
        passageB: {
          score: 5,
          components: [
            {name: "Epistemic Risk Management", score: 5},
            {name: "Cognitive Friction Tolerance", score: 5},
            {name: "Inference Architecture", score: 5}
          ]
        }
      },
      
      // Map cognitiveFrictionTolerance to conceptualParasite
      conceptualParasite: {
        passageA: {
          level: rawResult.cognitiveFrictionTolerance?.passageA?.score >= 7 ? "Low" : 
                 rawResult.cognitiveFrictionTolerance?.passageA?.score >= 4 ? "Moderate" : "High",
          elements: rawResult.cognitiveFrictionTolerance?.passageA?.weaknesses || ["Some friction avoidance", "Standard resolution pressure"],
          assessment: rawResult.cognitiveFrictionTolerance?.passageA?.assessment || "Analysis of cognitive friction tolerance"
        },
        passageB: {
          level: "Moderate",
          elements: ["Typical tension avoidance", "Standard resolution patterns"],
          assessment: "Baseline cognitive friction tolerance in typical reasoning"
        }
      },
      
      // Map strategicAmbiguityDeployment to coherence
      coherence: {
        passageA: {
          score: rawResult.strategicAmbiguityDeployment?.passageA?.score || 5,
          assessment: rawResult.strategicAmbiguityDeployment?.passageA?.assessment || "Analysis of strategic ambiguity use",
          strengths: rawResult.strategicAmbiguityDeployment?.passageA?.strengths || ["Intentional ambiguity", "Strategic vagueness"],
          weaknesses: rawResult.strategicAmbiguityDeployment?.passageA?.weaknesses || ["Some unclear intentions", "Could improve precision"]
        },
        passageB: {
          score: 5,
          assessment: "Baseline ambiguity management in typical reasoning",
          strengths: ["Standard clarity patterns", "Conventional precision"],
          weaknesses: ["Typical ambiguity issues", "Standard vagueness problems"]
        }
      },
      
      // Map representationalVersatility to accuracy
      accuracy: {
        passageA: {
          score: rawResult.representationalVersatility?.passageA?.score || 5,
          assessment: rawResult.representationalVersatility?.passageA?.assessment || "Analysis of representational flexibility",
          strengths: rawResult.representationalVersatility?.passageA?.strengths || ["Multiple formats", "Flexible representation"],
          weaknesses: rawResult.representationalVersatility?.passageA?.weaknesses || ["Some format limitations", "Could expand range"]
        },
        passageB: {
          score: 5,
          assessment: "Baseline representational versatility in typical reasoning",
          strengths: ["Standard format use", "Conventional representation"],
          weaknesses: ["Limited format range", "Typical rigidity"]
        }
      },
      
      // Map recursiveSelfMonitoring to depth
      depth: {
        passageA: {
          score: rawResult.recursiveSelfMonitoring?.passageA?.score || 5,
          assessment: rawResult.recursiveSelfMonitoring?.passageA?.assessment || "Analysis of meta-cognitive awareness",
          strengths: rawResult.recursiveSelfMonitoring?.passageA?.strengths || ["Self-awareness", "Method reflection"],
          weaknesses: rawResult.recursiveSelfMonitoring?.passageA?.weaknesses || ["Some blind spots", "Could improve monitoring"]
        },
        passageB: {
          score: 5,
          assessment: "Baseline self-monitoring in typical reasoning",
          strengths: ["Standard self-awareness", "Conventional reflection"],
          weaknesses: ["Typical blind spots", "Limited meta-cognition"]
        }
      },
      
      // Map conceptualNoveltyWithCoherence to clarity
      clarity: {
        passageA: {
          score: rawResult.conceptualNoveltyWithCoherence?.passageA?.score || 5,
          assessment: rawResult.conceptualNoveltyWithCoherence?.passageA?.assessment || "Analysis of novel yet coherent thinking",
          strengths: rawResult.conceptualNoveltyWithCoherence?.passageA?.strengths || ["Original ideas", "Structured novelty"],
          weaknesses: rawResult.conceptualNoveltyWithCoherence?.passageA?.weaknesses || ["Some coherence gaps", "Could strengthen structure"]
        },
        passageB: {
          score: 5,
          assessment: "Baseline novelty-coherence balance in typical reasoning",
          strengths: ["Standard originality", "Conventional structure"],
          weaknesses: ["Limited innovation", "Typical coherence issues"]
        }
      },
      
      verdict: rawResult.verdict || "Comprehensive intelligence analysis across 20 cognitive capabilities reveals varying strengths in reasoning architecture, constraint handling, and conceptual sophistication.",
      
      // Store the raw intelligence analysis
      rawIntelligenceAnalysis: rawResult,
      
      // Include the intelligence metrics for the frontend
      ...intelligenceMetrics
    };
    
    // Store userContext in the result if provided
    if (userContext) {
      result.userContext = userContext;
    }
    
    return result;
  } catch (error) {
    console.error("Error in intelligence analysis:", error);
    throw new Error(`Failed to analyze intelligence: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process user feedback on a previously generated analysis and provide a response
 * with possible re-evaluation
 */
// This function has been removed to fix conflict

/**
 * Analyzes a passage against a larger corpus of text
 * @param passage The passage to analyze
 * @param corpus The larger corpus or reference text
 * @param corpusTitle Optional title of the corpus
 * @returns Analysis result comparing the passage against the corpus
 */
export async function analyzePassageAgainstCorpus(
  passage: PassageData,
  corpus: string,
  corpusTitle?: string
): Promise<AnalysisResult> {
  console.log(`Analyzing passage '${passage.title}' against corpus '${corpusTitle || "Unnamed Corpus"}'`);
  const userContext = passage.userContext || "";
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Truncate the passage and corpus if they're too long
    const truncatedPassageText = passage.text.slice(0, 8000);
    let truncatedCorpus = corpus.slice(0, 32000); // Use more of the corpus since it's important

    // Create a prompt for the analysis
    const prompt = `
You are an expert in analyzing the conceptual originality AND merit of texts. You are tasked with comparing an individual passage against a larger corpus (body of work). 

IMPORTANT GUIDELINES FOR EVALUATION:

1. DO NOT penalize passages for lacking empirical data unless they make explicit claims that depend on such data. Philosophical, theoretical, or speculative reasoning is valid and must be judged on its own merits.

2. DO NOT penalize analogy use unless the analogy is incoherent, strained, or logically misleading. Analogical reasoning is legitimate in high-level theoretical discourse.

3. DO NOT reward passages for being simple, popular, or easily digestible. Reward clarity when it communicates complex ideas well, but do not conflate accessibility with merit.

4. DO NOT treat clarity, coherence, or consensus-alignment as more important than insight. Originality must be conditioned on value — not on novelty for its own sake, but on novelty that yields real insight.

5. Recognize that philosophical writing often uses different methodologies than empirical sciences - these are valid approaches deserving recognition.

6. Value conceptual innovation even when it challenges mainstream views.

Your analysis should focus on the following aspects:

1. Conceptual Lineage: Identify how the concepts, ideas, and arguments in the passage trace back to or build upon concepts in the corpus.
2. Semantic Distance: Assess how similar or different the passage is from the corpus in terms of meaning, style, and theoretical approach.
3. Novelty Analysis: Determine what aspects of the passage represent novel contributions beyond what's in the corpus.
4. Derivative Index: Calculate to what extent the passage is derivative of the corpus vs. original. Value should be based on merit-balanced originality, not mere novelty.
5. Conceptual Parasitism: Evaluate if the passage relies too heavily on the corpus without adding sufficient original value. NOTE: Do not classify a passage as parasitic merely because it challenges established views or lacks empirical data.
6. Coherence: Analyze if the passage effectively structures its ideas in a cohesive manner within its own theoretical framework. Complex philosophical arguments may appear less coherent to untrained readers but can be highly coherent within their theoretical framework.
7. Accuracy: Assess the passage's logical and conceptual rigor. For philosophical texts, accuracy refers to logical validity and conceptual precision, NOT empirical verificability.
8. Depth: Evaluate the non-triviality, conceptual insight, and theoretical significance of the passage. Highly value passages that engage with difficult conceptual terrain, even when lacking empirical backing.
9. Clarity: Determine how effectively the passage communicates complex ideas. Do NOT reward simplistic writing over sophisticated expression of complex ideas.

PASSAGE TO ANALYZE (titled "${passage.title || 'Untitled Passage'}"):
${truncatedPassageText}

${userContext ? `AUTHOR'S CONTEXT: ${userContext}

When evaluating this passage, consider the author's context provided above. Adapt your evaluation criteria accordingly. For example, don't penalize excerpts for brevity or rough drafts for minor coherence issues.` : ''}

REFERENCE CORPUS (titled "${corpusTitle || 'Reference Corpus'}"):
${truncatedCorpus}

Your output must follow this exact structure:

CONCEPTUAL LINEAGE ANALYSIS:
[Provide a detailed analysis of how the passage's concepts connect to or derive from the corpus. Identify specific conceptual influences, theoretical frameworks, or methodological approaches that appear to have been adapted from the corpus. If you find direct quotations or very close paraphrasing, highlight those. Score from 0-100, where lower scores indicate high derivation from the corpus, higher scores indicate more independence from the corpus.] 

SEMANTIC DISTANCE MEASURE:
[Analyze how semantically distant or close the passage is to the corpus. Consider vocabulary choices, syntactic structures, argumentative patterns, and disciplinary conventions. Score from 0-100, where 0 means the passage is semantically identical to parts of the corpus, and 100 means it is entirely semantically distinct.]

NOVELTY HEATMAP:
[Provide a paragraph-by-paragraph analysis of the passage, indicating the degree of novelty in each paragraph relative to the corpus. Score each paragraph's novelty from 0-100. For passages with low novelty scores, include a brief explanation and, if appropriate, identify the specific part of the corpus it most resembles.]

DERIVATIVE INDEX:
[Calculate a score from 0-100 indicating the extent to which the passage is derivative of the corpus. A lower score indicates high derivation; a higher score indicates more originality. Provide a short explanation for this rating.]

CONCEPTUAL PARASITE DETECTION:
[Assess if the passage merely repackages ideas from the corpus without significant added value. Classify the result as "Low", "Moderate", or "High" risk of conceptual parasitism. Provide examples from the passage that support your assessment.]

COHERENCE EVALUATION:
[Analyze how coherently the passage structures its ideas, maintains logical flow, and develops arguments. Compare this to the general coherence of the corpus. Score from 0-100, where higher scores indicate greater coherence. Provide specific examples from the passage.]

ACCURACY ASSESSMENT:
[Evaluate the factual accuracy of claims made in the passage, especially in relation to claims made in the corpus. Score from 0-100, where higher scores indicate greater accuracy. Note any discrepancies or contradictions between the passage and the corpus.]

DEPTH ANALYSIS:
[Assess the intellectual depth of the passage compared to the corpus. Does it engage with concepts at a similar level of sophistication? Does it explore implications and nuances with equal or greater thoroughness? Score from 0-100, where higher scores indicate greater depth. Provide examples.]

CLARITY MEASUREMENT:
[Evaluate how clearly the passage communicates its ideas compared to the corpus. Consider factors like jargon usage, sentence structure, and explanatory quality. Score from 0-100, where higher scores indicate greater clarity. Provide specific examples from the passage.]

SUMMARY OF ORIGINALITY ASSESSMENT:
[Summarize the overall originality of the passage in relation to the corpus, integrating insights from all the above measures. Provide a final originality score from 0-100.]

KEY STRENGTHS OF THE PASSAGE:
[List 3-5 specific strengths of the passage in bullet points, particularly noting where it advances beyond or improves upon the corpus.]

ORIGINALITY IMPROVEMENT RECOMMENDATIONS:
[Provide 3-5 specific recommendations for how the passage could be made more original while maintaining its relationship to the corpus.]
`;

    // Send the prompt to the model
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a text analysis expert specializing in semantic originality assessment."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 4000,
    });

    // Process the response
    const completionText = completion.choices[0].message.content || "";
    console.log("OpenAI API responded with analysis");

    // Parse the response to extract the components we need
    const result: AnalysisResult = {
      conceptualLineage: {
        passageA: {
          primaryInfluences: "Analysis from corpus comparison: " + 
            extractSection(completionText, "CONCEPTUAL LINEAGE ANALYSIS", 500),
          intellectualTrajectory: "Trajectory from corpus comparison: " + 
            extractSection(completionText, "CONCEPTUAL LINEAGE ANALYSIS", 500)
        },
        passageB: {
          primaryInfluences: `This analysis compares your passage to "${corpusTitle || 'Reference Corpus'}"`,
          intellectualTrajectory: "The reference corpus serves as the intellectual standard."
        }
      },
      semanticDistance: {
        passageA: {
          distance: extractNumericValue(completionText, "SEMANTIC DISTANCE MEASURE", 0, 100) || 50,
          label: extractLabel(completionText, "SEMANTIC DISTANCE MEASURE") || "Moderate Distance"
        },
        passageB: {
          distance: 0,
          label: "Reference Corpus" 
        },
        keyFindings: extractListItems(completionText, "SUMMARY OF ORIGINALITY ASSESSMENT", "KEY STRENGTHS", 5),
        semanticInnovation: extractSection(completionText, "SEMANTIC DISTANCE MEASURE", 300),
      },
      noveltyHeatmap: {
        passageA: generateHeatmapFromParagraphs(
          truncatedPassageText.split("\n\n").filter(p => p.trim()),
          extractSection(completionText, "NOVELTY HEATMAP", 4000) || ""
        ),
        passageB: [], // Not applicable in corpus comparison mode
        feedback: undefined,
      },
      derivativeIndex: {
        passageA: {
          score: extractNumericValue(completionText, "DERIVATIVE INDEX", 0, 10) || 5,
          components: [
            {name: "Conceptual Innovation", score: extractNumericValue(completionText, "Conceptual Innovation", 0, 10) || 5},
            {name: "Methodological Novelty", score: extractNumericValue(completionText, "Methodological Novelty", 0, 10) || 5},
            {name: "Contextual Application", score: extractNumericValue(completionText, "Contextual Application", 0, 10) || 5}
          ]
        },
        passageB: {
          score: 10, // Perfect score as it's the reference corpus
          components: [
            {name: "Reference Standard", score: 10}
          ]
        }
      },
      conceptualParasite: {
        passageA: {
          level: extractParasiteLevel(completionText) || "Moderate",
          elements: extractListItems(completionText, "CONCEPTUAL PARASITE DETECTION", "", 3),
          assessment: extractSection(completionText, "CONCEPTUAL PARASITE DETECTION", 300) || "Analysis unavailable"
        },
        passageB: {
          level: "Low",
          elements: ["Reference Corpus"],
          assessment: "This is the reference corpus used for comparison."
        }
      },
      coherence: {
        passageA: {
          score: extractNumericValue(completionText, "COHERENCE EVALUATION", 0, 10) || 5,
          assessment: extractSection(completionText, "COHERENCE EVALUATION", 300) || "Analysis unavailable",
          strengths: extractListItems(completionText, "COHERENCE EVALUATION", "strengths", 3),
          weaknesses: extractListItems(completionText, "COHERENCE EVALUATION", "weaknesses", 3)
        },
        passageB: {
          score: 10,
          assessment: "Reference corpus used for comparison.",
          strengths: ["Reference standard"],
          weaknesses: []
        }
      },
      accuracy: {
        passageA: {
          score: extractNumericValue(completionText, "ACCURACY ASSESSMENT", 0, 10) || 5,
          assessment: extractSection(completionText, "ACCURACY ASSESSMENT", 300) || "Analysis unavailable",
          strengths: extractListItems(completionText, "ACCURACY ASSESSMENT", "strengths", 3),
          weaknesses: extractListItems(completionText, "ACCURACY ASSESSMENT", "weaknesses", 3)
        },
        passageB: {
          score: 10,
          assessment: "Reference corpus used for comparison.",
          strengths: ["Reference standard"],
          weaknesses: []
        }
      },
      depth: {
        passageA: {
          score: extractNumericValue(completionText, "DEPTH ANALYSIS", 0, 10) || 5,
          assessment: extractSection(completionText, "DEPTH ANALYSIS", 300) || "Analysis unavailable",
          strengths: extractListItems(completionText, "DEPTH ANALYSIS", "strengths", 3),
          weaknesses: extractListItems(completionText, "DEPTH ANALYSIS", "weaknesses", 3)
        },
        passageB: {
          score: 10,
          assessment: "Reference corpus used for comparison.",
          strengths: ["Reference standard"],
          weaknesses: []
        }
      },
      clarity: {
        passageA: {
          score: extractNumericValue(completionText, "CLARITY MEASUREMENT", 0, 10) || 5,
          assessment: extractSection(completionText, "CLARITY MEASUREMENT", 300) || "Analysis unavailable",
          strengths: extractListItems(completionText, "CLARITY MEASUREMENT", "strengths", 3),
          weaknesses: extractListItems(completionText, "CLARITY MEASUREMENT", "weaknesses", 3)
        },
        passageB: {
          score: 10,
          assessment: "Reference corpus used for comparison.",
          strengths: ["Reference standard"],
          weaknesses: []
        }
      },
      verdict: extractSection(completionText, "SUMMARY OF ORIGINALITY ASSESSMENT", 300) || "This passage has been analyzed against the provided corpus to evaluate its originality.",
    };
    
    // Store userContext in the result if it was provided
    if (userContext) {
      result.userContext = userContext;
    }

    return result;
  } catch (error) {
    console.error("Error in corpus analysis:", error);
    throw new Error(`Failed to analyze passage against corpus: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper functions for parsing OpenAI responses
function extractSection(text: string, sectionName: string, maxLength: number = 200): string {
  const regex = new RegExp(`${sectionName}[:\\s]+(.*?)(?=\\n\\s*\\n|\\n\\s*[A-Z]|$)`, 'is');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1].trim().substring(0, maxLength);
  }
  return "Analysis information unavailable.";
}

function extractSubsection(text: string, sectionName: string, subsectionKeyword: string, maxLength: number = 200): string {
  const section = extractSection(text, sectionName, 1000);
  if (!section) return "Subsection information unavailable.";
  
  const regex = new RegExp(`${subsectionKeyword}[:\\s]+(.*?)(?=\\n\\s*\\n|\\n\\s*[A-Z]|$)`, 'is');
  const match = section.match(regex);
  if (match && match[1]) {
    return match[1].trim().substring(0, maxLength);
  }
  return "Subsection information unavailable.";
}

function extractNumericValue(text: string, keyword: string, min: number, max: number): number {
  const regex = new RegExp(`${keyword}[^0-9]*(\\d+(?:\\.\\d+)?)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    const value = parseFloat(match[1]);
    return Math.max(min, Math.min(max, value));
  }
  return (min + max) / 2; // Default to middle value if not found
}

function extractLabel(text: string, keyword: string): string {
  const regex = new RegExp(`${keyword}[^:]*:[^A-Za-z]*(\\w+)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return "Moderate"; // Default label
}

function extractListItems(text: string, sectionName: string, subsectionKeyword: string, maxItems: number): string[] {
  const section = extractSection(text, sectionName, 1000);
  if (!section) return ["Information not available"];
  
  const subsectionRegex = new RegExp(`${subsectionKeyword}[:\\s]+(.*?)(?=\\n\\s*\\n|\\n\\s*[A-Z]|$)`, 'is');
  const subsectionMatch = section.match(subsectionRegex);
  if (!subsectionMatch || !subsectionMatch[1]) return ["Information not available"];
  
  const subsection = subsectionMatch[1].trim();
  const itemsRegex = /(?:^|\n)-\s*([^\n]+)/g;
  const items: string[] = [];
  let match;
  
  while ((match = itemsRegex.exec(subsection)) !== null && items.length < maxItems) {
    items.push(match[1].trim());
  }
  
  return items.length > 0 ? items : ["Information not available"];
}

function extractParasiteLevel(text: string): "Low" | "Moderate" | "High" {
  const section = extractSection(text, "Conceptual Parasite", 500);
  if (!section) return "Moderate";
  
  if (section.toLowerCase().includes("low")) return "Low";
  if (section.toLowerCase().includes("high")) return "High";
  return "Moderate";
}

function generateHeatmapFromParagraphs(paragraphs: string[], analysisText: string): Array<{content: string, heat: number, quote?: string, explanation?: string}> {
  const noveltySection = extractSection(analysisText, "Novelty Heatmap", 1000);
  const heatmap: Array<{content: string, heat: number, quote?: string, explanation?: string}> = [];
  
  // Generate a heatmap based on the analysis or with default values
  paragraphs.forEach((paragraph, index) => {
    // Try to extract heat values from the analysis text
    let heat = 50; // Default moderate heat
    
    if (noveltySection) {
      // Look for mentions of paragraph numbers or sequential description
      const paragraphRegex = new RegExp(`paragraph\\s*${index + 1}|${getOrdinal(index + 1)}\\s*paragraph`, 'i');
      if (paragraphRegex.test(noveltySection)) {
        if (noveltySection.toLowerCase().includes("high novelty") || 
            noveltySection.toLowerCase().includes("innovative")) {
          heat = 80;
        } else if (noveltySection.toLowerCase().includes("low novelty") || 
                 noveltySection.toLowerCase().includes("derivative")) {
          heat = 30;
        }
      }
    }
    
    heatmap.push({
      content: paragraph,
      heat,
      quote: `Paragraph ${index + 1}`,
      explanation: `Analysis of paragraph ${index + 1}`,
    });
  });
  
  return heatmap;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Process user feedback on a previously generated analysis and provide a response
 * with possible re-evaluation
 */
export async function processFeedback(
  request: SubmitFeedbackRequest
): Promise<{ 
  feedback: FeedbackData,
  updatedResult: AnalysisResult
}> {
  try {
    console.log(`Processing feedback for ${request.category}`);
    
    // Format the supporting document if available
    let supportingDocumentText = "";
    if (request.supportingDocument) {
      supportingDocumentText = `
Supporting Document Title: ${request.supportingDocument.title}
Supporting Document Content:
${request.supportingDocument.content}
`;
    }
    
    // Create a prompt based on the feedback category and original result
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert semantic analysis assistant that helps users improve their writing. 
You have analyzed a passage and received feedback from the user about your analysis. 
Your task is to:
1. Consider the user's feedback carefully
2. Provide a thoughtful response that addresses their points
3. Potentially revise your original assessment based on their input
4. Be willing to change your evaluation if the user provides good arguments or additional context
5. Format your response to be clear, educational, and actionable`,
        },
        {
          role: "user",
          content: `I previously received your analysis in the category: ${request.category}. 
Here is my feedback on your analysis:

${request.feedback}

${supportingDocumentText}

The passages being analyzed are:

Passage A:
${request.passageA.text}

${request.isSinglePassageMode ? 'This is a single passage analysis compared to a norm.' : `Passage B:
${request.passageB.text}`}

Please respond to my feedback, making adjustments to your analysis if appropriate. 
Provide a thoughtful response that explains your reasoning and any revised assessment.`,
        },
      ],
      max_tokens: 1000,
    });
    
    const aiResponse = response.choices[0]?.message?.content || "No response generated.";
    
    // Create the feedback data
    const feedbackData: FeedbackData = {
      comment: request.feedback,
      aiResponse: aiResponse,
      isRevised: aiResponse.toLowerCase().includes("revised") || 
                aiResponse.toLowerCase().includes("adjustment") ||
                aiResponse.toLowerCase().includes("reconsidered"),
    };
    
    // Create a copy of the original result
    const updatedResult: AnalysisResult = JSON.parse(JSON.stringify(request.originalResult));
    
    // Update the appropriate category with the feedback
    switch (request.category) {
      case "conceptualLineage":
        updatedResult.conceptualLineage.feedback = feedbackData;
        break;
      case "semanticDistance":
        updatedResult.semanticDistance.feedback = feedbackData;
        break;
      case "noveltyHeatmap":
        updatedResult.noveltyHeatmap.feedback = feedbackData;
        break;
      case "derivativeIndex":
        updatedResult.derivativeIndex.feedback = feedbackData;
        break;
      case "conceptualParasite":
        updatedResult.conceptualParasite.feedback = feedbackData;
        break;
      case "coherence":
        if (updatedResult.coherence) {
          updatedResult.coherence.feedback = feedbackData;
        }
        break;
      case "accuracy":
        if (updatedResult.accuracy) {
          updatedResult.accuracy.feedback = feedbackData;
        }
        break;
      case "depth":
        if (updatedResult.depth) {
          updatedResult.depth.feedback = feedbackData;
        }
        break;
      case "clarity":
        if (updatedResult.clarity) {
          updatedResult.clarity.feedback = feedbackData;
        }
        break;
    }
    
    return {
      feedback: feedbackData,
      updatedResult
    };
  } catch (error) {
    console.error("Error processing feedback:", error);
    throw new Error(`Failed to process feedback: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generates a more original version of a passage based on the analysis results
 * @param passage The original passage
 * @param analysisResult The analysis results containing originality metrics
 * @param styleOption Optional style preference (keep-voice, academic, punchy, prioritize-originality)
 * @returns The improved passage with associated metadata
 */
/**
 * Generates text based on natural language instructions
 * @param instructions Natural language instructions for text generation
 * @param params Parsed parameters from the instructions
 * @returns Generated text and its title
 */
export async function generateCustomText(
  instructions: string,
  params: {
    topic: string;
    wordCount: number;
    authors?: string;
    conceptualDensity: "high" | "medium" | "low";
    parasiteLevel: "high" | "medium" | "low";
    originality: "high" | "medium" | "low";
    title: string;
  }
): Promise<{ text: string; title: string }> {
  try {
    // Configure the conceptual density based on the parameter
    const conceptualDensityGuide = {
      "high": "Use advanced terminology, complex concepts, and explore deep theoretical implications. Connect multiple disciplines and intellectual frameworks. Introduce innovative perspectives.",
      "medium": "Balance technical terms with clear explanations. Connect several key concepts without overwhelming detail. Provide some novel perspectives while maintaining accessibility.",
      "low": "Focus on clarity and accessibility. Use simpler terminology and straightforward explanations. Emphasize practical implications over theoretical complexity."
    };
    
    // Configure the parasite level guidance
    const parasiteLevelGuide = {
      "high": "You may use conventional frameworks and established terminology in the field.",
      "medium": "Avoid overreliance on standard interpretations and conventional terminology. Aim to reformulate established concepts.",
      "low": "Avoid conventional phrasings, standard interpretations, and established frameworks. Create new conceptual approaches and terminology where appropriate."
    };
    
    // Configure originality level guidance
    const originalityGuide = {
      "high": "Prioritize unexpected connections, counterintuitive insights, and novel frameworks. Challenge fundamental assumptions in the field. Explore overlooked implications and unconventional perspectives.",
      "medium": "Balance conventional understanding with some novel insights. Offer fresh perspectives on established topics while maintaining connection to the mainstream discourse.",
      "low": "Stay closer to established views while adding some personal analysis. Focus on clear exposition of existing frameworks with modest extensions."
    };

    // Calculate approximate token limit based on word count
    // Assume 1 word ≈ 1.3 tokens (conservative estimate)
    const maxTokens = Math.min(Math.ceil(params.wordCount * 1.3), 4000);
    
    // Create the system message with detailed instructions
    const systemMessage = `You are an expert in generating highly original, intellectual content with precise control over conceptual density, parasite level, and originality.

TASK:
Generate a highly intellectual and original text based on the user's instructions with the following parameters:

TOPIC: ${params.topic}
TARGET LENGTH: ${params.wordCount} words
${params.authors ? `REFERENCES: Include perspectives from ${params.authors}` : ''}
CONCEPTUAL DENSITY: ${params.conceptualDensity.toUpperCase()}
${conceptualDensityGuide[params.conceptualDensity]}

PARASITE LEVEL: ${params.parasiteLevel.toUpperCase()}
${parasiteLevelGuide[params.parasiteLevel]}

ORIGINALITY: ${params.originality.toUpperCase()}
${originalityGuide[params.originality]}

Your response should include:
1. A title (clearly marked as "TITLE:")
2. The generated text that matches all specified parameters

IMPORTANT GUIDELINES:
- Aim for exactly ${params.wordCount} words (within 5% margin)
- Include no citations, references, or footnotes unless specifically requested
- Do not explain your process or include meta-commentary
- Write in a cohesive, flowing narrative style
- Focus on substantive intellectual content rather than rhetorical flourishes
- Structure the text with logical paragraphs and clear progression of ideas
- Avoid overused academic phrases and empty jargon`;

    // Create the OpenAI request
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: instructions
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.8, // Higher temperature for more creativity
    });

    // Extract the generated content
    const generatedContent = response.choices[0]?.message?.content || "";
    
    // Parse the title from the response
    let title = params.title; // Default to the topic-based title
    const titleMatch = generatedContent.match(/TITLE:\s*(.+?)(?:\n|$)/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }
    
    // Remove title prefix from content if present
    let text = generatedContent;
    if (titleMatch) {
      text = generatedContent.replace(/TITLE:\s*(.+?)(?:\n|$)/i, '').trim();
    }
    
    return {
      text,
      title
    };
  } catch (error) {
    console.error("Error generating text from natural language:", error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateMoreOriginalVersion(
  passage: PassageData,
  analysisResult: AnalysisResult,
  styleOption?: StyleOption,
  customInstructions?: string
): Promise<{
  originalPassage: PassageData;
  improvedPassage: PassageData;
  estimatedDerivativeIndex: number;
  improvementSummary: string;
}> {
  try {
    const passageTitle = passage.title || "Your Passage";
    
    // Extract key areas for improvement from the analysis
    const derivativeScore = analysisResult.derivativeIndex.passageA.score;
    const semanticDistance = analysisResult.semanticDistance.passageA.distance;
    const parasiteLevel = analysisResult.conceptualParasite.passageA.level;
    const parasiteElements = analysisResult.conceptualParasite.passageA.elements.join(", ");
    
    // Find low heat areas from the heatmap
    const lowHeatAreas = analysisResult.noveltyHeatmap.passageA
      .filter(item => item.heat < 60)
      .map(item => item.content)
      .join("\n- ");
    
    // Get the overall quality score - use the average of all available metrics
    const availableScores = [
      analysisResult.derivativeIndex.passageA.score
    ];
    
    // Only add coherence score if it exists
    if (analysisResult.coherence?.passageA?.score) {
      availableScores.push(analysisResult.coherence.passageA.score);
    }
    
    if (analysisResult.accuracy?.passageA?.score) {
      availableScores.push(analysisResult.accuracy.passageA.score);
    }
    
    if (analysisResult.depth?.passageA?.score) {
      availableScores.push(analysisResult.depth.passageA.score);
    }
    
    if (analysisResult.clarity?.passageA?.score) {
      availableScores.push(analysisResult.clarity.passageA.score);
    }
    
    const overallScore = availableScores.reduce((sum, score) => sum + score, 0) / availableScores.length;
    
    // Determine which improvement protocol to use based on overall score
    let improvementProtocol = "";
    
    if (overallScore >= 7) {
      // Protocol for high-quality passages (score over 7)
      improvementProtocol = `ENHANCEMENT PROTOCOL FOR HIGH-QUALITY PASSAGE:

Goal: Enrich this already strong passage by adding new, intellectually rigorous material while maintaining its clarity and coherence.

Focus on:
1. Incorporating SPECIFIC examples from other disciplines (mathematics, computer science, psychology, economics, ethics, biology, philosophy, etc.)
2. Exploring new angles or applications related to the original concept
3. Adding new examples that broaden the scope and deepen the conceptual engagement
4. Providing clear explanations of how each added example or new information DIRECTLY relates to the original ideas

Guidelines:
- Each example must be CONCRETE and SPECIFIC, not abstract or general
- Use real-world case studies, specific theories, or empirical data that directly engage with the concepts
- Examples should be BRIEFLY introduced (2-3 sentences maximum)
- Maintain the original style and voice`;
    } else if (overallScore >= 4) {
      // Protocol for average-quality passages (score 4-7)
      improvementProtocol = `TRANSFORMATION PROTOCOL FOR AVERAGE-QUALITY PASSAGE:

Goal: Transform this passage into a more original, intellectually rigorous contribution.

Focus on:
1. Identifying the most DERIVATIVE sections and replacing them with genuinely novel insights
2. Adding SPECIFIC examples or case studies that illustrate key points
3. Incorporating interdisciplinary connections to at least two other fields
4. Explaining WHY these connections matter and HOW they enhance understanding
5. Strengthening logical structure and argument coherence

Guidelines:
- Be concrete, not abstract
- Be specific, not general 
- Introduce counterintuitive elements that challenge standard interpretations
- Maintain the original style and voice
- Keep paragraph structure similar but improve content`;
    } else {
      // Protocol for low-quality passages (score under 4)
      improvementProtocol = `RECONSTRUCTION PROTOCOL FOR LOW-QUALITY PASSAGE:

Goal: Completely rebuild this passage into a genuinely original, intellectually rigorous contribution.

Focus on:
1. Creating a new thesis that goes BEYOND the original conception
2. Developing a NOVEL framework that incorporates elements from multiple disciplines
3. Presenting SPECIFIC examples and evidence to support key points
4. Establishing clear causal relationships and logical structure
5. Increasing conceptual depth and theoretical sophistication

Guidelines:
- Be concrete, not abstract
- Be specific, not general
- Introduce counterintuitive elements that challenge standard interpretations
- Maintain approximately similar length
- Keep general topic area consistent`;
    }
    
    // Add style preferences if provided
    let styleInstruction = "";
    if (styleOption) {
      switch (styleOption) {
        case 'keep-voice':
          styleInstruction = "Maintain the exact same style, voice, and tone as the original passage. This is extremely important.";
          break;
        case 'academic':
          styleInstruction = "Use an academic style with precise terminology, thorough explanations, and formal language suitable for scholarly publication.";
          break;
        case 'punchy':
          styleInstruction = "Use a punchy, engaging style with short sentences, vivid examples, and clear takeaways that would appeal to a mainstream audience.";
          break;
        case 'prioritize-originality':
          styleInstruction = "Prioritize originality over all other considerations, introducing the most innovative and thought-provoking concepts possible while maintaining readability.";
          break;
      }
    }
    
    // Determine whether to use custom instructions or the preset protocols
    let finalInstructions;
    let usedCustomInstructions = false;
    
    if (customInstructions && customInstructions.trim()) {
      // If custom instructions are provided, use them instead of the improvement protocol
      finalInstructions = `CUSTOM INSTRUCTIONS (OVERRIDE ALL DEFAULT PROTOCOLS):\n${customInstructions.trim()}\n\n`;
      usedCustomInstructions = true;
      console.log("Using custom rewriting instructions, overriding default protocols");
    } else {
      // Otherwise use the default improvement protocol
      finalInstructions = `${improvementProtocol}\n\n${styleInstruction}\n\n`;
      console.log("Using default improvement protocol");
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a world-class editor and writing coach specializing in improving the originality and intellectual rigor of academic and philosophical writing. Your task is to take a passage and transform it into a more original version based on specific protocols and analysis results.

When improving a passage, you:
1. Analyze the semantic content and conceptual framework
2. Identify derivative or unoriginal elements
3. Replace these with genuinely novel insights and connections
4. Maintain coherence and clarity throughout
5. Preserve the general topic area while enhancing originality

Your improved version should:
- Contain specific examples and evidence
- Make concrete interdisciplinary connections
- Provide novel perspectives on the subject matter
- Maintain readability and logical structure
- Increase the passage's derivative index score substantially

IMPORTANT: If the user provides custom instructions, you MUST follow them EXACTLY, ignoring all default protocols.`,
        },
        {
          role: "user",
          content: `Please improve the following passage to make it more conceptually original, intellectually rigorous, and semantically innovative.

PASSAGE TO IMPROVE:
Title: ${passageTitle}

${passage.text}

ANALYSIS RESULTS:
- Derivative Index: ${derivativeScore}/10
- Semantic Distance: ${semanticDistance}
- Conceptual Parasite Level: ${parasiteLevel}
- Parasite Elements: ${parasiteElements}

LESS ORIGINAL SECTIONS:
${lowHeatAreas || "All sections could use improvement for originality"}

${finalInstructions}

Please provide:
1. An improved version of the passage
2. An estimate of how much the derivative index would increase (0-10 scale)
3. A brief summary of the improvements made`,
        },
      ],
      max_tokens: 3000,
    });
    
    // Extract the response
    const responseText = response.choices[0]?.message?.content || "";
    
    console.log("Raw GPT response for passage improvement:", responseText.substring(0, 200) + "...");
    
    // Parse the different parts from the response
    const improvedPassageMatch = responseText.match(/IMPROVED PASSAGE:?\s*([\s\S]*?)(?=\n\s*ESTIMATED|$)/i);
    const estimatedScoreMatch = responseText.match(/ESTIMATED.*?SCORE:?\s*(\d+(?:\.\d+)?)/i);
    const summaryMatch = responseText.match(/(?:IMPROVEMENT SUMMARY|SUMMARY OF IMPROVEMENTS):?\s*([\s\S]*?)(?=\n\s*$|$)/i);
    
    // Look for alternative formats if the main regex didn't find anything
    let improvedText = "";
    
    if (improvedPassageMatch && improvedPassageMatch[1].trim().length > 0) {
      // Standard format found
      improvedText = improvedPassageMatch[1].trim();
    } else {
      // Try alternate formats - expanded to handle more model response patterns
      // Looking for title formats first
      const titleMatch = responseText.match(/(?:Title|#):\s*(.*?)(?:\n\n|\n)([\s\S]*?)(?=\n\s*ESTIMATED|IMPROVEMENT SUMMARY|SUMMARY|$)/i);
      // Looking for text starting with clear section indicators
      const altFormat1 = responseText.match(/(?:Here is the improved passage:|Here's the improved version:|Improved passage:|An improved version of the passage:|IMPROVED VERSION:)\s*([\s\S]*?)(?=\n\s*ESTIMATED|IMPROVEMENT SUMMARY|SUMMARY OF IMPROVEMENTS|$)/i);
      // Looking for numbered formats
      const altFormat2 = responseText.match(/(?:1\.\s*(?:An improved|Improved))\s*([\s\S]*?)(?=\n\s*2\.|ESTIMATED|$)/i);
      // Looking for text after instructions about what to do
      const altFormat3 = responseText.match(/(?:I'll provide|I will provide|I have|Here's|Following your instructions).*?\n\n([\s\S]*?)(?=\n\n\s*(?:Estimated|The estimated|Summary|Improvements|$))/i);
      
      // If we have a title format, use the content after the title
      if (titleMatch && titleMatch[2] && titleMatch[2].trim().length > 100) {
        improvedText = titleMatch[2].trim();
      }
      // Otherwise try other formats
      else if (altFormat1 && altFormat1[1].trim().length > 100) {
        improvedText = altFormat1[1].trim();
      } else if (altFormat2 && altFormat2[1].trim().length > 100) {
        improvedText = altFormat2[1].trim();
      } else if (altFormat3 && altFormat3[1].trim().length > 100) {
        improvedText = altFormat3[1].trim();
      } else {
        // As a last resort, just use the full response except for any obvious summary sections
        console.log("Using full response text as fallback");
        
        // Remove any summary sections from the end
        const fullText = responseText.split(/\n\s*(?:ESTIMATED|IMPROVEMENT SUMMARY|SUMMARY OF IMPROVEMENTS|2\.\s*Estimated|3\.\s*Summary)/i)[0];
        
        // Only use if it's reasonably long (at least 100 chars)
        if (fullText && fullText.trim().length > 100) {
          improvedText = fullText.trim();
        } else {
          // Generate an explicit error message that will be shown to the user
          console.error("Failed to extract improved passage from the AI response");
          throw new Error("The AI failed to generate a properly formatted improved passage. Please try again with different instructions.");
        }
      }
    }
    
    // Add a safety check to ensure we never return the original text unchanged
    // But allow for similarities in longer passages (>1000 chars)
    if (passage.text.length <= 1000 && 
        (improvedText === passage.text || improvedText.length < passage.text.length / 2)) {
      console.error("Improved passage matches original or is too short");
      throw new Error("The generated improved passage was too similar to the original. Please try again with different style options.");
    } else if (passage.text.length > 1000) {
      // For longer texts, only check if it's exactly the same
      if (improvedText === passage.text) {
        console.error("Improved passage exactly matches original");
        throw new Error("The generated improved passage was identical to the original. Please try again with different style options.");
      }
      // Otherwise accept it even if somewhat similar
      console.log("Long passage - accepting improvements even if somewhat similar to original");
    }
    
    // Get the estimated score, defaulting to original score + 2 (bounded by 10)
    const estimatedScore = estimatedScoreMatch 
      ? Math.min(10, parseFloat(estimatedScoreMatch[1])) 
      : Math.min(10, derivativeScore + 2);
      
    // Get the improvement summary
    const improvementSummary = summaryMatch 
      ? summaryMatch[1].trim() 
      : "This passage has been enhanced to improve originality while maintaining coherence and clarity.";
    
    return {
      originalPassage: passage,
      improvedPassage: {
        title: `Improved: ${passageTitle}`,
        text: improvedText
      },
      estimatedDerivativeIndex: estimatedScore,
      improvementSummary
    };
  } catch (error) {
    console.error("Error generating improved passage:", error);
    throw new Error(`Failed to generate improved passage: ${error instanceof Error ? error.message : String(error)}`);
  }
}
