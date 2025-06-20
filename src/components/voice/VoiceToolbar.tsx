import React, { useState, useRef, useEffect } from 'react';
import { Send, Type, Mic } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
import { StatusIndicator } from '../ui/StatusIndicator';
import { cn } from '../../utils/cn';

interface VoiceToolbarProps {
  isListening: boolean;
  transcript: string;
  textInput: string;
  onTextChange: (text: string) => void;
  onTextSubmit: () => void;
  onTextModeToggle: () => void;
  disabled?: boolean;
  voiceMode: boolean;
  currentStep?: any;
  isSpeaking?: boolean;
  isProcessing?: boolean;
  requiresTextInput: boolean;
}

export function VoiceToolbar({
  isListening,
  transcript,
  textInput,
  onTextChange,
  onTextSubmit,
  onTextModeToggle,
  disabled = false,
  voiceMode,
  currentStep,
  isSpeaking = false,
  isProcessing = false,
  requiresTextInput = false
}: VoiceToolbarProps) {
  const [textMode, setTextMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  console.log('🔧 [VoiceToolbar] Render state:', {
    voiceMode,
    textMode,
    requiresTextInput,
    currentStepName: currentStep?.name,
    stepId: currentStep?.id
  });

  // CRITICAL: Initialize text mode based on step requirements and voiceMode prop
  useEffect(() => {
    console.log('🔧 [VoiceToolbar] Step/mode change effect:', {
      requiresTextInput,
      voiceMode,
      currentTextMode: textMode,
      stepName: currentStep?.name
    });

    if (requiresTextInput || !voiceMode) {
      console.log('🔧 [VoiceToolbar] Switching to text mode - required:', requiresTextInput, 'voiceMode:', voiceMode);
      setTextMode(true);
    } else if (!requiresTextInput && voiceMode) {
      console.log('🔧 [VoiceToolbar] Switching to voice mode - not required and voice enabled');
      setTextMode(false);
    }
  }, [requiresTextInput, voiceMode, currentStep?.id]);

  // Focus input when text mode is activated
  useEffect(() => {
    if (textMode && inputRef.current) {
      console.log('🔧 [VoiceToolbar] Focusing text input');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [textMode]);

  const handleTextModeToggle = () => {
    console.log('🔧 [VoiceToolbar] Manual text mode toggle clicked, current textMode:', textMode);
    
    if (textMode) {
      // Switch back to voice mode (only if not required)
      if (!requiresTextInput) {
        console.log('🔧 [VoiceToolbar] Switching back to voice mode');
        setTextMode(false);
        // Don't call onTextModeToggle here as it disables voice mode
      } else {
        console.log('🔧 [VoiceToolbar] Cannot switch to voice - text input required');
      }
    } else {
      // Switch to text mode
      console.log('🔧 [VoiceToolbar] Switching to text mode manually');
      setTextMode(true);
      onTextModeToggle();
    }
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (textInput.trim() && !disabled) {
      console.log('🔧 [VoiceToolbar] Submitting text:', textInput);
      onTextSubmit();
      // Stay in text mode for required fields, otherwise return to voice
      if (!requiresTextInput) {
        console.log('🔧 [VoiceToolbar] Text not required, returning to voice mode');
        setTextMode(false);
      } else {
        console.log('🔧 [VoiceToolbar] Text required, staying in text mode');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
    if (e.key === 'Escape') {
      if (!requiresTextInput) {
        setTextMode(false);
      }
    }
  };

  // Get status info
  const getStatus = () => {
    if (disabled) return { type: 'error', text: 'Error' };
    if (isProcessing) return { type: 'loading', text: 'Processing' };
    if (isSpeaking) return { type: 'success', text: 'Speaking' };
    if (isListening && !textMode) return { type: 'warning', text: 'Listening' };
    if (textMode) return { type: 'info', text: 'Text Mode' };
    return { type: 'idle', text: 'Ready' };
  };

  // Get center content
  const getCenterContent = () => {
    if (textMode) {
      return (
        <form onSubmit={handleTextSubmit} className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={textInput}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getInputPlaceholder()}
            disabled={disabled}
            className="w-full px-4 py-2 text-base rounded-lg bg-gray-900/50 border border-gray-600/50 focus:border-orange-500/50 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
          />
        </form>
      );
    }

    if (transcript.trim() && !textMode) {
      return (
        <div className="flex-1 px-4 max-w-2xl">
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30 backdrop-blur-sm max-h-20 overflow-y-auto">
            <Typography 
              variant="body1" 
              color="secondary" 
              className="whitespace-pre-wrap break-words leading-relaxed text-sm"
            >
              {transcript}
            </Typography>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 text-center px-4">
        <Typography variant="body2" color="muted">
          {getPlaceholderText()}
        </Typography>
      </div>
    );
  };

  const getInputPlaceholder = () => {
    switch (currentStep?.name) {
      case 'welcome':
        return "Enter your full name";
      case 'email':
        return "Enter your email address";
      case 'linkedin':
        return "Enter your LinkedIn profile URL";
      case 'linkedin-data':
        return "Paste your LinkedIn profile information here";
      default:
        return "Type your response...";
    }
  };

  const getPlaceholderText = () => {
    if (isListening) return "Listening for your response...";
    if (isSpeaking) return "AI is speaking...";
    if (isProcessing) return "Processing your response...";
    return "Click the microphone to speak or use text input";
  };

  const status = getStatus();

  console.log('🔧 [VoiceToolbar] Final render decision:', {
    textMode,
    showingTextInput: textMode,
    showingVoiceToggle: !requiresTextInput,
    status: status.text
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center py-6">
      <Card
        variant="glass"
        padding="md"
        hover
        className="animate-slide-in-bottom max-w-4xl w-full mx-6 transition-all duration-500"
      >
        <div className="flex items-center space-x-6">
          
          {/* Left - Status */}
          <div className="flex items-center space-x-3 min-w-[120px]">
            <StatusIndicator
              status={status.type as any}
              size="md"
              animate
            />
            <Typography
              variant="body2"
              color={status.type === 'error' ? 'error' : 'secondary'}
              weight="medium"
            >
              {status.text}
            </Typography>
          </div>

          {/* Center - Text Input or Transcript */}
          {getCenterContent()}

          {/* Right - Text Input Toggle Button */}
          <div className="flex items-center space-x-2">
            {textMode ? (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || disabled}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="flex-shrink-0"
                >
                  Send
                </Button>
                
                {!requiresTextInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={handleTextModeToggle}
                    disabled={disabled}
                    leftIcon={<Mic className="w-4 h-4" />}
                    className="flex-shrink-0"
                  >
                    Voice
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="ghost"
                size="md"
                onClick={handleTextModeToggle}
                disabled={disabled}
                leftIcon={<Type className="w-4 h-4" />}
                className="flex-shrink-0 transition-all duration-300 hover:scale-105"
              >
                Text Input
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}