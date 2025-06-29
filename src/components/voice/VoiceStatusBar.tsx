import React, { useMemo } from 'react';
import { InterviewStep, getActiveSteps } from '../../config/interviewSteps';
import { ProgressBar } from '../ui/ProgressBar';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';

interface JobLoopState {
  isActive: boolean;
  currentJobIndex: number;
  totalJobs: number;
  progressMessage: string;
  isTransitioning?: boolean; // NEW: Track if job loop is transitioning
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

  // FIXED: Memoized display calculations to prevent unnecessary re-renders
  const displayInfo = useMemo(() => {
    console.log('📊 [VoiceStatusBar] Calculating display info:', {
      currentStepName: currentStep?.name,
      jobLoopActive: jobLoopState?.isActive,
      jobLoopTransitioning: jobLoopState?.isTransitioning,
      currentJobIndex: jobLoopState?.currentJobIndex,
      totalJobs: jobLoopState?.totalJobs,
      progressMessage: jobLoopState?.progressMessage
    });

    // FIXED: Handle job loop display with transition awareness
    if (jobLoopState?.isActive && currentStep?.isDynamicLoop) {
      // FIXED: Show transitioning state during job changes
      if (jobLoopState.isTransitioning) {
        return {
          title: `${currentStep.title} (Transitioning...)`,
          subtitle: 'Moving to next position...'
        };
      }
      
      const current = jobLoopState.currentJobIndex + 1;
      const total = jobLoopState.totalJobs;
      
      return {
        title: `${currentStep.title} (${current} of ${total})`,
        subtitle: jobLoopState.progressMessage || `Position ${current} of ${total}`
      };
    }

    return {
      title: currentStep?.title || 'Getting Started',
      subtitle: null
    };
  }, [currentStep, jobLoopState]);

  // FIXED: Memoized error display to prevent flicker
  const errorDisplay = useMemo(() => {
    if (!shouldShowError || !errorState) return null;

    return {
      showRetryCounter: errorState.retryCount > 0,
      retryText: `Retry ${errorState.retryCount}/${errorState.maxRetries}`
    };
  }, [shouldShowError, errorState]);

  console.log('📊 [VoiceStatusBar] Rendering with display info:', displayInfo);

  return (
    <div className="w-full flex justify-center py-6">
      <Card
        variant="glass"
        padding="md"
        hover
        className={`flex items-center justify-between w-full max-w-2xl mx-6 animate-slide-in-bottom transition-all duration-300 ${
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
              className="transition-all duration-300"
            >
              {displayInfo.title}
            </Typography>
            
            {/* Error Retry Counter */}
            {errorDisplay?.showRetryCounter && (
              <>
                <div className="w-px h-4 bg-red-600/50 transition-all"></div>
                <Typography variant="body2" color="error" weight="medium" className="text-xs transition-all">
                  {errorDisplay.retryText}
                </Typography>
              </>
            )}
          </div>
          
          {/* Job Loop Subtitle with smooth transitions */}
          {displayInfo.subtitle && (
            <Typography 
              variant="caption" 
              color="muted" 
              className="text-xs transition-all duration-500 ease-out"
            >
              {displayInfo.subtitle}
            </Typography>
          )}
        </div>

        {/* Right Side - Progress */}
        <div className="flex items-center space-x-3">
          <Typography 
            variant="body2" 
            color="muted" 
            weight="medium" 
            className="text-sm transition-all duration-300"
          >
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
            className="text-sm min-w-[3rem] text-right transition-all duration-300"
          >
            {progressPercentage}%
          </Typography>
        </div>
      </Card>
    </div>
  );
}