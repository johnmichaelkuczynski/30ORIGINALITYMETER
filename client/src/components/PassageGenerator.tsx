import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { AnalysisResult, PassageData, StyleOption, GeneratedPassageResult } from '@/lib/types';
import { Loader2, Download, RefreshCcw, Sparkle, Wand2, Copy, Trash2 } from 'lucide-react';
import useAIDetection from '@/hooks/use-ai-detection';
import AIDetectionBadge from '@/components/AIDetectionBadge';

interface PassageGeneratorProps {
  analysisResult: AnalysisResult;
  passage: PassageData;
  onReanalyze: (passage: PassageData) => void;
}

export default function PassageGenerator({ analysisResult, passage, onReanalyze }: PassageGeneratorProps) {
  const [styleOption, setStyleOption] = useState<StyleOption>('prioritize-originality');
  const [activeTab, setActiveTab] = useState<string>('original');
  const [generatedResult, setGeneratedResult] = useState<GeneratedPassageResult | null>(null);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [showCustomInstructions, setShowCustomInstructions] = useState<boolean>(false);
  const { toast } = useToast();
  
  // AI detection
  const { 
    detectAIContent,
    getDetectionResult,
    isDetecting
  } = useAIDetection();
  
  // Keep track of text IDs for AI detection
  const originalTextId = 'original-passage';
  const improvedTextId = 'improved-passage';
  
  // Detect AI content only when there are substantial changes
  useEffect(() => {
    // Only detect if passage text has reasonable length
    if (passage.text && passage.text.trim().length > 100) {
      detectAIContent(passage.text, originalTextId);
    }
  }, [passage.text, detectAIContent, originalTextId]);
  
  // Separate effect for the improved passage
  useEffect(() => {
    // Only detect if improved passage is available and has reasonable length
    if (generatedResult?.improvedPassage?.text && 
        generatedResult.improvedPassage.text.trim().length > 100) {
      detectAIContent(generatedResult.improvedPassage.text, improvedTextId);
    }
  }, [generatedResult?.improvedPassage?.text, detectAIContent, improvedTextId]);

  // Mutation for generating a more original passage
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        'POST',
        '/api/generate-original',
        {
          passage,
          analysisResult,
          styleOption,
          customInstructions: showCustomInstructions ? customInstructions.trim() : undefined
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
    
    // Make sure we have text to analyze
    if (!generatedResult.improvedPassage.text || generatedResult.improvedPassage.text.trim() === '') {
      toast({
        title: "Error",
        description: "Cannot analyze empty text. Please try generating a passage first.",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure the passage has a title, even if empty
    const improvedPassageWithTitle = {
      ...generatedResult.improvedPassage,
      title: generatedResult.improvedPassage.title || "Improved Passage"
    };
    
    // Log what we're re-analyzing
    console.log("Re-analyzing improved passage:", {
      title: improvedPassageWithTitle.title,
      textLength: improvedPassageWithTitle.text.length
    });
    
    // Dispatch custom event for main component to handle
    const event = new CustomEvent('analyze-improved-passage', {
      detail: {
        passage: improvedPassageWithTitle
      }
    });
    document.dispatchEvent(event);
    
    // Also call the prop callback
    onReanalyze(improvedPassageWithTitle);
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

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Custom Improvement Instructions
              </label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCustomInstructions(!showCustomInstructions)}
                className="h-8 text-xs"
              >
                {showCustomInstructions ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            {showCustomInstructions && (
              <>
                <Textarea
                  placeholder="Describe exactly how you want the passage to be improved. These instructions will override the standard style options."
                  className="mt-2 resize-none"
                  rows={4}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  disabled={generateMutation.isPending}
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="font-medium text-primary">These custom instructions will completely override all other style settings.</p>
                  <p className="mt-1">Be specific about the exact changes you want. You can request specific styles, content additions, or formatting changes.</p>
                  <div className="mt-2 p-2 border rounded-md bg-muted/20">
                    <p className="font-medium">Example Instructions:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>"Make it sound more like Nietzsche but add examples from modern physics"</li>
                      <li>"Improve coherence and add more concrete examples from economics"</li>
                      <li>"Rewrite this as a Socratic dialogue between two philosophers"</li>
                      <li>"Add technical terminology from quantum mechanics while maintaining readability"</li>
                      <li>"Write it in the style of David Foster Wallace, including footnotes"</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
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
            
            <div className="mt-2 text-xs text-muted-foreground">
              {styleOption === 'keep-voice' && (
                <p>Maintains your original tone and style while adding intellectual depth and concrete examples.</p>
              )}
              {styleOption === 'academic' && (
                <p>Uses a more formal, scholarly tone with precise language suitable for academic or professional audiences.</p>
              )}
              {styleOption === 'punchy' && (
                <p>Creates a concise and impactful version that is sharp, direct, and still intellectually rigorous.</p>
              )}
              {styleOption === 'prioritize-originality' && (
                <p>Maximizes originality by adding complexity, depth, and novel perspectives while maintaining coherence.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Generation button */}
            <Button 
              onClick={handleGenerate} 
              className="w-full"
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkle className="mr-2 h-4 w-4" />
                  Generate More Original Version
                </>
              )}
            </Button>

            {generatedResult && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Results</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReanalyze}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Re-evaluate This Version
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadGeneratedPassage}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                
                {improvement > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
                    <div className="font-medium mb-1">Improved Originality Score</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 font-medium">
                        +{improvement.toFixed(1)} points
                      </Badge>
                      <span className="text-xs">
                        From {derivativeIndex.toFixed(1)} to {estimatedScore.toFixed(1)} out of 10
                      </span>
                    </div>
                    <Progress 
                      value={estimatedScore * 10} 
                      className="h-2 mt-2" 
                    />
                  </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="original">Original</TabsTrigger>
                    <TabsTrigger value="improved">Improved</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="original" className="mt-2">
                    {/* Badge positioned above the content */}
                    <div className="flex justify-end mb-1">
                      <AIDetectionBadge 
                        result={getDetectionResult(originalTextId)} 
                        isDetecting={isDetecting} 
                        textId={originalTextId}
                        onDetect={() => detectAIContent(passage.text, originalTextId)}
                      />
                    </div>
                    <div className="border rounded-md p-4 bg-muted/30 text-sm whitespace-pre-wrap">
                      {passage.text}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="improved" className="mt-2">
                    {/* Badge and buttons positioned above the content */}
                    <div className="flex justify-end mb-1 gap-2">
                      <AIDetectionBadge 
                        result={getDetectionResult(improvedTextId)} 
                        isDetecting={isDetecting} 
                        textId={improvedTextId}
                        onDetect={() => generatedResult?.improvedPassage?.text && 
                          detectAIContent(generatedResult.improvedPassage.text, improvedTextId)}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 bg-white/80 hover:bg-white text-gray-700"
                        onClick={() => {
                          if (generatedResult?.improvedPassage?.text) {
                            navigator.clipboard.writeText(generatedResult.improvedPassage.text);
                            toast({
                              title: "Copied to clipboard",
                              description: "The improved passage has been copied to your clipboard.",
                            });
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 bg-white/80 hover:bg-white text-gray-700"
                        onClick={() => {
                          if (confirm("Are you sure you want to clear the improved passage?")) {
                            setGeneratedResult(null);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                    <div className="border rounded-md p-4 bg-white text-sm whitespace-pre-wrap">
                      {generatedResult?.improvedPassage?.text}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}