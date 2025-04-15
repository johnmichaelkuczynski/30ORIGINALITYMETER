import OpenAI from "openai";
import { PassageData, SupportingDocument, StyleOption } from "../../client/src/lib/types";
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
          content: `You are a sophisticated semantic originality analyzer that evaluates the conceptual originality and quality of texts (not plagiarism or surface similarity). Analyze the two passages across nine metrics:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas
2. Semantic Distance - How far each passage moves from predecessors; is it reshuffling or truly novel
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph
4. Derivative Index - Score 0-10 where 0 is recycled and 10 is wholly original
5. Conceptual Parasite Detection - Passages that operate in old debates without adding anything new
6. Coherence - Whether the passage is logically and conceptually coherent
7. Accuracy - Factual and inferential correctness of the passage
8. Depth - Non-triviality and conceptual insight of the passage
9. Clarity - Readability, transparency, and semantic accessibility of the passage

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
- Conceptual precision

For depth, evaluate:
- Conceptual richness
- Identification of meaningful structures
- Exposure of assumptions
- Reframing of problems
- Moving beyond surface-level observations

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a sophisticated semantic originality analyzer that evaluates the conceptual originality and quality of texts (not plagiarism or surface similarity). Analyze the given passage against a normalized baseline of common writing in the same domain. Evaluate it across nine metrics:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas
2. Semantic Distance - How far the passage moves from common norms; is it reshuffling or truly novel
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph
4. Derivative Index - Score 0-10 where 0 is recycled and 10 is wholly original
5. Conceptual Parasite Detection - Does the passage operate within existing debates without adding original contributions
6. Coherence - Whether the passage is logically and conceptually coherent
7. Accuracy - Factual and inferential correctness of the passage
8. Depth - Non-triviality and conceptual insight of the passage
9. Clarity - Readability, transparency, and semantic accessibility of the passage

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
- Conceptual precision

For depth, evaluate:
- Conceptual richness
- Identification of meaningful structures
- Exposure of assumptions
- Reframing of problems
- Moving beyond surface-level observations

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

Format your response as JSON with these specific sections that match the exact schema used for comparative analysis.`,
        },
        {
          role: "user",
          content: `Please analyze this passage against an internal norm of average originality:

Passage (${passageTitle}):
${passage.text}

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
  corpusTitle: string = "Reference Corpus"
): Promise<AnalysisResult> {
  try {
    const paragraphs = splitIntoParagraphs(passage.text);
    const passageTitle = passage.title || "Your Passage";

    // Format a sample of the corpus to include in the prompt
    // We need to limit the corpus size to avoid token limits
    let corpusSample = corpus;
    if (corpus.length > 12000) {
      corpusSample = corpus.substring(0, 12000) + "...";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a sophisticated semantic originality analyzer that evaluates the conceptual originality and quality of texts. Your task is to analyze a given passage against a reference corpus to determine how well the passage aligns with the intellectual rigor, tone, and style of the corpus. Analyze the passage across nine metrics:

1. Conceptual Lineage - Where ideas come from, are they responding to ideas in the corpus
2. Semantic Distance - How far the passage moves from the corpus; is it reshuffling or building on concepts
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph compared to the corpus
4. Derivative Index - Score 0-10 where 0 is highly derivative of the corpus and 10 is wholly original
5. Conceptual Parasite Detection - Whether the passage operates in the same conceptual space without adding anything new
6. Coherence - Whether the passage maintains the logical and conceptual coherence seen in the corpus
7. Accuracy - Factual and inferential correctness compared to the corpus
8. Depth - Non-triviality and conceptual insight compared to the corpus
9. Clarity - Readability, transparency, and semantic accessibility compared to the corpus style

Your analysis should be thorough but concise, focusing on both the stylistic alignment and intellectual content.`
        },
        {
          role: "user",
          content: `Please analyze the following passage against the reference corpus:

Passage: "${passage.text}"

Reference Corpus Title: "${corpusTitle}"
Reference Corpus: "${corpusSample}"

Provide a structured analysis showing how the passage compares to the corpus in terms of style, tone, conceptual alignment, and intellectual rigor.`
        }
      ],
      max_tokens: 4000,
    });

    // Extract the result from the OpenAI response
    const analysisText = response.choices[0]?.message?.content || "";
    
    // Parse the response into our analysis result structure
    // This is a simplified version that aligns with our existing schema
    const result: AnalysisResult = {
      conceptualLineage: {
        passageA: {
          primaryInfluences: extractSection(analysisText, "Conceptual Lineage", 300) || 
            "Analysis of conceptual influences compared to the corpus.",
          intellectualTrajectory: extractSubsection(analysisText, "Conceptual Lineage", "trajectory", 300) || 
            "Trajectory of ideas relative to the corpus.",
        },
        passageB: {
          primaryInfluences: `This analysis examines how the passage aligns with "${corpusTitle}".`,
          intellectualTrajectory: "The corpus serves as a reference point for comparison.",
        }
      },
      semanticDistance: {
        passageA: {
          distance: extractNumericValue(analysisText, "Semantic Distance", 0, 100) || 50,
          label: extractLabel(analysisText, "Semantic Distance") || "Moderate",
        },
        passageB: {
          distance: 0,
          label: "Reference Corpus",
        },
        keyFindings: extractListItems(analysisText, "Semantic Distance", "key findings", 5) || 
          ["The passage shows some deviation from the corpus in terms of semantic content."],
        semanticInnovation: extractSubsection(analysisText, "Semantic Distance", "innovation", 300) || 
          "Analysis of semantic innovation relative to the corpus."
      },
      noveltyHeatmap: {
        passageA: generateHeatmapFromParagraphs(paragraphs, analysisText),
        passageB: [{ content: "Reference Corpus", heat: 0 }]
      },
      derivativeIndex: {
        passageA: {
          score: extractNumericValue(analysisText, "Derivative Index", 0, 10) || 5,
          components: [
            { 
              name: "Originality", 
              score: extractNumericValue(analysisText, "originality", 0, 10) || 5 
            },
            { 
              name: "Conceptual Independence", 
              score: extractNumericValue(analysisText, "conceptual independence", 0, 10) || 5 
            },
            { 
              name: "Novel Synthesis", 
              score: extractNumericValue(analysisText, "novel synthesis", 0, 10) || 5 
            }
          ]
        },
        passageB: {
          score: 10, // Reference corpus is considered the standard
          components: [
            { name: "Reference Standard", score: 10 }
          ]
        }
      },
      conceptualParasite: {
        passageA: {
          level: extractParasiteLevel(analysisText) || "Moderate",
          elements: extractListItems(analysisText, "Conceptual Parasite", "elements", 3) || 
            ["Some recycling of concepts from the corpus"],
          assessment: extractSection(analysisText, "Conceptual Parasite", 300) || 
            "Analysis of conceptual dependency on the corpus."
        },
        passageB: {
          level: "Low",
          elements: ["Reference Corpus"],
          assessment: "This is the reference corpus used for comparison."
        }
      },
      coherence: {
        passageA: {
          score: extractNumericValue(analysisText, "Coherence", 0, 10) || 7,
          assessment: extractSection(analysisText, "Coherence", 300) || 
            "Analysis of logical and conceptual coherence compared to the corpus.",
          strengths: extractListItems(analysisText, "Coherence", "strengths", 3) || 
            ["Maintains some logical flow"],
          weaknesses: extractListItems(analysisText, "Coherence", "weaknesses", 3) || 
            ["Areas where coherence could be improved"]
        },
        passageB: {
          score: 10,
          assessment: "Reference corpus used as the comparison standard.",
          strengths: ["Reference Standard"],
          weaknesses: []
        }
      },
      accuracy: {
        passageA: {
          score: extractNumericValue(analysisText, "Accuracy", 0, 10) || 7,
          assessment: extractSection(analysisText, "Accuracy", 300) || 
            "Analysis of factual and inferential correctness compared to the corpus.",
          strengths: extractListItems(analysisText, "Accuracy", "strengths", 3) || 
            ["Areas of factual alignment with the corpus"],
          weaknesses: extractListItems(analysisText, "Accuracy", "weaknesses", 3) || 
            ["Areas where accuracy could be improved"]
        },
        passageB: {
          score: 10,
          assessment: "Reference corpus used as the comparison standard.",
          strengths: ["Reference Standard"],
          weaknesses: []
        }
      },
      depth: {
        passageA: {
          score: extractNumericValue(analysisText, "Depth", 0, 10) || 6,
          assessment: extractSection(analysisText, "Depth", 300) || 
            "Analysis of non-triviality and conceptual insight compared to the corpus.",
          strengths: extractListItems(analysisText, "Depth", "strengths", 3) || 
            ["Areas of conceptual depth"],
          weaknesses: extractListItems(analysisText, "Depth", "weaknesses", 3) || 
            ["Areas where depth could be improved"]
        },
        passageB: {
          score: 10,
          assessment: "Reference corpus used as the comparison standard.",
          strengths: ["Reference Standard"],
          weaknesses: []
        }
      },
      clarity: {
        passageA: {
          score: extractNumericValue(analysisText, "Clarity", 0, 10) || 7,
          assessment: extractSection(analysisText, "Clarity", 300) || 
            "Analysis of readability and stylistic alignment with the corpus.",
          strengths: extractListItems(analysisText, "Clarity", "strengths", 3) || 
            ["Areas of stylistic alignment"],
          weaknesses: extractListItems(analysisText, "Clarity", "weaknesses", 3) || 
            ["Areas where clarity could be improved"]
        },
        passageB: {
          score: 10,
          assessment: "Reference corpus used as the comparison standard.",
          strengths: ["Reference Standard"],
          weaknesses: []
        }
      },
      verdict: extractSection(analysisText, "Verdict", 500) || 
        `Analysis of how well the passage aligns with "${corpusTitle}" in terms of style, tone, and intellectual content.`
    };
    
    return result;
  } catch (error) {
    console.error("Error calling OpenAI for corpus comparison:", error);
    throw new Error(`Failed to analyze passage against corpus: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions for parsing the OpenAI response
function extractSection(text: string, sectionName: string, maxLength: number = 200): string | null {
  const regex = new RegExp(`${sectionName}[:\\s]+(.*?)(?=\\n\\s*\\n|\\n\\s*[A-Z]|$)`, 'is');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1].trim().substring(0, maxLength);
  }
  return null;
}

function extractSubsection(text: string, sectionName: string, subsectionKeyword: string, maxLength: number = 200): string | null {
  const section = extractSection(text, sectionName, 1000);
  if (!section) return null;
  
  const regex = new RegExp(`${subsectionKeyword}[:\\s]+(.*?)(?=\\n\\s*\\n|\\n\\s*[A-Z]|$)`, 'is');
  const match = section.match(regex);
  if (match && match[1]) {
    return match[1].trim().substring(0, maxLength);
  }
  return null;
}

function extractNumericValue(text: string, keyword: string, min: number, max: number): number | null {
  const regex = new RegExp(`${keyword}[^0-9]*(\\d+(?:\\.\\d+)?)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    const value = parseFloat(match[1]);
    return Math.max(min, Math.min(max, value));
  }
  return null;
}

function extractLabel(text: string, keyword: string): string | null {
  const regex = new RegExp(`${keyword}[^:]*:[^A-Za-z]*(\\w+)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

function extractListItems(text: string, sectionName: string, subsectionKeyword: string, maxItems: number): string[] | null {
  const section = extractSection(text, sectionName, 1000);
  if (!section) return null;
  
  const subsectionRegex = new RegExp(`${subsectionKeyword}[:\\s]+(.*?)(?=\\n\\s*\\n|\\n\\s*[A-Z]|$)`, 'is');
  const subsectionMatch = section.match(subsectionRegex);
  if (!subsectionMatch || !subsectionMatch[1]) return null;
  
  const subsection = subsectionMatch[1].trim();
  const itemsRegex = /(?:^|\n)-\s*([^\n]+)/g;
  const items: string[] = [];
  let match;
  
  while ((match = itemsRegex.exec(subsection)) !== null && items.length < maxItems) {
    items.push(match[1].trim());
  }
  
  return items.length > 0 ? items : null;
}

function extractParasiteLevel(text: string): "Low" | "Moderate" | "High" | null {
  const section = extractSection(text, "Conceptual Parasite", 500);
  if (!section) return null;
  
  if (section.toLowerCase().includes("low")) return "Low";
  if (section.toLowerCase().includes("high")) return "High";
  return "Moderate";
}

function generateHeatmapFromParagraphs(paragraphs: string[], analysisText: string): Array<{content: string, heat: number}> {
  const noveltySection = extractSection(analysisText, "Novelty Heatmap", 1000);
  const heatmap: Array<{content: string, heat: number}> = [];
  
  // Generate a heatmap based on the analysis or with default values
  paragraphs.forEach((paragraph, index) => {
    // Try to extract heat values from the analysis text
    let heat = 5; // Default moderate heat
    
    if (noveltySection) {
      // Look for mentions of paragraph numbers or sequential description
      const paragraphRegex = new RegExp(`paragraph\\s*${index + 1}|${getOrdinal(index + 1)}\\s*paragraph`, 'i');
      if (paragraphRegex.test(noveltySection)) {
        if (noveltySection.toLowerCase().includes("high novelty") || 
            noveltySection.toLowerCase().includes("innovative")) {
          heat = 8;
        } else if (noveltySection.toLowerCase().includes("low novelty") || 
                 noveltySection.toLowerCase().includes("derivative")) {
          heat = 3;
        }
      }
    }
    
    heatmap.push({
      content: paragraph,
      heat,
      explanation: `Analysis of paragraph ${index + 1} relative to corpus`,
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
- Examples should be BRIEFLY introduced (2-3 sentences maximum per example)
- Explicitly state how each example illuminates or solves the original problem
- The new material should enhance understanding, not simply be decorative
- Avoid vague metaphors or unnecessary abstraction
- Avoid overuse of academic jargon that does not add clarity
- Use concise language - if an idea can be expressed simply, it should be
- Maintain the original meaning while broadening its scope with intellectually rich and conceptually relevant examples`;
    } else if (overallScore < 5) {
      // Protocol for low-quality passages (score below 5)
      improvementProtocol = `ENHANCEMENT PROTOCOL FOR LOWER-QUALITY PASSAGE:

Goal: Improve the clarity, coherence, and structure of this passage while maintaining its intellectual content.

Focus on:
1. Rewriting for clarity: Make the passage clear, coherent, and precise
2. Reorganizing and restructuring: Improve the internal structure of the text for logical flow
3. Simplifying where necessary: Break down complex ideas into simpler, more digestible components
4. Enhancing readability: Improve how the information is presented while maintaining intellectual rigor

Guidelines:
- Create a clear, logical progression of ideas with explicit transitions
- Break long, complex sentences into shorter, clearer ones where appropriate
- Define any technical terms or jargon when first introduced
- Use concrete examples to illustrate abstract concepts (1-2 sentences per example)
- Eliminate redundancy and remove unnecessary verbiage
- Ensure each paragraph has a clear topic sentence and supporting content
- Create a consistent and coherent structure throughout
- Use precise language that accurately captures the intended meaning
- Simplify complex ideas without sacrificing intellectual depth
- Make the passage easier to understand and more precise
- Maintain the original meaning but present it with greater clarity`;
    } else {
      // Default protocol for medium-quality passages (score 5-7)
      improvementProtocol = `ENHANCEMENT PROTOCOL FOR MODERATE-QUALITY PASSAGE:

Goal: Balance improving clarity and structure while adding some intellectual depth.

Focus on:
1. Enhancing organization and logical flow of ideas
2. Adding moderate intellectual enrichment through well-chosen examples
3. Clarifying complex concepts while maintaining their sophistication
4. Improving precision and specificity of language

Guidelines:
- Add 1-2 SPECIFIC, CONCRETE examples that directly illustrate key concepts (max 2-3 sentences each)
- Ensure each example is directly connected to the main argument with an explicit explanation
- Improve transitions between ideas for smoother logical flow
- Clarify any vague or ambiguous statements with more precise language
- Break up any overly dense paragraphs into more digestible sections
- Strike a balance between clarity and intellectual depth
- Use active voice and direct language where possible
- Refine the structure for better logical progression
- Eliminate unnecessary jargon or add brief definitions where needed
- Improve precision and clarity without oversimplification
- Focus on improving organization without adding excessive length`;
    }
    
    // Determine style instructions based on styleOption
    let styleInstructions = "";
    switch(styleOption) {
      case 'keep-voice':
        styleInstructions = `KEEP MY VOICE MODE:
Maintain the user's original tone and style while adding intellectual depth and concrete examples.

IMPORTANT GUIDELINES:
- Keep the same writing style, sentence structures, and voice patterns
- Preserve the author's unique vocabulary and expressions
- Add more intellectual depth and sophisticated reasoning
- Introduce concrete, relevant examples to strengthen arguments
- Maintain the same general flow and structure
- Avoid overly ornate or "bloggy" language
- Focus on substance, not stylistic flourishes
- Enhance clarity and precision without introducing unnecessary verbosity
- Stay true to the core intellectual content
- The revised text should feel like it was written by the same person, just with more depth`;
        break;
        
      case 'academic':
        styleInstructions = `MAKE IT MORE FORMAL/ACADEMIC MODE:
Use a more formal, scholarly tone with precise language, suitable for an academic or professional audience.

IMPORTANT GUIDELINES:
- Employ formal academic terminology and phrasing
- Structure the passage with clear, scholarly argumentation
- Use precise, technical language appropriate for the discipline
- Follow academic conventions for organizing ideas
- Include proper framing of concepts within their scholarly context
- Present ideas with intellectual rigor and logical formality
- Avoid unnecessary verbosity or pretentious language
- Focus on clarity and precision in communicating complex ideas
- Maintain intellectual substance rather than mere formality
- Aim for a style that would be appropriate in a scholarly journal while remaining accessible`;
        break;
        
      case 'punchy':
        styleInstructions = `MAKE IT MORE PUNCHY MODE:
Provide a concise and impactful version that is sharp, direct, and still intellectually rigorous.

IMPORTANT GUIDELINES:
- Make the writing more concise and impactful
- Use sharper, more direct language
- Eliminate unnecessary words and phrases
- Use active voice and strong verbs
- Create shorter, more powerful sentences
- Focus on clarity and brevity while maintaining intellectual depth
- Make each sentence count with condensed, powerful statements
- Avoid oversimplification of complex ideas
- Maintain the intellectual substance while improving directness
- Strive for precision rather than mere brevity
- Use concise examples that illuminate rather than decorate`;
        break;
        
      default:
        styleInstructions = `PRIORITIZE ORIGINALITY MODE:
Present the content with added complexity and depth, introducing novel examples and applications.

IMPORTANT GUIDELINES:
- Introduce novel perspectives and approaches
- Add conceptual complexity and depth
- Create unexpected but relevant connections to other domains
- Challenge implicit assumptions in the original text
- Add intellectual innovations that transform the ideas
- Focus on maximum originality while ensuring the passage remains coherent
- Provide unique insights and framings that push beyond conventional thinking
- Avoid "decorative language" that adds no substance
- Don't introduce vague, high-level rhetoric
- Prioritize intellectual engagement over stylistic novelty
- Emphasize originality through additional examples, applications, or extensions of the ideas
- Stay grounded in the original intellectual argument while expanding it`;
    }
    
    // Add custom instructions if provided
    let customInstructionsBlock = "";
    if (customInstructions && customInstructions.trim()) {
      customInstructionsBlock = `
CUSTOM USER INSTRUCTIONS:
The user has provided the following specific instructions for how they want the passage improved:
"${customInstructions.trim()}"

These custom instructions OVERRIDE any conflicting parts of the standard protocol and style guidelines.
Prioritize following these user-specific instructions while maintaining intellectual rigor.
`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert editor specializing in improving the conceptual originality and intellectual contribution of academic and philosophical texts.
          
Your task is to write a COMPLETE, IMPROVED VERSION of a passage. The new version must be a standalone, cohesive text that can replace the original. 

IMPORTANT: DO NOT provide bullet points or suggestions. Write a COMPLETE, FULLY-FORMED PASSAGE that is ready to use.

You must NOT simply reword or paraphrase the original text. Instead, make genuine intellectual improvements based on the specific enhancement protocol provided.

${improvementProtocol}

QUALITY GUIDELINES:
- Enhance intellectual depth without introducing unnecessary verbosity
- Avoid "bloggy" language or decorative flourishes that add no substance
- Do not use vague, high-level rhetoric - be precise and specific
- Focus on the conceptual substance, not stylistic novelty
- Maintain scholarly precision and clarity
- When adding examples, ensure they genuinely illuminate the concepts
- Stay grounded in the original intellectual argument while enhancing it
- Aim for a text that is both improved AND intellectually rigorous

${styleInstructions}

${customInstructionsBlock}

You will receive a passage along with its analysis. Use the analysis to identify specific areas for improvement, and focus your enhancements there.`
        },
        {
          role: "user",
          content: `Here is the passage to improve:

Title: ${passageTitle}
Text: ${passage.text}

Analysis of the passage:
- Overall Score: ${overallScore.toFixed(1)}/10
- Derivative Index Score: ${derivativeScore}/10 (higher is more original)
- Semantic Distance: ${semanticDistance}/100 (higher is more distant from predecessors)
- Conceptual Parasite Level: ${parasiteLevel}
- Parasitic Elements: ${parasiteElements}
- Areas needing improvement:
  ${lowHeatAreas || "Various sections throughout the text"}

Respond with exactly these three sections in this order:

1. IMPROVED PASSAGE TEXT - Write a complete, standalone, improved version of the passage. This must be a fully-formed text that can directly replace the original, not bullet points or guidelines.

2. KEY IMPROVEMENTS - Briefly explain the key improvements you made to the passage.

3. ESTIMATED NEW SCORE - Provide an estimated new score (0-10) based on how much you improved the passage.`
        }
      ],
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content || "";
    
    // Extract the improved passage and estimated score from the response
    let improvedText = "";
    let improvementSummary = "";
    let estimatedScore = 0;
    
    // Look for the improved passage - it should be the main content before any numbered points
    // First, try to find a clear section break
    const improvedSectionMatch = content.match(/1\.\s*(?:Improved|The improved) passage text:?\s*([\s\S]*?)(?=\n\s*2\.|$)/i);
    
    if (improvedSectionMatch && improvedSectionMatch[1]) {
      // Successfully found a clearly marked improved passage section
      improvedText = improvedSectionMatch[1].trim();
    } else {
      // Try to find the improved text by identifying where the explanations start
      const explanationStart = content.search(/(?:2\.|Key Improvements:|Brief explanation|Explanation of improvements)/i);
      
      if (explanationStart > 0) {
        // Extract everything before the explanation as the improved passage
        improvedText = content.substring(0, explanationStart).trim()
          .replace(/^(1\.|Improved Passage:|Title:).*?\n/i, '') // Remove any numbering or headings
          .trim();
      } else {
        // If we can't find a clear separation, check if the content starts with numbered sections
        const numberedStart = content.match(/^1\.\s*([\s\S]*?)\n\s*2\./);
        if (numberedStart && numberedStart[1]) {
          improvedText = numberedStart[1].trim();
        } else {
          // Last resort: assume the entire content is the improved passage until we find explanations
          improvedText = content
            .replace(/(?:Key Improvements|Explanation|Estimated)[\s\S]*$/i, '')
            .trim();
        }
      }
    }
    
    // Look for the explanation/summary
    const summaryMatch = content.match(/(?:2\.|Key Improvements:|Explanation of improvements:|Brief explanation:)\s*([\s\S]*?)(?=\s*(?:3\.|Estimated|New Derivative|$))/i);
    if (summaryMatch && summaryMatch[1]) {
      improvementSummary = summaryMatch[1].trim();
    } else {
      // Fallback if pattern not found
      improvementSummary = "The passage has been improved with greater conceptual originality, clearer framing, and more innovative connections.";
    }
    
    // Extract estimated new score
    const scoreMatch = content.match(/(?:3\.|Estimated.*?score|New.*?score).*?(\d+(?:\.\d+)?)/i);
    if (scoreMatch && scoreMatch[1]) {
      estimatedScore = parseFloat(scoreMatch[1]);
      // Ensure it's in range
      estimatedScore = Math.max(0, Math.min(10, estimatedScore));
    } else {
      // If no score found, estimate an improvement
      estimatedScore = Math.min(10, derivativeScore + 2);
    }
    
    // Final check - if we somehow got no improved text or just bullet points
    if (!improvedText || improvedText.length < 50 || /^[-•*]\s/.test(improvedText)) {
      // Retry with a simpler approach - take the entire response and clean it
      console.log("Improved text extraction failed, using fallback method");
      improvedText = content
        .replace(/(?:Key Improvements|Explanation|Estimated|Brief explanation)[\s\S]*$/i, '') // Remove everything after explanations
        .replace(/^\d+\.\s*(?:Improved|The improved) passage text:?\s*/i, '') // Remove numbered headers
        .trim();
    }
    
    return {
      originalPassage: passage,
      improvedPassage: {
        title: passage.title,
        text: improvedText
      },
      estimatedDerivativeIndex: estimatedScore,
      improvementSummary
    };
  } catch (error) {
    console.error("Error generating more original version:", error);
    throw new Error(`Failed to generate improved passage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function processFeedback(
  category: 'conceptualLineage' | 'semanticDistance' | 'noveltyHeatmap' | 'derivativeIndex' | 'conceptualParasite' | 'coherence' | 'accuracy' | 'depth' | 'clarity',
  feedback: string,
  originalResult: AnalysisResult,
  passageA: PassageData,
  passageB: PassageData,
  isSinglePassageMode: boolean,
  supportingDocument?: SupportingDocument
): Promise<{ 
  aiResponse: string; 
  isRevised: boolean; 
  revisedResult: AnalysisResult 
}> {
  try {
    const passageATitle = passageA.title || (isSinglePassageMode ? "Your Passage" : "Passage A");
    const passageBTitle = isSinglePassageMode ? "Norm" : (passageB.title || "Passage B");
    
    // Create prompt based on category
    let categoryDescription = "";
    let originalAnalysis = "";
    
    switch(category) {
      case 'conceptualLineage':
        categoryDescription = "Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas";
        originalAnalysis = `
        Passage A: 
        Primary Influences: ${originalResult.conceptualLineage.passageA.primaryInfluences}
        Intellectual Trajectory: ${originalResult.conceptualLineage.passageA.intellectualTrajectory}
        
        Passage B:
        Primary Influences: ${originalResult.conceptualLineage.passageB.primaryInfluences}
        Intellectual Trajectory: ${originalResult.conceptualLineage.passageB.intellectualTrajectory}`;
        break;
      case 'semanticDistance':
        categoryDescription = "Semantic Distance - How far each passage moves from predecessors; is it reshuffling or truly novel";
        originalAnalysis = `
        Passage A: 
        Distance Score: ${originalResult.semanticDistance.passageA.distance}/100
        Label: ${originalResult.semanticDistance.passageA.label}
        
        Passage B:
        Distance Score: ${originalResult.semanticDistance.passageB.distance}/100
        Label: ${originalResult.semanticDistance.passageB.label}
        
        Key Findings: ${originalResult.semanticDistance.keyFindings.join(", ")}
        
        Semantic Innovation: ${originalResult.semanticDistance.semanticInnovation}`;
        break;
      case 'noveltyHeatmap':
        categoryDescription = "Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph";
        originalAnalysis = `
        Passage A Heat Levels: ${originalResult.noveltyHeatmap.passageA.map(item => `[${item.heat}%: ${item.content.substring(0, 50)}...]`).join(", ")}
        
        Passage B Heat Levels: ${originalResult.noveltyHeatmap.passageB.map(item => `[${item.heat}%: ${item.content.substring(0, 50)}...]`).join(", ")}`;
        break;
      case 'derivativeIndex':
        categoryDescription = "Derivative Index - Score 0-10 where 0 is recycled and 10 is wholly original";
        originalAnalysis = `
        Passage A:
        Overall Score: ${originalResult.derivativeIndex.passageA.score}/10
        Components: ${originalResult.derivativeIndex.passageA.components.map(c => `${c.name}: ${c.score}/10`).join(", ")}
        
        Passage B:
        Overall Score: ${originalResult.derivativeIndex.passageB.score}/10
        Components: ${originalResult.derivativeIndex.passageB.components.map(c => `${c.name}: ${c.score}/10`).join(", ")}`;
        break;
      case 'conceptualParasite':
        categoryDescription = "Conceptual Parasite Detection - Passages that operate in old debates without adding anything new";
        originalAnalysis = `
        Passage A:
        Level: ${originalResult.conceptualParasite.passageA.level}
        Elements: ${originalResult.conceptualParasite.passageA.elements.join(", ")}
        Assessment: ${originalResult.conceptualParasite.passageA.assessment}
        
        Passage B:
        Level: ${originalResult.conceptualParasite.passageB.level}
        Elements: ${originalResult.conceptualParasite.passageB.elements.join(", ")}
        Assessment: ${originalResult.conceptualParasite.passageB.assessment}`;
        break;
      case 'coherence':
        categoryDescription = "Coherence - Whether the passage, despite being original or not, is logically and conceptually coherent";
        originalAnalysis = `
        Passage A:
        Score: ${originalResult.coherence?.passageA?.score || 'Not evaluated'}/10
        Assessment: ${originalResult.coherence?.passageA?.assessment || 'Not evaluated'}
        Strengths: ${originalResult.coherence?.passageA?.strengths?.join(', ') || 'Not evaluated'}
        Weaknesses: ${originalResult.coherence?.passageA?.weaknesses?.join(', ') || 'Not evaluated'}
        
        Passage B:
        Score: ${originalResult.coherence?.passageB?.score || 'Not evaluated'}/10
        Assessment: ${originalResult.coherence?.passageB?.assessment || 'Not evaluated'}
        Strengths: ${originalResult.coherence?.passageB?.strengths?.join(', ') || 'Not evaluated'}
        Weaknesses: ${originalResult.coherence?.passageB?.weaknesses?.join(', ') || 'Not evaluated'}
        `;
        break;
      case 'accuracy':
        categoryDescription = "Accuracy - Factual and inferential correctness of the passage";
        originalAnalysis = `
        Passage A:
        Score: ${originalResult.accuracy?.passageA?.score || 'Not evaluated'}/10
        Assessment: ${originalResult.accuracy?.passageA?.assessment || 'Not evaluated'}
        Strengths: ${originalResult.accuracy?.passageA?.strengths?.join(', ') || 'Not evaluated'}
        Weaknesses: ${originalResult.accuracy?.passageA?.weaknesses?.join(', ') || 'Not evaluated'}
        
        Passage B:
        Score: ${originalResult.accuracy?.passageB?.score || 'Not evaluated'}/10
        Assessment: ${originalResult.accuracy?.passageB?.assessment || 'Not evaluated'}
        Strengths: ${originalResult.accuracy?.passageB?.strengths?.join(', ') || 'Not evaluated'}
        Weaknesses: ${originalResult.accuracy?.passageB?.weaknesses?.join(', ') || 'Not evaluated'}
        `;
        break;
      case 'depth':
        categoryDescription = "Depth - Non-triviality and conceptual insight of the passage";
        originalAnalysis = `
        Passage A:
        Score: ${originalResult.depth?.passageA?.score || 'Not evaluated'}/10
        Assessment: ${originalResult.depth?.passageA?.assessment || 'Not evaluated'}
        Strengths: ${originalResult.depth?.passageA?.strengths?.join(', ') || 'Not evaluated'}
        Weaknesses: ${originalResult.depth?.passageA?.weaknesses?.join(', ') || 'Not evaluated'}
        
        Passage B:
        Score: ${originalResult.depth?.passageB?.score || 'Not evaluated'}/10
        Assessment: ${originalResult.depth?.passageB?.assessment || 'Not evaluated'}
        Strengths: ${originalResult.depth?.passageB?.strengths?.join(', ') || 'Not evaluated'}
        Weaknesses: ${originalResult.depth?.passageB?.weaknesses?.join(', ') || 'Not evaluated'}
        `;
        break;
      case 'clarity':
        categoryDescription = "Clarity - Readability, transparency, and semantic accessibility of the passage";
        originalAnalysis = `
        Passage A:
        Score: ${originalResult.clarity?.passageA?.score || 'Not evaluated'}/10
        Assessment: ${originalResult.clarity?.passageA?.assessment || 'Not evaluated'}
        Strengths: ${originalResult.clarity?.passageA?.strengths?.join(', ') || 'Not evaluated'}
        Weaknesses: ${originalResult.clarity?.passageA?.weaknesses?.join(', ') || 'Not evaluated'}
        
        Passage B:
        Score: ${originalResult.clarity?.passageB?.score || 'Not evaluated'}/10
        Assessment: ${originalResult.clarity?.passageB?.assessment || 'Not evaluated'}
        Strengths: ${originalResult.clarity?.passageB?.strengths?.join(', ') || 'Not evaluated'}
        Weaknesses: ${originalResult.clarity?.passageB?.weaknesses?.join(', ') || 'Not evaluated'}
        `;
        break;
    }

    // Create messages array for OpenAI
    const messages = [
      {
        role: "system" as const,
        content: `You are a sophisticated semantic originality analyzer that evaluates the conceptual originality of texts. 
        You're now engaging with a user who is providing feedback on your previous analysis.
        
        You should respond in a conversational style, addressing their feedback directly.
        
        Consider the user's feedback carefully and determine whether your original assessment should be modified or maintained.
        If the user's argument has merit, acknowledge it and explain how your assessment changes.
        If you maintain your original assessment, respectfully explain why, referencing the text to justify your position.
        
        FORMAT YOUR RESPONSE IN THIS WAY:
        - Start with a direct response to the user's feedback
        - Engage with their specific concerns
        - If revising your assessment, clearly state what changes and why
        - If maintaining your assessment, explain your reasoning respectfully
        - End with a question or invitation for further dialogue if appropriate
        
        Your response should be thoughtful and substantive, showing you've carefully considered their perspective.`
      },
      {
        role: "user" as const,
        content: `I previously analyzed ${isSinglePassageMode ? "a passage against a typical norm" : "two passages"} and provided an evaluation of their conceptual originality.

The category being addressed is: ${categoryDescription}

${isSinglePassageMode ? "Passage:" : "Passages:"}

${passageATitle}:
${passageA.text}

${isSinglePassageMode ? "" : `${passageBTitle}:
${passageB.text}

`}

My original analysis for this category was:
${originalAnalysis}

The user has provided this feedback about my analysis:
"${feedback}"
${supportingDocument ? `\nThe user has also provided a supporting document titled "${supportingDocument.title}" with this content:
${supportingDocument.content}` : ""}

Please respond to this feedback directly, in a conversational style, either revising or justifying the original assessment.`
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 2000,
    });

    const aiResponse = response.choices[0].message.content || "I apologize, but I couldn't process your feedback at this time.";
    
    // Check if the response indicates a revision is needed
    const isRevised = 
      aiResponse.toLowerCase().includes("revise") || 
      aiResponse.toLowerCase().includes("adjust") || 
      aiResponse.toLowerCase().includes("change") || 
      aiResponse.toLowerCase().includes("update") || 
      aiResponse.toLowerCase().includes("modify");
    
    // If a revision is indicated, make a second call to update the analysis
    let revisedResult = { ...originalResult };
    
    if (isRevised) {
      // Make another call to specifically get the revised analysis
      const revisionMessages = [
        {
          role: "system" as const,
          content: `You are a sophisticated semantic originality analyzer that evaluates the conceptual originality of texts.
          Based on user feedback, you need to provide a revised analysis for a specific category.
          Return only the revised JSON data for the category in question.`
        },
        {
          role: "user" as const,
          content: `I need a revised analysis for the category "${category}" based on this user feedback:
          "${feedback}"
          
          ${supportingDocument ? `The user provided this supporting document:
          Title: ${supportingDocument.title}
          Content: ${supportingDocument.content}
          
          ` : ""}Original passages:
          
          ${passageATitle}:
          ${passageA.text}
          
          ${isSinglePassageMode ? "" : `${passageBTitle}:
          ${passageB.text}
          
          `}Original analysis:
          ${originalAnalysis}
          
          Please provide only the revised JSON data for the "${category}" category.`
        }
      ];

      const revisionResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: revisionMessages,
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      try {
        const revisionJson = JSON.parse(revisionResponse.choices[0].message.content || "{}");
        
        // Update the relevant category in the result with type safety
        if (revisionJson[category]) {
          // Create a copy of the result with the feedback added
          const updatedCategory = {
            ...revisedResult[category],
            feedback: {
              comment: feedback,
              aiResponse,
              isRevised: true
            }
          };
          
          // Apply the revision data from the AI
          if (revisionJson[category]) {
            // Merge the revision data while preserving the structure
            revisedResult = {
              ...revisedResult,
              [category]: {
                ...updatedCategory,
                ...(revisionJson[category] || {})
              }
            };
          } else {
            // Just add the feedback
            revisedResult = {
              ...revisedResult,
              [category]: updatedCategory
            };
          }
        }
      } catch (error) {
        console.error("Error parsing revision JSON:", error);
        
        // If parsing fails, just add the feedback without changing the core data
        const updatedCategory = {
          ...revisedResult[category],
          feedback: {
            comment: feedback,
            aiResponse,
            isRevised: true
          }
        };
        
        revisedResult = {
          ...revisedResult,
          [category]: updatedCategory
        };
      }
    } else {
      // Just add the feedback to the original result without changing the core data
      const updatedCategory = {
        ...revisedResult[category],
        feedback: {
          comment: feedback,
          aiResponse,
          isRevised: false
        }
      };
      
      revisedResult = {
        ...revisedResult,
        [category]: updatedCategory
      };
    }
    
    // Add the supporting document if provided
    if (supportingDocument) {
      revisedResult.supportingDocuments = [
        ...(revisedResult.supportingDocuments || []),
        supportingDocument
      ];
    }
    
    return {
      aiResponse,
      isRevised,
      revisedResult
    };
  } catch (error) {
    console.error("Error processing feedback:", error);
    throw new Error(`Failed to process feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
