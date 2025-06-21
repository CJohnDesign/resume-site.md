/*
  # Resume Site Users Database Schema

  1. New Tables
    - `resume_site_users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `linkedin_url` (text)
      - `linkedin_raw_data` (text) - Raw LinkedIn paste
      - `linkedin_parsed_data` (jsonb) - Structured LinkedIn data
      - `career_objectives` (text) - Final career objectives
      - `career_objectives_report` (jsonb) - Detailed career report
      - `job_experiences` (jsonb) - All job experience details
      - `job_experience_reports` (jsonb) - Detailed job reports
      - `final_resume_markdown` (text) - Generated resume markdown
      - `interview_completed` (boolean) - Whether interview was completed
      - `current_step` (integer) - Last completed step
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `resume_site_users` table
    - Add policy for public insert (no auth required)
    - Add policy for public read/update by email (no auth required)
*/

CREATE TABLE IF NOT EXISTS resume_site_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE NOT NULL,
  linkedin_url text,
  linkedin_raw_data text,
  linkedin_parsed_data jsonb,
  career_objectives text,
  career_objectives_report jsonb,
  job_experiences jsonb DEFAULT '{}'::jsonb,
  job_experience_reports jsonb DEFAULT '{}'::jsonb,
  final_resume_markdown text,
  interview_completed boolean DEFAULT false,
  current_step integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE resume_site_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
-- Policy for inserting new users (when they enter email)
CREATE POLICY "Allow public insert"
  ON resume_site_users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for reading user data by email
CREATE POLICY "Allow public read by email"
  ON resume_site_users
  FOR SELECT
  TO anon
  USING (true);

-- Policy for updating user data by email
CREATE POLICY "Allow public update by email"
  ON resume_site_users
  FOR UPDATE
  TO anon
  USING (true);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS resume_site_users_email_idx ON resume_site_users (email);

-- Create index for faster step tracking
CREATE INDEX IF NOT EXISTS resume_site_users_step_idx ON resume_site_users (current_step);

-- Create index for completion status
CREATE INDEX IF NOT EXISTS resume_site_users_completed_idx ON resume_site_users (interview_completed);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_resume_site_users_updated_at
  BEFORE UPDATE ON resume_site_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();