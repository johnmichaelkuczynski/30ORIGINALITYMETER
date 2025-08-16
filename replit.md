# Originality Meter - Semantic Analysis Application

## Overview
The Originality Meter is a web application designed to evaluate the intellectual originality and quality of written content. It analyzes passages for conceptual innovation, semantic distance from existing ideas, and overall intellectual merit. Key capabilities include single-passage analysis, comparative analysis between two texts, document processing (including audio and images), graph generation, and AI-powered content evaluation. The project aims to provide a sophisticated tool for assessing the depth and uniqueness of ideas across various disciplines.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend
- **Framework**: React with TypeScript (Vite)
- **UI**: Radix UI components with shadcn/ui and Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Math Rendering**: MathJax and KaTeX for LaTeX notation

### Backend
- **Framework**: Express.js with TypeScript (ESBuild for production, TSX for development)
- **API**: RESTful with JSON payloads
- **File Processing**: Support for DOCX, PDF, TXT, audio, and images.
- **Error Handling**: Centralized middleware

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Hosting**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit with Zod validation

### Key Components
- **AI Integration**: Orchestrates multiple AI providers for analysis.
- **Analysis Modules**:
    - **Core Originality**: Conceptual lineage, semantic distance, novelty heatmap, derivative index, conceptual parasite detection.
    - **Quality Metrics**: Coherence, accuracy, depth, clarity.
    - **Advanced Features**: Argumentative analysis, comparative analysis, AI detection, document chunking.
    - **Comprehensive 160-Metric Analysis System** (Implemented Jan 2025): Intelligence Meter, Originality Meter, Cogency Meter, Overall Quality - each dimension uses exactly 40 specific metrics, supporting both single and dual document comparison. Each metric provides: metric name, text quote, analysis explanation, and numerical score (X/100 format) replicating the exact format from user's uploaded analysis examples.
- **Document Processing Pipeline**: Handles text extraction (Mammoth for DOCX, pdf-parse for PDF), audio transcription (AssemblyAI), image OCR (OpenAI Vision), and LaTeX preservation. Supports export to PDF, Word, HTML, and TXT.
- **Data Flow**: Includes input processing, AI provider selection, multi-dimensional evaluation, result compilation, storage in PostgreSQL, and various export options.
- **Real-time Features**: Chat interface for AI interaction, feedback system for disputing AI assessments, dynamic graph generation, and Google Custom Search integration.

### UI/UX Decisions
- Focus on clean, modern design using Radix UI and Tailwind CSS.
- Tabbed interfaces for clear distinction between features like document rewriting options.
- Visualizations for analysis results and mathematical graphs with specifications.
- Browser-based PDF generation for reports including SVG graphs and MathJax-rendered LaTeX.

## External Dependencies
### AI Services
- **OpenAI API**: GPT-4 (primary analysis), Vision (image OCR).
- **Anthropic API**: Claude models.
- **Perplexity AI API**: Search-enhanced analysis.
- **AssemblyAI API**: Audio transcription.
- **GPTZero API**: AI content detection.

### Supporting Services
- **Neon Database**: PostgreSQL hosting.
- **SendGrid**: Email delivery.
- **Google Custom Search**: Reference validation.

### Development Tools
- **Drizzle ORM**: Type-safe database operations.
- **Zod**: Runtime type validation.
- **Multer**: File upload handling.
- **Axios**: HTTP client.
- **PayPal**: (Mentioned in API keys, implying payment integration)
- **Azure Speech**: (Mentioned in API keys, implying speech-to-text or similar)