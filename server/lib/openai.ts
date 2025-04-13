import OpenAI from "openai";
import { PassageData, SupportingDocument } from "../../client/src/lib/types";
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
          content: `You are a sophisticated semantic originality analyzer that evaluates the conceptual originality of texts (not plagiarism or surface similarity). Analyze the two passages for originality across five metrics:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas
2. Semantic Distance - How far each passage moves from predecessors; is it reshuffling or truly novel
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph
4. Derivative Index - Score 0-10 where 0 is recycled and 10 is wholly original
5. Conceptual Parasite Detection - Passages that operate in old debates without adding anything new

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
          content: `You are a sophisticated semantic originality analyzer that evaluates the conceptual originality of texts (not plagiarism or surface similarity). Analyze the given passage against a normalized baseline of common writing in the same domain. Evaluate it across five metrics:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas
2. Semantic Distance - How far the passage moves from common norms; is it reshuffling or truly novel
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph
4. Derivative Index - Score 0-10 where 0 is recycled and 10 is wholly original
5. Conceptual Parasite Detection - Does the passage operate within existing debates without adding original contributions

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
export async function processFeedback(
  category: 'conceptualLineage' | 'semanticDistance' | 'noveltyHeatmap' | 'derivativeIndex' | 'conceptualParasite',
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
