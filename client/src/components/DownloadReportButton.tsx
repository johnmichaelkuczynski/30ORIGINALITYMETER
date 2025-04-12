import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AnalysisResult } from "@/lib/types";
import { generatePdfFromElement, generateReportFromData } from "@/lib/reportGenerator";
import { useToast } from "@/hooks/use-toast";

interface DownloadReportButtonProps {
  result: AnalysisResult;
  passageATitle: string;
  passageBTitle: string;
  resultsContainerId: string;
  isSinglePassageMode?: boolean;
}

export default function DownloadReportButton({
  result,
  passageATitle,
  passageBTitle,
  resultsContainerId,
  isSinglePassageMode = false
}: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const handleVisualDownload = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your report...",
      });
      
      await generatePdfFromElement(
        resultsContainerId,
        passageATitle,
        passageBTitle,
        isSinglePassageMode
      );
      
      toast({
        title: "Download Complete",
        description: "Your analysis report has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate the PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextDownload = () => {
    try {
      setIsGenerating(true);
      toast({
        title: "Generating Text Report",
        description: "Please wait while we prepare your text report...",
      });
      
      generateReportFromData(
        result,
        passageATitle,
        passageBTitle,
        isSinglePassageMode
      );
      
      toast({
        title: "Download Complete",
        description: "Your text report has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating text report:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate the text report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500 border rounded-md px-4 py-2 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span className="font-bold">Download Report</span>
          {isGenerating && (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="cursor-pointer flex items-center" 
          onClick={handleVisualDownload}
          disabled={isGenerating}
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
            <path d="M14 2v6h6"></path>
            <circle cx="12" cy="14" r="4"></circle>
          </svg>
          Visual Report (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer flex items-center" 
          onClick={handleTextDownload}
          disabled={isGenerating}
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
            <path d="M14 2v6h6"></path>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
            <path d="M10 9H8"></path>
          </svg>
          Text-Only Report (PDF)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}