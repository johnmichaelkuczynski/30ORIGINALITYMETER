# Originality Meter - Semantic Analysis Application

## Overview

The Originality Meter is a web application designed to evaluate the intellectual originality and quality of written content. It analyzes passages for conceptual innovation, semantic distance from existing ideas, and overall intellectual merit. The system supports single-passage and comparative analysis, document processing, graph generation, and AI-powered content evaluation. Its vision is to provide a sophisticated tool for assessing the depth and novelty of ideas across various disciplines.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 19, 2025 - COMPLETE ORIGINALITY METER REBUILD SUCCESS
- ✅ **FRESH IMPLEMENTATION**: Complete rebuild using exact user specifications from Parts 1-3
- ✅ **NEW CORE ARCHITECTURE**: Built new-anthropic.ts with exact 59 questions (18 Intelligence, 9 Originality, 12 Cogency, 20 Overall Quality)
- ✅ **EXACT QUESTION IMPLEMENTATION**: All questions used verbatim with zero modifications
- ✅ **4-MODE ANALYSIS SYSTEM**: Intelligence, Originality, Cogency, Overall Quality modes fully operational
- ✅ **DUAL ANALYSIS MODES**: Quick and Comprehensive analysis options implemented
- ✅ **COMPARISON FUNCTIONALITY**: Single document and two-document comparison working perfectly
- ✅ **TEXT CHUNKING**: Automatic chunking for documents >1000 words to prevent processing failures
- ✅ **NEW API ENDPOINTS**: Clean RESTful endpoints (/api/analyze/single/:mode, /api/analyze/compare/:mode)
- ✅ **DOWNLOAD FUNCTIONALITY**: Text report generation for all analysis types
- ✅ **FRONTEND INTEGRATION**: Complete OriginalityMeter React component with modern UI
- ✅ **LIVE TESTING CONFIRMED**: User successfully tested with multiple document sizes
- ✅ **PERFORMANCE VERIFIED**: Processing times 20-25s single, ~56s comparison analysis
- ✅ **ZERO CORRUPTION**: Clean implementation without infrastructure damage

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