import { useState, useMemo } from 'react';

export interface DocumentChunk {
  id: string;
  text: string;
  wordCount: number;
  startIndex: number;
  endIndex: number;
  chunkNumber: number;
}

export function useDocumentChunking(text: string, wordsPerChunk: number = 1500) {
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null);

  // Split text into chunks of specified word count
  const chunks = useMemo(() => {
    if (!text || text.trim().length === 0) return [];

    const words = text.trim().split(/\s+/);
    const totalWords = words.length;

    // If document is small enough, return as single chunk
    if (totalWords <= wordsPerChunk) {
      return [{
        id: 'chunk-1',
        text: text.trim(),
        wordCount: totalWords,
        startIndex: 0,
        endIndex: text.length,
        chunkNumber: 1
      }];
    }

    const documentChunks: DocumentChunk[] = [];
    let currentIndex = 0;
    let chunkNumber = 1;

    for (let i = 0; i < totalWords; i += wordsPerChunk) {
      const chunkWords = words.slice(i, i + wordsPerChunk);
      const chunkText = chunkWords.join(' ');
      
      // Find the actual character positions in the original text
      const wordsBeforeChunk = words.slice(0, i);
      const startIndex = wordsBeforeChunk.length > 0 
        ? text.indexOf(chunkWords[0], currentIndex)
        : 0;
      
      const endIndex = startIndex + chunkText.length;
      currentIndex = endIndex;

      documentChunks.push({
        id: `chunk-${chunkNumber}`,
        text: chunkText,
        wordCount: chunkWords.length,
        startIndex,
        endIndex,
        chunkNumber
      });

      chunkNumber++;
    }

    return documentChunks;
  }, [text, wordsPerChunk]);

  // Auto-select first chunk if none selected
  const selectedChunk = useMemo(() => {
    if (chunks.length === 0) return null;
    
    let targetChunk = chunks.find(chunk => chunk.id === selectedChunkId);
    if (!targetChunk) {
      targetChunk = chunks[0];
      setSelectedChunkId(targetChunk.id);
    }
    
    return targetChunk;
  }, [chunks, selectedChunkId]);

  const selectChunk = (chunkId: string) => {
    setSelectedChunkId(chunkId);
  };

  const hasMultipleChunks = chunks.length > 1;

  return {
    chunks,
    selectedChunk,
    selectChunk,
    hasMultipleChunks,
    totalChunks: chunks.length
  };
}