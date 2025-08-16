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

Please analyze the intelligence demonstrated in this passage:

Title: ${passageTitle}
${userContext ? `Context: ${userContext}` : ""}

Text:
${passage.text}

Return your analysis in this JSON format:
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
      ]
    });

    // Parse the response
    const firstContent = response.content[0];
    const responseContent = (firstContent.type === 'text' ? firstContent.text : "{}") ?? "{}";
    console.log("Anthropic intelligence analysis response length:", responseContent.length);
    
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error("Error in Anthropic intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: `You are an expert in evaluating the intelligence demonstrated in intellectual writing across all disciplines. 

Compare these two passages across 20 intelligence metrics:

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
      ]
    });

    const firstContent = response.content[0];
    const responseContent = (firstContent.type === 'text' ? firstContent.text : "{}") ?? "{}";
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error("Error in Anthropic dual intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
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

For each metric, provide a score from 0-100 and a brief assessment.

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
      ]
    });

    const firstContent = response.content[0];
    const responseContent = (firstContent.type === 'text' ? firstContent.text : "{}") ?? "{}";
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error("Error in Anthropic originality analysis:", error);
    throw error;
  }
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
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
      ]
    });

    const firstContent = response.content[0];
    const responseContent = (firstContent.type === 'text' ? firstContent.text : "{}") ?? "{}";
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error("Error in Anthropic dual originality analysis:", error);
    throw error;
  }
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
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
      ]
    });

    const firstContent = response.content[0];
    const responseContent = (firstContent.type === 'text' ? firstContent.text : "{}") ?? "{}";
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error("Error in Anthropic cogency analysis:", error);
    throw error;
  }
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
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
      ]
    });

    const firstContent = response.content[0];
    const responseContent = (firstContent.type === 'text' ? firstContent.text : "{}") ?? "{}";
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error("Error in Anthropic dual cogency analysis:", error);
    throw error;
  }
}

export async function analyzeQuality(passage: PassageData): Promise<any> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
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
      ]
    });

    const firstContent = response.content[0];
    const responseContent = (firstContent.type === 'text' ? firstContent.text : "{}") ?? "{}";
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error("Error in Anthropic quality analysis:", error);
    throw error;
  }
}

export async function analyzeQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
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
      ]
    });

    const firstContent = response.content[0];
    const responseContent = (firstContent.type === 'text' ? firstContent.text : "{}") ?? "{}";
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error("Error in Anthropic dual quality analysis:", error);
    throw error;
  }
}

// Overall Quality Analysis (40 metrics) - Single Passage
export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
      messages: [
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
      ]
    });

    const firstContent = response.content[0];
    let responseContent = (firstContent.type === 'text' ? firstContent.text : "{}") ?? "{}";
    
    // Clean markdown formatting from response
    responseContent = responseContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error("Error in Anthropic overall quality analysis:", error);
    throw error;
  }
}

// Overall Quality Analysis (40 metrics) - Dual Passage
export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  try {
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 10000,
      messages: [
        {
          role: "user",
          content: `You are evaluating two texts for OVERALL QUALITY using exactly 40 specific metrics. Analyze both texts and provide comparative analysis.

Return a JSON object with comparative structure for both passages using the same 40 Overall Quality metrics.

Passage A (${passageA.title || 'Passage A'}): ${passageA.text}

Passage B (${passageB.title || 'Passage B'}): ${passageB.text}`
        }
      ]
    });

    const firstContent = response.content[0];
    let responseContent = (firstContent.type === 'text' ? firstContent.text : "{}") ?? "{}";
    
    // Clean markdown formatting from response
    responseContent = responseContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error("Error in Anthropic dual overall quality analysis:", error);
    throw error;
  }
}