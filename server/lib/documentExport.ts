import fs from 'fs';
import path from 'path';
import os from 'os';
import { jsPDF } from 'jspdf';

export interface ExportRequest {
  content: string;
  format: 'word' | 'pdf' | 'txt' | 'html';
  title: string;
}

/**
 * Converts markdown and LaTeX math notation to HTML for display
 * @param content - Content with markdown and LaTeX math notation
 * @returns HTML content with rendered formatting and math
 */
function convertMarkdownToHTML(content: string): string {
  let htmlContent = content;
  
  // Convert bold markdown **text** to <strong>
  htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic markdown *text* to <em>
  htmlContent = htmlContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert headers
  htmlContent = htmlContent.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  htmlContent = htmlContent.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  htmlContent = htmlContent.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Convert inline math $...$ to HTML with MathJax
  htmlContent = htmlContent.replace(/\$([^$]+)\$/g, '<span class="math-inline">\\($1\\)</span>');
  
  // Convert display math $$...$$ to HTML with MathJax
  htmlContent = htmlContent.replace(/\$\$([^$]+)\$\$/g, '<div class="math-display">\\[$1\\]</div>');
  
  // Convert double line breaks to paragraphs
  htmlContent = htmlContent.replace(/\n\n/g, '</p><p>');
  htmlContent = `<p>${htmlContent}</p>`;
  
  // Convert single line breaks to <br>
  htmlContent = htmlContent.replace(/\n/g, '<br>');
  
  // Clean up empty paragraphs
  htmlContent = htmlContent.replace(/<p><\/p>/g, '');
  htmlContent = htmlContent.replace(/<p><br><\/p>/g, '');
  
  return htmlContent;
}

/**
 * Converts markdown to plain text for non-HTML formats
 * @param content - Content with markdown formatting
 * @returns Plain text with markdown removed
 */
function convertMarkdownToPlainText(content: string): string {
  let plainText = content;
  
  // Remove bold and italic markdown
  plainText = plainText.replace(/\*\*(.*?)\*\*/g, '$1');
  plainText = plainText.replace(/\*(.*?)\*/g, '$1');
  
  // Convert headers to plain text with extra spacing
  plainText = plainText.replace(/^### (.*$)/gim, '\n$1\n');
  plainText = plainText.replace(/^## (.*$)/gim, '\n$1\n');
  plainText = plainText.replace(/^# (.*$)/gim, '\n$1\n');
  
  // Clean up math notation for plain text
  plainText = plainText.replace(/\$\$([^$]+)\$\$/g, '\n\n[$1]\n\n');
  plainText = plainText.replace(/\$([^$]+)\$/g, '[$1]');
  
  return plainText;
}

/**
 * Parse HTML content and format it for PDF output
 * @param htmlContent - HTML content to parse
 * @param doc - jsPDF document instance
 * @param startY - Starting Y position
 * @param pageWidth - Page width
 * @returns Updated Y position
 */
function parseHTMLForPDF(htmlContent: string, doc: any, startY: number, pageWidth: number): number {
  let yPosition = startY;
  const leftMargin = 20;
  const rightMargin = 20;
  const textWidth = pageWidth - leftMargin - rightMargin;
  
  // Strip HTML tags but preserve structure
  let content = htmlContent;
  
  // Handle headings
  content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (match, text) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const lines = doc.splitTextToSize(text.trim(), textWidth);
    doc.text(lines, leftMargin, yPosition);
    yPosition += lines.length * 12 + 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    return '';
  });
  
  content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (match, text) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    const lines = doc.splitTextToSize(text.trim(), textWidth);
    doc.text(lines, leftMargin, yPosition);
    yPosition += lines.length * 10 + 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    return '';
  });
  
  content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (match, text) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const lines = doc.splitTextToSize(text.trim(), textWidth);
    doc.text(lines, leftMargin, yPosition);
    yPosition += lines.length * 9 + 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    return '';
  });
  
  // Handle metric boxes with special formatting
  content = content.replace(/<div class="metric"[^>]*>([\s\S]*?)<\/div>/g, (match, text) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Add background-like effect with border
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    
    const boxStartY = yPosition;
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const lines = doc.splitTextToSize(cleanText, textWidth - 10);
    const boxHeight = lines.length * 6 + 10;
    
    // Draw box
    doc.rect(leftMargin - 2, boxStartY - 3, textWidth + 4, boxHeight);
    
    // Add text inside box
    doc.text(lines, leftMargin + 3, yPosition + 3);
    yPosition += boxHeight + 5;
    
    return '';
  });
  
  // Handle quote boxes
  content = content.replace(/<div class="quote"[^>]*>([\s\S]*?)<\/div>/g, (match, text) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont('helvetica', 'italic');
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const lines = doc.splitTextToSize(cleanText, textWidth - 20);
    
    // Add quote formatting
    doc.setDrawColor(220, 50, 50);
    doc.setLineWidth(2);
    doc.line(leftMargin, yPosition, leftMargin, yPosition + lines.length * 6);
    
    doc.text(lines, leftMargin + 10, yPosition + 3);
    yPosition += lines.length * 6 + 8;
    doc.setFont('helvetica', 'normal');
    
    return '';
  });
  
  // Handle recommendation boxes
  content = content.replace(/<div class="recommendation"[^>]*>([\s\S]*?)<\/div>/g, (match, text) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const lines = doc.splitTextToSize(cleanText, textWidth - 10);
    
    // Add green left border for recommendations
    doc.setDrawColor(40, 170, 96);
    doc.setLineWidth(3);
    doc.line(leftMargin, yPosition, leftMargin, yPosition + lines.length * 6);
    
    doc.text(lines, leftMargin + 8, yPosition + 3);
    yPosition += lines.length * 6 + 8;
    
    return '';
  });
  
  // Handle score boxes
  content = content.replace(/<div class="score-box"[^>]*>([\s\S]*?)<\/div>/g, (match, text) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFillColor(236, 240, 241);
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const lines = doc.splitTextToSize(cleanText, textWidth - 10);
    const boxHeight = lines.length * 6 + 8;
    
    // Draw filled box
    doc.rect(leftMargin - 2, yPosition - 2, textWidth + 4, boxHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text(lines, leftMargin + 3, yPosition + 3);
    doc.setFont('helvetica', 'normal');
    yPosition += boxHeight + 5;
    
    return '';
  });
  
  // Remove remaining HTML tags and add remaining content as paragraphs
  content = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (content.length > 0) {
    const paragraphs = content.split(/\n\s*\n/);
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length === 0) continue;
      
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const lines = doc.splitTextToSize(paragraph.trim(), textWidth);
      doc.text(lines, leftMargin, yPosition);
      yPosition += lines.length * 6 + 8;
    }
  }
  
  return yPosition;
}

/**
 * Exports document content in the specified format
 * @param request - Export request parameters
 * @returns Buffer containing the exported document
 */
export async function exportDocument(request: ExportRequest): Promise<Buffer> {
  const { content, format, title } = request;
  
  try {
    switch (format) {
      case 'txt':
        // For text format, preserve the original content structure if it's already plain text
        const txtContent = content.includes('<') ? convertMarkdownToPlainText(content) : content;
        return Buffer.from(`${title}\n${'='.repeat(title.length)}\n\n${txtContent}`, 'utf8');
        
      case 'html':
        const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <script>
        window.MathJax = {
            tex: {
                inlineMath: [['\\\\(', '\\\\)']],
                displayMath: [['\\\\[', '\\\\]']]
            }
        };
    </script>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .math-display {
            text-align: center;
            margin: 20px 0;
        }
        .math-inline {
            display: inline;
        }
        h1, h2, h3 {
            color: #333;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="content">
        ${convertMarkdownToHTML(content)}
    </div>
</body>
</html>`;
        return Buffer.from(htmlTemplate, 'utf8');
        
      case 'word':
        // Create a simple DOCX-compatible format using HTML
        const htmlForWord = convertMarkdownToHTML(content);
        const wordDocument = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; }
    h1 { color: #000; font-size: 24px; }
    h2 { color: #000; font-size: 20px; }
    h3 { color: #000; font-size: 16px; }
    p { margin: 12px 0; }
    strong { font-weight: bold; }
    em { font-style: italic; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div>${htmlForWord}</div>
</body>
</html>`;
        return Buffer.from(wordDocument, 'utf8');
        
      case 'pdf':
        // Generate actual PDF using jsPDF with HTML parsing
        const doc = new jsPDF();
        
        // Set up fonts and initial position
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        
        // Add title
        const pageWidth = doc.internal.pageSize.getWidth();
        const titleLines = doc.splitTextToSize(title, pageWidth - 40);
        doc.setFont('helvetica', 'bold');
        doc.text(titleLines, 20, 30);
        
        let yPosition = 30 + (titleLines.length * 10) + 15; // Start below title
        
        // Handle plain text content properly for PDF
        if (content.includes('<')) {
          // HTML content - parse with existing function
          parseHTMLForPDF(content, doc, yPosition, pageWidth);
        } else {
          // Plain text content - format directly for PDF
          const leftMargin = 20;
          const rightMargin = 20;
          const textWidth = pageWidth - leftMargin - rightMargin;
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(12);
          
          // Split content into sections by double line breaks
          const sections = content.split(/\n\s*\n/);
          
          for (const section of sections) {
            if (section.trim().length === 0) continue;
            
            // Check for section headers (lines with = or - underneath)
            const lines = section.split('\n');
            let isHeader = false;
            
            if (lines.length >= 2 && (lines[1].match(/^=+$/) || lines[1].match(/^-+$/))) {
              // This is a header
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }
              
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(lines[1].match(/^=+$/) ? 16 : 14);
              const headerLines = doc.splitTextToSize(lines[0].trim(), textWidth);
              doc.text(headerLines, leftMargin, yPosition);
              yPosition += headerLines.length * 8 + 10;
              
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);
              isHeader = true;
              
              // Process remaining lines if any
              if (lines.length > 2) {
                const remainingText = lines.slice(2).join('\n').trim();
                if (remainingText) {
                  const remainingLines = doc.splitTextToSize(remainingText, textWidth);
                  if (yPosition + remainingLines.length * 6 > 280) {
                    doc.addPage();
                    yPosition = 20;
                  }
                  doc.text(remainingLines, leftMargin, yPosition);
                  yPosition += remainingLines.length * 6 + 8;
                }
              }
            } else {
              // Regular text paragraph
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }
              
              const textLines = doc.splitTextToSize(section.trim(), textWidth);
              doc.text(textLines, leftMargin, yPosition);
              yPosition += textLines.length * 6 + 8;
            }
          }
        }
        
        // Convert to buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        return pdfBuffer;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting document:', error);
    throw new Error(`Document export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}