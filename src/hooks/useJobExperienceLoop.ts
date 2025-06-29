import { useState, useEffect, useCallback } from 'react';
import { InterviewState, LinkedInExperience, JobExperienceDetail } from '../types/interview';

export interface JobExperienceLoopState {
  currentJobIndex: number;
  totalJobsToDiscuss: number;
  isLoopActive: boolean;
  isLoopComplete: boolean;
  currentJob: LinkedInExperience | null;
  jobsToDiscuss: LinkedInExperience[];
  actualJobIndex: number;
  isTransitioning: boolean; // NEW: Track internal transitions
  lastUpdateTimestamp: number; // NEW: Track when state was last updated
}

export function useJobExperienceLoop(interviewState: InterviewState) {
  const [loopState, setLoopState] = useState<JobExperienceLoopState>({
    currentJobIndex: 0,
    totalJobsToDiscuss: 0,
    isLoopActive: false,
    isLoopComplete: false,
    currentJob: null,
    jobsToDiscuss: [],
    actualJobIndex: 0,
    isTransitioning: false,
    lastUpdateTimestamp: Date.now()
  });

  // FIXED: Memoized state update function to prevent unnecessary re-renders
  const updateLoopState = useCallback((updates: Partial<JobExperienceLoopState>) => {
    setLoopState(prev => {
      const newState = {
        ...prev,
        ...updates,
        lastUpdateTimestamp: Date.now()
      };
      
      console.log('🔄 [JobExperienceLoop] State updated:', {
        currentJobIndex: newState.currentJobIndex,
        totalJobs: newState.totalJobsToDiscuss,
        currentJobTitle: newState.currentJob?.title,
        isTransitioning: newState.isTransitioning,
        timestamp: newState.lastUpdateTimestamp
      });
      
      return newState;
    });
  }, []);

  // FIXED: Initialize the loop with proper synchronization
  useEffect(() => {
    const shouldInitialize = interviewState.linkedinParsedData?.experience && 
                            interviewState.linkedinParsedData.experience.length > 0 && 
                            !loopState.isLoopActive &&
                            interviewState.currentStep === 5;

    if (shouldInitialize) {
      console.log('🔄 [JobExperienceLoop] Initializing job experience loop with synchronization');
      
      const allJobs = interviewState.linkedinParsedData.experience;
      const jobsToDiscuss = allJobs.slice(0, Math.min(2, allJobs.length));
      const firstJob = jobsToDiscuss[0] || null;
      
      console.log('🔄 [JobExperienceLoop] Jobs selected for discussion:', 
        jobsToDiscuss.map((job, index) => `${index}. ${job.title} at ${job.company}`));
      
      // FIXED: Atomic state update to prevent race conditions
      updateLoopState({
        currentJobIndex: 0,
        totalJobsToDiscuss: jobsToDiscuss.length,
        isLoopActive: true,
        isLoopComplete: false,
        currentJob: firstJob,
        jobsToDiscuss,
        actualJobIndex: 0,
        isTransitioning: false
      });
    }
  }, [interviewState.linkedinParsedData?.experience, interviewState.currentStep, loopState.isLoopActive, updateLoopState]);

  // FIXED: Synchronized job advancement with proper state management
  const moveToNextJob = useCallback((): boolean => {
    console.log('🔄 [JobExperienceLoop] moveToNextJob called with state:', {
      currentJobIndex: loopState.currentJobIndex,
      totalJobsToDiscuss: loopState.totalJobsToDiscuss,
      isTransitioning: loopState.isTransitioning
    });
    
    // FIXED: Prevent multiple simultaneous transitions
    if (loopState.isTransitioning) {
      console.log('⚠️ [JobExperienceLoop] Already transitioning, ignoring moveToNextJob');
      return loopState.currentJobIndex < loopState.totalJobsToDiscuss - 1;
    }
    
    if (loopState.currentJobIndex < loopState.totalJobsToDiscuss - 1) {
      const nextIndex = loopState.currentJobIndex + 1;
      const nextJob = loopState.jobsToDiscuss[nextIndex];
      
      console.log('🔄 [JobExperienceLoop] Moving to job index:', nextIndex, '-', 
        `${nextJob?.title} at ${nextJob?.company}`);
      
      // FIXED: Set transitioning state first, then update job
      updateLoopState({
        isTransitioning: true
      });
      
      // FIXED: Use setTimeout to ensure UI has time to update
      setTimeout(() => {
        updateLoopState({
          currentJobIndex: nextIndex,
          actualJobIndex: nextIndex,
          currentJob: nextJob,
          isTransitioning: false
        });
      }, 100); // Small delay to ensure state synchronization
      
      return true;
    } else {
      console.log('🔄 [JobExperienceLoop] All jobs discussed, completing loop');
      
      updateLoopState({
        isLoopComplete: true,
        isLoopActive: false,
        isTransitioning: false
      });
      
      return false;
    }
  }, [loopState.currentJobIndex, loopState.totalJobsToDiscuss, loopState.jobsToDiscuss, loopState.isTransitioning, updateLoopState]);

  const saveJobExperience = useCallback((jobExperience: JobExperienceDetail): void => {
    console.log('🔄 [JobExperienceLoop] Saving job experience for index:', loopState.actualJobIndex);
    console.log('🔄 [JobExperienceLoop] Job data:', {
      jobTitle: jobExperience.jobTitle,
      company: jobExperience.company,
      achievements: jobExperience.achievements?.substring(0, 50) + '...'
    });
  }, [loopState.actualJobIndex]);

  // FIXED: Memoized context message generation with current state
  const getJobContextMessage = useCallback((): string => {
    if (!loopState.currentJob) {
      return "Let's start with your most recent position.";
    }

    const isFirst = loopState.currentJobIndex === 0;
    const isLast = loopState.currentJobIndex === loopState.totalJobsToDiscuss - 1;
    const job = loopState.currentJob;

    if (isFirst) {
      return `Let's talk about your most recent role as ${job.title} at ${job.company}. What was your biggest achievement in this position?`;
    } else if (isLast) {
      return `Now let's discuss your previous role as ${job.title} at ${job.company}. What were the key highlights of this position?`;
    } else {
      return `Great! Now let's talk about your role as ${job.title} at ${job.company}. What were your main accomplishments there?`;
    }
  }, [loopState.currentJob, loopState.currentJobIndex, loopState.totalJobsToDiscuss]);

  // FIXED: Synchronized progress message with proper state tracking
  const getProgressMessage = useCallback((): string => {
    // FIXED: Ensure we use the most current state
    const current = loopState.currentJobIndex + 1;
    const total = loopState.totalJobsToDiscuss;
    const currentJobTitle = loopState.currentJob?.title || 'Current Position';
    
    const message = `${currentJobTitle} (${current} of ${total})`;
    
    console.log('📊 [JobExperienceLoop] Generated progress message:', message, {
      currentIndex: loopState.currentJobIndex,
      total: loopState.totalJobsToDiscuss,
      timestamp: loopState.lastUpdateTimestamp
    });
    
    return message;
  }, [loopState.currentJobIndex, loopState.totalJobsToDiscuss, loopState.currentJob?.title, loopState.lastUpdateTimestamp]);

  const shouldAdvanceToNextStep = useCallback((): boolean => {
    return loopState.isLoopComplete;
  }, [loopState.isLoopComplete]);

  const resetLoop = useCallback((): void => {
    console.log('🔄 [JobExperienceLoop] Resetting loop');
    updateLoopState({
      currentJobIndex: 0,
      totalJobsToDiscuss: 0,
      isLoopActive: false,
      isLoopComplete: false,
      currentJob: null,
      jobsToDiscuss: [],
      actualJobIndex: 0,
      isTransitioning: false
    });
  }, [updateLoopState]);

  // FIXED: Enhanced context with better synchronization
  const getJobLoopContext = useCallback(() => {
    if (!loopState.isLoopActive || !loopState.currentJob) {
      console.log('🔄 [JobExperienceLoop] No job context - loop not active or no current job');
      return null;
    }

    const nextJobIndex = loopState.currentJobIndex + 1;
    const nextJob = nextJobIndex < loopState.totalJobsToDiscuss ? 
      loopState.jobsToDiscuss[nextJobIndex] : null;

    const context = {
      jobContext: getJobContextMessage(),
      currentJob: loopState.currentJob,
      jobIndex: loopState.actualJobIndex,
      totalJobs: loopState.totalJobsToDiscuss,
      hasMoreJobs: loopState.currentJobIndex < loopState.totalJobsToDiscuss - 1,
      nextJob,
      isTransitioning: loopState.isTransitioning // NEW: Include transition state
    };

    console.log('🔄 [JobExperienceLoop] Generated job context:', {
      currentJobTitle: context.currentJob.title,
      jobIndex: context.jobIndex,
      totalJobs: context.totalJobs,
      hasMoreJobs: context.hasMoreJobs,
      isTransitioning: context.isTransitioning,
      timestamp: loopState.lastUpdateTimestamp
    });

    return context;
  }, [loopState, getJobContextMessage]);

  return {
    loopState,
    moveToNextJob,
    saveJobExperience,
    getJobContextMessage,
    getProgressMessage,
    shouldAdvanceToNextStep,
    resetLoop,
    getJobLoopContext,
    // Helper getters with proper memoization
    isLoopActive: loopState.isLoopActive,
    isLoopComplete: loopState.isLoopComplete,
    currentJob: loopState.currentJob,
    currentJobIndex: loopState.currentJobIndex,
    totalJobsToDiscuss: loopState.totalJobsToDiscuss,
    hasMoreJobs: loopState.currentJobIndex < loopState.totalJobsToDiscuss - 1,
    actualJobIndex: loopState.actualJobIndex,
    isTransitioning: loopState.isTransitioning // NEW: Expose transition state
  };
}