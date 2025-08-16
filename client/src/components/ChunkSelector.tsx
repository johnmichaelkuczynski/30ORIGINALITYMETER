import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentChunk } from '@/hooks/use-document-chunking';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface ChunkSelectorProps {
  chunks: DocumentChunk[];
  selectedChunk: DocumentChunk | null;
  onSelectChunk: (chunkId: string) => void;
  className?: string;
}

export default function ChunkSelector({ 
  chunks, 
  selectedChunk, 
  onSelectChunk,
  className = ""
}: ChunkSelectorProps) {
  
  if (chunks.length <= 1) {
    return null; // Don't show selector for single chunk documents
  }

  const currentIndex = selectedChunk ? chunks.findIndex(c => c.id === selectedChunk.id) : 0;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < chunks.length - 1;

  const goToPrevious = () => {
    if (canGoPrevious) {
      onSelectChunk(chunks[currentIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      onSelectChunk(chunks[currentIndex + 1].id);
    }
  };

  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Document Chunks
          <Badge variant="secondary" className="ml-auto">
            {chunks.length} chunks
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Current chunk info */}
          {selectedChunk && (
            <div className="text-sm text-blue-700">
              <div className="font-medium">
                Chunk {selectedChunk.chunkNumber} of {chunks.length}
              </div>
              <div className="text-xs text-blue-600">
                {selectedChunk.wordCount.toLocaleString()} words
              </div>
            </div>
          )}

          {/* Navigation controls */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="text-xs text-center text-blue-600 min-w-[60px]">
              {currentIndex + 1} / {chunks.length}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={!canGoNext}
              className="flex-1"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Quick chunk selection */}
          <div className="flex flex-wrap gap-1">
            {chunks.map((chunk, index) => (
              <Button
                key={chunk.id}
                variant={selectedChunk?.id === chunk.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectChunk(chunk.id)}
                className="h-6 px-2 text-xs"
              >
                {index + 1}
              </Button>
            ))}
          </div>

          {/* Preview of current chunk */}
          {selectedChunk && (
            <div className="bg-white rounded border p-2 text-xs text-gray-600 max-h-20 overflow-hidden">
              {selectedChunk.text.substring(0, 150)}...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}