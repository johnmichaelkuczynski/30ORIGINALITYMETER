import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { AnalysisResult, PassageData, StyleOption, GeneratedPassageResult } from '@/lib/types';
import { Loader2, Download, RefreshCcw, Sparkle } from 'lucide-react';

interface PassageGeneratorProps {
  analysisResult: AnalysisResult;
  passage: PassageData;
  onReanalyze: (passage: PassageData) => void;
}

export default function PassageGenerator({ analysisResult, passage, onReanalyze }: PassageGeneratorProps) {
  const [styleOption, setStyleOption] = useState<StyleOption>('prioritize-originality');
  const [activeTab, setActiveTab] = useState<string>('original');
  const [generatedResult, setGeneratedResult] = useState<GeneratedPassageResult | null>(null);
  const { toast } = useToast();

  // Mutation for generating a more original passage
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        'POST',
        '/api/generate-original',
        {
          passage,
          analysisResult,
          styleOption
        }
      );
      const data = await response.json();
      return data as GeneratedPassageResult;
    },
    onSuccess: (data) => {
      setGeneratedResult(data);
      setActiveTab('improved');
      toast({
        title: 'New version generated',
        description: 'A more original passage has been created',
      });
    },
    onError: (error) => {
      console.error('Failed to generate passage:', error);
      toast({
        title: 'Generation failed',
        description: 'There was a problem generating a more original passage. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleGenerate = () => {
    if (generateMutation.isPending) return;
    generateMutation.mutate();
  };

  const handleReanalyze = () => {
    if (!generatedResult) return;
    onReanalyze(generatedResult.improvedPassage);
  };

  const derivativeIndex = analysisResult.derivativeIndex.passageA.score;
  const estimatedScore = generatedResult?.estimatedDerivativeIndex || 0;
  const improvement = estimatedScore - derivativeIndex;

  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score < 4) return 'text-red-500';
    if (score < 7) return 'text-amber-500';
    return 'text-green-500';
  };

  // Function to download the generated passage
  const downloadGeneratedPassage = () => {
    if (!generatedResult) return;
    
    const element = document.createElement('a');
    const file = new Blob(
      [generatedResult.improvedPassage.text], 
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `improved-${generatedResult.improvedPassage.title || 'passage'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="h-5 w-5" />
            Passage Generator
          </CardTitle>
          <CardDescription>
            Generate a more original version of your passage based on the analysis results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Current originality metrics:</p>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <span className="text-sm font-medium">Derivative Index: </span>
                <span className={`font-bold ${getScoreColor(derivativeIndex)}`}>
                  {derivativeIndex.toFixed(1)}/10
                </span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <span className="text-sm font-medium">Semantic Distance: </span>
                <span className="font-bold">
                  {analysisResult.semanticDistance.passageA.distance.toFixed(0)}/100
                </span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <span className="text-sm font-medium">Parasite Level: </span>
                <Badge variant={
                  analysisResult.conceptualParasite.passageA.level === "Low" 
                    ? "outline" 
                    : analysisResult.conceptualParasite.passageA.level === "Moderate"
                      ? "secondary"
                      : "destructive"
                }>
                  {analysisResult.conceptualParasite.passageA.level}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium">Style Preference:</label>
            <Select
              value={styleOption}
              onValueChange={(value) => setStyleOption(value as StyleOption)}
              disabled={generateMutation.isPending}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select a style option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep-voice">Keep my voice</SelectItem>
                <SelectItem value="academic">Make it more formal/academic</SelectItem>
                <SelectItem value="punchy">Make it more punchy</SelectItem>
                <SelectItem value="prioritize-originality">Prioritize originality</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {generatedResult && (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="improved">Improved</TabsTrigger>
                </TabsList>
                <TabsContent value="original" className="mt-2">
                  <div className="border rounded-md p-4 bg-muted/30 text-sm whitespace-pre-wrap">
                    {passage.text}
                  </div>
                </TabsContent>
                <TabsContent value="improved" className="mt-2">
                  <div className="border rounded-md p-4 bg-muted/30 text-sm whitespace-pre-wrap">
                    {generatedResult.improvedPassage.text}
                  </div>
                </TabsContent>
              </Tabs>

              {activeTab === 'improved' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Estimated Derivative Index</span>
                      <span className={`text-sm font-medium ${getScoreColor(estimatedScore)}`}>
                        {estimatedScore.toFixed(1)}/10 {improvement > 0 ? `(+${improvement.toFixed(1)})` : ''}
                      </span>
                    </div>
                    <Progress value={estimatedScore * 10} className="h-2" />
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <h4 className="text-sm font-medium mb-1">Improvement Summary</h4>
                    <p className="text-sm">{generatedResult.improvementSummary}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : generatedResult ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Generate Another Version
              </>
            ) : (
              <>
                <Sparkle className="mr-2 h-4 w-4" />
                Generate More Original Version
              </>
            )}
          </Button>
          
          {generatedResult && (
            <>
              <Button variant="outline" onClick={downloadGeneratedPassage}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleReanalyze}>
                Re-evaluate This Version
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}