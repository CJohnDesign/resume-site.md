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
    
    console.log('📊 [Database] Environment check:', {
      hasUrl: !!url,
      hasKey: !!key,
      urlPreview: url ? url.substring(0, 30) + '...' : 'MISSING',
      keyPreview: key ? key.substring(0, 30) + '...' : 'MISSING',
      fullUrl: url, // Temporary for debugging
      fullKey: key ? key.substring(0, 50) + '...' : 'MISSING' // Show more for debugging
    });

    if (url && key) {
      setSupabaseUrl(url);
      setSupabaseAnonKey(key);
      setIsConnected(true);
      console.log('✅ [Database] Supabase connection established successfully');
      
      // Test connection
      testConnection(url, key);
    } else {
      console.error('❌ [Database] Supabase not configured - missing environment variables');
      console.error('📊 [Database] Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
      setIsConnected(false);
    }
  }, []);

  const testConnection = async (url: string, key: string) => {
    try {
      console.log('🔍 [Database] Testing Supabase connection...');
      const response = await fetch(`${url}/rest/v1/resume_site_users?limit=1`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });

      console.log('🔍 [Database] Test response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        console.log('✅ [Database] Connection test successful');
      } else {
        const errorText = await response.text();
        console.error('❌ [Database] Connection test failed:', errorText);
      }
    } catch (error) {
      console.error('❌ [Database] Connection test error:', error);
    }
  };

  // Enhanced silent database operations with detailed logging
  const silentDbOperation = async (operation: () => Promise<any>, operationName: string, context?: any) => {
    console.log(`🚀 [Database] Starting ${operationName}`, context || '');
    
    if (!isConnected) {
      console.warn(`⚠️ [Database] Skipping ${operationName} - Supabase not connected`);
      return null;
    }

    try {
      const startTime = Date.now();
      const result = await operation();
      const duration = Date.now() - startTime;
      console.log(`✅ [Database] ${operationName} completed successfully in ${duration}ms`);
      return result;
    } catch (error) {
      console.error(`❌ [Database] ${operationName} failed:`, error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error(`❌ [Database] Error details:`, {
          message: error.message,
          stack: error.stack
        });
      }
      return null;
    }
  };

  const createOrUpdateUser = async (userData: ResumeUserData) => {
    return silentDbOperation(async () => {
      console.log('📝 [Database] Creating/updating user with data:', {
        email: userData.email,
        name: userData.name,
        hasLinkedinUrl: !!userData.linkedin_url,
        hasLinkedinData: !!userData.linkedin_parsed_data,
        hasCareerObjectives: !!userData.career_objectives,
        hasJobExperiences: !!userData.job_experiences,
        hasFinalResume: !!userData.final_resume_markdown,
        currentStep: userData.current_step
      });
      
      // First try to get existing user
      const existingUser = await getUser(userData.email);
      
      if (existingUser) {
        console.log('👤 [Database] User exists, updating...', {
          existingId: existingUser.id,
          existingStep: existingUser.current_step
        });
        return await updateUserDirect(userData);
      } else {
        console.log('👤 [Database] Creating new user...');
        return await createUserDirect(userData);
      }
    }, 'createOrUpdateUser', { email: userData.email });
  };

  const createUserDirect = async (userData: ResumeUserData) => {
    const payload = {
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📤 [Database] Creating user with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${supabaseUrl}/rest/v1/resume_site_users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 [Database] Create response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Database] Create failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Create failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [Database] User created successfully:', {
      id: result[0]?.id,
      email: result[0]?.email,
      step: result[0]?.current_step
    });
    return result;
  };

  const updateUserDirect = async (userData: ResumeUserData) => {
    const payload = {
      ...userData,
      updated_at: new Date().toISOString()
    };

    console.log('📤 [Database] Updating user with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${supabaseUrl}/rest/v1/resume_site_users?email=eq.${encodeURIComponent(userData.email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 [Database] Update response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Database] Update failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Update failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [Database] User updated successfully:', {
      id: result[0]?.id,
      email: result[0]?.email,
      step: result[0]?.current_step
    });
    return result;
  };

  const getUser = async (email: string) => {
    return silentDbOperation(async () => {
      console.log('🔍 [Database] Fetching user:', email);
      
      const url = `${supabaseUrl}/rest/v1/resume_site_users?email=eq.${encodeURIComponent(email)}&select=*`;
      console.log('🔍 [Database] Fetch URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      console.log('📥 [Database] Get user response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Database] Get user failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return null;
      }

      const data = await response.json();
      const user = data[0] || null;
      console.log('📋 [Database] User fetched:', {
        found: !!user,
        id: user?.id,
        email: user?.email,
        step: user?.current_step,
        hasName: !!user?.name
      });
      return user;
    }, 'getUser', { email });
  };

  // Step-specific save functions with enhanced logging
  const saveNameAndEmail = async (name: string, email: string) => {
    console.log('💾 [Database] saveNameAndEmail triggered:', { name, email });
    return createOrUpdateUser({
      name,
      email,
      current_step: 1
    });
  };

  const saveLinkedInUrl = async (email: string, linkedinUrl: string) => {
    console.log('💾 [Database] saveLinkedInUrl triggered:', { email, linkedinUrl });
    return createOrUpdateUser({
      email,
      linkedin_url: linkedinUrl,
      current_step: 2
    });
  };

  const saveLinkedInData = async (email: string, rawData: string, parsedData: any) => {
    console.log('💾 [Database] saveLinkedInData triggered:', { 
      email, 
      rawDataLength: rawData.length,
      hasExperience: !!parsedData?.experience,
      experienceCount: parsedData?.experience?.length || 0
    });
    return createOrUpdateUser({
      email,
      linkedin_raw_data: rawData,
      linkedin_parsed_data: parsedData,
      current_step: 3
    });
  };

  const saveCareerObjectives = async (email: string, objectives: string, report?: any) => {
    console.log('💾 [Database] saveCareerObjectives triggered:', { 
      email, 
      objectivesLength: objectives.length,
      hasReport: !!report
    });
    return createOrUpdateUser({
      email,
      career_objectives: objectives,
      career_objectives_report: report,
      current_step: 4
    });
  };

  const saveJobExperience = async (email: string, jobIndex: number, jobData: any, jobReport?: any) => {
    console.log('💾 [Database] saveJobExperience triggered:', { 
      email, 
      jobIndex, 
      jobTitle: jobData?.jobTitle,
      hasReport: !!jobReport
    });
    
    return silentDbOperation(async () => {
      // First get current data
      const currentUser = await getUser(email);
      if (!currentUser) {
        console.warn('⚠️ [Database] No user found for job experience save, creating new user');
        // Create user first if they don't exist
        await createOrUpdateUser({ email, current_step: 5 });
      }

      const currentJobExperiences = currentUser?.job_experiences || {};
      const currentJobReports = currentUser?.job_experience_reports || {};

      // Update with new job data
      currentJobExperiences[jobIndex] = jobData;
      if (jobReport) {
        currentJobReports[jobIndex] = jobReport;
      }

      console.log('💾 [Database] Saving job experiences:', {
        totalJobs: Object.keys(currentJobExperiences).length,
        totalReports: Object.keys(currentJobReports).length,
        currentJobIndex: jobIndex
      });

      return createOrUpdateUser({
        email,
        job_experiences: currentJobExperiences,
        job_experience_reports: currentJobReports,
        current_step: 5
      });
    }, 'saveJobExperience', { email, jobIndex });
  };

  const saveFinalResume = async (email: string, resumeMarkdown: string) => {
    console.log('💾 [Database] saveFinalResume triggered:', { 
      email, 
      resumeLength: resumeMarkdown.length 
    });
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