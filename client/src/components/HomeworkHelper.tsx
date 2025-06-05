import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, Download, FileText, Image as ImageIcon, Brain } from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import { useToast } from '@/hooks/use-toast';

// Simple markdown to HTML converter
const convertMarkdownToHTML = (markdown: string): string => {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded-md my-2 overflow-x-auto"><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br>')
    // Wrap in paragraphs
    .replace(/^(.+)/, '<p class="mb-2">$1')
    .replace(/(.+)$/, '$1</p>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$1. $2</li>');
};

interface HomeworkHelperProps {
  onSendToAnalysis?: (text: string, title?: string) => void;
  initialContent?: string;
}

export default function HomeworkHelper({ onSendToAnalysis, initialContent }: HomeworkHelperProps) {
  const [assignmentText, setAssignmentText] = useState(initialContent || '');
  const [assignmentTitle, setAssignmentTitle] = useState('');

  // Update content when props change
  useEffect(() => {
    if (initialContent) {
      setAssignmentText(initialContent);
      setInputMethod('type'); // Switch to type mode when content is received
    }
  }, [initialContent]);
  const [solution, setSolution] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'word' | 'pdf' | 'txt' | 'html'>('word');
  const [inputMethod, setInputMethod] = useState<'upload' | 'type'>('upload');
  const { toast } = useToast();

  const handleAssignmentProcessed = (content: string, filename?: string) => {
    setAssignmentText(content);
    setAssignmentTitle(filename || 'Assignment');
    toast({
      title: "Assignment loaded",
      description: `${filename} is ready to be solved.`,
    });
  };

  const handleSolveAssignment = async () => {
    if (!assignmentText.trim()) {
      toast({
        title: "No assignment to solve",
        description: "Please upload an assignment or type the questions first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/solve-homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentText,
          preserveMath: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to solve assignment: ${response.statusText}`);
      }

      const result = await response.json();
      setSolution(result.solution);
      
      toast({
        title: "Assignment completed",
        description: "Your homework has been solved with perfect mathematical notation.",
      });
    } catch (error) {
      console.error('Error solving assignment:', error);
      toast({
        title: "Failed to solve assignment",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!solution) {
      toast({
        title: "No solution to download",
        description: "Please complete the assignment first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/download-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: solution,
          format: downloadFormat,
          title: `${assignmentTitle} - Solution`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${assignmentTitle}-solution.${downloadFormat === 'word' ? 'docx' : downloadFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `Your solution is downloading as ${downloadFormat.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error downloading solution:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-green-600" />
          Homework Helper
          <Badge variant="secondary" className="ml-2">
            Complete Solutions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assignment Input */}
        <div>
          <Label className="text-sm font-medium">Assignment/Questions</Label>
          <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as 'upload' | 'type')}>
            <TabsList className="grid w-full grid-cols-2 mt-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload Document
              </TabsTrigger>
              <TabsTrigger value="type" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Type/Screenshot
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
              <DocumentUpload
                onDocumentProcessed={handleAssignmentProcessed}
                acceptImages={true}
                placeholder="Upload your assignment (PDF, Word, TXT, or screenshot with OCR)"
              />
            </TabsContent>
            <TabsContent value="type" className="mt-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Type your assignment questions here, or upload a screenshot for automatic text and math extraction..."
                  value={assignmentText}
                  onChange={(e) => setAssignmentText(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <DocumentUpload
                  onDocumentProcessed={handleAssignmentProcessed}
                  acceptImages={true}
                  placeholder="Or drop a screenshot here for OCR processing"
                  className="border-dashed border-gray-200 bg-gray-50"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        {/* Solve Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSolveAssignment}
            disabled={isProcessing || !assignmentText.trim()}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
          >
            {isProcessing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Solving Assignment...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Complete Assignment
              </>
            )}
          </Button>
        </div>

        {/* Solution */}
        {solution && (
          <div className="space-y-4">
            <Separator />
            <div>
              <Label className="text-sm font-medium">Complete Solution</Label>
              <Card className="mt-2 p-4 bg-gray-50">
                <div 
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(solution) }}
                />
              </Card>
            </div>

            {/* Download Options */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Download as:</Label>
              <Select value={downloadFormat} onValueChange={(value: any) => setDownloadFormat(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="word">Word</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="txt">TXT</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Solution
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}