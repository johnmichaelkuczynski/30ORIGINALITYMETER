import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, LineChart, PieChart, AreaChart, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GraphResult {
  svg: string;
  title: string;
  description: string;
  explanation?: string;
  specifications?: {
    equation?: string;
    domain?: string;
    amplitude?: string;
    frequency?: string;
    decayRate?: string;
    dataPoints?: string;
    keyFeatures?: string[];
    modelingAssumptions?: string;
    theoreticalBasis?: string;
  };
}

export default function GraphGenerator() {
  const [description, setDescription] = useState('');
  const [graphType, setGraphType] = useState<string>('auto');
  const [title, setTitle] = useState('');
  const [xLabel, setXLabel] = useState('');
  const [yLabel, setYLabel] = useState('');
  const [llmProvider, setLlmProvider] = useState<string>('gpt-4o-mini');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGraph, setGeneratedGraph] = useState<GraphResult | null>(null);
  
  const { toast } = useToast();

  const generateGraph = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe what kind of graph you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          type: graphType === 'auto' ? undefined : graphType,
          title: title.trim() || undefined,
          xLabel: xLabel.trim() || undefined,
          yLabel: yLabel.trim() || undefined,
          llmProvider: llmProvider,
          width: 600,
          height: 400
        }),
      });

      if (!response.ok) {
        throw new Error('Graph generation failed');
      }

      const result = await response.json();
      setGeneratedGraph(result);
      
      toast({
        title: "Graph generated successfully",
        description: "Your graph has been created and is ready to use",
      });

    } catch (error) {
      console.error('Error generating graph:', error);
      toast({
        title: "Graph generation failed",
        description: "Failed to generate the graph. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyGraphCode = () => {
    if (generatedGraph) {
      navigator.clipboard.writeText(generatedGraph.svg);
      toast({
        title: "SVG copied",
        description: "Graph SVG code copied to clipboard",
      });
    }
  };

  const downloadGraphReport = async () => {
    if (!generatedGraph) return;
    
    try {
      // Create report content combining graph and analysis
      const content = {
        title: generatedGraph.title,
        description: generatedGraph.description,
        explanation: generatedGraph.explanation || '',
        specifications: generatedGraph.specifications
      };
      
      const response = await fetch('/api/download-graph-txt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });
      
      if (!response.ok) {
        throw new Error('Report generation failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedGraph.title.replace(/[^a-zA-Z0-9]/g, '_')}_analysis.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Report downloaded",
        description: "Graph analysis report has been downloaded",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setDescription('');
    setGraphType('auto');
    setTitle('');
    setXLabel('');
    setYLabel('');
    setGeneratedGraph(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Graph Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Graph Description*</Label>
            <Textarea
              id="description"
              placeholder="Describe a real-world scenario to model, or request both a graph and explanation. Examples:&#10;• Assume information spreads based on network effects but tapers due to attention limits. Graph spread velocity over time.&#10;• Model how viral content popularity changes based on emotional salience and social saturation. Include analysis.&#10;• Create a graph showing technology adoption rates with network effects, then explain the implications.&#10;• Model disease transmission considering behavior changes and public health measures."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="graph-type">Graph Type</Label>
              <Select value={graphType} onValueChange={setGraphType} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Auto-detect
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="scatter">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Scatter Plot
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Pie Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center gap-2">
                      <AreaChart className="h-4 w-4" />
                      Area Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Custom graph title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="x-label">X-Axis Label (Optional)</Label>
              <Input
                id="x-label"
                placeholder="X-axis label"
                value={xLabel}
                onChange={(e) => setXLabel(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="y-label">Y-Axis Label (Optional)</Label>
              <Input
                id="y-label"
                placeholder="Y-axis label"
                value={yLabel}
                onChange={(e) => setYLabel(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="llm-provider">AI Model</Label>
              <Select value={llmProvider} onValueChange={setLlmProvider} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      GPT-4o Mini (Fast)
                    </div>
                  </SelectItem>
                  <SelectItem value="gpt-4o">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      GPT-4o (Balanced)
                    </div>
                  </SelectItem>
                  <SelectItem value="gpt-4">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      GPT-4 (Precise)
                    </div>
                  </SelectItem>
                  <SelectItem value="claude-sonnet-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Claude Sonnet 4 (Advanced)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateGraph}
              disabled={isGenerating || !description.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Graph'
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={clearAll}
              disabled={isGenerating}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedGraph && (
        <Card>
          <CardHeader>
            <CardTitle>{generatedGraph.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: generatedGraph.svg }}
            />
            
            <p className="text-sm text-gray-600">{generatedGraph.description}</p>
            
            {generatedGraph.explanation && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-sm mb-3">Analysis & Explanation</h4>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {generatedGraph.explanation}
                </div>
              </div>
            )}
            
            {generatedGraph.specifications && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-sm mb-3">Mathematical Specifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {generatedGraph.specifications.equation && (
                    <div>
                      <span className="font-medium">Equation:</span>
                      <div className="bg-gray-50 p-2 rounded font-mono text-xs mt-1">
                        {generatedGraph.specifications.equation}
                      </div>
                    </div>
                  )}
                  {generatedGraph.specifications.domain && (
                    <div>
                      <span className="font-medium">Domain:</span>
                      <div className="text-gray-600">{generatedGraph.specifications.domain}</div>
                    </div>
                  )}
                  {generatedGraph.specifications.amplitude && (
                    <div>
                      <span className="font-medium">Amplitude:</span>
                      <div className="text-gray-600">{generatedGraph.specifications.amplitude}</div>
                    </div>
                  )}
                  {generatedGraph.specifications.frequency && (
                    <div>
                      <span className="font-medium">Frequency:</span>
                      <div className="text-gray-600">{generatedGraph.specifications.frequency}</div>
                    </div>
                  )}
                  {generatedGraph.specifications.decayRate && (
                    <div>
                      <span className="font-medium">Decay Rate:</span>
                      <div className="text-gray-600">{generatedGraph.specifications.decayRate}</div>
                    </div>
                  )}
                  {generatedGraph.specifications.dataPoints && (
                    <div>
                      <span className="font-medium">Data Points:</span>
                      <div className="text-gray-600">{generatedGraph.specifications.dataPoints}</div>
                    </div>
                  )}
                  {generatedGraph.specifications.modelingAssumptions && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Modeling Assumptions:</span>
                      <div className="text-gray-600">{generatedGraph.specifications.modelingAssumptions}</div>
                    </div>
                  )}
                  {generatedGraph.specifications.theoreticalBasis && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Theoretical Basis:</span>
                      <div className="text-gray-600">{generatedGraph.specifications.theoreticalBasis}</div>
                    </div>
                  )}
                </div>
                {generatedGraph.specifications.keyFeatures && generatedGraph.specifications.keyFeatures.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-sm">Key Features:</span>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {generatedGraph.specifications.keyFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyGraphCode}
                className="flex-1"
              >
                Copy SVG Code
              </Button>
              <Button
                variant="outline"
                onClick={downloadGraphReport}
                className="flex-1"
              >
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}