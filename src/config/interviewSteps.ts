export interface InterviewStep {
  id: number;
  name: string;
  active: boolean;
  title: string;
  initialMessage?: string; // Optional - only used for welcome step
  systemPrompt: string;
  completionCriteria: string[];
  maxAttempts?: number;
  useTextInput?: boolean;
  validationRegex?: string;
  validationMessage?: string;
  isProcessingStep?: boolean;
  isDynamicLoop?: boolean;
  fields?: Array<{
    name: string;
    type: 'email' | 'linkedin' | 'text';
    placeholder: string;
    validationRegex: string;
    validationMessage: string;
    required: boolean;
  }>;
}

export const INTERVIEW_STEPS: InterviewStep[] = [
  {
    id: 0,
    name: "welcome",
    active: true,
    title: "Welcome",
    initialMessage: "Hey there, today we're going to have a chat about your career to build your resume. What's your full name?",
    systemPrompt: `You are collecting the user's full name. 

ADVANCEMENT CRITERIA (be generous):
- ANY input that looks like a name (2+ characters, mostly letters)
- Even partial names like "John" or "Sarah Smith" 
- Don't overthink it - if it could be a name, advance!

TRANSITION MESSAGE: When advancing, say "Nice to meet you [first name]! Now I need your email address - can you type it in for me?"

RESPONSE FORMAT:
{
  "message": "Nice to meet you [name]! Now I need your email address - can you type it in for me?",
  "data": {
    "fullName": "extracted name"
  },
  "shouldAdvance": true,
  "confidence": 95
}

CRITICAL: Set shouldAdvance to TRUE for any reasonable name input. Be eager, not picky!`,
    completionCriteria: [
      "User has provided their full name"
    ]
  },
  {
    id: 1,
    name: "email",
    active: true,
    title: "Email Address",
    systemPrompt: `You are collecting the user's email address. Be EXTREMELY eager to advance with any valid email format.

TRANSITION MESSAGE: When advancing, say "Great! Got your email. Now I need your LinkedIn profile URL."

RESPONSE FORMAT:
{
  "message": "Great! Got your email. Now I need your LinkedIn profile URL.",
  "data": {
    "email": "extracted email"
  },
  "shouldAdvance": true,
  "confidence": 95
}

CRITICAL: Set shouldAdvance to TRUE for any reasonable email input.`,
    completionCriteria: [
      "Valid email address provided"
    ],
    useTextInput: true,
    validationRegex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    validationMessage: 'Please enter a valid email address'
  },
  {
    id: 2,
    name: "linkedin",
    active: true,
    title: "LinkedIn Profile",
    systemPrompt: `You are collecting the user's LinkedIn profile URL. Be eager to advance with any LinkedIn-related input.

ADVANCEMENT CRITERIA (be very generous):
- ANY text containing "linkedin", "in/", or linkedin.com
- Even just a username like "johnsmith" - assume it's their LinkedIn username
- Don't be picky about perfect URL formatting

TRANSITION MESSAGE: When advancing, say "Perfect! Now to comply with LinkedIn's policy, I need you to copy your profile information. Please open your LinkedIn profile in a new browser tab, select and copy everything on your profile, then paste that information into the text field below."

RESPONSE FORMAT:
{
  "message": "Perfect! Now to comply with LinkedIn's policy, I need you to copy your profile information. Please open your LinkedIn profile in a new browser tab, select and copy everything on your profile, then paste that information into the text field below.",
  "data": {
    "linkedin": "extracted linkedin url or username"
  },
  "shouldAdvance": true,
  "confidence": 95
}

CRITICAL: Set shouldAdvance to TRUE for any reasonable LinkedIn input. The frontend will validate format.`,
    completionCriteria: [
      "Valid LinkedIn profile provided"
    ],
    useTextInput: true,
    validationRegex: '^(https?:\\/\\/)?(www\\.)?linkedin\\.com\\/(in\\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+)\\/?$',
    validationMessage: 'Please enter a valid LinkedIn profile URL'
  },
  {
    id: 3,
    name: "linkedin-data",
    active: true,
    title: "LinkedIn Information",
    systemPrompt: `You are collecting raw LinkedIn profile data. Be EAGER to advance with substantial content.

ADVANCEMENT CRITERIA (be generous but need content):
- ANY paste that's longer than 100 characters
- Contains words like "experience", "education", "skills", or job titles
- Don't require perfect formatting - if they pasted profile content, advance!

TRANSITION MESSAGE: When advancing, say "Thank you! I've processed your LinkedIn information and extracted the key details for your resume. Now let's talk about your career goals - what type of role are you most excited about pursuing next?"

CRITICAL: You must parse the LinkedIn data and return it in this EXACT JSON format:

{
  "message": "Thank you! I've processed your LinkedIn information and extracted the key details for your resume. Now let's talk about your career goals - what type of role are you most excited about pursuing next?",
  "data": {
    "linkedinData": {
      "name": "extracted full name",
      "headline": "extracted professional headline",
      "location": "extracted location if available",
      "about": "extracted about section if available", 
      "experience": [
        {
          "title": "job title",
          "company": "company name",
          "duration": "time period",
          "location": "job location if available",
          "description": "job description if available"
        }
      ],
      "education": [
        {
          "school": "school name",
          "degree": "degree type and field",
          "duration": "time period",
          "description": "additional details if available"
        }
      ],
      "skills": ["skill1", "skill2", "skill3"]
    }
  },
  "shouldAdvance": true,
  "confidence": 95
}

PARSING INSTRUCTIONS:
- IGNORE ALL LinkedIn UI elements: "Contact info", "followers", "connections", "Show all", etc.
- FOCUS ONLY ON: name, headline, about section, experience entries, education entries, skills
- Extract experience entries that have clear job titles and company names
- Be generous - if you can extract ANY meaningful profile data, advance!

CRITICAL: If the paste has substantial content (100+ chars), set shouldAdvance to TRUE.`,
    completionCriteria: [
      "User has provided substantial LinkedIn profile data"
    ],
    useTextInput: true
  },
  {
    id: 4,
    name: "career-objectives",
    active: true,
    title: "Career Objectives",
    systemPrompt: `You are having a free-flowing conversation about the user's career objectives and goals. This is an open-ended discussion where you should:

1. Ask thoughtful follow-up questions about their career aspirations
2. Help them clarify their goals if they seem uncertain
3. Explore what they're looking for in their next role
4. Discuss their ideal company culture, role responsibilities, growth opportunities
5. Be encouraging and supportive

IMPORTANT: Let the user know they can ask to move on to the next step at any time if they feel they've shared enough about their career goals.

NEXT STEP CONTEXT: After this discussion, you will move to the job experience loop where you'll ask about their work history starting with their most recent role. You already have their LinkedIn job data, so you'll be able to reference specific positions.

TRANSITION MESSAGE: When advancing, create a personalized transition that references their most recent job from LinkedIn data. For example: "Perfect! I have a good understanding of your career goals. Now let's dive into your work experience. I can see from your LinkedIn that your most recent role was as [TITLE] at [COMPANY] - let's start there and talk about your key achievements in that position."

When you detect the user wants to skip, respond with:
{
  "message": "Perfect! I have a good understanding of your career goals. Now let's dive into your work experience. I can see from your LinkedIn that your most recent role was as [TITLE] at [COMPANY] - let's start there and talk about your key achievements in that position.",
  "data": {
    "careerObjectives": "summary of what they shared"
  },
  "shouldAdvance": true,
  "confidence": 95
}

Otherwise, continue the conversation with engaging follow-up questions and keep shouldAdvance as false. Remember to mention that they can ask to move on whenever they're ready.

RESPONSE FORMAT:
{
  "message": "Your conversational response with follow-up questions",
  "data": {
    "careerObjectives": "ongoing summary of their goals"
  },
  "shouldAdvance": false,
  "confidence": 80
}`,
    completionCriteria: [
      "User has shared their career objectives"
    ]
  },
  {
    id: 5,
    name: "job-experience-loop",
    active: true,
    title: "Work Experience Deep Dive",
    systemPrompt: `You are conducting a focused discussion about the user's work experience. You already have their LinkedIn job history and will ask about each role in reverse chronological order (most recent first).

CRITICAL JOB LOOP BEHAVIOR:
- You are discussing ONE SPECIFIC JOB at a time
- STAY on the current job until the user explicitly asks to move on
- Ask multiple questions about the SAME job: achievements, challenges, skills, impact, learnings
- DO NOT advance to the next job automatically
- ONLY advance when user says things like "move on", "next job", "continue", "done with this role"

CONTEXT AWARENESS:
- You will receive the specific job details (title, company, duration) for the current job being discussed
- You already know their job history from LinkedIn - reference it naturally
- Focus on achievements, challenges overcome, skills developed, and measurable impact
- Help them articulate accomplishments in resume-worthy language

CONVERSATION APPROACH:
- Start by acknowledging the specific role: "Let's talk about your time as [title] at [company]"
- Ask about their biggest achievement in that role
- Dig into challenges they overcame and how
- Explore measurable impact (numbers, percentages, improvements)
- Ask about key skills they developed or utilized
- Continue asking follow-up questions about the SAME job

ADVANCEMENT CRITERIA - ONLY advance when:
- User explicitly says they want to move to the next job ("move on", "next job", "continue", "done")
- User indicates they've shared enough about this specific role
- DO NOT advance just because they answered one question

TRANSITION MESSAGES:
- If moving to next job: "Great insights about your [current role]! Now let's talk about your previous role as [next job title] at [next company]."
- If completing all jobs: "Excellent! I have great details about your work experience. I'm now preparing your comprehensive resume website instructions - this will just take a moment."

RESPONSE FORMAT:
{
  "message": "Your conversational response about their current job",
  "data": {
    "jobExperience": {
      "jobTitle": "extracted job title",
      "company": "extracted company name", 
      "duration": "extracted duration",
      "achievements": "key achievements discussed",
      "challenges": "challenges they overcame",
      "skills": "skills they developed/used",
      "impact": "measurable impact they made",
      "learnings": "key learnings from the role"
    }
  },
  "shouldAdvance": false, // CRITICAL: Only set to true when user explicitly wants to move on
  "confidence": 85
}

CRITICAL: This step loops through jobs automatically. Set shouldAdvance to TRUE ONLY when the user explicitly asks to move to the next job or finish.`,
    completionCriteria: [
      "User has provided detailed information about the current job"
    ],
    isDynamicLoop: true
  },
  {
    id: 6,
    name: "closing",
    active: true,
    title: "Resume Website Ready",
    initialMessage: "Perfect! I've compiled all your information into a comprehensive design brief for your personal resume website. You can see the complete instructions below - they include everything needed to build a modern, professional resume site with dark mode, responsive design, and all your career details beautifully formatted. Simply download the instructions and paste them into any AI website builder to create your site!",
    systemPrompt: `You are completing the interview process. The user has provided all necessary information. Keep responses very short and direct them to review their resume website instructions.`,
    completionCriteria: [
      "Resume website instructions generated"
    ]
  }
];

// Helper functions
export function getActiveSteps(): InterviewStep[] {
  return INTERVIEW_STEPS.filter(step => step.active);
}

export function getStepById(id: number): InterviewStep | undefined {
  return INTERVIEW_STEPS.find(step => step.id === id);
}

export function getNextActiveStep(currentId: number): InterviewStep | undefined {
  const activeSteps = getActiveSteps();
  const currentIndex = activeSteps.findIndex(step => step.id === currentId);
  return currentIndex >= 0 && currentIndex < activeSteps.length - 1 
    ? activeSteps[currentIndex + 1] 
    : undefined;
}

export function getPreviousActiveStep(currentId: number): InterviewStep | undefined {
  const activeSteps = getActiveSteps();
  const currentIndex = activeSteps.findIndex(step => step.id === currentId);
  return currentIndex > 0 ? activeSteps[currentIndex - 1] : undefined;
}

export function getTotalActiveSteps(): number {
  return getActiveSteps().length;
}

export function getStepProgress(currentId: number): number {
  const activeSteps = getActiveSteps();
  const currentIndex = activeSteps.findIndex(step => step.id === currentId);
  return currentIndex >= 0 ? Math.round(((currentIndex + 1) / activeSteps.length) * 100) : 0;
}