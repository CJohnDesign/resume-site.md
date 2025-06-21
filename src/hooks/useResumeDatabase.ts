import { useState, useEffect } from 'react';

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
  const [isConnected, setIsConnected] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>('');

  useEffect(() => {
    // Check for Supabase environment variables
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('📊 [Database] Checking Supabase connection:', {
      hasUrl: !!url,
      hasKey: !!key,
      urlPreview: url ? url.substring(0, 20) + '...' : 'none',
      keyPreview: key ? key.substring(0, 20) + '...' : 'none'
    });

    if (url && key) {
      setSupabaseUrl(url);
      setSupabaseAnonKey(key);
      setIsConnected(true);
      console.log('📊 [Database] Supabase connection established');
    } else {
      console.log('📊 [Database] Supabase not configured - missing environment variables');
      console.log('📊 [Database] Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    }
  }, []);

  // Silent database operations - never throw errors or show user feedback
  const silentDbOperation = async (operation: () => Promise<any>, operationName: string) => {
    if (!isConnected) {
      console.log(`📊 [Database] Skipping ${operationName} - Supabase not connected`);
      return null;
    }

    try {
      console.log(`📊 [Database] Executing ${operationName}`);
      const result = await operation();
      console.log(`📊 [Database] ${operationName} completed successfully`);
      return result;
    } catch (error) {
      console.log(`📊 [Database] ${operationName} failed silently:`, error);
      return null;
    }
  };

  const createOrUpdateUser = async (userData: ResumeUserData) => {
    return silentDbOperation(async () => {
      console.log('📊 [Database] Creating/updating user:', userData.email);
      
      // First try to get existing user
      const existingUser = await getUser(userData.email);
      
      if (existingUser) {
        // Update existing user
        console.log('📊 [Database] User exists, updating...');
        return await updateUserDirect(userData);
      } else {
        // Create new user
        console.log('📊 [Database] Creating new user...');
        return await createUserDirect(userData);
      }
    }, 'createOrUpdateUser');
  };

  const createUserDirect = async (userData: ResumeUserData) => {
    const response = await fetch(`${supabaseUrl}/rest/v1/resume_site_users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('📊 [Database] Create failed:', response.status, errorText);
      throw new Error(`Create failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('📊 [Database] User created successfully:', result);
    return result;
  };

  const updateUserDirect = async (userData: ResumeUserData) => {
    const response = await fetch(`${supabaseUrl}/rest/v1/resume_site_users?email=eq.${encodeURIComponent(userData.email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...userData,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('📊 [Database] Update failed:', response.status, errorText);
      throw new Error(`Update failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('📊 [Database] User updated successfully:', result);
    return result;
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

      if (!response.ok) {
        const errorText = await response.text();
        console.log('📊 [Database] Get user failed:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      const user = data[0] || null;
      console.log('📊 [Database] User fetched:', user ? 'found' : 'not found');
      return user;
    }, 'getUser');
  };

  // Step-specific save functions
  const saveNameAndEmail = async (name: string, email: string) => {
    console.log('📊 [Database] saveNameAndEmail called:', { name, email });
    return createOrUpdateUser({
      name,
      email,
      current_step: 1
    });
  };

  const saveLinkedInUrl = async (email: string, linkedinUrl: string) => {
    console.log('📊 [Database] saveLinkedInUrl called:', { email, linkedinUrl });
    return createOrUpdateUser({
      email,
      linkedin_url: linkedinUrl,
      current_step: 2
    });
  };

  const saveLinkedInData = async (email: string, rawData: string, parsedData: any) => {
    console.log('📊 [Database] saveLinkedInData called:', { email, rawDataLength: rawData.length });
    return createOrUpdateUser({
      email,
      linkedin_raw_data: rawData,
      linkedin_parsed_data: parsedData,
      current_step: 3
    });
  };

  const saveCareerObjectives = async (email: string, objectives: string, report?: any) => {
    console.log('📊 [Database] saveCareerObjectives called:', { email, objectivesLength: objectives.length });
    return createOrUpdateUser({
      email,
      career_objectives: objectives,
      career_objectives_report: report,
      current_step: 4
    });
  };

  const saveJobExperience = async (email: string, jobIndex: number, jobData: any, jobReport?: any) => {
    console.log('📊 [Database] saveJobExperience called:', { email, jobIndex, jobTitle: jobData?.jobTitle });
    
    return silentDbOperation(async () => {
      // First get current data
      const currentUser = await getUser(email);
      if (!currentUser) {
        console.log('📊 [Database] No user found for job experience save');
        return null;
      }

      const currentJobExperiences = currentUser.job_experiences || {};
      const currentJobReports = currentUser.job_experience_reports || {};

      // Update with new job data
      currentJobExperiences[jobIndex] = jobData;
      if (jobReport) {
        currentJobReports[jobIndex] = jobReport;
      }

      return createOrUpdateUser({
        email,
        job_experiences: currentJobExperiences,
        job_experience_reports: currentJobReports,
        current_step: 5
      });
    }, 'saveJobExperience');
  };

  const saveFinalResume = async (email: string, resumeMarkdown: string) => {
    console.log('📊 [Database] saveFinalResume called:', { email, resumeLength: resumeMarkdown.length });
    return createOrUpdateUser({
      email,
      final_resume_markdown: resumeMarkdown,
      interview_completed: true,
      current_step: 6
    });
  };

  return {
    isConnected,
    saveNameAndEmail,
    saveLinkedInUrl,
    saveLinkedInData,
    saveCareerObjectives,
    saveJobExperience,
    saveFinalResume,
    getUser,
    createOrUpdateUser
  };
}