import { useState, useEffect, useRef } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false); // FIXED: Track listening state to prevent conflicts

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('🎤 [SpeechRecognition] Speech recognition is supported');
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('🎤 [SpeechRecognition] Recognition started');
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onend = () => {
        console.log('🎤 [SpeechRecognition] Recognition ended');
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        // FIXED: Only process results if we're actually listening
        if (!isListeningRef.current) {
          console.log('🎤 [SpeechRecognition] Ignoring results - not listening');
          return;
        }

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
            console.log('🎤 [SpeechRecognition] Final transcript part:', transcriptPart);
          } else {
            interimTranscript += transcriptPart;
            console.log('🎤 [SpeechRecognition] Interim transcript part:', transcriptPart);
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        console.log('🎤 [SpeechRecognition] Full transcript updated:', fullTranscript);
        setTranscript(fullTranscript);
      };

      recognition.onerror = (event) => {
        console.error('💥 [SpeechRecognition] Recognition error:', event.error);
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('⚠️ [SpeechRecognition] Speech recognition not supported');
    }

    return () => {
      if (recognitionRef.current) {
        console.log('🛑 [SpeechRecognition] Cleanup: stopping recognition');
        recognitionRef.current.stop();
        isListeningRef.current = false;
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListeningRef.current) {
      console.log('🎤 [SpeechRecognition] Starting listening...');
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('💥 [SpeechRecognition] Error starting recognition:', error);
        isListeningRef.current = false;
        setIsListening(false);
      }
    } else if (isListeningRef.current) {
      console.log('⚠️ [SpeechRecognition] Already listening, ignoring start request');
    } else {
      console.log('⚠️ [SpeechRecognition] No recognition available, cannot start');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListeningRef.current) {
      console.log('🛑 [SpeechRecognition] Stopping listening...');
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('💥 [SpeechRecognition] Error stopping recognition:', error);
      }
      isListeningRef.current = false;
      setIsListening(false);
    } else if (!isListeningRef.current) {
      console.log('⚠️ [SpeechRecognition] Not listening, ignoring stop request');
    } else {
      console.log('⚠️ [SpeechRecognition] No recognition available, cannot stop');
    }
  };

  const resetTranscript = () => {
    console.log('🔄 [SpeechRecognition] Resetting transcript');
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}