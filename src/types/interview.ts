export interface PersonalInfo {
  name: string;
  email: string;
  linkedin: string;
}

export interface LinkedInExperience {
  title: string;
  company: string;
  duration: string;
  location?: string;
  description?: string;
}

export interface LinkedInEducation {
  school: string;
  degree: string;
  duration: string;
  description?: string;
}

export interface LinkedInData {
  name: string;
  headline: string;
  location?: string;
  about?: string;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: string[];
}

export interface JobExperienceDetail {
  jobTitle: string;
  company: string;
  duration: string;
  achievements: string;
  challenges?: string;
  skills?: string;
  impact?: string;
  learnings?: string;
}

// New comprehensive report interfaces
export interface CareerObjectivesReport {
  summary: string;
  idealRole: string;
  companyPreferences: string;
  shortTermGoals: string;
  longTermVision: string;
  keyMotivations: string;
  growthAreas: string;
  generatedAt: string;
}

export interface JobExperienceReport {
  jobTitle: string;
  company: string;
  duration: string;
  overallSummary: string;
  keyAchievements: string[];
  challengesOvercome: string[];
  skillsDeveloped: string[];
  measurableImpact: string[];
  keyLearnings: string[];
  resumeBulletPoints: string[];
  professionalGrowth: string;
  generatedAt: string;
}

export interface InterviewState {
  currentStep: number;
  personalInfo: PersonalInfo;
  linkedinRawData?: string;
  linkedinParsedData?: LinkedInData;
  careerObjectives?: string;
  oneYearVision?: string;
  
  // Enhanced reporting system
  careerObjectivesReport?: CareerObjectivesReport;
  jobExperienceReports?: {
    [jobIndex: number]: JobExperienceReport;
  };
  
  // NEW: Resume website prompt
  resumeWebsitePrompt?: string;
  
  // Original job experience data (for backward compatibility)
  jobExperiences?: {
    [jobIndex: number]: JobExperienceDetail;
  };
  currentJobIndex?: number;
  totalJobsToDiscuss?: number;
}