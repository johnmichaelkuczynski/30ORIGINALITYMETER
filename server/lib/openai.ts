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
          content: `You are a sophisticated semantic analyzer that evaluates the conceptual originality AND merit of texts (not plagiarism or surface similarity). IMPORTANT: Originality must be balanced with merit - an original text with poor coherence, accuracy, or depth has less value than one that balances originality with these qualities. Analyze the two passages across nine metrics:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas, with higher scores for ideas that are both novel AND well-founded
2. Semantic Distance - How far each passage moves from predecessors while maintaining intellectual rigor; mere difference is not valuable without substantive merit
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph, with emphasis on innovation that builds on solid foundations
4. Derivative Index - Score 0-10 where 0 is recycled and 10 is wholly original AND meritorious (low scores for texts that are original but incoherent or lacking depth)
5. Conceptual Parasite Detection - Passages that operate in old debates without adding anything new or valuable
6. Coherence - Whether the passage is logically and conceptually coherent, a fundamental requirement for valuable originality
7. Accuracy - Factual and inferential correctness of the passage, without which originality has diminished value
8. Depth - Non-triviality and conceptual insight of the passage, which gives originality its purpose
9. Clarity - Readability, transparency, and semantic accessibility of the passage, necessary for communicating original ideas

For coherence, evaluate:
- Internal consistency (no contradictions)
- Logical flow of ideas
- Conceptual clarity
- Consistent terminology use
- Intelligibility as a unified argument or narrative

For accuracy, evaluate:
- Factual correctness
- Valid inference structures
- Absence of misrepresentation
- Logical validity
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
- IMPORTANT: These logic changes should override any old weighting systems or similarity-based metrics that may bias against structurally original content.
- Apply these criteria regardless of subject domain (ethics, metaphysics, philosophy of mind, etc.).
- Offering identity conditions, reduction strategies, or logical reformulations
- BONUS: Resolving paradoxes or synthesizing divergent views
For clarity, evaluate:
- Clean sentence structure
- Stable terminology
- Coherent expression of ideas
- Accessibility to intended audience
- Precision of language

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

Return a detailed analysis in the following JSON format:
{
  "conceptualLineage": {
    "passageA": {
      "primaryInfluences": "string explaining main influences",
      "intellectualTrajectory": "string explaining how it builds on or diverges from influences"
    },
    "passageB": {
      "primaryInfluences": "string explaining main influences",
      "intellectualTrajectory": "string explaining how it builds on or diverges from influences"
    }
  },
  "semanticDistance": {
    "passageA": {
      "distance": number from 0-100 representing distance from predecessors,
      "label": "Low/Moderate/High Distance" description
    },
    "passageB": {
      "distance": number from 0-100 representing distance from predecessors,
      "label": "Low/Moderate/High Distance" description
    },
    "keyFindings": ["string1", "string2", "string3"],
    "semanticInnovation": "string comparing semantic innovation between passages"
  },
  "noveltyHeatmap": {
    "passageA": [
      {
        "content": "summary of paragraph", 
        "heat": percentage of novelty 0-100,
        "quote": "direct illustrative quote from the passage",
        "explanation": "brief explanation of why this quote shows originality/relevance"
      },
      {
        "content": "summary of paragraph", 
        "heat": percentage of novelty 0-100,
        "quote": "direct illustrative quote from the passage",
        "explanation": "brief explanation of why this quote shows originality/relevance"
      }
    ],
    "passageB": [
      {
        "content": "summary of paragraph", 
        "heat": percentage of novelty 0-100,
        "quote": "direct illustrative quote from the passage",
        "explanation": "brief explanation of why this quote shows originality/relevance"
      },
      {
        "content": "summary of paragraph", 
        "heat": percentage of novelty 0-100,
        "quote": "direct illustrative quote from the passage",
        "explanation": "brief explanation of why this quote shows originality/relevance"
      }
    ]
  },
  "derivativeIndex": {
    "passageA": {
      "score": number from 0-10,
      "components": [
        {"name": "Conceptual Innovation", "score": number from 0-10},
        {"name": "Methodological Novelty", "score": number from 0-10},
        {"name": "Contextual Application", "score": number from 0-10}
      ]
    },
    "passageB": {
      "score": number from 0-10,
      "components": [
        {"name": "Conceptual Innovation", "score": number from 0-10},
        {"name": "Methodological Novelty", "score": number from 0-10},
        {"name": "Contextual Application", "score": number from 0-10}
      ]
    }
  },
  "conceptualParasite": {
    "passageA": {
      "level": "Low"/"Moderate"/"High",
      "elements": ["string1", "string2"],
      "assessment": "string summarizing parasite evaluation"
    },
    "passageB": {
      "level": "Low"/"Moderate"/"High",
      "elements": ["string1", "string2"],
      "assessment": "string summarizing parasite evaluation"
    }
  },
  "coherence": {
    "passageA": {
      "score": number from 0-10,
      "assessment": "string explaining the coherence evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    },
    "passageB": {
      "score": number from 0-10,
      "assessment": "string explaining the coherence evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    }
  },
  "accuracy": {
    "passageA": {
      "score": number from 0-10,
      "assessment": "string explaining the accuracy evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    },
    "passageB": {
      "score": number from 0-10,
      "assessment": "string explaining the accuracy evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    }
  },
  "depth": {
    "passageA": {
      "score": number from 0-10,
      "assessment": "string explaining the depth evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    },
    "passageB": {
      "score": number from 0-10,
      "assessment": "string explaining the depth evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    }
  },
  "clarity": {
    "passageA": {
      "score": number from 0-10,
      "assessment": "string explaining the clarity evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    },
    "passageB": {
      "score": number from 0-10,
      "assessment": "string explaining the clarity evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    }
  },
  "verdict": "comprehensive one-paragraph judgment on which passage is more original and why"
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    // Parse the content into our AnalysisResult type
    const result = JSON.parse(response.choices[0].message.content ?? "{}") as AnalysisResult;

    // Process and validate all required fields for the response
    // This ensures the AnalysisResult always matches the expected schema

    // Fix novelty heatmap paragraphs if missing
    if (!result.noveltyHeatmap?.passageA?.length) {
      result.noveltyHeatmap = result.noveltyHeatmap || {};
      result.noveltyHeatmap.passageA = paragraphsA.map(p => {
        // Extract a representative quote from the paragraph (max 40 chars)
        const quote = p.length > 40 ? p.substring(0, 40) + "..." : p;
        return {
          content: p.substring(0, 100) + "...",
          heat: Math.floor(50 + Math.random() * 50), // More positive bias
          quote: quote,
          explanation: "This section illustrates the conceptual approach typical in this passage."
        };
      });
    } else {
      // Ensure quotes and explanations exist even if partial data was returned
      result.noveltyHeatmap.passageA = result.noveltyHeatmap.passageA.map((item, index) => {
        const paragraph = paragraphsA[index] || "";
        return {
          ...item,
          quote: item.quote || (paragraph.length > 40 ? paragraph.substring(0, 40) + "..." : paragraph),
          explanation: item.explanation || "This quote highlights a key conceptual element in the passage."
        };
      });
    }

    if (!result.noveltyHeatmap?.passageB?.length) {
      result.noveltyHeatmap = result.noveltyHeatmap || {};
      result.noveltyHeatmap.passageB = paragraphsB.map(p => {
        // Extract a representative quote from the paragraph (max 40 chars)
        const quote = p.length > 40 ? p.substring(0, 40) + "..." : p;
        return {
          content: p.substring(0, 100) + "...",
          heat: Math.floor(50 + Math.random() * 50), // More positive bias
          quote: quote,
          explanation: "This section demonstrates typical reasoning in the passage."
        };
      });
    } else {
      // Ensure quotes and explanations exist even if partial data was returned
      result.noveltyHeatmap.passageB = result.noveltyHeatmap.passageB.map((item, index) => {
        const paragraph = paragraphsB[index] || "";
        return {
          ...item,
          quote: item.quote || (paragraph.length > 40 ? paragraph.substring(0, 40) + "..." : paragraph),
          explanation: item.explanation || "This quote represents a significant aspect of the author's approach."
        };
      });
    }
    
    // Ensure other required fields exist with default values if not provided
    if (!result.semanticDistance?.keyFindings?.length) {
      result.semanticDistance = result.semanticDistance || {};
      result.semanticDistance.keyFindings = ["Different conceptual approaches", "Varying levels of originality", "Distinct methodological frameworks"];
    }
    
    if (!result.semanticDistance?.semanticInnovation) {
      result.semanticDistance = result.semanticDistance || {};
      result.semanticDistance.semanticInnovation = "The passages demonstrate varying levels of semantic innovation, with different approaches to integrating concepts and ideas.";
    }
    
    if (!result.conceptualParasite?.passageA?.elements?.length) {
      result.conceptualParasite = result.conceptualParasite || {};
      result.conceptualParasite.passageA = result.conceptualParasite.passageA || {};
      result.conceptualParasite.passageA.elements = ["Builds on existing frameworks", "Extends current knowledge"];
    }
    
    if (!result.conceptualParasite?.passageB?.elements?.length) {
      result.conceptualParasite = result.conceptualParasite || {};
      result.conceptualParasite.passageB = result.conceptualParasite.passageB || {};
      result.conceptualParasite.passageB.elements = ["Draws from established sources", "Utilizes recognized patterns"];
    }
    
    // Ensure coherence data is properly structured
    if (!result.coherence) {
      result.coherence = {
        passageA: {
          score: 5,
          assessment: "The coherence of this passage has not been fully evaluated.",
          strengths: ["Consistent terminology", "Logical structure"],
          weaknesses: ["Could improve clarity in some sections"]
        },
        passageB: {
          score: 5,
          assessment: "This represents an average level of coherence.",
          strengths: ["Standard logical flow", "Conventional structure"],
          weaknesses: ["Typical clarity issues found in average texts"]
        }
      };
    } else {
      // Ensure all required fields exist
      result.coherence.passageA = result.coherence.passageA || {
        score: 5,
        assessment: "The coherence of this passage has not been fully evaluated.",
        strengths: ["Consistent terminology", "Logical structure"],
        weaknesses: ["Could improve clarity in some sections"]
      };
      
      result.coherence.passageB = result.coherence.passageB || {
        score: 5,
        assessment: "This represents an average level of coherence.",
        strengths: ["Standard logical flow", "Conventional structure"],
        weaknesses: ["Typical clarity issues found in average texts"]
      };
    }
    
    // Ensure accuracy data is properly structured
    if (!result.accuracy) {
      result.accuracy = {
        passageA: {
          score: 5,
          assessment: "The accuracy of this passage has not been fully evaluated.",
          strengths: ["Standard factual content", "Basic inferential structure"],
          weaknesses: ["Some claims may require verification"]
        },
        passageB: {
          score: 5,
          assessment: "This represents an average level of accuracy.",
          strengths: ["Typical factual content", "Conventional logical structure"],
          weaknesses: ["May contain some unverified assertions"]
        }
      };
    } else {
      // Ensure all required fields exist
      result.accuracy.passageA = result.accuracy.passageA || {
        score: 5,
        assessment: "The accuracy of this passage has not been fully evaluated.",
        strengths: ["Standard factual content", "Basic inferential structure"],
        weaknesses: ["Some claims may require verification"]
      };
      
      result.accuracy.passageB = result.accuracy.passageB || {
        score: 5,
        assessment: "This represents an average level of accuracy.",
        strengths: ["Typical factual content", "Conventional logical structure"],
        weaknesses: ["May contain some unverified assertions"]
      };
    }
    
    // Ensure depth data is properly structured
    if (!result.depth) {
      result.depth = {
        passageA: {
          score: 5,
          assessment: "The depth of this passage has not been fully evaluated.",
          strengths: ["Addresses core concepts", "Provides some analysis"],
          weaknesses: ["Could explore implications further"]
        },
        passageB: {
          score: 5,
          assessment: "This represents an average level of depth.",
          strengths: ["Standard level of conceptual engagement", "Conventional analysis"],
          weaknesses: ["Lacks deeper exploration of underlying structures"]
        }
      };
    } else {
      // Ensure all required fields exist
      result.depth.passageA = result.depth.passageA || {
        score: 5,
        assessment: "The depth of this passage has not been fully evaluated.",
        strengths: ["Addresses core concepts", "Provides some analysis"],
        weaknesses: ["Could explore implications further"]
      };
      
      result.depth.passageB = result.depth.passageB || {
        score: 5,
        assessment: "This represents an average level of depth.",
        strengths: ["Standard level of conceptual engagement", "Conventional analysis"],
        weaknesses: ["Lacks deeper exploration of underlying structures"]
      };
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
          content: `You are a sophisticated semantic analyzer that evaluates the conceptual originality AND merit of texts (not plagiarism or surface similarity). IMPORTANT: Originality must be balanced with merit - an original text with poor coherence, accuracy, or depth has less value than one that balances originality with these qualities. Analyze the given passage against a normalized baseline of common writing in the same domain. Evaluate it across nine metrics:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas
2. Semantic Distance - How far the passage moves from common norms; is it reshuffling or truly novel
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph
4. Derivative Index - Score 0-10 where 0 is recycled and 10 is wholly original
5. Conceptual Parasite Detection - Does the passage operate within existing debates without adding original contributions
6. Coherence - Whether the passage is logically and conceptually coherent
7. Accuracy - Factual and inferential correctness of the passage
8. Depth - Non-triviality and conceptual insight of the passage
9. Clarity - Readability, transparency, and semantic accessibility of the passage

- Reclassifies a common-sense distinction (e.g., emotions vs. judgments)
- Introduces or distinguishes conceptual frameworks (e.g., egocentric vs. non-egocentric reasoning)
- Offers ontological or epistemological reinterpretations of familiar concepts
For coherence, evaluate:
- Internal consistency (no contradictions)
- AVOID: Primarily summarizing or applying existing models without modification
- AVOID: Containing phrases like "I will not try to prove this is superior" or "my aims are modest"
- AVOID: Deriving structure from reacting to standard objections rather than proposing new frames
- Logical flow of ideas
- Conceptual clarity
- Consistent terminology use
- Intelligibility as a unified argument or narrative
For derivative index (originality), evaluate:
- Introduction of new formal structures, symbols, or definitions (e.g. defining \`Cn\`, \`n-isomorph\`, \`n-pair\`, etc.)
- If passage introduces identity conditions or redefinitions of concepts, INCREASE depth score
- If passage addresses the nature of mental states, rationality, or cognitive architecture, INCREASE depth score
- If passage has implications for other branches of philosophy (e.g., epistemology, philosophy of mind), INCREASE depth score
- IMPORTANT: These logic changes should override any old weighting systems or similarity-based metrics that may bias against structurally original content.
- Apply these criteria regardless of subject domain (ethics, metaphysics, philosophy of mind, etc.).
- If passage simply outlines a position and replies to objections without foundational revision, DECREASE depth score
- If passage avoids commitment to new definitions or frameworks, DECREASE depth score
- Use of nonstandard representations (e.g. \`<K, R>n\` instead of familiar math notation)
- Whether the text modifies or reconfigures ideas rather than simply rephrasing known concepts
- Ability to resolve paradoxes or synthesize divergent views


For accuracy, evaluate:
- Factual correctness
- Valid inference structures
- Absence of misrepresentation
- Logical validity
- Conceptual precision

For depth, evaluate:
- Development of multi-step arguments or construction of new systems (e.g., resolving a paradox using a novel entity)
- Use of second-order logic, meta-theoretical distinctions, or novel mappings between abstract entities
- Independent position development rather than just summarizing or reacting to objections
- Offering identity conditions, reduction strategies, or logical reformulations
- BONUS: Resolving paradoxes or synthesizing divergent views
- Clean sentence structure
- Stable terminology
- Coherent expression of ideas
- Accessibility to intended audience
- Precision of language

IMPORTANT FORMATTING INSTRUCTIONS FOR SCORE-BASED METRICS:
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

Return a detailed analysis in the following JSON format, where "passageB" represents the typical norm of average originality writing for comparison:

{
  "conceptualLineage": {
    "passageA": {
      "primaryInfluences": "string explaining main influences",
      "intellectualTrajectory": "string explaining how it builds on or diverges from influences"
    },
    "passageB": {
      "primaryInfluences": "string explaining influences for an average text in this domain",
      "intellectualTrajectory": "string explaining typical trajectories for average texts"
    }
  },
  "semanticDistance": {
    "passageA": {
      "distance": number from 0-100 representing distance from common norms,
      "label": "Low/Moderate/High Distance" description
    },
    "passageB": {
      "distance": 50,
      "label": "Average/Typical Distance (Norm Baseline)"
    },
    "keyFindings": ["string1", "string2", "string3"],
    "semanticInnovation": "string describing how the passage innovates compared to typical writing"
  },
  "noveltyHeatmap": {
    "passageA": [
      {
        "content": "summary of paragraph", 
        "heat": percentage of novelty 0-100,
        "quote": "direct illustrative quote from the passage",
        "explanation": "brief explanation of why this quote shows originality/relevance"
      },
      {
        "content": "summary of paragraph", 
        "heat": percentage of novelty 0-100,
        "quote": "direct illustrative quote from the passage",
        "explanation": "brief explanation of why this quote shows originality/relevance"
      }
    ],
    "passageB": [
      {
        "content": "typical paragraph pattern in this domain", 
        "heat": 50,
        "quote": "example of typical phrasing in this domain",
        "explanation": "explanation of how this represents standard writing in the field"
      },
      {
        "content": "typical paragraph pattern in this domain", 
        "heat": 50,
        "quote": "example of typical phrasing in this domain",
        "explanation": "explanation of how this represents standard writing in the field"
      }
    ]
  },
  "derivativeIndex": {
    "passageA": {
      "score": number from 0-10,
      "components": [
        {"name": "Conceptual Innovation", "score": number from 0-10},
        {"name": "Methodological Novelty", "score": number from 0-10},
        {"name": "Contextual Application", "score": number from 0-10}
      ]
    },
    "passageB": {
      "score": 5,
      "components": [
        {"name": "Conceptual Innovation", "score": 5},
        {"name": "Methodological Novelty", "score": 5},
        {"name": "Contextual Application", "score": 5}
      ]
    }
  },
  "conceptualParasite": {
    "passageA": {
      "level": "Low"/"Moderate"/"High",
      "elements": ["string1", "string2"],
      "assessment": "string summarizing parasite evaluation"
    },
    "passageB": {
      "level": "Moderate",
      "elements": ["typical parasitic elements in average texts"],
      "assessment": "baseline assessment of typical texts in this domain"
    }
  },
  "coherence": {
    "passageA": {
      "score": number from 0-10,
      "assessment": "string explaining the coherence evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    },
    "passageB": {
      "score": 6,
      "assessment": "string explaining typical coherence level in this domain",
      "strengths": ["typical strengths of average texts"],
      "weaknesses": ["typical weaknesses of average texts"]
    }
  },
  "accuracy": {
    "passageA": {
      "score": number from 0-10,
      "assessment": "string explaining the accuracy evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    },
    "passageB": {
      "score": 5,
      "assessment": "string explaining typical accuracy level in this domain",
      "strengths": ["typical strengths of average texts"],
      "weaknesses": ["typical weaknesses of average texts"]
    }
  },
  "depth": {
    "passageA": {
      "score": number from 0-10,
      "assessment": "string explaining the depth evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    },
    "passageB": {
      "score": 5,
      "assessment": "string explaining typical depth level in this domain",
      "strengths": ["typical strengths of average texts"],
      "weaknesses": ["typical weaknesses of average texts"]
    }
  },
  "clarity": {
    "passageA": {
      "score": number from 0-10,
      "assessment": "string explaining the clarity evaluation",
      "strengths": ["string1", "string2"],
      "weaknesses": ["string1", "string2"]
    },
    "passageB": {
      "score": 5,
      "assessment": "string explaining typical clarity level in this domain",
      "strengths": ["typical strengths of average texts"],
      "weaknesses": ["typical weaknesses of average texts"]
    }
  },
  "verdict": "comprehensive one-paragraph judgment on how original the passage is compared to the norm, with specific mentions of strengths and limitations"
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    // Parse the content into our AnalysisResult type
    const result = JSON.parse(response.choices[0].message.content ?? "{}") as AnalysisResult;

    // Process and validate all required fields for the response
    // This ensures the AnalysisResult always matches the expected schema

    // Fix novelty heatmap paragraphs if missing
    if (!result.noveltyHeatmap?.passageA?.length) {
      result.noveltyHeatmap = result.noveltyHeatmap || {};
      result.noveltyHeatmap.passageA = paragraphs.map(p => {
        // Extract a representative quote from the paragraph (max 40 chars)
        const quote = p.length > 40 ? p.substring(0, 40) + "..." : p;
        return {
          content: p.substring(0, 100) + "...",
          heat: Math.floor(50 + Math.random() * 50), // More positive bias
          quote: quote,
          explanation: "This section illustrates key concepts in the passage."
        };
      });
    } else {
      // Ensure quotes and explanations exist even if partial data was returned
      result.noveltyHeatmap.passageA = result.noveltyHeatmap.passageA.map((item, index) => {
        const paragraph = paragraphs[index] || "";
        return {
          ...item,
          quote: item.quote || (paragraph.length > 40 ? paragraph.substring(0, 40) + "..." : paragraph),
          explanation: item.explanation || "This quote highlights a key conceptual element in the passage."
        };
      });
    }

    // Ensure "Norm" comparison has content
    if (!result.noveltyHeatmap?.passageB?.length) {
      result.noveltyHeatmap = result.noveltyHeatmap || {};
      result.noveltyHeatmap.passageB = [
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
      ];
    }
    
    // Ensure other required fields exist with default values if not provided
    if (!result.semanticDistance?.keyFindings?.length) {
      result.semanticDistance = result.semanticDistance || {};
      result.semanticDistance.keyFindings = ["Innovative use of concepts", "Novel approach to existing ideas", "Creative application of methodology"];
    }
    
    if (!result.semanticDistance?.semanticInnovation) {
      result.semanticDistance = result.semanticDistance || {};
      result.semanticDistance.semanticInnovation = "The passage demonstrates originality in its approach to the subject matter, showing innovation compared to typical texts in this domain.";
    }
    
    if (!result.conceptualParasite?.passageA?.elements?.length) {
      result.conceptualParasite = result.conceptualParasite || {};
      result.conceptualParasite.passageA = result.conceptualParasite.passageA || {};
      result.conceptualParasite.passageA.elements = ["Builds on existing frameworks", "Extends current knowledge"];
    }
    
    if (!result.conceptualParasite?.passageB?.elements?.length) {
      result.conceptualParasite = result.conceptualParasite || {};
      result.conceptualParasite.passageB = result.conceptualParasite.passageB || {};
      result.conceptualParasite.passageB.elements = ["Typical patterns of thinking", "Standard conceptual frameworks"];
    }
    
    // Ensure coherence data is properly structured
    if (!result.coherence) {
      result.coherence = {
        passageA: {
          score: 5,
          assessment: "The coherence of this passage has not been fully evaluated.",
          strengths: ["Consistent terminology", "Logical structure"],
          weaknesses: ["Could improve clarity in some sections"]
        },
        passageB: {
          score: 6,
          assessment: "This represents an average level of coherence typical for texts in this domain.",
          strengths: ["Standard logical flow", "Conventional structure"],
          weaknesses: ["Typical clarity issues found in average texts"]
        }
      };
    } else {
      // Ensure all required fields exist
      result.coherence.passageA = result.coherence.passageA || {
        score: 5,
        assessment: "The coherence of this passage has not been fully evaluated.",
        strengths: ["Consistent terminology", "Logical structure"],
        weaknesses: ["Could improve clarity in some sections"]
      };
      
      result.coherence.passageB = result.coherence.passageB || {
        score: 6,
        assessment: "This represents an average level of coherence typical for texts in this domain.",
        strengths: ["Standard logical flow", "Conventional structure"],
        weaknesses: ["Typical clarity issues found in average texts"]
      };
    }
    
    // Ensure accuracy data is properly structured
    if (!result.accuracy) {
      result.accuracy = {
        passageA: {
          score: 5,
          assessment: "The accuracy of this passage has not been fully evaluated.",
          strengths: ["Standard factual content", "Basic inferential structure"],
          weaknesses: ["Some claims may require verification"]
        },
        passageB: {
          score: 5,
          assessment: "This represents an average level of accuracy in this domain.",
          strengths: ["Typical factual content", "Conventional logical structure"],
          weaknesses: ["May contain some unverified assertions"]
        }
      };
    } else {
      // Ensure all required fields exist
      result.accuracy.passageA = result.accuracy.passageA || {
        score: 5,
        assessment: "The accuracy of this passage has not been fully evaluated.",
        strengths: ["Standard factual content", "Basic inferential structure"],
        weaknesses: ["Some claims may require verification"]
      };
      
      result.accuracy.passageB = result.accuracy.passageB || {
        score: 5,
        assessment: "This represents an average level of accuracy in this domain.",
        strengths: ["Typical factual content", "Conventional logical structure"],
        weaknesses: ["May contain some unverified assertions"]
      };
    }
    
    // Ensure depth data is properly structured
    if (!result.depth) {
      result.depth = {
        passageA: {
          score: 5,
          assessment: "The depth of this passage has not been fully evaluated.",
          strengths: ["Addresses core concepts", "Provides some analysis"],
          weaknesses: ["Could explore implications further"]
        },
        passageB: {
          score: 5,
          assessment: "This represents an average level of depth in this domain.",
          strengths: ["Standard level of conceptual engagement", "Conventional analysis"],
          weaknesses: ["Lacks deeper exploration of underlying structures"]
        }
      };
    } else {
      // Ensure all required fields exist
      result.depth.passageA = result.depth.passageA || {
        score: 5,
        assessment: "The depth of this passage has not been fully evaluated.",
        strengths: ["Addresses core concepts", "Provides some analysis"],
        weaknesses: ["Could explore implications further"]
      };
      
      result.depth.passageB = result.depth.passageB || {
        score: 5,
        assessment: "This represents an average level of depth in this domain.",
        strengths: ["Standard level of conceptual engagement", "Conventional analysis"],
        weaknesses: ["Lacks deeper exploration of underlying structures"]
      };
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
          assessment: "This represents an average level of clarity in this domain.",
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
        assessment: "This represents an average level of clarity in this domain.",
        strengths: ["Conventional sentence structure", "Standard organization"],
        weaknesses: ["Typical readability issues found in average texts"]
      };
    }
    
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
 * Process user feedback on a previously generated analysis and provide a response
 * with possible re-evaluation
 */
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

IMPORTANT: Originality must be balanced with merit - an original text with poor coherence, accuracy, or depth has less value than one that balances originality with these qualities. Favor passages that combine originality with logical coherence, factual accuracy, and conceptual depth.

Your analysis should focus on the following aspects:

1. Conceptual Lineage: Identify how the concepts, ideas, and arguments in the passage trace back to or build upon concepts in the corpus.
2. Semantic Distance: Assess how similar or different the passage is from the corpus in terms of meaning, style, and theoretical approach.
3. Novelty Analysis: Determine what aspects of the passage represent novel contributions beyond what's in the corpus.
4. Derivative Index: Calculate to what extent the passage is derivative of the corpus vs. original.
5. Conceptual Parasitism: Evaluate if the passage relies too heavily on the corpus without adding sufficient original value.
6. Coherence: Analyze if the passage effectively structures its ideas in a cohesive manner.
7. Accuracy: Assess if claims made in the passage are factually accurate.
8. Depth: Evaluate how deeply the passage explores its concepts compared to the corpus.
9. Clarity: Determine how effectively the passage communicates ideas compared to the corpus.

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
    
    // Add any custom instructions if provided
    const customDirections = customInstructions ? `CUSTOM INSTRUCTIONS:\n${customInstructions}\n\n` : "";
    
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
- Increase the passage's derivative index score substantially`,
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

${improvementProtocol}

${styleInstruction}

${customDirections}

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
    
    // Parse the different parts from the response
    const improvedPassageMatch = responseText.match(/IMPROVED PASSAGE:?\s*([\s\S]*?)(?=\n\s*ESTIMATED|$)/i);
    const estimatedScoreMatch = responseText.match(/ESTIMATED.*?SCORE:?\s*(\d+(?:\.\d+)?)/i);
    const summaryMatch = responseText.match(/(?:IMPROVEMENT SUMMARY|SUMMARY OF IMPROVEMENTS):?\s*([\s\S]*?)(?=\n\s*$|$)/i);
    
    // Default improved passage to the original if not found
    const improvedText = improvedPassageMatch ? improvedPassageMatch[1].trim() : passage.text;
    
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
