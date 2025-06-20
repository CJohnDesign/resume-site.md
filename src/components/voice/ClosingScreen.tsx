import React, { useState } from 'react';
import { Download, FileText, ExternalLink, Copy, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { InterviewState } from '../../types/interview';
import { generateResumeWebsitePrompt } from '../../utils/resumeGenerator';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Typography } from '../ui/Typography';

interface ClosingScreenProps {
  interviewState: InterviewState;
  onRestartSession?: () => void;
}

export function ClosingScreen({ interviewState, onRestartSession }: ClosingScreenProps) {
  const [showBoltModal, setShowBoltModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const resumeContent = generateResumeWebsitePrompt(interviewState);

  const handleStartBuilding = async () => {
    try {
      // Download the file
      const blob = new Blob([resumeContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${interviewState.personalInfo.name?.replace(/\s+/g, '_') || 'resume'}_website_instructions.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Copy to clipboard
      await navigator.clipboard.writeText(resumeContent);
      
      // Show the Bolt modal
      setShowBoltModal(true);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Still show modal even if clipboard fails
      setShowBoltModal(true);
    }
  };

  const handleCopyInstructions = async () => {
    try {
      await navigator.clipboard.writeText(resumeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleGoToBolt = () => {
    window.open('https://bolt.new', '_blank');
  };

  const handleRestartSession = () => {
    if (window.confirm('Are you sure you want to start a new interview session? This will clear all your current progress and refresh the page.')) {
      // Clear any stored data
      localStorage.removeItem('career_assistant_interview_state');
      
      // Call the restart callback if provided
      onRestartSession?.();
      
      // Force a complete page refresh to ensure everything starts fresh
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Split Screen Layout with higher z-index */}
      <div className="fixed inset-0 flex animate-slide-in-right z-[10000]">
        
        {/* Left Column - Main Content (pushed left) */}
        <div className="w-1/2 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-out relative">
          
          {/* Restart Session Button - Bottom Left */}
          <div className="absolute bottom-8 left-8">
            <Button
              variant="ghost"
              size="md"
              onClick={handleRestartSession}
              leftIcon={<RotateCcw className="w-5 h-5" />}
              className="text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50"
            >
              Start New Session
            </Button>
          </div>
          
          {/* Success Icon and Message */}
          <div className="text-center animate-scale-in">
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/25 animate-pulse">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            
            <Typography variant="h1" color="primary" className="mb-4">
              Website Instructions Ready!
            </Typography>
            
            <Typography variant="h5" color="secondary" className="mb-8 max-w-md">
              Your comprehensive resume website design brief has been generated and is ready for AI to build.
            </Typography>
            
            {/* Summary Cards */}
            <div className="space-y-4 max-w-md">
              <Card variant="glass" padding="md">
                <div className="flex items-center justify-between">
                  <Typography variant="body2" color="muted">Name:</Typography>
                  <Typography variant="body2" color="primary" weight="medium">
                    {interviewState.personalInfo.name}
                  </Typography>
                </div>
              </Card>
              <Card variant="glass" padding="md">
                <div className="flex items-center justify-between">
                  <Typography variant="body2" color="muted">Email:</Typography>
                  <Typography variant="body2" color="primary" weight="medium" className="text-sm">
                    {interviewState.personalInfo.email}
                  </Typography>
                </div>
              </Card>
              <Card variant="glass" padding="md">
                <div className="flex items-center justify-between">
                  <Typography variant="body2" color="muted">LinkedIn:</Typography>
                  <Typography variant="body2" color="primary" weight="medium" className="text-sm">
                    {interviewState.personalInfo.linkedin}
                  </Typography>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Column - Success Drawer */}
        <div className="w-1/2 bg-gray-900/95 backdrop-blur-xl flex flex-col border-l border-gray-700/50">
          
          {/* Header - Fixed */}
          <div className="bg-gray-800/50 border-b border-gray-700/50 p-8 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Typography variant="h3" color="primary">Website Instructions</Typography>
                  <Typography variant="body2" color="muted">Everything needed to build your professional resume site</Typography>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyInstructions}
                leftIcon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                className={copied ? 'text-green-400' : ''}
              >
                {copied ? 'Copied!' : 'Copy All'}
              </Button>
            </div>
          </div>

          {/* Content - Scrollable Area */}
          <div className="flex-1 p-8 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-900/50 rounded-xl border border-gray-700/30">
              <div className="prose prose-invert prose-orange max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-mono p-6 border-0 bg-transparent">
                  {resumeContent}
                </pre>
              </div>
            </div>
          </div>

          {/* Footer - Fixed Download Button */}
          <div className="bg-gray-800/50 px-8 py-6 border-t border-gray-700/50 flex-shrink-0">
            <div className="text-center space-y-4">
              <Typography variant="h6" color="muted">
                Ready to build your professional resume website?
              </Typography>
              <Button
                onClick={handleStartBuilding}
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<ArrowRight className="w-6 h-6" />}
              >
                Download & Build with AI
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bolt Instructions Modal */}
      <Modal
        isOpen={showBoltModal}
        onClose={() => setShowBoltModal(false)}
        size="lg"
        title="Ready to Build Your Website!"
      >
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* What Happened */}
        <Card variant="glass" padding="md" className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Copy className="w-5 h-5 text-green-400" />
              <span>What Just Happened:</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <Typography variant="body2" color="secondary">
                ✅ Downloaded your comprehensive website instructions
              </Typography>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <Typography variant="body2" color="secondary">
                ✅ Copied the complete design brief to your clipboard
              </Typography>
            
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card variant="outlined" padding="md" className="mb-8 border-orange-500/20 bg-orange-500/10">
          <CardHeader>
            <CardTitle className="text-lg">Next Steps:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <Typography variant="body2" color="accent" weight="bold">1.</Typography>
              <Typography variant="body2" color="secondary">
                Click the button below to open Bolt.new
              </Typography>
            </div>
            <div className="flex items-start space-x-3">
              <Typography variant="body2" color="accent" weight="bold">2.</Typography>
              <Typography variant="body2" color="secondary">
                Paste your website instructions into the text box (Ctrl+V or Cmd+V)
              </Typography>
            </div>
            <div className="flex items-start space-x-3">
              <Typography variant="body2" color="accent" weight="bold">3.</Typography>
              <Typography variant="body2" color="secondary">
                Let Bolt's AI build your professional resume website with modern styling and responsive design!
              </Typography>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            onClick={() => setShowBoltModal(false)}
            fullWidth
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleGoToBolt}
            leftIcon={<ExternalLink className="w-5 h-5" />}
            fullWidth
          >
            Open Bolt.new
          </Button>
        </div>
      </Modal>
    </>
  );
}