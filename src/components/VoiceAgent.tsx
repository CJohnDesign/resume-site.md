import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FileText, User, LogOut, RotateCcw } from 'lucide-react';
import { useApiKey } from '../hooks/useApiKey';
import { VoiceInterface } from './voice/VoiceInterface';
import { Footer } from './Footer';
import { useInterviewState } from '../hooks/useInterviewState';

export function VoiceAgent() {
  const { hasValidKey, isLoading, clearApiKey } = useApiKey();
  const { interviewState, updateState, resetInterview } = useInterviewState();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show loading while checking API key
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 transition-all"></div>
          <p className="text-gray-400 transition-colors">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if no valid key
  if (!hasValidKey) {
    return <Navigate to="/enter-api-key" replace />;
  }

  const handleClearApiKey = () => {
    if (window.confirm('Are you sure you want to clear your API key? You will be redirected to the login page.')) {
      clearApiKey();
      setShowProfileDropdown(false);
      navigate('/enter-api-key', { replace: true });
    }
  };

  const handleResetInterview = () => {
    if (window.confirm('Are you sure you want to start over? This will clear all your progress.')) {
      resetInterview();
      setShowProfileDropdown(false);
      // Force a page refresh to ensure complete reset
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Fixed Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-xl z-[9999] transition-all">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Logo and Title */}
            <div className="flex items-center space-x-3 animate-slide-in-right">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-110 hover:shadow-orange-500/40">
                <FileText className="w-4 h-4 text-white transition-all" />
              </div>
              <div>
                <h1 className="text-xl font-bold transition-all">
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    resume-site.md
                  </span>
                </h1>
              </div>
            </div>

            {/* Right - Profile Dropdown */}
            <div className="relative animate-slide-in-right" ref={dropdownRef} style={{ animationDelay: '0.1s' }}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-500/50 hover:border-gray-400/50 transform hover:scale-110"
              >
                <User className="w-4 h-4 text-gray-300 transition-colors" />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 py-2 z-[10000] animate-scale-in transition-all">
                  {/* Session Controls Section */}
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider transition-colors">Session</p>
                  </div>
                  <button
                    onClick={handleResetInterview}
                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all flex items-center space-x-3 group"
                  >
                    <RotateCcw className="w-4 h-4 text-orange-400 transition-all group-hover:rotate-180" />
                    <span className="transition-all">Start Over</span>
                  </button>
                  <div className="mx-4 my-2 border-t border-gray-700/50 transition-all"></div>
                  
                  {/* API Key Section */}
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider transition-colors">Account</p>
                  </div>
                  <button
                    onClick={handleClearApiKey}
                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all flex items-center space-x-3 group"
                  >
                    <LogOut className="w-4 h-4 text-red-400 transition-all group-hover:scale-110" />
                    <span className="transition-all">Clear API Key</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Voice Interface - Full viewport height minus nav bar */}
      <div className="h-screen pt-16">
        <div className="container mx-auto px-6 h-full">
          <VoiceInterface 
            interviewState={interviewState}
            onUpdateState={updateState}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}