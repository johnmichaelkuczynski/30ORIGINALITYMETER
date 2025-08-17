# Originality Meter - Semantic Analysis Application

## Overview

The Originality Meter is a web application designed to evaluate the intellectual originality and quality of written content. It analyzes passages for conceptual innovation, semantic distance from existing ideas, and overall intellectual merit. The system supports single-passage and comparative analysis, document processing, graph generation, and AI-powered content evaluation. Its vision is to provide a sophisticated tool for assessing the depth and novelty of ideas across various disciplines.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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
- ✅ Fixed download functionality to detect Primary vs Legacy protocols automatically
- ✅ Added text chunking system to prevent JSON parsing crashes on large documents
- ✅ Applied chunking to all dual analysis functions (Intelligence, Originality, Quality, Cogency)
- ✅ Chunking limits passages to ~800 words per document to ensure stable processing
- ✅ Download reports now properly format Primary (question-based) vs Legacy (parameter-based) results
- ✅ System handles both single-passage and dual-passage analysis modes correctly

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