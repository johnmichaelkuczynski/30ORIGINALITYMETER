import { useRef, useState, useEffect } from 'react';
import RecordRTC from 'recordrtc';
import { Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreamingTranscription, setIsStreamingTranscription] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  // Refs for managing resources
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Stop recording if component unmounts during recording
      if (isRecording) {
        stopRecording(false);
      }
      
      // Clear any intervals
      clearLiveTranscription();
    };
  }, [isRecording]);
  
  // Cleanup function for live transcription
  const clearLiveTranscription = () => {
    if (recordingIntervalRef.current) {
      window.clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    setIsStreamingTranscription(false);
  };
  
  // Process a chunk of audio during recording for real-time feedback
  const processAudioChunk = async (blob: Blob) => {
    try {
      if (blob.size < 1000) {
        console.log("Audio chunk too small to process, skipping");
        return; // Skip tiny chunks
      }
      
      // Set flag to indicate we're processing transcription
      setIsStreamingTranscription(true);
      console.log(`Processing audio chunk of size ${blob.size} bytes for streaming transcription`);
      
      // Create a form data object with the audio chunk
      const formData = new FormData();
      
      // Important: Set the correct file type based on the blob's type
      // RecordRTC often uses audio/wav format
      const fileType = blob.type || 'audio/webm'; 
      const fileName = fileType.includes('wav') ? 'chunk.wav' : 'chunk.webm';
      
      // Create a proper File object from the blob
      const file = new File([blob], fileName, { 
        type: fileType,
        lastModified: Date.now()
      });
      
      // Append file to form data
      formData.append('file', file);
      formData.append('streaming', 'true'); // Indicate this is for streaming
      
      console.log(`Sending audio chunk (${fileName}, ${fileType}) for real-time streaming...`);
      
      // Send to our backend streaming endpoint
      const response = await fetch('/api/dictate/stream', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Streaming API error:", errorText);
        throw new Error(`Streaming transcription failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Stream transcription response:", data);
      
      if (data.text) {
        console.log("📝 Live transcription received:", data.text);
        
        setLiveTranscript(prevText => {
          // Display a typing indicator briefly to show the user something is happening
          const newText = data.text.trim();
          
          // If this is the first chunk or restart, just use the new text
          if (!prevText) return newText;
          
          // If the new text is a continuation of the previous text, use the longer one
          if (newText.includes(prevText)) {
            return newText;
          } 
          
          // If the previous text is a substring of the new, use the new text
          if (prevText.includes(newText)) {
            return prevText;
          }
          
          // Otherwise append with a space if needed (basic text merging approach)
          const needsSpace = !prevText.endsWith(' ') && !newText.startsWith(' ');
          return prevText + (needsSpace ? ' ' : '') + newText;
        });
      } else {
        console.log("No transcription text in streaming response");
      }
    } catch (error) {
      console.error("Error in streaming transcription:", error);
    } finally {
      // Reset streaming flag so next chunk can be processed
      setIsStreamingTranscription(false);
    }
  };
  
  const startRecording = async () => {
    if (isRecording) return;
    
    setIsPreparing(true);
    clearLiveTranscription(); // Reset any previous streaming text
    
    try {
      console.log("Checking browser compatibility...");
      
      // First, check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser doesn't support audio recording. " +
          "Please try using Chrome, Firefox, or Edge."
        );
      }
      
      console.log("Browser supports getUserMedia. Requesting microphone access...");
      
      // Request microphone access with more specific constraints for better compatibility
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      // Try to get microphone access with a timeout
      const mediaStream = await Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        new Promise<MediaStream>((_, reject) => {
          setTimeout(() => reject(new Error("Microphone access timed out")), 10000);
        })
      ]) as MediaStream;
      
      // Check if we actually got audio tracks
      const audioTracks = mediaStream.getAudioTracks();
      console.log("Microphone access granted. Audio tracks:", audioTracks.length);
      
      if (audioTracks.length === 0) {
        throw new Error("No audio track was detected from your microphone");
      }
      
      // Log detailed info about the audio track to help with debugging
      console.log("Audio track info:", audioTracks[0].getSettings());
      
      // Store the media stream for later cleanup
      streamRef.current = mediaStream;
      
      // Create a new recorder instance with optimized options for real-time transcription
      // Define options to use for the recorder with optimal settings for real-time transcription
      const recorderOptions = {
        type: 'audio' as 'audio', // Must be exactly 'audio' for TypeScript
        mimeType: 'audio/webm', // Standard format supported in most browsers
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1, // mono for voice (smaller file size, faster)
        sampleRate: 16000, // Lower for speech recognition
        timeSlice: 2000, // Get chunks more frequently for better real-time experience
        disableLogs: false,
        // Added for better performance in streaming scenarios
        desiredSampRate: 16000, // This is a good rate for speech recognition
        bufferSize: 8192 // Smaller buffer means more frequent processing
      };
      
      console.log("Creating RecordRTC instance with options:", recorderOptions);
      recorderRef.current = new RecordRTC(mediaStream, recorderOptions);
      
      // Start recording
      console.log("Starting recording...");
      recorderRef.current.startRecording();
      
      setIsRecording(true);
      setIsPreparing(false);
      
      // Simple polling approach that should work across browsers
      // We'll use a shorter interval of 2s to match the timeSlice setting
      // This gives us more real-time updates
      const chunkInterval = window.setInterval(() => {
        if (!recorderRef.current) return;
        
        try {
          // Cast to any to bypass TypeScript strictness
          const recorder = recorderRef.current as any;
          
          // First check if we can get the state
          if (!recorder.getState || recorder.getState() !== 'recording') {
            console.log("Recorder not in recording state, skipping chunk collection");
            return;
          }
          
          // Then try to get data through the internal recorder
          if (!recorder.getInternalRecorder) {
            console.error("Recorder has no getInternalRecorder method");
            return;
          }
          
          const internalRecorder = recorder.getInternalRecorder();
          if (!internalRecorder || !internalRecorder.requestData) {
            console.error("Internal recorder missing or has no requestData method");
            return;
          }
          
          // Request the audio data
          internalRecorder.requestData((blob: Blob) => {
            if (!blob || blob.size === 0) {
              console.log("Empty audio chunk received");
              return;
            }
            
            console.log("Audio chunk available, size:", blob.size, "bytes, type:", blob.type || "unknown");
            recordingChunksRef.current.push(blob);
            
            // Keep only the last 5 chunks
            if (recordingChunksRef.current.length > 5) {
              recordingChunksRef.current = recordingChunksRef.current.slice(-5);
            }
            
            // Process this chunk if we're not already transcribing
            // We reduced the minimum size to be more responsive
            if (!isStreamingTranscription && blob.size > 500) {
              const combinedBlob = new Blob(recordingChunksRef.current, { 
                type: blob.type || 'audio/webm' 
              });
              processAudioChunk(combinedBlob);
            } else if (isStreamingTranscription) {
              console.log("Skipping processing - transcription already in progress");
            } else if (blob.size <= 500) {
              console.log("Skipping processing - audio chunk too small");
            }
          });
        } catch (err) {
          console.error("Error in audio chunking:", err);
        }
      }, 2000); // Reduced to 2 seconds for more real-time feedback
      
      // Store interval reference for cleanup
      recordingIntervalRef.current = chunkInterval;
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
      
      console.log("Voice recording started successfully with real-time transcription");
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsPreparing(false);
      clearLiveTranscription();
      
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
      
      // Stop any ongoing real-time transcription
      clearLiveTranscription();
      
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
            
            // If we already have a live transcript from the streaming, use it
            if (liveTranscript) {
              console.log("Using existing live transcript:", liveTranscript);
              onTranscriptionComplete(liveTranscript);
              
              toast({
                title: "Transcription complete",
                description: "Your dictation has been added to the text",
              });
            } else {
              // Otherwise, process the complete audio for transcription
              await processAudioWithAssemblyAI(blob);
            }
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
        setLiveTranscript('');
        
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
    <div className={`flex flex-col w-full ${className}`}>
      <div className="flex items-center space-x-2 mb-1">
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
        
        {isStreamingTranscription && (
          <span className="text-sm text-muted-foreground animate-pulse">
            Transcribing...
          </span>
        )}
      </div>
      
      {/* Live transcript display */}
      {isRecording && liveTranscript && (
        <div className="relative mt-2 p-2 border rounded-md bg-muted/30 max-h-24 overflow-y-auto">
          <p className="text-sm">
            <span className="font-semibold">Live transcript:</span> {liveTranscript}
          </p>
        </div>
      )}
    </div>
  );
}