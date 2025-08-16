import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { performComprehensiveAnalysis } from "./lib/newAnalysisEngine";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // API key status check
  app.get("/api/providers/status", async (req, res) => {
    try {
      const openaiKey = process.env.OPENAI_API_KEY;
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      const perplexityKey = process.env.PERPLEXITY_API_KEY;

      res.json({
        openai: !!openaiKey,
        anthropic: !!anthropicKey,
        perplexity: !!perplexityKey
      });
    } catch (error) {
      console.error("Error checking provider status:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // NEW COMPREHENSIVE 160-METRIC ANALYSIS ENDPOINT
  app.post("/api/analyze/comprehensive", async (req, res) => {
    try {
      const requestSchema = z.object({
        text: z.string().min(1, "Text is required for comprehensive analysis"),
        provider: z.enum(["openai", "anthropic", "perplexity"]).optional().default("openai"),
      });

      const { text, provider } = requestSchema.parse(req.body);
      
      console.log("Starting 160-metric comprehensive analysis:", {
        textLength: text.length,
        provider,
        estimatedDuration: "3+ hours for full analysis"
      });

      // Perform the comprehensive 160-metric analysis
      const analysisResult = await performComprehensiveAnalysis(text, provider);
      
      console.log("Comprehensive analysis completed successfully");
      res.json(analysisResult);
      
    } catch (error) {
      console.error("Error in comprehensive analysis:", error);
      res.status(500).json({
        error: "Comprehensive analysis failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // LEGACY ENDPOINT FOR UI COMPATIBILITY - REDIRECTS TO COMPREHENSIVE
  app.post("/api/analyze/single", async (req, res) => {
    try {
      const requestSchema = z.object({
        passageA: z.object({
          text: z.string().min(1, "Passage text is required"),
        }),
        provider: z.enum(["openai", "anthropic", "perplexity"]).optional().default("openai"),
      });

      const { passageA, provider } = requestSchema.parse(req.body);
      
      console.log("Legacy analysis request - redirecting to comprehensive analysis");
      
      // Perform comprehensive analysis
      const analysisResult = await performComprehensiveAnalysis(passageA.text, provider);
      
      // Convert to legacy format for UI compatibility
      const legacyResult = {
        conceptualLineage: {
          passageA: {
            primaryInfluences: "See comprehensive analysis results",
            intellectualTrajectory: "See comprehensive analysis results"
          },
          passageB: null
        },
        semanticDistance: {
          passageA: {
            distance: analysisResult.summary.originalityScore,
            label: analysisResult.summary.originalityScore > 80 ? "Highly Original" : 
                   analysisResult.summary.originalityScore > 60 ? "Moderately Original" : "Standard"
          },
          passageB: null,
          keyFindings: ["Comprehensive 160-metric analysis completed"],
          semanticInnovation: `Total score: ${analysisResult.summary.totalScore}/100`
        },
        noveltyHeatmap: {
          passageA: [
            {
              content: "See comprehensive analysis for detailed quotations",
              heat: analysisResult.summary.originalityScore
            }
          ],
          passageB: null
        },
        derivativeIndex: {
          passageA: {
            score: analysisResult.summary.originalityScore / 10,
            assessment: "See comprehensive analysis results",
            strengths: ["160-metric analysis completed"],
            weaknesses: ["See individual metric results"]
          },
          passageB: null
        },
        conceptualParasite: {
          passageA: {
            level: analysisResult.summary.originalityScore > 70 ? "Low" : "Moderate",
            elements: ["See comprehensive analysis"],
            assessment: "See comprehensive analysis results"
          },
          passageB: null
        },
        coherence: {
          passageA: {
            score: analysisResult.summary.cogencyScore / 10,
            assessment: "See comprehensive analysis results",
            strengths: ["160-metric analysis completed"],
            weaknesses: ["See individual metric results"]
          },
          passageB: null
        },
        verdict: `Comprehensive 160-metric analysis completed. Intelligence: ${analysisResult.summary.intelligenceScore}, Cogency: ${analysisResult.summary.cogencyScore}, Originality: ${analysisResult.summary.originalityScore}, Overall Quality: ${analysisResult.summary.overallQualityScore}. Total Score: ${analysisResult.summary.totalScore}/100`,
        comprehensiveAnalysis: analysisResult
      };
      
      res.json(legacyResult);
      
    } catch (error) {
      console.error("Error in legacy analysis:", error);
      res.status(500).json({
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // HEALTH CHECK
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}