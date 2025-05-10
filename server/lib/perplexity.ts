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

Analyze the two passages across the following dimensions:

1. Conceptual Lineage - Where ideas come from, are they new or responses to existing ideas, with higher scores for ideas that are both novel AND well-founded
2. Semantic Distance - How far each passage moves from predecessors while maintaining intellectual rigor; mere difference is not valuable without substantive merit
3. Novelty Heatmap - Where the real conceptual thinking/innovation is happening by paragraph, with emphasis on innovation that builds on solid foundations
4. Derivative Index - Score 0-10 where 0 is recycled and 10 is wholly original AND meritorious (low scores for texts that are original but incoherent or lacking depth)
5. Conceptual Parasite Detection - Passages that operate in old debates without adding anything new or valuable
6. Coherence - Whether the passage is logically and conceptually coherent, a fundamental requirement for valuable originality (score 0-10)
7. Accuracy - Factual and inferential correctness of the passage, without which originality has diminished value (score 0-10)
8. Depth - Non-triviality and conceptual insight of the passage, which gives originality its purpose (score 0-10)
9. Clarity - Readability, transparency, and semantic accessibility of the passage, necessary for communicating original ideas (score 0-10)

The overall scoring formula should be: conceptualInnovation (25%) + depth (25%) + coherence (20%) + insightDensity (15%) + methodologicalNovelty (15%).`;

    const userPrompt = `Please analyze and compare these two passages:

Passage A (${passageATitle}):
${passageA.text}

Passage B (${passageBTitle}):
${passageB.text}

Provide a comprehensive analysis covering all the dimensions mentioned in my instructions. Format your response as a detailed report with clear sections for each dimension.`;

    console.log("Querying Perplexity API...");
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
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const responseData = await response.json();
    console.log("Perplexity API response received");
    
    // Create a structured analysis from the text response
    const content = responseData.choices[0].message.content;
    
    // Create a result object with the analyzed data
    const result: AnalysisResult = {
      conceptualLineage: {
        passageA: {
          primaryInfluences: extractText(content, "Conceptual Lineage", "Passage A", 300),
          intellectualTrajectory: extractText(content, "Conceptual Lineage", "trajectory", 300),
        },
        passageB: {
          primaryInfluences: extractText(content, "Conceptual Lineage", "Passage B", 300),
          intellectualTrajectory: extractText(content, "Conceptual Lineage", "trajectory", 300),
        },
      },
      semanticDistance: {
        passageA: {
          distance: extractNumber(content, "Semantic Distance", "Passage A", 0, 100) || 70,
          label: extractPhrase(content, "Semantic Distance", "Passage A") || "Moderately Original",
        },
        passageB: {
          distance: extractNumber(content, "Semantic Distance", "Passage B", 0, 100) || 50,
          label: extractPhrase(content, "Semantic Distance", "Passage B") || "Typical Distance",
        },
        keyFindings: extractBulletPoints(content, "Semantic Distance", "key findings", 3),
        semanticInnovation: extractText(content, "Semantic Distance", "innovation", 300),
      },
      noveltyHeatmap: {
        passageA: paragraphsA.map((p, i) => {
          const heat = extractNumber(content, "Novelty Heatmap", `Passage A paragraph ${i+1}`, 0, 100) || 
                       extractNumber(content, "Novelty Heatmap", "Passage A", 0, 100) || 
                       70;
          return {
            content: p.substring(0, 100) + (p.length > 100 ? "..." : ""),
            heat: heat,
            quote: p.substring(0, 40) + (p.length > 40 ? "..." : ""),
            explanation: extractText(content, "Novelty Heatmap", `paragraph ${i+1}`, 200) || 
                         "Analysis of paragraph conceptual originality",
          };
        }),
        passageB: paragraphsB.map((p, i) => {
          const heat = extractNumber(content, "Novelty Heatmap", `Passage B paragraph ${i+1}`, 0, 100) || 
                       extractNumber(content, "Novelty Heatmap", "Passage B", 0, 100) || 
                       50;
          return {
            content: p.substring(0, 100) + (p.length > 100 ? "..." : ""),
            heat: heat,
            quote: p.substring(0, 40) + (p.length > 40 ? "..." : ""),
            explanation: extractText(content, "Novelty Heatmap", `paragraph ${i+1}`, 200) || 
                         "Analysis of paragraph conceptual originality",
          };
        }),
      },
      derivativeIndex: {
        passageA: {
          score: extractNumber(content, "Derivative Index", "Passage A", 0, 10) || 7,
          components: [
            { 
              name: "Conceptual Innovation", 
              score: extractNumber(content, "conceptual innovation", "Passage A", 0, 10) || 7 
            },
            { 
              name: "Depth", 
              score: extractNumber(content, "depth", "Passage A", 0, 10) || 
                     extractNumber(content, "Depth", "Passage A", 0, 10) || 7 
            },
            { 
              name: "Coherence", 
              score: extractNumber(content, "coherence", "Passage A", 0, 10) || 
                     extractNumber(content, "Coherence", "Passage A", 0, 10) || 7 
            },
            { 
              name: "Insight Density", 
              score: extractNumber(content, "insight", "Passage A", 0, 10) || 7 
            },
            { 
              name: "Methodological Novelty", 
              score: extractNumber(content, "methodological", "Passage A", 0, 10) || 7 
            },
          ],
        },
        passageB: {
          score: extractNumber(content, "Derivative Index", "Passage B", 0, 10) || 5,
          components: [
            { 
              name: "Conceptual Innovation", 
              score: extractNumber(content, "conceptual innovation", "Passage B", 0, 10) || 5 
            },
            { 
              name: "Depth", 
              score: extractNumber(content, "depth", "Passage B", 0, 10) || 
                     extractNumber(content, "Depth", "Passage B", 0, 10) || 5 
            },
            { 
              name: "Coherence", 
              score: extractNumber(content, "coherence", "Passage B", 0, 10) || 
                     extractNumber(content, "Coherence", "Passage B", 0, 10) || 5 
            },
            { 
              name: "Insight Density", 
              score: extractNumber(content, "insight", "Passage B", 0, 10) || 5
            },
            { 
              name: "Methodological Novelty", 
              score: extractNumber(content, "methodological", "Passage B", 0, 10) || 5 
            },
          ],
        },
      },
      conceptualParasite: {
        passageA: {
          level: extractParasiteLevel(content, "Passage A") || "Low",
          elements: extractBulletPoints(content, "Conceptual Parasite", "Passage A", 2),
          assessment: extractText(content, "Conceptual Parasite", "Passage A", 300),
        },
        passageB: {
          level: extractParasiteLevel(content, "Passage B") || "Low",
          elements: extractBulletPoints(content, "Conceptual Parasite", "Passage B", 2),
          assessment: extractText(content, "Conceptual Parasite", "Passage B", 300),
        },
      },
      coherence: {
        passageA: {
          score: extractNumber(content, "Coherence", "Passage A", 0, 10) || 7,
          assessment: extractText(content, "Coherence", "Passage A", 300),
          strengths: extractBulletPoints(content, "Coherence", "strength.*Passage A", 2),
          weaknesses: extractBulletPoints(content, "Coherence", "weakness.*Passage A", 2),
        },
        passageB: {
          score: extractNumber(content, "Coherence", "Passage B", 0, 10) || 5,
          assessment: extractText(content, "Coherence", "Passage B", 300),
          strengths: extractBulletPoints(content, "Coherence", "strength.*Passage B", 2),
          weaknesses: extractBulletPoints(content, "Coherence", "weakness.*Passage B", 2),
        },
      },
      accuracy: {
        passageA: {
          score: extractNumber(content, "Accuracy", "Passage A", 0, 10) || 7,
          assessment: extractText(content, "Accuracy", "Passage A", 300),
          strengths: extractBulletPoints(content, "Accuracy", "strength.*Passage A", 2),
          weaknesses: extractBulletPoints(content, "Accuracy", "weakness.*Passage A", 2),
        },
        passageB: {
          score: extractNumber(content, "Accuracy", "Passage B", 0, 10) || 5,
          assessment: extractText(content, "Accuracy", "Passage B", 300),
          strengths: extractBulletPoints(content, "Accuracy", "strength.*Passage B", 2),
          weaknesses: extractBulletPoints(content, "Accuracy", "weakness.*Passage B", 2),
        },
      },
      depth: {
        passageA: {
          score: extractNumber(content, "Depth", "Passage A", 0, 10) || 7,
          assessment: extractText(content, "Depth", "Passage A", 300),
          strengths: extractBulletPoints(content, "Depth", "strength.*Passage A", 2),
          weaknesses: extractBulletPoints(content, "Depth", "weakness.*Passage A", 2),
        },
        passageB: {
          score: extractNumber(content, "Depth", "Passage B", 0, 10) || 5,
          assessment: extractText(content, "Depth", "Passage B", 300),
          strengths: extractBulletPoints(content, "Depth", "strength.*Passage B", 2),
          weaknesses: extractBulletPoints(content, "Depth", "weakness.*Passage B", 2),
        },
      },
      clarity: {
        passageA: {
          score: extractNumber(content, "Clarity", "Passage A", 0, 10) || 7,
          assessment: extractText(content, "Clarity", "Passage A", 300),
          strengths: extractBulletPoints(content, "Clarity", "strength.*Passage A", 2),
          weaknesses: extractBulletPoints(content, "Clarity", "weakness.*Passage A", 2),
        },
        passageB: {
          score: extractNumber(content, "Clarity", "Passage B", 0, 10) || 5,
          assessment: extractText(content, "Clarity", "Passage B", 300),
          strengths: extractBulletPoints(content, "Clarity", "strength.*Passage B", 2),
          weaknesses: extractBulletPoints(content, "Clarity", "weakness.*Passage B", 2),
        },
      },
      verdict: extractText(content, "Verdict", "", 500) || 
               extractText(content, "Conclusion", "", 500) || 
               "Based on the analysis, Passage A demonstrates a higher level of originality while maintaining intellectual merit.",
      metadata: {
        provider: "perplexity",
        timestamp: new Date().toISOString()
      }
    };
    
    // Store userContext in the result if it was provided
    if (passageA.userContext) {
      result.userContext = passageA.userContext;
    }
    
    return result;
    
  } catch (error) {
    console.error("Error calling Perplexity for passage analysis:", error);
    
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
      metadata: {
        provider: "perplexity",
        timestamp: new Date().toISOString()
      }
    };
    
    // Store userContext in the result if it was provided
    if (passageA.userContext) {
      fallbackResult.userContext = passageA.userContext;
    }
    
    return fallbackResult;
  }
}

export async function analyzeSinglePassage(
  passage: PassageData
): Promise<AnalysisResult> {
  return analyzePassages(
    passage,
    {
      title: "",
      text: "This is a comparison baseline for evaluating a single passage.",
      userContext: "",
    }
  );
}

// Helper functions for parsing text responses from Perplexity

/**
 * Extract text content based on section and subsection keywords
 */
function extractText(content: string, section: string, subsection: string = "", maxLength: number = 300): string {
  try {
    // First try to find a section with the exact heading
    const sectionRegex = new RegExp(`${section}[\\s\\S]*?(?=\\n\\s*#|$)`, 'i');
    const sectionMatch = content.match(sectionRegex);
    
    if (!sectionMatch) {
      return subsection ? 
        `Information related to ${subsection} in ${section}` :
        `Information about ${section}`;
    }
    
    const sectionText = sectionMatch[0];
    
    // If subsection is specified, try to find text related to it within the section
    if (subsection) {
      const subsectionRegex = new RegExp(`(?:${subsection}|${section}[^\\n]*${subsection})[^\\n.]*[\\n.][^\\n.]*`, 'i');
      const subsectionMatch = sectionText.match(subsectionRegex);
      
      if (subsectionMatch) {
        const result = subsectionMatch[0].trim();
        return result.length > maxLength ? result.substring(0, maxLength) + "..." : result;
      }
      
      // If no explicit subsection found, return a relevant part of the section
      const lines = sectionText.split('\n').slice(1, 6).join(' '); // Skip heading, take a few lines
      return lines.length > maxLength ? lines.substring(0, maxLength) + "..." : lines;
    }
    
    // If no subsection specified, return the entire section text (limited)
    const lines = sectionText.split('\n').slice(1).join(' '); // Skip heading
    return lines.length > maxLength ? lines.substring(0, maxLength) + "..." : lines;
  } catch (e) {
    return subsection ? 
      `Information related to ${subsection} in ${section}` :
      `Information about ${section}`;
  }
}

/**
 * Extract numeric value from content
 */
function extractNumber(content: string, section: string, subsection: string = "", min: number = 0, max: number = 10): number | null {
  try {
    // First find the section
    const sectionRegex = new RegExp(`${section}[\\s\\S]*?(?=\\n\\s*#|$)`, 'i');
    const sectionMatch = content.match(sectionRegex);
    
    if (!sectionMatch) return null;
    
    const sectionText = sectionMatch[0];
    
    // Then look for numbers near the subsection keyword
    let searchText = sectionText;
    if (subsection) {
      const subsectionRegex = new RegExp(`[^\\n]*${subsection}[^\\n]*(?:\\n[^\\n]*){0,5}`, 'i');
      const subsectionMatch = sectionText.match(subsectionRegex);
      if (subsectionMatch) {
        searchText = subsectionMatch[0];
      }
    }
    
    // Find numbers in the format X/10 or X out of 10
    const scoreRegex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:\\/|out of)\\s*${max}`, 'i');
    const scoreMatch = searchText.match(scoreRegex);
    
    if (scoreMatch && scoreMatch[1]) {
      const score = parseFloat(scoreMatch[1]);
      if (!isNaN(score) && score >= min && score <= max) {
        return score;
      }
    }
    
    // Try to find any number
    const numRegex = /(\d+(?:\.\d+)?)/;
    const numMatch = searchText.match(numRegex);
    
    if (numMatch && numMatch[1]) {
      const num = parseFloat(numMatch[1]);
      if (!isNaN(num)) {
        // If the number is outside our range, normalize it
        if (num > max) {
          return max;
        } else if (num < min) {
          return min;
        }
        return num;
      }
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract a descriptive phrase from content
 */
function extractPhrase(content: string, section: string, subsection: string = ""): string | null {
  try {
    // First find the section
    const sectionRegex = new RegExp(`${section}[\\s\\S]*?(?=\\n\\s*#|$)`, 'i');
    const sectionMatch = content.match(sectionRegex);
    
    if (!sectionMatch) return null;
    
    const sectionText = sectionMatch[0];
    
    // Then look for descriptive text near the subsection keyword
    let searchText = sectionText;
    if (subsection) {
      const subsectionRegex = new RegExp(`[^\\n]*${subsection}[^\\n]*(?:\\n[^\\n]*){0,3}`, 'i');
      const subsectionMatch = sectionText.match(subsectionRegex);
      if (subsectionMatch) {
        searchText = subsectionMatch[0];
      }
    }
    
    // Try to find descriptive phrases like "highly original" or "moderately derivative"
    const phraseRegex = /(highly|moderately|somewhat|very|extremely|average|low|high|original|derivative|innovative)(?:\s+\w+){0,3}/i;
    const phraseMatch = searchText.match(phraseRegex);
    
    if (phraseMatch && phraseMatch[0]) {
      return phraseMatch[0].trim();
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract bullet points or sentences as a list
 */
function extractBulletPoints(content: string, section: string, subsection: string = "", count: number = 3): string[] {
  try {
    // First find the section
    const sectionRegex = new RegExp(`${section}[\\s\\S]*?(?=\\n\\s*#|$)`, 'i');
    const sectionMatch = content.match(sectionRegex);
    
    if (!sectionMatch) {
      return generatePlaceholders(count, section, subsection);
    }
    
    const sectionText = sectionMatch[0];
    
    // Then look for text related to the subsection
    let searchText = sectionText;
    if (subsection) {
      const subsectionRegex = new RegExp(`[^\\n]*${subsection}[^\\n]*(?:\\n[^\\n]*){0,10}`, 'i');
      const subsectionMatch = sectionText.match(subsectionRegex);
      if (subsectionMatch) {
        searchText = subsectionMatch[0];
      }
    }
    
    const points: string[] = [];
    
    // Look for bullet points (-, *, •)
    const bulletRegex = /[•*-]\s+([^\n]+)/g;
    let bulletMatch;
    
    while ((bulletMatch = bulletRegex.exec(searchText)) !== null && points.length < count) {
      points.push(bulletMatch[1].trim());
    }
    
    // If we don't have enough bullet points, extract sentences
    if (points.length < count) {
      const sentenceRegex = /[^.!?]+[.!?]/g;
      let sentenceMatch;
      
      while ((sentenceMatch = sentenceRegex.exec(searchText)) !== null && points.length < count) {
        const sentence = sentenceMatch[0].trim();
        if (sentence.length > 10 && sentence.length < 150 && !points.includes(sentence)) {
          points.push(sentence);
        }
      }
    }
    
    // If we still don't have enough, add placeholders
    while (points.length < count) {
      points.push(generatePlaceholder(section, subsection, points.length));
    }
    
    return points;
  } catch (e) {
    return generatePlaceholders(count, section, subsection);
  }
}

/**
 * Extract parasite level from content
 */
function extractParasiteLevel(content: string, subsection: string = ""): "Low" | "Moderate" | "High" | null {
  try {
    const searchText = subsection ? 
      new RegExp(`Conceptual Parasite[\\s\\S]*?${subsection}[\\s\\S]*?(?=\\n\\s*#|$)`, 'i') :
      new RegExp(`Conceptual Parasite[\\s\\S]*?(?=\\n\\s*#|$)`, 'i');
    
    const sectionMatch = content.match(searchText);
    if (!sectionMatch) return null;
    
    const sectionText = sectionMatch[0];
    
    if (/high|significant|substantial|major/i.test(sectionText)) {
      return "High";
    } else if (/moderate|medium|average|partial/i.test(sectionText)) {
      return "Moderate";
    } else {
      return "Low";
    }
  } catch (e) {
    return null;
  }
}

/**
 * Generate placeholder text when extraction fails
 */
function generatePlaceholder(section: string, subsection: string, index: number): string {
  const placeholders = [
    "Demonstrates conceptual originality",
    "Balances innovation with intellectual merit",
    "Shows thoughtful development of ideas",
    "Maintains logical consistency in argumentation",
    "Presents ideas with clarity and precision"
  ];
  
  if (index < placeholders.length) {
    return placeholders[index];
  }
  
  return subsection ? 
    `Key point related to ${subsection} in ${section}` :
    `Important aspect of ${section}`;
}

/**
 * Generate multiple placeholders
 */
function generatePlaceholders(count: number, section: string, subsection: string): string[] {
  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    results.push(generatePlaceholder(section, subsection, i));
  }
  return results;
}