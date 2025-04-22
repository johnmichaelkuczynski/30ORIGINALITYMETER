import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, StopCircle } from 'lucide-react';
import RecordRTC from 'recordrtc';
import { toast } from '@/hooks/use-toast';

interface VoiceDictationProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceDictation({
  onTranscriptionComplete,
  disabled = false,
  className = '',
}: VoiceDictationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Clean up on component unmount
    return () => {
      stopRecording(false);
    };
  }, []);

  const startRecording = async () => {
    try {
      setIsPreparing(true);
      
      // Check browser compatibility first
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording. Please try a modern browser like Chrome, Firefox, or Edge.');
      }
      
      console.log("Requesting microphone access...");
      
      // Request microphone access with specific constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;
      
      // Check if we actually got audio tracks
      if (!stream.getAudioTracks() || stream.getAudioTracks().length === 0) {
        throw new Error('No audio input device detected');
      }
      
      console.log("Microphone access granted. Audio tracks:", stream.getAudioTracks().length);
      
      // Initialize RecordRTC with optimized settings for transcription
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1, // mono for better transcription
        sampleRate: 44100, // high quality recording
        desiredSampRate: 16000, // preferred rate for speech recognition
        bufferSize: 16384, // larger buffer for more stable recording
        timeSlice: 1000, // update every second (allows for visualizing audio if needed)
      });
      
      // Start recording
      recorderRef.current.startRecording();
      setIsRecording(true);
      setIsPreparing(false);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
      
      console.log("Voice recording started successfully");
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsPreparing(false);
      
      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access in your browser settings",
            variant: "destructive",
          });
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          toast({
            title: "No microphone found",
            description: "Please connect a microphone to your device",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Could not access microphone",
            description: error.message || "Please check your microphone and try again",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Could not access microphone",
          description: "Please check your microphone permissions and try again",
          variant: "destructive",
        });
      }
    }
  };

  const stopRecording = (processAudio = true) => {
    if (!recorderRef.current || !streamRef.current) return;
    
    if (isRecording) {
      console.log("Stopping recording...");
      
      // Stop recording
      recorderRef.current.stopRecording(async () => {
        if (processAudio) {
          setIsProcessing(true);
          
          try {
            // Get the recorded blob
            const blob = await recorderRef.current!.getBlob();
            
            console.log("Recording stopped. Audio blob size:", blob.size, "bytes, type:", blob.type);
            
            // Validate the audio blob
            if (blob.size === 0) {
              throw new Error("Empty audio recording. Please try again and speak clearly.");
            }
            
            if (blob.size < 1000) { // Less than 1KB is probably too small for meaningful audio
              console.warn("Audio recording appears very small:", blob.size, "bytes");
            }
            
            // Process the audio with AssemblyAI
            await processAudioWithAssemblyAI(blob);
          } catch (error) {
            console.error("Error processing recorded audio:", error);
            toast({
              title: "Recording error",
              description: error instanceof Error ? error.message : "Failed to process recording",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        }
        
        // Clean up audio resources
        try {
          console.log("Cleaning up audio resources...");
          streamRef.current!.getTracks().forEach(track => {
            track.stop();
            console.log(`Audio track ${track.id} stopped`);
          });
        } catch (err) {
          console.error("Error cleaning up audio resources:", err);
        }
        
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
        
        console.log("Recording cleanup complete");
      });
    }
  };

  const processAudioWithAssemblyAI = async (audioBlob: Blob) => {
    try {
      // Get detailed information about the audio blob
      console.log("Processing audio with AssemblyAI...");
      console.log("Audio details:", {
        type: audioBlob.type,
        size: audioBlob.size,
        lastModified: new Date().toISOString()
      });
      
      // Create FormData for the file upload
      const formData = new FormData();
      
      // Use an appropriate filename with the correct extension based on MIME type
      let filename = 'recording.webm';
      let mimeType = audioBlob.type;
      
      // Handle different audio formats
      if (audioBlob.type === 'audio/wav' || audioBlob.type === 'audio/wave') {
        filename = 'recording.wav';
      } else if (audioBlob.type === 'audio/mp3' || audioBlob.type === 'audio/mpeg') {
        filename = 'recording.mp3';
      } else if (audioBlob.type === '') {
        // If MIME type is empty, try to guess from what we expect from RecordRTC
        console.log("No MIME type detected, defaulting to audio/webm");
        mimeType = 'audio/webm';
      }
      
      console.log(`Using filename ${filename} with MIME type ${mimeType}`);
      
      // Create a properly typed file object from the blob
      const file = new File([audioBlob], filename, { 
        type: mimeType,
        lastModified: Date.now()
      });
      
      // Append using the File object instead of the raw blob
      formData.append('file', file);
      
      toast({
        title: "Processing audio",
        description: "Converting your speech to text...",
      });
      
      console.log("Sending audio file to server for transcription...");
      
      // Send to our backend API with appropriate headers
      const response = await fetch('/api/dictate', {
        method: 'POST',
        body: formData,
      });
      
      console.log("Transcription API response status:", response.status);
      
      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = 'Failed to process audio';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error("API error details:", errorData);
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
          // Try to get text instead
          const errorText = await response.text();
          console.error("Error response text:", errorText);
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse the successful response
      const data = await response.json();
      console.log("Received transcription response:", data);
      
      if (data.text) {
        console.log("Transcription successful:", data.text.substring(0, 50) + "...");
        
        // Call callback with transcribed text
        onTranscriptionComplete(data.text);
        
        toast({
          title: "Transcription complete",
          description: "Your dictation has been added to the text",
        });
      } else {
        console.warn("Transcription returned empty text");
        toast({
          title: "No speech detected",
          description: "Please try again and speak clearly into your microphone",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Provide more detailed error messages
      let errorMessage = "Could not convert your speech to text. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Transcription failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isRecording ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => stopRecording()}
          disabled={isProcessing || disabled}
          className="flex items-center space-x-1"
        >
          <StopCircle className="h-4 w-4" />
          <span>Stop Dictation</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={startRecording}
          disabled={isPreparing || isProcessing || disabled}
          className="flex items-center space-x-1"
        >
          {isPreparing || isProcessing ? (
            <span className="animate-pulse">Preparing...</span>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>Start Dictation</span>
            </>
          )}
        </Button>
      )}
      
      {isProcessing && (
        <span className="text-sm text-muted-foreground animate-pulse">
          Processing audio...
        </span>
      )}
    </div>
  );
}