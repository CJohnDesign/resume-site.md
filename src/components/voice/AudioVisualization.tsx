import React from 'react';

interface AudioVisualizationProps {
  isVisible: boolean;
}

export function AudioVisualization({ isVisible }: AudioVisualizationProps) {
  if (!isVisible) return null;

  return (
    <div className="mt-12 flex items-center justify-center space-x-2 animate-slide-in-bottom transition-all duration-700 ease-out">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="w-2 bg-green-400/70 rounded-full transition-all duration-500 ease-in-out"
          style={{
            height: `${12 + (i % 3) * 8}px`,
            animation: `pulse 1.5s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        ></div>
      ))}
    </div>
  );
}