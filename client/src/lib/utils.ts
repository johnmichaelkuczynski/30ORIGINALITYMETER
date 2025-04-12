import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];
  
  // Split by double newlines or single newlines
  const paragraphs = text.split(/\n\n|\n/).filter(p => p.trim().length > 0);
  
  // If no paragraphs were found (no newlines), treat the whole text as one paragraph
  if (paragraphs.length === 0 && text.trim().length > 0) {
    return [text.trim()];
  }
  
  return paragraphs;
}
