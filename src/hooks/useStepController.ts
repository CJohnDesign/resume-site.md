import { useState, useEffect } from 'react';
import { InterviewStep, getActiveSteps, getStepById, getNextActiveStep, getStepProgress } from '../config/interviewSteps';
import { InterviewState } from '../types/interview';

export function useStepController(interviewState: InterviewState) {
  const [currentStep, setCurrentStep] = useState<InterviewStep | null>(null);
  const [stepHistory, setStepHistory] = useState<number[]>([]);
  const [isStepComplete, setIsStepComplete] = useState(false);

  // Initialize with first active step
  useEffect(() => {
    const activeSteps = getActiveSteps();
    if (activeSteps.length > 0 && !currentStep) {
      const firstStep = activeSteps[0];
      console.log('🎯 [StepController] Initializing with first step:', firstStep.name, 'ID:', firstStep.id);
      setCurrentStep(firstStep);
      setStepHistory([firstStep.id]);
    }
  }, []);

  // Update current step based on interview state
  useEffect(() => {
    if (interviewState.currentStep !== currentStep?.id) {
      const step = getStepById(interviewState.currentStep);
      if (step && step.active) {
        console.log('🎯 [StepController] Updating current step from state:', step.name, 'ID:', step.id);
        setCurrentStep(step);
        if (!stepHistory.includes(step.id)) {
          setStepHistory(prev => {
            const newHistory = [...prev, step.id];
            console.log('🎯 [StepController] Updated step history:', newHistory);
            return newHistory;
          });
        }
      }
    }
  }, [interviewState.currentStep]);

  const moveToNextStep = (): InterviewStep | null => {
    if (!currentStep) {
      console.log('🎯 [StepController] Cannot move to next step - no current step');
      return null;
    }
    
    const nextStep = getNextActiveStep(currentStep.id);
    if (nextStep) {
      console.log('🎯 [StepController] Moving to next step:', nextStep.name, 'ID:', nextStep.id);
      setCurrentStep(nextStep);
      setStepHistory(prev => {
        const newHistory = [...prev, nextStep.id];
        console.log('🎯 [StepController] Updated step history after move:', newHistory);
        return newHistory;
      });
      setIsStepComplete(false);
      return nextStep;
    } else {
      console.log('🎯 [StepController] No next step available - interview complete');
    }
    return null;
  };

  const moveToStep = (stepId: number): InterviewStep | null => {
    const step = getStepById(stepId);
    if (step && step.active) {
      console.log('🎯 [StepController] Moving to specific step:', step.name, 'ID:', step.id);
      setCurrentStep(step);
      if (!stepHistory.includes(step.id)) {
        setStepHistory(prev => {
          const newHistory = [...prev, step.id];
          console.log('🎯 [StepController] Updated step history after direct move:', newHistory);
          return newHistory;
        });
      }
      setIsStepComplete(false);
      return step;
    } else {
      console.log('🎯 [StepController] Cannot move to step - invalid or inactive:', stepId);
    }
    return null;
  };

  const markStepComplete = () => {
    console.log('🎯 [StepController] Marking step complete:', currentStep?.name);
    setIsStepComplete(true);
  };

  const getProgressPercentage = (): number => {
    const progress = currentStep ? getStepProgress(currentStep.id) : 0;
    console.log('🎯 [StepController] Current progress:', progress + '%');
    return progress;
  };

  const isLastStep = (): boolean => {
    if (!currentStep) return false;
    const nextStep = getNextActiveStep(currentStep.id);
    const isLast = nextStep === undefined;
    console.log('🎯 [StepController] Is last step:', isLast);
    return isLast;
  };

  const canMoveToNextStep = (): boolean => {
    const canMove = isStepComplete && !isLastStep();
    console.log('🎯 [StepController] Can move to next step:', canMove, '(complete:', isStepComplete, ', isLast:', isLastStep(), ')');
    return canMove;
  };

  return {
    currentStep,
    stepHistory,
    isStepComplete,
    moveToNextStep,
    moveToStep,
    markStepComplete,
    getProgressPercentage,
    isLastStep,
    canMoveToNextStep,
    activeSteps: getActiveSteps(),
  };
}