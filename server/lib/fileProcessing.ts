import mammoth from 'mammoth';

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

/**
 * Extracts text from a docx file buffer
 * @param buffer - The docx file as a buffer
 * @returns Promise containing the extracted text
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error: unknown) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error(`Failed to extract text from DOCX: ${getErrorMessage(error)}`);
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
  } catch (error: unknown) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${getErrorMessage(error)}`);
  }
}