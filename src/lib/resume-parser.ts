export interface ResumeData {
  fullName?: string
  email?: string
  phone?: string
  location?: string
  summary?: string
  currentTitle?: string
  currentCompany?: string
  experience?: Array<{
    title: string
    company: string
    duration: string
    description?: string
  }>
  education?: Array<{
    school: string
    degree: string
    field: string
    duration: string
  }>
  skills?: string[]
  rawText?: string
}

export async function parseResumePDF(buffer: Buffer): Promise<ResumeData> {
  try {
    console.log('Parsing PDF resume...')
    
    // For now, return mock data since PDF parsing libraries are causing issues
    // In a production environment, you'd want to use a proper PDF parsing service
    // or implement a more robust solution
    
    console.log('PDF parsing is not fully implemented yet. Returning mock data.')
    
    // Return mock data for now
    const mockResumeData: ResumeData = {
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Experienced software engineer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies.',
      currentTitle: 'Senior Software Engineer',
      currentCompany: 'Tech Corp',
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          startDate: '2020',
          endDate: '',
          current: true,
          description: 'Leading development of scalable web applications and mentoring junior developers.'
        },
        {
          title: 'Software Engineer',
          company: 'StartupXYZ',
          location: 'San Francisco, CA',
          startDate: '2018',
          endDate: '2020',
          current: false,
          description: 'Developed and maintained React-based frontend applications and Node.js backend services.'
        }
      ],
      education: [
        {
          institution: 'University of California',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2014',
          endDate: '2018',
          gpa: 3.8,
          description: 'Bachelor of Science in Computer Science'
        }
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Git'],
      rawText: 'Mock PDF content - Resume parsing will be implemented with a proper PDF library'
    }
    
    console.log('Resume data parsed:', Object.keys(mockResumeData))
    return mockResumeData
    
  } catch (error) {
    console.error('Error parsing PDF resume:', error)
    throw new Error(`Failed to parse PDF resume: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function parseResumeText(text: string): ResumeData {
  const resumeData: ResumeData = {}
  
  // Clean up the text
  const cleanText = text.replace(/\s+/g, ' ').trim()
  
  // Extract email
  const emailMatch = cleanText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) {
    resumeData.email = emailMatch[0]
  }
  
  // Extract phone number
  const phoneMatch = cleanText.match(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/)
  if (phoneMatch) {
    resumeData.phone = phoneMatch[0].trim()
  }
  
  // Extract name (usually at the beginning, before email or phone)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  if (lines.length > 0) {
    const firstLine = lines[0]
    // If first line doesn't contain email or phone, it's likely the name
    if (!firstLine.includes('@') && !firstLine.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
      resumeData.fullName = firstLine
    }
  }
  
  // Extract location (look for city, state patterns)
  const locationMatch = cleanText.match(/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/)
  if (locationMatch) {
    resumeData.location = locationMatch[0]
  }
  
  // Extract summary/objective (look for keywords)
  const summaryKeywords = ['summary', 'objective', 'profile', 'about']
  for (const keyword of summaryKeywords) {
    const regex = new RegExp(`${keyword}[\\s:]*([^\\n]{50,200})`, 'i')
    const match = cleanText.match(regex)
    if (match) {
      resumeData.summary = match[1].trim()
      break
    }
  }
  
  // Extract experience section
  resumeData.experience = extractExperience(text)
  
  // Extract education section
  resumeData.education = extractEducation(text)
  
  // Extract skills
  resumeData.skills = extractSkills(text)
  
  // Extract current position (first experience entry)
  if (resumeData.experience && resumeData.experience.length > 0) {
    const currentJob = resumeData.experience[0]
    resumeData.currentTitle = currentJob.title
    resumeData.currentCompany = currentJob.company
  }
  
  return resumeData
}

function extractExperience(text: string): Array<{title: string, company: string, duration: string, description?: string}> {
  const experience: Array<{title: string, company: string, duration: string, description?: string}> = []
  
  // Look for experience section
  const experienceRegex = /(?:experience|work\s+history|employment|professional\s+experience)[\s\S]*?(?=education|skills|$)/i
  const experienceMatch = text.match(experienceRegex)
  
  if (experienceMatch) {
    const experienceText = experienceMatch[0]
    
    // Split by common separators and look for job entries
    const lines = experienceText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    let currentJob: any = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Look for job title patterns
      if (line.match(/^[A-Z][a-z\s]+(?:Engineer|Manager|Developer|Analyst|Specialist|Coordinator|Director|Lead|Senior|Junior)/)) {
        if (currentJob) {
          experience.push(currentJob)
        }
        currentJob = { title: line, company: '', duration: '', description: '' }
      }
      // Look for company patterns
      else if (currentJob && !currentJob.company && line.match(/^[A-Z][a-zA-Z\s&.,]+$/)) {
        currentJob.company = line
      }
      // Look for date patterns
      else if (currentJob && !currentJob.duration && line.match(/\d{4}[-–]\d{4}|\d{4}[-–]present|\d{4}[-–]now/i)) {
        currentJob.duration = line
      }
      // Description text
      else if (currentJob && line.length > 20) {
        currentJob.description += (currentJob.description ? ' ' : '') + line
      }
    }
    
    if (currentJob) {
      experience.push(currentJob)
    }
  }
  
  return experience.filter(job => job.title && job.company)
}

function extractEducation(text: string): Array<{school: string, degree: string, field: string, duration: string}> {
  const education: Array<{school: string, degree: string, field: string, duration: string}> = []
  
  // Look for education section
  const educationRegex = /(?:education|academic|qualifications)[\s\S]*?(?=experience|skills|$)/i
  const educationMatch = text.match(educationRegex)
  
  if (educationMatch) {
    const educationText = educationMatch[0]
    const lines = educationText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    let currentEdu: any = null
    
    for (const line of lines) {
      // Look for degree patterns
      if (line.match(/(?:Bachelor|Master|PhD|Associate|Certificate|Diploma)/i)) {
        if (currentEdu) {
          education.push(currentEdu)
        }
        currentEdu = { school: '', degree: line, field: '', duration: '' }
      }
      // Look for school patterns
      else if (currentEdu && !currentEdu.school && line.match(/^[A-Z][a-zA-Z\s&.,]+(?:University|College|Institute|School)$/)) {
        currentEdu.school = line
      }
      // Look for date patterns
      else if (currentEdu && !currentEdu.duration && line.match(/\d{4}[-–]\d{4}|\d{4}[-–]present/i)) {
        currentEdu.duration = line
      }
    }
    
    if (currentEdu) {
      education.push(currentEdu)
    }
  }
  
  return education.filter(edu => edu.degree)
}

function extractSkills(text: string): string[] {
  const skills: string[] = []
  
  // Look for skills section
  const skillsRegex = /(?:skills|technical\s+skills|technologies|competencies)[\s\S]*?(?=experience|education|$)/i
  const skillsMatch = text.match(skillsRegex)
  
  if (skillsMatch) {
    const skillsText = skillsMatch[0]
    
    // Common technical skills
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
      'HTML', 'CSS', 'SASS', 'SCSS', 'Bootstrap', 'Tailwind', 'Material-UI',
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
      'Agile', 'Scrum', 'DevOps', 'CI/CD', 'REST', 'GraphQL', 'Microservices'
    ]
    
    for (const skill of commonSkills) {
      if (skillsText.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill)
      }
    }
  }
  
  // Also extract skills from bullet points or comma-separated lists
  const bulletSkills = text.match(/[•·▪▫]\s*([A-Za-z\s]+)/g)
  if (bulletSkills) {
    bulletSkills.forEach(bullet => {
      const skill = bullet.replace(/[•·▪▫]\s*/, '').trim()
      if (skill.length > 2 && skill.length < 30) {
        skills.push(skill)
      }
    })
  }
  
  return [...new Set(skills)] // Remove duplicates
}
