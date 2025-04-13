import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { z } from "zod";
import { analyzePassages, analyzeSinglePassage, processFeedback } from "./lib/openai";
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
          title: z.string().optional().default(""),
          text: z.string().min(1, "Passage A text is required"),
        }),
        passageB: z.object({
          title: z.string().optional().default(""),
          text: z.string().min(1, "Passage B text is required"),
        }),
      });

      const { passageA, passageB } = requestSchema.parse(req.body);
      
      console.log("Comparing passages:", {
        passageATitle: passageA.title,
        passageALength: passageA.text.length,
        passageBTitle: passageB.title,
        passageBLength: passageB.text.length
      });

      try {
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
      } catch (aiError) {
        console.error("Error with AI comparison:", aiError);
        
        // Return a valid response for when API calls fail
        const fallbackResponse = {
          conceptualLineage: {
            passageA: {
              primaryInfluences: "Analysis currently unavailable - please try again later.",
              intellectualTrajectory: "Analysis currently unavailable - please try again later.",
            },
            passageB: {
              primaryInfluences: "Analysis currently unavailable - please try again later.", 
              intellectualTrajectory: "Analysis currently unavailable - please try again later.",
            },
          },
          semanticDistance: {
            passageA: {
              distance: 50,
              label: "Analysis Unavailable",
            },
            passageB: {
              distance: 50,
              label: "Analysis Unavailable",
            },
            keyFindings: ["Analysis currently unavailable", "Please try again later", "API connection issue"],
            semanticInnovation: "Analysis currently unavailable - please try again later.",
          },
          noveltyHeatmap: {
            passageA: [
              { content: "Analysis currently unavailable - please try again later.", heat: 50 },
            ],
            passageB: [
              { content: "Analysis currently unavailable - please try again later.", heat: 50 },
            ],
          },
          derivativeIndex: {
            passageA: {
              score: 5,
              components: [
                { name: "Conceptual Innovation", score: 5 },
                { name: "Methodological Novelty", score: 5 },
                { name: "Contextual Application", score: 5 },
              ],
            },
            passageB: {
              score: 5,
              components: [
                { name: "Conceptual Innovation", score: 5 },
                { name: "Methodological Novelty", score: 5 },
                { name: "Contextual Application", score: 5 },
              ],
            },
          },
          conceptualParasite: {
            passageA: {
              level: "Moderate",
              elements: ["Analysis currently unavailable"],
              assessment: "Analysis currently unavailable - please try again later.",
            },
            passageB: {
              level: "Moderate",
              elements: ["Analysis currently unavailable"],
              assessment: "Analysis currently unavailable - please try again later.",
            },
          },
          verdict: "Analysis temporarily unavailable. Our system was unable to complete the semantic originality analysis at this time due to an API connection issue. Please try again later.",
        };
        
        // Store the fallback analysis
        await storage.createAnalysis({
          passageA: passageA.text,
          passageB: passageB.text,
          passageATitle: passageA.title,
          passageBTitle: passageB.title,
          result: fallbackResponse,
          createdAt: new Date().toISOString(),
        });

        // Return the fallback response
        res.json(fallbackResponse);
      }
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

  // Analyze a single passage against an internal norm
  app.post("/api/analyze/single", async (req, res) => {
    try {
      const requestSchema = z.object({
        passageA: z.object({
          title: z.string().optional().default(""),
          text: z.string().min(1, "Passage text is required"),
        }),
      });

      const { passageA } = requestSchema.parse(req.body);
      
      console.log("Single passage analysis request:", {
        title: passageA.title,
        textLength: passageA.text.length,
      });

      try {
        // Get OpenAI's analysis of the single passage
        const analysisResult = await analyzeSinglePassage(passageA);

        // Validate the response against our schema
        const validatedResult = analysisResultSchema.parse(analysisResult);

        // Store the analysis in our database with a special flag for single mode
        await storage.createAnalysis({
          passageA: passageA.text,
          passageB: "norm-comparison",
          passageATitle: passageA.title,
          passageBTitle: "Norm Baseline", 
          result: validatedResult,
          createdAt: new Date().toISOString(),
        });

        res.json(validatedResult);
      } catch (aiError) {
        console.error("Error with AI analysis:", aiError);
        
        // Return a valid response for testing purposes
        const fallbackResponse = {
          conceptualLineage: {
            passageA: {
              primaryInfluences: "Analysis currently unavailable - please try again later.",
              intellectualTrajectory: "Analysis currently unavailable - please try again later.",
            },
            passageB: {
              primaryInfluences: "Standard sources and common knowledge in this domain.",
              intellectualTrajectory: "Typical writing following established patterns.",
            },
          },
          semanticDistance: {
            passageA: {
              distance: 50,
              label: "Analysis Unavailable",
            },
            passageB: {
              distance: 50,
              label: "Average/Typical Distance (Norm Baseline)",
            },
            keyFindings: ["Analysis currently unavailable", "Please try again later", "API connection issue"],
            semanticInnovation: "Analysis currently unavailable - please try again later.",
          },
          noveltyHeatmap: {
            passageA: [
              { content: "Analysis currently unavailable - please try again later.", heat: 50 },
            ],
            passageB: [
              { content: "Typical paragraph pattern in this domain", heat: 50 },
              { content: "Standard introduction of established concepts", heat: 50 },
            ],
          },
          derivativeIndex: {
            passageA: {
              score: 5,
              components: [
                { name: "Conceptual Innovation", score: 5 },
                { name: "Methodological Novelty", score: 5 },
                { name: "Contextual Application", score: 5 },
              ],
            },
            passageB: {
              score: 5,
              components: [
                { name: "Conceptual Innovation", score: 5 },
                { name: "Methodological Novelty", score: 5 },
                { name: "Contextual Application", score: 5 },
              ],
            },
          },
          conceptualParasite: {
            passageA: {
              level: "Moderate",
              elements: ["Analysis currently unavailable"],
              assessment: "Analysis currently unavailable - please try again later.",
            },
            passageB: {
              level: "Moderate",
              elements: ["Typical writing patterns"],
              assessment: "Baseline assessment of typical texts in this domain",
            },
          },
          verdict: "Analysis temporarily unavailable. Our system was unable to complete the semantic originality analysis at this time due to an API connection issue. Please try again later.",
        };
        
        // Store the fallback analysis
        await storage.createAnalysis({
          passageA: passageA.text,
          passageB: "norm-comparison",
          passageATitle: passageA.title,
          passageBTitle: "Norm Baseline",
          result: fallbackResponse,
          createdAt: new Date().toISOString(),
        });

        // Return the fallback response
        res.json(fallbackResponse);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      } else {
        console.error("Error analyzing single passage:", error);
        res.status(500).json({ 
          message: "Failed to analyze passage", 
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

  // Submit feedback on an analysis
  app.post("/api/feedback", async (req, res) => {
    try {
      console.log("Received feedback request:", JSON.stringify({
        category: req.body.category,
        feedback: req.body.feedback?.substring(0, 20) + "...",
        hasOriginalResult: !!req.body.originalResult,
        passageA: req.body.passageA?.text?.substring(0, 20) + "...",
        passageB: req.body.passageB?.text?.substring(0, 20) + "...",
        isSinglePassageMode: req.body.isSinglePassageMode
      }));

      // More permissive schema for validation errors
      const requestSchema = z.object({
        analysisId: z.number().optional(),
        category: z.enum(['conceptualLineage', 'semanticDistance', 'noveltyHeatmap', 'derivativeIndex', 'conceptualParasite']),
        feedback: z.string().min(1, "Feedback is required"),
        supportingDocument: z.object({
          title: z.string(),
          content: z.string()
        }).optional(),
        originalResult: analysisResultSchema,
        passageA: z.object({
          title: z.string().optional().default(""),
          text: z.string()
        }),
        passageB: z.object({
          title: z.string().optional().default(""),
          text: z.string()
        }),
        isSinglePassageMode: z.boolean().optional().default(false)
      });

      const { 
        analysisId, 
        category, 
        feedback, 
        supportingDocument, 
        originalResult, 
        passageA, 
        passageB, 
        isSinglePassageMode 
      } = requestSchema.parse(req.body);
      
      console.log(`Processing feedback for category '${category}'`);

      // Process the feedback and get a response
      const feedbackResult = await processFeedback(
        category,
        feedback,
        originalResult,
        passageA,
        passageB,
        isSinglePassageMode,
        supportingDocument
      );

      // Validate the response against our schema
      const validatedResult = analysisResultSchema.parse(feedbackResult.revisedResult);

      // If we have an analysis ID, update it in the database
      if (analysisId) {
        const existingAnalysis = await storage.getAnalysis(analysisId);
        
        if (existingAnalysis) {
          // Update the analysis with the revised result
          await storage.createAnalysis({
            passageA: existingAnalysis.passageA,
            passageB: existingAnalysis.passageB,
            passageATitle: existingAnalysis.passageATitle,
            passageBTitle: existingAnalysis.passageBTitle,
            result: validatedResult,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Return the feedback result
      res.json({
        aiResponse: feedbackResult.aiResponse,
        isRevised: feedbackResult.isRevised,
        revisedResult: validatedResult
      });
    } catch (error) {
      console.error("Error with feedback submission:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to process feedback", 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }
  });

  // Process uploaded file for supporting documents
  app.post("/api/upload/supporting", upload.single('file'), async (req, res) => {
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
        content: textContent,
      });
    } catch (error) {
      console.error("Error processing supporting document:", error);
      res.status(500).json({
        message: "Failed to process supporting document",
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
