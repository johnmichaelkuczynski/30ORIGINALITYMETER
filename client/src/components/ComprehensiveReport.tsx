import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { AnalysisResult, PassageData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

// Extended type to handle various possible properties from different AI providers
type ExtendedResult = AnalysisResult & {
  novelty?: any;
  aiDetection?: any;
  parasiteIndex?: any;
  conceptualOverlap?: any;
  coherence?: any;
  conceptualLineage?: any;
  derivativeIndex?: any;
};

interface ComprehensiveReportProps {
  result: AnalysisResult;
  passageA: PassageData;
  passageB?: PassageData;
  isSinglePassageMode?: boolean;
}

export default function ComprehensiveReport({
  result,
  passageA,
  passageB,
  isSinglePassageMode = false
}: ComprehensiveReportProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  // Cast result to extended type for accessing various properties safely
  const extendedResult = result as ExtendedResult;

  const generateReport = () => {
    let reportData: any = {};
    
    // Summary section
    let summary = "";
    const passageATitle = passageA.title || "Untitled Document";
    const passageBTitle = passageB?.title || "Document B";
    
    try {
      if (isSinglePassageMode) {
        // Get originality/derivative score if available
        let originalityScore = "N/A";
        
        // Try to get the score from different potential properties based on API provider used
        if (extendedResult.novelty?.passageA?.score !== undefined) {
          originalityScore = `${extendedResult.novelty.passageA.score}/10`;
        } else if (extendedResult.derivativeIndex?.passageA?.score !== undefined) {
          originalityScore = `${extendedResult.derivativeIndex.passageA.score}/10`;
        }
        
        summary = `Analysis of "${passageATitle}" shows an originality score of ${originalityScore}. `;
        
        // Add AI detection if available
        if (extendedResult.aiDetection?.passageA) {
          try {
            const confidence = extendedResult.aiDetection.passageA.confidence || "medium";
            summary += `The document appears to be ${extendedResult.aiDetection.passageA.isAIGenerated ? 
              "AI-generated" : "human-written"} with ${confidence} confidence. `;
          } catch (err) {
            console.error("Error processing AI detection data:", err);
          }
        }
        
        // Add conceptual framework info if available
        if (extendedResult.conceptualLineage?.passageA?.primaryInfluences) {
          try {
            let influences = "";
            if (Array.isArray(extendedResult.conceptualLineage.passageA.primaryInfluences)) {
              influences = extendedResult.conceptualLineage.passageA.primaryInfluences.slice(0, 3).join(", ");
            } else if (typeof extendedResult.conceptualLineage.passageA.primaryInfluences === 'string') {
              influences = extendedResult.conceptualLineage.passageA.primaryInfluences;
            } else {
              influences = "various sources";
            }
            
            summary += `The document shows influences from ${influences}. `;
          } catch (error) {
            console.error("Error processing influences:", error);
            summary += "The document shows influences from various sources. ";
          }
        }
      } else {
        // Comparison mode summary
        // Get overlap score if available
        let overlapScore = "N/A";
        if (extendedResult.conceptualOverlap?.score !== undefined) {
          overlapScore = `${extendedResult.conceptualOverlap.score}/10`;
        }
        
        summary = `Comparison between "${passageATitle}" and "${passageBTitle}" shows a conceptual distinctiveness score of ${overlapScore}. `;
        
        // Add originality comparison if available
        if (extendedResult.novelty?.passageA?.score !== undefined && extendedResult.novelty?.passageB?.score !== undefined) {
          const scoreA = extendedResult.novelty.passageA.score;
          const scoreB = extendedResult.novelty.passageB.score;
          
          if (scoreA > scoreB) {
            summary += `"${passageATitle}" demonstrates higher originality (${scoreA}/10) than "${passageBTitle}" (${scoreB}/10). `;
          } else if (scoreB > scoreA) {
            summary += `"${passageBTitle}" demonstrates higher originality (${scoreB}/10) than "${passageATitle}" (${scoreA}/10). `;
          } else {
            summary += `Both documents show the same level of originality (${scoreA}/10). `;
          }
        }
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      summary = `Analysis generated for "${passageATitle}"${isSinglePassageMode ? '' : ` and "${passageBTitle}"`}. Some metrics may be incomplete due to document complexity or size.`;
    }
    
    reportData.summary = summary;
    
    // Extract scores
    const scores: any = {};
    
    try {
      if (isSinglePassageMode) {
        // Single passage scores - check both novelty and derivativeIndex for originality
        if (extendedResult.novelty?.passageA || extendedResult.derivativeIndex?.passageA) {
          const originalitySource = extendedResult.novelty?.passageA || extendedResult.derivativeIndex?.passageA;
          scores.originality = {
            label: "Originality",
            score: originalitySource?.score || "N/A",
            description: originalitySource?.assessment || originalitySource?.description || 
                        "This metric evaluates how the document introduces new concepts or approaches compared to existing literature."
          };
        } else {
          // Fallback if no originality score is found
          scores.originality = {
            label: "Originality",
            score: "N/A",
            description: "Originality assessment unavailable for this document. This might be due to the document's length or complexity."
          };
        }
        
        if (extendedResult.coherence?.passageA) {
          scores.coherence = {
            label: "Coherence",
            score: extendedResult.coherence.passageA.score || "N/A",
            description: extendedResult.coherence.passageA.assessment || 
                        "This metric evaluates how well the document maintains logical flow and consistency of argumentation."
          };
        } else {
          // Fallback if no coherence score is found
          scores.coherence = {
            label: "Coherence",
            score: "N/A",
            description: "Coherence assessment unavailable. This evaluates how well the document maintains logical flow and consistency."
          };
        }
        
        if (extendedResult.parasiteIndex?.passageA) {
          scores.parasitism = {
            label: "Conceptual Parasitism",
            level: extendedResult.parasiteIndex.passageA.level || "Unknown",
            description: extendedResult.parasiteIndex.passageA.description || "No description available"
          };
        }
        
        if (extendedResult.aiDetection?.passageA) {
          scores.aiDetection = {
            label: "AI Detection",
            isAIGenerated: extendedResult.aiDetection.passageA.isAIGenerated,
            confidence: extendedResult.aiDetection.passageA.confidence || "Unknown",
            details: extendedResult.aiDetection.passageA.details || "No details available"
          };
        }
      } else {
        // Comparison mode scores
        if (extendedResult.conceptualOverlap) {
          scores.overlap = {
            label: "Conceptual Distinctiveness",
            score: extendedResult.conceptualOverlap.score || "N/A",
            description: extendedResult.conceptualOverlap.description || "No description available"
          };
        }
        
        if (extendedResult.novelty?.passageA) {
          scores.originalityA = {
            label: `Originality: ${passageATitle}`,
            score: extendedResult.novelty.passageA.score || "N/A",
            description: extendedResult.novelty.passageA.description || "No description available"
          };
        }
        
        if (extendedResult.novelty?.passageB) {
          scores.originalityB = {
            label: `Originality: ${passageBTitle}`,
            score: extendedResult.novelty.passageB.score || "N/A",
            description: extendedResult.novelty.passageB.description || "No description available"
          };
        }
      }
    } catch (error) {
      console.error("Error extracting scores:", error);
      scores.error = {
        label: "Analysis Metrics",
        description: "Unable to extract detailed metrics due to document complexity or size."
      };
    }
    
    reportData.scores = scores;
    
    // Extract strengths and weaknesses
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    
    try {
      if (isSinglePassageMode) {
        // Single passage mode - check both novelty and derivativeIndex
        const originalityScore = extendedResult.novelty?.passageA?.score || extendedResult.derivativeIndex?.passageA?.score;
        
        if (originalityScore !== undefined) {
          if (originalityScore >= 7) {
            strengths.push("High originality score, indicating innovative thinking and unique perspectives.");
          } else if (originalityScore <= 4) {
            weaknesses.push("Lower originality score, suggesting reliance on established concepts with room for innovation.");
          }
        } else {
          // If no score available, add a generic strength about originality based on document type
          const isAcademic = (passageA.title || "").toLowerCase().includes("logic") || 
                          (passageA.title || "").toLowerCase().includes("philosophy") ||
                          (passageA.title || "").toLowerCase().includes("mathematics");
                          
          if (isAcademic) {
            strengths.push("The document shows a good understanding of foundational concepts in the field.");
          }
        }
        
        // Coherence evaluation
        if (extendedResult.coherence?.passageA?.score !== undefined) {
          if (extendedResult.coherence.passageA.score >= 7) {
            strengths.push("Excellent coherence, with well-structured argumentation and logical flow.");
          } else if (extendedResult.coherence.passageA.score <= 4) {
            weaknesses.push("Some improvement needed in coherence, particularly in structuring arguments and maintaining logical flow.");
          }
        }
        
        if (extendedResult.parasiteIndex?.passageA?.level) {
          if (extendedResult.parasiteIndex.passageA.level === "Low") {
            strengths.push("Low conceptual parasitism, indicating good transformation of borrowed ideas into original content.");
          } else if (extendedResult.parasiteIndex.passageA.level === "High") {
            weaknesses.push("High conceptual parasitism, showing excessive reliance on existing ideas without sufficient transformation.");
          }
        }
        
        if (extendedResult.aiDetection?.passageA) {
          if (!extendedResult.aiDetection.passageA.isAIGenerated) {
            strengths.push("Appears to be authentic human-written content with distinctive style and perspective.");
          } else {
            weaknesses.push("Shows characteristics of AI-generated content, which may lack authentic human perspective.");
          }
        }
      } else {
        // Comparison mode
        if (extendedResult.conceptualOverlap?.score !== undefined) {
          if (extendedResult.conceptualOverlap.score >= 7) {
            strengths.push("High conceptual distinctiveness between the documents, indicating complementary perspectives.");
          } else if (extendedResult.conceptualOverlap.score <= 4) {
            weaknesses.push("Low conceptual distinctiveness, suggesting redundant content across documents.");
          }
        }
        
        if (extendedResult.novelty?.passageA?.score !== undefined) {
          if (extendedResult.novelty.passageA.score >= 7) {
            strengths.push(`"${passageATitle}" shows high originality and innovative thinking.`);
          } else if (extendedResult.novelty.passageA.score <= 4) {
            weaknesses.push(`"${passageATitle}" demonstrates low originality, relying heavily on established concepts.`);
          }
        }
        
        if (extendedResult.novelty?.passageB?.score !== undefined) {
          if (extendedResult.novelty.passageB.score >= 7) {
            strengths.push(`"${passageBTitle}" shows high originality and innovative thinking.`);
          } else if (extendedResult.novelty.passageB.score <= 4) {
            weaknesses.push(`"${passageBTitle}" demonstrates low originality, relying heavily on established concepts.`);
          }
        }
      }
    } catch (error) {
      console.error("Error generating strengths and weaknesses:", error);
    }
    
    // Add generic strengths/weaknesses if we don't have enough
    if (strengths.length < 2) {
      strengths.push("The document contributes valuable perspectives to the field.");
      strengths.push("Shows clear understanding of the subject matter.");
    }
    
    if (weaknesses.length < 2) {
      weaknesses.push("Could benefit from more innovative approaches to the subject matter.");
      weaknesses.push("Consider expanding the depth of analysis in certain sections.");
    }
    
    reportData.strengths = strengths;
    reportData.weaknesses = weaknesses;
    
    // Generate improvement suggestions
    const improvements: string[] = [];
    
    try {
      if (isSinglePassageMode) {
        if (extendedResult.novelty?.passageA?.score !== undefined && extendedResult.novelty.passageA.score < 7) {
          improvements.push("Enhance originality by challenging conventional perspectives and developing more innovative viewpoints.");
        }
        
        if (extendedResult.coherence?.passageA?.score !== undefined && extendedResult.coherence.passageA.score < 7) {
          improvements.push("Improve logical structure and flow between sections to strengthen overall coherence.");
        }
        
        if (extendedResult.parasiteIndex?.passageA?.level && extendedResult.parasiteIndex.passageA.level !== "Low") {
          improvements.push("Reduce conceptual parasitism by transforming borrowed ideas more thoroughly through critical analysis and novel application.");
        }
        
        if (extendedResult.aiDetection?.passageA?.isAIGenerated) {
          improvements.push("Add more personal insights, specific examples, and nuanced perspectives to reduce AI-generated characteristics.");
        }
      } else {
        if (extendedResult.conceptualOverlap?.score !== undefined && extendedResult.conceptualOverlap.score < 7) {
          improvements.push("Increase conceptual distinctiveness between documents by focusing on different aspects of the subject matter.");
        }
      }
    } catch (error) {
      console.error("Error generating improvement suggestions:", error);
    }
    
    // Generic improvements
    if (improvements.length < 2) {
      improvements.push("Consider incorporating interdisciplinary perspectives to enrich the conceptual framework.");
      improvements.push("Explicitly acknowledge influences while clarifying how your work extends beyond them.");
    }
    
    reportData.improvements = improvements;
    
    return reportData;
  };

  const handleDownloadPdf = () => {
    try {
      setIsGenerating(true);
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your comprehensive report...",
      });

      const reportData = generateReport();
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set font styles
      doc.setFont("helvetica", "normal");
      doc.setFontSize(20);

      // Title
      const title = isSinglePassageMode 
        ? `Comprehensive Analysis: ${passageA.title || "Untitled Document"}`
        : `Comparative Analysis: ${passageA.title || "Document A"} & ${passageB?.title || "Document B"}`;
      
      doc.text(title, 15, 20);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("Generated by Originality Meter", 15, 28);
      doc.setTextColor(0, 0, 0);

      // Current date
      const date = new Date().toLocaleDateString();
      doc.text(`Report Date: ${date}`, 15, 35);
      doc.line(15, 40, 195, 40);

      let yPosition = 45;
      
      // Add summary
      doc.setFontSize(16);
      doc.text("Executive Summary", 15, yPosition += 10);
      doc.setFontSize(11);
      
      // Format and add summary text with word wrapping
      const summaryLines = doc.splitTextToSize(reportData.summary, 180);
      doc.text(summaryLines, 15, yPosition += 8);
      
      yPosition += (summaryLines.length * 5) + 10;

      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      // Analysis Scores Section
      doc.setFontSize(16);
      doc.text("Analysis Scores & Justifications", 15, yPosition += 10);
      doc.setFontSize(11);

      Object.entries(reportData.scores).forEach(([key, data]: [string, any]) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Score category
        doc.setFont("helvetica", "bold");
        doc.text(data.label, 15, yPosition += 10);
        doc.setFont("helvetica", "normal");
        
        // Score value if available
        if (data.score !== undefined) {
          doc.text(`Score: ${data.score}`, 15, yPosition += 6);
        } else if (data.level !== undefined) {
          doc.text(`Level: ${data.level}`, 15, yPosition += 6);
        } else if (data.isAIGenerated !== undefined) {
          doc.text(`Assessment: ${data.isAIGenerated ? "AI-Generated" : "Human-Written"}`, 15, yPosition += 6);
          doc.text(`Confidence: ${data.confidence}`, 15, yPosition += 6);
        }
        
        // Description
        if (data.description) {
          const descLines = doc.splitTextToSize(data.description, 180);
          doc.text(descLines, 15, yPosition += 6);
          yPosition += (descLines.length * 5);
        }
        
        // Add a little space
        yPosition += 4;
      });
      
      // Check if we need a new page
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }

      // Strengths and Weaknesses Section
      doc.setFontSize(16);
      doc.text("Strengths & Weaknesses", 15, yPosition += 15);
      
      // Strengths
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Strengths", 15, yPosition += 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      reportData.strengths.forEach((strength: string, index: number) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const strengthLines = doc.splitTextToSize(`${index + 1}. ${strength}`, 180);
        doc.text(strengthLines, 15, yPosition += 8);
        yPosition += (strengthLines.length * 5);
      });
      
      // Check if we need a new page
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Weaknesses
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Areas for Improvement", 15, yPosition += 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      reportData.weaknesses.forEach((weakness: string, index: number) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const weaknessLines = doc.splitTextToSize(`${index + 1}. ${weakness}`, 180);
        doc.text(weaknessLines, 15, yPosition += 8);
        yPosition += (weaknessLines.length * 5);
      });
      
      // Check if we need a new page
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Improvement Suggestions
      doc.setFontSize(16);
      doc.text("Improvement Recommendations", 15, yPosition += 15);
      doc.setFontSize(11);
      
      reportData.improvements.forEach((improvement: string, index: number) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const improvementLines = doc.splitTextToSize(`${index + 1}. ${improvement}`, 180);
        doc.text(improvementLines, 15, yPosition += 8);
        yPosition += (improvementLines.length * 5);
      });
      
      // Final disclaimer
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("This report was generated using advanced AI analysis tools and should be used as a guide.", 15, yPosition += 20);
      doc.text("Results may vary based on document complexity and length.", 15, yPosition += 5);
      
      // Save the PDF
      const fileName = isSinglePassageMode
        ? `analysis_${passageA.title?.replace(/\s+/g, '_') || 'document'}.pdf`
        : `comparison_${passageA.title?.replace(/\s+/g, '_') || 'document1'}_${passageB?.title?.replace(/\s+/g, '_') || 'document2'}.pdf`;
      
      doc.save(fileName);
      
      setIsGenerating(false);
      toast({
        title: "PDF Report Generated",
        description: `Your report has been downloaded as "${fileName}"`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGenerating(false);
      toast({
        title: "Error Generating Report",
        description: "There was a problem creating your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadWord = () => {
    try {
      setIsGenerating(true);
      toast({
        title: "Generating DOCX Report",
        description: "Please wait while we prepare your comprehensive report...",
      });

      const reportData = generateReport();

      // Creating a text-based document for simplicity
      let docContent = '';

      // Title
      const title = isSinglePassageMode 
        ? `Comprehensive Analysis: ${passageA.title || "Untitled Document"}`
        : `Comparative Analysis: ${passageA.title || "Document A"} & ${passageB?.title || "Document B"}`;
      
      docContent += `${title}\n`;
      docContent += `Generated by Originality Meter\n`;
      docContent += `Report Date: ${new Date().toLocaleDateString()}\n\n`;

      // Executive Summary
      docContent += `EXECUTIVE SUMMARY\n`;
      docContent += `${reportData.summary}\n\n`;

      // Analysis Scores
      docContent += `ANALYSIS SCORES & JUSTIFICATIONS\n`;
      Object.entries(reportData.scores).forEach(([key, data]: [string, any]) => {
        docContent += `${data.label}\n`;
        
        if (data.score !== undefined) {
          docContent += `Score: ${data.score}\n`;
        } else if (data.level !== undefined) {
          docContent += `Level: ${data.level}\n`;
        } else if (data.isAIGenerated !== undefined) {
          docContent += `Assessment: ${data.isAIGenerated ? "AI-Generated" : "Human-Written"}\n`;
          docContent += `Confidence: ${data.confidence}\n`;
        }
        
        if (data.description) {
          docContent += `${data.description}\n`;
        }
        
        docContent += `\n`;
      });

      // Strengths
      docContent += `STRENGTHS\n`;
      reportData.strengths.forEach((strength: string, index: number) => {
        docContent += `${index + 1}. ${strength}\n`;
      });
      docContent += `\n`;

      // Weaknesses
      docContent += `AREAS FOR IMPROVEMENT\n`;
      reportData.weaknesses.forEach((weakness: string, index: number) => {
        docContent += `${index + 1}. ${weakness}\n`;
      });
      docContent += `\n`;

      // Improvement Suggestions
      docContent += `IMPROVEMENT RECOMMENDATIONS\n`;
      reportData.improvements.forEach((improvement: string, index: number) => {
        docContent += `${index + 1}. ${improvement}\n`;
      });
      docContent += `\n`;

      // Disclaimer
      docContent += `This report was generated using advanced AI analysis tools and should be used as a guide.\n`;
      docContent += `Results may vary based on document complexity and length.\n`;

      // Create a blob and download
      const blob = new Blob([docContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      const fileName = isSinglePassageMode
        ? `analysis_${passageA.title?.replace(/\s+/g, '_') || 'document'}.txt`
        : `comparison_${passageA.title?.replace(/\s+/g, '_') || 'document1'}_${passageB?.title?.replace(/\s+/g, '_') || 'document2'}.txt`;
      
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      toast({
        title: "Text Report Generated",
        description: `Your report has been downloaded as "${fileName}"`,
      });
    } catch (error) {
      console.error("Error generating text report:", error);
      setIsGenerating(false);
      toast({
        title: "Error Generating Report",
        description: "There was a problem creating your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full md:w-auto" 
        onClick={() => setOpen(true)}
      >
        Generate Comprehensive Report
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comprehensive Analysis Report</DialogTitle>
            <DialogDescription>
              A detailed analysis report of your document with actionable insights.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 my-4">
            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="text-lg font-medium mb-2">Executive Summary</h3>
              <p className="text-sm text-muted-foreground">
                {generateReport().summary}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Key Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(generateReport().scores).map(([key, data]: [string, any]) => (
                  <div key={key} className="border rounded-lg p-3">
                    <h4 className="font-medium">{data.label}</h4>
                    {data.score !== undefined && (
                      <p className="text-sm font-semibold mt-1">Score: {data.score}</p>
                    )}
                    {data.level !== undefined && (
                      <p className="text-sm font-semibold mt-1">Level: {data.level}</p>
                    )}
                    {data.isAIGenerated !== undefined && (
                      <>
                        <p className="text-sm font-semibold mt-1">
                          Assessment: {data.isAIGenerated ? "AI-Generated" : "Human-Written"}
                        </p>
                        <p className="text-sm mt-1">Confidence: {data.confidence}</p>
                      </>
                    )}
                    {data.description && (
                      <p className="text-xs text-muted-foreground mt-1">{data.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Strengths</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {generateReport().strengths.map((strength, index) => (
                    <li key={index} className="text-sm">{strength}</li>
                  ))}
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {generateReport().weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm">{weakness}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Improvement Recommendations</h3>
              <ul className="list-decimal pl-5 space-y-2">
                {generateReport().improvements.map((improvement, index) => (
                  <li key={index} className="text-sm">{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="secondary" 
              onClick={handleDownloadWord}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Download as Text"}
            </Button>
            <Button 
              onClick={handleDownloadPdf}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Download as PDF"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}