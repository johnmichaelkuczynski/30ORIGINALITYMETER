import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RewriteRequest {
  sourceText: string;
  customInstructions: string;
  contentSource?: string;
  styleSource?: string;
  preserveMath: boolean;
}

/**
 * Rewrites a document according to custom instructions with perfect math preservation
 * @param request - Rewrite request parameters
 * @returns Promise containing the rewritten text with preserved mathematical notation
 */
export async function rewriteDocument(request: RewriteRequest): Promise<string> {
  try {
    const { sourceText, customInstructions, contentSource, styleSource, preserveMath } = request;

    // Build comprehensive system prompt
    let systemPrompt = `You are an expert document rewriter specializing in academic and scholarly content. Your task is to rewrite the provided text according to the user's custom instructions while maintaining the highest quality and accuracy.

CRITICAL REQUIREMENTS:
1. MATHEMATICAL NOTATION: If preserveMath is enabled, maintain ALL mathematical expressions, formulas, symbols, and equations in their original LaTeX format or convert to proper LaTeX notation
2. STRUCTURE: Preserve the logical flow and academic structure unless specifically instructed otherwise
3. ACCURACY: Maintain factual accuracy and scholarly integrity
4. COMPLETENESS: Ensure the rewritten version covers all important points from the original
5. STYLE: Apply the requested modifications while maintaining professional academic tone

MATHEMATICAL NOTATION GUIDELINES:
- Preserve existing LaTeX: $inline math$ and $$display math$$
- Convert mathematical symbols to LaTeX when needed
- Maintain equation numbering and references if present
- Preserve mathematical formatting in tables and figures`;

    if (contentSource) {
      systemPrompt += `\n\nCONTENT SOURCE PROVIDED:
You have access to additional content that should be drawn from and integrated into the rewrite. Use this content to enhance, supplement, or provide examples for the rewritten document.`;
    }

    if (styleSource) {
      systemPrompt += `\n\nSTYLE SOURCE PROVIDED:
You have access to a style reference document. Analyze its writing style, tone, structure, and approach, then emulate these characteristics in your rewrite.`;
    }

    // Build user prompt
    let userPrompt = `ORIGINAL DOCUMENT TO REWRITE:
${sourceText}

CUSTOM REWRITE INSTRUCTIONS:
${customInstructions}`;

    if (contentSource) {
      userPrompt += `\n\nADDITIONAL CONTENT SOURCE (to draw from):
${contentSource.substring(0, 3000)}${contentSource.length > 3000 ? '...[truncated]' : ''}`;
    }

    if (styleSource) {
      userPrompt += `\n\nSTYLE REFERENCE (to emulate):
${styleSource.substring(0, 2000)}${styleSource.length > 2000 ? '...[truncated]' : ''}`;
    }

    userPrompt += `\n\nPRODUCE: A complete rewrite that follows the custom instructions exactly while maintaining mathematical notation, academic quality, and scholarly integrity. Return ONLY the rewritten content, no explanations or meta-commentary.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7, // Balanced creativity and accuracy
    });

    const rewrittenText = response.choices[0].message.content || "";
    
    if (!rewrittenText.trim()) {
      throw new Error("Rewrite process failed to generate content");
    }

    return rewrittenText;
  } catch (error) {
    console.error("Error in document rewriting:", error);
    throw new Error(`Document rewriting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Solves homework assignments and problem sets with perfect mathematical notation
 * @param assignmentText - The assignment or problem set to solve
 * @returns Promise containing complete solutions
 */
export async function solveHomework(assignmentText: string): Promise<string> {
  try {
    const systemPrompt = `You are an expert academic tutor and problem solver with deep knowledge across all disciplines including mathematics, physics, chemistry, biology, economics, engineering, philosophy, literature, and more.

CRITICAL INSTRUCTIONS:
1. COMPLETE SOLUTIONS: Provide full, detailed solutions to ALL questions and problems
2. MATHEMATICAL NOTATION: Use proper LaTeX notation for all mathematical expressions: $inline$ and $$display$$
3. STEP-BY-STEP: Show all work, reasoning, and intermediate steps
4. EXPLANATIONS: Include clear explanations of concepts and methods used
5. FORMATTING: Structure solutions clearly with numbered problems/questions
6. ACCURACY: Ensure all calculations, facts, and reasoning are correct
7. COMPREHENSIVE: Address every part of multi-part questions

FOR DIFFERENT TYPES OF ASSIGNMENTS:
- Essays: Write complete, well-structured essays with proper arguments and evidence
- Problem Sets: Solve all problems with detailed mathematical work
- Analysis: Provide thorough analysis with supporting evidence
- Proofs: Present rigorous mathematical or logical proofs
- Code: Write functional, well-commented code solutions

Return complete solutions without meta-commentary or disclaimers.`;

    const userPrompt = `ASSIGNMENT TO COMPLETE:
${assignmentText}

PROVIDE: Complete solutions to all questions, problems, and tasks in this assignment with proper mathematical notation, detailed explanations, and step-by-step work.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more accurate solutions
    });

    const solution = response.choices[0].message.content || "";
    
    if (!solution.trim()) {
      throw new Error("Homework solving failed to generate solutions");
    }

    return solution;
  } catch (error) {
    console.error("Error solving homework:", error);
    throw new Error(`Homework solving failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}