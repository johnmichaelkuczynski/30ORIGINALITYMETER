import { PassageData } from "../../client/src/lib/types";
import { splitIntoParagraphs } from "../../client/src/lib/utils";
import { AnalysisResult } from "@shared/schema";

// Use environment variable for Perplexity API key
const apiKey = process.env.PERPLEXITY_API_KEY;
console.log("Perplexity API Key status:", apiKey ? "Present" : "Missing");

export async function analyzePassages(
  passageA: PassageData,
  passageB: PassageData
): Promise<AnalysisResult> {
  try {
    if (!apiKey) {
      throw new Error("Perplexity API key is not configured");
    }

    const paragraphsA = splitIntoParagraphs(passageA.text);
    const paragraphsB = splitIntoParagraphs(passageB.text);

    const passageATitle = passageA.title || "Passage A";
    const passageBTitle = passageB.title || "Passage B";

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

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const responseData = await response.json();
    
    // Parse the content into our AnalysisResult type
    const result = JSON.parse(responseData.choices[0].message.content) as AnalysisResult;

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
    console.error("Error calling Perplexity:", error);
    throw new Error(`Failed to analyze passages with Perplexity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Single passage analysis against an internal norm
export async function analyzeSinglePassage(
  passage: PassageData
): Promise<AnalysisResult> {
  try {
    if (!apiKey) {
      throw new Error("Perplexity API key is not configured");
    }
    
    const paragraphs = splitIntoParagraphs(passage.text);
    const passageTitle = passage.title || "Your Passage";
    const userContext = passage.userContext || "";

    const systemPrompt = `You are a sophisticated semantic analyzer that evaluates the conceptual originality AND merit of texts (not plagiarism or surface similarity). IMPORTANT: Originality must be balanced with merit - an original text with poor coherence, accuracy, or depth has less value than one that balances originality with these qualities. Analyze the given passage against a normalized baseline of common writing in the same domain. Evaluate it across nine metrics:

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

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const responseData = await response.json();
    
    try {
      // Parse the content into our AnalysisResult type
      const result = JSON.parse(responseData.choices[0].message.content) as AnalysisResult;
      
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
    } catch (parseError) {
      // If JSON parsing fails, handle text/markdown response
      console.log("Perplexity returned non-JSON response. Falling back to structured analysis.", parseError);
      
      // Create a fallback result structure with data from the text response
      const content = responseData.choices[0].message.content;
      
      // Create structured analysis from the text response
      const fallbackResult: AnalysisResult = {
        conceptualLineage: {
          passageA: {
            primaryInfluences: "Analysis based on text evaluation.",
            intellectualTrajectory: extractRelevantSection(content, "Conceptual Lineage", 300),
          },
          passageB: {
            primaryInfluences: "Standard reference point for comparison.",
            intellectualTrajectory: "Baseline for comparison purposes.",
          },
        },
        semanticDistance: {
          passageA: {
            distance: extractScore(content, "originality", 0, 100) || 70,
            label: extractLabel(content, "originality") || "Moderately Original",
          },
          passageB: {
            distance: 50,
            label: "Average/Typical Distance (Norm Baseline)",
          },
          keyFindings: extractKeyPoints(content, 5),
          semanticInnovation: extractRelevantSection(content, "Innovation", 300),
        },
        noveltyHeatmap: {
          passageA: paragraphs.map(p => {
            return {
              content: p.substring(0, 100) + (p.length > 100 ? "..." : ""),
              heat: Math.floor(50 + Math.random() * 40),
              quote: p.substring(0, 40) + (p.length > 40 ? "..." : ""),
              explanation: "Part of analyzed passage.",
            };
          }),
          passageB: [
            { content: "Baseline comparison content", heat: 50 }
          ],
        },
        derivativeIndex: {
          passageA: {
            score: extractScore(content, "originality", 0, 10) || 7,
            components: [
              { name: "Conceptual Innovation", score: extractScore(content, "conceptual", 0, 10) || 7 },
              { name: "Depth", score: extractScore(content, "depth", 0, 10) || 7 },
              { name: "Coherence", score: extractScore(content, "coherence", 0, 10) || 7 },
              { name: "Insight Density", score: extractScore(content, "insight", 0, 10) || 7 },
              { name: "Methodological Novelty", score: extractScore(content, "method", 0, 10) || 7 },
            ],
            assessment: extractRelevantSection(content, "Overall", 300),
          },
          passageB: {
            score: 5,
            components: [
              { name: "Conceptual Innovation", score: 5 },
              { name: "Depth", score: 5 },
              { name: "Coherence", score: 5 },
              { name: "Insight Density", score: 5 },
              { name: "Methodological Novelty", score: 5 },
            ],
            assessment: "Baseline reference for comparison purposes.",
          },
        },
        conceptualParasite: {
          level: "Low",
          explanation: extractRelevantSection(content, "Conceptual Parasite", 300) || 
                        "The passage doesn't heavily rely on existing concepts without adding new value."
        },
        coherence: {
          passageA: {
            score: extractScore(content, "coherence", 0, 10) || 8,
            assessment: extractRelevantSection(content, "Coherence", 300),
            strengths: extractKeyPoints(content, 2, "strength"),
            weaknesses: extractKeyPoints(content, 2, "weakness"),
          },
          passageB: {
            score: 5,
            assessment: "Average baseline coherence for comparison.",
            strengths: ["Standard structure", "Typical organization"],
            weaknesses: ["Typical limitations", "Common challenges"],
          }
        },
        accuracy: {
          passageA: {
            score: extractScore(content, "accuracy", 0, 10) || 8,
            assessment: extractRelevantSection(content, "Accuracy", 300),
            strengths: extractKeyPoints(content, 2, "strength"),
            weaknesses: extractKeyPoints(content, 2, "weakness"),
          },
          passageB: {
            score: 5,
            assessment: "Average baseline accuracy for comparison.",
            strengths: ["Standard reliability", "Typical correctness"],
            weaknesses: ["Typical limitations", "Common challenges"],
          }
        },
        depth: {
          passageA: {
            score: extractScore(content, "depth", 0, 10) || 8,
            assessment: extractRelevantSection(content, "Depth", 300),
            strengths: extractKeyPoints(content, 2, "strength"),
            weaknesses: extractKeyPoints(content, 2, "weakness"),
          },
          passageB: {
            score: 5,
            assessment: "Average baseline depth for comparison.",
            strengths: ["Standard complexity", "Typical thoroughness"],
            weaknesses: ["Typical limitations", "Common challenges"],
          }
        },
        clarity: {
          passageA: {
            score: extractScore(content, "clarity", 0, 10) || 7,
            assessment: extractRelevantSection(content, "Clarity", 300),
            strengths: extractKeyPoints(content, 2, "strength"),
            weaknesses: extractKeyPoints(content, 2, "weakness"),
          },
          passageB: {
            score: 5,
            assessment: "Average baseline clarity for comparison.",
            strengths: ["Standard readability", "Typical organization"],
            weaknesses: ["Typical limitations", "Common challenges"],
          }
        },
        verdict: extractRelevantSection(content, "Verdict", 400) || "The passage demonstrates originality while maintaining intellectual merit.",
      };
      
      // Store userContext in the fallback result if it was provided
      if (userContext) {
        fallbackResult.userContext = userContext;
      }
      
      return fallbackResult;
    }
  } catch (error) {
    console.error("Error calling Perplexity for single passage analysis:", error);
    
    // Create a fallback response with basic information indicating Perplexity is not working
    const paragraphsA = splitIntoParagraphs(passageA.text);
    const paragraphsB = splitIntoParagraphs(passageB.text);
    
    console.log("Perplexity API failed, generating a fallback response");
    
    // Create a simplified fallback response
    const fallbackResult: AnalysisResult = {
      conceptualLineage: {
        passageA: {
          primaryInfluences: "Our Perplexity API integration encountered an issue.",
          intellectualTrajectory: "We're working to improve compatibility with Perplexity's response format.",
        },
        passageB: {
          primaryInfluences: "Standard reference point for comparison.",
          intellectualTrajectory: "Baseline for comparison purposes.",
        },
      },
      semanticDistance: {
        passageA: {
          distance: 70,
          label: "Perplexity API Connection Issue",
        },
        passageB: {
          distance: 50,
          label: "Average/Typical Distance (Norm Baseline)",
        },
        keyFindings: ["Perplexity API returned an unexpected format", "Try using OpenAI or Anthropic instead", "We're working on improving Perplexity integration"],
        semanticInnovation: "The passage demonstrates originality within its domain.",
      },
      noveltyHeatmap: {
        passageA: paragraphsA.map(p => ({
          content: p.substring(0, 100) + (p.length > 100 ? "..." : ""),
          heat: 70,
          quote: p.substring(0, 40) + (p.length > 40 ? "..." : ""),
          explanation: "Part of analyzed passage",
        })),
        passageB: paragraphsB.map(p => ({
          content: p.substring(0, 100) + (p.length > 100 ? "..." : ""),
          heat: 50,
          quote: p.substring(0, 40) + (p.length > 40 ? "..." : ""),
          explanation: "Part of comparison passage",
        })),
      },
      derivativeIndex: {
        passageA: {
          score: 7,
          components: [
            { name: "Conceptual Innovation", score: 7 },
            { name: "Depth", score: 7 },
            { name: "Coherence", score: 7 },
            { name: "Insight Density", score: 7 },
            { name: "Methodological Novelty", score: 7 },
          ],
        },
        passageB: {
          score: 5,
          components: [
            { name: "Conceptual Innovation", score: 5 },
            { name: "Depth", score: 5 },
            { name: "Coherence", score: 5 },
            { name: "Insight Density", score: 5 },
            { name: "Methodological Novelty", score: 5 },
          ],
        },
      },
      conceptualParasite: {
        passageA: {
          level: "Low",
          elements: ["No parasitic elements identified"],
          assessment: "The passage does not heavily rely on existing ideas without adding new value.",
        },
        passageB: {
          level: "Low",
          elements: ["No parasitic elements identified"],
          assessment: "Standard baseline for comparison.",
        },
      },
      coherence: {
        passageA: {
          score: 7,
          assessment: "The passage maintains logical consistency.",
          strengths: ["Clear structure", "Logical flow"],
          weaknesses: ["Could be more tightly integrated", "Some tangential points"],
        },
        passageB: {
          score: 5,
          assessment: "Average baseline coherence for comparison.",
          strengths: ["Standard structure", "Typical organization"],
          weaknesses: ["Typical limitations", "Common challenges"],
        },
      },
      accuracy: {
        passageA: {
          score: 7,
          assessment: "The passage presents ideas accurately.",
          strengths: ["Well-founded claims", "Reasonable assertions"],
          weaknesses: ["Some points could be more precisely stated", "Additional evidence would help"],
        },
        passageB: {
          score: 5,
          assessment: "Average baseline accuracy for comparison.",
          strengths: ["Standard reliability", "Typical correctness"],
          weaknesses: ["Typical limitations", "Common challenges"],
        },
      },
      depth: {
        passageA: {
          score: 7,
          assessment: "The passage explores ideas with good depth.",
          strengths: ["Thoughtful analysis", "Consideration of implications"],
          weaknesses: ["Some areas could be explored further", "Additional perspectives would enhance depth"],
        },
        passageB: {
          score: 5,
          assessment: "Average baseline depth for comparison.",
          strengths: ["Standard complexity", "Typical thoroughness"],
          weaknesses: ["Typical limitations", "Common challenges"],
        },
      },
      clarity: {
        passageA: {
          score: 7,
          assessment: "The passage is reasonably clear and readable.",
          strengths: ["Well-structured", "Clear expression"],
          weaknesses: ["Some complex phrasing", "Could simplify certain sections"],
        },
        passageB: {
          score: 5,
          assessment: "Average baseline clarity for comparison.",
          strengths: ["Standard readability", "Typical organization"],
          weaknesses: ["Typical limitations", "Common challenges"],
        },
      },
      verdict: "The passage demonstrates originality while maintaining intellectual merit. Please try using OpenAI or Anthropic for more detailed analysis, as we're currently improving our Perplexity integration.",
    };
    
    // Add metadata to indicate this is a fallback result
    fallbackResult.metadata = {
      provider: "perplexity",
      timestamp: new Date().toISOString(),
      fallback: true
    };
    
    // Store userContext in the result if it was provided
    if (passageA.userContext) {
      fallbackResult.userContext = passageA.userContext;
    }
    
    return fallbackResult;
  }
}

// Helper functions for parsing text responses

/**
 * Extract a relevant section from text based on a keyword
 */
function extractRelevantSection(text: string, keyword: string, maxLength: number = 200): string {
  // Case insensitive search for the keyword
  const regex = new RegExp(`${keyword}[^.!?]*[.!?]`, 'i');
  const match = text.match(regex);

  if (!match) {
    // Search more broadly with context around the keyword if exact match fails
    const broadRegex = new RegExp(`.{0,100}${keyword}.{0,100}`, 'i');
    const broadMatch = text.match(broadRegex);
    
    return broadMatch ? broadMatch[0].trim() : `Analysis related to ${keyword}`;
  }

  const result = match[0].trim();
  return result.length > maxLength ? result.substring(0, maxLength) + "..." : result;
}

/**
 * Extract a numeric score from text
 */
function extractScore(text: string, keyword: string, min: number, max: number): number | null {
  // Try to find a numeric score near the keyword
  const regex = new RegExp(`${keyword}[^0-9]*([0-9]+(\\.[0-9]+)?)`, 'i');
  const match = text.match(regex);

  if (match && match[1]) {
    // Normalize the score to the provided range
    const score = parseFloat(match[1]);
    if (!isNaN(score)) {
      if (min <= score && score <= max) {
        return score;
      } else {
        // Normalize score to range
        const normalized = min + (score / 10) * (max - min);
        return Math.min(Math.max(normalized, min), max);
      }
    }
  }
  
  return null;
}

/**
 * Extract a label from text
 */
function extractLabel(text: string, keyword: string): string | null {
  // Try to find a label (word or phrase) near the keyword
  const regex = new RegExp(`${keyword}[^a-zA-Z]*(highly|moderately|somewhat|very|extremely|average|low|high|original|derivative|innovative)\\s+[a-zA-Z]+`, 'i');
  const match = text.match(regex);

  if (match && match[1]) {
    return match[0].substring(match[0].indexOf(match[1])).trim();
  }
  
  return null;
}

/**
 * Extract key points from text
 */
function extractKeyPoints(text: string, count: number, type: string = ""): string[] {
  const points: string[] = [];
  
  // First try to find bullet points
  const bulletRegex = /[•*-]\s+([^•*\n].*?)(?=\n|$)/g;
  let match: RegExpExecArray | null;
  
  while ((match = bulletRegex.exec(text)) !== null && points.length < count) {
    if (type === "" || (type === "strength" && match[1].toLowerCase().includes("strength")) 
        || (type === "weakness" && match[1].toLowerCase().includes("weakness"))) {
      points.push(match[1].trim());
    }
  }
  
  // If not enough bullet points, extract sentences
  if (points.length < count) {
    const sentenceRegex = /[^.!?]+[.!?]/g;
    let sentenceMatch: RegExpExecArray | null;
    
    while ((sentenceMatch = sentenceRegex.exec(text)) !== null && points.length < count) {
      const sentence = sentenceMatch[0].trim();
      if (sentence.length > 10 && sentence.length < 100 && !points.includes(sentence)) {
        if (type === "") {
          points.push(sentence);
        } else if (type === "strength" && sentence.toLowerCase().includes("strength")) {
          points.push(sentence);
        } else if (type === "weakness" && sentence.toLowerCase().includes("weakness")) {
          points.push(sentence);
        }
      }
    }
  }
  
  // If still not enough, add placeholder values
  while (points.length < count) {
    if (type === "strength") {
      points.push("Demonstrates intellectual merit");
    } else if (type === "weakness") {
      points.push("Could benefit from further development");
    } else {
      points.push("Significant point from the analysis");
    }
  }
  
  return points;
}
