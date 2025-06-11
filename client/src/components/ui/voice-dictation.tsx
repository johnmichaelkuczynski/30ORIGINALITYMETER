import { useRef, useState, useEffect } from 'react';
import { Mic, StopCircle, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceDictationProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceDictation({
  onTranscriptionComplete,
  disabled = false,
  className = '',
}: VoiceDictationProps) {
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState('');
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        console.log('Speech recognition started');
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          onTranscriptionComplete(finalTranscript);
          toast({
            title: "Voice input complete",
            description: "Your dictation has been added",
          });
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access in your browser settings",
            variant: "destructive",
          });
        } else if (event.error === 'no-speech') {
          toast({
            title: "No speech detected",
            description: "Please speak clearly into your microphone",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Speech recognition error",
            description: `Error: ${event.error}`,
            variant: "destructive",
          });
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended');
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptionComplete, toast, isListening]);
  
  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition. Please try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      toast({
        title: "Listening...",
        description: "Speak clearly into your microphone",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={true}
        className={`flex items-center gap-1 ${className}`}
        title="Speech recognition not supported in this browser"
      >
        <MicOff className="h-4 w-4" />
        Voice
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleListening}
      disabled={disabled}
      className={`flex items-center gap-1 ${isListening ? 'text-red-600 bg-red-50' : ''} ${className}`}
      title={isListening ? "Stop listening" : "Start voice dictation"}
    >
      {isListening ? (
        <>
          <StopCircle className="h-4 w-4 animate-pulse" />
          Stop
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          Voice
        </>
      )}
    </Button>
  );
}