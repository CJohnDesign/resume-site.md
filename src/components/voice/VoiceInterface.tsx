import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useOpenAI } from '../../hooks/useOpenAI';
import { useStepController } from '../../hooks/useStepController';
import { useJobExperienceLoop } from '../../hooks/useJobExperienceLoop';
import { InterviewState } from '../../types/interview';
import { VoiceStatusBar } from './VoiceStatusBar';
import { VoiceButton } from './VoiceButton';
import { AudioVisualization } from './AudioVisualization';
import { WelcomeSubtitle } from './WelcomeSubtitle';
import { ClosingScreen } from './ClosingScreen';
import { VoiceToolbar } from './VoiceToolbar';
import { generateResumeWebsitePrompt } from '../../utils/resumeGenerator';

interface VoiceInterfaceProps {
  interviewState: InterviewState;
  onUpdateState: (updates: Partial<InterviewState>) => void;
}

export function VoiceInterface({ interviewState, onUpdateState }: VoiceInterfaceProps) {
  const [isActive, setIsActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [conversationLog, setConversationLog] = useState<Array<{type: 'user' | 'assistant', content: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showClosingScreen, setShowClosingScreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    message: string;
    retryCount: number;
    maxRetries: number;
  }>({
    hasError: false,
    message: '',
    retryCount: 0,
    maxRetries: 3
  });

  // FIXED: Add refs to track timeouts and prevent conflicts
  const autoSubmitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');
  
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { speak, isSpeaking, stop: stopSpeaking } = useSpeechSynthesis();
  const { generateResponse } = useOpenAI();
  const { 
    currentStep, 
    moveToNextStep, 
    markStepComplete, 
    getProgressPercentage,
    isLastStep,
    canMoveToNextStep 
  } = useStepController(interviewState);

  // Job Experience Loop Integration
  const {
    loopState,
    moveToNextJob,
    saveJobExperience,
    getJobContextMessage,
    getProgressMessage,
    shouldAdvanceToNextStep,
    isLoopActive,
    isLoopComplete,
    currentJob,
    hasMoreJobs,
    getJobLoopContext,
    actualJobIndex
  } = useJobExperienceLoop(interviewState);

  // Show subtitle after 3 seconds if user hasn't started
  useEffect(() => {
    if (!hasStarted) {
      const timer = setTimeout(() => {
        console.log('🎯 [VoiceInterface] Showing subtitle after 3 seconds');
        setShowSubtitle(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      console.log('🎯 [VoiceInterface] Hiding subtitle - interview has started');
      setShowSubtitle(false);
    }
  }, [hasStarted]);

  // CRITICAL: Handle step changes and text input requirements
  useEffect(() => {
    if (currentStep) {
      console.log('🎯 [VoiceInterface] Step changed to:', currentStep.name, 'useTextInput:', currentStep.useTextInput);
      
      if (currentStep.useTextInput) {
        console.log('🎯 [VoiceInterface] Step requires text input - switching to text mode');
        stopListening();
        setVoiceMode(false);
      } else if (!voiceMode && !currentStep.useTextInput) {
        console.log('🎯 [VoiceInterface] Step allows voice - switching to voice mode');
        setVoiceMode(true);
      }
    }
  }, [currentStep?.id, currentStep?.useTextInput]);

  // CRITICAL: Auto-start listening when AI finishes speaking - NEVER while AI is speaking
  useEffect(() => {
    const requiresTextInput = currentStep?.useTextInput;
    
    console.log('🎤 [VoiceInterface] Auto-listening check:', {
      hasStarted,
      isSpeaking,
      isProcessing,
      isTransitioning,
      hasError: errorState.hasError,
      voiceMode,
      requiresTextInput,
      showClosingScreen,
      currentStepName: currentStep?.name
    });
    
    if (hasStarted && 
        !isSpeaking && 
        !isProcessing && 
        !isTransitioning && 
        !errorState.hasError && 
        voiceMode && 
        !requiresTextInput &&
        !showClosingScreen &&
        currentStep?.name !== 'closing') {
      
      console.log('🎤 [VoiceInterface] Starting auto-listening in 500ms...');
      const timer = setTimeout(() => {
        console.log('🎤 [VoiceInterface] Auto-starting listening now');
        startListening();
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (isSpeaking && isListening) {
      console.log('🛑 [VoiceInterface] CRITICAL: AI started speaking, stopping listening immediately');
      stopListening();
    }
  }, [hasStarted, isSpeaking, isProcessing, isTransitioning, errorState.hasError, voiceMode, currentStep, isListening, showClosingScreen]);

  // FIXED: Enhanced auto-submit with better conflict prevention
  useEffect(() => {
    const requiresTextInput = currentStep?.useTextInput;
    
    // Clear any existing timeout
    if (autoSubmitTimeoutRef.current) {
      clearTimeout(autoSubmitTimeoutRef.current);
      autoSubmitTimeoutRef.current = null;
    }
    
    console.log('📝 [VoiceInterface] Auto-submit check:', {
      transcript: transcript.length,
      lastTranscript: lastTranscriptRef.current.length,
      transcriptChanged: transcript !== lastTranscriptRef.current,
      isListening,
      isProcessing,
      hasStarted,
      isTransitioning,
      voiceMode,
      requiresTextInput,
      isSpeaking,
      showClosingScreen,
      currentStepName: currentStep?.name
    });
    
    // FIXED: Only set timer if transcript actually changed and has substantial content
    if (transcript && 
        transcript !== lastTranscriptRef.current && // Transcript changed
        transcript.trim().length > 10 && // Has substantial content
        isListening && 
        !isProcessing && 
        hasStarted && 
        !isTransitioning && 
        voiceMode && 
        !requiresTextInput &&
        !isSpeaking &&
        !showClosingScreen &&
        currentStep?.name !== 'closing') {
      
      console.log('⏱️ [VoiceInterface] Setting auto-submit timer for 4 seconds (transcript changed)...');
      lastTranscriptRef.current = transcript;
      
      autoSubmitTimeoutRef.current = setTimeout(() => {
        if (!isSpeaking && !showClosingScreen && !isTransitioning && isListening) {
          console.log('🚀 [VoiceInterface] Auto-submitting transcript:', transcript);
          handleVoiceSubmit();
        } else {
          console.log('🛑 [VoiceInterface] Auto-submit cancelled - conditions changed');
        }
        autoSubmitTimeoutRef.current = null;
      }, 4000); // FIXED: Increased to 4 seconds for longer responses
    }

    // Cleanup function
    return () => {
      if (autoSubmitTimeoutRef.current) {
        console.log('⏱️ [VoiceInterface] Clearing auto-submit timer');
        clearTimeout(autoSubmitTimeoutRef.current);
        autoSubmitTimeoutRef.current = null;
      }
    };
  }, [transcript, isListening, isProcessing, hasStarted, isTransitioning, voiceMode, currentStep, isSpeaking, showClosingScreen]);

  // Show closing screen when we reach the closing step
  useEffect(() => {
    if (currentStep?.name === 'closing' && !showClosingScreen) {
      console.log('🎉 [VoiceInterface] Triggering closing screen for step:', currentStep.name);
      
      stopListening();
      stopSpeaking();
      
      setIsTransitioning(true);
      
      // FIXED: Speak the closing monologue when transitioning to closing screen
      const closingMessage = currentStep.initialMessage || "Perfect! I've compiled all your information into a comprehensive design brief for your personal resume website. You can see the complete instructions below - they include everything needed to build a modern, professional resume site with responsive design and all your career details beautifully formatted. Simply download the instructions and paste them into any AI website builder to create your site!";
      
      console.log('🗣️ [VoiceInterface] Speaking closing monologue:', closingMessage);
      speak(closingMessage);
      setConversationLog(prev => [...prev, { type: 'assistant', content: closingMessage }]);
      
      const timer = setTimeout(() => {
        console.log('🎉 [VoiceInterface] Actually showing closing screen now');
        setShowClosingScreen(true);
        setIsTransitioning(false);
        setIsActive(false);
      }, 2000); // Give time for the speech to start
      
      return () => clearTimeout(timer);
    }
  }, [currentStep?.name, showClosingScreen]);

  // Clear error state when operations complete successfully
  useEffect(() => {
    const shouldClearError = errorState.hasError && 
        !isProcessing && 
        !isTransitioning && 
        !isSpeaking && 
        currentStep;

    if (shouldClearError) {
      console.log('✅ [VoiceInterface] Clearing error state - operations completed successfully');
      setErrorState(prev => ({ ...prev, hasError: false, message: '', retryCount: 0 }));
    }
  }, [errorState.hasError, isProcessing, isTransitioning, isSpeaking, currentStep?.id, voiceMode, isListening, transcript]);

  const handleError = (error: Error, context: string) => {
    console.error(`💥 [VoiceInterface] Error in ${context}:`, error);
    
    stopListening();
    stopSpeaking();
    setIsTransitioning(false);
    
    // FIXED: Clear timeouts on error
    if (autoSubmitTimeoutRef.current) {
      clearTimeout(autoSubmitTimeoutRef.current);
      autoSubmitTimeoutRef.current = null;
    }
    
    setErrorState(prev => {
      const newRetryCount = prev.retryCount + 1;
      
      if (newRetryCount >= prev.maxRetries) {
        const finalErrorState = {
          ...prev,
          hasError: true,
          message: `I'm having trouble processing your request. Please try refreshing the page or check your internet connection.`,
          retryCount: newRetryCount
        };
        console.log('💥 [VoiceInterface] Max retries exceeded:', finalErrorState);
        return finalErrorState;
      } else {
        const retryErrorState = {
          ...prev,
          hasError: true,
          message: `I encountered an issue. Let me try again... (Attempt ${newRetryCount}/${prev.maxRetries})`,
          retryCount: newRetryCount
        };
        console.log('🔄 [VoiceInterface] Setting retry error state:', retryErrorState);
        return retryErrorState;
      }
    });
  };

  const handleRetry = () => {
    console.log('🔄 [VoiceInterface] Handling retry request');
    setErrorState(prev => ({ ...prev, hasError: false, message: '' }));
    setIsTransitioning(false);
    
    if (transcript && hasStarted) {
      console.log('🔄 [VoiceInterface] Retrying voice submit with transcript:', transcript);
      handleVoiceSubmit();
    } else if (textInput && hasStarted) {
      console.log('🔄 [VoiceInterface] Retrying text submit with input:', textInput);
      handleTextSubmit();
    }
  };

  const handleButtonClick = () => {
    console.log('🔘 [VoiceInterface] Button clicked - current state:', {
      hasStarted,
      isListening,
      isSpeaking,
      isActive,
      voiceMode,
      currentStep: currentStep?.name
    });

    if (!hasStarted) {
      console.log('🚀 [VoiceInterface] Starting interview for the first time');
      setHasStarted(true);
      setIsActive(true);
      setShowSubtitle(false);
      setErrorState({ hasError: false, message: '', retryCount: 0, maxRetries: 3 });
      
      // FIXED: Always speak the initialMessage first (only for welcome step)
      if (currentStep?.name === 'welcome' && currentStep.initialMessage) {
        const welcomeMessage = currentStep.initialMessage;
        console.log('🗣️ [VoiceInterface] Speaking WELCOME initial message:', welcomeMessage);
        speak(welcomeMessage);
        setConversationLog([{ type: 'assistant', content: welcomeMessage }]);
      } else {
        // Fallback message if no initial message
        const fallbackMessage = "Hi! Let's create your resume together. What's your full name?";
        console.log('🗣️ [VoiceInterface] Speaking fallback welcome message:', fallbackMessage);
        speak(fallbackMessage);
        setConversationLog([{ type: 'assistant', content: fallbackMessage }]);
      }
      
      onUpdateState({ currentStep: currentStep?.id || 0 });
      
    } else if (isListening && voiceMode) {
      console.log('⏸️ [VoiceInterface] Pausing listening (was listening in voice mode)');
      stopListening();
      setIsActive(false);
    } else if (isSpeaking) {
      console.log('🛑 [VoiceInterface] Stopping AI speech');
      stopSpeaking();
      setIsActive(true);
    } else if (isActive) {
      console.log('🛑 [VoiceInterface] Stopping all activity (was active but not listening)');
      setIsActive(false);
      stopListening();
      stopSpeaking();
    } else {
      console.log('▶️ [VoiceInterface] Resuming activity');
      setIsActive(true);
      if (voiceMode && !currentStep?.useTextInput) {
        console.log('🎤 [VoiceInterface] Starting listening (resuming in voice mode)');
        startListening();
      }
    }
  };

  const handleTextModeToggle = () => {
    console.log('📝 [VoiceInterface] Toggling to text mode');
    stopListening();
    stopSpeaking();
    setVoiceMode(false);
  };

  const handleVoiceSubmit = async () => {
    console.log('🎤 [VoiceInterface] Voice submit called:', {
      transcript: transcript.trim(),
      isProcessing,
      currentStep: currentStep?.name,
      isSpeaking,
      showClosingScreen,
      isTransitioning
    });

    if (!transcript.trim() || isProcessing || !currentStep || isSpeaking || showClosingScreen || isTransitioning) {
      console.log('🛑 [VoiceInterface] Voice submit blocked - invalid conditions');
      return;
    }
    
    console.log('🚀 [VoiceInterface] Processing voice response:', transcript.trim());
    await processResponse(transcript.trim());
    resetTranscript();
    lastTranscriptRef.current = ''; // FIXED: Reset tracking ref
  };

  const handleTextSubmit = async () => {
    console.log('📝 [VoiceInterface] Text submit called:', {
      textInput: textInput.trim(),
      isProcessing,
      currentStep: currentStep?.name
    });

    if (!textInput.trim() || isProcessing || !currentStep) {
      console.log('🛑 [VoiceInterface] Text submit blocked - invalid conditions');
      return;
    }
    
    setErrorState(prev => ({ ...prev, hasError: false, message: '' }));
    
    console.log('🚀 [VoiceInterface] Processing text response:', textInput.trim());
    await processResponse(textInput.trim());
    setTextInput('');
    
    if (!currentStep?.useTextInput) {
      console.log('🎤 [VoiceInterface] Returning to voice mode after text submit');
      setVoiceMode(true);
    }
  };

  const processResponse = async (userMessage: string) => {
    if (!currentStep) {
      console.log('🛑 [VoiceInterface] Process response blocked - no current step');
      return;
    }
    
    console.log('⚙️ [VoiceInterface] Processing response:', {
      userMessage,
      currentStep: currentStep.name,
      stepId: currentStep.id,
      isDynamicLoop: currentStep.isDynamicLoop,
      isLoopActive,
      currentJobIndex: loopState.currentJobIndex,
      actualJobIndex,
      currentJobTitle: currentJob?.title
    });
    
    setConversationLog(prev => {
      const newLog = [...prev, { type: 'user' as const, content: userMessage }];
      console.log('📝 [VoiceInterface] Updated conversation log with user message');
      return newLog;
    });
    
    stopListening();
    stopSpeaking();
    setIsProcessing(true);
    setIsTransitioning(true);

    // FIXED: Clear auto-submit timer when processing starts
    if (autoSubmitTimeoutRef.current) {
      clearTimeout(autoSubmitTimeoutRef.current);
      autoSubmitTimeoutRef.current = null;
    }

    try {
      console.log('🤖 [VoiceInterface] Calling OpenAI API...');
      
      // FIXED: For dynamic loop steps, pass enhanced context with specific job details
      const additionalContext = currentStep.isDynamicLoop && isLoopActive ? 
        getJobLoopContext() : undefined;
      
      if (additionalContext) {
        console.log('🔄 [VoiceInterface] Passing job context to AI:', {
          currentJobTitle: additionalContext.currentJob?.title,
          currentJobCompany: additionalContext.currentJob?.company,
          currentJobDuration: additionalContext.currentJob?.duration,
          jobIndex: additionalContext.jobIndex,
          totalJobs: additionalContext.totalJobs,
          hasMoreJobs: additionalContext.hasMoreJobs,
          nextJobTitle: additionalContext.nextJob?.title
        });
      }
      
      const response = await generateResponse(userMessage, interviewState, conversationLog, currentStep, additionalContext);
      
      console.log('✅ [VoiceInterface] Received OpenAI response:', {
        message: response.message,
        shouldAdvance: response.shouldAdvance,
        hasStateUpdate: !!response.stateUpdate,
        isDynamicLoop: currentStep.isDynamicLoop
      });
      
      setConversationLog(prev => {
        const newLog = [...prev, { type: 'assistant' as const, content: response.message }];
        console.log('📝 [VoiceInterface] Updated conversation log with AI response');
        return newLog;
      });
      
      // CRITICAL: Always speak the AI response - this IS the transition message
      console.log('🗣️ [VoiceInterface] Speaking AI response (this is the transition):', response.message);
      speak(response.message);
      
      if (response.stateUpdate) {
        console.log('🔄 [VoiceInterface] Updating interview state:', response.stateUpdate);
        onUpdateState(response.stateUpdate);
      }

      // FIXED: Handle dynamic loop advancement with proper job tracking
      if (response.shouldAdvance && currentStep.isDynamicLoop && isLoopActive) {
        console.log('🔄 [VoiceInterface] Handling dynamic loop advancement');
        
        // CRITICAL: Save job experience data with proper indexing
        if (response.data?.jobExperience) {
          console.log('🔄 [VoiceInterface] Saving job experience data for index:', actualJobIndex);
          saveJobExperience(response.data.jobExperience);
          
          // Update interview state with job experience using actualJobIndex
          const jobExperiences = {
            ...interviewState.jobExperiences,
            [actualJobIndex]: response.data.jobExperience
          };
          onUpdateState({ jobExperiences });
        }

        // CRITICAL: Save job experience report with proper indexing
        if (response.data?.jobExperienceReport) {
          console.log('🔄 [VoiceInterface] Saving job experience report for index:', actualJobIndex);
          
          const jobExperienceReports = {
            ...interviewState.jobExperienceReports,
            [actualJobIndex]: response.data.jobExperienceReport
          };
          onUpdateState({ jobExperienceReports });
        }
        
        // FIXED: Check if we should move to next job or complete the loop
        const hasMoreJobs = moveToNextJob();
        
        if (hasMoreJobs) {
          console.log('🔄 [VoiceInterface] Moving to next job in loop');
          setIsTransitioning(false); // FIXED: Allow new input for next job
        } else {
          console.log('🔄 [VoiceInterface] Job loop complete, generating resume and advancing to closing');
          
          // Generate resume website prompt behind the scenes with updated state
          setTimeout(() => {
            try {
              // Create updated state with all job data for resume generation
              const updatedState = {
                ...interviewState,
                jobExperiences: {
                  ...interviewState.jobExperiences,
                  [actualJobIndex]: response.data?.jobExperience
                },
                jobExperienceReports: {
                  ...interviewState.jobExperienceReports,
                  [actualJobIndex]: response.data?.jobExperienceReport
                }
              };
              
              console.log('🏗️ [VoiceInterface] Generating resume with complete job data:', {
                jobExperiences: Object.keys(updatedState.jobExperiences || {}),
                jobExperienceReports: Object.keys(updatedState.jobExperienceReports || {})
              });
              
              const websitePrompt = generateResumeWebsitePrompt(updatedState);
              onUpdateState({ resumeWebsitePrompt: websitePrompt });
              console.log('🏗️ [VoiceInterface] Generated resume website prompt behind the scenes');
            } catch (error) {
              console.error('💥 [VoiceInterface] Error generating resume prompt:', error);
            }
            
            markStepComplete();
            const nextStep = moveToNextStep();
            if (nextStep) {
              console.log('✅ [VoiceInterface] Moved to closing step:', nextStep.name, 'ID:', nextStep.id);
              onUpdateState({ currentStep: nextStep.id });
              
              // The closing screen effect will handle the monologue
            } else {
              console.log('🏁 [VoiceInterface] No next step - interview complete');
            }
          }, 1000);
        }
      } else if (response.shouldAdvance && !currentStep.isDynamicLoop) {
        console.log('➡️ [VoiceInterface] Advancing to next step (non-loop)...');
        
        setTimeout(() => {
          markStepComplete();
          const nextStep = moveToNextStep();
          if (nextStep) {
            console.log('✅ [VoiceInterface] Moved to next step:', nextStep.name, 'ID:', nextStep.id);
            onUpdateState({ currentStep: nextStep.id });
            
            // The closing screen effect will handle the monologue if it's the closing step
          } else {
            console.log('🏁 [VoiceInterface] No next step - interview complete');
          }
          setIsTransitioning(false);
        }, 2000);
      } else {
        // FIXED: No advancement, allow new input
        console.log('🔄 [VoiceInterface] No advancement, allowing new input');
        setIsTransitioning(false);
      }
      
      if (errorState.hasError) {
        console.log('✅ [VoiceInterface] Clearing previous errors after successful response');
        setErrorState({ hasError: false, message: '', retryCount: 0, maxRetries: 3 });
      }
      
    } catch (error) {
      console.error('💥 [VoiceInterface] Error in processResponse:', error);
      handleError(error as Error, 'processResponse');
      
      const contextualErrorMessage = getContextualErrorMessage(currentStep?.name || '');
      
      setConversationLog(prev => [...prev, { type: 'assistant', content: contextualErrorMessage }]);
      console.log('🗣️ [VoiceInterface] Speaking error message:', contextualErrorMessage);
      speak(contextualErrorMessage);
    } finally {
      console.log('🏁 [VoiceInterface] Processing complete, setting isProcessing to false');
      setIsProcessing(false);
    }
  };

  const getContextualErrorMessage = (stepName: string): string => {
    const message = (() => {
      switch (stepName) {
        case 'welcome':
          return "I'm sorry, I had trouble processing your name. Could you please tell me your full name again?";
        case 'email':
          return "I encountered an issue with your email. Please try entering your email address again.";
        case 'linkedin':
          return "I had trouble with your LinkedIn profile. Could you please provide your LinkedIn URL again?";
        case 'linkedin-data':
          return "I had trouble processing your LinkedIn information. Could you please paste it again?";
        case 'career-objectives':
          return "I had trouble understanding your career goals. Could you please share them again?";
        case 'job-experience-loop':
          return "I had trouble processing your job experience. Could you please share that information again?";
        case 'closing':
          return "There was an issue with your final resume. Let me try again.";
        default:
          return "I'm sorry, I encountered an error. Could you please repeat that?";
      }
    })();
    
    console.log('💬 [VoiceInterface] Generated contextual error message for step', stepName, ':', message);
    return message;
  };

  const getButtonState = () => {
    if (!hasStarted) return 'start';
    if (isSpeaking) return 'speaking';
    if (isListening && voiceMode && !isSpeaking) return 'listening';
    if (isProcessing || isTransitioning) return 'processing';
    if (isActive && voiceMode && !isSpeaking) return 'active';
    return 'paused';
  };

  const buttonState = getButtonState();
  console.log('🔘 [VoiceInterface] Current button state:', buttonState, {
    hasStarted,
    isSpeaking,
    isListening,
    voiceMode,
    isProcessing,
    isTransitioning,
    isActive,
    currentStepName: currentStep?.name
  });

  if (showClosingScreen || currentStep?.name === 'closing') {
    console.log('🎉 [VoiceInterface] Rendering closing screen - showClosingScreen:', showClosingScreen, 'currentStep:', currentStep?.name);
    return (
      <ClosingScreen 
        interviewState={interviewState}
      />
    );
  }

  const isToolbarDisabled = errorState.hasError;

  console.log('🎨 [VoiceInterface] Rendering main interface:', {
    currentStep: currentStep?.name,
    buttonState,
    isToolbarDisabled,
    hasStarted,
    showSubtitle,
    voiceMode,
    requiresTextInput: currentStep?.useTextInput,
    isLoopActive,
    currentJobIndex: loopState.currentJobIndex,
    actualJobIndex,
    currentJobTitle: currentJob?.title
  });

  return (
    <div className="relative h-full flex flex-col animate-scale-in pb-24">
      
      <VoiceStatusBar 
        hasStarted={hasStarted} 
        buttonState={buttonState}
        currentStep={currentStep}
        progressPercentage={getProgressPercentage()}
        errorState={errorState}
        jobLoopState={isLoopActive ? {
          isActive: isLoopActive,
          currentJobIndex: loopState.currentJobIndex,
          totalJobs: loopState.totalJobsToDiscuss,
          progressMessage: getProgressMessage()
        } : undefined}
      />

      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {errorState.hasError && (
          <div className="absolute top-8 left-8 right-8 z-20 animate-slide-in-bottom">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <p className="text-red-400 text-sm">{errorState.message}</p>
                </div>
                {errorState.retryCount < errorState.maxRetries && (
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className={`relative flex flex-col items-center transition-all duration-700 ease-out ${
          isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}>
          
          <VoiceButton
            buttonState={buttonState}
            onClick={handleButtonClick}
            disabled={isProcessing || isTransitioning || errorState.hasError}
          />
          
          <WelcomeSubtitle isVisible={showSubtitle && !hasStarted} />
          
          <AudioVisualization isVisible={buttonState === 'speaking'} />
        </div>
      </div>

      {hasStarted && (
        <VoiceToolbar
          isListening={isListening}
          transcript={transcript}
          textInput={textInput}
          onTextChange={setTextInput}
          onTextSubmit={handleTextSubmit}
          onTextModeToggle={handleTextModeToggle}
          disabled={isToolbarDisabled}
          voiceMode={voiceMode}
          currentStep={currentStep}
          isSpeaking={isSpeaking}
          isProcessing={isProcessing}
          requiresTextInput={currentStep?.useTextInput || false}
        />
      )}
    </div>
  );
}