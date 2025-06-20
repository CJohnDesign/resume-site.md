import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceButtonProps {
  buttonState: 'start' | 'speaking' | 'listening' | 'processing' | 'active' | 'paused';
  onClick: () => void;
  disabled?: boolean;
}

export function VoiceButton({ buttonState, onClick, disabled = false }: VoiceButtonProps) {
  const getButtonStyles = () => {
    const baseStyles = `
      relative w-40 h-40 rounded-full flex items-center justify-center
      transition-all duration-700 ease-out transform hover:scale-110 disabled:scale-100
      shadow-2xl border-4 focus:outline-none focus:ring-4 focus:ring-orange-500/50
    `;

    switch (buttonState) {
      case 'start':
        return `${baseStyles} bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 shadow-orange-500/50 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/70`;
      case 'speaking':
        return `${baseStyles} bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-green-500/30`;
      case 'listening':
        return `${baseStyles} bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 shadow-orange-500/50 hover:shadow-orange-500/70`;
      case 'processing':
        return `${baseStyles} bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 shadow-blue-500/50`;
      case 'active':
        return `${baseStyles} bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 shadow-orange-500/50 hover:shadow-orange-500/70`;
      case 'paused':
        return `${baseStyles} bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 shadow-gray-500/50 hover:from-orange-500 hover:to-orange-600 hover:border-orange-400 hover:shadow-orange-500/50`;
      default:
        return `${baseStyles} bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 shadow-gray-500/50`;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonStyles()}
    >
      {/* Animated rings for different states */}
      {buttonState === 'speaking' && (
        <div className="absolute inset-0 rounded-full border-2 border-green-300/40 transition-all duration-1000 ease-in-out" 
             style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      )}
      
      {buttonState === 'listening' && (
        <div className="absolute inset-0 rounded-full border-2 border-orange-300/40 transition-all duration-1000 ease-in-out" 
             style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      )}

      {buttonState === 'processing' && (
        <div className="absolute inset-0 rounded-full border-4 border-blue-300/30 border-t-blue-300 transition-all duration-500 ease-linear" 
             style={{ animation: 'spin 1.5s linear infinite' }}></div>
      )}

      {/* Microphone Icon */}
      <Mic className={`
        w-16 h-16 text-white z-10 transform translate-y-[-1px] 
        transition-all duration-500 ease-out
        ${buttonState === 'processing' ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
      `} />
    </button>
  );
}