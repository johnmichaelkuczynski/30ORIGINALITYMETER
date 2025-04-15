import { ChangeEvent, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { FileDropzone } from "@/components/ui/file-dropzone";

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
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePassageTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onPassageChange({ ...passage, title: e.target.value });
  };

  const handlePassageTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onPassageChange({ ...passage, text: e.target.value });
  };

  const handleCorpusTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onCorpusChange({ ...corpus, title: e.target.value });
  };

  const handleCorpusTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onCorpusChange({ ...corpus, text: e.target.value });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const validTypes = ["text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .docx file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      
      // Extract file extension
      const fileExtension = file.name.split('.').pop() || '';
      formData.append("fileType", fileExtension);

      setUploadProgress(30);

      // Send the file to the server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(70);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      setUploadProgress(100);

      // Update corpus with file content
      onCorpusChange({
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for title
        text: data.text,
      });

      toast({
        title: "Upload successful",
        description: `'${file.name}' has been loaded as your reference corpus`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Passage Input */}
      <Card className="shadow-md border border-green-100">
        <CardContent className="p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-primary-700 mb-1 flex items-center">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <span className="text-green-600 font-bold text-sm">A</span>
              </div>
              Your Passage
            </h2>
            <p className="text-sm text-gray-500">
              Enter the passage you want to analyze against the reference corpus
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="passageTitle" className="font-medium">
                Title (Optional)
              </Label>
              <Input
                id="passageTitle"
                placeholder="Enter a title for your passage"
                value={passage.title}
                onChange={handlePassageTitleChange}
                disabled={disabled}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="passageText" className="font-medium">
                Passage Text
              </Label>
              <Textarea
                id="passageText"
                placeholder="Enter or paste your passage text here"
                value={passage.text}
                onChange={handlePassageTextChange}
                disabled={disabled}
                className="min-h-[200px] resize-y mt-1"
              />
            </div>

            <div className="text-right">
              <span className="text-sm text-gray-500">
                {passage.text.length} characters
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corpus Input */}
      <Card className="shadow-md border border-blue-100">
        <CardContent className="p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-blue-700 mb-1 flex items-center">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <span className="text-blue-600 font-bold text-sm">C</span>
              </div>
              Reference Corpus
            </h2>
            <p className="text-sm text-gray-500">
              Enter or upload a larger body of text to compare against your passage
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="corpusTitle" className="font-medium">
                Corpus Title
              </Label>
              <Input
                id="corpusTitle"
                placeholder="E.g., 'Nietzsche's Complete Works' or 'Course Textbook'"
                value={corpus.title}
                onChange={handleCorpusTitleChange}
                disabled={disabled || isUploading}
                className="mt-1"
              />
            </div>

            <div className="border-t border-b border-dashed border-gray-200 py-4">
              <Label className="font-medium mb-2 block">Upload Reference Corpus</Label>
              <FileDropzone
                onFileSelect={(file) => {
                  // Create a synthetic event with minimal properties needed
                  const syntheticEvent = {
                    target: { files: [file] },
                    preventDefault: () => {}
                  } as unknown as ChangeEvent<HTMLInputElement>;
                  handleFileUpload(syntheticEvent);
                }}
                accept=".txt,.docx" 
                disabled={disabled}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                maxSizeInMB={10}
                className="bg-white"
                showButton={true}
                buttonText="Upload Corpus File"
              />
            </div>

            <div>
              <Label htmlFor="corpusText" className="font-medium">
                Corpus Text
              </Label>
              <Textarea
                id="corpusText"
                placeholder="Enter or paste the reference corpus text here"
                value={corpus.text}
                onChange={handleCorpusTextChange}
                disabled={disabled || isUploading}
                className="min-h-[200px] resize-y mt-1"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Tip: For best results, the corpus should be a larger body of work with consistent style
              </span>
              <span className="text-sm text-gray-500">
                {corpus.text.length} characters
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}