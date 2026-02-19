'use client'

import { useState, useEffect } from 'react'
import { User, Briefcase, GraduationCap, Award, Save, Download, FileText } from 'lucide-react'
import LinkedInProfile from './LinkedInProfile'
import ResumeUpload from './ResumeUpload'
import { useUser } from '@/contexts/UserContext'

interface ProfileSetupProps {
  onComplete: () => void
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user, profile, isConnected, refreshProfile } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [autofillLoading, setAutofillLoading] = useState(false)
  const [autofillSuccess, setAutofillSuccess] = useState(false)
  const [autofillCompleted, setAutofillCompleted] = useState(false)
  const [autofilledFields, setAutofilledFields] = useState<Set<string>>(new Set())
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState(false)
  const [resumeUploadError, setResumeUploadError] = useState('')
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Input styling utility
  const inputClass = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-500"
  const textareaClass = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-500"
  
  // Helper function to render field with autofill indicator
  const renderFieldWithIndicator = (fieldName: string, children: React.ReactNode) => {
    const isAutofilled = autofilledFields.has(fieldName)
    return (
      <div className="relative">
        {children}
        {isAutofilled && (
          <div className="absolute -top-1 -right-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Auto
            </span>
          </div>
        )}
      </div>
    )
  }
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    postalCode: '',
    city: '',
    summary: '',
    linkedInProfileUrl: '',
    
    // Demographic Information
    age: '',
    race: '',
    ethnicity: '',
    veteranStatus: '',
    politicalOrientation: '',
    socialMediaUse: [] as string[],
    
    // Professional Information
    currentTitle: '',
    currentCompany: '',
    yearsExperience: 0,
    
    // Skills
    skills: [] as string[],
    
    // Experience
    experience: [] as any[],
    
    // Education
    education: [] as any[],
    
    // Preferences
    jobTitles: [] as string[],
    companies: [] as string[],
    locations: [] as string[],
    salaryMin: 0,
    jobTypes: [] as string[],
    remoteWork: false,
    maxApplicationsPerMonth: 10,
    autoApply: false,
    autoConnect: false,
    autoMessage: false,
    connectionMessage: '',
    followUpMessage: ''
  })

  // State for raw input fields to allow typing commas
  const [rawSkillsInput, setRawSkillsInput] = useState('')
  const [rawCompaniesInput, setRawCompaniesInput] = useState('')
  const [rawJobTitlesInput, setRawJobTitlesInput] = useState('')
  const [rawLocationsInput, setRawLocationsInput] = useState('')
  const [rawJobTypesInput, setRawJobTypesInput] = useState('')
  const [rawSocialMediaInput, setRawSocialMediaInput] = useState('')

  // Auto-populate form when profile data changes (e.g., after LinkedIn connection)
  useEffect(() => {
    console.log('ProfileSetup useEffect triggered - profile:', profile, 'user:', user)
    if (profile && user) {
      console.log('Profile data changed, auto-populating form:', profile)
      
      // Map LinkedIn data to form fields and track which fields are being filled
      const autofillData: any = {}
      const filledFields = new Set<string>()

      // Personal Information
      if (profile.firstName) { autofillData.firstName = profile.firstName; filledFields.add('firstName') }
      if (profile.lastName) { autofillData.lastName = profile.lastName; filledFields.add('lastName') }
      if (user?.email) { autofillData.email = user.email; filledFields.add('email') }
      if (profile.phone) { autofillData.phone = profile.phone; filledFields.add('phone') }
      if (profile.country) { autofillData.country = profile.country; filledFields.add('country') }
      if (profile.postalCode) { autofillData.postalCode = profile.postalCode; filledFields.add('postalCode') }
      if (profile.city) { autofillData.city = profile.city; filledFields.add('city') }
      if (profile.summary) { autofillData.summary = profile.summary; filledFields.add('summary') }
      if (profile.linkedInProfileUrl) { autofillData.linkedInProfileUrl = profile.linkedInProfileUrl; filledFields.add('linkedInProfileUrl') }
      
      // Professional Information
      if (profile.currentTitle) { autofillData.currentTitle = profile.currentTitle; filledFields.add('currentTitle') }
      if (profile.currentCompany) { autofillData.currentCompany = profile.currentCompany; filledFields.add('currentCompany') }
      if (profile.yearsExperience) { autofillData.yearsExperience = profile.yearsExperience; filledFields.add('yearsExperience') }
      
      // Skills (parse JSON if it's a string)
      if (profile.skills) { 
        autofillData.skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills
        filledFields.add('skills')
      }
      
      // Experience (parse JSON if it's a string)
      if (profile.experience) { 
        const experienceData = typeof profile.experience === 'string' ? JSON.parse(profile.experience) : profile.experience
        // Ensure each experience item has an ID
        autofillData.experience = experienceData.map((exp: any, index: number) => ({
          ...exp,
          id: exp.id || `exp-${Date.now()}-${index}`
        }))
        filledFields.add('experience')
      }
      
      // Education (parse JSON if it's a string)
      if (profile.education) { 
        const educationData = typeof profile.education === 'string' ? JSON.parse(profile.education) : profile.education
        // Ensure each education item has an ID
        autofillData.education = educationData.map((edu: any, index: number) => ({
          ...edu,
          id: edu.id || `edu-${Date.now()}-${index}`
        }))
        filledFields.add('education')
      }
      
      console.log('Auto-populating form with data:', autofillData)
      console.log('Filled fields:', Array.from(filledFields))

      // Update form data with autofilled values
      setFormData(prev => ({ ...prev, ...autofillData }))
      setAutofilledFields(filledFields)
    }
  }, [profile, user])

  // Load existing profile data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) {
        setIsLoadingData(false)
        return
      }

      try {
        setIsLoadingData(true)
        
        // Load profile data
        const profileResponse = await fetch(`/api/profile?userId=${user.id}`)
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          if (profileData) {
            setFormData(prev => ({
              ...prev,
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              email: user.email || '',
              phone: profileData.phone || '',
              country: profileData.country || '',
              postalCode: profileData.postalCode || '',
              city: profileData.city || '',
              summary: profileData.summary || '',
              currentTitle: profileData.currentTitle || '',
              currentCompany: profileData.currentCompany || '',
              yearsExperience: profileData.yearsExperience || 0,
              skills: profileData.skills ? JSON.parse(profileData.skills) : [],
              experience: profileData.experience ? JSON.parse(profileData.experience) : [],
              education: profileData.education ? JSON.parse(profileData.education) : [],
              age: profileData.age || '',
              race: profileData.race || '',
              ethnicity: profileData.ethnicity || '',
              veteranStatus: profileData.veteranStatus || '',
              politicalOrientation: profileData.politicalOrientation || '',
              socialMediaUse: profileData.socialMediaUse ? JSON.parse(profileData.socialMediaUse) : []
            }))
          }
        }

        // Load job search preferences
        const preferencesResponse = await fetch(`/api/preferences?userId=${user.id}`)
        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json()
          if (preferencesData) {
            setFormData(prev => ({
              ...prev,
              jobTitles: preferencesData.jobTitles ? JSON.parse(preferencesData.jobTitles) : [],
              companies: preferencesData.companies ? JSON.parse(preferencesData.companies) : [],
              locations: preferencesData.locations ? JSON.parse(preferencesData.locations) : [],
              salaryMin: preferencesData.salaryMin || 0,
              jobTypes: preferencesData.jobTypes ? JSON.parse(preferencesData.jobTypes) : [],
              remoteWork: preferencesData.remoteWork || false,
              maxApplicationsPerMonth: preferencesData.maxApplicationsPerMonth || 10,
              autoApply: preferencesData.autoApply || false,
              autoConnect: preferencesData.autoConnect || false,
              autoMessage: preferencesData.autoMessage || false,
              connectionMessage: preferencesData.connectionMessage || '',
              followUpMessage: preferencesData.followUpMessage || ''
            }))
          }
        }
      } catch (error) {
        console.error('Error loading existing data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadExistingData()
  }, [user?.id, user?.email])

  // Initialize raw input states when formData changes
  useEffect(() => {
    setRawSkillsInput(formData.skills.join(', '))
    setRawCompaniesInput(formData.companies.join(', '))
    setRawJobTitlesInput(formData.jobTitles.join(', '))
    setRawLocationsInput(formData.locations.join(', '))
    setRawJobTypesInput(formData.jobTypes.join(', '))
    setRawSocialMediaInput(formData.socialMediaUse.join(', '))
  }, [formData.skills, formData.companies, formData.jobTitles, formData.locations, formData.jobTypes, formData.socialMediaUse])

  // No need to fetch LinkedIn data - it's already in the context


  // Autofill form with LinkedIn data
  const handleAutofill = () => {
    console.log('handleAutofill called - button clicked!')
    console.log('handleAutofill called, profile:', profile)
    console.log('Profile object keys:', profile ? Object.keys(profile) : 'null')
    console.log('Profile currentTitle:', profile?.currentTitle)
    console.log('Profile summary:', profile?.summary)
    console.log('Profile city:', profile?.city)
    console.log('handleAutofill called, user:', user)
    if (!profile) return

    setAutofillLoading(true)

    // Map LinkedIn data to form fields and track which fields are being filled
    const autofillData: any = {}
    const filledFields = new Set<string>()

    // Personal Information
    if (profile.firstName) { autofillData.firstName = profile.firstName; filledFields.add('firstName') }
    if (profile.lastName) { autofillData.lastName = profile.lastName; filledFields.add('lastName') }
    if (user?.email) { autofillData.email = user.email; filledFields.add('email') }
    if (profile.phone) { autofillData.phone = profile.phone; filledFields.add('phone') }
    if (profile.country) { autofillData.country = profile.country; filledFields.add('country') }
    if (profile.postalCode) { autofillData.postalCode = profile.postalCode; filledFields.add('postalCode') }
    if (profile.city) { autofillData.city = profile.city; filledFields.add('city') }
    if (profile.summary) { autofillData.summary = profile.summary; filledFields.add('summary') }
    
    // Professional Information
    if (profile.currentTitle) { autofillData.currentTitle = profile.currentTitle; filledFields.add('currentTitle') }
    if (profile.currentCompany) { autofillData.currentCompany = profile.currentCompany; filledFields.add('currentCompany') }
    if (profile.yearsExperience) { autofillData.yearsExperience = profile.yearsExperience; filledFields.add('yearsExperience') }
    
    // Skills (parse JSON if it's a string)
    if (profile.skills) { 
      autofillData.skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills
      filledFields.add('skills')
    }
    
    // Experience (parse JSON if it's a string)
    if (profile.experience) { 
      const experienceData = typeof profile.experience === 'string' ? JSON.parse(profile.experience) : profile.experience
      // Ensure each experience item has an ID
      autofillData.experience = experienceData.map((exp: any, index: number) => ({
        ...exp,
        id: exp.id || `exp-${Date.now()}-${index}`
      }))
      filledFields.add('experience')
    }
    
    // Education (parse JSON if it's a string)
    if (profile.education) { 
      const educationData = typeof profile.education === 'string' ? JSON.parse(profile.education) : profile.education
      // Ensure each education item has an ID
      autofillData.education = educationData.map((edu: any, index: number) => ({
        ...edu,
        id: edu.id || `edu-${Date.now()}-${index}`
      }))
      filledFields.add('education')
    }
    console.log('Autofill data extracted:', autofillData)
    console.log('Filled fields:', Array.from(filledFields))

    // Update form data with autofilled values
    setFormData(prev => ({ ...prev, ...autofillData }))
    setAutofilledFields(filledFields)
    
    setTimeout(() => {
      setAutofillLoading(false)
      setAutofillSuccess(true)
      setAutofillCompleted(true) // Mark autofill as completed
      // Hide success message after 3 seconds
      setTimeout(() => {
        setAutofillSuccess(false)
      }, 3000)
    }, 1000) // Show loading for 1 second
  }

  const steps = [
    { id: 'resume', title: 'Upload Resume', icon: FileText },
    { id: 'personal', title: 'Personal Information', icon: User },
    { id: 'demographics', title: 'Demographics', icon: User },
    { id: 'professional', title: 'Professional Info', icon: Briefcase },
    { id: 'skills', title: 'Skills & Experience', icon: Award },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'preferences', title: 'Job Preferences', icon: Briefcase }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayInputChange = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        achievements: []
      }]
    }))
  }

  const updateExperience = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: 0,
        description: ''
      }]
    }))
  }

  const updateEducation = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const handleResumeUploadSuccess = (data: any) => {
    console.log('Resume upload successful:', data)
    setResumeUploadSuccess(true)
    setResumeUploadError('')
    
    // Update form data with parsed resume data
    const parsedData = data.parsedData
    const updates: any = {}
    
    if (parsedData.fullName) {
      const nameParts = parsedData.fullName.split(' ')
      updates.firstName = nameParts[0] || ''
      updates.lastName = nameParts.slice(1).join(' ') || ''
    }
    
    if (parsedData.email) updates.email = parsedData.email
    if (parsedData.phone) updates.phone = parsedData.phone
    // For now, put location data in city field - can be enhanced later to parse into country/city/postalCode
    if (parsedData.location) updates.city = parsedData.location
    if (parsedData.summary) updates.summary = parsedData.summary
    if (parsedData.currentTitle) updates.currentTitle = parsedData.currentTitle
    if (parsedData.currentCompany) updates.currentCompany = parsedData.currentCompany
          if (parsedData.skills) updates.skills = parsedData.skills
          if (parsedData.experience) {
            // Ensure each experience item has an ID
            updates.experience = parsedData.experience.map((exp: any, index: number) => ({
              ...exp,
              id: exp.id || `exp-${Date.now()}-${index}`
            }))
          }
          if (parsedData.education) {
            // Ensure each education item has an ID
            updates.education = parsedData.education.map((edu: any, index: number) => ({
              ...edu,
              id: edu.id || `edu-${Date.now()}-${index}`
            }))
          }
    
    setFormData(prev => ({ ...prev, ...updates }))
    
    // Refresh profile data
    refreshProfile()
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setResumeUploadSuccess(false)
    }, 5000)
  }

  const handleResumeUploadError = (error: string) => {
    console.error('Resume upload error:', error)
    setResumeUploadError(error)
    setResumeUploadSuccess(false)
    
    // Hide error message after 5 seconds
    setTimeout(() => {
      setResumeUploadError('')
    }, 5000)
  }

  const handleSubmit = async () => {
    if (!user?.id) {
      console.error('No user ID available')
      return
    }

    try {
      // Save profile data
      const profileData = {
        userId: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        postalCode: formData.postalCode,
        city: formData.city,
        summary: formData.summary,
        currentTitle: formData.currentTitle,
        currentCompany: formData.currentCompany,
        yearsExperience: formData.yearsExperience,
        skills: JSON.stringify(formData.skills),
        experience: JSON.stringify(formData.experience),
        education: JSON.stringify(formData.education),
        age: formData.age,
        race: formData.race,
        ethnicity: formData.ethnicity,
        veteranStatus: formData.veteranStatus,
        politicalOrientation: formData.politicalOrientation,
        socialMediaUse: JSON.stringify(formData.socialMediaUse)
      }

      const profileResponse = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to save profile data')
      }

      // Save job search preferences
      const preferencesData = {
        userId: user.id,
        jobTitles: JSON.stringify(formData.jobTitles),
        companies: JSON.stringify(formData.companies),
        locations: JSON.stringify(formData.locations),
        salaryMin: formData.salaryMin,
        jobTypes: JSON.stringify(formData.jobTypes),
        remoteWork: formData.remoteWork,
        maxApplicationsPerMonth: formData.maxApplicationsPerMonth,
        autoApply: formData.autoApply,
        autoConnect: formData.autoConnect,
        autoMessage: formData.autoMessage,
        connectionMessage: formData.connectionMessage,
        followUpMessage: formData.followUpMessage
      }

      const preferencesResponse = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencesData)
      })

      if (!preferencesResponse.ok) {
        throw new Error('Failed to save preferences data')
      }

      // Refresh the profile data in the context
      await refreshProfile()
      
      console.log('Profile and preferences saved successfully')
      onComplete()
    } catch (error) {
      console.error('Error saving profile:', error)
      // You might want to show an error message to the user here
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Resume Upload
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume</h3>
              <p className="text-sm text-gray-600 mb-6">
                Upload your PDF resume and we'll automatically extract your information to populate your profile.
              </p>
            </div>

            {/* Success Message */}
            {resumeUploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Resume Processed Successfully!</h3>
                    <p className="text-sm text-green-600 mt-1">
                      Your resume has been analyzed and your profile has been populated with the extracted information.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {resumeUploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
                    <p className="text-sm text-red-600 mt-1">{resumeUploadError}</p>
                  </div>
                </div>
              </div>
            )}

            {resumeUploadSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-green-800">Resume Uploaded Successfully</h3>
                      <p className="text-sm text-green-600 mt-1">
                        Your resume has been processed and your profile has been populated with the extracted information.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setResumeUploadSuccess(false)
                      setResumeUploadError('')
                    }}
                    className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Replace Resume
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ResumeUpload
                  userId={user?.id || ''}
                  onUploadSuccess={handleResumeUploadSuccess}
                  onUploadError={handleResumeUploadError}
                />

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Don't have a resume? You can skip this step and fill out your profile manually.
                  </p>
                </div>
              </>
            )}
          </div>
        )

      case 1: // Personal Information
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                {renderFieldWithIndicator('firstName', (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={inputClass}
                    placeholder="Enter your first name"
                  />
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                {renderFieldWithIndicator('lastName', (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={inputClass}
                    placeholder="Enter your last name"
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              {renderFieldWithIndicator('email', (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={inputClass}
                  placeholder="Enter your email address"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={inputClass}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={inputClass}
                  placeholder="Enter your country (e.g., United States)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={inputClass}
                  placeholder="Enter your city (e.g., San Francisco)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className={inputClass}
                  placeholder="Enter your postal code (e.g., 94105)"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
              <textarea
                rows={4}
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                onBlur={(e) => {
                  const value = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    skills: value.split(',').map(item => item.trim()).filter(item => item)
                  }))
                }}
                className={textareaClass}
                placeholder="Brief summary of your professional background and key strengths..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn Public Profile URL</label>
              {renderFieldWithIndicator('linkedInProfileUrl', (
                <input
                  type="url"
                  value={formData.linkedInProfileUrl}
                  onChange={(e) => handleInputChange('linkedInProfileUrl', e.target.value)}
                  className={inputClass}
                  placeholder="https://www.linkedin.com/in/your-profile"
                />
              ))}
            </div>
          </div>
        )

      case 2: // Demographics
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Optional Anonymous Demographic Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      <strong>This section is completely optional</strong> and does not affect your ability to use the app. This information is completely anonymous and will only be used to identify if there are likely biases influencing hiring decisions with potential employers. Your responses will not be shared with employers and are used solely for research and bias detection purposes. You can skip this section entirely if you prefer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Age Range</label>
                <select
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select age range</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55-64">55-64</option>
                  <option value="65+">65+</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Race</label>
                <select
                  value={formData.race}
                  onChange={(e) => handleInputChange('race', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select race</option>
                  <option value="american-indian-alaska-native">American Indian or Alaska Native</option>
                  <option value="asian">Asian</option>
                  <option value="black-african-american">Black or African American</option>
                  <option value="native-hawaiian-pacific-islander">Native Hawaiian or Other Pacific Islander</option>
                  <option value="white">White</option>
                  <option value="two-or-more-races">Two or More Races</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ethnicity</label>
                <select
                  value={formData.ethnicity}
                  onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select ethnicity</option>
                  <option value="hispanic-latino">Hispanic or Latino</option>
                  <option value="not-hispanic-latino">Not Hispanic or Latino</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Veteran Status</label>
                <select
                  value={formData.veteranStatus}
                  onChange={(e) => handleInputChange('veteranStatus', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select veteran status</option>
                  <option value="veteran">Veteran</option>
                  <option value="not-veteran">Not a veteran</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Political Orientation</label>
                <select
                  value={formData.politicalOrientation}
                  onChange={(e) => handleInputChange('politicalOrientation', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select political orientation</option>
                  <option value="very-liberal">Very Liberal</option>
                  <option value="liberal">Liberal</option>
                  <option value="moderate">Moderate</option>
                  <option value="conservative">Conservative</option>
                  <option value="very-conservative">Very Conservative</option>
                  <option value="apolitical">Apolitical</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Social Media Use (comma-separated)</label>
                <input
                  type="text"
                  value={rawSocialMediaInput}
                  onChange={(e) => setRawSocialMediaInput(e.target.value)}
                  onBlur={(e) => {
                    const value = e.target.value
                    const items = value.split(',').map(item => item.trim()).filter(item => item)
                    setFormData(prev => ({ ...prev, socialMediaUse: items }))
                  }}
                  className={inputClass}
                  placeholder="e.g., LinkedIn, Twitter, Facebook, Instagram"
                />
                <p className="mt-1 text-sm text-gray-500">
                  List the social media platforms you actively use
                </p>
              </div>
            </div>
          </div>
        )

      case 3: // Professional Information
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Title</label>
                <input
                  type="text"
                  value={formData.currentTitle}
                  onChange={(e) => handleInputChange('currentTitle', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Company</label>
                <input
                  type="text"
                  value={formData.currentCompany}
                  onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                value={formData.yearsExperience}
                onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                onBlur={(e) => {
                  const value = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    skills: value.split(',').map(item => item.trim()).filter(item => item)
                  }))
                }}
                className={textareaClass}
              />
            </div>
          </div>
        )

      case 4: // Skills & Experience
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
              <input
                type="text"
                value={rawSkillsInput}
                onChange={(e) => setRawSkillsInput(e.target.value)}
                onBlur={(e) => {
                  const value = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    skills: value.split(',').map(item => item.trim()).filter(item => item)
                  }))
                }}
                className={textareaClass}
                placeholder="JavaScript, React, Node.js, Python, etc."
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Work Experience</label>
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Add Experience
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {formData.experience.map((exp, index) => (
                  <div key={exp.id || `exp-${index}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Job Title</label>
                        <input
                          type="text"
                          value={exp.title || ''}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exp.current || false}
                          onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">Currently working here</label>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        rows={3}
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-600 hover:text-red-500 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 5: // Education
        return (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Education</label>
                <button
                  type="button"
                  onClick={addEducation}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Add Education
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={edu.id || `edu-${index}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Institution</label>
                        <input
                          type="text"
                          value={edu.institution || edu.school || ''}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Degree</label>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field || ''}
                          onChange={(e) => updateEducation(index, 'field', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">GPA (optional)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={edu.gpa || ''}
                          onChange={(e) => updateEducation(index, 'gpa', parseFloat(e.target.value) || 0)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-600 hover:text-red-500 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 6: // Job Preferences
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Job Titles (comma-separated)</label>
              <input
                type="text"
                value={rawJobTitlesInput}
                onChange={(e) => setRawJobTitlesInput(e.target.value)}
                onBlur={(e) => {
                  const value = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    jobTitles: value.split(',').map(item => item.trim()).filter(item => item)
                  }))
                }}
                className={textareaClass}
                placeholder="Software Engineer, Frontend Developer, Full Stack Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Companies (comma-separated)</label>
              <input
                type="text"
                value={rawCompaniesInput}
                onChange={(e) => setRawCompaniesInput(e.target.value)}
                onBlur={(e) => {
                  const value = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    companies: value.split(',').map(item => item.trim()).filter(item => item)
                  }))
                }}
                className={textareaClass}
                placeholder="Google, Microsoft, Apple, Amazon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Locations (comma-separated)</label>
              <input
                type="text"
                value={rawLocationsInput}
                onChange={(e) => setRawLocationsInput(e.target.value)}
                onBlur={(e) => {
                  const value = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    locations: value.split(',').map(item => item.trim()).filter(item => item)
                  }))
                }}
                className={textareaClass}
                placeholder="San Francisco, CA, New York, NY, Remote"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Salary</label>
                <input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => handleInputChange('salaryMin', parseInt(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Types (comma-separated)</label>
              <input
                type="text"
                value={rawJobTypesInput}
                onChange={(e) => setRawJobTypesInput(e.target.value)}
                onBlur={(e) => {
                  const value = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    jobTypes: value.split(',').map(item => item.trim()).filter(item => item)
                  }))
                }}
                className={textareaClass}
                placeholder="Full-time, Part-time, Contract, Remote"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.remoteWork}
                onChange={(e) => handleInputChange('remoteWork', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Open to remote work</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Applications Per Month</label>
              <input
                type="number"
                value={formData.maxApplicationsPerMonth}
                onChange={(e) => handleInputChange('maxApplicationsPerMonth', parseInt(e.target.value) || 10)}
                onBlur={(e) => {
                  const value = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    skills: value.split(',').map(item => item.trim()).filter(item => item)
                  }))
                }}
                className={textareaClass}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.autoApply}
                  onChange={(e) => handleInputChange('autoApply', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Enable automatic job applications</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.autoConnect}
                  onChange={(e) => handleInputChange('autoConnect', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Automatically send LinkedIn connection requests</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.autoMessage}
                  onChange={(e) => handleInputChange('autoMessage', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Automatically send LinkedIn messages</label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isLoadingData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Loading your profile data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Complete Your Profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          Set up your profile to start automating your job search
        </p>
      </div>

      {/* LinkedIn Profile Display */}
      <div className="mb-8">
        <LinkedInProfile userId={user?.id || ''} />
      </div>

      {/* Autofill Button */}
      {isConnected && !autofillCompleted && (
        <div className="mb-8">
          {autofillSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Profile Autofilled Successfully!</h3>
                  <p className="text-sm text-green-600 mt-1">
                    Your profile has been populated with data from your LinkedIn account. You can review and edit the information below.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">LinkedIn Data Available</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    Click the button below to automatically fill in your profile with data from your LinkedIn account.
                  </p>
                </div>
                <button
                  onClick={handleAutofill}
                  disabled={autofillLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {autofillLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Autofilling...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Autofill from LinkedIn
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-6 overflow-hidden">
        <nav aria-label="Progress">
          <ol className="flex flex-wrap items-center gap-1 sm:gap-2 lg:gap-4">
            {steps.map((step, stepIdx) => {
              const Icon = step.icon
              return (
                <li key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      currentStep >= stepIdx
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}>
                      <Icon className="w-3 h-3 sm:w-5 sm:h-5" />
                    </div>
                    <div className="ml-1 sm:ml-2 min-w-0">
                      <div className={`text-xs font-medium ${
                        currentStep >= stepIdx ? 'text-indigo-600' : 'text-gray-500'
                      }`}>
                        <span className="hidden md:inline">{step.title}</span>
                        <span className="hidden sm:inline md:hidden">{step.title.split(' ').slice(0, 2).join(' ')}</span>
                        <span className="sm:hidden">{step.title.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className="hidden sm:block ml-2 h-0.5 w-4 bg-gray-300" aria-hidden="true" />
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="mb-8 overflow-hidden">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div className="flex space-x-3">
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Complete Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
