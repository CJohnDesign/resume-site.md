import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-xl transition-all animate-slide-in-bottom" style={{ animationDelay: '0.6s' }}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="transition-all hover:text-gray-300">
            Open source MIT license by{' '}
            <a 
              href="https://postscarcity.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 font-medium hover:text-orange-300 transition-all duration-300 hover:underline transform hover:scale-105 inline-block"
            >
              PostScarcity AI
            </a>
          </div>
          <div className="transition-all hover:text-gray-300">
            Built with{' '}
            <a 
              href="https://bolt.new/?rid=tqid7o" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 font-medium hover:text-orange-300 transition-all duration-300 hover:underline transform hover:scale-105 inline-block"
            >
              Bolt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}