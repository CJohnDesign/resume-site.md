import { useState, useEffect } from 'react';
import { InterviewState } from '../types/interview';

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

  useEffect(() => {
    // FIXED: Always start fresh - clear any existing data on component mount
    console.log('🔄 [InterviewState] Starting fresh - clearing any existing interview data');
    localStorage.removeItem(STORAGE_KEY);
    setInterviewState(initialState);
  }, []);

  // REMOVED: Auto-save to storage - we want fresh starts only
  // useEffect(() => {
  //   saveToStorage();
  // }, [interviewState]);

  const loadFromStorage = () => {
    // DISABLED: No longer loading from storage to ensure fresh starts
    console.log('🔄 [InterviewState] loadFromStorage called but disabled for fresh starts');
  };

  const saveToStorage = () => {
    // DISABLED: No longer saving to storage to ensure fresh starts
    console.log('🔄 [InterviewState] saveToStorage called but disabled for fresh starts');
  };

  const updateState = (updates: Partial<InterviewState>) => {
    console.log('🔄 [InterviewState] Updating state:', Object.keys(updates));
    setInterviewState(prev => ({
      ...prev,
      ...updates,
    }));
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