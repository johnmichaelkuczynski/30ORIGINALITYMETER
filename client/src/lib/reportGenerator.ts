import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResult } from './types';

/**
 * Generates a formatted PDF title for the download
 */
const generateReportTitle = (passageATitle: string, passageBTitle: string, isSingleMode: boolean): string => {
  if (isSingleMode) {
    const title = passageATitle || 'Passage';
    return `${title}-Analysis-${new Date().toLocaleDateString().replace(/\//g, '-')}`;
  } else {
    const titleA = passageATitle || 'PassageA';
    const titleB = passageBTitle || 'PassageB';
    return `${titleA}-vs-${titleB}-Analysis-${new Date().toLocaleDateString().replace(/\//g, '-')}`;
  }
};

/**
 * Generate a PDF from the entire results section
 */
export const generatePdfFromElement = async (
  elementId: string, 
  passageATitle: string, 
  passageBTitle: string,
  isSingleMode: boolean
): Promise<void> => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error('Element not found:', elementId);
    throw new Error('Could not find element to convert to PDF');
  }
  
  try {
    // Generate the canvas from the element
    const canvas = await html2canvas(element, {
      scale: 1.5, // Higher resolution
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Calculate the PDF dimensions based on the canvas
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create new PDF with A4 dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    
    // Add title and header 
    pdf.setFontSize(16);
    pdf.setTextColor(44, 62, 80);
    
    const title = isSingleMode 
      ? `Semantic Analysis: ${passageATitle || 'Passage'}`
      : `Semantic Comparison: ${passageATitle || 'Passage A'} vs ${passageBTitle || 'Passage B'}`;
      
    pdf.text(title, 15, 15);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 15, 22);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, 25, 195, 25);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    // Add content - handle pagination if content doesn't fit on one page
    let heightLeft = imgHeight;
    let currentPage = 1;
    position = 30; // Start below the header
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth - 20, imgHeight);
    heightLeft -= (pageHeight - position);
    
    // Add subsequent pages if needed
    while (heightLeft > 0) {
      currentPage++;
      position = 10; // Reset position for the new page
      pdf.addPage();
      pdf.setPage(currentPage);
      pdf.addImage(imgData, 'PNG', 10, position - imgHeight + (pageHeight - position), imgWidth - 20, imgHeight);
      heightLeft -= (pageHeight - position);
    }
    
    // Save the PDF with a formatted name
    const fileName = generateReportTitle(passageATitle, passageBTitle, isSingleMode);
    pdf.save(`${fileName}.pdf`);
    
  } catch (err: unknown) {
    // Type guard for Error objects
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Generate a text-only PDF report from analysis data
 */
export const generateReportFromData = (
  result: AnalysisResult,
  passageATitle: string,
  passageBTitle: string,
  isSingleMode: boolean
): void => {
  const pdf = new jsPDF();
  
  // Set up document
  pdf.setFontSize(22);
  pdf.setTextColor(44, 62, 80);
  
  const title = isSingleMode 
    ? `Semantic Analysis Report: ${passageATitle || 'Your Passage'}`
    : `Semantic Comparison Report: ${passageATitle || 'Passage A'} vs ${passageBTitle || 'Passage B'}`;
  
  pdf.text(title, 20, 20, { maxWidth: 180 });
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, 30);
  
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, 35, 190, 35);
  
  let yPosition = 45;
  const lineHeight = 7;
  
  // Add section headers and content
  const addSection = (heading: string, content: string) => {
    // Check if we need a new page
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(14);
    pdf.setTextColor(44, 62, 80);
    pdf.text(heading, 20, yPosition);
    yPosition += lineHeight;
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    // Wrap text content
    const textLines = pdf.splitTextToSize(content, 170);
    pdf.text(textLines, 20, yPosition);
    yPosition += (textLines.length * 5) + 5;
  };
  
  // Verdict section
  addSection('VERDICT', result.verdict);
  
  // Conceptual Lineage
  addSection('CONCEPTUAL LINEAGE', 
    `${passageATitle || 'Passage A'}: ${result.conceptualLineage.passageA.primaryInfluences}\n\n` +
    `${passageATitle || 'Passage A'} Trajectory: ${result.conceptualLineage.passageA.intellectualTrajectory}\n\n` +
    (isSingleMode ? `Baseline: ${result.conceptualLineage.passageB.primaryInfluences}` :
    `${passageBTitle || 'Passage B'}: ${result.conceptualLineage.passageB.primaryInfluences}\n\n` +
    `${passageBTitle || 'Passage B'} Trajectory: ${result.conceptualLineage.passageB.intellectualTrajectory}`));
  
  // Semantic Distance
  addSection('SEMANTIC DISTANCE',
    `${passageATitle || 'Passage A'}: ${result.semanticDistance.passageA.distance}/100 - ${result.semanticDistance.passageA.label}\n\n` +
    (isSingleMode ? `Baseline: ${result.semanticDistance.passageB.distance}/100 - ${result.semanticDistance.passageB.label}` :
    `${passageBTitle || 'Passage B'}: ${result.semanticDistance.passageB.distance}/100 - ${result.semanticDistance.passageB.label}`));
  
  // Key Findings
  addSection('KEY FINDINGS', result.semanticDistance.keyFindings.join('\n• '));
  
  // Semantic Innovation
  addSection('SEMANTIC INNOVATION', result.semanticDistance.semanticInnovation);
  
  // Derivative Index
  addSection('DERIVATIVE INDEX',
    `${passageATitle || 'Passage A'} Score: ${result.derivativeIndex.passageA.score}/10\n` +
    `- Conceptual Innovation: ${result.derivativeIndex.passageA.components.find(c => c.name === "Conceptual Innovation")?.score || 0}/10\n` +
    `- Methodological Novelty: ${result.derivativeIndex.passageA.components.find(c => c.name === "Methodological Novelty")?.score || 0}/10\n` +
    `- Contextual Application: ${result.derivativeIndex.passageA.components.find(c => c.name === "Contextual Application")?.score || 0}/10\n\n` +
    (isSingleMode ? `Baseline Score: ${result.derivativeIndex.passageB.score}/10` :
    `${passageBTitle || 'Passage B'} Score: ${result.derivativeIndex.passageB.score}/10\n` +
    `- Conceptual Innovation: ${result.derivativeIndex.passageB.components.find(c => c.name === "Conceptual Innovation")?.score || 0}/10\n` +
    `- Methodological Novelty: ${result.derivativeIndex.passageB.components.find(c => c.name === "Methodological Novelty")?.score || 0}/10\n` +
    `- Contextual Application: ${result.derivativeIndex.passageB.components.find(c => c.name === "Contextual Application")?.score || 0}/10`));
  
  // Conceptual Parasite
  addSection('CONCEPTUAL PARASITE DETECTION',
    `${passageATitle || 'Passage A'} Level: ${result.conceptualParasite.passageA.level}\n` +
    `Assessment: ${result.conceptualParasite.passageA.assessment}\n\n` +
    (isSingleMode ? `Baseline Level: ${result.conceptualParasite.passageB.level}\n` +
    `Baseline Assessment: ${result.conceptualParasite.passageB.assessment}` :
    `${passageBTitle || 'Passage B'} Level: ${result.conceptualParasite.passageB.level}\n` +
    `Assessment: ${result.conceptualParasite.passageB.assessment}`));
  
  // Save the PDF
  const fileName = generateReportTitle(passageATitle, passageBTitle, isSingleMode);
  pdf.save(`${fileName}.pdf`);
};