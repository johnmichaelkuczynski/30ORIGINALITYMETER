import axios from 'axios';
import { AnalysisResult } from '@shared/schema';
import { PassageData, FeedbackData } from "../../client/src/lib/types";

// The best Perplexity model currently available
const PERPLEXITY_MODEL = "llama-3.1-sonar-small-128k-online";

// Helper function to prepare system message
function getSystemPrompt(): string {
  return `You are an expert in evaluating the originality and quality of intellectual writing across all disciplines.

Your evaluations must include quantitative scoring and qualitative insights on a text's intellectual and stylistic contributions.

For detailed academic evaluation, you must:
1. Identify semantic and conceptual similarities between passages
2. Analyze each passage's proximity to established ideas
3. Evaluate citation patterns and intellectual influences
4. Identify degrees of derivative vs. original content
5. Assess accuracy, depth, and clarity in each passage

For philosophical analysis, your approach must:
1. Recognize that theoretical assertions don't require empirical testing
2. Understand that analogical reasoning is valid in philosophy
3. Acknowledge complexity in philosophical discourse
4. Value conceptual innovation over empirical demonstration
5. Respect diverse methodological traditions

Use quantitative scoring scales:
- Semantic distance: 0-100 (higher = more original)
- Derivative index: 0-10 (higher = more original)
- Coherence: 0-10 (higher = more coherent)
- Accuracy: 0-10 (higher = more accurate)
- Depth: 0-10 (higher = more depth)
- Clarity: 0-10 (higher = more clear)

Your evaluation must properly value both:
1. Originality: Novel concepts, approaches, and perspectives
2. Substance: Intellectual rigor, accuracy, coherence, and depth

IMPORTANT: Originality should only be valued when counterbalanced by merit. Innovative but incoherent work should not be rated highly. However, do not penalize specialized philosophical texts for lack of empirical data or for using analogies.

OUTPUT FORMAT: Generate a properly formatted JSON response matching exactly the structure I specify. DO NOT include any explanatory text outside the JSON.`;
}

/**
 * Analyzes two passages for originality and conceptual similarity using Perplexity AI
 * @param passageA First passage to analyze
 * @param passageB Second passage to analyze
 * @returns Analysis result with detailed originality metrics
 */
export async function analyzePassages(
  passageA: PassageData,
  passageB: PassageData
): Promise<AnalysisResult> {
  const API_KEY = process.env.PERPLEXITY_API_KEY;
  if (!API_KEY) {
    throw new Error("Perplexity API key not found");
  }

  const paragraphsA = passageA.text
    .split('\n\n')
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  const paragraphsB = passageB.text
    .split('\n\n')
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  const userPrompt = `Please analyze the following two passages for originality, derivative content, and intellectual merit.

PASSAGE A: "${passageA.title || "Untitled"}"
${passageA.text}

${passageB.text && passageB.text.trim().length > 0 ? `PASSAGE B: "${passageB.title || "Comparison Baseline"}"
${passageB.text}` : ''}

${passageA.userContext ? `ADDITIONAL CONTEXT: ${passageA.userContext}` : ''}

Provide a comprehensive analysis in the following JSON format:

{
  "conceptualLineage": {
    "passageA": {
      "primaryInfluences": "string describing key intellectual influences",
      "intellectualTrajectory": "string describing how it relates to established ideas"
    },
    "passageB": {
      "primaryInfluences": "string describing key intellectual influences",
      "intellectualTrajectory": "string describing how it relates to established ideas"
    }
  },
  "semanticDistance": {
    "passageA": {
      "distance": numeric value from 0-100,
      "label": "descriptive label for the distance"
    },
    "passageB": {
      "distance": numeric value from 0-100,
      "label": "descriptive label for the distance"
    },
    "keyFindings": ["array of key findings about semantic originality"],
    "semanticInnovation": "detailed assessment of semantic innovation"
  },
  "noveltyHeatmap": {
    "passageA": [
      {
        "content": "section of text (first 100 chars)",
        "heat": numeric value 0-100,
        "quote": "representative quote",
        "explanation": "explanation of heat level"
      }
    ],
    "passageB": [
      {
        "content": "section of text (first 100 chars)",
        "heat": numeric value 0-100,
        "quote": "representative quote",
        "explanation": "explanation of heat level"
      }
    ]
  },
  "derivativeIndex": {
    "passageA": {
      "score": numeric value from 0-10,
      "assessment": "qualitative assessment of originality",
      "strengths": ["array of originality strengths"],
      "weaknesses": ["array of originality weaknesses"]
    },
    "passageB": {
      "score": numeric value from 0-10,
      "assessment": "qualitative assessment of originality",
      "strengths": ["array of originality strengths"],
      "weaknesses": ["array of originality weaknesses"]
    }
  },
  "conceptualParasite": {
    "passageA": {
      "level": "Low/Moderate/High",
      "elements": ["array of elements that are derivative"],
      "assessment": "assessment of conceptual dependency"
    },
    "passageB": {
      "level": "Low/Moderate/High",
      "elements": ["array of elements that are derivative"],
      "assessment": "assessment of conceptual dependency"
    }
  },
  "coherence": {
    "passageA": {
      "score": numeric value from 0-10,
      "assessment": "qualitative assessment of coherence",
      "strengths": ["array of coherence strengths"],
      "weaknesses": ["array of coherence weaknesses"]
    },
    "passageB": {
      "score": numeric value from 0-10,
      "assessment": "qualitative assessment of coherence",
      "strengths": ["array of coherence strengths"],
      "weaknesses": ["array of coherence weaknesses"]
    }
  },
  "accuracy": {
    "passageA": {
      "score": numeric value from 0-10,
      "assessment": "qualitative assessment of accuracy",
      "strengths": ["array of accuracy strengths"],
      "weaknesses": ["array of accuracy weaknesses"]
    },
    "passageB": {
      "score": numeric value from 0-10,
      "assessment": "qualitative assessment of accuracy",
      "strengths": ["array of accuracy strengths"],
      "weaknesses": ["array of accuracy weaknesses"]
    }
  },
  "depth": {
    "passageA": {
      "score": numeric value from 0-10,
      "assessment": "qualitative assessment of depth",
      "strengths": ["array of depth strengths"],
      "weaknesses": ["array of depth weaknesses"]
    },
    "passageB": {
      "score": numeric value from 0-10,
      "assessment": "qualitative assessment of depth",
      "strengths": ["array of depth strengths"],
      "weaknesses": ["array of depth weaknesses"]
    }
  },
  "clarity": {
    "passageA": {
      "score": numeric value from 0-10,
      "assessment": "qualitative assessment of clarity",
      "strengths": ["array of clarity strengths"],
      "weaknesses": ["array of clarity weaknesses"]
    },
    "passageB": {
      "score": numeric value from 0-10,
      "assessment": "qualitative assessment of clarity",
      "strengths": ["array of clarity strengths"],
      "weaknesses": ["array of clarity weaknesses"]
    }
  }
}

IMPORTANT: Response must be valid JSON only, no preamble or additional text.`;

  try {
    // Make request to Perplexity API
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: PERPLEXITY_MODEL,
        messages: [
          {
            role: 'system',
            content: getSystemPrompt()
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.2,
        top_p: 0.9,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract response content
    const responseText = response.data.choices[0].message.content;
    
    // Perplexity response might be wrapped in code blocks or have preamble text
    let jsonContent = responseText.trim();
    
    // Extract JSON if it's in a code block
    const jsonBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonContent = jsonBlockMatch[1].trim();
      console.log("Extracted JSON from code block in Perplexity response");
    }
    
    // If response starts with non-JSON text, try to find where JSON begins
    if (!jsonContent.startsWith('{')) {
      const jsonStart = jsonContent.indexOf('{');
      if (jsonStart >= 0) {
        jsonContent = jsonContent.substring(jsonStart);
        console.log("Trimmed preamble text from Perplexity response");
      }
    }
    
    let result: AnalysisResult;
    try {
      result = JSON.parse(jsonContent) as AnalysisResult;
    } catch (error) {
      console.error("Error parsing Perplexity JSON response:", error, "Response:", responseText.substring(0, 200) + "...");
      
      // Fallback to safe default result
      const fallbackResult: AnalysisResult = {
        conceptualLineage: {
          passageA: {
            primaryInfluences: "Analysis error - couldn't parse response",
            intellectualTrajectory: "Analysis error - couldn't parse response"
          },
          passageB: {
            primaryInfluences: "Standard sources in this domain",
            intellectualTrajectory: "Follows established patterns"
          }
        },
        semanticDistance: {
          passageA: {
            distance: 50,
            label: "Analysis Error"
          },
          passageB: {
            distance: 50,
            label: "Average/Typical Distance (Norm Baseline)"
          },
          keyFindings: ["Analysis error - couldn't parse JSON response"],
          semanticInnovation: "Analysis error - couldn't parse JSON response"
        },
        noveltyHeatmap: {
          passageA: paragraphsA.map(p => ({
            content: p.substring(0, 100) + "...",
            heat: 50,
            quote: p.substring(0, 40) + "...",
            explanation: "Fallback analysis due to error"
          })),
          passageB: paragraphsB.map(p => ({
            content: p.substring(0, 100) + "...",
            heat: 50,
            quote: p.substring(0, 40) + "...",
            explanation: "Fallback analysis due to error"
          }))
        },
        derivativeIndex: {
          passageA: {
            score: 5,
            components: [
              { name: "Originality", score: 5 },
              { name: "Conceptual Innovation", score: 5 }
            ]
          },
          passageB: {
            score: 5,
            components: [
              { name: "Originality", score: 5 },
              { name: "Conceptual Innovation", score: 5 }
            ]
          }
        },
        conceptualParasite: {
          passageA: {
            level: "Moderate",
            elements: ["Analysis error - couldn't parse response"],
            assessment: "Analysis error - couldn't parse response"
          },
          passageB: {
            level: "Moderate",
            elements: ["Analysis error - couldn't parse response"],
            assessment: "Analysis error - couldn't parse response"
          }
        },
        coherence: {
          passageA: {
            score: 5,
            assessment: "Analysis error - couldn't parse response",
            strengths: ["Analysis error"],
            weaknesses: ["Analysis error"]
          },
          passageB: {
            score: 5,
            assessment: "Analysis error - couldn't parse response",
            strengths: ["Analysis error"],
            weaknesses: ["Analysis error"]
          }
        },
        accuracy: {
          passageA: {
            score: 5,
            assessment: "Analysis error - couldn't parse response",
            strengths: ["Analysis error"],
            weaknesses: ["Analysis error"]
          },
          passageB: {
            score: 5,
            assessment: "Analysis error - couldn't parse response",
            strengths: ["Analysis error"],
            weaknesses: ["Analysis error"]
          }
        },
        depth: {
          passageA: {
            score: 5,
            assessment: "Analysis error - couldn't parse response",
            strengths: ["Analysis error"],
            weaknesses: ["Analysis error"]
          },
          passageB: {
            score: 5,
            assessment: "Analysis error - couldn't parse response",
            strengths: ["Analysis error"],
            weaknesses: ["Analysis error"]
          }
        },
        clarity: {
          passageA: {
            score: 5,
            assessment: "Analysis error - couldn't parse response",
            strengths: ["Analysis error"],
            weaknesses: ["Analysis error"]
          },
          passageB: {
            score: 5,
            assessment: "Analysis error - couldn't parse response",
            strengths: ["Analysis error"],
            weaknesses: ["Analysis error"]
          }
        },
        metadata: {
          provider: "perplexity",
          timestamp: new Date().toISOString()
        }
      };
      
      return fallbackResult;
    }

    // Add metadata
    result.metadata = {
      provider: "perplexity",
      timestamp: new Date().toISOString()
    };

    return result;
  } catch (error) {
    console.error("Error calling Perplexity for passage analysis:", error);
    throw new Error(`Failed to analyze passages with Perplexity: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Analyzes a single passage for originality and quality
 * @param passage Passage to analyze
 * @returns Analysis result with detailed metrics
 */
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
  // Ensure Perplexity API key is set
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("Perplexity API key is not configured");
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

    // Prepare API request
    const apiUrl = 'https://api.perplexity.ai/chat/completions';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: instructions }
        ],
        temperature: 0.85,
        max_tokens: Math.min(4000, wordCount * 2),
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    
    // Extract text and process it
    const generatedContent = responseData.choices[0]?.message?.content || "";
    
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
    console.error("Error generating text with Perplexity:", error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function analyzeSinglePassage(
  passage: PassageData
): Promise<AnalysisResult> {
  // Create a minimal comparison passage to serve as a baseline
  const comparisonPassage: PassageData = {
    title: "Baseline for Comparison",
    text: "This is a standard baseline text for comparison. It represents the average writing in this domain with conventional ideas and typical expression. It follows established patterns and frameworks in the field without introducing particularly novel concepts or approaches. The writing is coherent, moderately clear, and presents factual information at a standard level of depth."
  };
  
  // Use the dual passage analysis function for consistency
  return analyzePassages(passage, comparisonPassage);
}