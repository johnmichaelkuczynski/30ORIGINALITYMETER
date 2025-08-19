// UNIVERSAL THREE-PHASE EVALUATION ENGINE FOR ALL LLM PROVIDERS
import { 
  INTELLIGENCE_QUESTIONS, 
  ORIGINALITY_QUESTIONS, 
  COGENCY_QUESTIONS, 
  OVERALL_QUALITY_QUESTIONS,
  chunkText,
  generatePhase1Prompt,
  generatePhase2Prompt,
  generatePhase3Prompt
} from './protocols';

export interface MetricResult {
  question: string;
  score: number;
  quotation: string;
  explanation: string;
}

export interface EvaluationResult {
  [key: string]: MetricResult;
  provider?: string;
  analysis_type?: string;
  phase_completed?: string;
  timestamp?: string;
}

export interface LLMProvider {
  name: string;
  apiCall: (prompt: string, maxTokens?: number) => Promise<string>;
}

// UNIVERSAL THREE-PHASE EVALUATION ENGINE
export async function universalThreePhaseEvaluation(
  text: string,
  analysisType: 'intelligence' | 'originality' | 'cogency' | 'quality',
  provider: LLMProvider
): Promise<EvaluationResult> {
  
  // Get appropriate questions for analysis type
  const questions = getQuestionsForType(analysisType);
  
  // Handle chunking for large texts
  const chunks = chunkText(text, 6000);
  let finalResult: any = {};
  
  if (chunks.length > 1) {
    console.log(`Text chunked into ${chunks.length} parts for ${analysisType} analysis`);
    
    // Analyze each chunk separately then combine
    const chunkResults = await Promise.all(
      chunks.map(chunk => evaluateChunk(chunk, questions, analysisType, provider))
    );
    
    // Combine chunk results (average scores, best quotations)
    finalResult = combineChunkResults(chunkResults, questions);
  } else {
    // Single evaluation for text that fits in one chunk
    finalResult = await evaluateChunk(text, questions, analysisType, provider);
  }

  return {
    ...finalResult,
    provider: provider.name,
    analysis_type: analysisType,
    phase_completed: "all_three",
    timestamp: new Date().toISOString()
  };
}

async function evaluateChunk(
  text: string,
  questions: string[],
  analysisType: string,
  provider: LLMProvider
): Promise<any> {
  
  // PHASE 1: Initial evaluation
  console.log(`Phase 1: Initial ${analysisType} evaluation`);
  const phase1Prompt = generatePhase1Prompt(questions, text, analysisType);
  
  let phase1Response = await provider.apiCall(phase1Prompt, 2000);
  let phase1Result = parseJsonResponse(phase1Response, questions);
  
  // Extract scores for phase 2 check
  const scores = Object.values(phase1Result).map((item: any) => item.score).filter(score => typeof score === 'number');
  const hasLowScores = scores.some(score => score < 95);

  if (!hasLowScores) {
    console.log("All scores >= 95, proceeding to Phase 3");
    return phase1Result;
  }

  // PHASE 2: Pushback for scores < 95
  console.log('Phase 2: Pushback for scores < 95');
  const phase2Prompt = generatePhase2Prompt(questions, scores);
  
  let phase2Response = await provider.apiCall(phase2Prompt, 2000);
  let phase2Result = parseJsonResponse(phase2Response, questions);
  
  // PHASE 3: Walmart Metric Enforcement
  console.log('Phase 3: Walmart Metric Enforcement');
  const updatedScores = Object.values(phase2Result).map((item: any) => item.score).filter(score => typeof score === 'number');
  const phase3Prompt = generatePhase3Prompt(updatedScores);
  
  let phase3Response = await provider.apiCall(phase3Prompt, 1500);
  let finalResult = parseJsonResponse(phase3Response, questions);
  
  return finalResult;
}

function getQuestionsForType(analysisType: string): string[] {
  switch (analysisType) {
    case 'intelligence': return INTELLIGENCE_QUESTIONS;
    case 'originality': return ORIGINALITY_QUESTIONS;
    case 'cogency': return COGENCY_QUESTIONS;
    case 'quality': return OVERALL_QUALITY_QUESTIONS;
    default: throw new Error(`Unknown analysis type: ${analysisType}`);
  }
}

function parseJsonResponse(response: string, questions: string[]): any {
  try {
    // Direct JSON parse
    const parsed = JSON.parse(response);
    return validateAndCleanResult(parsed, questions);
  } catch (e) {
    // Try extracting JSON from code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return validateAndCleanResult(parsed, questions);
      } catch (e2) {
        // Fall back to manual extraction
        return manualExtraction(response, questions);
      }
    }
    return manualExtraction(response, questions);
  }
}

function validateAndCleanResult(result: any, questions: string[]): any {
  const validResult: any = {};
  
  questions.forEach((question, index) => {
    const key = index.toString();
    if (result[key]) {
      validResult[key] = {
        question: question,
        score: typeof result[key].score === 'number' ? result[key].score : 50,
        quotation: result[key].quotation || "No quotation provided",
        explanation: result[key].explanation || "Analysis unavailable"
      };
    } else {
      validResult[key] = {
        question: question,
        score: 50,
        quotation: "Response unavailable",
        explanation: "Fallback result"
      };
    }
  });
  
  return validResult;
}

function manualExtraction(response: string, questions: string[]): any {
  const result: any = {};
  
  questions.forEach((question, index) => {
    const scoreMatch = response.match(new RegExp(`"${index}"[^}]*"score"[^0-9]*([0-9]+)`, 'i'));
    const quotationMatch = response.match(new RegExp(`"${index}"[^}]*"quotation"[^"]*"([^"]*)"`, 'i'));
    
    result[index.toString()] = {
      question: question,
      score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
      quotation: quotationMatch ? quotationMatch[1] : "Extraction failed",
      explanation: "Manual extraction"
    };
  });
  
  return result;
}

function combineChunkResults(chunkResults: any[], questions: string[]): any {
  const combined: any = {};
  
  questions.forEach((question, index) => {
    const key = index.toString();
    const chunkScores = chunkResults.map(result => result[key]?.score || 50);
    const averageScore = Math.round(chunkScores.reduce((a, b) => a + b, 0) / chunkScores.length);
    
    // Select best quotation from chunks
    const bestChunk = chunkResults.reduce((best, current) => 
      (current[key]?.score || 0) > (best[key]?.score || 0) ? current : best
    );
    
    combined[key] = {
      question: question,
      score: averageScore,
      quotation: bestChunk[key]?.quotation || "Combined analysis",
      explanation: `Combined from ${chunkResults.length} text chunks (avg: ${averageScore}/100)`
    };
  });
  
  return combined;
}

// DUAL DOCUMENT EVALUATION
export async function universalDualEvaluation(
  textA: string,
  textB: string,
  analysisType: 'intelligence' | 'originality' | 'cogency' | 'quality',
  provider: LLMProvider
): Promise<any> {
  
  console.log(`Starting dual ${analysisType} analysis using three-phase methodology`);
  
  // Analyze each document separately using the same three-phase method
  const resultA = await universalThreePhaseEvaluation(textA, analysisType, provider);
  const resultB = await universalThreePhaseEvaluation(textB, analysisType, provider);
  
  // Combine results into dual format expected by frontend
  const questions = getQuestionsForType(analysisType);
  const combinedResult: any = {};
  
  questions.forEach((question, index) => {
    const key = index.toString();
    combinedResult[key] = {
      question: question,
      passageA: resultA[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" },
      passageB: resultB[key] || { score: 50, quotation: "Analysis unavailable", explanation: "Fallback" }
    };
  });
  
  return {
    ...combinedResult,
    provider: provider.name,
    analysis_type: `${analysisType}_dual`,
    timestamp: new Date().toISOString()
  };
}