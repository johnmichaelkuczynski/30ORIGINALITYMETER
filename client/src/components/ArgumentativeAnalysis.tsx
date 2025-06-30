import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PassageData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Gavel, Download, Mail, MessageCircle, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import ArgumentativeResults from "./ArgumentativeResults";

interface ArgumentativeAnalysisProps {
  passageA: PassageData;
  passageB?: PassageData;
  passageATitle: string;
  passageBTitle?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ArgumentativeAnalysis({
  passageA,
  passageB,
  passageATitle,
  passageBTitle = ""
}: ArgumentativeAnalysisProps) {
  const [result, setResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { toast } = useToast();

  const isSingleMode = !passageB;

  const runArgumentativeAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze/argumentative", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          passageA,
          passageB: passageB || null,
          provider: "deepseek"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast({
          title: "Analysis Complete",
          description: isSingleMode 
            ? "Cogency analysis completed successfully" 
            : "Comparative analysis completed successfully",
        });
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch("/api/download-argumentative-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result,
          passageATitle,
          passageBTitle,
          isSingleMode
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `argumentative-analysis-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Report Downloaded",
          description: "Your analysis report has been downloaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the report",
        variant: "destructive",
      });
    }
  };

  const emailReport = async () => {
    try {
      const response = await fetch("/api/email-argumentative-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result,
          passageATitle,
          passageBTitle,
          isSingleMode,
          email: emailAddress
        }),
      });

      if (response.ok) {
        toast({
          title: "Report Emailed",
          description: `Analysis report sent to ${emailAddress}`,
        });
        setEmailAddress("");
      }
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Could not send the report",
        variant: "destructive",
      });
    }
  };

  const askQuestionAboutAnalysis = async () => {
    if (!currentQuestion.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentQuestion
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    setCurrentQuestion("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentQuestion,
          context: `Here is the argumentative analysis result: ${JSON.stringify(result)}`,
          provider: "deepseek"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      toast({
        title: "Chat Failed",
        description: "Could not get a response",
        variant: "destructive",
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  // Show loading state while analyzing
  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            {isSingleMode ? 'Analyzing Cogency...' : 'Comparing Arguments...'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isSingleMode 
                ? 'Evaluating argumentative strength and cogency...'
                : 'Comparing argumentative effectiveness between the two papers...'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show results if analysis is complete
  if (result) {
    return (
      <div className="space-y-6">
        <ArgumentativeResults
          result={result}
          isSingleMode={isSingleMode}
          passageATitle={passageATitle}
          passageBTitle={passageBTitle}
        />

        {/* Download and Email Actions */}
        <div className="flex gap-4 mt-6">
          <Button 
            onClick={downloadReport}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-64"
            />
            <Button 
              onClick={emailReport}
              className="flex items-center gap-2"
              disabled={!emailAddress}
            >
              <Mail className="h-4 w-4" />
              Email Report
            </Button>
          </div>
        </div>

        {/* Chat Interface for discussing results */}
        {chatMessages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Discussion About Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full rounded border p-4 mb-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`mb-3 p-3 rounded ${
                    msg.role === 'user' 
                      ? 'bg-blue-50 ml-8' 
                      : 'bg-gray-50 mr-8'
                  }`}>
                    <div className="font-medium text-xs mb-1">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="text-sm whitespace-pre-line">{msg.content}</div>
                  </div>
                ))}
              </ScrollArea>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask a question about the analysis..."
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  className="flex-1"
                  disabled={isChatLoading}
                />
                <Button 
                  onClick={askQuestionAboutAnalysis}
                  disabled={!currentQuestion.trim() || isChatLoading}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isChatLoading ? 'Sending...' : 'Ask'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start chat button if no messages */}
        {chatMessages.length === 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Discuss This Analysis</h3>
                  <p className="text-sm text-gray-600">Ask questions or get clarification about the results</p>
                </div>
                <Button 
                  onClick={() => {
                    setCurrentQuestion("Can you explain the scoring in more detail?");
                    askQuestionAboutAnalysis();
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Start Discussion
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Analysis not started yet
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          Cogency Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            {isSingleMode 
              ? 'Test the cogency of this document by evaluating how well it proves what it sets out to prove, analyzing argument strength, evidence quality, and logical coherence.'
              : 'Test and compare the cogency of both documents to determine which makes its case better through comprehensive evaluation of argumentative strength and proof quality.'
            }
          </p>
          <Button 
            onClick={runArgumentativeAnalysis}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <Gavel className="h-4 w-4" />
            {isAnalyzing ? 'Testing...' : 'Cogency Test'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}