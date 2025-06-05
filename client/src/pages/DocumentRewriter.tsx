import { useEffect, useState } from 'react';
import DocumentRewriter from '@/components/DocumentRewriter';

export default function DocumentRewriterPage() {
  const [initialContent, setInitialContent] = useState<string>();
  const [initialTitle, setInitialTitle] = useState<string>();

  useEffect(() => {
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const content = urlParams.get('content');
    const title = urlParams.get('title');
    
    if (content) {
      setInitialContent(decodeURIComponent(content));
    }
    if (title) {
      setInitialTitle(decodeURIComponent(title));
    }
    
    // Clean up URL parameters after loading
    if (content || title) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

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
      
      <DocumentRewriter 
        onSendToAnalysis={handleSendToAnalysis}
        initialContent={initialContent}
        initialTitle={initialTitle}
      />
    </div>
  );
}