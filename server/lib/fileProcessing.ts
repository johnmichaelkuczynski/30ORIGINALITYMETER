import mammoth from 'mammoth';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
// Will use dynamic import for pdf-parse when needed

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
 * Extracts text from a PDF file buffer
 * @param buffer - The PDF file as a buffer
 * @returns Promise containing the extracted text
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    console.log('Beginning PDF text extraction...');
    
    // Create a modified version of the pdf-parse options to avoid looking for test files
    const options = {
      // Skip the first page
      pagerender: function(pageData: any) {
        return Promise.resolve(""); 
      },
      max: 0, // 0 = unlimited
      version: 'v1.10.100'
    };
    
    // Use a direct require approach to avoid ESM issues
    const pdfParse = await import('pdf-parse/lib/pdf-parse.js');
    
    // Use pdf-parse with our custom options
    const data = await pdfParse.default(buffer, options);
    
    console.log('PDF text extraction completed successfully');
    return data.text;
  } catch (error: unknown) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${getErrorMessage(error)}`);
  }
}

/**
 * Transcribes audio from an MP3 file buffer using OpenAI's Whisper model
 * @param buffer - The MP3 file as a buffer
 * @returns Promise containing the transcribed text
 */
export async function transcribeAudioFromMp3(buffer: Buffer): Promise<string> {
  try {
    console.log('Beginning MP3 transcription...');
    
    // Create a temporary file to store the MP3 data
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `temp-${Date.now()}.mp3`);
    
    // Write the buffer to the temp file
    fs.writeFileSync(tempFilePath, buffer);
    
    // Create a readable stream from the temp file
    const fileStream = fs.createReadStream(tempFilePath);
    
    // Transcribe the audio using OpenAI's Audio API
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
    });
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    
    console.log('MP3 transcription completed successfully');
    return transcription.text;
  } catch (error: unknown) {
    console.error('Error transcribing MP3:', error);
    throw new Error(`Failed to transcribe audio: ${getErrorMessage(error)}`);
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
      case 'pdf':
        return await extractTextFromPdf(buffer);
      case 'mp3':
        return await transcribeAudioFromMp3(buffer);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error: unknown) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${getErrorMessage(error)}`);
  }
}