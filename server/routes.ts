import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { z } from "zod";
import { analyzePassages } from "./lib/openai";
import { splitIntoParagraphs } from "../client/src/lib/utils";
import { analysisResultSchema } from "@shared/schema";

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
          error: error.message || "Unknown error" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
