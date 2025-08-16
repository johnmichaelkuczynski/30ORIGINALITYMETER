# Originality Meter - Semantic Analysis Application

## Overview
The Originality Meter is a web application designed to evaluate the intellectual originality and quality of written content across various disciplines. It analyzes passages for conceptual innovation, semantic distance from existing ideas, and overall intellectual merit. Key capabilities include single-passage analysis, comparative analysis between two texts, document processing, graph generation, and AI-powered content evaluation. The business vision is to provide a sophisticated tool for assessing and enhancing the intellectual rigor of written work.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Vite build tool)
- **UI/UX**: Radix UI components with shadcn/ui styling, Tailwind CSS for custom theming
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Math Rendering**: MathJax and KaTeX integration for LaTeX notation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build System**: ESBuild (production), TSX (development)
- **API Design**: RESTful endpoints with JSON payloads
- **File Processing**: Support for DOCX, PDF, TXT, audio, and image formats
- **Error Handling**: Centralized middleware

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Type-safe operations with Zod validation
- **Connection**: Neon Database (serverless PostgreSQL)
- **Migrations**: Drizzle Kit

### Key Features & Technical Implementations
- **AI Integration**: Orchestrates multiple AI providers for analysis (OpenAI GPT-4, Anthropic Claude, Perplexity AI, AssemblyAI, GPTZero).
- **Analysis Modules**:
    - **Core Originality Analysis**: Conceptual lineage, semantic distance, novelty heatmap, derivative index, conceptual parasite detection.
    - **Quality Metrics**: Coherence, accuracy, depth, clarity.
    - **Advanced Features**: Argumentative analysis, comparative analysis, AI detection, document chunking, Intelligence Meter, Cogency Meter, Overall Quality Meter, and Originality Meter (each with 20 specific parameters).
- **Document Processing Pipeline**:
    - **Text Extraction**: DOCX (Mammoth), PDF (pdf-parse), TXT (direct), Audio (AssemblyAI), Image (OpenAI Vision OCR).
    - **Math Preservation**: Handles LaTeX notation throughout.
    - **Export Functionality**: PDF, Word, HTML, TXT.
- **Data Flow & Real-time Features**:
    - **Analysis Workflow**: Input processing, AI provider selection, multi-dimensional evaluation, result compilation, PostgreSQL storage, and multi-format exports.
    - **Real-time**: Chat interface for AI interaction, feedback system, dynamic graph generation, Google Custom Search integration.
- **Graph Generation**: AI-driven scenario modeling, user-selectable LLM providers (GPT-4o Mini, GPT-4o, GPT-4, Claude Sonnet 4), mathematical specifications display, and PDF export with SVG graphs.
- **Cross-Component Communication**: Seamless transfer of outputs between Document Rewriter, Homework Helper, and Analysis modules.
- **Scoring**: Uses population percentile scoring (0-100, indicating how many people out of 100 could write at this level of sophistication).
- **"Raw Intelligence Evaluation"**: A mode that prioritizes conceptual brutality, linguistic lethality, strategic dominance, and emotional engineering over academic norms.

## External Dependencies

### AI Services
- **OpenAI API**: Primary analysis engine (GPT-4)
- **Anthropic API**: Claude models
- **Perplexity API**: Search-enhanced analysis
- **AssemblyAI API**: Audio transcription
- **GPTZero API**: AI content detection

### Supporting Services
- **SendGrid**: Email delivery
- **Google Custom Search**: Reference validation
- **Neon Database**: Serverless PostgreSQL hosting
- **PayPal**: (Mentioned in API keys configuration, implying payment processing)

### Development Tools (Integrated for project functionality)
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime type validation
- **Multer**: File upload handling
- **Axios**: HTTP client for external API calls