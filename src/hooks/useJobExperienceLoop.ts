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
  isTransitioning: boolean;
  lastUpdateTimestamp: number;
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
        isComplete: newState.isLoopComplete,
        timestamp: newState.lastUpdateTimestamp
      });
      
      return newState;
    });
  }, []);

  // Initialize the loop with exactly 2 jobs
  useEffect(() => {
    const shouldInitialize = interviewState.linkedinParsedData?.experience && 
                            interviewState.linkedinParsedData.experience.length > 0 && 
                            !loopState.isLoopActive &&
                            interviewState.currentStep === 5;

    if (shouldInitialize) {
      console.log('🔄 [JobExperienceLoop] Initializing job experience loop');
      
      const allJobs = interviewState.linkedinParsedData.experience;
      // FIXED: Always limit to exactly 2 jobs maximum
      const jobsToDiscuss = allJobs.slice(0, 2);
      const firstJob = jobsToDiscuss[0] || null;
      
      console.log('🔄 [JobExperienceLoop] Jobs selected for discussion (max 2):', 
        jobsToDiscuss.map((job, index) => `${index}. ${job.title} at ${job.company}`));
      
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

  // FIXED: Enhanced job advancement with proper bounds checking
  const moveToNextJob = useCallback((): boolean => {
    console.log('🔄 [JobExperienceLoop] moveToNextJob called with state:', {
      currentJobIndex: loopState.currentJobIndex,
      totalJobsToDiscuss: loopState.totalJobsToDiscuss,
      isTransitioning: loopState.isTransitioning,
      isComplete: loopState.isLoopComplete
    });
    
    // Prevent multiple simultaneous transitions
    if (loopState.isTransitioning || loopState.isLoopComplete) {
      console.log('⚠️ [JobExperienceLoop] Already transitioning or complete, ignoring moveToNextJob');
      return false;
    }
    
    const nextIndex = loopState.currentJobIndex + 1;
    
    // FIXED: Strict bounds checking - only advance if within our selected jobs
    if (nextIndex < loopState.totalJobsToDiscuss && nextIndex < loopState.jobsToDiscuss.length) {
      const nextJob = loopState.jobsToDiscuss[nextIndex];
      
      console.log('🔄 [JobExperienceLoop] Moving to job index:', nextIndex, '-', 
        `${nextJob?.title} at ${nextJob?.company}`);
      
      // Set transitioning state first
      updateLoopState({
        isTransitioning: true
      });
      
      // Update job after small delay for UI synchronization
      setTimeout(() => {
        updateLoopState({
          currentJobIndex: nextIndex,
          actualJobIndex: nextIndex,
          currentJob: nextJob,
          isTransitioning: false
        });
      }, 100);
      
      return true;
    } else {
      console.log('🔄 [JobExperienceLoop] All selected jobs discussed, completing loop');
      console.log('🔄 [JobExperienceLoop] Final state:', {
        discussedJobs: loopState.currentJobIndex + 1,
        totalSelected: loopState.totalJobsToDiscuss,
        jobTitles: loopState.jobsToDiscuss.map(job => job.title)
      });
      
      updateLoopState({
        isLoopComplete: true,
        isLoopActive: false,
        isTransitioning: false
      });
      
      return false;
    }
  }, [loopState.currentJobIndex, loopState.totalJobsToDiscuss, loopState.jobsToDiscuss, loopState.isTransitioning, loopState.isLoopComplete, updateLoopState]);

  const saveJobExperience = useCallback((jobExperience: JobExperienceDetail): void => {
    console.log('🔄 [JobExperienceLoop] Saving job experience for index:', loopState.actualJobIndex);
    console.log('🔄 [JobExperienceLoop] Job data:', {
      jobTitle: jobExperience.jobTitle,
      company: jobExperience.company,
      achievements: jobExperience.achievements?.substring(0, 50) + '...'
    });
  }, [loopState.actualJobIndex]);

  // FIXED: Enhanced context message with proper job bounds checking
  const getJobContextMessage = useCallback((): string => {
    if (!loopState.currentJob || loopState.currentJobIndex >= loopState.jobsToDiscuss.length) {
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
  }, [loopState.currentJob, loopState.currentJobIndex, loopState.totalJobsToDiscuss, loopState.jobsToDiscuss]);

  // FIXED: Progress message with accurate job counting
  const getProgressMessage = useCallback((): string => {
    const current = loopState.currentJobIndex + 1;
    const total = loopState.totalJobsToDiscuss;
    const currentJobTitle = loopState.currentJob?.title || 'Current Position';
    
    const message = `${currentJobTitle} (${current} of ${total})`;
    
    console.log('📊 [JobExperienceLoop] Generated progress message:', message, {
      currentIndex: loopState.currentJobIndex,
      total: loopState.totalJobsToDiscuss,
      withinBounds: loopState.currentJobIndex < loopState.jobsToDiscuss.length,
      timestamp: loopState.lastUpdateTimestamp
    });
    
    return message;
  }, [loopState.currentJobIndex, loopState.totalJobsToDiscuss, loopState.currentJob?.title, loopState.jobsToDiscuss.length, loopState.lastUpdateTimestamp]);

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

  // FIXED: Enhanced context with strict bounds checking
  const getJobLoopContext = useCallback(() => {
    if (!loopState.isLoopActive || !loopState.currentJob || loopState.currentJobIndex >= loopState.jobsToDiscuss.length) {
      console.log('🔄 [JobExperienceLoop] No job context - loop not active, no current job, or index out of bounds');
      return null;
    }

    const nextJobIndex = loopState.currentJobIndex + 1;
    const nextJob = nextJobIndex < loopState.totalJobsToDiscuss && nextJobIndex < loopState.jobsToDiscuss.length ? 
      loopState.jobsToDiscuss[nextJobIndex] : null;

    const context = {
      jobContext: getJobContextMessage(),
      currentJob: loopState.currentJob,
      jobIndex: loopState.actualJobIndex,
      totalJobs: loopState.totalJobsToDiscuss,
      hasMoreJobs: nextJobIndex < loopState.totalJobsToDiscuss && nextJobIndex < loopState.jobsToDiscuss.length,
      nextJob,
      isTransitioning: loopState.isTransitioning
    };

    console.log('🔄 [JobExperienceLoop] Generated job context:', {
      currentJobTitle: context.currentJob.title,
      jobIndex: context.jobIndex,
      totalJobs: context.totalJobs,
      hasMoreJobs: context.hasMoreJobs,
      nextJobTitle: context.nextJob?.title || 'None',
      isTransitioning: context.isTransitioning,
      withinBounds: loopState.currentJobIndex < loopState.jobsToDiscuss.length,
      timestamp: loopState.lastUpdateTimestamp
    });

    return context;
  }, [loopState, getJobContextMessage, loopState.jobsToDiscuss.length]);

  return {
    loopState,
    moveToNextJob,
    saveJobExperience,
    getJobContextMessage,
    getProgressMessage,
    shouldAdvanceToNextStep,
    resetLoop,
    getJobLoopContext,
    // Helper getters with proper bounds checking
    isLoopActive: loopState.isLoopActive,
    isLoopComplete: loopState.isLoopComplete,
    currentJob: loopState.currentJob,
    currentJobIndex: loopState.currentJobIndex,
    totalJobsToDiscuss: loopState.totalJobsToDiscuss,
    hasMoreJobs: loopState.currentJobIndex + 1 < loopState.totalJobsToDiscuss && loopState.currentJobIndex + 1 < loopState.jobsToDiscuss.length,
    actualJobIndex: loopState.actualJobIndex,
    isTransitioning: loopState.isTransitioning
  };
}