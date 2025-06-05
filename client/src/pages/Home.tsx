import { useState } from "react";
import SemanticAnalyzer from "@/components/SemanticAnalyzer";
import DocumentRewriter from "@/components/DocumentRewriter";
import HomeworkHelper from "@/components/HomeworkHelper";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [rewriterContent, setRewriterContent] = useState<string>("");
  const [rewriterTitle, setRewriterTitle] = useState<string>("");
  const [homeworkContent, setHomeworkContent] = useState<string>("");

  const handleSendToRewriter = (text: string, title?: string) => {
    setRewriterContent(text);
    setRewriterTitle(title || "Content from Chat");
    // Scroll to rewriter section
    document.getElementById('document-rewriter')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendToHomework = (text: string) => {
    setHomeworkContent(text);
    // Scroll to homework section
    document.getElementById('homework-helper')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendToAnalysis = (text: string, title?: string) => {
    // This will be handled by SemanticAnalyzer
    window.location.href = `/?analysis=${encodeURIComponent(text)}&title=${encodeURIComponent(title || '')}`;
  };

  return (
    <div className="space-y-8">
      <SemanticAnalyzer 
        onSendToRewriter={handleSendToRewriter}
        onSendToHomework={handleSendToHomework}
      />
      
      <Separator className="my-8" />
      
      <div id="document-rewriter">
        <DocumentRewriter 
          onSendToAnalysis={handleSendToAnalysis}
          initialContent={rewriterContent}
          initialTitle={rewriterTitle}
        />
      </div>
      
      <Separator className="my-8" />
      
      <div id="homework-helper">
        <HomeworkHelper 
          onSendToAnalysis={handleSendToAnalysis}
          initialContent={homeworkContent}
        />
      </div>
    </div>
  );
}