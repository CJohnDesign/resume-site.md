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
    console.log('🔄 [InterviewState] State update requested:', {
      keys: Object.keys(updates),
      hasPersonalInfo: !!updates.personalInfo,
      hasLinkedinData: !!updates.linkedinParsedData,
      hasCareerObjectives: !!updates.careerObjectives,
      hasJobExperiences: !!updates.jobExperiences,
      hasFinalResume: !!updates.resumeWebsitePrompt,
      currentEmail: updates.personalInfo?.email || 'none'
    });
    
    setInterviewState(prev => {
      const newState = {
        ...prev,
        ...updates,
      };

      console.log('🔄 [InterviewState] New state created:', {
        currentStep: newState.currentStep,
        hasName: !!newState.personalInfo.name,
        hasEmail: !!newState.personalInfo.email,
        hasLinkedin: !!newState.personalInfo.linkedin,
        hasLinkedinData: !!newState.linkedinParsedData,
        hasCareerObjectives: !!newState.careerObjectives,
        jobExperienceCount: Object.keys(newState.jobExperiences || {}).length,
        hasFinalResume: !!newState.resumeWebsitePrompt
      });

      // Trigger database save
      console.log('🔄 [InterviewState] Triggering database save...');
      saveToDatabase(newState, updates);
      
      return newState;
    });
  };

  const saveToDatabase = async (fullState: InterviewState, updates: Partial<InterviewState>) => {
    const email = fullState.personalInfo.email;
    
    console.log('📊 [InterviewState] saveToDatabase called:', {
      email: email || 'MISSING',
      updateKeys: Object.keys(updates),
      databaseConnected: database.isConnected,
      hasName: !!fullState.personalInfo.name
    });
    
    // Only save if we have an email
    if (!email) {
      console.log('📊 [InterviewState] No email available, skipping database save');
      return;
    }

    if (!database.isConnected) {
      console.log('📊 [InterviewState] Database not connected, skipping save');
      return;
    }

    try {
      // Save name and email when email is first provided
      if (updates.personalInfo?.email && fullState.personalInfo.name) {
        console.log('📊 [InterviewState] TRIGGERING saveNameAndEmail:', {
          name: fullState.personalInfo.name,
          email: email,
          trigger: 'email provided with name'
        });
        await database.saveNameAndEmail(fullState.personalInfo.name, email);
      }
      // Also save if name is updated and we already have email
      else if (updates.personalInfo?.name && fullState.personalInfo.email) {
        console.log('📊 [InterviewState] TRIGGERING saveNameAndEmail:', {
          name: fullState.personalInfo.name,
          email: email,
          trigger: 'name provided with existing email'
        });
        await database.saveNameAndEmail(fullState.personalInfo.name, email);
      }

      // Save LinkedIn URL when provided
      if (updates.personalInfo?.linkedin) {
        console.log('📊 [InterviewState] TRIGGERING saveLinkedInUrl');
        await database.saveLinkedInUrl(email, fullState.personalInfo.linkedin);
      }

      // Save LinkedIn data when parsed
      if (updates.linkedinParsedData) {
        console.log('📊 [InterviewState] TRIGGERING saveLinkedInData');
        await database.saveLinkedInData(
          email,
          fullState.linkedinRawData || '',
          fullState.linkedinParsedData
        );
      }

      // Save career objectives
      if (updates.careerObjectives || updates.careerObjectivesReport) {
        console.log('📊 [InterviewState] TRIGGERING saveCareerObjectives');
        await database.saveCareerObjectives(
          email,
          fullState.careerObjectives || '',
          fullState.careerObjectivesReport
        );
      }

      // Save job experiences (when individual jobs are updated)
      if (updates.jobExperiences || updates.jobExperienceReports) {
        console.log('📊 [InterviewState] TRIGGERING saveJobExperience');
        
        // Find which job was updated and save it
        const currentJobs = fullState.jobExperiences || {};
        const currentReports = fullState.jobExperienceReports || {};
        
        console.log('📊 [InterviewState] Job data to save:', {
          jobCount: Object.keys(currentJobs).length,
          reportCount: Object.keys(currentReports).length,
          jobIndices: Object.keys(currentJobs),
          reportIndices: Object.keys(currentReports)
        });
        
        // Save each job experience
        for (const [jobIndex, jobData] of Object.entries(currentJobs)) {
          const jobReport = currentReports[parseInt(jobIndex)];
          console.log('📊 [InterviewState] Saving job:', {
            index: jobIndex,
            title: jobData?.jobTitle,
            hasReport: !!jobReport
          });
          await database.saveJobExperience(email, parseInt(jobIndex), jobData, jobReport);
        }
      }

      // Save final resume markdown
      if (updates.resumeWebsitePrompt) {
        console.log('📊 [InterviewState] TRIGGERING saveFinalResume');
        await database.saveFinalResume(email, fullState.resumeWebsitePrompt);
      }

    } catch (error) {
      // Silent failure - never interrupt user experience
      console.error('📊 [InterviewState] Database save failed silently:', error);
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