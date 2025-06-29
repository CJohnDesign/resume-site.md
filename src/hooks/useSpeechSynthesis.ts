import { useState, useEffect } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      console.log('🗣️ [SpeechSynthesis] Speech synthesis is supported');
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        console.log('🗣️ [SpeechSynthesis] Available voices:', availableVoices.length);
        setVoices(availableVoices);
        
        // Prefer a female English voice
        const preferredVoice = availableVoices.find(voice => 
          voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
        ) || availableVoices.find(voice => voice.lang.includes('en')) || availableVoices[0];
        
        if (preferredVoice) {
          console.log('🗣️ [SpeechSynthesis] Selected voice:', preferredVoice.name, preferredVoice.lang);
          setSelectedVoice(preferredVoice);
        }
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    } else {
      console.warn('⚠️ [SpeechSynthesis] Speech synthesis not supported');
    }
  }, []);

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isSupported || !text) {
        console.log('⚠️ [SpeechSynthesis] Cannot speak - not supported or no text');
        resolve();
        return;
      }

      console.log('🗣️ [SpeechSynthesis] Starting to speak:', text.substring(0, 50) + '...');

      // Stop any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🗣️ [SpeechSynthesis] Using voice:', selectedVoice.name);
      }
      
      utterance.rate = rate;
      utterance.volume = volume;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        console.log('🗣️ [SpeechSynthesis] Speech started');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('🗣️ [SpeechSynthesis] Speech ended');
        setIsSpeaking(false);
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('💥 [SpeechSynthesis] Speech error:', event.error);
        setIsSpeaking(false);
        // Only reject if it's not an interruption error
        if (event.error !== 'interrupted') {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        } else {
          console.log('🗣️ [SpeechSynthesis] Speech was interrupted (expected behavior)');
          resolve();
        }
      };

      speechSynthesis.speak(utterance);
    });
  };

  const stop = () => {
    if (isSupported) {
      console.log('🛑 [SpeechSynthesis] Stopping speech');
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    speak,
    stop,
    setRate,
    setVolume,
    setSelectedVoice,
  };
}