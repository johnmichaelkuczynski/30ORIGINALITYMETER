import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { processFile } from "./lib/fileProcessing";
import { processAudioFile, verifyAssemblyAIApiKey } from "./lib/assemblyai";
import { detectAIContent, AIDetectionResult } from "./lib/aiDetection";
import { generateGraph } from "./lib/graphGenerator";
import * as googleSearch from "./lib/googleSearch";
import * as mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

// Import the new 160-parameter analysis system
import { 
  analyze160Parameters, 
  compare160Parameters, 
  Analysis160Result,
  INTELLIGENCE_METRICS,
  COGENCY_METRICS,
  ORIGINALITY_METRICS,
  QUALITY_METRICS
} from "./lib/160-parameter-analysis";

// Service provider types
type LLMProvider = "deepseek" | "openai" | "anthropic" | "perplexity";

// Configure multer for document file uploads
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.txt', '.docx', '.mp3', '.pdf', '.jpg', '.jpeg', '.png'];
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt, .docx, .pdf, .mp3, .jpg, .jpeg, and .png files are allowed'));
    }
  },
});

// Configure multer for audio dictation (less restrictive)
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    // For dictation, we only check the mimetype, not the extension
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for dictation'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Check API provider status
  app.post("/api/provider-status", async (req, res) => {
    try {
      const providers = {
        deepseek: !!process.env.DEEPSEEK_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        perplexity: !!process.env.PERPLEXITY_API_KEY
      };
      res.json(providers);
    } catch (error) {
      console.error("Provider status check failed:", error);
      res.status(500).json({ error: "Failed to check provider status" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", documentUpload.single('file'), async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      console.log("File upload received:", req.file.originalname, req.file.mimetype, req.file.size);
      
      const fileExtension = path.extname(req.file.originalname).toLowerCase() || '.txt';
      const fileType = fileExtension.replace('.', '');
      
      console.log(`Processing file with type: ${fileType}`);
      
      let extractedText = "";
      
      if (fileType === 'txt' || req.file.mimetype.includes('text/plain')) {
        extractedText = req.file.buffer.toString('utf-8');
        console.log("Extracted text from TXT file:", extractedText.substring(0, 100) + "...");
      } else if (fileType === 'docx') {
        try {
          const result = await mammoth.extractRawText({ buffer: req.file.buffer });
          extractedText = result.value;
          console.log("Extracted text from DOCX file, length:", extractedText.length);
        } catch (docxError) {
          console.error("DOCX processing error:", docxError);
          return res.status(400).json({ 
            error: `Error processing DOCX file: ${docxError instanceof Error ? docxError.message : "Unknown error"}` 
          });
        }
      } else if (fileType === 'pdf') {
        try {
          const pdfData = await pdfParse(req.file.buffer);
          extractedText = pdfData.text;
          console.log("Extracted text from PDF file, length:", extractedText.length);
        } catch (pdfError) {
          console.error("PDF processing error:", pdfError);
          return res.status(400).json({ 
            error: `Error processing PDF file: ${pdfError instanceof Error ? pdfError.message : "Unknown error"}` 
          });
        }
      } else if (fileType === 'mp3' || req.file.mimetype.startsWith('audio/')) {
        try {
          extractedText = await processAudioFile(req.file.buffer, req.file.mimetype);
          console.log("Transcribed audio file, length:", extractedText.length);
        } catch (audioError) {
          console.error("Audio processing error:", audioError);
          return res.status(400).json({ 
            error: `Error processing audio file: ${audioError instanceof Error ? audioError.message : "Unknown error"}` 
          });
        }
      } else if (['jpg', 'jpeg', 'png'].includes(fileType)) {
        try {
          extractedText = await processFile(req.file, fileType);
          console.log("Extracted text from image file, length:", extractedText.length);
        } catch (imageError) {
          console.error("Image processing error:", imageError);
          return res.status(400).json({ 
            error: `Error processing image file: ${imageError instanceof Error ? imageError.message : "Unknown error"}` 
          });
        }
      } else {
        return res.status(400).json({ error: `Unsupported file type: ${fileType}` });
      }
      
      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ error: "No text could be extracted from the file" });
      }
      
      res.json({ 
        text: extractedText,
        originalName: req.file.originalname,
        fileType: fileType
      });
      
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "File upload failed" 
      });
    }
  });

  // AI Detection endpoint
  app.post("/api/detect-ai", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required" });
      }

      console.log(`AI Detection request for text (${text.length} chars): "${text.substring(0, 100)}..."`);
      
      const result = await detectAIContent(text);
      res.json(result);
    } catch (error) {
      console.error("AI detection error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "AI detection failed" 
      });
    }
  });

  // NEW 160-PARAMETER ANALYSIS ENDPOINTS
  
  // Single document analysis - Intelligence framework
  app.post("/api/analyze/intelligence", async (req, res) => {
    try {
      const { text, provider = 'openai' } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required" });
      }

      console.log(`Intelligence analysis request: { textLength: ${text.length}, provider: '${provider}' }`);
      
      const result = await analyze160Parameters(text, 'intelligence', provider as LLMProvider);
      res.json(result);
    } catch (error) {
      console.error("Intelligence analysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Intelligence analysis failed" 
      });
    }
  });

  // Single document analysis - Cogency framework
  app.post("/api/analyze/cogency", async (req, res) => {
    try {
      const { text, provider = 'openai' } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required" });
      }

      console.log(`Cogency analysis request: { textLength: ${text.length}, provider: '${provider}' }`);
      
      const result = await analyze160Parameters(text, 'cogency', provider as LLMProvider);
      res.json(result);
    } catch (error) {
      console.error("Cogency analysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Cogency analysis failed" 
      });
    }
  });

  // Single document analysis - Originality framework
  app.post("/api/analyze/originality", async (req, res) => {
    try {
      const { text, provider = 'openai' } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required" });
      }

      console.log(`Originality analysis request: { textLength: ${text.length}, provider: '${provider}' }`);
      
      const result = await analyze160Parameters(text, 'originality', provider as LLMProvider);
      res.json(result);
    } catch (error) {
      console.error("Originality analysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Originality analysis failed" 
      });
    }
  });

  // Single document analysis - Quality framework
  app.post("/api/analyze/quality", async (req, res) => {
    try {
      const { text, provider = 'openai' } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required" });
      }

      console.log(`Quality analysis request: { textLength: ${text.length}, provider: '${provider}' }`);
      
      const result = await analyze160Parameters(text, 'quality', provider as LLMProvider);
      res.json(result);
    } catch (error) {
      console.error("Quality analysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Quality analysis failed" 
      });
    }
  });

  // Dual document comparison - Intelligence framework
  app.post("/api/compare/intelligence", async (req, res) => {
    try {
      const { textA, textB, provider = 'openai' } = req.body;
      
      if (!textA || !textB || typeof textA !== 'string' || typeof textB !== 'string') {
        return res.status(400).json({ error: "Both textA and textB are required" });
      }

      console.log(`Intelligence comparison request: { textA: ${textA.length} chars, textB: ${textB.length} chars, provider: '${provider}' }`);
      
      const result = await compare160Parameters(textA, textB, 'intelligence', provider as LLMProvider);
      res.json(result);
    } catch (error) {
      console.error("Intelligence comparison error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Intelligence comparison failed" 
      });
    }
  });

  // Dual document comparison - Cogency framework
  app.post("/api/compare/cogency", async (req, res) => {
    try {
      const { textA, textB, provider = 'openai' } = req.body;
      
      if (!textA || !textB || typeof textA !== 'string' || typeof textB !== 'string') {
        return res.status(400).json({ error: "Both textA and textB are required" });
      }

      console.log(`Cogency comparison request: { textA: ${textA.length} chars, textB: ${textB.length} chars, provider: '${provider}' }`);
      
      const result = await compare160Parameters(textA, textB, 'cogency', provider as LLMProvider);
      res.json(result);
    } catch (error) {
      console.error("Cogency comparison error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Cogency comparison failed" 
      });
    }
  });

  // Dual document comparison - Originality framework
  app.post("/api/compare/originality", async (req, res) => {
    try {
      const { textA, textB, provider = 'openai' } = req.body;
      
      if (!textA || !textB || typeof textA !== 'string' || typeof textB !== 'string') {
        return res.status(400).json({ error: "Both textA and textB are required" });
      }

      console.log(`Originality comparison request: { textA: ${textA.length} chars, textB: ${textB.length} chars, provider: '${provider}' }`);
      
      const result = await compare160Parameters(textA, textB, 'originality', provider as LLMProvider);
      res.json(result);
    } catch (error) {
      console.error("Originality comparison error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Originality comparison failed" 
      });
    }
  });

  // Dual document comparison - Quality framework
  app.post("/api/compare/quality", async (req, res) => {
    try {
      const { textA, textB, provider = 'openai' } = req.body;
      
      if (!textA || !textB || typeof textA !== 'string' || typeof textB !== 'string') {
        return res.status(400).json({ error: "Both textA and textB are required" });
      }

      console.log(`Quality comparison request: { textA: ${textA.length} chars, textB: ${textB.length} chars, provider: '${provider}' }`);
      
      const result = await compare160Parameters(textA, textB, 'quality', provider as LLMProvider);
      res.json(result);
    } catch (error) {
      console.error("Quality comparison error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Quality comparison failed" 
      });
    }
  });

  // Download endpoints for analysis reports
  app.post("/api/download-intelligence", async (req, res) => {
    try {
      const { analysisData } = req.body;
      
      if (!analysisData || !analysisData.scores) {
        return res.status(400).json({ error: "Analysis data is required" });
      }

      const txtContent = formatAnalysisAsTxt(analysisData, 'Intelligence');
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="intelligence-analysis.txt"');
      res.send(txtContent);
    } catch (error) {
      console.error("Intelligence download error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Download failed" 
      });
    }
  });

  app.post("/api/download-cogency", async (req, res) => {
    try {
      const { analysisData } = req.body;
      
      if (!analysisData || !analysisData.scores) {
        return res.status(400).json({ error: "Analysis data is required" });
      }

      const txtContent = formatAnalysisAsTxt(analysisData, 'Cogency');
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="cogency-analysis.txt"');
      res.send(txtContent);
    } catch (error) {
      console.error("Cogency download error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Download failed" 
      });
    }
  });

  app.post("/api/download-originality", async (req, res) => {
    try {
      const { analysisData } = req.body;
      
      if (!analysisData || !analysisData.scores) {
        return res.status(400).json({ error: "Analysis data is required" });
      }

      const txtContent = formatAnalysisAsTxt(analysisData, 'Originality');
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="originality-analysis.txt"');
      res.send(txtContent);
    } catch (error) {
      console.error("Originality download error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Download failed" 
      });
    }
  });

  app.post("/api/download-quality", async (req, res) => {
    try {
      const { analysisData } = req.body;
      
      if (!analysisData || !analysisData.scores) {
        return res.status(400).json({ error: "Analysis data is required" });
      }

      const txtContent = formatAnalysisAsTxt(analysisData, 'Quality');
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="quality-analysis.txt"');
      res.send(txtContent);
    } catch (error) {
      console.error("Quality download error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Download failed" 
      });
    }
  });

  // Graph generation endpoint
  app.post("/api/generate-graph", async (req, res) => {
    try {
      const { prompt, provider = 'gpt-4o-mini' } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      console.log(`Graph generation request: "${prompt.substring(0, 100)}..." with provider: ${provider}`);
      
      const result = await generateGraph({ prompt, provider });
      res.json(result);
    } catch (error) {
      console.error("Graph generation error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Graph generation failed" 
      });
    }
  });

  // Audio dictation endpoint
  app.post("/api/dictation", audioUpload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      console.log("Audio dictation received:", req.file.mimetype, req.file.size);
      
      // Verify AssemblyAI API key
      const isApiKeyValid = await verifyAssemblyAIApiKey();
      if (!isApiKeyValid) {
        return res.status(500).json({ error: "AssemblyAI API key not configured or invalid" });
      }

      const transcription = await processAudioFile(req.file.buffer, req.file.mimetype);
      
      res.json({ 
        text: transcription,
        success: true 
      });
      
    } catch (error) {
      console.error("Dictation error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Dictation failed" 
      });
    }
  });

  // Google search endpoint
  app.post("/api/search", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }

      console.log(`Google search request: "${query}"`);
      
      const results = await googleSearch.searchGoogle(query);
      res.json({ results });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Search failed" 
      });
    }
  });

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Express error:", err);
    
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: err.errors 
      });
    }
    
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "File too large. Maximum size is 20MB." });
      }
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ 
      error: err.message || "Internal server error" 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

/**
 * Format analysis data as downloadable TXT content
 */
function formatAnalysisAsTxt(analysisData: Analysis160Result, frameworkName: string): string {
  const lines = [
    `${frameworkName.toUpperCase()} ANALYSIS REPORT`,
    '==================================================',
    '',
    `Overall Score: ${analysisData.overallScore}/100`,
    '',
    'DETAILED METRICS:',
    '==================',
    ''
  ];

  analysisData.scores.forEach((score, index) => {
    lines.push(`${index + 1}. ${score.metric}`);
    lines.push(`Score: ${score.score}/100`);
    lines.push(`Assessment: ${score.assessment}`);
    lines.push(`Strengths: ${score.strengths.join(', ')}`);
    lines.push(`Weaknesses: ${score.weaknesses.join(', ')}`);
    lines.push('');
  });

  lines.push('SUMMARY:');
  lines.push('=========');
  lines.push(analysisData.summary);
  lines.push('');
  lines.push('VERDICT:');
  lines.push('========');
  lines.push(analysisData.verdict);

  return lines.join('\n');
}