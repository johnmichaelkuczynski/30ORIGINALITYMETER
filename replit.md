# Originality Meter - Semantic Analysis Application

## Overview
The Originality Meter is a web application designed to evaluate the intellectual originality and quality of written content. It analyzes passages for conceptual innovation, semantic distance from existing ideas, and overall intellectual merit. The system supports single-passage and comparative analysis, document processing, graph generation, and AI-powered content evaluation. Its vision is to provide a sophisticated tool for assessing the depth and novelty of ideas across various disciplines, aiming to measure the depth and novelty of ideas.

## User Preferences
Preferred communication style: Simple, everyday language.
Preferred AI provider: DeepSeek (set as default, confirmed working January 18, 2025).

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

### Core System Features and Design
- **Universal Protocol Engine**: Implements a three-phase evaluation engine for all four LLM providers (DeepSeek, OpenAI, Anthropic, Perplexity), using exact user-defined questions for Intelligence (18), Originality (9), Cogency (12), and Quality (14).
- **Three-Phase Evaluation Methodology**:
    - **Phase 1**: Initial evaluation with Sniper Amendment and Walmart metric.
    - **Phase 2**: Pushback challenge for scores below 95/100, re-asking questions "DE NOVO."
    - **Phase 3**: Walmart metric enforcement requiring concrete examples and final validation.
- **Chunking System**: Handles large documents over 6000 characters by automatic text chunking, intelligent chunk combination, and seamless processing across all analysis types.
- **AI Integration Services**: Unifies API handling across multiple AI providers for consistent analysis.
- **Analysis Modules**: Includes Core Originality Analysis (Conceptual Lineage, Semantic Distance, Novelty Heatmap, Derivative Index, Conceptual Parasite Detection), Quality Metrics (Coherence, Accuracy, Depth, Clarity), Argumentative Analysis, Comparative Analysis, and AI Detection.
- **Document Processing Pipeline**: Features text extraction from DOCX, PDF, TXT; audio transcription via AssemblyAI; image OCR via OpenAI Vision; Math Preservation for LaTeX; and export functionality to PDF, Word, HTML, TXT.
- **Data Flow**: Manages input processing, AI provider selection, multi-dimensional evaluation, result compilation, storage, and export.
- **Real-time Features**: Chat Interface, Feedback System, Dynamic Graph Generation (AI-handled), and Search Integration (Google Custom Search).
- **Interoperability**: Enables seamless communication and output sharing between Document Rewriter, Homework Helper, and Analysis modules.
- **Report Generation**: Supports PDF export for single document reports with complete metric breakdowns and dual document comparison reports with side-by-side analysis.

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

### Development Tools
- Drizzle ORM
- Zod
- Multer
- Axios