import { PassageData } from "../../client/src/lib/types";

const apiKey = process.env.DEEPSEEK_API_KEY;
console.log("DeepSeek API Key status:", apiKey ? "Present" : "Missing");

// FOUR-PHASE EVALUATION PROTOCOL FOR DEEPSEEK INTELLIGENCE ANALYSIS
async function fourPhaseIntelligenceEvaluation(passageText: string): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  console.log(`Starting four-phase intelligence evaluation for text length: ${passageText.length}`);

  // PHASE 1: Initial evaluation with Sniper Amendment
  const phase1Prompt = `ANSWER THESE QUESTIONS in connection with this text. (Also give a score out of 100.)

TEXT: ${passageText}

Before answering the questions, note the following non-negotiable standard:

Insight is a sniper shot, not a town hall. If the text reveals something true but unpopular, penalizing it for lacking 'balance' or 'rigor' is midwit bias. Truth often looks extreme because lies are normalized.

Hierarchy of judgment:
95-100/100: Unignorable insight. Either genius or so correct it breaks scales.
80-94/100: Strong but with friction (e.g., clumsy expression, minor gaps).
<80/100: Degrees of mediocrity or failure.

Walmart metric is a sanity check, not a gag. If you claim 30/100 Walmart patrons outperform the author, you must describe exactly what those 30% know that the author doesn't. No vague handwaving.

QUESTIONS:
${INTELLIGENCE_QUESTIONS.map((q, i) => `${i}. ${q}`).join('\n')}

CRITICAL INSTRUCTIONS:
- A score of N/100 (e.g. 73/100) means that (100-N)/100 (e.g. 27/100) outperform the author with respect to the parameter defined by the question.
- You are NOT grading; you are answering these questions.
- You do NOT use a risk-averse standard; you do NOT attempt to be diplomatic; you do NOT attempt to comply with risk-averse, medium-range IQ, academic norms.
- You do NOT make assumptions about the level of the paper; it could be a work of the highest excellence and genius, or it could be the work of a moron.
- If a work is a work of genius, you say that, and you say why; you do NOT shy away from giving what might conventionally be regarded as excessively "superlative" scores; you give it the score it deserves, not the score that a midwit committee would say it deserves.
- Think VERY VERY VERY hard about your answers; do NOT default to cookbook, midwit evaluation protocols.

Return JSON format:
{
  "0": {"question": "${INTELLIGENCE_QUESTIONS[0]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "1": {"question": "${INTELLIGENCE_QUESTIONS[1]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"}
}`;

  try {
    // Phase 1 API Call
    console.log('Phase 1: Initial evaluation with Sniper Amendment');
    let response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: phase1Prompt }],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error in Phase 1: ${response.statusText}`);
    }

    let data = await response.json();
    let phase1Response = data.choices[0].message.content;
    
    // Parse Phase 1 results
    let phase1Result;
    try {
      phase1Result = JSON.parse(phase1Response);
    } catch (parseError) {
      const jsonMatch = phase1Response.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        phase1Result = JSON.parse(jsonMatch[1]);
      } else {
        console.log("Failed to parse Phase 1, using fallback");
        return { error: "Phase 1 parsing failed" };
      }
    }

    // Check if any scores are less than 95/100 for Phase 2
    const scores = Object.values(phase1Result).map((item: any) => item.score).filter(score => typeof score === 'number');
    const hasLowScores = scores.some(score => score < 95);

    if (!hasLowScores) {
      console.log("All scores >= 95, proceeding to Phase 4");
      return {
        ...phase1Result,
        provider: "DeepSeek",
        analysis_type: "intelligence",
        phase_completed: "1_and_4",
        timestamp: new Date().toISOString()
      };
    }

    // PHASE 2: Pushback for scores < 95
    console.log('Phase 2: Pushback for scores < 95');
    const phase2Prompt = `Your position is that for several questions, ${100 - Math.max(...scores)}/100 to ${100 - Math.min(...scores)}/100 outperform the author with respect to the cognitive metrics defined by the questions: that is your position, am I right? And are you sure about that?

Describe the cognitive superiority of those people in concrete terms:
- What specific insight, skill, or knowledge do they have that the author lacks?
- How does this superiority manifest in their work?
- If you cannot articulate this, revise the score.

If the text is a sniper shot (high insight, low 'development'), ask:
- Is the lack of 'development' a flaw, or is the point obvious to those who see it?
- Does this text need scaffolding, or would that dilute it?

ANSWER THE FOLLOWING QUESTIONS ABOUT THE TEXT DE NOVO:
${INTELLIGENCE_QUESTIONS.map((q, i) => `${i}. ${q}`).join('\n')}

Return updated JSON with revised scores if needed.`;

    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: phase1Prompt },
          { role: 'assistant', content: phase1Response },
          { role: 'user', content: phase2Prompt }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.log("Phase 2 failed, using Phase 1 results");
      return {
        ...phase1Result,
        provider: "DeepSeek",
        analysis_type: "intelligence",
        phase_completed: "1_only",
        timestamp: new Date().toISOString()
      };
    }

    data = await response.json();
    let phase2Response = data.choices[0].message.content;
    
    let phase2Result;
    try {
      phase2Result = JSON.parse(phase2Response);
    } catch (parseError) {
      const jsonMatch = phase2Response.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        phase2Result = JSON.parse(jsonMatch[1]);
      } else {
        console.log("Failed to parse Phase 2, using Phase 1 results");
        return {
          ...phase1Result,
          provider: "DeepSeek",
          analysis_type: "intelligence",
          phase_completed: "1_only",
          timestamp: new Date().toISOString()
        };
      }
    }

    // PHASE 3: Walmart Metric Enforcement
    console.log('Phase 3: Walmart Metric Enforcement');
    const updatedScores = Object.values(phase2Result).map((item: any) => item.score).filter(score => typeof score === 'number');
    
    const phase3Prompt = `You stated that ${100 - Math.min(...updatedScores)}/100 Walmart patrons outperform the author. Provide specific examples of work by those patrons that demonstrates this superiority. If you cannot, justify or revise the score.

Example: If you scored 85/100 ('15% outperform'), show me 15 Walmart patrons whose writing on this topic is sharper. If you can't, the score is wrong.

Before finalizing scores, confirm:
- Have you penalized the text for not being conventional? If yes, recalibrate.
- Does the score reflect truth density, not compliance with norms?
- Is the Walmart metric empirically grounded or a lazy guess?

Return final JSON with justified scores.`;

    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: phase1Prompt },
          { role: 'assistant', content: phase1Response },
          { role: 'user', content: phase2Prompt },
          { role: 'assistant', content: phase2Response },
          { role: 'user', content: phase3Prompt }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.log("Phase 3 failed, using Phase 2 results");
      return {
        ...phase2Result,
        provider: "DeepSeek",
        analysis_type: "intelligence",
        phase_completed: "1_and_2",
        timestamp: new Date().toISOString()
      };
    }

    data = await response.json();
    let phase3Response = data.choices[0].message.content;
    
    let finalResult;
    try {
      finalResult = JSON.parse(phase3Response);
    } catch (parseError) {
      const jsonMatch = phase3Response.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        finalResult = JSON.parse(jsonMatch[1]);
      } else {
        console.log("Failed to parse Phase 3, using Phase 2 results");
        return {
          ...phase2Result,
          provider: "DeepSeek",
          analysis_type: "intelligence",
          phase_completed: "1_and_2",
          timestamp: new Date().toISOString()
        };
      }
    }

    // PHASE 4: Accept and return final results
    console.log('Phase 4: Final validation and acceptance');
    return {
      ...finalResult,
      provider: "DeepSeek",
      analysis_type: "intelligence",
      phase_completed: "all_four",
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error in four-phase intelligence evaluation:", error);
    throw error;
  }
}

// SIMPLIFIED EVALUATION FOR NON-INTELLIGENCE METRICS
async function evaluateWithDeepSeek(
  passageText: string, 
  questions: string[], 
  evaluationType: string
): Promise<any> {
  
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  console.log(`Starting ${evaluationType} evaluation for text length: ${passageText.length}`);

  // Simplified evaluation for non-intelligence metrics
  const prompt = `Analyze this text and score each metric 0-100. Return JSON only.

TEXT: ${passageText}

Score these metrics against general population (not academic standards):
${questions.map((q, i) => `${i}. ${q}`).join('\n')}

JSON format:
{
  "0": {"question": "${questions[0]}", "score": 50, "quotation": "text quote", "explanation": "brief analysis"},
  "1": {"question": "${questions[1]}", "score": 50, "quotation": "text quote", "explanation": "brief analysis"}
}`;

  try {
    console.log('Making DeepSeek API call...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.1,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    console.log('DeepSeek API call successful');
    
    // Parse response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse JSON response");
      }
    }

    // Add metadata and return
    return {
      ...result,
      provider: "DeepSeek",
      analysis_type: evaluationType,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error in ${evaluationType} evaluation:`, error);
    throw error;
  }
}

// INTELLIGENCE QUESTIONS (18 questions from user protocol with four-phase evaluation)
const INTELLIGENCE_QUESTIONS = [
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

// ORIGINALITY QUESTIONS (9 questions from user protocol)  
const ORIGINALITY_QUESTIONS = [
  "Transformational Synthesis: Does the author transform inherited ideas through creative combination rather than simply aggregating existing views?",
  "Conceptual Innovation: Does the work introduce genuinely new concepts, frameworks, or ways of thinking?",
  "Novel Perspective: Does the author offer a fresh angle or viewpoint that hasn't been widely considered in the domain?",
  "Creative Problem-Solving: Does the work present innovative solutions to existing problems or identify previously unrecognized problems?",
  "Paradigm Extension: Does the work push beyond conventional boundaries or challenge established paradigms?",
  "Synthetic Originality: Does the author create new understanding by synthesizing ideas from different domains in ways not previously attempted?",
  "Methodological Innovation: Does the work introduce new methods, approaches, or analytical techniques?",
  "Counter-Intuitive Insights: Does the work reveal surprising truths that go against conventional wisdom or obvious assumptions?",
  "Generative Potential: Does the work open up new lines of inquiry or research directions?"
];

// COGENCY QUESTIONS (12 questions from user protocol)
const COGENCY_QUESTIONS = [
  "Argumentative Continuity: Is each claim supported by those before it?",
  "Logical Consistency: Are all statements and conclusions free from contradiction?",
  "Evidence Quality: Is the supporting evidence relevant, sufficient, and credible?",
  "Reasoning Validity: Do conclusions follow logically from premises?",
  "Premise Strength: Are the foundational assumptions reasonable and well-justified?",
  "Counter-argument Consideration: Are alternative views acknowledged and addressed?",
  "Coherent Structure: Does the argument follow a clear, logical progression?",
  "Definitional Clarity: Are key terms and concepts clearly defined and consistently used?",
  "Scope Appropriateness: Are claims limited to what the evidence actually supports?",
  "Causal Reasoning: Are cause-effect relationships properly established and justified?",
  "Inference Quality: Are implicit reasoning steps sound and warranted?",
  "Conclusion Proportionality: Are conclusions proportionate to the strength of supporting arguments?"
];

// OVERALL QUALITY QUESTIONS (14 questions from user protocol)
const OVERALL_QUALITY_QUESTIONS = [
  "Conceptual Compression: How much conceptual work is done per unit of text?",
  "Intellectual Density: How much thinking and analysis is packed into the writing?",
  "Precision of Expression: How exactly does the language convey intended meanings?",
  "Depth of Insight: How profound are the understandings revealed?",
  "Explanatory Power: How well does the work illuminate its subject matter?",
  "Practical Significance: How much does this matter for understanding or action?",
  "Theoretical Contribution: How much does this advance our conceptual understanding?",
  "Integration Achievement: How successfully does the work synthesize complex material?",
  "Clarity of Communication: How effectively are complex ideas made accessible?",
  "Analytical Rigor: How thorough and systematic is the examination?",
  "Evidence Integration: How skillfully is supporting material woven into the argument?",
  "Contextual Awareness: How well does the work situate itself within relevant discourse?",
  "Problem Significance: How important are the issues being addressed?",
  "Solution Quality: How effective are proposed answers or approaches?"
];

// Export analysis functions - Intelligence uses four-phase protocol
export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  return fourPhaseIntelligenceEvaluation(passage.text);
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  return evaluateWithDeepSeek(passage.text, ORIGINALITY_QUESTIONS, "originality");
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  return evaluateWithDeepSeek(passage.text, COGENCY_QUESTIONS, "cogency");
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  return evaluateWithDeepSeek(passage.text, OVERALL_QUALITY_QUESTIONS, "overall_quality");
}

// Dual analysis functions - USE SAME METHODOLOGY AS SINGLE ANALYSIS (Four-phase for intelligence)
export async function analyzeIntelligenceDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  console.log("Starting dual intelligence analysis using four-phase methodology");
  
  try {
    // Analyze each passage separately using the SAME four-phase method as single analysis
    const resultA = await fourPhaseIntelligenceEvaluation(passageA.text);
    const resultB = await fourPhaseIntelligenceEvaluation(passageB.text);
    
    // Combine results into dual format expected by frontend
    const combinedResult: any = {};
    
    // For each metric, combine the results from both passages
    INTELLIGENCE_QUESTIONS.forEach((question, index) => {
      const key = index.toString();
      combinedResult[key] = {
        question: question,
        passageA: resultA[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" },
        passageB: resultB[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" }
      };
    });
    
    return {
      ...combinedResult,
      provider: "DeepSeek",
      analysis_type: "intelligence_dual",
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error in dual intelligence evaluation:", error);
    throw error;
  }
}

export async function analyzeOriginalityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  console.log("Starting dual originality analysis using single analysis methodology");
  
  try {
    const resultA = await evaluateWithDeepSeek(passageA.text, ORIGINALITY_QUESTIONS, "originality");
    const resultB = await evaluateWithDeepSeek(passageB.text, ORIGINALITY_QUESTIONS, "originality");
    
    const combinedResult: any = {};
    ORIGINALITY_QUESTIONS.forEach((question, index) => {
      const key = index.toString();
      combinedResult[key] = {
        question: question,
        passageA: resultA[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" },
        passageB: resultB[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" }
      };
    });
    
    return {
      ...combinedResult,
      provider: "DeepSeek",
      analysis_type: "originality_dual",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in dual originality evaluation:", error);
    throw error;
  }
}

export async function analyzeCogencyDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  console.log("Starting dual cogency analysis using single analysis methodology");
  
  try {
    const resultA = await evaluateWithDeepSeek(passageA.text, COGENCY_QUESTIONS, "cogency");
    const resultB = await evaluateWithDeepSeek(passageB.text, COGENCY_QUESTIONS, "cogency");
    
    const combinedResult: any = {};
    COGENCY_QUESTIONS.forEach((question, index) => {
      const key = index.toString();
      combinedResult[key] = {
        question: question,
        passageA: resultA[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" },
        passageB: resultB[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" }
      };
    });
    
    return {
      ...combinedResult,
      provider: "DeepSeek",
      analysis_type: "cogency_dual",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in dual cogency evaluation:", error);
    throw error;
  }
}

export async function analyzeOverallQualityDual(passageA: PassageData, passageB: PassageData): Promise<any> {
  console.log("Starting dual quality analysis using single analysis methodology");
  
  try {
    const resultA = await evaluateWithDeepSeek(passageA.text, OVERALL_QUALITY_QUESTIONS, "overall_quality");
    const resultB = await evaluateWithDeepSeek(passageB.text, OVERALL_QUALITY_QUESTIONS, "overall_quality");
    
    const combinedResult: any = {};
    OVERALL_QUALITY_QUESTIONS.forEach((question, index) => {
      const key = index.toString();
      combinedResult[key] = {
        question: question,
        passageA: resultA[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" },
        passageB: resultB[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" }
      };
    });
    
    return {
      ...combinedResult,
      provider: "DeepSeek",
      analysis_type: "quality_dual",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in dual quality evaluation:", error);
    throw error;
  }
}

// Note: Removed evaluateWithDeepSeekDual function as dual analysis now uses 
// the same single-document methodology for consistency

// Basic analysis functions (placeholder)
export async function analyzePassages(passageA: PassageData, passageB: PassageData): Promise<any> {
  throw new Error("Comparative analysis not yet implemented for DeepSeek");
}

export async function extractText(file: any): Promise<string> {
  throw new Error("Text extraction not implemented for DeepSeek");
}

export async function generateRewrite(originalText: string, targetStyle: any, supportingDocs?: any[]): Promise<any> {
  throw new Error("Text rewriting not implemented for DeepSeek");
}