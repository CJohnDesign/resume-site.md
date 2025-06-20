import { useState, useEffect } from 'react';
import { InterviewState, LinkedInExperience, JobExperienceDetail } from '../types/interview';

export interface JobExperienceLoopState {
  currentJobIndex: number;
  totalJobsToDiscuss: number;
  isLoopActive: boolean;
  isLoopComplete: boolean;
  currentJob: LinkedInExperience | null;
  jobsToDiscuss: LinkedInExperience[];
  actualJobIndex: number; // Track the actual index in the original LinkedIn array
}

export function useJobExperienceLoop(interviewState: InterviewState) {
  const [loopState, setLoopState] = useState<JobExperienceLoopState>({
    currentJobIndex: 0,
    totalJobsToDiscuss: 0,
    isLoopActive: false,
    isLoopComplete: false,
    currentJob: null,
    jobsToDiscuss: [],
    actualJobIndex: 0
  });

  // FIXED: Initialize the loop when we have LinkedIn data and we're on the job experience step
  useEffect(() => {
    const shouldInitialize = interviewState.linkedinParsedData?.experience && 
                            interviewState.linkedinParsedData.experience.length > 0 && 
                            !loopState.isLoopActive &&
                            interviewState.currentStep === 5; // Only initialize on job experience step

    if (shouldInitialize) {
      console.log('🔄 [JobExperienceLoop] Initializing job experience loop');
      
      // FIXED: Get the most recent 2 jobs (LinkedIn data is already in reverse chronological order)
      const allJobs = interviewState.linkedinParsedData.experience;
      const jobsToDiscuss = allJobs.slice(0, Math.min(2, allJobs.length));
      
      console.log('🔄 [JobExperienceLoop] All LinkedIn jobs:', 
        allJobs.map((job, index) => `${index}. ${job.title} at ${job.company} (${job.duration})`));
      
      console.log('🔄 [JobExperienceLoop] Jobs selected for discussion (most recent 2):', 
        jobsToDiscuss.map((job, index) => `${index}. ${job.title} at ${job.company} (${job.duration})`));
      
      setLoopState({
        currentJobIndex: 0,
        totalJobsToDiscuss: jobsToDiscuss.length,
        isLoopActive: true,
        isLoopComplete: false,
        currentJob: jobsToDiscuss[0] || null,
        jobsToDiscuss,
        actualJobIndex: 0 // Start with index 0 for the first job in our subset
      });
    }
  }, [interviewState.linkedinParsedData?.experience, interviewState.currentStep, loopState.isLoopActive]);

  // FIXED: Update current job when index changes
  useEffect(() => {
    if (loopState.isLoopActive && loopState.jobsToDiscuss.length > 0) {
      const currentJob = loopState.jobsToDiscuss[loopState.currentJobIndex] || null;
      
      if (currentJob) {
        console.log('🔄 [JobExperienceLoop] Current job updated:', 
          `Index ${loopState.currentJobIndex}: ${currentJob.title} at ${currentJob.company} (${currentJob.duration})`);
        
        setLoopState(prev => ({
          ...prev,
          currentJob,
          actualJobIndex: loopState.currentJobIndex // Keep actualJobIndex in sync
        }));
      }
    }
  }, [loopState.currentJobIndex, loopState.isLoopActive, loopState.jobsToDiscuss]);

  const moveToNextJob = (): boolean => {
    console.log('🔄 [JobExperienceLoop] moveToNextJob called. Current state:', {
      currentJobIndex: loopState.currentJobIndex,
      totalJobsToDiscuss: loopState.totalJobsToDiscuss,
      hasMoreJobs: loopState.currentJobIndex < loopState.totalJobsToDiscuss - 1
    });
    
    if (loopState.currentJobIndex < loopState.totalJobsToDiscuss - 1) {
      const nextIndex = loopState.currentJobIndex + 1;
      const nextJob = loopState.jobsToDiscuss[nextIndex];
      
      console.log('🔄 [JobExperienceLoop] Moving to job index:', nextIndex, '-', 
        `${nextJob?.title} at ${nextJob?.company} (${nextJob?.duration})`);
      
      setLoopState(prev => ({
        ...prev,
        currentJobIndex: nextIndex,
        actualJobIndex: nextIndex // Keep in sync for consistent indexing
      }));
      
      return true; // More jobs to discuss
    } else {
      console.log('🔄 [JobExperienceLoop] All jobs discussed, completing loop');
      
      setLoopState(prev => ({
        ...prev,
        isLoopComplete: true,
        isLoopActive: false
      }));
      
      return false; // Loop complete
    }
  };

  const saveJobExperience = (jobExperience: JobExperienceDetail): void => {
    console.log('🔄 [JobExperienceLoop] Saving job experience for index:', loopState.actualJobIndex);
    console.log('🔄 [JobExperienceLoop] Job data:', {
      jobTitle: jobExperience.jobTitle,
      company: jobExperience.company,
      achievements: jobExperience.achievements?.substring(0, 50) + '...'
    });
    
    // This will be used by the parent component to update the interview state
    // The actual state update happens in the parent component
  };

  const getJobContextMessage = (): string => {
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
  };

  const getProgressMessage = (): string => {
    const current = loopState.currentJobIndex + 1;
    const total = loopState.totalJobsToDiscuss;
    const currentJobTitle = loopState.currentJob?.title || 'Current Position';
    return `${currentJobTitle} (${current} of ${total})`;
  };

  const shouldAdvanceToNextStep = (): boolean => {
    return loopState.isLoopComplete;
  };

  const resetLoop = (): void => {
    console.log('🔄 [JobExperienceLoop] Resetting loop');
    setLoopState({
      currentJobIndex: 0,
      totalJobsToDiscuss: 0,
      isLoopActive: false,
      isLoopComplete: false,
      currentJob: null,
      jobsToDiscuss: [],
      actualJobIndex: 0
    });
  };

  // FIXED: Enhanced context for AI with better job information
  const getJobLoopContext = () => {
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
      jobIndex: loopState.actualJobIndex, // Use consistent actualJobIndex for state updates
      totalJobs: loopState.totalJobsToDiscuss,
      hasMoreJobs: loopState.currentJobIndex < loopState.totalJobsToDiscuss - 1,
      nextJob // Include next job for better AI transitions
    };

    console.log('🔄 [JobExperienceLoop] Generated job context:', {
      currentJobTitle: context.currentJob.title,
      currentJobCompany: context.currentJob.company,
      jobIndex: context.jobIndex,
      totalJobs: context.totalJobs,
      hasMoreJobs: context.hasMoreJobs,
      nextJobTitle: context.nextJob?.title
    });

    return context;
  };

  return {
    loopState,
    moveToNextJob,
    saveJobExperience,
    getJobContextMessage,
    getProgressMessage,
    shouldAdvanceToNextStep,
    resetLoop,
    getJobLoopContext,
    // Helper getters
    isLoopActive: loopState.isLoopActive,
    isLoopComplete: loopState.isLoopComplete,
    currentJob: loopState.currentJob,
    currentJobIndex: loopState.currentJobIndex,
    totalJobsToDiscuss: loopState.totalJobsToDiscuss,
    hasMoreJobs: loopState.currentJobIndex < loopState.totalJobsToDiscuss - 1,
    actualJobIndex: loopState.actualJobIndex
  };
}