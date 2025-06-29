import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ContinueButtonProps {
  isVisible: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function ContinueButton({ isVisible, onClick, disabled = false }: ContinueButtonProps) {
  if (!isVisible) return null;

  return (
    <div className="mt-8 animate-slide-in-bottom transition-all duration-700 ease-out">
      <button
        onClick={onClick}
        disabled={disabled}
        className="text-gray-400 text-lg text-center px-8 py-4 bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm whitespace-nowrap transition-all duration-500 hover:bg-gray-900/70 hover:border-gray-600/50 hover:scale-105 hover:text-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-gray-900/50 disabled:hover:border-gray-700/50 disabled:hover:text-gray-400 flex items-center space-x-3"
      >
        <span>Continue to Next Question</span>
        <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );
}