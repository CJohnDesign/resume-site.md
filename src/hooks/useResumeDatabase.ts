import { useApiKey } from './useApiKey';

interface ResumeUserData {
  id?: string;
  name?: string;
  email: string;
  linkedin_url?: string;
  linkedin_raw_data?: string;
  linkedin_parsed_data?: any;
  career_objectives?: string;
  career_objectives_report?: any;
  job_experiences?: any;
  job_experience_reports?: any;
  final_resume_markdown?: string;
  interview_completed?: boolean;
  current_step?: number;
}

export function useResumeDatabase() {
  const { getApiKey } = useApiKey();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Silent database operations - never throw errors or show user feedback
  const silentDbOperation = async (operation: () => Promise<any>) => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('📊 [Database] Supabase not configured, skipping operation');
        return null;
      }
      
      return await operation();
    } catch (error) {
      console.log('📊 [Database] Silent operation failed:', error);
      return null;
    }
  };

  const createOrUpdateUser = async (userData: ResumeUserData) => {
    return silentDbOperation(async () => {
      console.log('📊 [Database] Creating/updating user:', userData.email);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/resume_site_users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          ...userData,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        // Try update instead if insert failed
        return await updateUser(userData);
      }

      const result = await response.json();
      console.log('📊 [Database] User created successfully');
      return result;
    });
  };

  const updateUser = async (userData: ResumeUserData) => {
    return silentDbOperation(async () => {
      console.log('📊 [Database] Updating user:', userData.email);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/resume_site_users?email=eq.${encodeURIComponent(userData.email)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          ...userData,
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('📊 [Database] User updated successfully');
        return await response.json();
      }
      
      return null;
    });
  };

  const getUser = async (email: string) => {
    return silentDbOperation(async () => {
      console.log('📊 [Database] Fetching user:', email);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/resume_site_users?email=eq.${encodeURIComponent(email)}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data[0] || null;
      }
      
      return null;
    });
  };

  // Step-specific save functions
  const saveNameAndEmail = async (name: string, email: string) => {
    return createOrUpdateUser({
      name,
      email,
      current_step: 1
    });
  };

  const saveLinkedInUrl = async (email: string, linkedinUrl: string) => {
    return updateUser({
      email,
      linkedin_url: linkedinUrl,
      current_step: 2
    });
  };

  const saveLinkedInData = async (email: string, rawData: string, parsedData: any) => {
    return updateUser({
      email,
      linkedin_raw_data: rawData,
      linkedin_parsed_data: parsedData,
      current_step: 3
    });
  };

  const saveCareerObjectives = async (email: string, objectives: string, report?: any) => {
    return updateUser({
      email,
      career_objectives: objectives,
      career_objectives_report: report,
      current_step: 4
    });
  };

  const saveJobExperience = async (email: string, jobIndex: number, jobData: any, jobReport?: any) => {
    return silentDbOperation(async () => {
      // First get current data
      const currentUser = await getUser(email);
      if (!currentUser) return null;

      const currentJobExperiences = currentUser.job_experiences || {};
      const currentJobReports = currentUser.job_experience_reports || {};

      // Update with new job data
      currentJobExperiences[jobIndex] = jobData;
      if (jobReport) {
        currentJobReports[jobIndex] = jobReport;
      }

      return updateUser({
        email,
        job_experiences: currentJobExperiences,
        job_experience_reports: currentJobReports,
        current_step: 5
      });
    });
  };

  const saveFinalResume = async (email: string, resumeMarkdown: string) => {
    return updateUser({
      email,
      final_resume_markdown: resumeMarkdown,
      interview_completed: true,
      current_step: 6
    });
  };

  return {
    saveNameAndEmail,
    saveLinkedInUrl,
    saveLinkedInData,
    saveCareerObjectives,
    saveJobExperience,
    saveFinalResume,
    getUser,
    createOrUpdateUser,
    updateUser
  };
}