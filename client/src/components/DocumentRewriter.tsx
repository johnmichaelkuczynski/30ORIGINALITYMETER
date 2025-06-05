import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileEdit, Download, ArrowRight, FileText, Image as ImageIcon, Wand2 } from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import { useToast } from '@/hooks/use-toast';

interface DocumentRewriterProps {
  onSendToAnalysis: (text: string, title?: string) => void;
}

export default function DocumentRewriter({ onSendToAnalysis }: DocumentRewriterProps) {
  const [sourceText, setSourceText] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [contentSource, setContentSource] = useState('');
  const [styleSource, setStyleSource] = useState('');
  const [rewriteResult, setRewriteResult] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'word' | 'pdf' | 'txt' | 'html'>('word');
  const [inputMethod, setInputMethod] = useState<'upload' | 'type'>('upload');
  const { toast } = useToast();

  const handleDocumentProcessed = (content: string, filename?: string, type?: 'content' | 'style') => {
    if (type === 'content') {
      setContentSource(content);
      toast({
        title: "Content source loaded",
        description: `${filename} will be used as content reference for the rewrite.`,
      });
    } else if (type === 'style') {
      setStyleSource(content);
      toast({
        title: "Style source loaded", 
        description: `${filename} will be used as style reference for the rewrite.`,
      });
    } else {
      setSourceText(content);
      setSourceTitle(filename || 'Uploaded Document');
      toast({
        title: "Document loaded",
        description: `${filename} is ready to be rewritten.`,
      });
    }
  };

  const handleRewrite = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "No content to rewrite",
        description: "Please upload a document or type your content first.",
        variant: "destructive",
      });
      return;
    }

    if (!customInstructions.trim()) {
      toast({
        title: "Instructions required",
        description: "Please provide custom instructions for the rewrite.",
        variant: "destructive",
      });
      return;
    }

    setIsRewriting(true);
    try {
      const response = await fetch('/api/rewrite-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceText,
          customInstructions,
          contentSource: contentSource || undefined,
          styleSource: styleSource || undefined,
          preserveMath: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Rewrite failed: ${response.statusText}`);
      }

      const result = await response.json();
      setRewriteResult(result.rewrittenText);
      
      toast({
        title: "Rewrite completed",
        description: "Your document has been successfully rewritten with perfect math notation.",
      });
    } catch (error) {
      console.error('Error during rewrite:', error);
      toast({
        title: "Rewrite failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleDownload = async () => {
    if (!rewriteResult) {
      toast({
        title: "No content to download",
        description: "Please complete a rewrite first.",
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
          content: rewriteResult,
          format: downloadFormat,
          title: sourceTitle || 'Rewritten Document',
        }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rewritten-${sourceTitle || 'document'}.${downloadFormat === 'word' ? 'docx' : downloadFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `Your rewritten document is downloading as ${downloadFormat.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const handleSendToAnalysis = () => {
    if (!rewriteResult) {
      toast({
        title: "No content to analyze",
        description: "Please complete a rewrite first.",
        variant: "destructive",
      });
      return;
    }
    
    onSendToAnalysis(rewriteResult, `Rewritten: ${sourceTitle}`);
    toast({
      title: "Sent to analysis",
      description: "Your rewritten document is now ready for originality evaluation.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="h-5 w-5 text-purple-600" />
          Document Rewriter
          <Badge variant="secondary" className="ml-2">
            Perfect Math Rendering
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Document Input */}
        <div>
          <Label className="text-sm font-medium">Source Document</Label>
          <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as 'upload' | 'type')}>
            <TabsList className="grid w-full grid-cols-2 mt-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload/Drop
              </TabsTrigger>
              <TabsTrigger value="type" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Type/Screenshot
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
              <DocumentUpload
                onDocumentProcessed={handleDocumentProcessed}
                acceptImages={true}
                placeholder="Upload the document you want to rewrite (PDF, Word, TXT, or screenshot)"
              />
            </TabsContent>
            <TabsContent value="type" className="mt-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Type your content here, or upload a screenshot for OCR processing..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <DocumentUpload
                  onDocumentProcessed={handleDocumentProcessed}
                  acceptImages={true}
                  placeholder="Or drop a screenshot here for OCR text and math extraction"
                  className="border-dashed border-gray-200 bg-gray-50"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        {/* Custom Instructions */}
        <div>
          <Label htmlFor="instructions" className="text-sm font-medium">
            Custom Rewrite Instructions *
          </Label>
          <Textarea
            id="instructions"
            placeholder="Describe how you want the document rewritten (e.g., 'Make it more formal and academic', 'Simplify for undergraduate level', 'Add more technical depth', etc.)"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            rows={4}
            className="mt-2 resize-none"
          />
        </div>

        {/* Optional Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Content Source (Optional)</Label>
            <DocumentUpload
              onDocumentProcessed={handleDocumentProcessed}
              acceptImages={true}
              placeholder="Upload document to draw content from"
              sourceType="content"
              className="mt-2"
            />
            {contentSource && (
              <Badge className="mt-2 bg-green-100 text-green-800">
                Content source loaded
              </Badge>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium">Style Source (Optional)</Label>
            <DocumentUpload
              onDocumentProcessed={handleDocumentProcessed}
              acceptImages={true}
              placeholder="Upload document to emulate style from"
              sourceType="style"
              className="mt-2"
            />
            {styleSource && (
              <Badge className="mt-2 bg-blue-100 text-blue-800">
                Style source loaded
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Rewrite Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRewrite}
            disabled={isRewriting || !sourceText.trim() || !customInstructions.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
          >
            {isRewriting ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Rewrite Document
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {rewriteResult && (
          <div className="space-y-4">
            <Separator />
            <div>
              <Label className="text-sm font-medium">Rewritten Document</Label>
              <Card className="mt-2 p-4 bg-gray-50">
                <div 
                  className="prose max-w-none text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: rewriteResult }}
                />
              </Card>
            </div>

            {/* Download and Analysis Options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
                  Download
                </Button>
              </div>
              
              <Button
                onClick={handleSendToAnalysis}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Send to Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}