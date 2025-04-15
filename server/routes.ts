import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { z } from "zod";
import { analyzePassages, analyzeSinglePassage, analyzePassageAgainstCorpus, processFeedback, generateMoreOriginalVersion } from "./lib/openai";
import { splitIntoParagraphs } from "../client/src/lib/utils";
import { analysisResultSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { processFile } from "./lib/fileProcessing";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
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
          coherence: {
            passageA: {
              score: 5,
              assessment: "Analysis currently unavailable - please try again later.",
              strengths: ["Analysis currently unavailable"],
              weaknesses: ["Analysis currently unavailable"]
            },
            passageB: {
              score: 5,
              assessment: "Analysis currently unavailable - please try again later.",
              strengths: ["Analysis currently unavailable"],
              weaknesses: ["Analysis currently unavailable"]
            }
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
          coherence: {
            passageA: {
              score: 5,
              assessment: "Analysis currently unavailable - please try again later.",
              strengths: ["Analysis currently unavailable"],
              weaknesses: ["Analysis currently unavailable"]
            },
            passageB: {
              score: 5,
              assessment: "Baseline coherence assessment",
              strengths: ["Typical logical structure", "Standard flow of ideas"],
              weaknesses: ["No significant weaknesses identified in the baseline"]
            }
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

  // Analyze a passage against a corpus
  app.post("/api/analyze/corpus", async (req, res) => {
    try {
      const requestSchema = z.object({
        passage: z.object({
          title: z.string().optional().default(""),
          text: z.string().min(1, "Passage text is required"),
        }),
        corpus: z.string().min(1, "Corpus text is required"),
        corpusTitle: z.string().optional().default("Reference Corpus"),
      });

      const { passage, corpus, corpusTitle } = requestSchema.parse(req.body);
      
      console.log("Corpus comparison request:", {
        passageTitle: passage.title,
        passageLength: passage.text.length,
        corpusTitle,
        corpusLength: corpus.length,
      });

      try {
        // Get OpenAI's analysis of the passage against the corpus
        const analysisResult = await analyzePassageAgainstCorpus(passage, corpus, corpusTitle);

        // Make sure verdict exists
        if (!analysisResult.verdict) {
          analysisResult.verdict = `Analysis comparing your passage "${passage.title}" against corpus "${corpusTitle}"`;
        }

        // Validate the response against our schema
        let validatedResult;
        try {
          validatedResult = analysisResultSchema.parse(analysisResult);
        } catch (validationError) {
          console.error("Schema validation error for corpus analysis:", validationError);
          // If validation fails, use the fallback response instead
          throw new Error(`Schema validation failed: ${validationError.message}`);
        }

        // Store the analysis in our database with a special flag for corpus mode
        await storage.createAnalysis({
          passageA: passage.text,
          passageB: "corpus-comparison",
          passageATitle: passage.title,
          passageBTitle: corpusTitle, 
          result: validatedResult,
          createdAt: new Date().toISOString(),
        });

        res.json(validatedResult);
      } catch (aiError) {
        console.error("Error with AI corpus analysis:", aiError);
        
        // Return a valid response for when API calls fail
        const fallbackResponse = {
          conceptualLineage: {
            passageA: {
              primaryInfluences: "Analysis currently unavailable - please try again later.",
              intellectualTrajectory: "Analysis currently unavailable - please try again later.",
            },
            passageB: {
              primaryInfluences: `This analysis compares your passage to "${corpusTitle}"`,
              intellectualTrajectory: "The reference corpus serves as the intellectual standard.",
            },
          },
          semanticDistance: {
            passageA: {
              distance: 50,
              label: "Analysis Unavailable",
            },
            passageB: {
              distance: 0,
              label: "Reference Corpus",
            },
            keyFindings: ["Analysis currently unavailable", "Please try again later", "API connection issue"],
            semanticInnovation: "Analysis currently unavailable - please try again later.",
          },
          noveltyHeatmap: {
            passageA: [
              { content: "Analysis currently unavailable - please try again later.", heat: 50 },
            ],
            passageB: [
              { content: "Reference Corpus", heat: 0 },
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
              score: 10,
              components: [
                { name: "Reference Standard", score: 10 },
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
              level: "Low",
              elements: ["Reference Corpus"],
              assessment: "This is the reference corpus used for comparison.",
            },
          },
          coherence: {
            passageA: {
              score: 5,
              assessment: "Analysis currently unavailable - please try again later.",
              strengths: ["Analysis currently unavailable"],
              weaknesses: ["Analysis currently unavailable"]
            },
            passageB: {
              score: 10,
              assessment: "Reference corpus used for comparison.",
              strengths: ["Reference Standard"],
              weaknesses: []
            }
          },
          verdict: `Analysis temporarily unavailable. Our system was unable to complete the comparison against "${corpusTitle}" at this time due to an API connection issue. Please try again later.`,
        };
        
        // Validate the fallback response
        try {
          const validatedFallback = analysisResultSchema.parse(fallbackResponse);
          
          // Store the fallback analysis
          await storage.createAnalysis({
            passageA: passage.text,
            passageB: "corpus-comparison",
            passageATitle: passage.title,
            passageBTitle: corpusTitle,
            result: validatedFallback,
            createdAt: new Date().toISOString(),
          });

          // Return the validated fallback response
          res.json(validatedFallback);
        } catch (error) {
          const fallbackValidationError = error instanceof Error ? error : new Error("Unknown validation error");
          console.error("Fallback response validation error:", fallbackValidationError);
          // If even the fallback fails validation, return a generic error
          res.status(500).json({ 
            message: "Failed to analyze passage against corpus", 
            error: "Internal validation error with analysis result"
          });
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      } else {
        console.error("Error analyzing passage against corpus:", error);
        res.status(500).json({ 
          message: "Failed to analyze passage against corpus", 
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

      // Create a more permissive schema for validation issues
      // First, log the raw structure to help debug
      console.log("Feedback request structure validation:", {
        hasCategory: typeof req.body.category === 'string',
        categoryValue: req.body.category,
        hasFeedback: typeof req.body.feedback === 'string',
        feedbackLength: req.body.feedback?.length,
        hasOriginalResult: !!req.body.originalResult,
        hasPassageA: !!req.body.passageA,
        passageAHasText: !!req.body.passageA?.text, 
        passageATextType: typeof req.body.passageA?.text,
        hasPassageB: !!req.body.passageB,
        passageBHasText: !!req.body.passageB?.text,
        passageBTextType: typeof req.body.passageB?.text,
        isSinglePassageModeType: typeof req.body.isSinglePassageMode,
        hasSupportingDoc: !!req.body.supportingDocument,
      });
      
      // More permissive validation schema
      const requestSchema = z.object({
        analysisId: z.number().optional(),
        category: z.enum(['conceptualLineage', 'semanticDistance', 'noveltyHeatmap', 'derivativeIndex', 'conceptualParasite', 'coherence']),
        feedback: z.string().min(1, "Feedback is required"),
        supportingDocument: z.object({
          title: z.string(),
          content: z.string()
        }).optional(),
        // Use a partial validator for the original result to be more forgiving
        originalResult: analysisResultSchema.passthrough(),
        passageA: z.object({
          title: z.string().optional().default(""),
          text: z.string().min(1, "Passage A text is required")
        }),
        passageB: z.object({
          title: z.string().optional().default(""),
          text: z.string().optional().default("")
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
      const { feedback: feedbackData, updatedResult } = await processFeedback({
        category,
        feedback,
        originalResult,
        passageA,
        passageB,
        isSinglePassageMode,
        supportingDocument
      });

      // Validate the response against our schema with more leniency
      console.log("Validating revised result from feedback processing");
      
      // Add more robust error handling for the validation
      let validatedResult;
      try {
        validatedResult = analysisResultSchema.parse(updatedResult);
      } catch (validationError) {
        console.error("Validation error with revised result:", validationError);
        
        // Fall back to the original result with feedback attached if validation fails
        // This ensures we don't lose the user's feedback
        validatedResult = {
          ...originalResult,
          [category]: {
            ...originalResult[category],
            feedback: feedbackData
          }
        };
        
        if (supportingDocument) {
          validatedResult.supportingDocuments = [
            ...(validatedResult.supportingDocuments || []),
            supportingDocument
          ];
        }
        
        console.log("Using fallback result with feedback attached");
      }

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
        aiResponse: feedbackData.aiResponse,
        isRevised: feedbackData.isRevised,
        revisedResult: validatedResult
      });
    } catch (error) {
      console.error("Error with feedback submission:", error);
      if (error instanceof ZodError) {
        // Log detailed validation errors
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        console.error("Validation errors:", JSON.stringify(validationErrors, null, 2));
        
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationErrors
        });
      } else {
        console.error("Non-validation error:", error instanceof Error ? error.message : "Unknown error");
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

  // Generate a more original version of a passage
  app.post("/api/generate-original", async (req, res) => {
    try {
      const requestSchema = z.object({
        passage: z.object({
          title: z.string().optional().default(""),
          text: z.string().min(1, "Passage text is required")
        }),
        analysisResult: analysisResultSchema.passthrough(),
        styleOption: z.enum(['keep-voice', 'academic', 'punchy', 'prioritize-originality']).optional(),
        customInstructions: z.string().optional()
      });

      const { passage, analysisResult, styleOption, customInstructions } = requestSchema.parse(req.body);
      
      console.log("Generating more original version:", {
        title: passage.title,
        textLength: passage.text.length,
        styleOption,
        hasCustomInstructions: !!customInstructions
      });

      try {
        // Generate a more original version using OpenAI
        const generatedResult = await generateMoreOriginalVersion(
          passage, 
          analysisResult, 
          styleOption,
          customInstructions
        );
        
        console.log("Generated more original version:", {
          originalLength: generatedResult.originalPassage.text.length,
          improvedLength: generatedResult.improvedPassage.text.length,
          estimatedScore: generatedResult.estimatedDerivativeIndex
        });

        res.json(generatedResult);
      } catch (aiError) {
        console.error("Error generating more original version:", aiError);
        
        res.status(500).json({
          message: "Failed to generate more original version",
          error: aiError instanceof Error ? aiError.message : "Unknown AI processing error"
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        console.error("Validation errors:", JSON.stringify(validationErrors, null, 2));
        
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationErrors
        });
      } else {
        console.error("Error generating more original version:", error);
        res.status(500).json({ 
          message: "Failed to process request", 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
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
