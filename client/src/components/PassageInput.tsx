import { useState, useEffect, useRef } from "react";
import { PassageData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FileDropzone } from "@/components/ui/file-dropzone";

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

    // Check file size (limit to 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'txt' && fileType !== 'docx' && fileType !== 'mp3') {
      toast({
        title: "Unsupported file format",
        description: "Please upload a .txt, .docx, or .mp3 file",
        variant: "destructive",
      });
      return;
    }
    
    // Special handling notice for MP3 files
    if (fileType === 'mp3') {
      toast({
        title: "Processing audio file",
        description: "Your audio file will be transcribed. This may take a moment...",
        variant: "default",
      });
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
          <div className="w-full relative">
            <input
              type="text"
              placeholder={label ? `Passage ${label} Title (Optional)` : "Passage Title (Optional)"}
              className="w-full border-0 p-0 focus:ring-0 bg-transparent text-secondary-800 font-medium placeholder-gray-400 pr-8"
              value={passage.title}
              onChange={handleTitleChange}
              disabled={disabled}
            />
            {passage.title && !disabled && (
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => onChange({ ...passage, title: "" })}
                aria-label="Clear title"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </button>
            )}
          </div>
          <div className="ml-2 text-secondary-500 text-sm">
            <span>{wordCount}</span> words
          </div>
        </div>
      </div>
      <CardContent className="p-4 flex-grow relative">
        <textarea
          rows={12}
          placeholder={label ? `Paste or type the ${label === "A" ? "first" : "second"} passage here...` : "Paste or type your passage here..."}
          className="w-full p-0 border-0 focus:ring-0 resize-none bg-transparent text-secondary-800"
          value={passage.text}
          onChange={handleTextChange}
          disabled={disabled}
        />
        {passage.text && !disabled && (
          <button
            type="button"
            className="absolute top-4 right-4 bg-white bg-opacity-75 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => onChange({ ...passage, text: "" })}
            aria-label="Clear text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </button>
        )}
      </CardContent>
      
      {/* File Upload with Drag and Drop */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <FileDropzone
          onFileSelect={(file) => {
            // Create a synthetic event that has the minimal properties needed
            const syntheticEvent = {
              target: { files: [file] },
              preventDefault: () => {}
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileUpload(syntheticEvent);
          }}
          accept=".txt,.docx,.mp3"
          disabled={disabled}
          maxSizeInMB={20}
          className="bg-white"
          showFileInput={false}
          showButton={true}
          buttonText="Upload File"
        />
        
        {/* Keep the hidden input for backward compatibility */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt,.docx,.mp3"
          onChange={handleFileUpload}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </Card>
  );
}
