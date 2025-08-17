# Originality Meter - Semantic Analysis Application

## Overview

The Originality Meter is a web application designed to evaluate the intellectual originality and quality of written content. It analyzes passages for conceptual innovation, semantic distance from existing ideas, and overall intellectual merit. The system supports single-passage and comparative analysis, document processing, graph generation, and AI-powered content evaluation. Its vision is to provide a sophisticated tool for assessing the depth and novelty of ideas across various disciplines.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 17, 2025
- ✅ Fixed 160-metric analysis system - now fully functional
- ✅ Changed waiting message from "15-30 seconds" to "1-2 minutes" 
- ✅ Resolved frontend display issues preventing results from showing
- ✅ Updated UI to correctly show "40 parameters" instead of "20 parameters"
- ✅ Analysis system now provides direct quotations + explanations for each metric
- ✅ Anthropic set as default LLM provider for all analysis functions
- ✅ Backend analysis confirmed working with structured JSON responses (numbered keys 0-39)
- ✅ Frontend successfully displays analysis results with proper formatting
- ✅ **DUAL ANALYSIS COMPLETELY FIXED** - Both intelligence and originality dual analysis working
- ✅ Enhanced JSON parsing with robust markdown code block extraction and fallback methods
- ✅ Frontend now properly handles both single and dual document analysis formats
- ✅ Color-coded comparative display (blue for Document A, green for Document B)
- ✅ All TypeScript errors resolved, full system operational
- ✅ **NEW FEATURE: Generate Perfect Example** - Users can now generate 95-99/100 example text on same topic
- ✅ Added "Generate Perfect Example (100/100)" button to single passage analysis results
- ✅ Perfect example generation uses Anthropic Claude to create high-quality writing demonstrating all 160 metrics
- ✅ Feature designed to reveal what the evaluation system considers "perfect" intellectual writing
- ✅ **CRITICAL SYSTEM OVERHAUL: Fixed Intelligence & Originality Evaluation Logic**
- ✅ Fixed broken intelligence evaluation - now judges semantic control, inferential structure, compression, asymmetry, friction
- ✅ Fixed broken originality evaluation - now judges intellectual fertility and analytical sophistication, not historical novelty
- ✅ System no longer penalizes passages for being "derivative" or having historical precedents (Herbert Spencer, etc.)
- ✅ Intelligence scoring now based on HOW ideas are processed, not WHAT ideas are or who said them first
- ✅ Eliminated anti-jargon bias - complex vocabulary allowed when serving genuine intellectual precision
- ✅ Fixed SummarySection.tsx score calculation logic to properly aggregate individual metric scores
- ✅ System now correctly rewards brilliant analytical work regardless of historical authorship
- ✅ **NEW DUAL PROTOCOL SYSTEM: Primary Intelligence Protocol + Legacy Option**
- ✅ Added new Primary Intelligence Protocol with 18 sophisticated evaluation questions (DEFAULT)
- ✅ Kept legacy 160-parameter system as secondary option for users who invested development time
- ✅ Primary protocol focuses on: insight, development, organization, logic, freshness, authenticity, directness
- ✅ Users can choose between "Primary Protocol" (recommended) and "Legacy System" (parameter-based)
- ✅ UI clearly labels Primary as recommended and Legacy as having "known accuracy issues"
- ✅ **NEW DUAL ORIGINALITY PROTOCOL SYSTEM: Primary Originality Protocol + Legacy Option**
- ✅ Added Primary Originality Protocol with 9 sophisticated originality questions (DEFAULT)
- ✅ Primary originality protocol evaluates intellectual fecundity, NOT historical novelty
- ✅ System now correctly rates Newton, Darwin, Freud as highly original (not "derivative")
- ✅ Legacy parameter system kept as secondary option with accuracy warnings
- ✅ Parameter selection only appears for Legacy protocols or non-protocol analysis types

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Vite build tool)
- **UI/UX**: Radix UI components with shadcn/ui and Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Math Rendering**: MathJax for LaTeX notation

### Backend Architecture
- **Framework**: Express.js with TypeScript (ESBuild for production, TSX for development)
- **API Design**: RESTful endpoints with JSON payloads
- **File Processing**: Support for DOCX, PDF, TXT, audio, and images
- **Error Handling**: Centralized middleware

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database (serverless PostgreSQL)
- **Migrations**: Drizzle Kit

### Key Components

#### AI Integration Services
Integrates multiple AI providers for analysis:
- OpenAI GPT-4 (Primary)
- Anthropic Claude
- Perplexity AI
- AssemblyAI (Audio transcription)
- GPTZero (AI content detection)

#### Analysis Modules
- **Core Originality Analysis**: Conceptual Lineage, Semantic Distance, Novelty Heatmap, Derivative Index, Conceptual Parasite Detection.
- **Quality Metrics**: Coherence, Accuracy, Depth, Clarity.
- **Advanced Features**: Argumentative Analysis, Comparative Analysis, AI Detection, Document Chunking, Intelligence Meter (20 cognitive sophistication metrics), Overall Quality (20 precise quality metrics), Cogency Meter (20 parameters), Originality Meter (20 parameters).

#### Document Processing Pipeline
- **Text Extraction**: DOCX (Mammoth), PDF (pdf-parse), TXT (direct).
- **Audio Processing**: MP3 transcription via AssemblyAI.
- **Image OCR**: Text extraction from images using OpenAI Vision.
- **Math Preservation**: Handles LaTeX notation.
- **Export Functionality**: PDF, Word, HTML, TXT.

#### Data Flow
- **Analysis Workflow**: Input processing, AI provider selection, multi-dimensional evaluation, result compilation, storage in PostgreSQL, export options.
- **Real-time Features**: Chat Interface, Feedback System, Dynamic Graph Generation (AI-handled with user-selectable LLMs and mathematical specifications display), Search Integration (Google Custom Search).
- **Interoperability**: Seamless cross-component communication for sending outputs between Document Rewriter, Homework Helper, and Analysis modules.

## External Dependencies

### AI Services
- OpenAI API
- Anthropic API
- Perplexity API
- AssemblyAI API
- GPTZero API

### Supporting Services
- SendGrid (Email delivery)
- Google Custom Search
- Neon Database (PostgreSQL hosting)
- PayPal (for potential future payment integrations, though not explicitly used for core functionality in original text)

### Development Tools
- Drizzle ORM
- Zod
- Multer
- Axios