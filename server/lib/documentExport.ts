import fs from 'fs';
import path from 'path';
import os from 'os';

export interface ExportRequest {
  content: string;
  format: 'word' | 'pdf' | 'txt' | 'html';
  title: string;
}

/**
 * Converts LaTeX math notation to HTML for display
 * @param content - Content with LaTeX math notation
 * @returns HTML content with rendered math
 */
function convertMathToHTML(content: string): string {
  // Convert inline math $...$ to HTML with MathJax
  let htmlContent = content.replace(/\$([^$]+)\$/g, '<span class="math-inline">\\($1\\)</span>');
  
  // Convert display math $$...$$ to HTML with MathJax
  htmlContent = htmlContent.replace(/\$\$([^$]+)\$\$/g, '<div class="math-display">\\[$1\\]</div>');
  
  // Convert line breaks to HTML
  htmlContent = htmlContent.replace(/\n/g, '<br>');
  
  return htmlContent;
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
        // For TXT, convert LaTeX to plain text approximations
        let txtContent = content
          .replace(/\$\$([^$]+)\$\$/g, '\n\n[$1]\n\n') // Display math
          .replace(/\$([^$]+)\$/g, '[$1]') // Inline math
          .replace(/<[^>]*>/g, '') // Remove any HTML tags
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        
        return Buffer.from(txtContent, 'utf8');
        
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
        ${convertMathToHTML(content)}
    </div>
</body>
</html>`;
        return Buffer.from(htmlTemplate, 'utf8');
        
      case 'word':
        // Create a basic DOCX structure with math support
        const wordContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:pPr>
                <w:pStyle w:val="Title"/>
            </w:pPr>
            <w:r>
                <w:t>${title}</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t xml:space="preserve">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>`;
        return Buffer.from(wordContent, 'utf8');
        
      case 'pdf':
        // For now, return HTML that can be converted to PDF client-side
        const pdfHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.6; 
            padding: 40px; 
            background: white;
        }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${convertMathToHTML(content)}
</body>
</html>`;
        return Buffer.from(pdfHtml, 'utf8');
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting document:', error);
    throw new Error(`Document export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}