export interface PassageData {
  title: string;
  text: string;
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
  };
  noveltyHeatmap: {
    passageA: Array<{
      content: string;
      heat: number;
    }>;
    passageB: Array<{
      content: string;
      heat: number;
    }>;
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
  };
  verdict: string;
}

export interface AnalyzePassagesRequest {
  passageA: PassageData;
  passageB: PassageData;
}
