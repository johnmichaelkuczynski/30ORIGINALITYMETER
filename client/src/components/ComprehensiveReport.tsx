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

interface ComprehensiveReportProps {
  result: AnalysisResult;
  passageA: PassageData;
  passageB?: PassageData;
  isSinglePassageMode?: boolean;
}

const ComprehensiveReport: React.FC<ComprehensiveReportProps> = ({
  result,
  passageA,
  passageB,
  isSinglePassageMode = false
}) => {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReport = () => {
    let reportData: any = {};
    
    // Summary section
    let summary = "";
    const passageATitle = passageA.title || "Untitled Document";
    const passageBTitle = passageB?.title || "Document B";
    
    if (isSinglePassageMode) {
      try {
        // Get originality/derivative score if available
        let originalityScore = "N/A";
        
        // Try to get the score from different potential properties based on API provider used
        if (result.novelty?.passageA?.score !== undefined) {
          originalityScore = `${result.novelty.passageA.score}/10`;
        } else if (result.derivativeIndex?.passageA?.score !== undefined) {
          originalityScore = `${result.derivativeIndex.passageA.score}/10`;
        }
        
        summary = `Analysis of "${passageATitle}" shows an originality score of ${originalityScore}. `;
        
        // Add AI detection if available
        if (result.aiDetection?.passageA) {
          try {
            const confidence = result.aiDetection.passageA.confidence || "medium";
            summary += `The document appears to be ${result.aiDetection.passageA.isAIGenerated ? 
              "AI-generated" : "human-written"} with ${confidence} confidence. `;
          } catch (err) {
            console.error("Error processing AI detection data:", err);
          }
        }
        
        // Add conceptual framework info if available
        if (result.conceptualLineage?.passageA?.primaryInfluences) {
          try {
            let influences = "";
            if (Array.isArray(result.conceptualLineage.passageA.primaryInfluences)) {
              influences = result.conceptualLineage.passageA.primaryInfluences.slice(0, 3).join(", ");
            } else if (typeof result.conceptualLineage.passageA.primaryInfluences === 'string') {
              influences = result.conceptualLineage.passageA.primaryInfluences;
            } else {
              influences = "various sources";
            }
            
            summary += `The document shows influences from ${influences}. `;
          } catch (error) {
            console.error("Error processing influences:", error);
            summary += "The document shows influences from various sources. ";
          }
        }
      } catch (err) {
        console.error("Error generating summary for single passage:", err);
        summary = `Analysis of "${passageATitle}" generated incomplete results, possibly due to the large document size. `;
      }
    } else {
      // Comparison mode summary
      // Get overlap score if available
      let overlapScore = "N/A";
      if (result.conceptualOverlap?.score !== undefined) {
        overlapScore = `${result.conceptualOverlap.score}/10`;
      }
      
      summary = `Comparison between "${passageATitle}" and "${passageBTitle}" shows a conceptual distinctiveness score of ${overlapScore}. `;
      
      // Add originality comparison if available
      if (result.novelty?.passageA?.score !== undefined && result.novelty?.passageB?.score !== undefined) {
        const scoreA = result.novelty.passageA.score;
        const scoreB = result.novelty.passageB.score;
        
        if (scoreA > scoreB) {
          summary += `"${passageATitle}" demonstrates higher originality (${scoreA}/10) than "${passageBTitle}" (${scoreB}/10). `;
        } else if (scoreB > scoreA) {
          summary += `"${passageBTitle}" demonstrates higher originality (${scoreB}/10) than "${passageATitle}" (${scoreA}/10). `;
        } else {
          summary += `Both documents show the same level of originality (${scoreA}/10). `;
        }
      }
    }
    
    reportData.summary = summary;
    
    // Extract scores
    const scores: any = {};
    
    if (isSinglePassageMode) {
      // Single passage scores
      if (result.novelty?.passageA) {
        scores.originality = {
          label: "Originality",
          score: result.novelty.passageA.score || "N/A",
          description: result.novelty.passageA.description || "No description available"
        };
      }
      
      if (result.coherence?.passageA) {
        scores.coherence = {
          label: "Coherence",
          score: result.coherence.passageA.score || "N/A",
          description: result.coherence.passageA.description || "No description available"
        };
      }
      
      if (result.parasiteIndex?.passageA) {
        scores.parasitism = {
          label: "Conceptual Parasitism",
          level: result.parasiteIndex.passageA.level || "Unknown",
          description: result.parasiteIndex.passageA.description || "No description available"
        };
      }
      
      if (result.aiDetection?.passageA) {
        scores.aiDetection = {
          label: "AI Detection",
          isAIGenerated: result.aiDetection.passageA.isAIGenerated,
          confidence: result.aiDetection.passageA.confidence || "Unknown",
          details: result.aiDetection.passageA.details || "No details available"
        };
      }
    } else {
      // Comparison mode scores
      if (result.conceptualOverlap) {
        scores.overlap = {
          label: "Conceptual Distinctiveness",
          score: result.conceptualOverlap.score || "N/A",
          description: result.conceptualOverlap.description || "No description available"
        };
      }
      
      if (result.novelty?.passageA) {
        scores.originalityA = {
          label: `Originality: ${passageATitle}`,
          score: result.novelty.passageA.score || "N/A",
          description: result.novelty.passageA.description || "No description available"
        };
      }
      
      if (result.novelty?.passageB) {
        scores.originalityB = {
          label: `Originality: ${passageBTitle}`,
          score: result.novelty.passageB.score || "N/A",
          description: result.novelty.passageB.description || "No description available"
        };
      }
    }
    
    reportData.scores = scores;
    
    // Extract strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    if (isSinglePassageMode) {
      // Single passage mode
      if (result.novelty?.passageA?.score !== undefined) {
        if (result.novelty.passageA.score >= 7) {
          strengths.push("High originality score, indicating innovative thinking and unique perspectives.");
        } else if (result.novelty.passageA.score <= 4) {
          weaknesses.push("Low originality score, suggesting heavy reliance on established concepts with minimal innovation.");
        }
      }
      
      if (result.coherence?.passageA?.score !== undefined) {
        if (result.coherence.passageA.score >= 7) {
          strengths.push("Excellent coherence, with well-structured argumentation and logical flow.");
        } else if (result.coherence.passageA.score <= 4) {
          weaknesses.push("Poor coherence, with structural issues in argumentation and logical flow.");
        }
      }
      
      if (result.parasiteIndex?.passageA?.level) {
        if (result.parasiteIndex.passageA.level === "Low") {
          strengths.push("Low conceptual parasitism, indicating good transformation of borrowed ideas into original content.");
        } else if (result.parasiteIndex.passageA.level === "High") {
          weaknesses.push("High conceptual parasitism, showing excessive reliance on existing ideas without sufficient transformation.");
        }
      }
      
      if (result.aiDetection?.passageA) {
        if (!result.aiDetection.passageA.isAIGenerated) {
          strengths.push("Appears to be authentic human-written content with distinctive style and perspective.");
        } else {
          weaknesses.push("Shows characteristics of AI-generated content, which may lack authentic human perspective.");
        }
      }
    } else {
      // Comparison mode
      if (result.conceptualOverlap?.score !== undefined) {
        if (result.conceptualOverlap.score >= 7) {
          strengths.push("High conceptual distinctiveness between the documents, indicating complementary perspectives.");
        } else if (result.conceptualOverlap.score <= 4) {
          weaknesses.push("Low conceptual distinctiveness, suggesting redundant content across documents.");
        }
      }
      
      if (result.novelty?.passageA?.score !== undefined) {
        if (result.novelty.passageA.score >= 7) {
          strengths.push(`"${passageATitle}" shows high originality and innovative thinking.`);
        } else if (result.novelty.passageA.score <= 4) {
          weaknesses.push(`"${passageATitle}" demonstrates low originality, relying heavily on established concepts.`);
        }
      }
      
      if (result.novelty?.passageB?.score !== undefined) {
        if (result.novelty.passageB.score >= 7) {
          strengths.push(`"${passageBTitle}" shows high originality and innovative thinking.`);
        } else if (result.novelty.passageB.score <= 4) {
          weaknesses.push(`"${passageBTitle}" demonstrates low originality, relying heavily on established concepts.`);
        }
      }
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
    
    if (isSinglePassageMode) {
      if (result.novelty?.passageA?.score !== undefined && result.novelty.passageA.score < 7) {
        improvements.push("Enhance originality by challenging conventional perspectives and developing more innovative viewpoints.");
      }
      
      if (result.coherence?.passageA?.score !== undefined && result.coherence.passageA.score < 7) {
        improvements.push("Improve logical structure and flow between sections to strengthen overall coherence.");
      }
      
      if (result.parasiteIndex?.passageA?.level && result.parasiteIndex.passageA.level !== "Low") {
        improvements.push("Reduce conceptual parasitism by transforming borrowed ideas more thoroughly through critical analysis and novel application.");
      }
      
      if (result.aiDetection?.passageA?.isAIGenerated) {
        improvements.push("Add more personal insights, specific examples, and nuanced perspectives to reduce AI-generated characteristics.");
      }
    } else {
      if (result.conceptualOverlap?.score !== undefined && result.conceptualOverlap.score < 7) {
        improvements.push("Increase conceptual distinctiveness between documents by focusing on different aspects of the subject matter.");
      }
    }
    
    // Generic improvements
    improvements.push("Consider incorporating interdisciplinary perspectives to enrich the conceptual framework.");
    improvements.push("Explicitly acknowledge influences while clarifying how your work extends beyond them.");
    
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
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 150);
        doc.text(data.label, 15, yPosition += 10);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        
        // Score value
        if (data.score !== undefined) {
          doc.text(`Score: ${data.score}/10`, 15, yPosition += 7);
        } else if (data.level !== undefined) {
          doc.text(`Level: ${data.level}`, 15, yPosition += 7);
        } else if (data.isAIGenerated !== undefined) {
          doc.text(`Result: ${data.isAIGenerated ? "Likely AI-generated" : "Likely human-written"} (Confidence: ${data.confidence})`, 15, yPosition += 7);
        }
        
        // Justification
        if (data.description) {
          const justificationLines = doc.splitTextToSize(data.description, 180);
          doc.text(justificationLines, 15, yPosition += 7);
          yPosition += (justificationLines.length - 1) * 5;
        } else if (data.details) {
          const justificationLines = doc.splitTextToSize(data.details, 180);
          doc.text(justificationLines, 15, yPosition += 7);
          yPosition += (justificationLines.length - 1) * 5;
        }
        
        yPosition += 5;
      });

      // Add Strengths & Weaknesses
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      // Strengths Section
      doc.setFontSize(16);
      doc.text("Strengths", 15, yPosition += 15);
      doc.setFontSize(11);
      
      reportData.strengths.forEach((strength: string, i: number) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const strengthLines = doc.splitTextToSize(`• ${strength}`, 180);
        doc.text(strengthLines, 15, yPosition += 8);
        yPosition += (strengthLines.length - 1) * 5;
      });

      // Weaknesses Section
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.text("Weaknesses", 15, yPosition += 15);
      doc.setFontSize(11);
      
      reportData.weaknesses.forEach((weakness: string, i: number) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const weaknessLines = doc.splitTextToSize(`• ${weakness}`, 180);
        doc.text(weaknessLines, 15, yPosition += 8);
        yPosition += (weaknessLines.length - 1) * 5;
      });

      // Improvement Suggestions
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.text("Improvement Suggestions", 15, yPosition += 15);
      doc.setFontSize(11);
      
      reportData.improvements.forEach((improvement: string, i: number) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const improvementLines = doc.splitTextToSize(`${i+1}. ${improvement}`, 180);
        doc.text(improvementLines, 15, yPosition += 8);
        yPosition += (improvementLines.length - 1) * 5;
      });

      // Save the PDF
      const fileName = isSinglePassageMode 
        ? `${passageA.title || "document"}_comprehensive_report.pdf` 
        : `comparative_analysis_report.pdf`;
        
      doc.save(fileName);

      toast({
        title: "Download Complete",
        description: "Your comprehensive report has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadWord = () => {
    try {
      setIsGenerating(true);
      toast({
        title: "Generating Word Document",
        description: "Please wait while we prepare your comprehensive report...",
      });

      const reportData = generateReport();

      // Create HTML content for Word document
      let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Comprehensive Analysis Report</title>
          <style>
            body { font-family: 'Calibri', sans-serif; }
            h1 { color: #2D5B89; font-size: 20pt; }
            h2 { color: #2D5B89; font-size: 16pt; margin-top: 20pt; }
            h3 { color: #5783B4; font-size: 14pt; }
            .subtitle { color: #666666; font-size: 11pt; }
            .date { margin-bottom: 20pt; }
            .score { font-weight: bold; }
            .quote { color: #555; margin-left: 20pt; font-style: italic; }
            .list-item { margin: 8pt 0; }
          </style>
        </head>
        <body>
          <h1>${isSinglePassageMode 
            ? `Comprehensive Analysis: ${passageA.title || "Untitled Document"}`
            : `Comparative Analysis: ${passageA.title || "Document A"} & ${passageB?.title || "Document B"}`}</h1>
          <p class="subtitle">Generated by Originality Meter</p>
          <p class="date">Report Date: ${new Date().toLocaleDateString()}</p>
          
          <h2>Executive Summary</h2>
          <p>${reportData.summary}</p>
          
          <h2>Analysis Scores & Justifications</h2>`;

      // Add scores and justifications
      Object.entries(reportData.scores).forEach(([key, data]: [string, any]) => {
        htmlContent += `<h3>${data.label}</h3>`;
        
        if (data.score !== undefined) {
          htmlContent += `<p class="score">Score: ${data.score}/10</p>`;
        } else if (data.level !== undefined) {
          htmlContent += `<p class="score">Level: ${data.level}</p>`;
        } else if (data.isAIGenerated !== undefined) {
          htmlContent += `<p class="score">Result: ${data.isAIGenerated ? "Likely AI-generated" : "Likely human-written"} (Confidence: ${data.confidence})</p>`;
        }
        
        if (data.description) {
          htmlContent += `<p>${data.description}</p>`;
        } else if (data.details) {
          htmlContent += `<p>${data.details}</p>`;
        }
      });

      // Add strengths
      htmlContent += `<h2>Strengths</h2><ul>`;
      reportData.strengths.forEach((strength: string) => {
        htmlContent += `<li class="list-item">${strength}</li>`;
      });
      htmlContent += `</ul>`;

      // Add weaknesses
      htmlContent += `<h2>Weaknesses</h2><ul>`;
      reportData.weaknesses.forEach((weakness: string) => {
        htmlContent += `<li class="list-item">${weakness}</li>`;
      });
      htmlContent += `</ul>`;

      // Add improvement suggestions
      htmlContent += `<h2>Improvement Suggestions</h2><ol>`;
      reportData.improvements.forEach((improvement: string) => {
        htmlContent += `<li class="list-item">${improvement}</li>`;
      });
      htmlContent += `</ol>`;

      htmlContent += `
        </body>
        </html>`;

      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and click it
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = isSinglePassageMode 
        ? `${passageA.title || "document"}_comprehensive_report.doc` 
        : `comparative_analysis_report.doc`;
        
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "Your comprehensive report has been downloaded as a Word document.",
      });
    } catch (error) {
      console.error("Error generating Word document:", error);
      toast({
        title: "Error",
        description: "Failed to generate Word document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant="outline"
        className="bg-green-600 hover:bg-green-700 text-white border-green-500 border rounded-md px-4 py-2 flex items-center shadow-lg hover:shadow-xl transition-all"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span className="font-medium">View Comprehensive Report</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {isSinglePassageMode 
                ? `Comprehensive Analysis: ${passageA.title || "Untitled Document"}` 
                : `Comparative Analysis: ${passageA.title || "Document A"} & ${passageB?.title || "Document B"}`}
            </DialogTitle>
            <DialogDescription>
              Detailed analysis report with scores, justifications, strengths & weaknesses, and improvement suggestions
            </DialogDescription>
          </DialogHeader>

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="h-10 w-10 border-4 border-t-transparent animate-spin rounded-full"></div>
              <p className="mt-4 text-muted-foreground">Generating report...</p>
            </div>
          ) : (
            <>
              {/* Report content */}
              <div className="space-y-6 p-4">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Executive Summary</h3>
                  <p className="text-base leading-relaxed">{generateReport().summary}</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Analysis Scores & Justifications</h3>
                  <div className="space-y-4">
                    {Object.entries(generateReport().scores).map(([key, data]: [string, any]) => (
                      <div key={key} className="border rounded-lg p-4 bg-slate-50">
                        <h4 className="text-lg font-semibold text-blue-700">{data.label}</h4>
                        
                        {data.score !== undefined && (
                          <p className="font-medium my-2">Score: {data.score}/10</p>
                        )}
                        
                        {data.level !== undefined && (
                          <p className="font-medium my-2">Level: {data.level}</p>
                        )}
                        
                        {data.isAIGenerated !== undefined && (
                          <p className="font-medium my-2">
                            Result: {data.isAIGenerated ? "Likely AI-generated" : "Likely human-written"} 
                            (Confidence: {data.confidence})
                          </p>
                        )}
                        
                        {data.description && (
                          <p className="text-base">{data.description}</p>
                        )}
                        
                        {data.details && (
                          <p className="text-base">{data.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-green-700">Strengths</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      {generateReport().strengths.map((strength: string, i: number) => (
                        <li key={i} className="text-base leading-relaxed">{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-red-700">Weaknesses</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      {generateReport().weaknesses.map((weakness: string, i: number) => (
                        <li key={i} className="text-base leading-relaxed">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Improvement Suggestions</h3>
                  <ol className="space-y-2 list-decimal pl-5">
                    {generateReport().improvements.map((improvement: string, i: number) => (
                      <li key={i} className="text-base leading-relaxed">{improvement}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}

          <DialogFooter className="flex justify-between items-center mt-4">
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="flex items-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <rect x="8" y="12" width="8" height="2"></rect>
                </svg>
                Download as PDF
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDownloadWord}
                disabled={isGenerating}
                className="flex items-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M16 13H8"></path>
                  <path d="M16 17H8"></path>
                  <path d="M10 9H8"></path>
                </svg>
                Download as Word
              </Button>
            </div>
            
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComprehensiveReport;