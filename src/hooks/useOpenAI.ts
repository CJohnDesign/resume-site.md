import { useApiKey } from './useApiKey';
import { InterviewState, LinkedInData, CareerObjectivesReport, JobExperienceReport } from '../types/interview';
import { InterviewStep, getNextActiveStep } from '../config/interviewSteps';

interface OpenAIResponse {
  message: string;
  data?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    linkedin?: string;
    linkedinData?: LinkedInData;
    careerObjectives?: string;
    careerObjectivesReport?: CareerObjectivesReport;
    oneYearVision?: string;
    jobExperience?: {
      jobTitle: string;
      company: string;
      duration: string;
      achievements: string;
      challenges?: string;
      skills?: string;
      impact?: string;
      learnings?: string;
    };
    jobExperienceReport?: JobExperienceReport;
    [key: string]: any;
  };
  shouldAdvance?: boolean;
  confidence?: number;
}

interface JobLoopContext {
  jobContext: string;
  currentJob: any;
  jobIndex: number;
  totalJobs: number;
  hasMoreJobs: boolean;
  nextJob?: any;
}

export function useOpenAI() {
  const { getApiKey } = useApiKey();

  const generateResponse = async (
    userInput: string,
    interviewState: InterviewState,
    conversationHistory: Array<{type: 'user' | 'assistant', content: string}>,
    currentStep: InterviewStep,
    additionalContext?: JobLoopContext
  ) => {
    console.log('🤖 [OpenAI] Starting response generation:', {
      userInput: userInput.substring(0, 50) + '...',
      currentStep: currentStep.name,
      stepId: currentStep.id,
      conversationHistoryLength: conversationHistory.length,
      hasJobContext: !!additionalContext,
      currentJobTitle: additionalContext?.currentJob?.title,
      currentJobCompany: additionalContext?.currentJob?.company
    });

    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('💥 [OpenAI] No API key available');
      throw new Error('No API key available');
    }

    const systemPrompt = getStepSystemPrompt(currentStep, interviewState, additionalContext);
    console.log('🤖 [OpenAI] Using enhanced system prompt for step:', currentStep.name);

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const requestBody = {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-4).map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: userInput }
          ],
          max_tokens: 2000, // Increased for comprehensive reports
          temperature: 0.1,
          response_format: { type: "json_object" }
        };

        console.log('🤖 [OpenAI] Sending request to OpenAI API (attempt', retryCount + 1, ')');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 429) {
            const waitTime = Math.pow(2, retryCount) * 1000;
            console.log(`🤖 [OpenAI] Rate limited, waiting ${waitTime}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retryCount++;
            continue;
          }
          
          if (response.status === 401) {
            console.error('💥 [OpenAI] Invalid API key');
            throw new Error('Invalid API key. Please check your OpenAI API key.');
          }
          
          if (response.status === 400) {
            console.log('🤖 [OpenAI] Bad request, falling back to simple response');
            return await generateFallbackResponse(userInput, currentStep, interviewState, apiKey, additionalContext);
          }
          
          if (response.status >= 500) {
            console.log(`🤖 [OpenAI] Server error (${response.status}), retrying...`);
            retryCount++;
            continue;
          }
          
          console.error('💥 [OpenAI] API error:', response.status, errorData);
          throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('✅ [OpenAI] Received response from API');
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('💥 [OpenAI] Invalid response format');
          throw new Error('Invalid response format from OpenAI API');
        }
        
        const content = data.choices[0].message.content;
        console.log('🤖 [OpenAI] Raw response content:', content.substring(0, 100) + '...');
        
        let parsedResponse: OpenAIResponse;

        try {
          parsedResponse = JSON.parse(content);
          console.log('✅ [OpenAI] Successfully parsed JSON response:', {
            message: parsedResponse.message?.substring(0, 50) + '...',
            shouldAdvance: parsedResponse.shouldAdvance,
            confidence: parsedResponse.confidence,
            hasData: !!parsedResponse.data,
            hasJobExperience: !!parsedResponse.data?.jobExperience,
            hasJobExperienceReport: !!parsedResponse.data?.jobExperienceReport
          });
        } catch (parseError) {
          console.error('💥 [OpenAI] JSON parse error:', parseError);
          parsedResponse = {
            message: content || "I apologize, but I didn't receive a proper response. Could you please try again?",
            shouldAdvance: false
          };
        }

        const stateUpdate = processStructuredResponse(parsedResponse, interviewState, currentStep);
        console.log('🔄 [OpenAI] Processed state update:', !!stateUpdate);

        // Enhanced advancement logic with frontend validation backup
        let shouldAdvance = parsedResponse.shouldAdvance || false;
        
        // Frontend validation backup for text input steps
        if (!shouldAdvance && currentStep.useTextInput) {
          shouldAdvance = validateStepInput(userInput, currentStep);
          if (shouldAdvance) {
            console.log('🚀 [OpenAI] Frontend validation triggered advancement for step:', currentStep.name);
          }
        }

        const finalResult = {
          message: parsedResponse.message,
          stateUpdate,
          shouldAdvance,
          data: parsedResponse.data
        };

        console.log('✅ [OpenAI] Final result:', {
          messageLength: finalResult.message?.length,
          shouldAdvance: finalResult.shouldAdvance,
          hasStateUpdate: !!finalResult.stateUpdate,
          hasJobExperience: !!finalResult.data?.jobExperience,
          hasJobExperienceReport: !!finalResult.data?.jobExperienceReport
        });

        return finalResult;
        
      } catch (error) {
        retryCount++;
        console.error(`💥 [OpenAI] Error on attempt ${retryCount}:`, error);
        
        if (retryCount >= maxRetries) {
          console.log('💥 [OpenAI] Max retries exceeded, using fallback');
          const fallbackMessage = getFallbackResponse(currentStep?.name || '');
          const stateUpdate = analyzeAndUpdateState(userInput, interviewState, currentStep);
          
          // Enhanced fallback advancement
          let shouldAdvance = shouldAdvanceBasedOnStep(userInput, currentStep);
          if (!shouldAdvance && currentStep.useTextInput) {
            shouldAdvance = validateStepInput(userInput, currentStep);
            if (shouldAdvance) {
              console.log('🚀 [OpenAI] Frontend validation triggered advancement in fallback for step:', currentStep.name);
            }
          }
          
          const fallbackResult = {
            message: fallbackMessage,
            stateUpdate,
            shouldAdvance
          };

          console.log('🔄 [OpenAI] Fallback result:', fallbackResult);
          return fallbackResult;
        }
        
        const waitTime = 1000 * retryCount;
        console.log(`🤖 [OpenAI] Waiting ${waitTime}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw new Error('Maximum retries exceeded');
  };

  return { generateResponse };
}

// Frontend validation for text input steps
function validateStepInput(userInput: string, currentStep: InterviewStep): boolean {
  const input = userInput.trim();
  
  switch (currentStep.name) {
    case 'email':
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(input);
      
    case 'linkedin':
      const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+)\/?$/;
      const usernameRegex = /^[a-zA-Z0-9-]+$/;
      return linkedinRegex.test(input) || usernameRegex.test(input);
      
    case 'linkedin-data':
      return input.length > 100; // Substantial content
      
    default:
      return false;
  }
}

async function generateFallbackResponse(
  userInput: string,
  currentStep: InterviewStep,
  interviewState: InterviewState,
  apiKey: string,
  additionalContext?: JobLoopContext
): Promise<any> {
  console.log('🔄 [OpenAI] Generating fallback response for step:', currentStep.name);
  
  const simplePrompt = `You are an AI Career Assistant. Current step: ${currentStep.title}. 
User said: "${userInput}"
${additionalContext ? `Job context: Currently discussing ${additionalContext.currentJob?.title} at ${additionalContext.currentJob?.company}` : ''}
Respond conversationally and briefly (under 50 words).`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: simplePrompt }],
      max_tokens: 100,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  
  const message = data.choices?.[0]?.message?.content || "Thank you for that information.";
  console.log('🔄 [OpenAI] Fallback message generated:', message);
  
  // Enhanced fallback advancement
  let shouldAdvance = shouldAdvanceBasedOnStep(userInput, currentStep);
  if (!shouldAdvance && currentStep.useTextInput) {
    shouldAdvance = validateStepInput(userInput, currentStep);
    if (shouldAdvance) {
      console.log('🚀 [OpenAI] Frontend validation triggered advancement in simple fallback for step:', currentStep.name);
    }
  }
  
  const result = {
    message,
    stateUpdate: analyzeAndUpdateState(userInput, interviewState, currentStep),
    shouldAdvance
  };

  return result;
}

function shouldAdvanceBasedOnStep(userInput: string, currentStep: InterviewStep): boolean {
  const input = userInput.toLowerCase();
  let shouldAdvance = false;
  
  console.log('🔍 [OpenAI] Checking if should advance for step:', currentStep.name, 'with input:', input.substring(0, 30) + '...');
  
  switch (currentStep.name) {
    case 'welcome':
      // Be very generous with names
      shouldAdvance = input.length > 1 && (
        input.split(' ').length >= 1 && // At least one word
        /^[a-zA-Z\s'-]+$/.test(userInput.trim()) && // Only letters, spaces, apostrophes, hyphens
        !input.includes('sorry') &&
        !input.includes('error')
      );
      break;
    
    case 'email':
      shouldAdvance = validateStepInput(userInput, currentStep);
      break;
    
    case 'linkedin':
      shouldAdvance = validateStepInput(userInput, currentStep);
      break;
    
    case 'linkedin-data':
      shouldAdvance = validateStepInput(userInput, currentStep);
      break;
    
    case 'career-objectives':
      shouldAdvance = input.includes('skip') || 
                     input.includes('continue') || 
                     input.includes('move on') || 
                     input.includes('next step') || 
                     input.includes('enough') || 
                     input.includes('done') || 
                     input.includes('finish');
      break;
    
    case 'job-experience-loop':
      // For job experience loop, be generous with substantial responses
      shouldAdvance = userInput.trim().length > 20 && (
        input.includes('achievement') ||
        input.includes('challenge') ||
        input.includes('skill') ||
        input.includes('impact') ||
        input.includes('learning') ||
        input.includes('next job') ||
        input.includes('move on') ||
        input.includes('done') ||
        input.includes('finish')
      );
      break;
    
    default:
      shouldAdvance = false;
  }

  console.log('🔍 [OpenAI] Should advance:', shouldAdvance);
  return shouldAdvance;
}

function getStepSystemPrompt(step: InterviewStep, interviewState: InterviewState, additionalContext?: JobLoopContext): string {
  const nextStep = getNextActiveStep(step.id);
  
  let basePrompt = `You are an expert AI Career Assistant conducting a structured resume interview. You must respond in valid JSON format only.

CURRENT STEP: ${step.name} - ${step.title}
NEXT STEP: ${nextStep ? `${nextStep.name} - ${nextStep.title}` : 'Complete'}

CURRENT STATE: ${JSON.stringify(interviewState, null, 2)}

CRITICAL ADVANCEMENT INSTRUCTION: Be EAGER to advance! Don't be overly picky or require perfect responses. If the user provides reasonable input for this step, advance them. The goal is smooth progression, not perfection.

RESPONSE FORMAT: You must respond with a JSON object containing:
{
  "message": "Your conversational response to the user (keep under 80 words)",
  "data": {
    // Extracted structured data based on current step
  },
  "shouldAdvance": boolean, // BE GENEROUS - true if step has reasonable completion
  "confidence": number // 0-100, how confident you are in the extracted data
}

INSTRUCTIONS:
- Be warm, professional, and encouraging
- Keep responses conversational and under 80 words
- Extract specific data based on the current step
- Set shouldAdvance to true when you have reasonable input (don't require perfection!)
- If data is unclear, ask for clarification and set shouldAdvance to false`;

  // Add job loop context if available
  if (additionalContext && step.isDynamicLoop) {
    const currentJob = additionalContext.currentJob;
    const nextJob = additionalContext.hasMoreJobs ? 
      interviewState.linkedinParsedData?.experience?.[additionalContext.jobIndex + 1] : null;
    
    basePrompt += `

JOB LOOP CONTEXT - CRITICAL INFORMATION:
===========================================
CURRENT JOB YOU ARE DISCUSSING:
- Job Title: "${currentJob?.title}"
- Company: "${currentJob?.company}"
- Duration: "${currentJob?.duration || 'Not specified'}"
- Job Description: "${currentJob?.description || 'Not provided'}"

POSITION IN SEQUENCE:
- This is job ${additionalContext.jobIndex + 1} of ${additionalContext.totalJobs} total jobs
- This is their ${additionalContext.jobIndex === 0 ? 'MOST RECENT' : additionalContext.jobIndex === additionalContext.totalJobs - 1 ? 'OLDEST' : 'PREVIOUS'} position

${additionalContext.hasMoreJobs && nextJob ? `
NEXT JOB TO DISCUSS:
- Next Job Title: "${nextJob.title}"
- Next Company: "${nextJob.company}"
- Next Duration: "${nextJob.duration || 'Not specified'}"
` : ''}

DYNAMIC LOOP INSTRUCTIONS:
- You are specifically discussing their role as "${currentJob?.title}" at "${currentJob?.company}"
- Reference this job explicitly: "Tell me about your time as ${currentJob?.title} at ${currentJob?.company}"
- Ask about specific achievements, challenges, and impact in THIS ROLE
- Help them articulate accomplishments for THIS SPECIFIC POSITION
- When you have sufficient detail about THIS JOB, set shouldAdvance to true

${additionalContext.hasMoreJobs ? `
TRANSITION MESSAGE WHEN ADVANCING:
"Great insights about your role as ${currentJob?.title} at ${currentJob?.company}! Now let's talk about your previous position as ${nextJob?.title} at ${nextJob?.company}."
` : `
COMPLETION MESSAGE WHEN ADVANCING:
"Excellent! I have great details about your work experience. I'm now preparing your comprehensive resume website instructions - this will just take a moment."
`}

COMPREHENSIVE REPORTING REQUIREMENT:
When advancing from this job discussion, you MUST generate BOTH a basic jobExperience object AND a comprehensive JobExperienceReport:

"jobExperience": {
  "jobTitle": "${currentJob?.title}",
  "company": "${currentJob?.company}",
  "duration": "${currentJob?.duration}",
  "achievements": "summary of key achievements discussed",
  "challenges": "challenges they overcame",
  "skills": "skills they developed/used",
  "impact": "measurable impact they made",
  "learnings": "key learnings from the role"
},
"jobExperienceReport": {
  "jobTitle": "${currentJob?.title}",
  "company": "${currentJob?.company}",
  "duration": "${currentJob?.duration}",
  "overallSummary": "2-3 sentence summary of their role and impact",
  "keyAchievements": ["achievement 1", "achievement 2", "achievement 3"],
  "challengesOvercome": ["challenge 1", "challenge 2"],
  "skillsDeveloped": ["skill 1", "skill 2", "skill 3"],
  "measurableImpact": ["quantified result 1", "quantified result 2"],
  "keyLearnings": ["learning 1", "learning 2"],
  "resumeBulletPoints": [
    "• Action verb + specific achievement + quantified result",
    "• Action verb + challenge overcome + impact",
    "• Action verb + skill applied + outcome"
  ],
  "professionalGrowth": "How this role contributed to their career development",
  "generatedAt": "${new Date().toISOString()}"
}

CRITICAL: Both jobExperience and jobExperienceReport are REQUIRED when advancing from job discussions!`;
  }

  // Add step-specific system prompt
  basePrompt += `

STEP-SPECIFIC INSTRUCTIONS:
${step.systemPrompt}`;

  // Add career objectives reporting requirement
  if (step.name === 'career-objectives') {
    basePrompt += `

COMPREHENSIVE REPORTING REQUIREMENT:
When advancing from career objectives discussion, you MUST generate a comprehensive CareerObjectivesReport in the data field:

"careerObjectivesReport": {
  "summary": "Complete summary of their career discussion",
  "idealRole": "Description of their ideal next role",
  "companyPreferences": "Type of company/culture they prefer",
  "shortTermGoals": "Goals for next 1-2 years",
  "longTermVision": "Vision for 5+ years",
  "keyMotivations": "What drives them professionally",
  "growthAreas": "Areas they want to develop",
  "generatedAt": "${new Date().toISOString()}"
}`;
  }

  return basePrompt;
}

function processStructuredResponse(
  response: OpenAIResponse,
  currentState: InterviewState,
  currentStep: InterviewStep
): Partial<InterviewState> | null {
  console.log('🔄 [OpenAI] Processing structured response for step:', currentStep.name, 'confidence:', response.confidence);
  
  if (!response.data || response.confidence < 60) {
    console.log('🔄 [OpenAI] Skipping state update - no data or low confidence');
    return null;
  }

  const updates: Partial<InterviewState> = {};

  switch (currentStep.name) {
    case 'welcome':
      if (response.data.firstName || response.data.lastName || response.data.fullName) {
        const firstName = response.data.firstName || '';
        const lastName = response.data.lastName || '';
        const fullName = response.data.fullName || `${firstName} ${lastName}`.trim();
        
        console.log('🔄 [OpenAI] Updating name:', fullName);
        updates.personalInfo = {
          ...currentState.personalInfo,
          name: fullName
        };
      }
      break;

    case 'email':
      if (response.data.email && !currentState.personalInfo.email) {
        console.log('🔄 [OpenAI] Updating email:', response.data.email);
        updates.personalInfo = {
          ...currentState.personalInfo,
          email: response.data.email
        };
      }
      break;

    case 'linkedin':
      if (response.data.linkedin && !currentState.personalInfo.linkedin) {
        let cleanLinkedIn = response.data.linkedin;
        cleanLinkedIn = cleanLinkedIn.replace(/^https?:\/\//, '').replace(/^www\./, '');
        if (!cleanLinkedIn.startsWith('linkedin.com')) {
          cleanLinkedIn = `linkedin.com/in/${cleanLinkedIn}`;
        }
        
        console.log('🔄 [OpenAI] Updating LinkedIn:', cleanLinkedIn);
        updates.personalInfo = {
          ...currentState.personalInfo,
          linkedin: cleanLinkedIn
        };
      }
      break;

    case 'linkedin-data':
      if (response.data.linkedinData) {
        console.log('🔄 [OpenAI] Processing LinkedIn data with', response.data.linkedinData.experience?.length || 0, 'experience entries');
        
        updates.linkedinParsedData = response.data.linkedinData;
        
        const linkedinData = response.data.linkedinData;
        updates.personalInfo = {
          ...currentState.personalInfo,
          name: linkedinData.name || currentState.personalInfo.name
        };
      }
      break;

    case 'career-objectives':
      if (response.data.careerObjectives) {
        console.log('🔄 [OpenAI] Updating career objectives');
        updates.careerObjectives = response.data.careerObjectives;
      }
      
      // NEW: Process career objectives report
      if (response.data.careerObjectivesReport) {
        console.log('📊 [OpenAI] Processing career objectives report');
        updates.careerObjectivesReport = response.data.careerObjectivesReport;
      }
      break;

    case 'job-experience-loop':
      // NOTE: Job experience data will be handled by the VoiceInterface
      // to ensure proper indexing with actualJobIndex
      if (response.data.jobExperience) {
        console.log('🔄 [OpenAI] Job experience data available for processing');
      }
      
      if (response.data.jobExperienceReport) {
        console.log('📊 [OpenAI] Job experience report available for processing');
      }
      break;
  }

  const hasUpdates = Object.keys(updates).length > 0;
  console.log('🔄 [OpenAI] State updates:', hasUpdates ? 'Yes' : 'None');
  return hasUpdates ? updates : null;
}

function analyzeAndUpdateState(
  userInput: string,
  currentState: InterviewState,
  currentStep: InterviewStep
): Partial<InterviewState> | null {
  console.log('🔍 [OpenAI] Analyzing fallback state update for step:', currentStep.name);
  
  const input = userInput.toLowerCase();
  const updates: Partial<InterviewState> = {};

  switch (currentStep.name) {
    case 'welcome':
      // More generous name extraction
      if (userInput.trim().length > 1 && /^[a-zA-Z\s'-]+$/.test(userInput.trim())) {
        const name = userInput.trim();
        console.log('🔍 [OpenAI] Fallback: extracted name:', name);
        updates.personalInfo = { ...currentState.personalInfo, name };
      }
      break;

    case 'email':
      const emailMatch = userInput.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch && !currentState.personalInfo.email) {
        console.log('🔍 [OpenAI] Fallback: extracted email:', emailMatch[0]);
        updates.personalInfo = { ...currentState.personalInfo, email: emailMatch[0] };
      }
      break;

    case 'linkedin':
      const linkedinMatch = userInput.match(/linkedin\.com\/in\/[\w-]+|linkedin\.com\/[\w-]+/i) || 
                           (userInput.match(/^[a-zA-Z0-9-]+$/) ? [userInput.trim()] : null);
      if (linkedinMatch && !currentState.personalInfo.linkedin) {
        let linkedin = linkedinMatch[0];
        if (!linkedin.includes('linkedin.com')) {
          linkedin = `linkedin.com/in/${linkedin}`;
        }
        console.log('🔍 [OpenAI] Fallback: extracted LinkedIn:', linkedin);
        updates.personalInfo = { 
          ...currentState.personalInfo, 
          linkedin: linkedin.replace(/^https?:\/\//, '').replace(/^www\./, '')
        };
      }
      break;

    case 'linkedin-data':
      if (userInput.trim().length > 100) {
        console.log('🔍 [OpenAI] Fallback: storing raw LinkedIn data');
        updates.linkedinRawData = userInput.trim();
      }
      break;

    case 'career-objectives':
      if (userInput.trim().length > 10) {
        console.log('🔍 [OpenAI] Fallback: updating career objectives');
        const existingObjectives = currentState.careerObjectives || '';
        updates.careerObjectives = existingObjectives ? 
          `${existingObjectives}\n\n${userInput.trim()}` : 
          userInput.trim();
      }
      break;

    case 'job-experience-loop':
      // For job experience loop, we don't update state in fallback
      // The loop controller handles this
      break;
  }

  const hasUpdates = Object.keys(updates).length > 0;
  console.log('🔍 [OpenAI] Fallback updates:', hasUpdates ? 'Yes' : 'None');
  return hasUpdates ? updates : null;
}

function getFallbackResponse(stepName: string): string {
  const message = (() => {
    switch (stepName) {
      case 'welcome':
        return "Thank you for sharing your name! Now let's get your email address.";
      case 'email':
        return "Perfect! I have your email. Now I need your LinkedIn profile.";
      case 'linkedin':
        return "Great! Now please copy information from your LinkedIn profile.";
      case 'linkedin-data':
        return "Thank you for that information. Let me process your LinkedIn data.";
      case 'career-objectives':
        return "That's great insight into your career goals! Is there anything else you'd like to share, or shall we continue?";
      case 'job-experience-loop':
        return "Thank you for sharing that information about your work experience. Let's continue with more details.";
      case 'closing':
        return "Excellent! Your resume website instructions are ready for download.";
      default:
        return "Thank you for that information. Let's continue with the next step.";
    }
  })();
  
  console.log('🔄 [OpenAI] Generated fallback response for step', stepName, ':', message);
  return message;
}