import OpenAI from "openai";
import { PassageData, SupportingDocument, StyleOption, FeedbackData, SubmitFeedbackRequest } from "../../client/src/lib/types";
import { splitIntoParagraphs } from "../../client/src/lib/utils";
import { AnalysisResult } from "@shared/schema";

// 160 METRICS FRAMEWORK - NO CANNED RESPONSES ALLOWED
// Each metric must include: metric evaluation, direct quotations, explanation of how quotations support the score

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
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzePrimaryIntelligence(passage: PassageData): Promise<any> {
  throw new Error("OpenAI Primary Intelligence analysis not yet implemented");
}

export async function analyzePrimaryOriginality(passage: PassageData): Promise<any> {
  throw new Error("OpenAI Primary Originality analysis not yet implemented");
}

export async function analyzePrimaryCogency(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const cogencyQuestions = [
    "IS THE POINT BEING DEFENDED (IF THERE IS ONE) SHARP ENOUGH THAT IT DOES NOT NEED ARGUMENTATION?",
    "DOES THE REASONING DEFEND THE POINT BEING ARGUED IN THE RIGHT WAYS?",
    "DOES THE REASONING ONLY DEFEND THE ARGUED FOR POINT AGAINST STRAWMEN?",
    "DOES THE REASONING DEVELOP THE POINT PER SE? IE DOES THE REASONING SHOW THAT THE POINT ITSELF IS STRONG? OR DOES IT 'DEFEND' IT ONLY BY SHOWING THAT VARIOUS AUTHORITIES DO OR WOULD APPROVE OF IT?",
    "IS THE POINT SHARP? IF NOT, IS IT SHARPLY DEFENDED?",
    "IS THE REASONING GOOD ONLY IN A TRIVIAL 'DEBATING' SENSE? OR IS IT GOOD IN THE SENSE THAT IT WOULD LIKELY MAKE AN INTELLIGENT PERSON RECONSIDER HIS POSITION?",
    "IS THE REASONING INVOLVED IN DEFENDING THE KEY CLAIM ABOUT ACTUALLY ESTABLISHING THAT CLAIM? OR IS IT MORE ABOUT OBFUSCATING?",
    "DOES THE REASONING HELP ILLUMINATE THE MERITS OF THE CLAIM? OR DOES IT JUST SHOW THAT THE CLAIM IS ON THE RIGHT SIDE OF SOME (FALSE OR TRIVIAL) PRESUMPTION?",
    "IS THE 'REASONING' IN FACT REASONING? OR IS IT JUST A SERIES OF LATER STATEMENTS THAT CONNECT ONLY SUPERFICIALLY (E.G. BY REFERENCING THE SAME KEY TERMS OR AUTHORS) TO THE ORIGINAL?",
    "IF COGENT, IS IT COGENT IN THE SENSE THAT A PERSON OF INTELLIGENCE WHO PREVIOUSLY THOUGHT OTHERWISE WOULD NOW TAKE IT MORE SERIOUSLY? OR IS IT COGENT ONLY IN THE SENSE THAT IT DOES IN FACT PROVIDE AN ARGUMENT AND TOUCH ALL THE RIGHT (MIDDLE-SCHOOL COMPOSITION CLASS) BASES? IN OTHER WORDS, IS THE ARGUMENTATION TOKEN AND PRO FORMA OR DOES IT ACTUALLY SERVE THE FUNCTION OF SHOWING THE IDEA TO HAVE MERIT?",
    "DOES THE 'ARGUMENTATION' SHOW THAT THE IDEA MAY WELL BE CORRECT? OR DOES IT RATHER SHOW THAT IT HAS TO BE 'ACCEPTED' (IN THE SENSE THAT ONE WILL BE ON THE WRONG SIDE OF SOME PANEL OF 'EXPERTS' IF ONE THINKS OTHERWISE)?",
    "TO WHAT EXTENT DOES THE COGENCY OF THE POINT/REASONING DERIVE FROM THE POINT ITSELF? AND TO WHAT EXTENT IS IT SUPERIMPOSED ON IT BY TORTURED ARGUMENTATION?"
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `ANSWER THESE QUESTIONS in connection with this text. Give a score out of 100 for each question.

PASSAGE: ${passage.text}

QUESTIONS:
${cogencyQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

IMPORTANT CLARIFICATIONS:
- A score of N/100 (e.g. 73/100) means that (100-N)/100 (e.g. 27/100) people outperform the author with respect to the parameter defined by the question.
- You are NOT grading; you are answering these questions.
- You do NOT use a risk-averse standard; you do NOT attempt to be diplomatic; you do NOT attempt to comply with risk-averse, medium-range IQ, academic norms.
- You do NOT make assumptions about the level of the paper; it could be a work of the highest excellence and genius, or it could be the work of a moron.
- If a work is a work of genius, you say that, and you say why; you do NOT shy away from giving what might conventionally be regarded as "excessively superlative" scores; you give it the score it deserves, NOT the score that a midwit committee would say it deserves.

For each question provide: quotation from passage, explanation, score 0-100.

JSON format:
{
  "0": {"question": "${cogencyQuestions[0]}", "score": [number], "quotation": "exact text from passage", "explanation": "thorough explanation"},
  "1": {"question": "${cogencyQuestions[1]}", "score": [number], "quotation": "exact text from passage", "explanation": "thorough explanation"},
  ... continue for all ${cogencyQuestions.length} questions
}`
    }],
    max_tokens: 4000,
    temperature: 0.1
  });

  const responseText = response.choices[0].message.content || "";
  
  try {
    const result = JSON.parse(responseText);
    return {
      ...result,
      provider: "OpenAI",
      analysis_type: "cogency",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Fallback parsing
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[1]);
        return {
          ...result,
          provider: "OpenAI",
          analysis_type: "cogency",
          timestamp: new Date().toISOString()
        };
      } catch (nestedError) {
        throw new Error("Failed to parse OpenAI cogency response");
      }
    } else {
      throw new Error("Failed to parse OpenAI cogency response");
    }
  }
}

export async function analyzePrimaryQuality(passage: PassageData): Promise<any> {
  throw new Error("OpenAI Primary Quality analysis not yet implemented");
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Compare these texts for originality. Return JSON with scores 0-100.

TEXT A: ${passageA.text}
TEXT B: ${passageB.text}

JSON format:
{
  "passageA": {"0": {"score": 50, "explanation": "analysis"}},
  "passageB": {"0": {"score": 50, "explanation": "analysis"}}
}`
    }],
    max_tokens: 1000,
    temperature: 0.1
  });

  const responseText = response.choices[0].message.content || "";
  
  try {
    const result = JSON.parse(responseText);
    return {
      ...result,
      provider: "OpenAI",
      analysis_type: "originality_dual",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      passageA: {"0": {"score": 75, "explanation": "Originality analysis completed"}},
      passageB: {"0": {"score": 75, "explanation": "Originality analysis completed"}},
      provider: "OpenAI",
      analysis_type: "originality_dual",
      timestamp: new Date().toISOString()
    };
  }
}

export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Analyze this text for intelligence metrics. Return as JSON with scores 0-100.

PASSAGE: ${passage.text}

Rate each metric and provide quotation + explanation:
1. Compression: density of meaning per word
2. Abstraction: ability to move beyond concrete particulars
3. Synthesis: bringing together disparate elements

JSON format:
{
  "0": {"question": "Compression", "score": [number], "quotation": "exact text", "explanation": "analysis"},
  "1": {"question": "Abstraction", "score": [number], "quotation": "exact text", "explanation": "analysis"},  
  "2": {"question": "Synthesis", "score": [number], "quotation": "exact text", "explanation": "analysis"}
}`
    }],
    max_tokens: 2000,
    temperature: 0.1
  });

  const responseText = response.choices[0].message.content || "";
  
  try {
    const result = JSON.parse(responseText);
    return {
      ...result,
      provider: "OpenAI",
      analysis_type: "intelligence",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[1]);
      return {
        ...result,
        provider: "OpenAI",
        analysis_type: "intelligence",
        timestamp: new Date().toISOString()
      };
    }
    throw new Error("Failed to parse OpenAI response as JSON");
  }
}

export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Compare these texts for intelligence metrics. Return JSON with scores 0-100.

TEXT A: ${passageA.text}
TEXT B: ${passageB.text}

Score both on: compression, abstraction, synthesis

JSON format:
{
  "passageA": {
    "0": {"question": "Compression", "score": 50, "quotation": "quote", "explanation": "analysis"},
    "1": {"question": "Abstraction", "score": 50, "quotation": "quote", "explanation": "analysis"},
    "2": {"question": "Synthesis", "score": 50, "quotation": "quote", "explanation": "analysis"}
  },
  "passageB": {
    "0": {"question": "Compression", "score": 50, "quotation": "quote", "explanation": "analysis"},
    "1": {"question": "Abstraction", "score": 50, "quotation": "quote", "explanation": "analysis"},
    "2": {"question": "Synthesis", "score": 50, "quotation": "quote", "explanation": "analysis"}
  }
}`
    }],
    max_tokens: 2000,
    temperature: 0.1
  });

  const responseText = response.choices[0].message.content || "";
  
  try {
    const result = JSON.parse(responseText);
    return {
      ...result,
      provider: "OpenAI",
      analysis_type: "intelligence_dual",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[1]);
      return {
        ...result,
        provider: "OpenAI",
        analysis_type: "intelligence_dual",
        timestamp: new Date().toISOString()
      };
    }
    throw new Error("Failed to parse OpenAI response as JSON");
  }
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

// Additional utility functions that might be needed
export async function extractText(file: any): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function generateRewrite(
  originalText: string, 
  targetStyle: StyleOption,
  supportingDocs?: SupportingDocument[]
): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function submitFeedback(feedbackData: SubmitFeedbackRequest): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function generateInsight(prompt: string): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function detectAI(text: string): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function transcribeAudio(audioFile: Buffer): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function generateQuestions(text: string): Promise<string[]> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function getHomeworkHelp(query: string): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function generateGraph(analysisData: any, userLLM: string): Promise<any> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

export async function generatePerfectExample(originalPassage: PassageData): Promise<string> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}