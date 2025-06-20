import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApiKeyEntry } from './components/ApiKeyEntry';
import { VoiceAgent } from './components/VoiceAgent';
import { useApiKey } from './hooks/useApiKey';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <Routes>
          {/* Main redirect handler for root */}
          <Route path="/" element={<RedirectHandler />} />
          
          {/* API Key Entry - only accessible if no valid key */}
          <Route path="/enter-api-key" element={<ApiKeyEntryRoute />} />
          
          {/* Voice Agent - only accessible with valid key */}
          <Route path="/agent" element={<VoiceAgentRoute />} />
          
          {/* Catch-all route - redirects any unknown path to root */}
          <Route path="*" element={<RedirectHandler />} />
        </Routes>
      </div>
    </Router>
  );
}

function RedirectHandler() {
  const { hasValidKey, isLoading } = useApiKey();
  
  console.log('🔀 [RedirectHandler] Checking redirect:', { hasValidKey, isLoading });
  
  // Show loading while checking API key
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect based on API key status
  if (hasValidKey) {
    console.log('🔀 [RedirectHandler] Valid key found, redirecting to agent');
    return <Navigate to="/agent" replace />;
  } else {
    console.log('🔀 [RedirectHandler] No valid key, redirecting to API key entry');
    return <Navigate to="/enter-api-key" replace />;
  }
}

function ApiKeyEntryRoute() {
  const { hasValidKey, isLoading } = useApiKey();
  
  console.log('🔑 [ApiKeyEntryRoute] Checking access:', { hasValidKey, isLoading });
  
  // If loading, show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Checking access...</p>
        </div>
      </div>
    );
  }
  
  // If they already have a valid key, redirect to agent
  if (hasValidKey) {
    console.log('🔑 [ApiKeyEntryRoute] Already has valid key, redirecting to agent');
    return <Navigate to="/agent" replace />;
  }
  
  // Show API key entry form
  return <ApiKeyEntry />;
}

function VoiceAgentRoute() {
  const { hasValidKey, isLoading } = useApiKey();
  
  console.log('🤖 [VoiceAgentRoute] Checking access:', { hasValidKey, isLoading });
  
  // If loading, show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  // If no valid key, redirect to API key entry
  if (!hasValidKey) {
    console.log('🤖 [VoiceAgentRoute] No valid key, redirecting to API key entry');
    return <Navigate to="/enter-api-key" replace />;
  }
  
  // Show voice agent
  return <VoiceAgent />;
}

export default App;