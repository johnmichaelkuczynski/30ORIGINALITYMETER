# Originality Meter - Semantic Analysis Application

## Overview

The Originality Meter is a web application designed to evaluate the intellectual originality and quality of written content. It analyzes passages for conceptual innovation, semantic distance from existing ideas, and overall intellectual merit. The system supports single-passage and comparative analysis, document processing, graph generation, and AI-powered content evaluation. Its vision is to provide a sophisticated tool for assessing the depth and novelty of ideas across various disciplines.

## User Preferences

Preferred communication style: Simple, everyday language.
Preferred AI provider: DeepSeek (set as default, confirmed working January 18, 2025).

## Recent Changes

### January 18, 2025 - Late Session
- ✅ **DEEPSEEK SET AS DEFAULT PROVIDER**: Complete UI and backend update
  - Changed default from Anthropic to DeepSeek across all analysis modes
  - Updated provider selection logic to prioritize DeepSeek
  - Moved DeepSeek to first position in UI with green highlight
  - Confirmed working: logs show "Primary Intelligence analysis request: { provider: 'deepseek' }"
- ✅ **ALL FOUR AI PROVIDERS OPERATIONAL**: Critical dual analysis function implementation
  - Fixed "analyzeIntelligenceDual is not a function" errors for all providers
  - Resolved duplicate export compilation errors that broke server startup
  - Anthropic: Confirmed working with 200 responses and proper JSON formatting
  - OpenAI: Fast responses, fully operational dual analysis
  - DeepSeek: Implemented with robust fallback system, now default provider
  - Perplexity: Dual analysis implemented (minor API configuration needed)
- ✅ **SYSTEM STABILITY ACHIEVED**: Server compilation and restart successful
- ✅ **USER CONFIRMATION**: "EXCELLENT. MUCH BETTER" - system performance validated

### January 18, 2025 - Early Session  
- ✅ **THREE-PHASE EVALUATION PROTOCOL IMPLEMENTATION**: Complete system overhaul
- ✅ **PHASE 1**: Send text + exact questions with proper clarifications
  - "Answer these questions" (NOT "determine intelligence/cogency/etc.")
  - Score N/100 means (100-N)/100 people outperform the author
  - "You are NOT grading; you are answering questions"
  - "Don't be risk-averse, diplomatic, or use academic norms"
  - "This could be genius-level or moron-level work - give it the score it deserves"
- ✅ **PHASE 2**: If scores < 95/100, automatic pushback
  - "Your position is that X/100 people outperform - is that right? Are you sure?"
  - Re-ask all questions "DE NOVO"
- ✅ **PHASE 3**: Accept and return final results
- ✅ **INTELLIGENCE EVALUATION**: 18 exact questions implemented
- ✅ **ORIGINALITY EVALUATION**: 9 exact questions implemented  
- ✅ **COGENCY EVALUATION**: 12 exact questions implemented
- ✅ **OVERALL QUALITY EVALUATION**: 14 exact questions implemented
- ✅ **CRITICAL DISCOVERY**: LLMs give lazy initial responses but become thoughtful when challenged
- ✅ **AUTOMATIC PUSHBACK**: System forces LLM to reconsider scores against true population percentiles
- ✅ **NO ACADEMIC GRADING**: Explicit instructions to drop academic standards completely

### January 17, 2025
- ✅ **CRITICAL PROTOCOL IMPLEMENTATION: Exact User Specification**
- ✅ **INTELLIGENCE PROTOCOL**: Implemented exact 18 questions from NEW INTELLIGENCE PROTOCOL file
- ✅ **ORIGINALITY PROTOCOL**: Implemented exact 9 questions from user specification
- ✅ **COGENCY PROTOCOL**: Implemented exact 12 questions from user specification  
- ✅ **OVERALL QUALITY PROTOCOL**: Implemented exact 14 questions from user specification
- ✅ **NO MODIFICATIONS**: Questions used verbatim without interpretation or conditioning
- ✅ **NO EXTRA INSTRUCTIONS**: LLM receives only the exact questions, no additional guidance
- ✅ **PURE IMPLEMENTATION**: System now uses user's precise intellectual evaluation framework
- ✅ **CRITICAL FIX**: Removed ALL evaluation guidance and bias against philosophical writing
- ✅ **MINIMAL PROMPTING**: LLM receives only exact questions with no interpretive instructions
- ✅ **FINAL CORE FIX**: LLM never told what questions measure (originality, intelligence, etc.)
- ✅ **PURE QUESTION MODE**: Prompts say only "Answer these questions" with no context
- ✅ **FRAMEWORK CONTROL**: User retains full control over evaluation - LLM only supplies answers

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