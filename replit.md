# Originality Meter - Semantic Analysis Application

## Overview

The Originality Meter is a sophisticated web application that evaluates the intellectual originality and quality of written content across multiple disciplines. The system analyzes passages for conceptual innovation, semantic distance from existing ideas, and overall intellectual merit. It features both single-passage analysis and comparative analysis between two texts, with support for document processing, graph generation, and AI-powered content evaluation.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Math Rendering**: MathJax integration for LaTeX mathematical notation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build System**: ESBuild for production bundling, TSX for development
- **API Design**: RESTful endpoints with JSON payloads
- **File Processing**: Support for multiple formats (DOCX, PDF, TXT, audio, images)
- **Error Handling**: Centralized error middleware with structured responses

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Type-safe database operations with Zod validation
- **Connection**: Neon Database serverless PostgreSQL
- **Migrations**: Drizzle Kit for database schema migrations

## Key Components

### AI Integration Services
The application integrates with multiple AI providers for comprehensive analysis:

1. **OpenAI GPT-4** (Primary): Main analysis engine for originality evaluation
2. **Anthropic Claude**: Alternative provider with advanced reasoning capabilities
3. **Perplexity AI**: Online search-enhanced analysis
4. **AssemblyAI**: Audio transcription for spoken content analysis
5. **GPTZero**: AI content detection to identify machine-generated text

### Analysis Modules

#### Core Originality Analysis
- **Conceptual Lineage**: Traces intellectual heritage and influences
- **Semantic Distance**: Measures conceptual departure from existing ideas
- **Novelty Heatmap**: Paragraph-by-paragraph innovation identification
- **Derivative Index**: 0-10 scale measuring originality vs. recycled content
- **Conceptual Parasite Detection**: Identifies content that merely reacts to existing debates

#### Quality Metrics
- **Coherence**: Logical consistency and internal structure
- **Accuracy**: Factual and inferential correctness
- **Depth**: Conceptual insight and non-triviality
- **Clarity**: Readability and semantic accessibility

#### Advanced Features
- **Argumentative Analysis**: Evaluates proof quality and cogency
- **Comparative Analysis**: Side-by-side evaluation of two passages
- **AI Detection**: Identifies potentially machine-generated content
- **Document Chunking**: Handles large documents through intelligent segmentation

### Document Processing Pipeline
- **Text Extraction**: DOCX (Mammoth), PDF (pdf-parse), TXT (direct)
- **Audio Processing**: MP3 transcription via AssemblyAI
- **Image OCR**: Text extraction from images using OpenAI Vision
- **Math Preservation**: LaTeX notation handling throughout the pipeline
- **Export Functionality**: PDF, Word, HTML, and TXT export options

## Data Flow

### Analysis Workflow
1. **Input Processing**: Text extraction and preprocessing with math preservation
2. **AI Provider Selection**: Route to appropriate LLM based on analysis type
3. **Structured Analysis**: Multi-dimensional evaluation across nine metrics
4. **Result Compilation**: JSON response with quantitative scores and qualitative insights
5. **Storage**: Analysis results stored in PostgreSQL with full history
6. **Export Options**: Multiple format exports with proper formatting

### Real-time Features
- **Chat Interface**: Direct AI interaction for follow-up questions
- **Feedback System**: User can dispute AI assessments with contextual dialogue
- **Graph Generation**: Dynamic visualization of mathematical functions and data
- **Search Integration**: Google Custom Search for reference validation

## External Dependencies

### AI Services
- **OpenAI API**: Primary analysis engine (GPT-4)
- **Anthropic API**: Claude models for advanced reasoning
- **Perplexity API**: Search-enhanced analysis
- **AssemblyAI API**: Audio transcription services
- **GPTZero API**: AI content detection

### Supporting Services
- **SendGrid**: Email delivery for analysis reports
- **Google Custom Search**: Reference validation and fact-checking
- **Neon Database**: Serverless PostgreSQL hosting

### Development Tools
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime type validation
- **Multer**: File upload handling
- **Axios**: HTTP client for external API calls

## Deployment Strategy

### Development Environment
- **Replit Integration**: Native development environment support
- **Hot Reload**: Vite HMR with Express middleware integration
- **Environment Variables**: Secure API key management
- **Debugging**: Comprehensive logging and error tracking

### Production Build
- **Frontend**: Vite build with optimized asset bundling
- **Backend**: ESBuild compilation to ESM modules
- **Static Assets**: Efficient serving with proper caching headers
- **Process Management**: Node.js production server with error recovery

### Performance Optimizations
- **Chunked Processing**: Large document handling through intelligent segmentation
- **Math Rendering**: Client-side MathJax for optimal LaTeX display
- **Request Limits**: 50MB JSON payload support for large documents
- **Streaming Support**: Real-time analysis feedback for long-running operations

## Changelog

```
Changelog:
- June 30, 2025. Initial setup
- June 30, 2025. Added DeepSeek as default LLM provider option
- June 30, 2025. Fixed argumentative analysis scoring logic to properly value academic excellence
- June 30, 2025. Improved report formatting with markdown structure and proper line breaks
- June 30, 2025. Implemented comprehensive argument reconstruction and validation system
- June 30, 2025. Added separate Single Document Cogency analysis alongside existing dual-document Cogency Test
- June 30, 2025. Implemented 7-parameter cogency evaluation system for single documents
- July 1, 2025. Updated cogency evaluation to focus on logical convincingness, not accessibility
- July 1, 2025. Implemented domain-aware evaluation standards (mathematical, philosophical, empirical)
- July 1, 2025. Fixed rubric bias against formal proofs and proof sketches
- July 1, 2025. CRITICAL FIX: Completely rewrote evaluation prompt to properly value mathematical rigor and formal proofs
- July 1, 2025. Updated scoring system to give 23-25/25 scores for exceptional academic work like theorem extensions
- July 1, 2025. MAJOR OVERHAUL: Rebuilt evaluation system to assess actual cogency, not formalism
- July 1, 2025. Now evaluates: semantic compression, recursive reasoning, tension resolution, multi-scale integration
- July 1, 2025. Philosophical argumentation no longer penalized for narrative style or lack of formal proofs
- July 1, 2025. MAJOR FEATURE: Added chunk-based document rewriting with selective chunk selection
- July 1, 2025. Users can now divide documents into chunks and choose which specific sections to rewrite
- July 1, 2025. Implemented tabbed interface with "Rewrite Entire Document" vs "Select Chunks to Rewrite"
- July 3, 2025. CRITICAL FIXES: Resolved app crashes during analysis and rewriting operations
- July 3, 2025. Fixed invalid DeepSeek API key issue by switching default provider to OpenAI
- July 3, 2025. Removed undefined reanalyzeMutation reference causing rewrite function crashes
- July 3, 2025. Added null safety checks to prevent ArgumentativeAnalysis component failures
- July 3, 2025. VERIFIED STABLE: Both analysis and document rewriting now working without crashes
- July 3, 2025. Custom rewrite instructions and chunk-based rewriting fully operational
- July 4, 2025. CRITICAL SCORING FIX: Fixed catastrophic scoring calculation error in cogency evaluation
- July 4, 2025. Scores were incorrectly calculated as out of 100 instead of 25, causing massive underscoring
- July 4, 2025. Enhanced evaluation prompt to prevent AI from penalizing philosophical work for lack of formal proofs
- July 4, 2025. High-quality academic work now properly scores 85-95/100 instead of incorrect 78/100
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```