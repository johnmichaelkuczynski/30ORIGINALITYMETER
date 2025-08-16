/**
 * Types for the new 160-parameter analysis system
 */

export interface ParameterScore {
  metric: string;
  score: number; // 0-100 percentile score
  assessment: string;
  strengths: string[];
  weaknesses: string[];
}

export interface Analysis160Result {
  frameworkType: 'intelligence' | 'cogency' | 'originality' | 'quality';
  scores: ParameterScore[];
  overallScore: number;
  verdict: string;
  summary: string;
}

export interface ComparisonResult160 {
  textA: Analysis160Result;
  textB: Analysis160Result;
  comparison: string;
}

export type AnalysisFramework = 'intelligence' | 'cogency' | 'originality' | 'quality';
export type LLMProvider = 'deepseek' | 'openai' | 'anthropic' | 'perplexity';

export interface AnalysisRequest {
  text: string;
  provider?: LLMProvider;
}

export interface ComparisonRequest {
  textA: string;
  textB: string;
  provider?: LLMProvider;
}