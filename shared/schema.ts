import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  passageA: text("passage_a").notNull(),
  passageB: text("passage_b").notNull(),
  passageATitle: text("passage_a_title"),
  passageBTitle: text("passage_b_title"),
  result: jsonb("result").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  passageA: true,
  passageB: true,
  passageATitle: true,
  passageBTitle: true,
  result: true,
  createdAt: true,
});

export const analysisResultSchema = z.object({
  conceptualLineage: z.object({
    passageA: z.object({
      primaryInfluences: z.string(),
      intellectualTrajectory: z.string(),
    }),
    passageB: z.object({
      primaryInfluences: z.string(),
      intellectualTrajectory: z.string(),
    }),
  }),
  semanticDistance: z.object({
    passageA: z.object({
      distance: z.number(),
      label: z.string(),
    }),
    passageB: z.object({
      distance: z.number(),
      label: z.string(),
    }),
    keyFindings: z.array(z.string()),
    semanticInnovation: z.string(),
  }),
  noveltyHeatmap: z.object({
    passageA: z.array(z.object({
      content: z.string(),
      heat: z.number(),
      quote: z.string().optional(),
      explanation: z.string().optional(),
    })),
    passageB: z.array(z.object({
      content: z.string(),
      heat: z.number(),
      quote: z.string().optional(),
      explanation: z.string().optional(),
    })),
  }),
  derivativeIndex: z.object({
    passageA: z.object({
      score: z.number(),
      components: z.array(z.object({
        name: z.string(),
        score: z.number(),
      })),
    }),
    passageB: z.object({
      score: z.number(),
      components: z.array(z.object({
        name: z.string(),
        score: z.number(),
      })),
    }),
  }),
  conceptualParasite: z.object({
    passageA: z.object({
      level: z.enum(["Low", "Moderate", "High"]),
      elements: z.array(z.string()),
      assessment: z.string(),
    }),
    passageB: z.object({
      level: z.enum(["Low", "Moderate", "High"]),
      elements: z.array(z.string()),
      assessment: z.string(),
    }),
  }),
  verdict: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
