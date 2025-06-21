import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Key, Lock, ArrowRight, AlertCircle, FileText } from 'lucide-react';
import { useApiKey } from '../hooks/useApiKey';

export function ApiKeyEntry() {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const { hasValidKey, storeApiKey } = useApiKey();

  // Animation states
  const [animationPhase, setAnimationPhase] = useState('initial'); // initial, backflip, typing, backspace, return
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);

  const fullText = 'BUILT WITH BOLT';

  useEffect(() => {
    // Start the animation sequence after 500ms
    const startAnimation = setTimeout(() => {
      setAnimationPhase('backflip');
    }, 500);

    return () => clearTimeout(startAnimation);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    switch (animationPhase) {
      case 'backflip':
        // After backflip animation completes (1.2s), start typing
        timeout = setTimeout(() => {
          setAnimationPhase('typing');
          setShowCursor(true);
        }, 1200);
        break;

      case 'typing':
        if (typedText.length < fullText.length) {
          timeout = setTimeout(() => {
            setTypedText(fullText.slice(0, typedText.length + 1));
          }, 100); // Typing speed
        } else {
          // Hold for 2 seconds then start backspacing
          timeout = setTimeout(() => {
            setAnimationPhase('backspace');
          }, 2000);
        }
        break;

      case 'backspace':
        if (typedText.length > 0) {
          timeout = setTimeout(() => {
            setTypedText(typedText.slice(0, -1));
          }, 50); // Backspace speed
        } else {
          // Start return animation
          setShowCursor(false);
          setAnimationPhase('return');
        }
        break;

      case 'return':
        // Logo returns after text is gone
        timeout = setTimeout(() => {
          setAnimationPhase('complete');
        }, 800);
        break;
    }

    return () => clearTimeout(timeout);
  }, [animationPhase, typedText, fullText]);

  if (hasValidKey) {
    return <Navigate to="/agent" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsValidating(true);
    setError('');

    const success = await storeApiKey(apiKey.trim());
    
    if (!success) {
      setError('Invalid API key. Please check your key and try again.');
    }
    
    setIsValidating(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/50 relative overflow-hidden animate-scale-in">
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/5 pointer-events-none transition-opacity-fast"></div>
          
          <div className="text-center mb-8 relative z-10 animate-slide-in-bottom">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-6 shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-110 hover:shadow-orange-500/40">
              <FileText className="w-10 h-10 text-white transition-all" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 transition-colors">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                resume-site.md
              </span>
            </h1>
            <p className="text-gray-400 leading-relaxed transition-colors">
              Enter your OpenAI API key to begin building your resume through intelligent conversation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10 animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-3 transition-colors">
                OpenAI API Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-all duration-300" />
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-500 backdrop-blur-sm hover:bg-gray-900/70 hover:border-gray-500"
                  disabled={isValidating}
                />
              </div>
              {error && (
                <div className="mt-3 flex items-center text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fade-in transition-all">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 transition-all" />
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!apiKey.trim() || isValidating}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:shadow-none"
            >
              {isValidating ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin transition-all" />
              ) : (
                <>
                  <span className="transition-all">Continue</span>
                  <ArrowRight className="w-5 h-5 transition-all group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-900/30 rounded-xl border border-gray-700/50 backdrop-blur-sm relative z-10 animate-slide-in-bottom transition-all hover:bg-gray-900/50 hover:border-gray-600/50" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center transition-all hover:bg-orange-500/30">
                <Lock className="w-4 h-4 text-orange-400 transition-all" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1 transition-colors">Secure Storage</h3>
                <p className="text-xs text-gray-400 leading-relaxed transition-colors">
                  Your API key is encrypted and stored locally. It never leaves your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Bolt Logo Badge */}
      <div className="mt-8 relative h-16 flex items-center justify-center">
        {/* Logo */}
        <a 
          href="https://bolt.new" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`absolute transition-all duration-300 ${
            animationPhase === 'initial' || animationPhase === 'complete' 
              ? 'opacity-85 hover:opacity-100 hover:scale-110' 
              : 'pointer-events-none'
          }`}
        >
          <img 
            src="/white_circle_360x360.png" 
            alt="Powered by Bolt.new" 
            className={`w-16 h-16 transition-all duration-1200 ${
              animationPhase === 'backflip' 
                ? 'bolt-backflip opacity-0' 
                : animationPhase === 'return'
                ? 'bolt-return opacity-85'
                : animationPhase === 'complete'
                ? 'opacity-85'
                : 'opacity-85'
            }`}
          />
        </a>

        {/* Typing Text */}
        {(animationPhase === 'typing' || animationPhase === 'backspace') && (
          <div className="absolute flex items-center justify-center">
            <span 
              className="text-white font-mono text-sm font-medium tracking-wider"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                letterSpacing: '0.05em'
              }}
            >
              {typedText}
              {showCursor && (
                <span className="animate-pulse ml-1 text-orange-400">|</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}