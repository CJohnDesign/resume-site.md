import { InterviewState } from '../types/interview';

export function generateResumeWebsitePrompt(state: InterviewState): string {
  const currentDate = new Date().toLocaleDateString();
  
  return `# Build a Resume Website for ${state.personalInfo.name || '[Name]'}

We are building a professional resume website for ${state.personalInfo.name || '[Name]'}, a ${getPersonSummary(state)} based in ${state.linkedinParsedData?.location || 'their location'}.

## Personal Information
- **Name:** ${state.personalInfo.name || '[Name]'}
- **Email:** ${state.personalInfo.email || '[Email]'}
- **LinkedIn:** ${state.personalInfo.linkedin ? `https://${state.personalInfo.linkedin.replace(/^https?:\/\//, '')}` : '[LinkedIn]'}
${state.linkedinParsedData?.location ? `- **Location:** ${state.linkedinParsedData.location}` : ''}
${state.linkedinParsedData?.headline ? `- **Professional Headline:** ${state.linkedinParsedData.headline}` : ''}

## Career Vision & Goals
${generateCareerSection(state)}

## Professional Experience
${generateExperienceSection(state)}

## Education & Certifications
${generateEducationSection(state)}

## Technical Skills & Expertise
${generateSkillsSection(state)}

## Design Requirements

Create a modern, minimalistic, and professional resume website with a strong emphasis on clarity and structure. Set against a sleek dark background (#0f172a or similar), the interface should use high-contrast white text and subtle gray accents to ensure readability while maintaining a refined tone. 

**Key Design Elements:**
- Clean typography with proper hierarchy (use fonts like Inter, Poppins, or similar modern sans-serif)
- Aligned grids and well-structured sections
- Horizontal bar graphs or progress indicators to convey skill levels visually
- Section headers that are distinct and well-spaced with small, bold, capitalized text with letter spacing
- Dark/light mode toggle functionality (default to dark mode)
- Responsive design that works perfectly on mobile, tablet, and desktop
- Smooth animations and hover effects
- Professional color scheme with accent colors (orange/blue recommended)
- Clean navigation and smooth scrolling between sections

**Layout Structure:**
- Hero section with name, title, and brief introduction
- About/Summary section
- Experience section with timeline or card layout
- Skills section with visual indicators
- Education section
- Contact information footer

The overall aesthetic should convey focus, technical competence, and design sensibility. Use modern web technologies (React, Tailwind CSS, or similar) and ensure the site loads quickly and performs well.

**Technical Requirements:**
- Fully responsive design
- Dark mode with light mode toggle
- Smooth scrolling navigation
- Professional animations and micro-interactions
- SEO optimized
- Fast loading performance
- Clean, semantic HTML structure

Build this resume website.`;
}

function getPersonSummary(state: InterviewState): string {
  if (state.linkedinParsedData?.headline) {
    return state.linkedinParsedData.headline.toLowerCase();
  }
  
  if (state.linkedinParsedData?.experience && state.linkedinParsedData.experience.length > 0) {
    const latestJob = state.linkedinParsedData.experience[0];
    return `${latestJob.title.toLowerCase()} at ${latestJob.company}`;
  }
  
  return 'professional';
}

function generateCareerSection(state: InterviewState): string {
  let section = '';
  
  if (state.careerObjectivesReport) {
    section += `**Career Vision:** ${state.careerObjectivesReport.summary}\n\n`;
    section += `**Professional Goals:** ${state.careerObjectivesReport.shortTermGoals}\n\n`;
    section += `**Long-term Vision:** ${state.careerObjectivesReport.longTermVision}`;
  } else if (state.careerObjectives) {
    section += state.careerObjectives;
  } else if (state.linkedinParsedData?.about) {
    section += state.linkedinParsedData.about;
  } else {
    section += '[Career objectives and professional goals to be added]';
  }
  
  return section;
}

function generateExperienceSection(state: InterviewState): string {
  // Use detailed job experience reports if available
  if (state.jobExperienceReports && Object.keys(state.jobExperienceReports).length > 0) {
    const reports = Object.values(state.jobExperienceReports);
    
    return reports.map(report => `
**${report.jobTitle}** | ${report.company}
*${report.duration}*

${report.overallSummary}

Key Achievements:
${report.keyAchievements.map(achievement => `• ${achievement}`).join('\n')}

Skills: ${report.skillsDeveloped.join(', ')}
`).join('\n---\n');
  }

  // Fallback to LinkedIn data
  if (state.linkedinParsedData?.experience && state.linkedinParsedData.experience.length > 0) {
    return state.linkedinParsedData.experience.map(exp => `
**${exp.title}** | ${exp.company}
*${exp.duration}*${exp.location ? ` • ${exp.location}` : ''}

${exp.description || 'Key responsibilities and achievements in this role.'}
`).join('\n---\n');
  }
  
  return '[Professional experience to be added]';
}

function generateEducationSection(state: InterviewState): string {
  if (state.linkedinParsedData?.education && state.linkedinParsedData.education.length > 0) {
    return state.linkedinParsedData.education.map(edu => `
**${edu.school}**
${edu.degree} • ${edu.duration}
${edu.description ? edu.description : ''}
`).join('\n');
  }
  
  return '[Education and certifications to be added]';
}

function generateSkillsSection(state: InterviewState): string {
  let skills = '';
  
  if (state.linkedinParsedData?.skills && state.linkedinParsedData.skills.length > 0) {
    skills += `**Technical Skills:** ${state.linkedinParsedData.skills.join(', ')}\n\n`;
  }
  
  // Add skills from job reports
  if (state.jobExperienceReports && Object.keys(state.jobExperienceReports).length > 0) {
    const allSkills = new Set<string>();
    Object.values(state.jobExperienceReports).forEach(report => {
      report.skillsDeveloped.forEach(skill => allSkills.add(skill));
    });
    
    if (allSkills.size > 0) {
      skills += `**Professional Skills:** ${Array.from(allSkills).join(', ')}\n\n`;
    }
  }
  
  skills += '**Core Competencies:** Leadership, Communication, Problem Solving, Project Management, Team Collaboration, Strategic Thinking';
  
  return skills || '[Technical and professional skills to be added]';
}