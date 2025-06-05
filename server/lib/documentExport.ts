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
        // Create RTF format that Word can open properly
        const cleanContent = content
          .replace(/\*\*(.*?)\*\*/g, '{\\b $1}') // Bold
          .replace(/\*(.*?)\*/g, '{\\i $1}') // Italic
          .replace(/^## (.*$)/gim, '{\\fs28\\b $1}\\par\\par') // Headers
          .replace(/^# (.*$)/gim, '{\\fs32\\b $1}\\par\\par') // Main headers
          .replace(/\n\n/g, '\\par\\par') // Paragraph breaks
          .replace(/\n/g, '\\par') // Line breaks
          .replace(/\$/g, '') // Remove math delimiters for now
          .replace(/\{/g, '\\{') // Escape braces
          .replace(/\}/g, '\\}')
          .replace(/\\/g, '\\\\'); // Escape backslashes

        const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24
{\\fs32\\b ${title}}\\par\\par
${cleanContent}
}`;
        return Buffer.from(rtfContent, 'utf8');
        
      case 'pdf':
        // Return clean text content that can be saved as PDF-compatible format
        const pdfContent = content
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
          .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
          .replace(/^## (.*$)/gim, '$1') // Headers
          .replace(/^# (.*$)/gim, '$1') // Main headers
          .replace(/\$/g, '') // Remove math delimiters
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
          
        const finalContent = `${title}\n\n${pdfContent}`;
        return Buffer.from(finalContent, 'utf8');
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting document:', error);
    throw new Error(`Document export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}