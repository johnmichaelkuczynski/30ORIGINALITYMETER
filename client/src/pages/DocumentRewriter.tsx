import DocumentRewriter from '@/components/DocumentRewriter';

export default function DocumentRewriterPage() {
  const handleSendToAnalysis = (text: string, title?: string) => {
    // Navigate to home page with the text
    window.location.href = `/?analysis=${encodeURIComponent(text)}&title=${encodeURIComponent(title || '')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Document Rewriter</h1>
        <p className="text-lg text-gray-600">
          Transform your documents with AI-powered rewriting. Upload documents, provide custom instructions, 
          and get professionally rewritten content with perfect mathematical notation preservation.
        </p>
      </div>
      
      <DocumentRewriter onSendToAnalysis={handleSendToAnalysis} />
    </div>
  );
}