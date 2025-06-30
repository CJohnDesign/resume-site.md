import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Key, Lock, ArrowRight, AlertCircle, FileText, ExternalLink, Sparkles, Eye, EyeOff, Shield, Heart, Zap, Cpu } from 'lucide-react';
import { useApiKey } from '../hooks/useApiKey';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Typography } from './ui/Typography';
import { GameOfLife } from './GameOfLife';

export function ApiKeyEntry() {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showTrustAnimation, setShowTrustAnimation] = useState(false);
  const [gameOfLifeActive, setGameOfLifeActive] = useState(false);
  const { hasValidKey, storeApiKey } = useApiKey();

  // Animation states
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const firstText = 'BUILT WITH BOLT';
  const secondText = 'CLICK TO BUILD';

  // Demo API key - this would be your actual demo key
  const DEMO_API_KEY = 'sk-demo-key-for-testing-purposes-only-2024';

  // Check if device is desktop (1024px and above)
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // Only run animation on desktop
    if (!isDesktop) {
      setAnimationPhase('idle');
      setTypedText('');
      setShowCursor(false);
      setIsHovered(false);
      return;
    }

    if (!isHovered && animationPhase !== 'idle') {
      // Reset animation when not hovered
      setAnimationPhase('idle');
      setTypedText('');
      setShowCursor(false);
      return;
    }

    if (!isHovered) return;

    switch (animationPhase) {
      case 'idle':
        timeout = setTimeout(() => {
          setAnimationPhase('backflip');
        }, 30);
        break;

      case 'backflip':
        timeout = setTimeout(() => {
          setAnimationPhase('typing');
          setShowCursor(true);
        }, 400);
        break;

      case 'typing':
        if (typedText.length < firstText.length) {
          timeout = setTimeout(() => {
            setTypedText(firstText.slice(0, typedText.length + 1));
          }, 35);
        } else {
          timeout = setTimeout(() => {
            setAnimationPhase('backspace');
          }, 600);
        }
        break;

      case 'backspace':
        if (typedText.length > 0) {
          timeout = setTimeout(() => {
            setTypedText(typedText.slice(0, -1));
          }, 20);
        } else {
          timeout = setTimeout(() => {
            setAnimationPhase('typing2');
          }, 100);
        }
        break;

      case 'typing2':
        if (typedText.length < secondText.length) {
          timeout = setTimeout(() => {
            setTypedText(secondText.slice(0, typedText.length + 1));
          }, 35);
        } else {
          timeout = setTimeout(() => {
            setAnimationPhase('backspace2');
          }, 600);
        }
        break;

      case 'backspace2':
        if (typedText.length > 0) {
          timeout = setTimeout(() => {
            setTypedText(typedText.slice(0, -1));
          }, 20);
        } else {
          setShowCursor(false);
          setAnimationPhase('return');
        }
        break;

      case 'return':
        timeout = setTimeout(() => {
          setAnimationPhase('idle');
        }, 300);
        break;
    }

    return () => clearTimeout(timeout);
  }, [animationPhase, typedText, firstText, secondText, isHovered, isDesktop]);

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

  const handleMouseEnter = () => {
    if (isDesktop) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isDesktop) {
      setIsHovered(false);
    }
  };

  const handleBoltClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('https://bolt.new/?rid=tqid7o', '_blank', 'noopener,noreferrer');
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    
    // Reset if too much time has passed (5 seconds)
    if (timeSinceLastClick > 5000) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(now);
    
    console.log(`Click ${clickCount + 1}/7 for Easter egg`); // Debug log
    
    // Easter egg: 7 clicks within 5 seconds
    if (clickCount >= 6) { // 6 because we increment after checking
      console.log('Easter egg activated!'); // Debug log
      setShowTrustAnimation(true);
      setGameOfLifeActive(true);
      setTimeout(() => {
        setShowDemoModal(true);
        setShowTrustAnimation(false);
      }, 1500);
      setClickCount(0);
    }
  };

  const handleUseDemoKey = async () => {
    setIsValidating(true);
    setError('');
    
    try {
      // Set the demo key in the input field
      setApiKey(DEMO_API_KEY);
      
      // Wait a moment for visual feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Attempt to store the demo key
      const success = await storeApiKey(DEMO_API_KEY);
      
      if (success) {
        // Success! The useApiKey hook will automatically redirect
        setShowDemoModal(false);
        setGameOfLifeActive(false);
      } else {
        // If demo key doesn't work, show a helpful message
        setError('Demo mode activated! You can now explore the app with limited functionality.');
        setShowDemoModal(false);
        setGameOfLifeActive(false);
        
        // For demo purposes, we'll simulate success after showing the message
        setTimeout(() => {
          localStorage.setItem('demo_mode_active', 'true');
          window.location.reload(); // Force refresh to trigger navigation
        }, 2000);
      }
      
    } catch (error) {
      setError('Unable to activate demo mode. Please try again or use your own API key.');
      setShowDemoModal(false);
      setGameOfLifeActive(false);
    }
    
    setIsValidating(false);
  };

  const handleModalClose = () => {
    setShowDemoModal(false);
    setGameOfLifeActive(false);
  };

  return (
    <>
      {/* Game of Life Background - Behind everything */}
      <GameOfLife 
        isActive={gameOfLifeActive}
        className="fixed inset-0 z-0"
        cellSize={8}
        speed={200}
        opacity={0.2}
        glowColor="#f97316"
      />

      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative z-10">
        {/* Trust Animation Overlay */}
        {showTrustAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center animate-scale-in">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-orange-500/30 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-12 h-12 text-orange-400 animate-pulse" />
                </div>
              </div>
              <Typography variant="h4" color="accent" className="mt-6 animate-pulse">
                Activating Demo Mode...
              </Typography>
            </div>
          </div>
        )}

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
                Enter your OpenAI API key to begin building your resume through intelligent conversation with{' '}
                <a 
                  href="https://bolt.new/?rid=tqid7o" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 underline transition-all duration-300"
                >
                  Bolt
                </a>.
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

            {/* Demo Link - Always Orange with Click Counter Visual Feedback */}
            <div className="mt-6 text-center relative z-10 animate-slide-in-bottom" style={{ animationDelay: '0.6s' }}>
              <button
                onClick={handleDemoClick}
                className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-all duration-500 hover:underline cursor-pointer bg-transparent border-none group relative"
              >
                <span className="relative z-10">no api key, use ours</span>
                {/* Visual feedback for clicks */}
                {clickCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {clickCount}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Animated Bolt Logo Badge */}
        <div 
          className="mt-8 relative h-16 flex items-center justify-center max-w-md w-full cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleBoltClick}
        >
          <div
            className={`absolute transition-all duration-300 ${
              animationPhase === 'idle' 
                ? `${isDesktop ? 'hover:opacity-100 hover:scale-110' : ''} ${!isHovered ? 'bolt-pulse-glow' : ''}` 
                : 'pointer-events-none'
            }`}
          >
            <img 
              src="/white_circle_360x360.png" 
              alt="Built with Bolt" 
              className={`w-16 h-16 transition-all duration-300 ${
                isDesktop && animationPhase === 'backflip' 
                  ? 'bolt-backflip' 
                  : isDesktop && animationPhase === 'return'
                  ? 'bolt-return'
                  : isDesktop && (animationPhase === 'typing' || animationPhase === 'backspace' || animationPhase === 'typing2' || animationPhase === 'backspace2')
                  ? 'opacity-0 invisible'
                  : ''
              }`}
            />
          </div>

          {isDesktop && (animationPhase === 'typing' || animationPhase === 'backspace' || animationPhase === 'typing2' || animationPhase === 'backspace2') && (
            <div className="absolute flex items-center justify-center w-full">
              <span 
                className="text-white font-mono text-sm font-medium tracking-wider whitespace-nowrap"
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

      {/* Demo Mode Modal - Toned down language */}
      <Modal
        isOpen={showDemoModal}
        onClose={handleModalClose}
        size="md"
        title=""
        className="border-orange-500/30 relative z-50"
      >
        <div className="text-center mb-6">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25 animate-pulse">
              <Cpu className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-orange-400 animate-bounce" />
            </div>
          </div>
          
          <Typography variant="h3" color="accent" className="mb-2 font-bold">
            Demo Mode Available
          </Typography>
          
          <Typography variant="body1" color="secondary" className="mb-6">
            You found our shared demo API key! This is a limited resource we provide for testing.
          </Typography>
        </div>

        <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-start space-x-3 mb-4">
            <Shield className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <Typography variant="body2" color="primary" className="mb-2 font-semibold">
                Please use responsibly:
              </Typography>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• This is a shared resource for demos and testing</li>
                <li>• Please don't abuse or overuse this key</li>
                <li>• Consider getting your own API key for regular use</li>
                <li>• Help us keep this available for everyone</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-orange-500/20 pt-4">
            <Typography variant="body2" color="muted" className="text-center">
              The demo key will be automatically applied and you'll be logged in.
            </Typography>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleUseDemoKey}
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isValidating}
            loadingText="Applying demo key..."
            leftIcon={<Key className="w-5 h-5" />}
            className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600"
          >
            Use Demo Key & Login
          </Button>
          
          <Button
            onClick={handleModalClose}
            variant="ghost"
            size="md"
            fullWidth
          >
            Cancel
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Typography variant="caption" color="muted" className="italic">
            "Sharing is caring, but please be considerate"
          </Typography>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Cpu className="w-3 h-3 text-orange-400/60" />
            <Typography variant="caption" color="muted" className="text-xs">
              Conway's Game of Life • Emergent Complexity
            </Typography>
            <Cpu className="w-3 h-3 text-orange-400/60" />
          </div>
        </div>
      </Modal>
    </>
  );
}