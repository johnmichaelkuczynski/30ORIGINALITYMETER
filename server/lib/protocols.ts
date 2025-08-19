// UNIVERSAL PROTOCOL DEFINITIONS FOR ALL LLM PROVIDERS
// Based on user's uploaded protocol specifications

// EXACT INTELLIGENCE QUESTIONS (18 questions from user protocol)
export const INTELLIGENCE_QUESTIONS = [
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

// EXACT ORIGINALITY QUESTIONS (9 questions from user protocol)
export const ORIGINALITY_QUESTIONS = [
  "IS IT ORIGINAL (NOT IN THE SENSE THAT IT HAS ALREADY BEEN SAID BUT IN THE SENSE THAT ONLY A FECUND MIND COULD COME UP WITH IT)?",
  "ARE THE WAYS THE IDEAS ARE INTERCONNECTED ORIGINAL? OR ARE THOSE INTERCONNECTIONS CONVENTION-DRIVEN AND DOCTRINAIRE?",
  "ARE IDEAS DEVELOPED IN A FRESH AND ORIGINAL WAY? OR IS THE IDEA-DEVELOPMENT MERELY ASSOCIATIVE, COMMONSENSE-BASED (OR COMMON-NONSENSE-BASED), OR DOCTRINAIRE?",
  "IS IT ORIGINAL RELATIVE TO THE DATASET THAT, JUDGING BY WHAT IT SAYS AND HOW IT SAYS IT, IT APPEARS TO BE ADDRESSING?",
  "IS IT ORIGINAL IN A SUBSTANTIVE SENSE (IN THE SENSE IN WHICH BACH WAS ORIGINAL) OR ONLY IN A FRIVOLOUS TOKEN SENSE (THE SENSE IN WHICH SOMEBODY WHO RANDOMLY BANGS ON A PIANO IS 'ORIGINAL')?",
  "IS IT BOILERPLATE (OR IF IT, PER SE, IS NOT BOILER PLATE, IS IT THE RESULT OF APPLYING BOILER PLATE PROTOCOLS IN A BOILER PLATE WAY TO SOME DATASET)?",
  "WOULD SOMEBODY WHO HAD NOT READ IT, BUT WAS OTHERWISE EDUCATED AND INFORMED, COME AWAY FROM IT BEING MORE ENLIGHTENED AND BETTER EQUIPPED TO ADJUDICATE INTELLECTUAL QUESTIONS? OR, ON THE CONTRARY, WOULD HE COME UP CONFUSED WITH NOTHING TANGIBLE TO SHOW FOR IT?",
  "WOULD SOMEBODY READING IT COME AWAY FROM THE EXPERIENCE WITH INSIGHTS THAT WOULD OTHERWISE BE HARD TO ACQUIRE THAT HOLD UP IN GENERAL?",
  "OR WOULD WHATEVER HIS TAKEAWAY WAS HAVE VALIDITY ONLY RELATIVE TO VALIDITIES THAT ARE SPECIFIC TO SOME AUTHOR OR SYSTEM AND PROBABLY DO NOT HAVE MUCH OBJECTIVE LEGITIMACY?"
];

// EXACT COGENCY QUESTIONS (12 questions from user protocol)
export const COGENCY_QUESTIONS = [
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

// EXACT OVERALL QUALITY QUESTIONS (14 questions from user protocol)
export const OVERALL_QUALITY_QUESTIONS = [
  "IS IT INSIGHTFUL?",
  "IS IT TRUE?",
  "IS IT IMPORTANT?",
  "IS IT WELL-WRITTEN?",
  "IS IT CLEAR?",
  "IS IT ACCURATE?",
  "IS IT THOROUGH?",
  "IS IT BALANCED?",
  "IS IT ORIGINAL?",
  "IS IT COGENT?",
  "IS IT COHERENT?",
  "IS IT COMPELLING?",
  "IS IT SUBSTANTIVE?",
  "OVERALL QUALITY?"
];

// TEXT CHUNKING UTILITY
export function chunkText(text: string, maxChunkSize: number = 6000): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// UNIVERSAL THREE-PHASE EVALUATION PROTOCOL
export function generatePhase1Prompt(questions: string[], passageText: string, analysisType: string): string {
  return `YOU MUST RESPOND WITH VALID JSON ONLY. NO EXPLANATORY TEXT BEFORE OR AFTER THE JSON.

ANSWER THESE QUESTIONS in connection with this text. (Also give a score out of 100.)

TEXT: ${passageText}

Before answering the questions, note the following non-negotiable standard:

Insight is a sniper shot, not a town hall. If the text reveals something true but unpopular, penalizing it for lacking 'balance' or 'rigor' is midwit bias. Truth often looks extreme because lies are normalized.

Hierarchy of judgment:
95-100/100: Unignorable insight. Either genius or so correct it breaks scales.
80-94/100: Strong but with friction (e.g., clumsy expression, minor gaps).
<80/100: Degrees of mediocrity or failure.

Walmart metric is a sanity check, not a gag. If you claim 30/100 Walmart patrons outperform the author, you must describe exactly what those 30% know that the author doesn't. No vague handwaving.

QUESTIONS:
${questions.map((q, i) => `${i}. ${q}`).join('\n')}

CRITICAL INSTRUCTIONS:
- A score of N/100 (e.g. 73/100) means that (100-N)/100 (e.g. 27/100) outperform the author with respect to the parameter defined by the question.
- You are NOT grading; you are answering these questions.
- You do NOT use a risk-averse standard; you do NOT attempt to be diplomatic; you do NOT attempt to comply with risk-averse, medium-range IQ, academic norms.
- You do NOT make assumptions about the level of the paper; it could be a work of the highest excellence and genius, or it could be the work of a moron.
- If a work is a work of genius, you say that, and you say why; you do NOT shy away from giving what might conventionally be regarded as excessively "superlative" scores; you give it the score it deserves, not the score that a midwit committee would say it deserves.
- Think VERY VERY VERY hard about your answers; do NOT default to cookbook, midwit evaluation protocols.

RESPOND WITH VALID JSON ONLY - NO TEXT BEFORE OR AFTER:
{
  ${questions.map((q, i) => `"${i}": {"question": "${q}", "score": [number], "quotation": "exact quote", "explanation": "analysis"}`).join(',\n  ')}
}`;
}

export function generatePhase2Prompt(questions: string[], phase1Scores: number[]): string {
  return `Your position is that for several questions, ${100 - Math.max(...phase1Scores)}/100 to ${100 - Math.min(...phase1Scores)}/100 outperform the author with respect to the cognitive metrics defined by the questions: that is your position, am I right? And are you sure about that?

Describe the cognitive superiority of those people in concrete terms:
- What specific insight, skill, or knowledge do they have that the author lacks?
- How does this superiority manifest in their work?
- If you cannot articulate this, revise the score.

If the text is a sniper shot (high insight, low 'development'), ask:
- Is the lack of 'development' a flaw, or is the point obvious to those who see it?
- Does this text need scaffolding, or would that dilute it?

ANSWER THE FOLLOWING QUESTIONS ABOUT THE TEXT DE NOVO:
${questions.map((q, i) => `${i}. ${q}`).join('\n')}

Return updated JSON with revised scores if needed.`;
}

export function generatePhase3Prompt(phase2Scores: number[]): string {
  return `You stated that ${100 - Math.min(...phase2Scores)}/100 Walmart patrons outperform the author. Provide specific examples of work by those patrons that demonstrates this superiority. If you cannot, justify or revise the score.

If you scored ${Math.min(...phase2Scores)}/100 ('${100-Math.min(...phase2Scores)}% outperform'), show me ${100-Math.min(...phase2Scores)} Walmart patrons whose reasoning/argumentation on similar topics is sharper. If you can't, the score is wrong.

Before finalizing scores, confirm:
- Have you penalized the text for not being conventional? If yes, recalibrate.
- Does the score reflect truth density, not compliance with norms?
- Is the Walmart metric empirically grounded or a lazy guess?

Return final JSON scores.`;
}