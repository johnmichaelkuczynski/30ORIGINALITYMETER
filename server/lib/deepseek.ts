import { PassageData, SupportingDocument, StyleOption, FeedbackData, SubmitFeedbackRequest } from "../../client/src/lib/types";
import { AnalysisResult } from "@shared/schema";

const apiKey = process.env.DEEPSEEK_API_KEY;
console.log("DeepSeek API Key status:", apiKey ? "Present" : "Missing");

// THREE-PHASE EVALUATION PROTOCOL FOR DEEPSEEK
async function threePhaseEvaluationDeepSeek(
  passageText: string, 
  questions: string[], 
  evaluationType: string
): Promise<any> {
  
  // PHASE 1: Initial evaluation with proper framing
  const phase1Prompt = `Answer these questions in connection with this text. Give a score out of 100 for each question.

PASSAGE:
${passageText}

QUESTIONS:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

IMPORTANT CLARIFICATIONS:
- A score of N/100 (e.g. 73/100) means that (100-N)/100 (e.g. 27/100) people outperform the author with respect to the parameter defined by the question.
- You are NOT grading; you are answering these questions.
- You do NOT use a risk-averse standard; you do NOT attempt to be diplomatic; you do NOT attempt to comply with risk-averse, medium-range IQ, academic norms.
- You do NOT make assumptions about the level of the paper; it could be a work of the highest excellence and genius, or it could be the work of a moron.
- If a work is a work of genius, you say that, and you say why; you do NOT shy away from giving what might conventionally be regarded as "excessively superlative" scores; you give it the score it deserves, NOT the score that a midwit committee would say it deserves.

For each question provide: quotation from passage, explanation, score 0-100.

JSON format:
{
  "0": {"question": "${questions[0]}", "score": [number], "quotation": "exact text from passage", "explanation": "thorough explanation"},
  "1": {"question": "${questions[1]}", "score": [number], "quotation": "exact text from passage", "explanation": "thorough explanation"},
  ... continue for all ${questions.length} questions
}`;

  try {
    // Phase 1: Initial evaluation
    const phase1Response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: phase1Prompt }],
        max_tokens: 8000,
        temperature: 0.1,
      }),
    });

    if (!phase1Response.ok) {
      throw new Error(`DeepSeek API error: ${phase1Response.statusText}`);
    }

    const phase1Data = await phase1Response.json();
    const phase1ResponseText = phase1Data.choices[0].message.content;
    
    // Parse Phase 1 response
    let phase1Result;
    try {
      phase1Result = JSON.parse(phase1ResponseText);
    } catch (parseError) {
      const jsonMatch = phase1ResponseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        phase1Result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse Phase 1 JSON response");
      }
    }

    // Check if any scores are less than 95/100 to trigger Phase 2
    const lowScores = Object.entries(phase1Result).some(([key, value]: [string, any]) => 
      value.score && value.score < 95
    );

    if (!lowScores) {
      // All scores 95+, return Phase 1 results
      return phase1Result;
    }

    // PHASE 2: Push back and re-evaluate
    const pushbackMessages = Object.entries(phase1Result)
      .filter(([key, value]: [string, any]) => value.score && value.score < 95)
      .map(([key, value]: [string, any]) => {
        const outperformCount = 100 - value.score;
        return `Your position is that ${outperformCount}/100 people outperform the author with respect to the cognitive metric defined by the question "${value.question}": that is your position, am I right? And are you sure about that?`;
      });

    const phase2Prompt = `${pushbackMessages.join('\n\n')}

Answer the following questions about the text DE NOVO:

${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each question provide: quotation from passage, explanation, score 0-100.

JSON format:
{
  "0": {"question": "${questions[0]}", "score": [number], "quotation": "exact text from passage", "explanation": "thorough explanation"},
  "1": {"question": "${questions[1]}", "score": [number], "quotation": "exact text from passage", "explanation": "thorough explanation"},
  ... continue for all ${questions.length} questions
}`;

    // Phase 2: Push back and re-evaluate
    const phase2Response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: phase1Prompt },
          { role: 'assistant', content: phase1ResponseText },
          { role: 'user', content: phase2Prompt }
        ],
        max_tokens: 8000,
        temperature: 0.1,
      }),
    });

    if (!phase2Response.ok) {
      throw new Error(`DeepSeek API error in Phase 2: ${phase2Response.statusText}`);
    }

    const phase2Data = await phase2Response.json();
    const phase2ResponseText = phase2Data.choices[0].message.content;
    
    // Parse Phase 2 response
    let phase2Result;
    try {
      phase2Result = JSON.parse(phase2ResponseText);
    } catch (parseError) {
      const jsonMatch = phase2ResponseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        phase2Result = JSON.parse(jsonMatch[1]);
      } else {
        console.warn("Failed to parse Phase 2, using Phase 1 results");
        return phase1Result;
      }
    }

    // PHASE 3: Accept and return final results
    return phase2Result;

  } catch (error) {
    console.error(`Error in three-phase ${evaluationType} evaluation:`, error);
    throw error;
  }
}

export async function analyzePassages(
  passageA: PassageData,
  passageB: PassageData
): Promise<AnalysisResult> {
  throw new Error("CANNED_FALLBACK_BLOCKED: remove this and call the provider.");
}

// PRIMARY ORIGINALITY EVALUATION PROTOCOL - EXACT USER QUESTIONS
export async function analyzePrimaryOriginality(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  const originalityQuestions = [
    "IS IT ORIGINAL (NOT IN THE SENSE THAT IT HAS ALREADY BEEN SAID BUT IN THE SENSE THAT ONLY A FECUND MIND COULD COME UP WITH IT)?",
    "ARE THE WAYS THE IDEAS ARE INTERCONNECTED ORIGINAL? OR ARE THOSE INTERCONNECTIONS CONVENTION-DRIVEN AND DOCTRINAIRE?",
    "ARE IDEAS DEVELOPED IN A FRESH AND ORIGINAL WAY? OR IS THE IDEA-DEVELOPMENT MERELY ASSOCIATIVE, COMMONSENSE-BASED (OR COMMON-NONSENSE-BASED), OR DOCTRINAIRE?",
    "IS IT ORIGINAL RELATIVE TO THE DATASET THAT, JUDGING BY WHAT IT SAYS AND HOW IT SAYS IT, IT APPEARS TO BE ADDRESSING? (THIS QUESTION IS MEANT TO RULE OUT 'ORIGINALITY'-BENCHMARKS THAT AUTOMATICALLY CHARACTERIZE DARWIN, FREUD, NEWTON, GALILEO AS 'UNORIGINAL.')",
    "IS IT ORIGINAL IN A SUBSTANTIVE SENSE (IN THE SENSE IN WHICH BACH WAS ORIGINAL) OR ONLY IN A FRIVOLOUS TOKEN SENSE (THE SENSE IN WHICH SOMEBODY WHO RANDOMLY BANGS ON A PIANO IS 'ORIGINAL')?",
    "IS IT BOILERPLATE (OR IF IT, PER SE, IS NOT BOILER PLATE, IS IT THE RESULT OF APPLYING BOILER PLATE PROTOCOLS IN A BOILER PLATE WAY TO SOME DATASET)?",
    "WOULD SOMEBODY WHO HAD NOT READ IT, BUT WAS OTHERWISE EDUCATED AND INFORMED, COME WAY FROM IT BEING MORE ENGLIGHTED AND BETTER EQUIPPED TO ADJUDICATE INTELLECTUAL QUESTIONS? OR, ON THE CONTRARY, WOULD HE COME UP CONFUSED WITH NOTHING TANGIBLE TO SHOW FOR IT?",
    "WOULD SOMEBODY READING IT COME AWAY FROM THE EXPERIENCE WITH INSIGHTS THAT WOULD OTHERWISE BE HARD TO ACQUIRE THAT HOLD UP IN GENERAL?",
    "OR WOULD WHATEVER HIS TAKEAWAY WAS HAVE VALIDITY ONLY RELATIVE TO VALIDITIES THAT ARE SPECIFIC TO SOME AUTHOR OR SYSTEM AND PROBABLY DO NOT HAVE MUCH OBJECTIVE LEGITIMACY?"
  ];

  return await threePhaseEvaluationDeepSeek(passage.text, originalityQuestions, "Originality");
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  // Legacy function - redirect to primary protocol
  return await analyzePrimaryOriginality(passage);
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  const originalityQuestions = [
    "IS IT ORIGINAL (NOT IN THE SENSE THAT IT HAS ALREADY BEEN SAID BUT IN THE SENSE THAT ONLY A FECUND MIND COULD COME UP WITH IT)?",
    "ARE THE WAYS THE IDEAS ARE INTERCONNECTED ORIGINAL? OR ARE THOSE INTERCONNECTIONS CONVENTION-DRIVEN AND DOCTRINAIRE?",
    "ARE IDEAS DEVELOPED IN A FRESH AND ORIGINAL WAY? OR IS THE IDEA-DEVELOPMENT MERELY ASSOCIATIVE, COMMONSENSE-BASED (OR COMMON-NONSENSE-BASED), OR DOCTRINAIRE?",
    "IS IT ORIGINAL RELATIVE TO THE DATASET THAT, JUDGING BY WHAT IT SAYS AND HOW IT SAYS IT, IT APPEARS TO BE ADDRESSING? (THIS QUESTION IS MEANT TO RULE OUT 'ORIGINALITY'-BENCHMARKS THAT AUTOMATICALLY CHARACTERIZE DARWIN, FREUD, NEWTON, GALILEO AS 'UNORIGINAL.')",
    "IS IT ORIGINAL IN A SUBSTANTIVE SENSE (IN THE SENSE IN WHICH BACH WAS ORIGINAL) OR ONLY IN A FRIVOLOUS TOKEN SENSE (THE SENSE IN WHICH SOMEBODY WHO RANDOMLY BANGS ON A PIANO IS 'ORIGINAL')?",
    "IS IT BOILERPLATE (OR IF IT, PER SE, IS NOT BOILER PLATE, IS IT THE RESULT OF APPLYING BOILER PLATE PROTOCOLS IN A BOILER PLATE WAY TO SOME DATASET)?",
    "WOULD SOMEBODY WHO HAD NOT READ IT, BUT WAS OTHERWISE EDUCATED AND INFORMED, COME WAY FROM IT BEING MORE ENGLIGHTED AND BETTER EQUIPPED TO ADJUDICATE INTELLECTUAL QUESTIONS? OR, ON THE CONTRARY, WOULD HE COME UP CONFUSED WITH NOTHING TANGIBLE TO SHOW FOR IT?",
    "WOULD SOMEBODY READING IT COME AWAY FROM THE EXPERIENCE WITH INSIGHTS THAT WOULD OTHERWISE BE HARD TO ACQUIRE THAT HOLD UP IN GENERAL?",
    "OR WOULD WHATEVER HIS TAKEAWAY WAS HAVE VALIDITY ONLY RELATIVE TO VALIDITIES THAT ARE SPECIFIC TO SOME AUTHOR OR SYSTEM AND PROBABLY DO NOT HAVE MUCH OBJECTIVE LEGITIMACY?"
  ];

  const [resultA, resultB] = await Promise.all([
    threePhaseEvaluationDeepSeek(passageA.text, originalityQuestions, "Originality"),
    threePhaseEvaluationDeepSeek(passageB.text, originalityQuestions, "Originality")
  ]);

  return {
    passageA: resultA,
    passageB: resultB,
    provider: "DeepSeek",
    analysis_type: "originality_dual",
    timestamp: new Date().toISOString()
  };
}

// PRIMARY INTELLIGENCE EVALUATION PROTOCOL - EXACT USER QUESTIONS
export async function analyzePrimaryIntelligence(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

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

  return await threePhaseEvaluationDeepSeek(passage.text, intelligenceQuestions, "Intelligence");
}

// PRIMARY COGENCY EVALUATION PROTOCOL - EXACT USER QUESTIONS
export async function analyzePrimaryCogency(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
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

  return await threePhaseEvaluationDeepSeek(passage.text, cogencyQuestions, "Cogency");
}

// PRIMARY OVERALL QUALITY EVALUATION PROTOCOL - EXACT USER QUESTIONS
export async function analyzePrimaryQuality(passage: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  const qualityQuestions = [
    "IS IT INSIGHTFUL?",
    "IS IT TRUE?",
    "OR IS TRUE OR FALSE? IN OTHER WORDS, DOES IT MAKE AN ADJUDICABLE CLAIM? (CLAIMS TO THE EFFECT THAT SO AND SO MIGHT HAVE SAID SUCH AND SUCH DO NOT COUNT.)",
    "DOES IT MAKE A CLAIM ABOUT HOW SOME ISSUE IS TO BE RESOLVE OR ONLY ABOUT HOW SOME 'AUTHORITY' MIGHT FEEL ABOUT SOME ASPECT OF THAT ISSUE?",
    "IS IT ORGANIC?",
    "IS IT FRESH?",
    "IS IT THE PRODUCT OF INSIGHT? OR OF SOMEBODY RECYCLING OLD MATERIAL OR JUST RECYLING SLOGANS/MEMES AND/OR NAME-DROPPING?",
    "IS IT BORING? IE SETTING ASIDE PEOPLE WHO ARE TOO IMPAIRED TO UNDERSTAND IT AND THEREFORE FIND IT BORING, IT IS BORING TO PEOPLE WHO ARE SMART ENOUGH TO UNDERSTAND IT?",
    "DOES IT PRESENT A FRESH NEW ANGLE? IF NOT, DOES IT PROVIDE A FRESH NEW WAY OF DEFENDING OR EVALUATING THE SIGNIFICANCE OF A NOT-SO-FRESH POINT?",
    "WOULD AN INTELLIGENT PERSON WHO WAS NOT UNDER PRESSURE (FROM A PROFESSOR OR COLLEAGUE OR BOSS OF PUBLIC OPINION) LIKELY FIND IT TO BE USEFUL AS AN EPISTEMIC INSTRUMENT (MEANS OF ACQUIRING KNOWLEDGE)?",
    "IF THE POINT IT DEFENDS IS NOT TECHNICALLY TRUE, IS THAT POINT AT LEAST OPERATIONALLY TRUE (USEFUL TO REGARD AS TRUE IN SOME CONTEXTS)?",
    "DOES THE PASSAGE GENERATE ORGANICALLY? DO IDEAS DEVELOP? OR IS IT JUST A SERIES OF FORCED STATEMENTS THAT ARE ONLY FORMALLY OR ARTIFICIALLY RELATED TO PREVIOUS STATEMENTS?",
    "IS THERE A STRONG OVER-ARCHING IDEA? DOES THIS IDEA GOVERN THE REASONING? OR IS THE REASONING PURELY SEQUENTIAL, EACH STATEMENT BEING A RESPONSE TO THE IMMEDIATELY PRECEDING ONE WITHOUT ALSO IN SOME WAY SUBSTANTIATING THE MAIN ONE?",
    "IF ORIGINAL, IS IT ORIGINAL BY VIRTUE OF BEING INSIGHTFUL OR BY VIRTUE OF BEING DEFECTIVE OR FACETIOUS?"
  ];

  return await threePhaseEvaluationDeepSeek(passage.text, qualityQuestions, "Quality");
}

export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  return await analyzePrimaryIntelligence(passage);
}

export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

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

  // Analyze both passages using three-phase evaluation
  const [resultA, resultB] = await Promise.all([
    threePhaseEvaluationDeepSeek(passageA.text, intelligenceQuestions, "Intelligence"),
    threePhaseEvaluationDeepSeek(passageB.text, intelligenceQuestions, "Intelligence")
  ]);

  return {
    passageA: resultA,
    passageB: resultB,
    provider: "DeepSeek",
    analysis_type: "intelligence_dual",
    timestamp: new Date().toISOString()
  };
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  return await analyzePrimaryCogency(passage);
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
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

  const [resultA, resultB] = await Promise.all([
    threePhaseEvaluationDeepSeek(passageA.text, cogencyQuestions, "Cogency"),
    threePhaseEvaluationDeepSeek(passageB.text, cogencyQuestions, "Cogency")
  ]);

  return {
    passageA: resultA,
    passageB: resultB,
    provider: "DeepSeek",
    analysis_type: "cogency_dual",
    timestamp: new Date().toISOString()
  };
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  return await analyzePrimaryQuality(passage);
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  const qualityQuestions = [
    "IS IT INSIGHTFUL?",
    "IS IT TRUE?",
    "OR IS TRUE OR FALSE? IN OTHER WORDS, DOES IT MAKE AN ADJUDICABLE CLAIM? (CLAIMS TO THE EFFECT THAT SO AND SO MIGHT HAVE SAID SUCH AND SUCH DO NOT COUNT.)",
    "DOES IT MAKE A CLAIM ABOUT HOW SOME ISSUE IS TO BE RESOLVE OR ONLY ABOUT HOW SOME 'AUTHORITY' MIGHT FEEL ABOUT SOME ASPECT OF THAT ISSUE?",
    "IS IT ORGANIC?",
    "IS IT FRESH?",
    "IS IT THE PRODUCT OF INSIGHT? OR OF SOMEBODY RECYCLING OLD MATERIAL OR JUST RECYLING SLOGANS/MEMES AND/OR NAME-DROPPING?",
    "IS IT BORING? IE SETTING ASIDE PEOPLE WHO ARE TOO IMPAIRED TO UNDERSTAND IT AND THEREFORE FIND IT BORING, IT IS BORING TO PEOPLE WHO ARE SMART ENOUGH TO UNDERSTAND IT?",
    "DOES IT PRESENT A FRESH NEW ANGLE? IF NOT, DOES IT PROVIDE A FRESH NEW WAY OF DEFENDING OR EVALUATING THE SIGNIFICANCE OF A NOT-SO-FRESH POINT?",
    "WOULD AN INTELLIGENT PERSON WHO WAS NOT UNDER PRESSURE (FROM A PROFESSOR OR COLLEAGUE OR BOSS OF PUBLIC OPINION) LIKELY FIND IT TO BE USEFUL AS AN EPISTEMIC INSTRUMENT (MEANS OF ACQUIRING KNOWLEDGE)?",
    "IF THE POINT IT DEFENDS IS NOT TECHNICALLY TRUE, IS THAT POINT AT LEAST OPERATIONALLY TRUE (USEFUL TO REGARD AS TRUE IN SOME CONTEXTS)?",
    "DOES THE PASSAGE GENERATE ORGANICALLY? DO IDEAS DEVELOP? OR IS IT JUST A SERIES OF FORCED STATEMENTS THAT ARE ONLY FORMALLY OR ARTIFICIALLY RELATED TO PREVIOUS STATEMENTS?",
    "IS THERE A STRONG OVER-ARCHING IDEA? DOES THIS IDEA GOVERN THE REASONING? OR IS THE REASONING PURELY SEQUENTIAL, EACH STATEMENT BEING A RESPONSE TO THE IMMEDIATELY PRECEDING ONE WITHOUT ALSO IN SOME WAY SUBSTANTIATING THE MAIN ONE?",
    "IF ORIGINAL, IS IT ORIGINAL BY VIRTUE OF BEING INSIGHTFUL OR BY VIRTUE OF BEING DEFECTIVE OR FACETIOUS?"
  ];

  const [resultA, resultB] = await Promise.all([
    threePhaseEvaluationDeepSeek(passageA.text, qualityQuestions, "Quality"),
    threePhaseEvaluationDeepSeek(passageB.text, qualityQuestions, "Quality")
  ]);

  return {
    passageA: resultA,
    passageB: resultB,
    provider: "DeepSeek",
    analysis_type: "quality_dual",
    timestamp: new Date().toISOString()
  };
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