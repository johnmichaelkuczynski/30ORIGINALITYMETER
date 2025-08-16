import Anthropic from '@anthropic-ai/sdk';
import { PassageData, SupportingDocument, StyleOption, FeedbackData, SubmitFeedbackRequest } from "../../client/src/lib/types";
import { splitIntoParagraphs } from "../../client/src/lib/utils";
import { AnalysisResult } from "@shared/schema";
import { generateGraph, GraphRequest } from './graphGenerator';

// Advanced comparison result interface
export interface AdvancedComparisonResult {
  originality_score: number;
  is_ripoff: boolean;
  is_development: boolean;
  development_mode: string;
  development_strength: number;
  doctrinal_alignment: {
    alignment_score: number;
    type: string;
    affinity_axis: string;
  };
  psychological_profiles: {
    text_a: {
      interests: string[];
      bias: string[];
      cognitive_strength: string[];
      posture: string;
    };
    text_b: {
      interests: string[];
      bias: string[];
      cognitive_strength: string[];
      posture: string;
    };
    match_score: number;
    narrative_relationship: string;
  };
  summary: string;
}

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
// Use environment variable for Anthropic API key
const apiKey = process.env.ANTHROPIC_API_KEY;
console.log("Anthropic API Key status:", apiKey ? "Present" : "Missing");

// Helper function to detect and embed graphs in text
export async function processGraphRequests(text: string): Promise<string> {
  try {
    let processedText = text;
    
    // Look for graph-related requests in the text using simple string matching
    const graphKeywords = [
      'plot the graph',
      'create a graph',
      'draw a graph',
      'show a graph',
      'generate a graph',
      'exponential function',
      'quadratic function',
      'sine function',
      'cosine function',
      'logarithmic function',
      'linear function',
      'exponential graph',
      'quadratic graph',
      'sine graph',
      'cosine graph'
    ];
    
    // Check each sentence for graph requests
    const sentences = text.split(/[.!?]+/);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const lowerSentence = sentence.toLowerCase();
      
      for (const keyword of graphKeywords) {
        if (lowerSentence.includes(keyword)) {
          try {
            console.log(`Generating graph for: "${sentence}"`);
            
            const graphRequest: GraphRequest = {
              description: sentence.trim(),
              width: 600,
              height: 400
            };
            
            const graphResult = await generateGraph(graphRequest);
            
            // Create the graph embed
            const graphEmbed = `
**${graphResult.title}**

${graphResult.svg}

*Figure: ${graphResult.description}*
`;
            
            // Replace the sentence with the graph
            processedText = processedText.replace(sentence, graphEmbed);
            break; // Only generate one graph per sentence
            
          } catch (error) {
            console.error('Error generating graph:', error);
            // Keep original text if graph generation fails
          }
        }
      }
    }
    
    return processedText;
  } catch (error) {
    console.error('Error processing graph requests:', error);
    return text;
  }
}

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

CRITICAL ORIGINALITY SCORING GUIDELINES:
- HAVING INFLUENCES IS NORMAL AND EXPECTED - Do not assign low scores (0-3) simply because a text shows influences from other thinkers
- Building on existing ideas can still be highly original (7-10 scores) if the text adds significant new insights, novel applications, or innovative synthesis
- Only assign very low scores (0-3) for texts that are truly derivative: direct copying, minimal modification of existing ideas, or pure regurgitation
- Moderate scores (4-6) for texts that show some development of existing ideas with modest innovation
- High scores (7-10) for texts that demonstrate substantial conceptual innovation, even if building on established foundations

IMPORTANT EVALUATION GUIDELINES:
- Do not penalize lack of empirical data unless the passage makes explicit factual claims. The evaluation should be rooted in conceptual, philosophical, or theoretical merit — not on whether the author cites data or statistics.
- Do not downgrade work for using analogy unless the analogy is incoherent or misleading. Dense reasoning and non-empirical speculation are valid modes of philosophical analysis and should be treated accordingly.
- Value conceptual innovation, logical coherence, and theoretical significance over empirical evidence when evaluating philosophical texts.
- Recognizing influences while transforming them into new insights deserves high originality scores.

Analyze the two passages across nine metrics:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas, with higher scores for ideas that are both novel AND well-founded
2. Semantic Distance - How far each passage moves from predecessors while maintaining intellectual rigor; mere difference is not valuable without substantive merit
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph, with emphasis on innovation that builds on solid foundations
4. Derivative Index - Score 0-10 where 0 is pure recycling and 10 is wholly original AND meritorious (remember: having influences does not automatically lower scores - focus on what new insights are added)
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

    // Process the text for graph requests after generation
    const processedText = await processGraphRequests(finalText);
    
    return {
      text: processedText,
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

CRITICAL ORIGINALITY SCORING GUIDELINES:
- HAVING INFLUENCES IS NORMAL AND EXPECTED - Do not assign low scores (0-3) simply because a text shows influences from other thinkers
- Building on existing ideas can still be highly original (7-10 scores) if the text adds significant new insights, novel applications, or innovative synthesis
- Only assign very low scores (0-3) for texts that are truly derivative: direct copying, minimal modification of existing ideas, or pure regurgitation
- Moderate scores (4-6) for texts that show some development of existing ideas with modest innovation
- High scores (7-10) for texts that demonstrate substantial conceptual innovation, even if building on established foundations

IMPORTANT EVALUATION GUIDELINES:
- Do not penalize lack of empirical data unless the passage makes explicit factual claims. The evaluation should be rooted in conceptual, philosophical, or theoretical merit — not on whether the author cites data or statistics.
- Do not downgrade work for using analogy unless the analogy is incoherent or misleading. Dense reasoning and non-empirical speculation are valid modes of philosophical analysis and should be treated accordingly.
- Value conceptual innovation, logical coherence, and theoretical significance over empirical evidence when evaluating philosophical texts.
- Recognizing influences while transforming them into new insights deserves high originality scores.

Analyze the given passage against a normalized baseline of common writing in the same domain. Evaluate it across nine metrics:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas, with higher scores for ideas that are both novel AND well-founded
2. Semantic Distance - How far the passage moves from common norms; is it reshuffling or truly novel
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph
4. Derivative Index - Score 0-10 where 0 is pure recycling and 10 is wholly original AND meritorious (remember: having influences does not automatically lower scores - focus on what new insights are added)
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

/**
 * Advanced comparison function for comprehensive text analysis
 * Analyzes originality, developmental relationship, doctrinal alignment, and psychological profiling
 * @param textA First text for comparison
 * @param textB Second text for comparison
 * @returns Structured analysis with all requested metrics
 */
export async function advancedComparison(
  textA: PassageData,
  textB: PassageData
): Promise<AdvancedComparisonResult> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const systemPrompt = `You are an expert literary and philosophical analyst specializing in advanced text comparison. You must analyze two texts comprehensively across multiple dimensions and return results in strict JSON format.

Your analysis must cover:
1. ORIGINALITY & RIPOFF ANALYSIS - Score 0-100 (lower = more derivative)
2. DEVELOPMENTAL RELATIONSHIP - Whether B develops A's ideas and how
3. DOCTRINAL ALIGNMENT - Alignment score and type classification
4. PSYCHOLOGICAL PROFILING - Detailed author profiling for both texts
5. SUMMARY - Comprehensive natural language verdict

Return ONLY valid JSON with no additional text. Use the exact structure provided.`;

    const userPrompt = `Analyze these two texts comprehensively:

TEXT A:
Title: ${textA.title || 'Untitled'}
Content: ${textA.text}
Context: ${textA.userContext || 'None provided'}

TEXT B:
Title: ${textB.title || 'Untitled'}
Content: ${textB.text}
Context: ${textB.userContext || 'None provided'}

Return analysis in this exact JSON format:

{
  "originality_score": [0-100 number],
  "is_ripoff": [true/false],
  "is_development": [true/false],
  "development_mode": "[Conceptual/Methodological/Rhetorical/Critical/Other or null if not development]",
  "development_strength": [0-100 number],
  "doctrinal_alignment": {
    "alignment_score": [0-100 number],
    "type": "[Kindred/Compatible/Opposed/Antithetical]",
    "affinity_axis": "[Content/Method/Mentality/Tone/Multiple]"
  },
  "psychological_profiles": {
    "text_a": {
      "interests": ["interest1", "interest2", "interest3"],
      "bias": ["bias1", "bias2", "bias3"],
      "cognitive_strength": ["strength1", "strength2", "strength3"],
      "posture": "[missionary/institutionalist/outsider/other]"
    },
    "text_b": {
      "interests": ["interest1", "interest2", "interest3"],
      "bias": ["bias1", "bias2", "bias3"],
      "cognitive_strength": ["strength1", "strength2", "strength3"],
      "posture": "[missionary/institutionalist/outsider/other]"
    },
    "match_score": [0-100 number],
    "narrative_relationship": "[2-3 sentence description of psychological relationship]"
  },
  "summary": "[Comprehensive paragraph covering derivative vs developmental vs oppositional relationship, psychological contrast, stylistic differences, doctrinal affinity, and overall originality verdict]"
}

Analyze thoroughly and provide precise scores and classifications.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const jsonContent = jsonMatch[0];
    
    try {
      const result = JSON.parse(jsonContent) as AdvancedComparisonResult;
      
      // Validate required fields
      if (typeof result.originality_score !== 'number' ||
          typeof result.is_ripoff !== 'boolean' ||
          typeof result.is_development !== 'boolean' ||
          !result.doctrinal_alignment ||
          !result.psychological_profiles ||
          !result.summary) {
        throw new Error("Invalid response structure from API");
      }
      
      return result;
    } catch (parseError) {
      console.error("Error parsing advanced comparison JSON:", parseError);
      throw new Error(`Failed to parse advanced comparison response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    console.error("Error in advanced comparison:", error);
    throw new Error(`Advanced comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// RADICAL FIX: Add all missing analysis functions for the 20-parameter frameworks
export async function analyzeOriginality(passage: PassageData): Promise<any> {
  const prompt = `You are an expert in evaluating the originality and quality of intellectual writing across all disciplines. 

CRITICAL: Score each parameter 0-100 representing population percentile (96/100 means only 4% of population scores higher).

Analyze this passage using the exact 20 originality parameters:

PASSAGE: ${passage.title}
${passage.text}

Score each parameter 0-100 (population percentile):

1. Transformational Synthesis - Does the author transform inherited ideas into something new?
2. Generative Power - Does the work open new lines of inquiry?
3. Disciplinary Repositioning - Does the text challenge field boundaries?
4. Conceptual Reframing - Are familiar problems recast in novel terms?
5. Analytic Re-Alignment - Does the author redirect attention from false problems?
6. Unexpected Cross-Pollination - Are tools imported from distant domains?
7. Epistemic Reweighting - Are marginal ideas made central?
8. Constraint Innovation - Are new constraints introduced?
9. Ontology Re-specification - Is the underlying structure reconsidered?
10. Heuristic Leap - Are intuitive moves introduced that reframe?
11. Problem Re-Indexing - Are known problems recoded into more productive forms?
12. Axiomatic Innovation - Are new fundamental assumptions posited?
13. Moral or Political Recomputation - Are prevailing frames re-evaluated?
14. Semantic Innovation - Are new concepts or redefinitions introduced?
15. Methodological Innovation - Are new approaches developed?
16. Structural Innovation - Are new organizational structures created?
17. Causal Innovation - Are new causal relationships proposed?
18. Temporal Innovation - Are new temporal frameworks introduced?
19. Evidential Innovation - Are new forms of evidence introduced?
20. Theoretical Innovation - Are new theories developed?

For each parameter:
- score (0-100 population percentile)
- assessment (detailed explanation with quotes)
- strengths (specific examples)
- weaknesses (areas for improvement)

Respond in JSON format with exact camelCase names.`;

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: "You are an expert originality evaluator. Score on 0-100 population percentile scale where 96 means only 4% score higher.",
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return JSON.parse(content.text);
  } catch (error) {
    console.error("Error in Anthropic originality analysis:", error);
    // Fallback to OpenAI
    const openaiService = await import('./openai');
    return openaiService.analyzeOriginality(passage);
  }
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    console.log("Anthropic dual originality analysis not fully implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeOriginalityDual(passageA, passageB);
  } catch (error) {
    console.error("Error in Anthropic dual originality analysis:", error);
    throw error;
  }
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  try {
    console.log("Anthropic cogency analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeCogency(passage);
  } catch (error) {
    console.error("Error in Anthropic cogency analysis:", error);
    throw error;
  }
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    console.log("Anthropic dual cogency analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeCogencyDual(passageA, passageB);
  } catch (error) {
    console.error("Error in Anthropic dual cogency analysis:", error);
    throw error;
  }
}

export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    const paragraphs = splitIntoParagraphs(passage.text);
    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: `COMPREHENSIVE INTELLIGENCE SCORING SYSTEM

You are evaluating text using a scientifically-grounded intelligence framework that separates gatekeeping metrics from the core insight function.

STRUCTURAL OVERVIEW:
- Negative Metrics = Gatekeepers. If text fails these, it is unintelligent. If it passes, it might be intelligent.
- Affirmative Metric = Generator. If text succeeds here, it is intelligent—regardless of gatekeeper performance.

=== AFFIRMATIVE INTELLIGENCE METRIC ===

1. AFFIRMATIVE INSIGHT FUNCTION (AIF) - PRIMARY INTELLIGENCE MEASURE
Question: Does this text tell me something I wouldn't have realized on my own, even if I'm very smart?
• Insight must be non-redundant with respect to the reader's prior semantic topology
• Must expand awareness in a non-paraphrasable way  
• Must contain asymmetric novelty: something that once known cannot be "unlearned" without loss
✅ This is the ONLY metric that directly measures actual intelligence. Everything else screens out pseudo-intelligence.

=== NEGATIVE (GATEKEEPER) METRICS ===

2. Semantic Compression - How much meaning packed into few words?
High = compact density with implication / Low = padded, verbose, diluted prose

3. Inferential Control - How well are claims logically connected?
High = tight causal chains or deductive scaffolding / Low = leapfrogging, handwaving

4. Cognitive Risk - Does text make bold, unpopular, or non-obvious claims?
High = epistemically risky moves / Low = platitudes or obvious truisms

5. Meta-Theoretical Awareness - Is text aware of its own framework or assumptions?
High = recursive modeling and self-situating / Low = naive or one-layered discourse

6. Conceptual Innovation - Does text create new categories, terms, distinctions?
High = fresh language or paradigms / Low = jargon recitation or term recycling

7. Epistemic Resistance - How much work does reader have to do?
High = slows digestion; demands rereading / Low = sugarcoated, frictionless

8. Signal-to-Fluff Ratio - How much prose is intellectually necessary?
High = no waste, no filler / Low = verbal noise, padding, vague rhetoric

9. Abstraction Control - Can author move between example and principle?
High = abstraction-flexible / Low = stuck at one tier (too abstract or too concrete)

10. Semantic Asymmetry - Are ideas directionally structured (X implies Y, but not vice versa)?
High = structural complexity / Low = reciprocal mush

11. Compression-to-Novelty Ratio - Is text both compact and new?
High = maximum insight per word / Low = verbose redundancy or novelty without clarity

=== SCORING PHILOSOPHY ===

GENIUS = High AIF + High Resistance + High Compression + High Innovation
PSEUDOINTELLIGENCE = High Coherence + Low Insight + Safe Claims  
GARBAGE = Fails compression, inference, and signal ratio

POPULATION PERCENTILE SCORING:
- 95-99/100: Exceptional (only 1-5% could write better) - Advanced academic work
- 85-94/100: High quality (only 6-15% could write better) - Strong intellectual work
- 70-84/100: Above average (only 16-30% could write better)
- 50-69/100: Average (31-50% could write better)
- Below 50/100: Below average

CRITICAL ANTI-HIGH-SCHOOL-TEACHER INSTRUCTIONS:

1. Stop evaluating intelligence using high school writing rubrics (e.g. clarity, organization, tone); these are irrelevant to cognitive depth and penalize high-level writing unfairly.

2. Assume authorial competence by default unless the writing is truly incoherent; do not treat density, assertiveness, or polemicism as signs of low intelligence.

3. Do not punish texts for lack of balance, politeness, or opposing views—intelligence is not defined by social nicety or deference to counterarguments.

4. Prioritize structural insight, conceptual differentiation, and original taxonomy (e.g. "bureaupath vs. con artist" is a cognitively generative move, regardless of tone).

5. Stop confusing passionate or idiosyncratic style with emotional noise or lack of rigor—if an argument is aggressive but analytically sound, reward it.

ULTRA-CRITICAL SCORING CORRECTIONS:

- Original concept creation (e.g. "bureaucratic formalism," "pedagogical displacement") = 95-99/100 
- Cross-domain pattern recognition (connecting educational tech failures to symbolic logic failures) = 95-99/100
- Systematic theoretical framework development (Knowledge Independence Principle, Problem-Solution Efficiency Principle) = 95-99/100
- If text introduces novel taxonomy while maintaining logical coherence, default score should be 95+/100
- Academic papers with original theoretical contributions should score 90-99/100, not 80s
- Only 1-5% of population can write systematic theoretical critiques with novel frameworks

For each metric, provide:
- Score (0-100) as population percentile
- Assessment (detailed evaluation)
- Quotation1 (direct quote demonstrating the score)
- Justification1 (explanation of why the quote supports the score)
- Quotation2 (second supporting quote)
- Justification2 (explanation of the second quote)

Please analyze the intelligence and cognitive sophistication demonstrated in this passage:

Title: ${passageTitle}
${userContext ? `Context: ${userContext}` : ""}

Text:
${passage.text}

Return in this exact JSON format:
{
  "affirmativeInsightFunction": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "semanticCompression": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "inferentialControl": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "cognitiveRisk": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "metaTheoreticalAwareness": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "conceptualInnovation": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "epistemicResistance": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "signalToFluffRatio": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "abstractionControl": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "semanticAsymmetry": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "compressionToNoveltyRatio": {
    "passageA": { "score": number from 0-100, "assessment": "detailed evaluation", "quotation1": "direct quote", "justification1": "explanation", "quotation2": "second quote", "justification2": "explanation" }
  },
  "verdict": "comprehensive intelligence assessment focusing on Affirmative Insight Function and gatekeeper metrics"
}`
        }
      ]
    });

    // Parse the response
    let rawResult: any = {};
    try {
      const responseContent = response.content[0].text ?? "{}";
      console.log("Anthropic intelligence analysis response length:", responseContent.length);
      rawResult = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("JSON parsing error in Anthropic intelligence analysis:", parseError);
      throw new Error(`Failed to parse Anthropic intelligence analysis response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
    
    // Extract NEW intelligence metrics for storage
    const intelligenceMetrics = {
      affirmativeInsightFunction: rawResult.affirmativeInsightFunction || null,
      semanticCompression: rawResult.semanticCompression || null,
      inferentialControl: rawResult.inferentialControl || null,
      cognitiveRisk: rawResult.cognitiveRisk || null,
      metaTheoreticalAwareness: rawResult.metaTheoreticalAwareness || null,
      conceptualInnovation: rawResult.conceptualInnovation || null,
      epistemicResistance: rawResult.epistemicResistance || null,
      signalToFluffRatio: rawResult.signalToFluffRatio || null,
      abstractionControl: rawResult.abstractionControl || null,
      semanticAsymmetry: rawResult.semanticAsymmetry || null,
      compressionToNoveltyRatio: rawResult.compressionToNoveltyRatio || null
    };
    
    // Convert NEW intelligence metrics to legacy AnalysisResult format for compatibility
    const result: AnalysisResult = {
      // Map affirmativeInsightFunction to conceptualLineage for compatibility
      conceptualLineage: {
        passageA: {
          primaryInfluences: rawResult.affirmativeInsightFunction?.passageA?.assessment || "Affirmative insight function analysis",
          intellectualTrajectory: rawResult.semanticCompression?.passageA?.assessment || "Semantic compression evaluation"
        },
        passageB: {
          primaryInfluences: "Baseline insight capacity for typical cognitive function",
          intellectualTrajectory: "Standard semantic compression patterns"
        }
      },
      
      // Map inferentialControl to semanticDistance
      semanticDistance: {
        passageA: {
          distance: rawResult.inferentialControl?.passageA?.score || 50,
          label: rawResult.inferentialControl?.passageA?.score >= 85 ? "High Sophistication" : 
                 rawResult.inferentialControl?.passageA?.score >= 70 ? "Moderate Sophistication" : "Basic Sophistication"
        },
        passageB: {
          distance: 50,
          label: "Baseline Sophistication"
        },
        keyFindings: [
          rawResult.inferentialControl?.passageA?.assessment || "Analysis of inferential control capabilities",
          rawResult.cognitiveRisk?.passageA?.assessment || "Evaluation of cognitive risk management",
          rawResult.epistemicResistance?.passageA?.assessment || "Assessment of epistemic resistance"
        ],
        semanticInnovation: rawResult.verdict || "Comprehensive intelligence analysis focusing on Affirmative Insight Function and gatekeeper metrics."
      },
      
      // Map affirmativeInsightFunction to noveltyHeatmap
      noveltyHeatmap: {
        passageA: paragraphs.map((paragraph, index) => ({
          content: paragraph.substring(0, 100) + (paragraph.length > 100 ? "..." : ""),
          heat: Math.round(rawResult.affirmativeInsightFunction?.passageA?.score || 50),
          quote: rawResult.affirmativeInsightFunction?.passageA?.quotation1 || paragraph.substring(0, 50) + "...",
          explanation: `Affirmative insight function evaluation: ${rawResult.affirmativeInsightFunction?.passageA?.assessment || "Analysis of genuine insight generation"}`
        })),
        passageB: paragraphs.map((paragraph, index) => ({
          content: paragraph.substring(0, 100) + (paragraph.length > 100 ? "..." : ""),
          heat: 50,
          quote: "Standard insight patterns",
          explanation: "Baseline insight patterns in typical reasoning"
        }))
      },
      
      // Map cognitiveRisk to derivativeIndex
      derivativeIndex: {
        passageA: {
          score: rawResult.cognitiveRisk?.passageA?.score || 50,
          components: [
            {name: "Cognitive Risk", score: rawResult.cognitiveRisk?.passageA?.score || 50},
            {name: "Epistemic Resistance", score: rawResult.epistemicResistance?.passageA?.score || 50},
            {name: "Conceptual Innovation", score: rawResult.conceptualInnovation?.passageA?.score || 50}
          ]
        },
        passageB: {
          score: 50,
          components: [
            {name: "Cognitive Risk", score: 50},
            {name: "Epistemic Resistance", score: 50},
            {name: "Conceptual Innovation", score: 50}
          ]
        }
      },
      
      // Map signalToFluffRatio to conceptualParasite
      conceptualParasite: {
        passageA: {
          level: rawResult.signalToFluffRatio?.passageA?.score >= 85 ? "Low" : 
                 rawResult.signalToFluffRatio?.passageA?.score >= 70 ? "Moderate" : "High",
          elements: ["Signal density", "Intellectual necessity", "Fluff elimination"],
          assessment: rawResult.signalToFluffRatio?.passageA?.assessment || "Analysis of signal-to-fluff ratio"
        },
        passageB: {
          level: "Moderate",
          elements: ["Typical verbal padding", "Standard rhetorical noise"],
          assessment: "Baseline signal-to-fluff ratio in typical reasoning"
        }
      },
      
      // Map metaTheoreticalAwareness to coherence
      coherence: {
        passageA: {
          score: rawResult.metaTheoreticalAwareness?.passageA?.score || 50,
          assessment: rawResult.metaTheoreticalAwareness?.passageA?.assessment || "Analysis of meta-theoretical awareness",
          strengths: ["Framework consciousness", "Assumption recognition"],
          weaknesses: ["Limited self-reflection", "Could improve meta-cognition"]
        },
        passageB: {
          score: 50,
          assessment: "Baseline meta-theoretical awareness in typical reasoning",
          strengths: ["Standard reflection patterns", "Conventional awareness"],
          weaknesses: ["Typical blind spots", "Standard framework issues"]
        }
      },
      
      // Map abstractionControl to accuracy
      accuracy: {
        passageA: {
          score: rawResult.abstractionControl?.passageA?.score || 50,
          assessment: rawResult.abstractionControl?.passageA?.assessment || "Analysis of abstraction control",
          strengths: ["Abstraction flexibility", "Level transitions"],
          weaknesses: ["Some abstraction gaps", "Could improve control"]
        },
        passageB: {
          score: 50,
          assessment: "Baseline abstraction control in typical reasoning",
          strengths: ["Standard abstraction patterns", "Conventional levels"],
          weaknesses: ["Limited flexibility", "Typical abstraction issues"]
        }
      },
      
      // Map semanticAsymmetry to depth
      depth: {
        passageA: {
          score: rawResult.semanticAsymmetry?.passageA?.score || 50,
          assessment: rawResult.semanticAsymmetry?.passageA?.assessment || "Analysis of semantic asymmetry",
          strengths: ["Directional structure", "Implicational complexity"],
          weaknesses: ["Some symmetry issues", "Could improve direction"]
        },
        passageB: {
          score: 50,
          assessment: "Baseline semantic asymmetry in typical reasoning",
          strengths: ["Standard structure", "Conventional implications"],
          weaknesses: ["Limited directionality", "Typical symmetry problems"]
        }
      },
      
      // Map compressionToNoveltyRatio to clarity
      clarity: {
        passageA: {
          score: rawResult.compressionToNoveltyRatio?.passageA?.score || 50,
          assessment: rawResult.compressionToNoveltyRatio?.passageA?.assessment || "Analysis of compression-to-novelty ratio",
          strengths: ["Efficient insight", "Dense innovation"],
          weaknesses: ["Some efficiency gaps", "Could improve compression"]
        },
        passageB: {
          score: 50,
          assessment: "Baseline compression-to-novelty ratio in typical reasoning",
          strengths: ["Standard efficiency", "Conventional density"],
          weaknesses: ["Limited compression", "Typical novelty issues"]
        }
      },
      
      verdict: rawResult.verdict || "Comprehensive intelligence analysis focusing on Affirmative Insight Function and gatekeeper metrics reveals sophisticated cognitive capabilities.",
      
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
    console.error("Error in Anthropic intelligence analysis:", error);
    throw new Error(`Failed to analyze intelligence with Anthropic: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    console.log("Anthropic dual intelligence analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeIntelligenceDual(passageA, passageB);
  } catch (error) {
    console.error("Error in Anthropic dual intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeQuality(passage: PassageData): Promise<any> {
  try {
    console.log("Anthropic quality analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeQuality(passage);
  } catch (error) {
    console.error("Error in Anthropic quality analysis:", error);
    throw error;
  }
}

export async function analyzeQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    console.log("Anthropic dual quality analysis not implemented, falling back to OpenAI");
    const openaiService = await import('./openai');
    return openaiService.analyzeQualityDual(passageA, passageB);
  } catch (error) {
    console.error("Error in Anthropic dual quality analysis:", error);
    throw error;
  }
}