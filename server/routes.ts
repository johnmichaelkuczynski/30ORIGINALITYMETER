import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { z } from "zod";
import { analyzePassages } from "./lib/openai";
import { splitIntoParagraphs } from "../client/src/lib/utils";
import { analysisResultSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { processFile } from "./lib/fileProcessing";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.txt' || ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt and .docx files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze two passages
  app.post("/api/analyze", async (req, res) => {
    try {
      const requestSchema = z.object({
        passageA: z.object({
          title: z.string(),
          text: z.string().min(1, "Passage A text is required"),
        }),
        passageB: z.object({
          title: z.string(),
          text: z.string().min(1, "Passage B text is required"),
        }),
      });

      const { passageA, passageB } = requestSchema.parse(req.body);

      // Get OpenAI's analysis of the passages
      const analysisResult = await analyzePassages(passageA, passageB);

      // Validate the response against our schema
      const validatedResult = analysisResultSchema.parse(analysisResult);

      // Store the analysis in our database
      await storage.createAnalysis({
        passageA: passageA.text,
        passageB: passageB.text,
        passageATitle: passageA.title,
        passageBTitle: passageB.title,
        result: validatedResult,
        createdAt: new Date().toISOString(),
      });

      res.json(validatedResult);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      } else {
        console.error("Error analyzing passages:", error);
        res.status(500).json({ 
          message: "Failed to analyze passages", 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }
  });

  // Process uploaded file and return its content
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileBuffer = req.file.buffer;
      const fileType = path.extname(req.file.originalname).substring(1); // Remove the dot
      const fileName = path.basename(req.file.originalname, path.extname(req.file.originalname));

      // Process the file based on its type
      const textContent = await processFile(fileBuffer, fileType);

      // Return the processed content
      res.json({
        title: fileName,
        text: textContent,
      });
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      res.status(500).json({
        message: "Failed to process file",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Error handling middleware for multer errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: "File too large",
          error: "Please upload a file smaller than 5MB"
        });
      }
      return res.status(400).json({
        message: "File upload error",
        error: err.message
      });
    }
    res.status(500).json({
      message: "Server error",
      error: err.message || "Unknown error"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
