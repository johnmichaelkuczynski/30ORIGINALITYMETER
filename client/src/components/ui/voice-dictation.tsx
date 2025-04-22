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
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Initialize RecordRTC
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1, // mono
        sampleRate: 44100,
        desiredSampRate: 16000,
      });
      
      // Start recording
      recorderRef.current.startRecording();
      setIsRecording(true);
      setIsPreparing(false);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsPreparing(false);
      
      toast({
        title: "Could not access microphone",
        description: "Please check your microphone permissions and try again",
        variant: "destructive",
      });
    }
  };

  const stopRecording = (processAudio = true) => {
    if (!recorderRef.current || !streamRef.current) return;
    
    if (isRecording) {
      // Stop recording
      recorderRef.current.stopRecording(async () => {
        if (processAudio) {
          setIsProcessing(true);
          
          // Get the recorded blob
          const blob = await recorderRef.current!.getBlob();
          
          // Process the audio with AssemblyAI
          await processAudioWithAssemblyAI(blob);
          
          setIsProcessing(false);
        }
        
        // Clean up
        streamRef.current!.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        
        setIsRecording(false);
      });
    }
  };

  const processAudioWithAssemblyAI = async (audioBlob: Blob) => {
    try {
      // Convert to proper audio format if needed
      // Note: webm is good for AssemblyAI, but we'll ensure it's properly named
      console.log("Audio format:", audioBlob.type);
      
      // Create FormData with the audio blob
      const formData = new FormData();
      
      // Use a descriptive filename with the correct extension based on MIME type
      let filename = 'recording.webm';
      if (audioBlob.type === 'audio/wav') {
        filename = 'recording.wav';
      } else if (audioBlob.type === 'audio/mp3' || audioBlob.type === 'audio/mpeg') {
        filename = 'recording.mp3';
      }
      
      // Append to FormData with the correct filename
      formData.append('file', audioBlob, filename);
      
      toast({
        title: "Processing audio",
        description: "Converting your speech to text...",
      });
      
      console.log("Sending audio file to server for transcription...");
      
      // Send to our backend API
      const response = await fetch('/api/dictate', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process audio');
      }
      
      const data = await response.json();
      console.log("Received transcription response:", data);
      
      if (data.text) {
        // Call callback with transcribed text
        onTranscriptionComplete(data.text);
        
        toast({
          title: "Transcription complete",
          description: "Your dictation has been added to the text",
        });
      } else {
        toast({
          title: "No speech detected",
          description: "Please try again with clearer audio",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      
      toast({
        title: "Transcription failed",
        description: "Could not convert your speech to text. Please try again.",
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