import { useState, useEffect } from 'react';
import { InterviewState } from '../types/interview';
import { useResumeDatabase } from './useResumeDatabase';

const STORAGE_KEY = 'career_assistant_interview_state';

const initialState: InterviewState = {
  currentStep: 0,
  personalInfo: {
    name: '',
    email: '',
    linkedin: '',
  },
};

export function useInterviewState() {
  const [interviewState, setInterviewState] = useState<InterviewState>(initialState);
  const database = useResumeDatabase();

  useEffect(() => {
    // FIXED: Always start fresh - clear any existing data on component mount
    console.log('🔄 [InterviewState] Starting fresh - clearing any existing interview data');
    localStorage.removeItem(STORAGE_KEY);
    setInterviewState(initialState);
  }, []);

  const updateState = (updates: Partial<InterviewState>) => {
    console.log('🔄 [InterviewState] Updating state:', Object.keys(updates));
    
    setInterviewState(prev => {
      const newState = {
        ...prev,
        ...updates,
      };

      // Silently save to database based on what was updated
      saveToDatabase(newState, updates);
      
      return newState;
    });
  };

  const saveToDatabase = async (fullState: InterviewState, updates: Partial<InterviewState>) => {
    const email = fullState.personalInfo.email;
    
    // Only save if we have an email
    if (!email) {
      console.log('📊 [InterviewState] No email available, skipping database save');
      return;
    }

    console.log('📊 [InterviewState] Database connection status:', database.isConnected);

    try {
      // Save name and email when email is first provided
      if (updates.personalInfo?.email && fullState.personalInfo.name) {
        console.log('📊 [InterviewState] Triggering saveNameAndEmail:', {
          name: fullState.personalInfo.name,
          email: email
        });
        await database.saveNameAndEmail(fullState.personalInfo.name, email);
      }

      // Save LinkedIn URL when provided
      if (updates.personalInfo?.linkedin) {
        console.log('📊 [InterviewState] Triggering saveLinkedInUrl');
        await database.saveLinkedInUrl(email, fullState.personalInfo.linkedin);
      }

      // Save LinkedIn data when parsed
      if (updates.linkedinParsedData) {
        console.log('📊 [InterviewState] Triggering saveLinkedInData');
        await database.saveLinkedInData(
          email,
          fullState.linkedinRawData || '',
          fullState.linkedinParsedData
        );
      }

      // Save career objectives
      if (updates.careerObjectives || updates.careerObjectivesReport) {
        console.log('📊 [InterviewState] Triggering saveCareerObjectives');
        await database.saveCareerObjectives(
          email,
          fullState.careerObjectives || '',
          fullState.careerObjectivesReport
        );
      }

      // Save job experiences (when individual jobs are updated)
      if (updates.jobExperiences || updates.jobExperienceReports) {
        console.log('📊 [InterviewState] Triggering saveJobExperience');
        
        // Find which job was updated and save it
        const currentJobs = fullState.jobExperiences || {};
        const currentReports = fullState.jobExperienceReports || {};
        
        // Save each job experience
        for (const [jobIndex, jobData] of Object.entries(currentJobs)) {
          const jobReport = currentReports[parseInt(jobIndex)];
          await database.saveJobExperience(email, parseInt(jobIndex), jobData, jobReport);
        }
      }

      // Save final resume markdown
      if (updates.resumeWebsitePrompt) {
        console.log('📊 [InterviewState] Triggering saveFinalResume');
        await database.saveFinalResume(email, fullState.resumeWebsitePrompt);
      }

    } catch (error) {
      // Silent failure - never interrupt user experience
      console.log('📊 [InterviewState] Database save failed silently:', error);
    }
  };

  const resetInterview = () => {
    console.log('🔄 [InterviewState] Resetting interview to initial state');
    setInterviewState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    interviewState,
    updateState,
    resetInterview,
  };
}