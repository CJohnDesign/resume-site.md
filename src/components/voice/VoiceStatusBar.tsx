import React from 'react';
import { InterviewStep, getActiveSteps } from '../../config/interviewSteps';
import { ProgressBar } from '../ui/ProgressBar';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';

interface JobLoopState {
  isActive: boolean;
  currentJobIndex: number;
  totalJobs: number;
  progressMessage: string;
}

interface VoiceStatusBarProps {
  hasStarted: boolean;
  buttonState: 'start' | 'speaking' | 'listening' | 'processing' | 'active' | 'paused';
  currentStep?: InterviewStep | null;
  progressPercentage: number;
  errorState?: {
    hasError: boolean;
    message: string;
    retryCount: number;
    maxRetries: number;
  };
  jobLoopState?: JobLoopState;
}

export function VoiceStatusBar({ 
  hasStarted, 
  currentStep, 
  progressPercentage, 
  errorState,
  jobLoopState 
}: VoiceStatusBarProps) {
  if (!hasStarted) return null;

  const activeSteps = getActiveSteps();
  const currentStepIndex = activeSteps.findIndex(step => step.id === currentStep?.id);
  const stepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  const shouldShowError = errorState?.hasError;

  // Determine display title based on job loop state
  const getDisplayTitle = () => {
    if (jobLoopState?.isActive && currentStep?.isDynamicLoop) {
      return `${currentStep.title} (${jobLoopState.currentJobIndex + 1}/${jobLoopState.totalJobs})`;
    }
    return currentStep?.title || 'Getting Started';
  };

  // Determine display subtitle for job loop
  const getDisplaySubtitle = () => {
    if (jobLoopState?.isActive && currentStep?.isDynamicLoop) {
      return jobLoopState.progressMessage;
    }
    return null;
  };

  return (
    <div className="w-full flex justify-center py-6">
      <Card
        variant="glass"
        padding="md"
        hover
        className={`flex items-center justify-between w-full max-w-2xl mx-6 animate-slide-in-bottom ${
          shouldShowError
            ? 'border-red-500/50 hover:border-red-400/50' 
            : 'hover:border-gray-600/50'
        }`}
      >
        
        {/* Left Side - Current Step Label */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-3">
            <Typography
              variant="body2"
              color={shouldShowError ? 'error' : 'primary'}
              weight="medium"
            >
              {getDisplayTitle()}
            </Typography>
            
            {/* Error Retry Counter */}
            {shouldShowError && errorState.retryCount > 0 && (
              <>
                <div className="w-px h-4 bg-red-600/50"></div>
                <Typography variant="body2" color="error" weight="medium" className="text-xs">
                  Retry {errorState.retryCount}/{errorState.maxRetries}
                </Typography>
              </>
            )}
          </div>
          
          {/* Job Loop Subtitle */}
          {getDisplaySubtitle() && (
            <Typography variant="caption" color="muted" className="text-xs">
              {getDisplaySubtitle()}
            </Typography>
          )}
        </div>

        {/* Right Side - Progress */}
        <div className="flex items-center space-x-3">
          <Typography variant="body2" color="muted" weight="medium" className="text-sm">
            Step {stepNumber} of {activeSteps.length}
          </Typography>
          
          <div className="w-24">
            <ProgressBar
              value={progressPercentage}
              size="md"
              variant={shouldShowError ? 'error' : 'primary'}
              animated
            />
          </div>
          
          <Typography
            variant="body2"
            color={shouldShowError ? 'error' : 'accent'}
            weight="medium"
            className="text-sm min-w-[3rem] text-right"
          >
            {progressPercentage}%
          </Typography>
        </div>
      </Card>
    </div>
  );
}