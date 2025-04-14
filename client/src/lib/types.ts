export interface PassageData {
  title: string;
  text: string;
}

export interface FeedbackData {
  comment: string;
  aiResponse: string;
  isRevised: boolean;
}

export interface SupportingDocument {
  title: string;
  content: string;
}

export interface AnalysisResult {
  conceptualLineage: {
    passageA: {
      primaryInfluences: string;
      intellectualTrajectory: string;
    };
    passageB: {
      primaryInfluences: string;
      intellectualTrajectory: string;
    };
    feedback?: FeedbackData;
  };
  semanticDistance: {
    passageA: {
      distance: number;
      label: string;
    };
    passageB: {
      distance: number;
      label: string;
    };
    keyFindings: string[];
    semanticInnovation: string;
    feedback?: FeedbackData;
  };
  noveltyHeatmap: {
    passageA: Array<{
      content: string;
      heat: number;
      quote?: string;
      explanation?: string;
    }>;
    passageB: Array<{
      content: string;
      heat: number;
      quote?: string;
      explanation?: string;
    }>;
    feedback?: FeedbackData;
  };
  derivativeIndex: {
    passageA: {
      score: number;
      components: Array<{
        name: string;
        score: number;
      }>;
    };
    passageB: {
      score: number;
      components: Array<{
        name: string;
        score: number;
      }>;
    };
    feedback?: FeedbackData;
  };
  conceptualParasite: {
    passageA: {
      level: "Low" | "Moderate" | "High";
      elements: string[];
      assessment: string;
    };
    passageB: {
      level: "Low" | "Moderate" | "High";
      elements: string[];
      assessment: string;
    };
    feedback?: FeedbackData;
  };
  coherence: {
    passageA: {
      score: number;
      assessment: string;
      strengths: string[];
      weaknesses: string[];
    };
    passageB: {
      score: number;
      assessment: string;
      strengths: string[];
      weaknesses: string[];
    };
    feedback?: FeedbackData;
  };
  verdict: string;
  supportingDocuments?: SupportingDocument[];
}

export interface AnalyzePassagesRequest {
  passageA: PassageData;
  passageB: PassageData;
}

export interface SubmitFeedbackRequest {
  analysisId: number;
  category: 'conceptualLineage' | 'semanticDistance' | 'noveltyHeatmap' | 'derivativeIndex' | 'conceptualParasite' | 'coherence';
  feedback: string;
  supportingDocument?: SupportingDocument;
  originalResult: AnalysisResult;
  passageA: PassageData;
  passageB: PassageData;
  isSinglePassageMode: boolean;
}

export type StyleOption = 'keep-voice' | 'academic' | 'punchy' | 'prioritize-originality';

export interface GenerateOriginalVersionRequest {
  passage: PassageData;
  analysisResult: AnalysisResult;
  styleOption?: StyleOption;
}

export interface GeneratedPassageResult {
  originalPassage: PassageData;
  improvedPassage: PassageData;
  estimatedDerivativeIndex: number;
  improvementSummary: string;
}
