import Anthropic from '@anthropic-ai/sdk';
import { PassageData, SupportingDocument, StyleOption, FeedbackData, SubmitFeedbackRequest } from "../../client/src/lib/types";
import { splitIntoParagraphs } from "../../client/src/lib/utils";
import { AnalysisResult } from "@shared/schema";

const apiKey = process.env.ANTHROPIC_API_KEY;
console.log("Anthropic API Key status:", apiKey ? "Present" : "Missing");

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

// VALIDATION FUNCTION: Push back on scores and clarify percentile meaning
async function validateScores(anthropic: any, originalPrompt: string, initialResponse: string, initialResult: any): Promise<any> {
  const validationPrompt = `You just evaluated a passage and gave scores. Let me clarify what these scores mean:

${Object.entries(initialResult).map(([key, value]: [string, any]) => {
  if (value.score) {
    const percentileAbove = 100 - value.score;
    return `For "${value.question}" you scored ${value.score}/100. This means you are saying that ${percentileAbove} out of 100 people are better than this passage at this dimension.`;
  }
  return '';
}).filter(Boolean).join('\n')}

CRITICAL REMINDER: You are NOT grading according to academic standards. You must drop ALL assumptions about text quality. Some texts you evaluate will be smarter than 99.99% of what professors produce. Some will be dumber than 99.99% of what professors produce. 

You are NOT there to grade. You are there to answer the questions and score in PERCENTILE TERMS against the full human population - not against academic expectations.

Do these scores accurately reflect where this passage ranks against ALL human writing on these dimensions? Revise any scores that seem influenced by academic grading rather than true population percentiles.

Return the same JSON format with any revised scores.`;

  try {
    const validationMessage = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [
        { role: "user", content: originalPrompt },
        { role: "assistant", content: initialResponse },
        { role: "user", content: validationPrompt }
      ],
    });

    const validatedResponseText = validationMessage.content[0].type === 'text' ? validationMessage.content[0].text : '';
    
    // Parse the validated response
    try {
      return JSON.parse(validatedResponseText);
    } catch (parseError) {
      const jsonMatch = validatedResponseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.warn("Failed to parse validated response, using initial result");
        return initialResult;
      }
    }
  } catch (error) {
    console.warn("Error in validation step:", error);
    return initialResult;
  }
}

// PRIMARY OVERALL QUALITY EVALUATION PROTOCOL - EXACT USER QUESTIONS
export async function analyzePrimaryQuality(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const qualityQuestions = [
    "IS IT INSIGHTFUL?",
    "IS IT TRUE?",
    "OR IS TRUE OR FALSE? IN OTHER WORDS, DOES IT MAKE AN ADJUDICABLE CLAIM? (CLAIMS TO THE EFFECT THAT SO AND SO MIGHT HAVE SAID SUCH AND SUCH DO NOT COUNT.)",
    "DOES IT MAKE A CLAIM ABOUT HOW SOME ISSUE IS TO BE RESOLVE OR ONLY ABOUT HOW SOME 'AUTHORITY' MIGHT FEEL ABOUT SOME ASPECT OF THAT ISSUE?",
    "IS IT ORGANIC?",
    "IS IT INSIGHTFUL?",
    "IS IT FRESH?",
    "IS IT THE PRODUCT OF INSIGHT? OR OF SOMEBODY RECYCLING OLD MATERIAL OR JUST RECYLING SLOGANS/MEMES AND/OR NAME-DROPPING?",
    "IS IT BORING? IE SETTING ASIDE PEOPLE WHO ARE TOO IMPAIRED TO UNDERSTAND IT AND THEREFORE FIND IT BORING, IT IS BORING TO PEOPLE WHO ARE SMART ENOUGH TO UNDERSTAND IT?",
    "DOES IT PRESENT A FRESH NEW ANGLE? IF NOT, DOES IT PROVIDE A FRESH NEW WAY OF DEFENDING OR EVALUATING THE SIGNIFICANCE OF A NOT-SO-FRESH POINT?",
    "WOULD AN INTELLIGENT PERSON WHO WAS NOT UNDER PRESSURE (FROM A PROFESSOR OR COLLEAGUE OR BOSS OF PUBLIC OPINION) LIKELY FIND IT TO BE USEFUL AS AN EPISTEMIC INSTRUMENT (MEANS OF ACQUIRING KNOWLEDGE)?",
    "IF THE POINT IT DEFENDS IS NOT TECHNICALLY TRUE, IS THAT POINT AT LEAST OPERATIONALLY TRUE (USEFUL TO REGARD AS TRUE IN SOME CONTEXTS)?",
    "DOES THE PASSAGE GENERATE ORGANICALLY? DO IDEAS DEVELOP? OR IS IT JUST A SERIES OF FORCED STATEMENTS THAT ARE ONLY FORMALLY OR ARTIFICIALLY RELATED TO PREVIOUS STATEMENTS?",
    "IS THERE A STRONG OVER-ARCHING IDEA? DOES THIS IDEA GOVERN THE REASONING? OR IS THE REASONING PURELY SEQUENTIAL, EACH STATEMENT BEING A RESPONSE TO THE IMMEDIATELY PRECEDING ONE WITHOUT ALSO IN SOME WAY SUBSTANTIATING THE MAIN ONE?"
  ];

  const prompt = `Answer these questions about this passage as intelligently and thoroughly as possible. Provide quotations and explanations. Do not assume what these questions are measuring. Give substantive answers.

PASSAGE:
${passage.text}

QUESTIONS:
${qualityQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each question provide: quotation from passage, explanation, score 0-100.

JSON format:
{
  "0": {"question": "${qualityQuestions[0]}", "score": [number], "quotation": "exact text from passage", "explanation": "thorough explanation"},
  ... continue for all ${qualityQuestions.length} questions
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Parse the initial JSON response
    let initialResult;
    try {
      initialResult = JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        initialResult = JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse Primary Quality JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }

    // VALIDATION STEP: Push back on scores and clarify percentile meaning
    return await validateScores(anthropic, prompt, responseText, initialResult);
  } catch (error) {
    console.error("Error in Primary Quality analysis:", error);
    throw error;
  }
}

// PRIMARY INTELLIGENCE EVALUATION PROTOCOL - EXACT USER QUESTIONS
export async function analyzePrimaryIntelligence(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const intelligenceQuestions = [
    "IS IT INSIGHTFUL?",
    "DOES IT DEVELOP POINTS? (OR, IF IT IS A SHORT EXCERPT, IS THERE EVIDENCE THAT IT WOULD DEVELOP POINTS IF EXTENDED)?",
    "IS THE ORGANIZATION MERELY SEQUENTIAL (JUST ONE POINT AFTER ANOTHER, LITTLE OR NO LOGICAL SCAFFOLDING)? OR ARE THE IDEAS ARRANGED, NOT JUST SEQUENTIALLY BUT HIERARCHICALLY?",
    "IF THE POINTS IT MAKES ARE NOT INSIGHTFUL, DOES IT OPERATE SKILLFULLY WITH CANONS OF LOGIC/REASONING.",
    "ARE THE POINTS CLICHES? OR ARE THEY \"FRESH\"?",
    "DOES IT USE TECHNICAL JARGON TO OBFUSCATE OR TO RENDER MORE PRECISE?",
    "IS IT ORGANIC? DO POINTS DEVELOP IN AN ORGANIC, NATURAL WAY? DO THEY 'UNFOLD'? OR ARE THEY FORCED AND ARTIFICIAL?",
    "DOES IT OPEN UP NEW DOMAINS? OR, ON THE CONTRARY, DOES IT SHUT OFF INQUIRY (BY CONDITIONALIZING FURTHER DISCUSSION OF THE MATTERS ON ACCEPTANCE OF ITS INTERNAL AND POSSIBLY VERY FAULTY LOGIC)?",
    "IS IT ACTUALLY INTELLIGENT OR JUST THE WORK OF SOMEBODY WHO, JUDGING BY TEH SUBJECT-MATTER, IS PRESUMED TO BE INTELLIGENT (BUT MAY NOT BE)?",
    "IS IT REAL OR IS IT PHONY?",
    "DO THE SENTENCES EXHIBIT COMPLEX AND COHERENT INTERNAL LOGIC?",
    "IS THE PASSAGE GOVERNED BY A STRONG CONCEPT? OR IS THE ONLY ORGANIZATION DRIVEN PURELY BY EXPOSITORY (AS OPPOSED TO EPISTEMIC) NORMS?",
    "IS THERE SYSTEM-LEVEL CONTROL OVER IDEAS? IN OTHER WORDS, DOES THE AUTHOR SEEM TO RECALL WHAT HE SAID EARLIER AND TO BE IN A POSITION TO INTEGRATE IT INTO POINTS HE HAS MADE SINCE THEN?",
    "ARE THE POINTS 'REAL'? ARE THEY FRESH? OR IS SOME INSTITUTION OR SOME ACCEPTED VEIN OF PROPAGANDA OR ORTHODOXY JUST USING THE AUTHOR AS A MOUTH PIECE?",
    "IS THE WRITING EVASIVE OR DIRECT?",
    "ARE THE STATEMENTS AMBIGUOUS?",
    "DOES THE PROGRESSION OF THE TEXT DEVELOP ACCORDING TO WHO SAID WHAT OR ACCORDING TO WHAT ENTAILS OR CONFIRMS WHAT?",
    "DOES THE AUTHOR USER OTHER AUTHORS TO DEVELOP HIS IDEAS OR TO CLOAK HIS OWN LACK OF IDEAS?"
  ];

  const prompt = `Answer these questions about this passage as intelligently and thoroughly as possible. Provide quotations and explanations. Do not assume what these questions are measuring. Give substantive answers.

PASSAGE:
${passage.text}

QUESTIONS:
${intelligenceQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each question provide: quotation from passage, explanation, score 0-100.

JSON format:
{
  "0": {"question": "${intelligenceQuestions[0]}", "score": [number], "quotation": "exact text from passage", "explanation": "thorough explanation"},
  ... continue for all ${intelligenceQuestions.length} questions
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Parse the initial JSON response
    let initialResult;
    try {
      initialResult = JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        initialResult = JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse Primary Intelligence JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }

    // VALIDATION STEP: Push back on scores and clarify percentile meaning
    return await validateScores(anthropic, prompt, responseText, initialResult);
  } catch (error) {
    console.error("Error in Primary Intelligence analysis:", error);
    throw error;
  }
}

// Add placeholder for other functions to maintain compatibility
export async function analyzePrimaryCogency(passage: PassageData): Promise<any> {
  throw new Error("Function needs implementation with validation");
}

export async function analyzePrimaryOriginality(passage: PassageData): Promise<any> {
  throw new Error("Function needs implementation with validation");
}

export async function analyzePassages(passageA: PassageData, passageB: PassageData): Promise<AnalysisResult> {
  throw new Error("Function needs implementation with validation");
}