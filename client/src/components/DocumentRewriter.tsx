import { useState, useRef, useEffect } from 'react';

// Declare MathJax type for TypeScript
declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      startup?: {
        promise?: Promise<void>;
      };
    };
  }
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileEdit, Download, ArrowRight, FileText, Image as ImageIcon, Wand2, Eye } from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import { VoiceDictation } from '@/components/ui/voice-dictation';
import { useToast } from '@/hooks/use-toast';

// Utility function to convert markdown to HTML with proper math preservation
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;
  
  // First preserve existing math notation
  const mathBlocks: string[] = [];
  let mathIndex = 0;
  
  // Store display math blocks
  html = html.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
    const placeholder = `__MATH_DISPLAY_${mathIndex}__`;
    mathBlocks[mathIndex] = `$$${content}$$`;
    mathIndex++;
    return placeholder;
  });
  
  // Store inline math
  html = html.replace(/\$([^$\n]+)\$/g, (match, content) => {
    const placeholder = `__MATH_INLINE_${mathIndex}__`;
    mathBlocks[mathIndex] = `$${content}$`;
    mathIndex++;
    return placeholder;
  });
  
  // Convert markdown formatting (avoiding math placeholders)
  html = html.replace(/\*\*((?!__MATH_)[^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*((?!__MATH_)[^*]+)\*/g, '<em>$1</em>');
  
  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Convert double line breaks to paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;
  
  // Convert single line breaks to <br>
  html = html.replace(/\n/g, '<br>');
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br><\/p>/g, '');
  
  // Restore math notation
  for (let i = 0; i < mathBlocks.length; i++) {
    html = html.replace(`__MATH_DISPLAY_${i}__`, mathBlocks[i]);
    html = html.replace(`__MATH_INLINE_${i}__`, mathBlocks[i]);
  }
  
  return html;
}

interface DocumentRewriterProps {
  onSendToAnalysis: (text: string, title?: string) => void;
  initialContent?: string;
  initialTitle?: string;
}

export default function DocumentRewriter({ onSendToAnalysis, initialContent, initialTitle }: DocumentRewriterProps) {
  const [sourceText, setSourceText] = useState(initialContent || '');
  const [sourceTitle, setSourceTitle] = useState(initialTitle || '');

  // Update content when props change
  useEffect(() => {
    if (initialContent) {
      setSourceText(initialContent);
      setInputMethod('type'); // Switch to type mode when content is received
    }
  }, [initialContent]);

  useEffect(() => {
    if (initialTitle) {
      setSourceTitle(initialTitle);
    }
  }, [initialTitle]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [contentSource, setContentSource] = useState('');
  const [styleSource, setStyleSource] = useState('');
  const [rewriteResult, setRewriteResult] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'word' | 'pdf' | 'txt' | 'html'>('html');
  const [inputMethod, setInputMethod] = useState<'upload' | 'type'>('type');
  const [extractedText, setExtractedText] = useState('');
  const [documentStats, setDocumentStats] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);

  // Document analysis when source text changes
  useEffect(() => {
    if (sourceText && sourceText.trim().length > 100) {
      analyzeDocument();
    }
  }, [sourceText]);

  const analyzeDocument = async () => {
    if (!sourceText || sourceText.trim().length < 100) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceText }),
      });

      if (response.ok) {
        const stats = await response.json();
        setDocumentStats(stats);
      }
    } catch (error) {
      console.warn('Document analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced MathJax rendering
  const renderMathJax = async () => {
    try {
      // Ensure MathJax is loaded
      if (!window.MathJax) {
        // Load MathJax if not already loaded
        const script = document.createElement('script');
        script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
        document.head.appendChild(script);
        
        const mathJaxScript = document.createElement('script');
        mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        mathJaxScript.async = true;
        document.head.appendChild(mathJaxScript);
        
        await new Promise(resolve => {
          mathJaxScript.onload = resolve;
        });
      }

      if (window.MathJax && window.MathJax.typesetPromise) {
        await window.MathJax.startup?.promise;
        if (resultRef.current) {
          await window.MathJax.typesetPromise([resultRef.current]);
        }
      }
    } catch (error) {
      console.warn('MathJax rendering error:', error);
    }
  };

  // Re-render MathJax when rewrite result changes
  useEffect(() => {
    if (rewriteResult) {
      setTimeout(renderMathJax, 100);
    }
  }, [rewriteResult]);

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
      setExtractedText(content); // Show extracted text
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
    
    // Show initial progress for large documents
    if (documentStats?.willNeedChunking) {
      toast({
        title: "Processing large document",
        description: `Breaking into ${documentStats.chunkCount} chunks for optimal processing...`,
      });
    }

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
          enableChunking: true,
          maxWordsPerChunk: 800
        }),
      });

      if (!response.ok) {
        throw new Error(`Rewrite failed: ${response.statusText}`);
      }

      const result = await response.json();
      setRewriteResult(result.rewrittenText);
      
      toast({
        title: "Rewrite completed",
        description: documentStats?.willNeedChunking 
          ? `Large document processed in ${documentStats.chunkCount} chunks with perfect math preservation.`
          : "Your document has been successfully rewritten with perfect math notation.",
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

  const handleViewHTML = () => {
    if (!rewriteResult) return;
    
    const htmlContent = convertMarkdownToHTML(rewriteResult);
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${sourceTitle || 'Rewritten Document'}</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; max-width: 800px; }
    h1 { color: #000; font-size: 24px; margin-bottom: 20px; }
    h2 { color: #000; font-size: 20px; margin: 20px 0 10px 0; }
    h3 { color: #000; font-size: 16px; margin: 16px 0 8px 0; }
    p { margin: 12px 0; }
    strong { font-weight: bold; }
    em { font-style: italic; }
  </style>
</head>
<body>
  <h1>${sourceTitle || 'Rewritten Document'}</h1>
  <div>${htmlContent}</div>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    toast({
      title: "HTML preview opened",
      description: "The formatted document opened in a new tab",
    });
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
      a.download = `rewritten-${sourceTitle || 'document'}.${downloadFormat === 'html' ? 'html' : downloadFormat}`;
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

  const handleRewriteAgain = async () => {
    if (!rewriteResult) {
      toast({
        title: "No content to rewrite",
        description: "Please complete a rewrite first.",
        variant: "destructive",
      });
      return;
    }

    if (!customInstructions.trim()) {
      toast({
        title: "Instructions required",
        description: "Please provide custom instructions for the recursive rewrite.",
        variant: "destructive",
      });
      return;
    }

    setIsRewriting(true);
    
    toast({
      title: "Starting recursive rewrite",
      description: "Using your current rewrite as the new source text...",
    });

    try {
      const response = await fetch('/api/rewrite-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceText: rewriteResult, // Use the current rewrite result as source
          customInstructions,
          contentSource: contentSource || undefined,
          styleSource: styleSource || undefined,
          preserveMath: true,
          enableChunking: true,
          maxWordsPerChunk: 800
        }),
      });

      if (!response.ok) {
        throw new Error(`Recursive rewrite failed: ${response.statusText}`);
      }

      const result = await response.json();
      setRewriteResult(result.rewrittenText);
      
      toast({
        title: "Recursive rewrite completed",
        description: "Your document has been rewritten again with the same instructions.",
      });
    } catch (error) {
      console.error('Error during recursive rewrite:', error);
      toast({
        title: "Recursive rewrite failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsRewriting(false);
    }
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
                  onChange={(e) => {
                    console.log('Source text changed:', e.target.value.length, 'characters');
                    setSourceText(e.target.value);
                  }}
                  rows={8}
                  className="resize-none"
                />
                {documentStats && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Words:</span> {documentStats.stats.wordCount.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Characters:</span> {documentStats.stats.characterCount.toLocaleString()}
                        </div>
                      </div>
                      {documentStats.willNeedChunking && (
                        <div className="text-blue-700">
                          <div className="font-medium">Chunking Required</div>
                          <div className="text-xs">
                            {documentStats.chunkCount} chunks • ~{Math.ceil(documentStats.estimatedProcessingTime / 60)}min processing
                          </div>
                        </div>
                      )}
                    </div>
                    {documentStats.stats.mathBlockCount > 0 && (
                      <div className="mt-2 text-xs text-green-700">
                        ✓ {documentStats.stats.mathBlockCount} mathematical expressions detected
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <VoiceDictation
                    onTranscriptionComplete={(text) => {
                      const updatedText = sourceText 
                        ? sourceText.trim() + (sourceText.endsWith('.') ? ' ' : '. ') + text
                        : text;
                      setSourceText(updatedText);
                      toast({
                        title: "Voice input added",
                        description: "Your dictated text has been added to the document.",
                      });
                    }}
                  />
                </div>
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

        {/* Extracted Text Display */}
        {extractedText && (
          <div>
            <Label className="text-sm font-medium">Extracted Text from Upload</Label>
            <Card className="mt-2 p-3 bg-blue-50 border-blue-200">
              <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {extractedText}
              </div>
            </Card>
          </div>
        )}

        {/* Custom Instructions */}
        <div>
          <Label htmlFor="instructions" className="text-sm font-medium">
            Custom Rewrite Instructions *
          </Label>
          <Textarea
            id="instructions"
            placeholder="Describe how you want the document rewritten (e.g., 'Make it more formal and academic', 'Simplify for undergraduate level', 'Add more technical depth', etc.)"
            value={customInstructions}
            onChange={(e) => {
              console.log('Custom instructions changed:', e.target.value.length, 'characters');
              setCustomInstructions(e.target.value);
            }}
            rows={4}
            className="mt-2 resize-none"
          />
          <div className="flex gap-2 mt-2">
            <VoiceDictation
              onTranscriptionComplete={(text) => {
                const updatedInstructions = customInstructions 
                  ? customInstructions.trim() + (customInstructions.endsWith('.') ? ' ' : '. ') + text
                  : text;
                setCustomInstructions(updatedInstructions);
                toast({
                  title: "Voice instructions added",
                  description: "Your dictated instructions have been added.",
                });
              }}
            />
          </div>
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
            onClick={() => {
              console.log('Rewrite button clicked:', {
                sourceTextLength: sourceText.length,
                sourceTextTrimmed: sourceText.trim().length,
                customInstructionsLength: customInstructions.length,
                customInstructionsTrimmed: customInstructions.trim().length,
                isRewriting
              });
              handleRewrite();
            }}
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
                  ref={resultRef}
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(rewriteResult) }}
                />
              </Card>
            </div>

            {/* Action Options */}
            <div className="flex flex-col gap-4">
              {/* Recursive Rewrite Button */}
              <div className="flex items-center justify-center">
                <Button
                  onClick={handleRewriteAgain}
                  disabled={isRewriting || !customInstructions.trim()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isRewriting ? (
                    <>
                      <Wand2 className="h-4 w-4 animate-spin" />
                      Rewriting Again...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Rewrite Again
                    </>
                  )}
                </Button>
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
                    onClick={handleViewHTML}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View HTML
                  </Button>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}