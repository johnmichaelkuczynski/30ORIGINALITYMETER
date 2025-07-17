import OpenAI from "openai";
import { PassageData, FeedbackData } from "../../client/src/lib/types";
import { AnalysisResult } from "@shared/schema";
import { splitIntoParagraphs } from "../../client/src/lib/utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("OpenAI API Key status:", process.env.OPENAI_API_KEY ? "Present" : "Missing");

// Fast analysis with minimal parameters for immediate response
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
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Analyze these passages for originality efficiently. Return JSON only.`,
        },
        {
          role: "user",
          content: `Compare these passages for originality:

Passage A: ${passageA.text.substring(0, 2000)}...
Passage B: ${passageB.text.substring(0, 2000)}...

Return JSON with basic scores 0-10:
{
  "conceptualLineage": {
    "passageA": {"primaryInfluences": "text", "intellectualTrajectory": "text"},
    "passageB": {"primaryInfluences": "text", "intellectualTrajectory": "text"}
  },
  "semanticDistance": {
    "passageA": {"distance": 50, "label": "Moderate"},
    "passageB": {"distance": 50, "label": "Moderate"},
    "keyFindings": ["finding1", "finding2"],
    "semanticInnovation": "brief analysis"
  },
  "noveltyHeatmap": {
    "passageA": [{"content": "para1", "heat": 70, "quote": "quote", "explanation": "why"}],
    "passageB": [{"content": "para1", "heat": 60, "quote": "quote", "explanation": "why"}]
  },
  "derivativeIndex": {
    "passageA": {"score": 7, "components": [{"name": "Innovation", "score": 7}]},
    "passageB": {"score": 6, "components": [{"name": "Innovation", "score": 6}]}
  },
  "conceptualParasite": {
    "passageA": {"level": "Low", "elements": ["element"], "assessment": "brief"},
    "passageB": {"level": "Moderate", "elements": ["element"], "assessment": "brief"}
  },
  "coherence": {
    "passageA": {"score": 8, "assessment": "coherent", "strengths": ["clear"], "weaknesses": ["minor"]},
    "passageB": {"score": 7, "assessment": "mostly coherent", "strengths": ["logical"], "weaknesses": ["gaps"]}
  },
  "accuracy": {
    "passageA": {"score": 8, "assessment": "accurate", "strengths": ["valid"], "weaknesses": ["minor"]},
    "passageB": {"score": 7, "assessment": "mostly accurate", "strengths": ["sound"], "weaknesses": ["some gaps"]}
  },
  "depth": {
    "passageA": {"score": 8, "assessment": "deep analysis", "strengths": ["insight"], "weaknesses": ["could expand"]},
    "passageB": {"score": 6, "assessment": "moderate depth", "strengths": ["covers basics"], "weaknesses": ["surface level"]}
  },
  "clarity": {
    "passageA": {"score": 7, "assessment": "clear", "strengths": ["readable"], "weaknesses": ["complex"]},
    "passageB": {"score": 8, "assessment": "very clear", "strengths": ["simple"], "weaknesses": ["basic"]}
  },
  "verdict": "A is more original due to innovative concepts"
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content ?? "{}") as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error(`Failed to analyze passages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeSinglePassage(
  passage: PassageData
): Promise<AnalysisResult> {
  try {
    const paragraphs = splitIntoParagraphs(passage.text);
    const passageTitle = passage.title || "Your Passage";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Analyze this passage for originality efficiently. Return JSON only.`,
        },
        {
          role: "user",
          content: `Analyze this passage for originality:

${passage.text.substring(0, 3000)}...

Return JSON with scores 0-10 compared to average writing:
{
  "conceptualLineage": {
    "passageA": {"primaryInfluences": "analysis", "intellectualTrajectory": "development"},
    "passageB": {"primaryInfluences": "typical sources", "intellectualTrajectory": "standard"}
  },
  "semanticDistance": {
    "passageA": {"distance": 75, "label": "High Distance"},
    "passageB": {"distance": 50, "label": "Average"},
    "keyFindings": ["innovative approach", "novel concepts"],
    "semanticInnovation": "shows significant innovation"
  },
  "noveltyHeatmap": {
    "passageA": [{"content": "innovative section", "heat": 80, "quote": "key quote", "explanation": "original thinking"}],
    "passageB": [{"content": "typical writing", "heat": 50, "quote": "standard phrase", "explanation": "conventional"}]
  },
  "derivativeIndex": {
    "passageA": {"score": 8, "components": [{"name": "Innovation", "score": 8}]},
    "passageB": {"score": 5, "components": [{"name": "Innovation", "score": 5}]}
  },
  "conceptualParasite": {
    "passageA": {"level": "Low", "elements": ["builds on basics"], "assessment": "original"},
    "passageB": {"level": "Moderate", "elements": ["standard patterns"], "assessment": "typical"}
  },
  "coherence": {
    "passageA": {"score": 8, "assessment": "well structured", "strengths": ["logical flow"], "weaknesses": ["complex"]},
    "passageB": {"score": 6, "assessment": "average structure", "strengths": ["basic flow"], "weaknesses": ["typical issues"]}
  },
  "accuracy": {
    "passageA": {"score": 8, "assessment": "accurate reasoning", "strengths": ["valid points"], "weaknesses": ["minor gaps"]},
    "passageB": {"score": 5, "assessment": "average accuracy", "strengths": ["basic facts"], "weaknesses": ["some errors"]}
  },
  "depth": {
    "passageA": {"score": 8, "assessment": "deep analysis", "strengths": ["thorough"], "weaknesses": ["could expand"]},
    "passageB": {"score": 5, "assessment": "surface level", "strengths": ["covers basics"], "weaknesses": ["shallow"]}
  },
  "clarity": {
    "passageA": {"score": 7, "assessment": "clear for complexity", "strengths": ["precise"], "weaknesses": ["technical"]},
    "passageB": {"score": 5, "assessment": "average clarity", "strengths": ["simple"], "weaknesses": ["vague"]}
  },
  "verdict": "Significantly more original than typical writing with strong conceptual innovation"
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
    });

    const result = JSON.parse(response.choices[0].message.content ?? "{}") as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Error calling OpenAI for single passage analysis:", error);
    throw new Error(`Failed to analyze passage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}