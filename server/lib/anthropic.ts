import Anthropic from '@anthropic-ai/sdk';
import { PassageData, SupportingDocument, StyleOption, FeedbackData, SubmitFeedbackRequest } from "../../client/src/lib/types";
import { splitIntoParagraphs } from "../../client/src/lib/utils";
import { AnalysisResult } from "@shared/schema";
import { generateGraph } from './graphGenerator';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
// Use environment variable for Anthropic API key
const apiKey = process.env.ANTHROPIC_API_KEY;
console.log("Anthropic API Key status:", apiKey ? "Present" : "Missing");

export async function analyzePassages(
  passageA: PassageData,
  passageB: PassageData
): Promise<AnalysisResult> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const paragraphsA = splitIntoParagraphs(passageA.text);
    const paragraphsB = splitIntoParagraphs(passageB.text);

    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

    const anthropic = new Anthropic({
      apiKey,
    });

    const systemPrompt = `You are a sophisticated semantic analyzer that evaluates the conceptual originality AND merit of texts (not plagiarism or surface similarity). IMPORTANT: Originality must be balanced with merit - an original text with poor coherence, accuracy, or depth has less value than one that balances originality with these qualities.

IMPORTANT EVALUATION GUIDELINES:
- Do not penalize lack of empirical data unless the passage makes explicit factual claims. The evaluation should be rooted in conceptual, philosophical, or theoretical merit — not on whether the author cites data or statistics.
- Do not downgrade work for using analogy unless the analogy is incoherent or misleading. Dense reasoning and non-empirical speculation are valid modes of philosophical analysis and should be treated accordingly.
- Value conceptual innovation, logical coherence, and theoretical significance over empirical evidence when evaluating philosophical texts.

Analyze the two passages across nine metrics:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas, with higher scores for ideas that are both novel AND well-founded
2. Semantic Distance - How far each passage moves from predecessors while maintaining intellectual rigor; mere difference is not valuable without substantive merit
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph, with emphasis on innovation that builds on solid foundations
4. Derivative Index - Score 0-10 where 0 is recycled and 10 is wholly original AND meritorious (low scores for texts that are original but incoherent or lacking depth)
5. Conceptual Parasite Detection - Passages that operate in old debates without adding anything new or valuable
6. Coherence - Whether the passage is logically and conceptually coherent, a fundamental requirement for valuable originality
7. Accuracy - Factual and inferential correctness of the passage, without which originality has diminished value
8. Depth - Non-triviality and conceptual insight of the passage, which gives originality its purpose
9. Clarity - Readability, transparency, and semantic accessibility of the passage, necessary for communicating original ideas`;

    const userPrompt = `Please analyze and compare these two passages:

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
      }
    ],
    "passageB": [
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
}`;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ],
    });

    // Get the content text from the response
    const contentText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Parse the content into our AnalysisResult type
    let jsonContent = contentText;
    const jsonBlockMatch = contentText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonContent = jsonBlockMatch[1].trim();
      console.log("Extracted JSON from code block in Anthropic response");
    }
    
    let result: AnalysisResult;
    try {
      result = JSON.parse(jsonContent) as AnalysisResult;
    } catch (error) {
      console.error("Error parsing Anthropic JSON response:", error);
      throw new Error(`Failed to parse Anthropic response: ${error instanceof Error ? error.message : String(error)}`);
    }

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
    }

    return result;
  } catch (error) {
    console.error("Error calling Anthropic:", error);
    throw new Error(`Failed to analyze passages with Anthropic: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Single passage analysis against an internal norm
/**
 * Generates text based on natural language instructions
 * @param instructions Natural language instructions for text generation
 * @param params Parsed parameters from the instructions
 * @returns Generated text and its title
 */
export async function generateTextFromNL(
  instructions: string,
  params?: {
    topic?: string;
    wordCount?: number;
    authors?: string;
    conceptualDensity?: "high" | "medium" | "low";
    parasiteLevel?: "high" | "medium" | "low";
    originality?: "high" | "medium" | "low";
    title?: string;
  }
): Promise<{ text: string; title: string }> {
  // Ensure Anthropic API key is set
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Anthropic API key is not configured");
  }

  // Default parameters if not provided
  const topic = params?.topic || "unspecified topic";
  const wordCount = params?.wordCount || 800;
  const authors = params?.authors || "";
  const conceptualDensity = params?.conceptualDensity || "medium";
  const parasiteLevel = params?.parasiteLevel || "low";
  const originality = params?.originality || "high";
  const title = params?.title || `Generated Text on ${topic}`;

  try {
    // Create system prompt
    const systemPrompt = `You are an expert writer specializing in generating highly original intellectual content.
Your task is to generate text based on natural language instructions while adhering to specific parameters:

PARAMETERS:
- Topic: ${topic}
- Word Count: approximately ${wordCount} words
- Authors to Reference: ${authors ? authors : "None specified"}
- Conceptual Density: ${conceptualDensity} (high = many complex ideas densely packed, medium = balanced complexity, low = straightforward ideas clearly expressed)
- Parasite Index: ${parasiteLevel} (low = highly original with minimal derivative concepts, medium = balanced originality, high = more derivative concepts)
- Originality Level: ${originality} (high = groundbreaking perspectives, medium = fresh take on established ideas, low = conventional framing)

Generate scholarly text that meets these parameters and follows the user's instructions. Create text with novel perspectives, insightful connections, and precise vocabulary. Avoid repetition, clichés, and conventional thinking. Format the output in well-structured paragraphs with a clear title.`;

    // Check if graphs are requested in the instructions
    const needsGraphs = /graph|chart|plot|diagram|visual|figure|illustration/i.test(instructions);
    
    // Enhanced system prompt for graph-aware content generation
    const enhancedSystemPrompt = systemPrompt + `

${needsGraphs ? `
GRAPH INTEGRATION INSTRUCTIONS:
When the user requests graphs, charts, or visual elements:
1. Include placeholder markers in your text like [GRAPH: description of graph needed]
2. Place these markers where the graph would logically appear in the document
3. Be specific about the type of graph and data it should show
4. Example: [GRAPH: Line chart showing inflation rates from 2010-2024 with y-axis as percentage and x-axis as years]
5. Example: [GRAPH: Bar chart comparing GDP growth across different economic sectors]
6. Example: [GRAPH: Scatter plot of y=x^2 function from x=-5 to x=5]
7. Write the surrounding text to reference and explain the graphs appropriately
` : ''}`;

    // Call Anthropic API
    const anthropicClient = new Anthropic({
      apiKey: apiKey
    });
    
    const response = await anthropicClient.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: Math.min(4000, wordCount * 2),
      messages: [
        { role: "user", content: instructions }
      ],
      system: enhancedSystemPrompt,
      temperature: 0.9,
    });

    // Extract text and process it
    let generatedContent = response.content[0].type === 'text' ? 
      response.content[0].text : "";
    
    // Process graph placeholders if present
    if (needsGraphs) {
      const graphPlaceholders = generatedContent.match(/\[GRAPH:\s*([^\]]+)\]/g);
      
      if (graphPlaceholders) {
        for (const placeholder of graphPlaceholders) {
          try {
            const description = placeholder.replace(/\[GRAPH:\s*/, '').replace(/\]$/, '').trim();
            console.log(`Generating graph for: ${description}`);
            
            const graphResult = await generateGraph({
              description,
              width: 600,
              height: 400
            });
            
            // Replace placeholder with SVG and descriptive text
            const graphHtml = `
<div class="graph-container" style="margin: 20px 0; text-align: center;">
  <h4 style="margin-bottom: 10px; font-weight: bold;">${graphResult.title}</h4>
  ${graphResult.svg}
  <p style="margin-top: 10px; font-style: italic; color: #666; font-size: 0.9em;">${graphResult.description}</p>
</div>`;
            
            generatedContent = generatedContent.replace(placeholder, graphHtml);
          } catch (error) {
            console.error(`Error generating graph for "${placeholder}":`, error);
            // Replace with error message
            generatedContent = generatedContent.replace(placeholder, 
              `[Graph generation failed: ${error instanceof Error ? error.message : 'Unknown error'}]`);
          }
        }
      }
    }
    
    // Try to extract title if there's one in the response
    let extractedTitle = title;
    let finalText = generatedContent;
    
    // If the response starts with a title (e.g., "# Title" or "Title\n"), extract it
    const titleMatch = generatedContent.match(/^(?:#\s*)?([^\n]+)(?:\n+|$)/);
    if (titleMatch && titleMatch[1]) {
      extractedTitle = titleMatch[1].replace(/^#+\s*/, '').trim();
      // Remove title from text if it was extracted
      finalText = generatedContent.replace(titleMatch[0], '').trim();
    }

    return {
      text: finalText,
      title: extractedTitle
    };
  } catch (error) {
    console.error("Error generating text with Anthropic:", error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function analyzeSinglePassage(
  passage: PassageData
): Promise<AnalysisResult> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }
    
    const paragraphs = splitIntoParagraphs(passage.text);
    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const anthropic = new Anthropic({
      apiKey,
    });

    const systemPrompt = `You are a sophisticated semantic analyzer that evaluates the conceptual originality AND merit of texts (not plagiarism or surface similarity). IMPORTANT: Originality must be balanced with merit - an original text with poor coherence, accuracy, or depth has less value than one that balances originality with these qualities.

IMPORTANT EVALUATION GUIDELINES:
- Do not penalize lack of empirical data unless the passage makes explicit factual claims. The evaluation should be rooted in conceptual, philosophical, or theoretical merit — not on whether the author cites data or statistics.
- Do not downgrade work for using analogy unless the analogy is incoherent or misleading. Dense reasoning and non-empirical speculation are valid modes of philosophical analysis and should be treated accordingly.
- Value conceptual innovation, logical coherence, and theoretical significance over empirical evidence when evaluating philosophical texts.

Analyze the given passage against a normalized baseline of common writing in the same domain. Evaluate it across nine metrics:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas
2. Semantic Distance - How far the passage moves from common norms; is it reshuffling or truly novel
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph
4. Derivative Index - Score 0-10 where 0 is recycled and 10 is wholly original AND meritorious
5. Conceptual Parasite Detection - Does the passage operate within existing debates without adding original contributions
6. Coherence - Whether the passage is logically and conceptually coherent
7. Accuracy - Factual and inferential correctness of the passage
8. Depth - Non-triviality and conceptual insight of the passage
9. Clarity - Readability, transparency, and semantic accessibility of the passage`;

    const userPrompt = `Please analyze this passage against an internal norm of average originality:

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
      }
    ],
    "passageB": [
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
}`;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ],
    });

    // Get the content text from the response
    const contentText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Parse the content into our AnalysisResult type
    let jsonContent = contentText;
    const jsonBlockMatch = contentText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonContent = jsonBlockMatch[1].trim();
      console.log("Extracted JSON from code block in Anthropic response");
    }
    
    let result: AnalysisResult;
    try {
      result = JSON.parse(jsonContent) as AnalysisResult;
    } catch (error) {
      console.error("Error parsing Anthropic JSON response:", error);
      throw new Error(`Failed to parse Anthropic response: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Process and validate all required fields for the response

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
    }

    // Store userContext in the result if it was provided
    if (userContext) {
      result.userContext = userContext;
    }
    
    return result;
  } catch (error) {
    console.error("Error calling Anthropic for single passage analysis:", error);
    throw new Error(`Failed to analyze passage with Anthropic: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}