import fs from 'fs';
import path from 'path';
import os from 'os';

// Check for AssemblyAI API key
const apiKey = process.env.ASSEMBLYAI_API_KEY;
console.log("AssemblyAI API Key status:", apiKey ? "Present" : "Missing");

interface TranscriptionResponse {
  id: string;
  status: string;
  text: string;
  error?: string;
}

/**
 * Transcribes audio using AssemblyAI's API
 * @param audioBuffer - Audio file as a buffer
 * @returns Promise containing the transcribed text
 */
export async function transcribeAudioWithAssemblyAI(audioBuffer: Buffer): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("AssemblyAI API key is not configured");
    }

    console.log('Beginning AssemblyAI transcription...');
    
    // Step 1: Upload the audio file to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
      },
      body: audioBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload audio: ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    const audioUrl = uploadData.upload_url;
    
    console.log('Audio uploaded successfully, audio URL:', audioUrl);

    // Step 2: Start the transcription
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: 'en',
      }),
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      throw new Error(`Failed to start transcription: ${errorText}`);
    }

    const transcriptData = await transcriptResponse.json();
    const transcriptId = transcriptData.id;
    
    console.log('Transcription started, transcript ID:', transcriptId);

    // Step 3: Poll the transcription status until it's done
    let transcriptResult: TranscriptionResponse | null = null;
    
    // Maximum 60 seconds of polling (120 attempts * 500ms)
    for (let i = 0; i < 120; i++) {
      const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
        },
      });

      if (!pollingResponse.ok) {
        const errorText = await pollingResponse.text();
        throw new Error(`Failed to poll transcription: ${errorText}`);
      }

      const pollingData = await pollingResponse.json() as TranscriptionResponse;
      
      if (pollingData.status === 'completed') {
        transcriptResult = pollingData;
        break;
      } else if (pollingData.status === 'error') {
        throw new Error(`Transcription error: ${pollingData.error}`);
      }

      // Wait 500ms before polling again
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!transcriptResult) {
      throw new Error('Transcription timed out');
    }

    console.log('AssemblyAI transcription completed successfully');
    return transcriptResult.text;
  } catch (error) {
    console.error('Error in AssemblyAI transcription:', error);
    throw error;
  }
}

/**
 * Process an audio file from a multipart/form-data request
 * @param file - The file from the request
 * @returns Promise containing the transcribed text
 */
export async function processAudioFile(file: Express.Multer.File): Promise<string> {
  try {
    // Transcribe the audio content
    const transcribedText = await transcribeAudioWithAssemblyAI(file.buffer);
    return transcribedText;
  } catch (error) {
    console.error('Error processing audio file:', error);
    throw error;
  }
}