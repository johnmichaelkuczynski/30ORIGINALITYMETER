import { useState, useEffect, useRef } from "react";
import { PassageData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface PassageInputProps {
  passage: PassageData;
  onChange: (data: PassageData) => void;
  label: string;
  disabled?: boolean;
}

export default function PassageInput({
  passage,
  onChange,
  label,
  disabled = false,
}: PassageInputProps) {
  const [wordCount, setWordCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const text = passage.text.trim();
    const count = text.length > 0 ? text.split(/\s+/).length : 0;
    setWordCount(count);
  }, [passage.text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...passage,
      text: e.target.value,
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...passage,
      title: e.target.value,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

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
      onChange({
        ...passage,
        title: data.title || file.name.split('.')[0], // Use filename as title
        text: data.text,
      });

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been processed and loaded.`,
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <input
              type="text"
              placeholder={`Passage ${label} Title (Optional)`}
              className="w-full border-0 p-0 focus:ring-0 bg-transparent text-secondary-800 font-medium placeholder-gray-400"
              value={passage.title}
              onChange={handleTitleChange}
              disabled={disabled}
            />
          </div>
          <div className="ml-2 text-secondary-500 text-sm">
            <span>{wordCount}</span> words
          </div>
        </div>
      </div>
      <CardContent className="p-4 flex-grow">
        <textarea
          rows={12}
          placeholder={`Paste or type the ${label === "A" ? "first" : "second"} passage here...`}
          className="w-full p-0 border-0 focus:ring-0 resize-none bg-transparent text-secondary-800"
          value={passage.text}
          onChange={handleTextChange}
          disabled={disabled}
        />
      </CardContent>
      
      {/* File Upload Button and Hidden Input */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt,.docx"
          onChange={handleFileUpload}
          className="hidden"
          disabled={disabled}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileUpload}
          disabled={disabled}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Upload File
        </Button>
      </div>
    </Card>
  );
}
