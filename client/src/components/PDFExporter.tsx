import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface PDFExporterProps {
  elementId: string;
  filename?: string;
  title?: string;
}

export default function PDFExporter({ 
  elementId, 
  filename = "document",
  title = "Export PDF"
}: PDFExporterProps) {
  
  const exportToPDF = async () => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID '${elementId}' not found`);
      return;
    }

    // Configure html2pdf options for math rendering
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // Wait a moment for any math rendering to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Button 
      onClick={exportToPDF}
      variant="outline"
      className="flex items-center gap-2"
    >
      <FileText className="w-4 h-4" />
      {title}
    </Button>
  );
}