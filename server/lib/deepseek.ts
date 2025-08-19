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
  const phase1Prompt = `YOU MUST RESPOND WITH VALID JSON ONLY. NO EXPLANATORY TEXT BEFORE OR AFTER THE JSON.

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
${INTELLIGENCE_QUESTIONS.map((q, i) => `${i}. ${q}`).join('\n')}

CRITICAL INSTRUCTIONS:
- A score of N/100 (e.g. 73/100) means that (100-N)/100 (e.g. 27/100) outperform the author with respect to the parameter defined by the question.
- You are NOT grading; you are answering these questions.
- You do NOT use a risk-averse standard; you do NOT attempt to be diplomatic; you do NOT attempt to comply with risk-averse, medium-range IQ, academic norms.
- You do NOT make assumptions about the level of the paper; it could be a work of the highest excellence and genius, or it could be the work of a moron.
- If a work is a work of genius, you say that, and you say why; you do NOT shy away from giving what might conventionally be regarded as excessively "superlative" scores; you give it the score it deserves, not the score that a midwit committee would say it deserves.
- Think VERY VERY VERY hard about your answers; do NOT default to cookbook, midwit evaluation protocols.

RESPOND WITH VALID JSON ONLY - NO TEXT BEFORE OR AFTER:
{
  "0": {"question": "${INTELLIGENCE_QUESTIONS[0]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "1": {"question": "${INTELLIGENCE_QUESTIONS[1]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "2": {"question": "${INTELLIGENCE_QUESTIONS[2]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "3": {"question": "${INTELLIGENCE_QUESTIONS[3]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "4": {"question": "${INTELLIGENCE_QUESTIONS[4]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "5": {"question": "${INTELLIGENCE_QUESTIONS[5]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "6": {"question": "${INTELLIGENCE_QUESTIONS[6]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "7": {"question": "${INTELLIGENCE_QUESTIONS[7]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "8": {"question": "${INTELLIGENCE_QUESTIONS[8]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "9": {"question": "${INTELLIGENCE_QUESTIONS[9]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "10": {"question": "${INTELLIGENCE_QUESTIONS[10]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "11": {"question": "${INTELLIGENCE_QUESTIONS[11]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "12": {"question": "${INTELLIGENCE_QUESTIONS[12]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "13": {"question": "${INTELLIGENCE_QUESTIONS[13]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "14": {"question": "${INTELLIGENCE_QUESTIONS[14]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "15": {"question": "${INTELLIGENCE_QUESTIONS[15]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "16": {"question": "${INTELLIGENCE_QUESTIONS[16]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "17": {"question": "${INTELLIGENCE_QUESTIONS[17]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"}
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
    
    // Parse Phase 1 results with comprehensive error handling
    let phase1Result: any = {};
    
    console.log("Phase 1 response full content:", phase1Response);
    
    // Try multiple parsing strategies
    let parseSuccess = false;
    
    // Strategy 1: Direct JSON parse
    try {
      phase1Result = JSON.parse(phase1Response);
      parseSuccess = true;
      console.log("✅ Direct JSON parse successful");
    } catch (parseError) {
      console.log("❌ Direct JSON parse failed");
    }
    
    // Strategy 2: Extract from code blocks
    if (!parseSuccess) {
      const jsonMatch = phase1Response.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        try {
          phase1Result = JSON.parse(jsonMatch[1]);
          parseSuccess = true;
          console.log("✅ Code block JSON parse successful");
        } catch (nestedError) {
          console.log("❌ Code block JSON parse failed");
        }
      }
    }
    
    // Strategy 3: Extract JSON-like content without code blocks
    if (!parseSuccess) {
      const jsonPattern = /{[\s\S]*}/;
      const jsonMatch = phase1Response.match(jsonPattern);
      if (jsonMatch) {
        try {
          phase1Result = JSON.parse(jsonMatch[0]);
          parseSuccess = true;
          console.log("✅ Pattern-based JSON parse successful");
        } catch (error) {
          console.log("❌ Pattern-based JSON parse failed");
        }
      }
    }
    
    // Strategy 4: Manual parsing if JSON parsing fails completely
    if (!parseSuccess) {
      console.log("❌ All JSON parsing failed, attempting manual extraction");
      
      // Try to extract scores and quotations manually
      INTELLIGENCE_QUESTIONS.forEach((question, index) => {
        const questionPattern = new RegExp(`"${index}"[\\s\\S]*?"score"\\s*:\\s*(\\d+)[\\s\\S]*?"quotation"\\s*:\\s*"([^"]*)"`, 'i');
        const match = phase1Response.match(questionPattern);
        
        if (match) {
          phase1Result[index.toString()] = {
            question: question,
            score: parseInt(match[1]),
            quotation: match[2],
            explanation: "Manually extracted from response"
          };
        } else {
          // Last resort: return error indication instead of fallback
          phase1Result[index.toString()] = {
            question: question,
            score: 0,
            quotation: "PARSING FAILED - DEEPSEEK RESPONSE INVALID",
            explanation: "Unable to parse DeepSeek response"
          };
        }
      });
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

// FOUR-PHASE EVALUATION PROTOCOL FOR DEEPSEEK ORIGINALITY ANALYSIS
async function fourPhaseOriginalityEvaluation(passageText: string): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  console.log(`Starting four-phase originality evaluation for text length: ${passageText.length}`);

  // PHASE 1: Initial evaluation with exact originality protocol
  const phase1Prompt = `YOU MUST RESPOND WITH VALID JSON ONLY. NO EXPLANATORY TEXT BEFORE OR AFTER THE JSON.

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
${ORIGINALITY_QUESTIONS.map((q, i) => `${i}. ${q}`).join('\n')}

CRITICAL INSTRUCTIONS:
- A score of N/100 (e.g. 73/100) means that (100-N)/100 (e.g. 27/100) outperform the author with respect to the parameter defined by the question.
- You are NOT grading; you are answering these questions.
- You do NOT use a risk-averse standard; you do NOT attempt to be diplomatic; you do NOT attempt to comply with risk-averse, medium-range IQ, academic norms.
- You do NOT make assumptions about the level of the paper; it could be a work of the highest excellence and genius, or it could be the work of a moron.
- If a work is a work of genius, you say that, and you say why; you do NOT shy away from giving what might conventionally be regarded as excessively "superlative" scores; you give it the score it deserves, not the score that a midwit committee would say it deserves.
- Think VERY VERY VERY hard about your answers; do NOT default to cookbook, midwit evaluation protocols.

RESPOND WITH VALID JSON ONLY - NO TEXT BEFORE OR AFTER:
{
  "0": {"question": "${ORIGINALITY_QUESTIONS[0]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "1": {"question": "${ORIGINALITY_QUESTIONS[1]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "2": {"question": "${ORIGINALITY_QUESTIONS[2]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "3": {"question": "${ORIGINALITY_QUESTIONS[3]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "4": {"question": "${ORIGINALITY_QUESTIONS[4]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "5": {"question": "${ORIGINALITY_QUESTIONS[5]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "6": {"question": "${ORIGINALITY_QUESTIONS[6]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "7": {"question": "${ORIGINALITY_QUESTIONS[7]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "8": {"question": "${ORIGINALITY_QUESTIONS[8]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "9": {"question": "${ORIGINALITY_QUESTIONS[9]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "10": {"question": "${ORIGINALITY_QUESTIONS[10]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "11": {"question": "${ORIGINALITY_QUESTIONS[11]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"}
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
    
    // Parse Phase 1 results with comprehensive error handling
    let phase1Result: any = {};
    
    console.log("Phase 1 response full content:", phase1Response);
    
    // Try multiple parsing strategies
    let parseSuccess = false;
    
    // Strategy 1: Direct JSON parse
    try {
      phase1Result = JSON.parse(phase1Response);
      parseSuccess = true;
      console.log("✅ Direct JSON parse successful");
    } catch (parseError) {
      console.log("❌ Direct JSON parse failed");
    }
    
    // Strategy 2: Extract from code blocks
    if (!parseSuccess) {
      const jsonMatch = phase1Response.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        try {
          phase1Result = JSON.parse(jsonMatch[1]);
          parseSuccess = true;
          console.log("✅ Code block JSON parse successful");
        } catch (nestedError) {
          console.log("❌ Code block JSON parse failed");
        }
      }
    }
    
    // Strategy 3: Extract JSON-like content without code blocks
    if (!parseSuccess) {
      const jsonPattern = /{[\s\S]*}/;
      const jsonMatch = phase1Response.match(jsonPattern);
      if (jsonMatch) {
        try {
          phase1Result = JSON.parse(jsonMatch[0]);
          parseSuccess = true;
          console.log("✅ Pattern-based JSON parse successful");
        } catch (error) {
          console.log("❌ Pattern-based JSON parse failed");
        }
      }
    }
    
    // Strategy 4: Manual parsing if JSON parsing fails completely
    if (!parseSuccess) {
      console.log("❌ All JSON parsing failed, attempting manual extraction");
      
      // Try to extract scores and quotations manually
      ORIGINALITY_QUESTIONS.forEach((question, index) => {
        const questionPattern = new RegExp(`"${index}"[\\s\\S]*?"score"\\s*:\\s*(\\d+)[\\s\\S]*?"quotation"\\s*:\\s*"([^"]*)"`, 'i');
        const match = phase1Response.match(questionPattern);
        
        if (match) {
          phase1Result[index.toString()] = {
            question: question,
            score: parseInt(match[1]),
            quotation: match[2],
            explanation: "Manually extracted from response"
          };
        } else {
          // Last resort: return error indication instead of fallback
          phase1Result[index.toString()] = {
            question: question,
            score: 0,
            quotation: "PARSING FAILED - DEEPSEEK RESPONSE INVALID",
            explanation: "Unable to parse DeepSeek response"
          };
        }
      });
    }

    // Check if any scores are less than 95/100 for Phase 2
    const scores = Object.values(phase1Result).map((item: any) => item.score).filter(score => typeof score === 'number');
    const hasLowScores = scores.some(score => score < 95);

    if (!hasLowScores) {
      console.log("All scores >= 95, proceeding to Phase 4");
      return {
        ...phase1Result,
        provider: "DeepSeek",
        analysis_type: "originality",
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
${ORIGINALITY_QUESTIONS.map((q, i) => `${i}. ${q}`).join('\n')}

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
          { role: 'assistant', content: JSON.stringify(phase1Result) },
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
        analysis_type: "originality",
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
          analysis_type: "originality",
          phase_completed: "1_only",
          timestamp: new Date().toISOString()
        };
      }
    }

    // PHASE 3: Walmart Metric Enforcement
    console.log('Phase 3: Walmart Metric Enforcement');
    const updatedScores = Object.values(phase2Result).map((item: any) => item.score).filter(score => typeof score === 'number');
    const phase3Prompt = `You stated that ${100 - Math.min(...updatedScores)}/100 Walmart patrons outperform the author. Provide specific examples of work by those patrons that demonstrates this superiority. If you cannot, justify or revise the score.

If you scored ${Math.min(...updatedScores)}/100 ('${100-Math.min(...updatedScores)}% outperform'), show me ${100-Math.min(...updatedScores)} Walmart patrons whose reasoning/argumentation on similar topics is sharper. If you can't, the score is wrong.

Before finalizing scores, confirm:
- Have you penalized the text for not being conventional? If yes, recalibrate.
- Does the score reflect truth density, not compliance with norms?
- Is the Walmart metric empirically grounded or a lazy guess?

Return final JSON scores.`;

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
          { role: 'assistant', content: JSON.stringify(phase1Result) },
          { role: 'user', content: phase2Prompt },
          { role: 'assistant', content: JSON.stringify(phase2Result) },
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
        analysis_type: "originality",
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
          analysis_type: "originality",
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
      analysis_type: "originality",
      phase_completed: "all_four",
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error in four-phase originality evaluation:", error);
    throw error;
  }
}

// FOUR-PHASE EVALUATION PROTOCOL FOR DEEPSEEK COGENCY ANALYSIS
async function fourPhaseCogencyEvaluation(passageText: string): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  console.log(`Starting four-phase cogency evaluation for text length: ${passageText.length}`);

  const phase1Prompt = `YOU MUST RESPOND WITH VALID JSON ONLY. NO EXPLANATORY TEXT BEFORE OR AFTER THE JSON.

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
${COGENCY_QUESTIONS.map((q, i) => `${i}. ${q}`).join('\n')}

CRITICAL INSTRUCTIONS:
- A score of N/100 (e.g. 73/100) means that (100-N)/100 (e.g. 27/100) outperform the author with respect to the parameter defined by the question.
- You are NOT grading; you are answering these questions.
- You do NOT use a risk-averse standard; you do NOT attempt to be diplomatic; you do NOT attempt to comply with risk-averse, medium-range IQ, academic norms.
- You do NOT make assumptions about the level of the paper; it could be a work of the highest excellence and genius, or it could be the work of a moron.
- If a work is a work of genius, you say that, and you say why; you do NOT shy away from giving what might conventionally be regarded as excessively "superlative" scores; you give it the score it deserves, not the score that a midwit committee would say it deserves.
- Think VERY VERY VERY hard about your answers; do NOT default to cookbook, midwit evaluation protocols.

RESPOND WITH VALID JSON ONLY - NO TEXT BEFORE OR AFTER:
{
  "0": {"question": "${COGENCY_QUESTIONS[0]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "1": {"question": "${COGENCY_QUESTIONS[1]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"}
}`;

  try {
    return await executePhases("cogency", passageText, phase1Prompt, COGENCY_QUESTIONS);
  } catch (error) {
    console.error("Error in four-phase cogency evaluation:", error);
    throw error;
  }
}

// FOUR-PHASE EVALUATION PROTOCOL FOR DEEPSEEK OVERALL QUALITY ANALYSIS
async function fourPhaseOverallQualityEvaluation(passageText: string): Promise<any> {
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured");
  }

  console.log(`Starting four-phase overall quality evaluation for text length: ${passageText.length}`);

  const phase1Prompt = `YOU MUST RESPOND WITH VALID JSON ONLY. NO EXPLANATORY TEXT BEFORE OR AFTER THE JSON.

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
${OVERALL_QUALITY_QUESTIONS.map((q, i) => `${i}. ${q}`).join('\n')}

CRITICAL INSTRUCTIONS:
- A score of N/100 (e.g. 73/100) means that (100-N)/100 (e.g. 27/100) outperform the author with respect to the parameter defined by the question.
- You are NOT grading; you are answering these questions.
- You do NOT use a risk-averse standard; you do NOT attempt to be diplomatic; you do NOT attempt to comply with risk-averse, medium-range IQ, academic norms.
- You do NOT make assumptions about the level of the paper; it could be a work of the highest excellence and genius, or it could be the work of a moron.
- If a work is a work of genius, you say that, and you say why; you do NOT shy away from giving what might conventionally be regarded as excessively "superlative" scores; you give it the score it deserves, not the score that a midwit committee would say it deserves.
- Think VERY VERY VERY hard about your answers; do NOT default to cookbook, midwit evaluation protocols.

RESPOND WITH VALID JSON ONLY - NO TEXT BEFORE OR AFTER:
{
  "0": {"question": "${OVERALL_QUALITY_QUESTIONS[0]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"},
  "1": {"question": "${OVERALL_QUALITY_QUESTIONS[1]}", "score": [number], "quotation": "exact quote", "explanation": "analysis"}
}`;

  try {
    return await executePhases("overall_quality", passageText, phase1Prompt, OVERALL_QUALITY_QUESTIONS);
  } catch (error) {
    console.error("Error in four-phase overall quality evaluation:", error);
    throw error;
  }
}

// SHARED PHASE EXECUTION LOGIC
async function executePhases(analysisType: string, passageText: string, phase1Prompt: string, questions: string[]): Promise<any> {
  // Phase 1 API Call
  console.log(`Phase 1: Initial evaluation with Sniper Amendment for ${analysisType}`);
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
  
  // Parse Phase 1 results with comprehensive error handling
  let phase1Result: any = {};
  
  console.log(`Phase 1 response for ${analysisType}:`, phase1Response);
  
  // Try multiple parsing strategies
  let parseSuccess = false;
  
  // Strategy 1: Direct JSON parse
  try {
    phase1Result = JSON.parse(phase1Response);
    parseSuccess = true;
    console.log("✅ Direct JSON parse successful");
  } catch (parseError) {
    console.log("❌ Direct JSON parse failed");
  }
  
  // Strategy 2: Extract from code blocks
  if (!parseSuccess) {
    const jsonMatch = phase1Response.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonMatch) {
      try {
        phase1Result = JSON.parse(jsonMatch[1]);
        parseSuccess = true;
        console.log("✅ Code block JSON parse successful");
      } catch (nestedError) {
        console.log("❌ Code block JSON parse failed");
      }
    }
  }
  
  // Strategy 3: Extract JSON-like content without code blocks
  if (!parseSuccess) {
    const jsonPattern = /{[\s\S]*}/;
    const jsonMatch = phase1Response.match(jsonPattern);
    if (jsonMatch) {
      try {
        phase1Result = JSON.parse(jsonMatch[0]);
        parseSuccess = true;
        console.log("✅ Pattern-based JSON parse successful");
      } catch (error) {
        console.log("❌ Pattern-based JSON parse failed");
      }
    }
  }
  
  // Strategy 4: Manual parsing if JSON parsing fails completely
  if (!parseSuccess) {
    console.log("❌ All JSON parsing failed, attempting manual extraction");
    
    // Try to extract scores and quotations manually
    questions.forEach((question, index) => {
      const questionPattern = new RegExp(`"${index}"[\\s\\S]*?"score"\\s*:\\s*(\\d+)[\\s\\S]*?"quotation"\\s*:\\s*"([^"]*)"`, 'i');
      const match = phase1Response.match(questionPattern);
      
      if (match) {
        phase1Result[index.toString()] = {
          question: question,
          score: parseInt(match[1]),
          quotation: match[2],
          explanation: "Manually extracted from response"
        };
      } else {
        // Last resort: return error indication instead of fallback
        phase1Result[index.toString()] = {
          question: question,
          score: 0,
          quotation: "PARSING FAILED - DEEPSEEK RESPONSE INVALID",
          explanation: "Unable to parse DeepSeek response"
        };
      }
    });
  }

  // Check if any scores are less than 95/100 for Phase 2
  const scores = Object.values(phase1Result).map((item: any) => item.score).filter(score => typeof score === 'number');
  const hasLowScores = scores.some(score => score < 95);

  if (!hasLowScores) {
    console.log("All scores >= 95, proceeding to Phase 4");
    return {
      ...phase1Result,
      provider: "DeepSeek",
      analysis_type: analysisType,
      phase_completed: "1_and_4",
      timestamp: new Date().toISOString()
    };
  }

  // PHASE 2: Pushback for scores < 95
  console.log(`Phase 2: Pushback for scores < 95 in ${analysisType}`);
  const phase2Prompt = `Your position is that for several questions, ${100 - Math.max(...scores)}/100 to ${100 - Math.min(...scores)}/100 outperform the author with respect to the cognitive metrics defined by the questions: that is your position, am I right? And are you sure about that?

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
        { role: 'assistant', content: JSON.stringify(phase1Result) },
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
      analysis_type: analysisType,
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
        analysis_type: analysisType,
        phase_completed: "1_only",
        timestamp: new Date().toISOString()
      };
    }
  }

  // PHASE 3: Walmart Metric Enforcement
  console.log(`Phase 3: Walmart Metric Enforcement for ${analysisType}`);
  const updatedScores = Object.values(phase2Result).map((item: any) => item.score).filter(score => typeof score === 'number');
  const phase3Prompt = `You stated that ${100 - Math.min(...updatedScores)}/100 Walmart patrons outperform the author. Provide specific examples of work by those patrons that demonstrates this superiority. If you cannot, justify or revise the score.

If you scored ${Math.min(...updatedScores)}/100 ('${100-Math.min(...updatedScores)}% outperform'), show me ${100-Math.min(...updatedScores)} Walmart patrons whose ${analysisType} on similar topics is sharper. If you can't, the score is wrong.

Before finalizing scores, confirm:
- Have you penalized the text for not being conventional? If yes, recalibrate.
- Does the score reflect truth density, not compliance with norms?
- Is the Walmart metric empirically grounded or a lazy guess?

Return final JSON scores.`;

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
        { role: 'assistant', content: JSON.stringify(phase1Result) },
        { role: 'user', content: phase2Prompt },
        { role: 'assistant', content: JSON.stringify(phase2Result) },
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
      analysis_type: analysisType,
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
        analysis_type: analysisType,
        phase_completed: "1_and_2",
        timestamp: new Date().toISOString()
      };
    }
  }

  // PHASE 4: Accept and return final results
  console.log(`Phase 4: Final validation and acceptance for ${analysisType}`);
  return {
    ...finalResult,
    provider: "DeepSeek",
    analysis_type: analysisType,
    phase_completed: "all_four",
    timestamp: new Date().toISOString()
  };
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

// ORIGINALITY QUESTIONS (10 questions from user protocol)  
const ORIGINALITY_QUESTIONS = [
  "IS IT ORIGINAL (NOT IN THE SENSE THAT IT HAS ALREADY BEEN SAID BUT IN THE SENSE THAT ONLY A FECUND MIND COULD COME UP WITH IT)?",
  "ARE THE WAYS THE IDEAS ARE INTERCONNECTED ORIGINAL? OR ARE THOSE INTERCONNECTIONS CONVENTION-DRIVEN AND DOCTRINAIRE?",
  "ARE IDEAS DEVELOPED IN A FRESH AND ORIGINAL WAY? OR IS THE IDEA-DEVELOPMENT MERELY ASSOCIATIVE, COMMONSENSE-BASED (OR COMMON-NONSENSE-BASED), OR DOCTRINAIRE?",
  "IS IT ORIGINAL RELATIVE TO THE DATASET THAT, JUDGING BY WHAT IT SAYS AND HOW IT SAYS IT, IT APPEARS TO BE ADDRESSING?",
  "IS IT ORIGINAL IN A SUBSTANTIVE SENSE (IN THE SENSE IN WHICH BACH WAS ORIGINAL) OR ONLY IN A FRIVOLOUS TOKEN SENSE (THE SENSE IN WHICH SOMEBODY WHO RANDOMLY BANGS ON A PIANO IS 'ORIGINAL')?",
  "IS IT BOILERPLATE (OR IF IT, PER SE, IS NOT BOILER PLATE, IS IT THE RESULT OF APPLYING BOILER PLATE PROTOCOLS IN A BOILER PLATE WAY TO SOME DATASET)?",
  "WOULD SOMEBODY WHO HAD NOT READ IT, BUT WAS OTHERWISE EDUCATED AND INFORMED, COME WAY FROM IT BEING MORE ENGLIGHTED AND BETTER EQUIPPED TO ADJUDICATE INTELLECTUAL QUESTIONS? OR, ON THE CONTRARY, WOULD HE COME UP CONFUSED WITH NOTHING TANGIBLE TO SHOW FOR IT?",
  "WOULD SOMEBODY READING IT COME AWAY FROM THE EXPERIENCE WITH INSIGHTS THAT WOULD OTHERWISE BE HARD TO ACQUIRE THAT HOLD UP IN GENERAL?",
  "OR WOULD WHATEVER HIS TAKEAWAY WAS HAVE VALIDITY ONLY RELATIVE TO VALIDITIES THAT ARE SPECIFIC TO SOME AUTHOR OR SYSTEM AND PROBABLY DO NOT HAVE MUCH OBJECTIVE LEGITIMACY?"
];

// COGENCY QUESTIONS (12 questions from user protocol)
const COGENCY_QUESTIONS = [
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

// OVERALL QUALITY QUESTIONS (19 questions from user protocol)
const OVERALL_QUALITY_QUESTIONS = [
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
  "IF ORIGINAL, IS IT ORIGINAL BY VIRTUE OF BEING INSIGHTFUL OR BY VIRTUE OF BEING DEFECTIVE OR FACETIOUS?",
  "IF THERE ARE ELEMENTS OF SPONTANEITY, ARE THEY INTERNAL TO A LARGER, WELL-BEHAVED LOGICAL ARCHITECTURE?",
  "IS THE AUTHOR ABLE TO 'RIFF' (IN A WAY THAT SUPPORTS, RATHER THAN UNDERMINING, THE MAIN POINT AND ARGUMENTATIVE STRUCTURE OF THE PASSAGE)? OR IS IT WOODEN AND BUREAUCRATIC?",
  "IS IT ACTUALLY SMART OR IS IT 'GEEK'-SMART (SMART IN THE WAY THAT SOMEBODY WHO IS NOT PARTICULARLY SMART BUT WHO WAS ALWAYS LAST TO BE PICKED BY THE SOFTBALL TEAM BECOMES SMART)?",
  "IS IT MR. SPOCKS SMART (ACTUALLY SMART) OR Lieutenant DATA SMART (WHAT A DUMB PERSON WOULD REGARD AS SMART)?",
  "IS IT \"SMART\" IN THE SENSE THAT, FOR CULTURAL OR SOCIAL REASONS, WE WOULD PRESUME THAT ONLY A SMART PERSON WOULD DISCUSS SUCH MATTERS? OR IS IT INDEED--SMART?",
  "IS IT SMART BY VIRTUE BEING ARGUMENTATIVE AND SNIPPY OR BY VIRTUE OF BEING ILLUMINATING?"
];



// Export analysis functions - Intelligence uses four-phase protocol
export async function analyzeIntelligence(passage: PassageData): Promise<any> {
  return fourPhaseIntelligenceEvaluation(passage.text);
}

export async function analyzePrimaryIntelligence(passage: PassageData): Promise<any> {
  return fourPhaseIntelligenceEvaluation(passage.text);
}

export async function analyzeOriginality(passage: PassageData): Promise<any> {
  return fourPhaseOriginalityEvaluation(passage.text);
}

export async function analyzeCogency(passage: PassageData): Promise<any> {
  return fourPhaseCogencyEvaluation(passage.text);
}

export async function analyzeOverallQuality(passage: PassageData): Promise<any> {
  return fourPhaseOverallQualityEvaluation(passage.text);
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