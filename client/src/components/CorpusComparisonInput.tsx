import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface CorpusComparisonInputProps {
  passage: {
    title: string;
    text: string;
  };
  corpus: {
    title: string;
    text: string;
  };
  onPassageChange: (data: { title: string; text: string }) => void;
  onCorpusChange: (data: { title: string; text: string }) => void;
  disabled?: boolean;
}

export default function CorpusComparisonInput({
  passage,
  corpus,
  onPassageChange,
  onCorpusChange,
  disabled = false,
}: CorpusComparisonInputProps) {
  const passageFileInputRef = useRef<HTMLInputElement>(null);
  const corpusFileInputRef = useRef<HTMLInputElement>(null);

  const handlePassageTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPassageChange({
      ...passage,
      title: e.target.value,
    });
  };

  const handlePassageTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPassageChange({
      ...passage,
      text: e.target.value,
    });
  };

  const handleCorpusTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCorpusChange({
      ...corpus,
      title: e.target.value,
    });
  };

  const handleCorpusTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCorpusChange({
      ...corpus,
      text: e.target.value,
    });
  };

  const triggerPassageFileUpload = () => {
    passageFileInputRef.current?.click();
  };

  const triggerCorpusFileUpload = () => {
    corpusFileInputRef.current?.click();
  };

  const handlePassageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'txt' && fileType !== 'docx') {
      toast({
        title: "Unsupported file format",
        description: "Please upload a .txt or .docx file",
        variant: "destructive",
      });
      return;
    }

    // Create form data to send to the server
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Show loading toast
      toast({
        title: "Processing file",
        description: "Please wait while we process your file...",
      });

      // Send file to server for processing
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      // Get processed text from server
      const data = await response.json();
      
      // Update with processed file content
      onPassageChange({
        title: data.title || file.name.split('.')[0], // Use filename as title
        text: data.text,
      });

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been processed and loaded as your passage.`,
        variant: "default",
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Failed to process the file. Please try again.",
        variant: "destructive",
      });
    }

    // Reset the file input
    if (passageFileInputRef.current) {
      passageFileInputRef.current.value = '';
    }
  };

  const handleCorpusFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'txt' && fileType !== 'docx') {
      toast({
        title: "Unsupported file format",
        description: "Please upload a .txt or .docx file",
        variant: "destructive",
      });
      return;
    }

    // Create form data to send to the server
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Show loading toast
      toast({
        title: "Processing corpus file",
        description: "Please wait while we process your corpus file...",
      });

      // Send file to server for processing
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      // Get processed text from server
      const data = await response.json();
      
      // Update with processed file content
      onCorpusChange({
        title: data.title || file.name.split('.')[0], // Use filename as title
        text: data.text,
      });

      toast({
        title: "Corpus file uploaded successfully",
        description: `${file.name} has been processed and loaded as your reference corpus.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Corpus file upload error:', error);
      toast({
        title: "Error processing corpus file",
        description: error instanceof Error ? error.message : "Failed to process the corpus file. Please try again.",
        variant: "destructive",
      });
    }

    // Reset the file input
    if (corpusFileInputRef.current) {
      corpusFileInputRef.current.value = '';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Passage Input Section */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="passage-title" className="text-sm font-medium">
                Passage Title
              </Label>
              <Input
                id="passage-title"
                placeholder="Enter a title for your passage"
                value={passage.title}
                onChange={handlePassageTitleChange}
                disabled={disabled}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="passage-text" className="text-sm font-medium">
                Your Passage
              </Label>
              <Textarea
                id="passage-text"
                placeholder="Enter your passage text here"
                value={passage.text}
                onChange={handlePassageTextChange}
                disabled={disabled}
                className="min-h-[200px] mt-1"
              />
            </div>
            
            <div className="text-right">
              <input
                type="file"
                ref={passageFileInputRef}
                accept=".txt,.docx"
                onChange={handlePassageFileUpload}
                className="hidden"
                disabled={disabled}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={triggerPassageFileUpload}
                disabled={disabled}
                className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload Passage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corpus Input Section */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="corpus-title" className="text-sm font-medium">
                Reference Corpus Title
              </Label>
              <Input
                id="corpus-title"
                placeholder="Enter a title for your reference corpus"
                value={corpus.title}
                onChange={handleCorpusTitleChange}
                disabled={disabled}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="corpus-text" className="text-sm font-medium">
                Reference Corpus
              </Label>
              <Textarea
                id="corpus-text"
                placeholder="Enter your reference corpus or upload a file"
                value={corpus.text}
                onChange={handleCorpusTextChange}
                disabled={disabled}
                className="min-h-[200px] mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                You can upload a longer document (chapter, paper, or theorist's writing) to compare your passage against.
              </p>
            </div>
            
            <div className="text-right">
              <input
                type="file"
                ref={corpusFileInputRef}
                accept=".txt,.docx"
                onChange={handleCorpusFileUpload}
                className="hidden"
                disabled={disabled}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={triggerCorpusFileUpload}
                disabled={disabled}
                className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload Corpus
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}