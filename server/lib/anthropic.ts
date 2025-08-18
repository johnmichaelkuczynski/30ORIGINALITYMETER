import Anthropic from '@anthropic-ai/sdk';
import { PassageData, SupportingDocument, StyleOption, FeedbackData, SubmitFeedbackRequest } from "../../client/src/lib/types";
import { splitIntoParagraphs } from "../../client/src/lib/utils";
import { AnalysisResult } from "@shared/schema";

// 160 METRICS FRAMEWORK - NO CANNED RESPONSES ALLOWED
// Each metric must include: metric evaluation, direct quotations, explanation of how quotations support the score

const apiKey = process.env.ANTHROPIC_API_KEY;
console.log("Anthropic API Key status:", apiKey ? "Present" : "Missing");

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

// Helper function to handle pushback for low scores
async function pushbackOnLowScores(anthropic: any, prompt: string, responseText: string, analysisType: string): Promise<any> {
  let parsedResponse;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch (parseError) {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[1]);
    } else {
      throw parseError;
    }
  }

  // Check for low scores and pushback
  const needsPushback = Object.values(parsedResponse).some((entry: any) => 
    entry.score && entry.score < 85
  );

  if (needsPushback) {
    // Find the lowest scoring question for pushback
    let lowestScore = 100;
    Object.values(parsedResponse).forEach((entry: any) => {
      if (entry.score && entry.score < lowestScore) {
        lowestScore = entry.score;
      }
    });

    if (lowestScore < 85) {
      const pushbackMessages = {
        'intelligence': `YOU ARE SAYING THAT ON AVERAGE ${100 - lowestScore}/100 PEOPLE ARE SMARTER THAN THIS AUTHOR???????????????????????????????????????????????????????????????????????????????????????`,
        'quality': `YOU ARE SAYING THAT ON AVERAGE ${100 - lowestScore}/100 PEOPLE ARE BETTER IN TERMS OF OVERALL QUALITY THAN THIS AUTHOR???????????????????????????????????????????????????????????????????????????????????????`,
        'originality': `YOU ARE SAYING THAT ON AVERAGE ${100 - lowestScore}/100 PEOPLE ARE MORE ORIGINAL THAN THIS AUTHOR???????????????????????????????????????????????????????????????????????????????????????`,
        'cogency': `YOU ARE SAYING THAT ON AVERAGE ${100 - lowestScore}/100 PEOPLE ARE MORE COGENT THAN THIS AUTHOR???????????????????????????????????????????????????????????????????????????????????????`
      };
      
      const pushbackMessage = pushbackMessages[analysisType] || pushbackMessages['quality'];
      
      const pushbackResponse = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 8000,
        messages: [
          { role: "user", content: prompt },
          { role: "assistant", content: responseText },
          { role: "user", content: pushbackMessage }
        ],
      });

      const revisedResponseText = (pushbackResponse.content[0] as any).text;
      try {
        return JSON.parse(revisedResponseText);
      } catch (parseError) {
        const jsonMatch = revisedResponseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]);
        }
      }
    }
  }

  return parsedResponse;
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

  const prompt = `Answer these questions about this passage. Provide quotations and explanations.

PASSAGE:
${passage.text}

QUESTIONS:
${qualityQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

SCORING PROTOCOL: If you give something a score of N/100 (e.g. 72/100), that means (100 minus N) people out of 100 would do a better job in that respect (e.g. 28/100 people would do a better job).

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

    const responseText = (message.content[0] as any).text;
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse Primary Quality JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
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

  const prompt = `Answer these questions about this passage. Provide quotations and explanations.

PASSAGE:
${passage.text}

QUESTIONS:
${intelligenceQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

SCORING PROTOCOL: If you give something a score of N/100 (e.g. 72/100), that means (100 minus N) people out of 100 would do a better job in that respect (e.g. 28/100 people would do a better job).

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

    const responseText = (message.content[0] as any).text;
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse Primary Quality JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
  } catch (error) {
    console.error("Error in Primary Quality analysis:", error);
    throw error;
  }
}

// PRIMARY COGENCY EVALUATION PROTOCOL - EXACT USER QUESTIONS
export async function analyzePrimaryCogency(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

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

  const prompt = `Answer these questions about this passage. Provide quotations and explanations.

PASSAGE:
${passage.text}

QUESTIONS:
${cogencyQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

SCORING PROTOCOL: If you give something a score of N/100 (e.g. 72/100), that means (100 minus N) people out of 100 would do a better job in that respect (e.g. 28/100 people would do a better job).

For each question provide: quotation from passage, explanation, score 0-100.

JSON format:
{
  "0": {"question": "${cogencyQuestions[0]}", "score": [number], "quotation": "exact text from passage", "explanation": "thorough explanation"},
  ... continue for all ${cogencyQuestions.length} questions
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = (message.content[0] as any).text;
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse Primary Cogency JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
  } catch (error) {
    console.error("Error in Primary Cogency analysis:", error);
    throw error;
  }
}

export async function analyzePrimaryOriginality(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const originalityQuestions = [
    "IS IT ORIGINAL (NOT IN THE SENSE THAT IT HAS ALREADY BEEN SAID BUT IN THE SENSE THAT ONLY A FECUND MIND COULD COME UP WITH IT)?",
    "ARE THE WAYS THE IDEAS ARE INTERCONNECTED ORIGINAL? OR ARE THOSE INTERCONNECTIONS CONVENTION-DRIVEN AND DOCTRINAIRE?",
    "ARE IDEAS DEVELOPED IN A FRESH AND ORIGINAL WAY? OR IS THE IDEA-DEVELOPMENT MERELY ASSOCIATIVE, COMMONSENSE-BASED (OR COMMON-NONSENSE-BASED), OR DOCTRINAIRE?",
    "IS IT ORIGINAL RELATIVE TO THE DATASET THAT, JUDGING BY WHAT IT SAYS AND HOW IT SAYS IT, IT APPEARS TO BE ADDRESSING? (THIS QUESTION IS MEANT TO RULE OUT 'ORIGINALITY'-BENCHMARKS THAT AUTOMATICALLY CHARACTERIZE DARWIN, FREUD, NEWTON, GALILEO AS 'UNORIGINAL.')",
    "IS IT ORIGINAL IN A SUBSTANTIVE SENSE (IN THE SENSE IN WHICH BACH WAS ORIGINAL) OR ONLY IN A FRIVOLOUS TOKEN SENSE (THE SENSE IN WHICH SOMEBODY WHO RANDOMLY BANGS ON A PIANO IS 'ORIGINAL')?",
    "IF YOU GAVE A ROBOT THE DATASET TO WHICH THE PASSAGE IS A RESPONSE, WOULD THE ROBOT BE ABLE TO GENERATE THE PASSAGE? OR, ON THE CONTRARY, DOES IT BUTCHER IDEAS, THIS BEING WHAT GIVES IT A SHEEN OF 'ORIGINALITY'?",
    "IS IT BOILERPLATE (OR IF IT, PER SE, IS NOT BOILER PLATE, IS IT THE RESULT OF APPLYING BOILER PLATE PROTOCOLS IN A BOILER PLATE WAY TO SOME DATASET)?",
    "WOULD SOMEBODY WHO HAD NOT READ IT, BUT WAS OTHERWISE EDUCATED AND INFORMED, COME AWAY FROM IT BEING MORE ENLIGHTENED AND BETTER EQUIPPED TO ADJUDICATE INTELLECTUAL QUESTIONS? OR, ON THE CONTRARY, WOULD HE COME UP CONFUSED WITH NOTHING TANGIBLE TO SHOW FOR IT?",
    "WOULD SOMEBODY READING IT COME AWAY FROM THE EXPERIENCE WITH INSIGHTS THAT WOULD OTHERWISE BE HARD TO ACQUIRE THAT HOLD UP IN GENERAL? OR WOULD WHATEVER HIS TAKEAWAY WAS HAVE VALIDITY ONLY RELATIVE TO VALIDITIES THAT ARE SPECIFIC TO SOME AUTHOR OR SYSTEM AND PROBABLY DO NOT HAVE MUCH OBJECTIVE LEGITIMACY?"
  ];

  const prompt = `Answer these questions about this passage. Provide quotations and explanations.

PASSAGE:
${passage.text}

QUESTIONS:
${originalityQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

SCORING PROTOCOL: If you give something a score of N/100 (e.g. 72/100), that means (100 minus N) people out of 100 would do a better job in that respect (e.g. 28/100 people would do a better job).

For each question provide: quotation from passage, explanation, score 0-100.

JSON format:
{
  "0": {"question": "${originalityQuestions[0]}", "score": [number], "quotation": "exact text from passage", "explanation": "thorough explanation"},
  ... continue for all ${originalityQuestions.length} questions
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = (message.content[0] as any).text;
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse Primary Originality JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
  } catch (error) {
    console.error("Error in Primary Originality analysis:", error);
    throw error;
  }
}

export async function analyzePassages(
  passageA: PassageData,
  passageB: PassageData
): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const prompt = `Answer these questions about these passages. Provide quotations and explanations.

PASSAGE A:
${passageA.text}

PASSAGE B:
${passageB.text}

Answer all the questions thoroughly with quotations from the text and explicit explanations.

Return a properly formatted JSON response with the exact structure expected by the system. Include detailed metric-by-metric analysis with quotations, explanations, and scores for each parameter.`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    
    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse JSON response from Anthropic");
      }
    }

    return result;
  } catch (error) {
    console.error("Error in Anthropic analysis:", error);
    throw error;
  }
}

export async function analyzeOriginality(passage: PassageData, parameterCount: number = 40): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const originalityMetrics = [
    "Novel perspective", "Uncommon connections", "Surprising but apt analogies", "Invention of new distinctions",
    "Reframing of common problem", "New conceptual synthesis", "Fresh metaphors", "Generating new questions",
    "Counterintuitive insight that holds", "Unusual compression (shortcuts that work)", "Distilling cliché into clarity",
    "Reinterpreting tradition", "Productive paradox", "Idiosyncratic voice", "Unusual but precise phrasing",
    "Structural inventiveness (form matches thought)", "Surprising yet valid inference", "Non-standard angle on standard issue",
    "Repurposing known concept in new domain", "Avoiding mimicry", "Shunning jargon clichés", "Generating conceptual friction",
    "Independent pattern recognition", "Unexpected causal explanation", "Tension between domains (philosophy + science, etc.)",
    "Provocative but defensible claim", "Lateral connections (cross-field links)", "Subversion of default framing",
    "Detection of neglected detail", "Reverse engineering assumptions", "Productive misfit with genre/style",
    "Intellectually playful but rigorous", "Constructive violation of expectations", "Voice not reducible to formula",
    "Revaluing the obvious", "Absence of derivative cadence", "Independent synthesis of sources",
    "Discovery of hidden symmetry", "Generating terms others adopt", "Staying power (insight lingers after reading)"
  ];

  // Select the appropriate number of metrics based on parameterCount
  const selectedMetrics = originalityMetrics.slice(0, parameterCount);
  
  const prompt = `Answer these questions about this passage as intelligently and thoroughly as possible. Provide quotations and explanations. Do not assume what these questions are measuring. Give substantive answers.

PASSAGE:
${passage.text}

QUESTIONS:
${selectedMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

For each question, provide:
1. A relevant quotation from the text
2. A detailed explanation
3. A numerical score from 0-100

Return results in this JSON format:
{
  "0": {
    "parameter": "${selectedMetrics[0]}",
    "score": 75,
    "quotation": "exact text from passage",
    "explanation": "detailed explanation"
  },
  "1": {
    "parameter": "${selectedMetrics[1] || 'parameter'}",
    "score": 82,
    "quotation": "exact text from passage", 
    "explanation": "detailed explanation"
  }
  // Continue for all ${selectedMetrics.length} parameters
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        // If JSON parsing fails, return the text for debugging
        console.error("Failed to parse Anthropic JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
  } catch (error) {
    console.error("Error in Anthropic originality analysis:", error);
    throw error;
  }
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  // Check if texts are too long and need chunking
  const wordsA = passageA.text.split(/\s+/).length;
  const wordsB = passageB.text.split(/\s+/).length;
  let finalPassageA = passageA;
  let finalPassageB = passageB;
  
  // Truncate if too long to prevent JSON parsing issues
  if (wordsA > 800) {
    const truncatedText = passageA.text.split(/\s+/).slice(0, 800).join(' ') + '\n\n[Document continues...]';
    finalPassageA = { ...passageA, text: truncatedText };
    console.log(`Originality Passage A truncated from ${wordsA} to ~800 words`);
  }
  
  if (wordsB > 800) {
    const truncatedText = passageB.text.split(/\s+/).slice(0, 800).join(' ') + '\n\n[Document continues...]';
    finalPassageB = { ...passageB, text: truncatedText };
    console.log(`Originality Passage B truncated from ${wordsB} to ~800 words`);
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const originalityMetrics = [
    "Novel perspective", "Uncommon connections", "Surprising but apt analogies", "Invention of new distinctions",
    "Reframing of common problem", "New conceptual synthesis", "Fresh metaphors", "Generating new questions",
    "Counterintuitive insight that holds", "Unusual compression (shortcuts that work)", "Distilling cliché into clarity",
    "Reinterpreting tradition", "Productive paradox", "Idiosyncratic voice", "Unusual but precise phrasing",
    "Structural inventiveness (form matches thought)", "Surprising yet valid inference", "Non-standard angle on standard issue",
    "Repurposing known concept in new domain", "Avoiding mimicry", "Shunning jargon clichés", "Generating conceptual friction",
    "Independent pattern recognition", "Unexpected causal explanation", "Tension between domains (philosophy + science, etc.)",
    "Provocative but defensible claim", "Lateral connections (cross-field links)", "Subversion of default framing",
    "Detection of neglected detail", "Reverse engineering assumptions", "Productive misfit with genre/style",
    "Intellectually playful but rigorous", "Constructive violation of expectations", "Voice not reducible to formula",
    "Revaluing the obvious", "Absence of derivative cadence", "Independent synthesis of sources",
    "Discovery of hidden symmetry", "Generating terms others adopt", "Staying power (insight lingers after reading)"
  ];

  const prompt = `Answer these questions about these passages. Provide quotations and explanations.

PASSAGE A:
${finalPassageA.text}

PASSAGE B:
${finalPassageB.text}

QUESTIONS:
${originalityMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

SCORING PROTOCOL: If you give something a score of N/100 (e.g. 72/100), that means (100 minus N) people out of 100 would do a better job in that respect (e.g. 28/100 people would do a better job).

For each question, analyze BOTH passages. Provide:
1. Direct quotations that relate to this question from each passage
2. Explanations of your analysis
3. Scores from 0-100

Return ONLY this JSON structure:
{
  "0": {
    "metric": "Novel perspective",
    "passageA": {
      "quotation": "Direct quotation from Passage A",
      "explanation": "Explanation of analysis",
      "score": X
    },
    "passageB": {
      "quotation": "Direct quotation from Passage B",
      "explanation": "Explanation of analysis",
      "score": X
    }
  },
  ... continue for all 40 questions (indices "0" through "39")
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if wrapped in markdown
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse JSON response for dual originality analysis:", parseError);
        throw new Error("Invalid JSON response from AI service");
      }
    }
  } catch (error) {
    console.error("Error in Anthropic dual originality analysis:", error);
    throw error;
  }
}

export async function analyzeIntelligence(passage: PassageData, parameterCount: number = 40): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const intelligenceMetrics = [
    "Compression (density of meaning per word)", "Abstraction (ability to move beyond surface detail)",
    "Inference depth (multi-step reasoning)", "Epistemic friction (acknowledging uncertainty or limits)",
    "Cognitive distancing (seeing from outside a frame)", "Counterfactual reasoning", "Analogical depth (quality of comparisons)",
    "Semantic topology (connectedness of ideas)", "Asymmetry (unexpected but apt perspective shifts)",
    "Conceptual layering (multiple levels at once)", "Original definition-making", "Precision of terms",
    "Distinction-tracking (keeping categories straight)", "Avoidance of tautology", "Avoidance of empty generality",
    "Compression of examples into principle", "Ability to invert perspective", "Anticipation of objections",
    "Integration of disparate domains", "Self-reflexivity (awareness of own stance)", "Elimination of redundancy",
    "Conceptual economy (no waste concepts)", "Epistemic risk-taking (sticking neck out coherently)",
    "Generativity (producing new questions/angles)", "Ability to revise assumptions midstream",
    "Distinguishing signal vs. noise", "Recognizing hidden assumptions", "Tracking causal chains",
    "Separating correlation from causation", "Managing complexity without collapse", "Detecting paradox or tension",
    "Apt compression into aphorism", "Clarity under pressure (handling difficult material)",
    "Distinguishing levels (fact vs. meta-level)", "Relating concrete to abstract seamlessly",
    "Control of scope (not sprawling aimlessly)", "Detecting pseudo-intelligence", "Balancing simplicity with depth",
    "Strategic omission (knowing what not to say)", "Transferability (insight applies beyond the case)"
  ];

  // Select the appropriate number of metrics based on parameterCount
  const selectedMetrics = intelligenceMetrics.slice(0, parameterCount);
  
  const prompt = `Answer these questions about this passage as intelligently and thoroughly as possible. Provide quotations and explanations. Do not assume what these questions are measuring. Give substantive answers.

PASSAGE:
${passage.text}

QUESTIONS:
${selectedMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

For each question, provide:
1. A relevant quotation from the text
2. A detailed explanation
3. A numerical score from 0-100

Return results in this JSON format:
{
  "0": {
    "parameter": "${selectedMetrics[0]}",
    "score": 75,
    "quotation": "exact text from passage",
    "explanation": "detailed explanation"
  },
  "1": {
    "parameter": "${selectedMetrics[1] || 'parameter'}",
    "score": 82,
    "quotation": "exact text from passage", 
    "explanation": "detailed explanation"
  }
  // Continue for all ${selectedMetrics.length} parameters
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        // If JSON parsing fails, return the text for debugging
        console.error("Failed to parse Anthropic Intelligence JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
  } catch (error) {
    console.error("Error in Anthropic intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  // Add text length checking and chunking
  const wordsA = passageA.text.split(/\s+/).length;
  const wordsB = passageB.text.split(/\s+/).length;
  let finalPassageA = passageA;
  let finalPassageB = passageB;

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

  const prompt = `Answer these questions about these passages. Provide quotations and explanations.

PASSAGE A:
${finalPassageA.text}

PASSAGE B:
${finalPassageB.text}

QUESTIONS:
${intelligenceQuestions.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

SCORING PROTOCOL: If you give something a score of N/100 (e.g. 72/100), that means (100 minus N) people out of 100 would do a better job in that respect (e.g. 28/100 people would do a better job).

For each question, analyze BOTH passages. Provide:
1. Direct quotations that relate to this question from each passage
2. Explanations of your analysis
3. Scores from 0-100

Return ONLY this JSON structure:
{
  "0": {
    "metric": "${intelligenceQuestions[0]}",
    "passageA": {
      "quotation": "Direct quotation from Passage A",
      "explanation": "Explanation of analysis",
      "score": X
    },
    "passageB": {
      "quotation": "Direct quotation from Passage B",
      "explanation": "Explanation of analysis",
      "score": X
    }
  },
  ... continue for all ${intelligenceQuestions.length} questions (indices "0" through "${intelligenceQuestions.length - 1}")
}`;
  
  // Truncate if too long to prevent JSON parsing issues
  if (wordsA > 800) {
    const truncatedText = passageA.text.split(/\s+/).slice(0, 800).join(' ') + '\n\n[Document continues...]';
    finalPassageA = { ...passageA, text: truncatedText };
    console.log(`Passage A truncated from ${wordsA} to ~800 words`);
  }
  
  if (wordsB > 800) {
    const truncatedText = passageB.text.split(/\s+/).slice(0, 800).join(' ') + '\n\n[Document continues...]';
    finalPassageB = { ...passageB, text: truncatedText };
    console.log(`Passage B truncated from ${wordsB} to ~800 words`);
  }
  
  // Update the prompt to use truncated texts
  const truncatedPrompt = prompt
    .replace(passageA.text, finalPassageA.text)
    .replace(passageB.text, finalPassageB.text);

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8192, // Increased for dual analysis
      messages: [{ role: "user", content: truncatedPrompt }],
    });

    const responseText = message.content[0].text;
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.log("Raw response for debugging:", responseText.substring(0, 500));
      // Try to extract JSON from code blocks if wrapped in markdown
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch (innerError) {
          console.error("Failed to parse extracted JSON:", innerError);
          console.error("Extracted content:", jsonMatch[1].substring(0, 200));
        }
      }
      
      // Try to find JSON without code blocks
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        try {
          const jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonStr);
        } catch (innerError) {
          console.error("Failed to parse extracted JSON without code blocks:", innerError);
        }
      }
      
      console.error("Failed to parse JSON response for dual intelligence analysis:", parseError);
      throw new Error("Invalid JSON response from AI service");
    }
  } catch (error) {
    console.error("Error in Anthropic dual intelligence analysis:", error);
    throw error;
  }
}

export async function analyzeCogency(passage: PassageData, parameterCount: number = 40): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const cogencyMetrics = [
    "Logical validity", "Absence of contradictions", "Strength of evidence/reasons", "Proportionality (conclusion matches support)",
    "Avoiding non sequiturs", "Explicit structure (clear argument shape)", "Distinction between premises and conclusion",
    "Consistent terminology", "Focus (avoiding drift)", "Avoiding circularity", "Handling counterexamples",
    "Responsiveness to objections", "Causal adequacy", "Inferential tightness", "Avoiding overgeneralization",
    "Avoiding straw man reasoning", "Recognizing scope limits", "Avoiding equivocation", "Hierarchy of reasons (primary vs. secondary)",
    "Consistency with background knowledge", "Recognizing exceptions", "Correct use of examples",
    "Avoidance of loaded language as substitute for reason", "Clear priority of claims", "Avoiding category mistakes",
    "Explicitness of assumptions", "Non-redundancy in support", "Alignment between thesis and support",
    "Avoidance of spurious precision", "Adequate differentiation (not lumping opposites)", "Soundness of analogies",
    "Progressive buildup (no jumps)", "Avoidance of double standards", "Balance of concession and assertion",
    "Clarity of logical connectives", "Preservation of distinctions across argument", "Avoiding irrelevant material",
    "Correct handling of probability", "Strength of causal explanation vs. correlation", "Stability under reformulation (holds when restated)"
  ];

  // Select the appropriate number of metrics based on parameterCount
  const selectedMetrics = cogencyMetrics.slice(0, parameterCount);
  
  const prompt = `Answer these questions about this passage as intelligently and thoroughly as possible. Provide quotations and explanations. Do not assume what these questions are measuring. Give substantive answers.

PASSAGE:
${passage.text}

QUESTIONS:
${selectedMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

For each question, provide:
1. A relevant quotation from the text
2. A detailed explanation
3. A numerical score from 0-100

Return results in this JSON format:
{
  "0": {
    "parameter": "${selectedMetrics[0]}",
    "score": 75,
    "quotation": "exact text from passage",
    "explanation": "detailed explanation"
  },
  "1": {
    "parameter": "${selectedMetrics[1] || 'parameter'}",
    "score": 82,
    "quotation": "exact text from passage", 
    "explanation": "detailed explanation"
  }
  // Continue for all ${selectedMetrics.length} parameters
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse Anthropic Cogency JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
  } catch (error) {
    console.error("Error in Anthropic cogency analysis:", error);
    throw error;
  }
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  // Check if texts are too long and need chunking
  const wordsA = passageA.text.split(/\s+/).length;
  const wordsB = passageB.text.split(/\s+/).length;
  let finalPassageA = passageA;
  let finalPassageB = passageB;
  
  // Truncate if too long to prevent JSON parsing issues
  if (wordsA > 800) {
    const truncatedText = passageA.text.split(/\s+/).slice(0, 800).join(' ') + '\n\n[Document continues...]';
    finalPassageA = { ...passageA, text: truncatedText };
    console.log(`Cogency Passage A truncated from ${wordsA} to ~800 words`);
  }
  
  if (wordsB > 800) {
    const truncatedText = passageB.text.split(/\s+/).slice(0, 800).join(' ') + '\n\n[Document continues...]';
    finalPassageB = { ...passageB, text: truncatedText };
    console.log(`Cogency Passage B truncated from ${wordsB} to ~800 words`);
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const cogencyMetrics = [
    "Logical validity", "Absence of contradictions", "Strength of evidence/reasons", "Proportionality (conclusion matches support)",
    "Avoiding non sequiturs", "Explicit structure (clear argument shape)", "Distinction between premises and conclusion",
    "Consistent terminology", "Focus (avoiding drift)", "Avoiding circularity", "Handling counterexamples",
    "Responsiveness to objections", "Causal adequacy", "Inferential tightness", "Avoiding overgeneralization",
    "Avoiding straw man reasoning", "Recognizing scope limits", "Avoiding equivocation", "Hierarchy of reasons (primary vs. secondary)",
    "Consistency with background knowledge", "Recognizing exceptions", "Correct use of examples",
    "Avoidance of loaded language as substitute for reason", "Clear priority of claims", "Avoiding category mistakes",
    "Explicitness of assumptions", "Non-redundancy in support", "Alignment between thesis and support",
    "Avoidance of spurious precision", "Adequate differentiation (not lumping opposites)", "Soundness of analogies",
    "Progressive buildup (no jumps)", "Avoidance of double standards", "Balance of concession and assertion",
    "Clarity of logical connectives", "Preservation of distinctions across argument", "Avoiding irrelevant material",
    "Correct handling of probability", "Strength of causal explanation vs. correlation", "Stability under reformulation (holds when restated)"
  ];

  const prompt = `Answer these questions about these passages. Provide quotations and explanations.

PASSAGE A:
${finalPassageA.text}

PASSAGE B:
${finalPassageB.text}

QUESTIONS:
${cogencyMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

SCORING PROTOCOL: If you give something a score of N/100 (e.g. 72/100), that means (100 minus N) people out of 100 would do a better job in that respect (e.g. 28/100 people would do a better job).

For each question, analyze BOTH passages. Provide:
1. Direct quotations that relate to this question from each passage
2. Explanations of your analysis
3. Scores from 0-100

Return ONLY this JSON structure:
{
  "0": {
    "metric": "${cogencyMetrics[0]}",
    "passageA": {
      "quotation": "Direct quotation from Passage A",
      "explanation": "Explanation of analysis",
      "score": X
    },
    "passageB": {
      "quotation": "Direct quotation from Passage B",
      "explanation": "Explanation of analysis",
      "score": X
    }
  },
  ... continue for all 40 questions (indices "0" through "39")
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if wrapped in markdown
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse JSON response for dual cogency analysis:", parseError);
        throw new Error("Invalid JSON response from AI service");
      }
    }
  } catch (error) {
    console.error("Error in Anthropic dual cogency analysis:", error);
    throw error;
  }
}

export async function analyzeOverallQuality(passage: PassageData, parameterCount: number = 40): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const qualityMetrics = [
    "Clarity of expression", "Flow and readability", "Stylistic control", "Grammar and syntax precision",
    "Appropriate tone", "Balance of brevity and elaboration", "Coherence across sections", "Engagement/interest",
    "Rhythm of sentences", "Absence of filler", "Clear introduction of themes", "Effective closure/resolution",
    "Variety of sentence structure", "Apt vocabulary (not inflated)", "Avoiding clichés", "Consistency of style",
    "Accessibility (lay reader can follow)", "Respect for audience intelligence", "Memorability of phrasing",
    "Avoidance of redundancy", "Natural transitions", "Balanced paragraphing", "Pacing (not rushed, not dragging)",
    "Smooth handling of complexity", "Apt use of examples or illustration", "Ability to hold reader attention",
    "Economy of language", "Emphasis where needed", "Voice consistency", "Avoidance of awkwardness",
    "Seamless integration of quotes/sources", "Good proportion of abstract vs. concrete", "Non-mechanical style",
    "Absence of distracting errors", "Balance of analysis and narrative", "Cadence (natural spoken rhythm)",
    "Avoidance of pedantry", "Polish (reads as finished, not drafty)", "Unifying theme or through-line",
    "Overall reader impact (leaves an impression)"
  ];

  // Select the appropriate number of metrics based on parameterCount
  const selectedMetrics = qualityMetrics.slice(0, parameterCount);

  const prompt = `Answer these questions about this passage as intelligently and thoroughly as possible. Provide quotations and explanations. Do not assume what these questions are measuring. Give substantive answers.

PASSAGE:
${passage.text}

QUESTIONS:
${selectedMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

For each question, provide:
1. A relevant quotation from the text
2. A detailed explanation
3. A numerical score from 0-100

Return results in this JSON format:
{
  "0": {
    "parameter": "${selectedMetrics[0]}",
    "score": 75,
    "quotation": "exact text from passage",
    "explanation": "detailed explanation"
  },
  "1": {
    "parameter": "${selectedMetrics[1] || 'parameter'}",
    "score": 82,
    "quotation": "exact text from passage", 
    "explanation": "detailed explanation"
  }
  // Continue for all ${selectedMetrics.length} parameters
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;
    
    // Parse the JSON response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from code blocks if needed
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse Anthropic Overall Quality JSON response:", responseText);
        return { error: "Failed to parse JSON", rawResponse: responseText };
      }
    }
  } catch (error) {
    console.error("Error in Anthropic overall quality analysis:", error);
    throw error;
  }
}

export async function analyzeQuality(passage: PassageData): Promise<any> {
  return analyzeOverallQuality(passage);
}

export async function analyzeQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  return analyzeOverallQualityDual(passageA, passageB);
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  // Check if texts are too long and need chunking
  const wordsA = passageA.text.split(/\s+/).length;
  const wordsB = passageB.text.split(/\s+/).length;
  let finalPassageA = passageA;
  let finalPassageB = passageB;
  
  // Truncate if too long to prevent JSON parsing issues
  if (wordsA > 800) {
    const truncatedText = passageA.text.split(/\s+/).slice(0, 800).join(' ') + '\n\n[Document continues...]';
    finalPassageA = { ...passageA, text: truncatedText };
    console.log(`Quality Passage A truncated from ${wordsA} to ~800 words`);
  }
  
  if (wordsB > 800) {
    const truncatedText = passageB.text.split(/\s+/).slice(0, 800).join(' ') + '\n\n[Document continues...]';
    finalPassageB = { ...passageB, text: truncatedText };
    console.log(`Quality Passage B truncated from ${wordsB} to ~800 words`);
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const qualityMetrics = [
    "Clarity of expression", "Flow and readability", "Stylistic control", "Grammar and syntax precision",
    "Appropriate tone", "Balance of brevity and elaboration", "Coherence across sections", "Engagement/interest",
    "Rhythm of sentences", "Absence of filler", "Clear introduction of themes", "Effective closure/resolution",
    "Variety of sentence structure", "Apt vocabulary (not inflated)", "Avoiding clichés", "Consistency of style",
    "Accessibility (lay reader can follow)", "Respect for audience intelligence", "Memorability of phrasing",
    "Avoidance of redundancy", "Natural transitions", "Balanced paragraphing", "Pacing (not rushed, not dragging)",
    "Smooth handling of complexity", "Apt use of examples or illustration", "Ability to hold reader attention",
    "Economy of language", "Emphasis where needed", "Voice consistency", "Avoidance of awkwardness",
    "Seamless integration of quotes/sources", "Good proportion of abstract vs. concrete", "Non-mechanical style",
    "Absence of distracting errors", "Balance of analysis and narrative", "Cadence (natural spoken rhythm)",
    "Avoidance of pedantry", "Polish (reads as finished, not drafty)", "Unifying theme or through-line",
    "Overall reader impact (leaves an impression)"
  ];

  const prompt = `Answer these questions about these passages. Provide quotations and explanations.

PASSAGE A:
${finalPassageA.text}

PASSAGE B:
${finalPassageB.text}

QUESTIONS:
${qualityMetrics.map((metric, i) => `${i + 1}. ${metric}`).join('\n')}

SCORING PROTOCOL: If you give something a score of N/100 (e.g. 72/100), that means (100 minus N) people out of 100 would do a better job in that respect (e.g. 28/100 people would do a better job).

For each question, analyze BOTH passages. Provide:
1. Direct quotations that relate to this question from each passage
2. Explanations of your analysis
3. Scores from 0-100

Return ONLY this JSON structure:
{
  "0": {
    "metric": "${qualityMetrics[0]}",
    "passageA": {
      "quotation": "Direct quotation from Passage A",
      "explanation": "Explanation of analysis",
      "score": X
    },
    "passageB": {
      "quotation": "Direct quotation from Passage B",
      "explanation": "Explanation of analysis",
      "score": X
    }
  },
  ... continue for all 40 questions (indices "0" through "39")
}`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    return message.content[0].text;
  } catch (error) {
    console.error("Error in Anthropic dual overall quality analysis:", error);
    throw error;
  }
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

// NEW FEATURE: Generate Perfect Example (100/100 score) 
export async function generatePerfectExample(originalPassage: PassageData): Promise<string> {
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const prompt = `You are an expert writer who can produce writing that scores 95-99/100 on all intellectual metrics.

ORIGINAL PASSAGE (that scored poorly):
${originalPassage.text}

Your task: Write a passage on the same general topic that would score 95-99/100 across all 160 metrics (Intelligence, Originality, Cogency, Overall Quality). 

KEY REQUIREMENTS:
1. Same general topic/subject matter as the original
2. Similar length (but can be longer if needed for quality)
3. Advocate similar views/arguments where reasonable (within the constraints of creating excellent writing)
4. Demonstrate ALL the qualities of exceptional intellectual writing:

INTELLIGENCE (95-99/100): High compression of meaning, sophisticated abstraction, multi-step reasoning, epistemic humility, cognitive distancing, counterfactual reasoning, deep analogies, semantic interconnectedness, conceptual layering, precise definitions, etc.

ORIGINALITY (95-99/100): Novel perspectives, uncommon connections, surprising but apt analogies, fresh metaphors, counterintuitive insights that hold, avoiding mimicry, generating conceptual friction, independent pattern recognition, etc.

COGENCY (95-99/100): Logical validity, absence of contradictions, strong evidence, proportional conclusions, explicit structure, tight inferences, handling counterexamples, avoiding overgeneralization, etc.

OVERALL QUALITY (95-99/100): Clear expression, excellent flow, stylistic control, perfect grammar, appropriate tone, coherence, engagement, natural transitions, economy of language, memorability, etc.

Generate a passage that would genuinely score 95-99/100. This will show the user exactly what the evaluation system considers "perfect" writing.

Return ONLY the generated passage text, no other commentary.`;

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    return message.content[0].text;
  } catch (error) {
    console.error("Error generating perfect example:", error);
    throw error;
  }
}