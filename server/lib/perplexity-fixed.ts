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
 * Creates a fallback result for when the analysis fails
 */
function createFallbackResult(): AnalysisResult {
  return {
    conceptualLineage: {
      passageA: {
        primaryInfluences: "Analysis temporarily unavailable",
        intellectualTrajectory: "Analysis temporarily unavailable"
      },
      passageB: {
        primaryInfluences: "Standard sources in this domain",
        intellectualTrajectory: "Follows established patterns"
      }
    },
    semanticDistance: {
      passageA: {
        distance: 50,
        label: "Analysis Unavailable"
      },
      passageB: {
        distance: 50, 
        label: "Average/Typical Distance (Norm Baseline)"
      },
      keyFindings: ["Analysis currently unavailable", "Please try again later", "API connection issue"],
      semanticInnovation: "Analysis currently unavailable - please try again later."
    },
    noveltyHeatmap: {
      passageA: [
        {
          content: "Analysis temporarily unavailable - please try again later.",
          heat: 50
        }
      ],
      passageB: [
        {
          content: "Standard paragraph in this domain.",
          heat: 50
        }
      ]
    },
    derivativeIndex: {
      passageA: {
        score: 5.0,
        assessment: "Analysis temporarily unavailable",
        strengths: ["Please try again later"],
        weaknesses: ["API connection issue"]
      },
      passageB: {
        score: 5.0,
        assessment: "Analysis not available for comparison passage",
        strengths: ["N/A"],
        weaknesses: ["N/A"]
      }
    },
    conceptualParasite: {
      passageA: {
        level: "Moderate",
        assessment: "Analysis temporarily unavailable",
        elements: ["Error"]
      },
      passageB: {
        level: "Moderate",
        assessment: "Analysis not available for comparison passage",
        elements: ["Error"]
      }
    },
    coherence: {
      passageA: {
        score: 5.0,
        assessment: "Analysis temporarily unavailable",
        strengths: ["Please try again later"],
        weaknesses: ["API connection issue"]
      },
      passageB: {
        score: 5.0,
        assessment: "Analysis not available for comparison passage",
        strengths: ["N/A"],
        weaknesses: ["N/A"]
      }
    },
    accuracy: {
      passageA: {
        score: 5.0,
        assessment: "Analysis temporarily unavailable",
        strengths: ["Please try again later"],
        weaknesses: ["API connection issue"]
      },
      passageB: {
        score: 5.0,
        assessment: "Analysis not available for comparison passage",
        strengths: ["N/A"],
        weaknesses: ["N/A"]
      }
    },
    depth: {
      passageA: {
        score: 5.0,
        assessment: "Analysis temporarily unavailable",
        strengths: ["Please try again later"],
        weaknesses: ["API connection issue"]
      },
      passageB: {
        score: 5.0,
        assessment: "Analysis not available for comparison passage",
        strengths: ["N/A"],
        weaknesses: ["N/A"]
      }
    },
    clarity: {
      passageA: {
        score: 5.0,
        assessment: "Analysis temporarily unavailable",
        strengths: ["Please try again later"],
        weaknesses: ["API connection issue"]
      },
      passageB: {
        score: 5.0,
        assessment: "Analysis not available for comparison passage",
        strengths: ["N/A"],
        weaknesses: ["N/A"]
      }
    },
    verdict: "Analysis temporarily unavailable. Please try again later or try a different AI provider.",
    metadata: {
      provider: "perplexity",
      timestamp: new Date().toISOString()
    }
  };
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
  "verdict": "overall verdict on the originality and merit of the passage(s)"
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
      
      // Add metadata
      result.metadata = {
        provider: "perplexity",
        timestamp: new Date().toISOString()
      };
      
      return result;
    } catch (error) {
      console.error("Error parsing Perplexity JSON response:", error, "Response:", responseText.substring(0, 200) + "...");
      return createFallbackResult();
    }
  } catch (error) {
    console.error("Error calling Perplexity for passage analysis:", error);
    return createFallbackResult();
  }
}

/**
 * Analyzes a single passage for originality and quality
 * @param passage Passage to analyze
 * @returns Analysis result with detailed metrics
 */
export async function analyzeSinglePassage(
  passage: PassageData
): Promise<AnalysisResult> {
  // Create a comparison passage for context
  const comparisonPassage: PassageData = {
    title: "Comparison Baseline",
    text: "This is a standard baseline text for comparison purposes. It represents typical writing in this domain with average originality and quality metrics. This text serves as a reference point for evaluating the originality and merit of the submitted passage."
  };
  
  // Use the two-passage analysis method with the second passage as the baseline
  return analyzePassages(passage, comparisonPassage);
}

/**
 * Generates text based on natural language instructions
 * @param instructions Natural language instructions for text generation
 * @returns Generated text and its title
 */
export async function generateTextFromNL(
  instructions: string
): Promise<{ title: string, text: string }> {
  const API_KEY = process.env.PERPLEXITY_API_KEY;
  if (!API_KEY) {
    throw new Error("Perplexity API key not found");
  }

  const systemPrompt = `You are a sophisticated writing assistant capable of generating high-quality, original text based on user instructions. 
Your task is to create content that is:
1. Highly original (avoiding common phrasings and predictable structures)
2. Intellectually substantial (with depth and nuance)
3. Stylistically distinctive
4. Coherent and well-structured

Follow the user's instructions precisely regarding topic, length, style, and any other specifications.`;

  try {
    // Make request to Perplexity API
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: PERPLEXITY_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate text according to these specifications: ${instructions}\n\nProvide a title for the generated text, followed by the full text. Format the response as follows:\n\nTITLE: [Your generated title]\n\n[Your generated text]`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 0.95,
        stream: false
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
    
    // Parse title and text
    const titleMatch = responseText.match(/TITLE:\s*(.+?)(?:\n\n|\r\n\r\n)/);
    const title = titleMatch ? titleMatch[1].trim() : "Generated Text";
    
    // Extract the text content (everything after the title section)
    let text = responseText;
    if (titleMatch) {
      const titleEndIndex = responseText.indexOf(titleMatch[0]) + titleMatch[0].length;
      text = responseText.substring(titleEndIndex).trim();
    }
    
    return { title, text };
  } catch (error) {
    console.error("Error generating text with Perplexity:", error);
    throw new Error(`Failed to generate text with Perplexity: ${error instanceof Error ? error.message : String(error)}`);
  }
}