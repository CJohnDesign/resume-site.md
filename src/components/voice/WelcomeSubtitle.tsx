import React from 'react';

interface WelcomeSubtitleProps {
  isVisible: boolean;
  onClick?: () => void;
}

export function WelcomeSubtitle({ isVisible, onClick }: WelcomeSubtitleProps) {
  if (!isVisible) return null;

  return (
    <div className="mt-12 animate-slide-in-bottom transition-all duration-700 ease-out">
      <button
        onClick={onClick}
        className="text-gray-400 text-lg text-center px-8 py-4 bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm whitespace-nowrap transition-all duration-500 hover:bg-gray-900/70 hover:border-gray-600/50 hover:scale-105 hover:text-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
      >
        Click to begin
      </button>
    </div>
  );
}