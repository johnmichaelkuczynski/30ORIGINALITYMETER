import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export interface AIDetectionResult {
  isAIGenerated: boolean;
  score: number;       // 0-1 score, higher means more likely AI generated
  confidence: string;  // "Low", "Medium", "High"
  details?: string;    // Optional explanation
}

export function useAIDetection() {
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectionResults, setDetectionResults] = useState<Record<string, AIDetectionResult>>({});
  const { toast } = useToast();

  const detectAIContent = async (text: string, id: string): Promise<AIDetectionResult> => {
    if (!text || text.trim().length < 50) {
      const result = {
        isAIGenerated: false,
        score: 0,
        confidence: "Low" as const,
        details: "Text too short for reliable detection"
      };
      setDetectionResults(prev => ({ ...prev, [id]: result }));
      return result;
    }

    try {
      setIsDetecting(true);
      const response = await apiRequest('POST', '/api/detect-ai', { text });
      const data = await response.json() as AIDetectionResult;
      
      // Store result using the provided ID
      setDetectionResults(prev => ({ ...prev, [id]: data }));
      return data;
    } catch (error) {
      console.error("AI detection error:", error);
      const fallbackResult = {
        isAIGenerated: false,
        score: 0,
        confidence: "Low" as const,
        details: "Detection failed"
      };
      setDetectionResults(prev => ({ ...prev, [id]: fallbackResult }));
      
      toast({
        title: "AI Detection Failed",
        description: "Could not determine AI content probability.",
        variant: "destructive",
      });
      
      return fallbackResult;
    } finally {
      setIsDetecting(false);
    }
  };

  const getDetectionResult = (id: string): AIDetectionResult | null => {
    return detectionResults[id] || null;
  };

  const clearDetectionResult = (id: string) => {
    setDetectionResults(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const clearAllDetectionResults = () => {
    setDetectionResults({});
  };

  return {
    detectAIContent,
    getDetectionResult,
    clearDetectionResult,
    clearAllDetectionResults,
    isDetecting,
    detectionResults
  };
}

export default useAIDetection;