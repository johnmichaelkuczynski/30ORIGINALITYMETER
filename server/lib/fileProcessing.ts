import mammoth from 'mammoth';

/**
 * Extracts text from a docx file buffer
 * @param buffer - The docx file as a buffer
 * @returns Promise containing the extracted text
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error: any) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Process a file and extract its text content based on file type
 * @param buffer - File buffer
 * @param fileType - The file extension/type (e.g., 'txt', 'docx')
 * @returns Promise containing the extracted text
 */
export async function processFile(buffer: Buffer, fileType: string): Promise<string> {
  if (!buffer) {
    throw new Error('No file data provided');
  }

  try {
    switch (fileType.toLowerCase()) {
      case 'txt':
        return buffer.toString('utf-8');
      case 'docx':
        return await extractTextFromDocx(buffer);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error: any) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message || 'Unknown error'}`);
  }
}