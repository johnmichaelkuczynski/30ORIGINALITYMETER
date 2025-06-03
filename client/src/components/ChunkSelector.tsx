import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, CheckSquare, Square, Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TextChunk {
  id: number;
  content: string;
  wordCount: number;
  startPosition: number;
  endPosition: number;
  preview: string;
}

interface ChunkedDocument {
  originalText: string;
  title: string;
  totalWordCount: number;
  chunks: TextChunk[];
  chunkSize: number;
}

interface ChunkSelectorProps {
  text: string;
  title: string;
  analysisResult: any;
  onChunksGenerated: (result: any) => void;
}

export function ChunkSelector({ text, title, analysisResult, onChunksGenerated }: ChunkSelectorProps) {
  const [chunkedDocument, setChunkedDocument] = useState<ChunkedDocument | null>(null);
  const [selectedChunks, setSelectedChunks] = useState<Set<number>>(new Set());
  const [isChunking, setIsChunking] = useState(false);
  const { toast } = useToast();

  // Mutation for chunking text
  const chunkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/chunk-text', {
        text,
        title,
        chunkSize: 500
      });
      return response.json() as Promise<ChunkedDocument>;
    },
    onSuccess: (data) => {
      setChunkedDocument(data);
      setIsChunking(false);
      toast({
        title: "Document chunked successfully",
        description: `Created ${data.chunks.length} chunks for processing`,
      });
    },
    onError: (error) => {
      console.error('Failed to chunk document:', error);
      setIsChunking(false);
      toast({
        title: "Chunking failed",
        description: "There was a problem breaking down your document. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for generating from selected chunks
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!chunkedDocument || selectedChunks.size === 0) {
        throw new Error("No chunks selected");
      }

      const selectedChunkData = chunkedDocument.chunks.filter(chunk => 
        selectedChunks.has(chunk.id)
      );

      const response = await apiRequest('POST', '/api/generate-from-chunks', {
        selectedChunks: selectedChunkData,
        analysisResult,
        styleOption: 'prioritize-originality',
        customInstructions: undefined
      });
      return response.json();
    },
    onSuccess: (data) => {
      onChunksGenerated(data);
      toast({
        title: "Improved version generated",
        description: `Successfully processed ${selectedChunks.size} selected chunks`,
      });
    },
    onError: (error) => {
      console.error('Failed to generate from chunks:', error);
      toast({
        title: "Generation failed",
        description: "There was a problem generating improved text from selected chunks. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Auto-chunk when component loads
  useEffect(() => {
    if (text && text.split(/\s+/).length > 1000) {
      setIsChunking(true);
      chunkMutation.mutate();
    }
  }, [text]);

  const handleChunkToggle = (chunkId: number) => {
    const newSelected = new Set(selectedChunks);
    if (newSelected.has(chunkId)) {
      newSelected.delete(chunkId);
    } else {
      newSelected.add(chunkId);
    }
    setSelectedChunks(newSelected);
  };

  const handleSelectAll = () => {
    if (!chunkedDocument) return;
    setSelectedChunks(new Set(chunkedDocument.chunks.map(chunk => chunk.id)));
  };

  const handleSelectNone = () => {
    setSelectedChunks(new Set());
  };

  const handleGenerate = () => {
    if (selectedChunks.size === 0) {
      toast({
        title: "No chunks selected",
        description: "Please select at least one chunk to process.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  if (isChunking || chunkMutation.isPending) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Breaking down your document...</p>
            <p className="text-sm text-muted-foreground">
              Creating manageable chunks for processing
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chunkedDocument) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Chunk Selection
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Document split into {chunkedDocument.chunks.length} chunks 
            ({chunkedDocument.totalWordCount.toLocaleString()} total words)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              <CheckSquare className="w-4 h-4 mr-1" />
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectNone}>
              <Square className="w-4 h-4 mr-1" />
              Select None
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedChunks.size} of {chunkedDocument.chunks.length} chunks selected
          </Badge>
          {selectedChunks.size > 0 && (
            <Badge variant="default">
              ~{chunkedDocument.chunks
                .filter(chunk => selectedChunks.has(chunk.id))
                .reduce((total, chunk) => total + chunk.wordCount, 0)
                .toLocaleString()} words
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-3">
            {chunkedDocument.chunks.map((chunk, index) => (
              <div key={chunk.id}>
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedChunks.has(chunk.id) 
                      ? 'bg-primary/5 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleChunkToggle(chunk.id)}
                >
                  <Checkbox 
                    checked={selectedChunks.has(chunk.id)}
                    onChange={() => handleChunkToggle(chunk.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        Chunk {chunk.id}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {chunk.wordCount} words
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {chunk.preview}
                    </p>
                  </div>
                </div>
                {index < chunkedDocument.chunks.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleGenerate}
            disabled={selectedChunks.size === 0 || generateMutation.isPending}
            className="min-w-[180px]"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate from Selected
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}