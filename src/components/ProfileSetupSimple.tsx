'use client'

import { useState, useEffect } from 'react'
import { Save, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import ResumeUpload from './ResumeUpload'
import { useUser } from '@/contexts/UserContext'

interface ProfileSetupSimpleProps {
  onComplete: () => void
}

// Standard job application questions
const STANDARD_QUESTIONS = [
  { id: 'availability', label: 'When can you start?', type: 'text', placeholder: 'e.g., Immediately, 2 weeks notice' },
  { id: 'salary_expectation', label: 'What is your OTE expectation?', type: 'text', placeholder: 'e.g., $120,000 - $150,000 OTE' },
  { id: 'authorized_to_work', label: 'Are you authorized to work in this country?', type: 'select', options: ['Yes', 'No', 'Will need sponsorship'] },
  { id: 'relocation', label: 'Are you willing to relocate?', type: 'select', options: ['Yes', 'No', 'Depends on location'] },
  { id: 'remote_work', label: 'Remote work preference?', type: 'select', options: ['Remote only', 'Hybrid', 'On-site', 'Flexible'] },
]

export default function ProfileSetupSimple({ onComplete }: ProfileSetupSimpleProps) {
  const { user, profile, refreshProfile } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load existing data if available
  useEffect(() => {
    if (profile?.resumeUrl) {
      setResumeUploaded(true)
      setResumeUrl(profile.resumeUrl)
    }
  }, [profile])

  const handleResumeUploadSuccess = (data: any) => {
    setResumeUploaded(true)
    setResumeUrl(data.resumeUrl)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    refreshProfile()
  }

  const handleResumeUploadError = (error: string) => {
    setError(error)
    setTimeout(() => setError(null), 5000)
  }

  const handleQuestionChange = (questionId: string, value: string) => {
    setQuestions(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSave = async () => {
    if (!user?.id) {
      setError('User not found. Please refresh the page.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Save questions
      const response = await fetch('/api/profile/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          questions,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save questions')
      }

      await refreshProfile()
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onComplete()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const allQuestionsAnswered = STANDARD_QUESTIONS.every(q => {
    return questions[q.id] && questions[q.id].trim() !== ''
  })
  const hasResumeOrLinkedIn = resumeUploaded || (questions.linkedin && questions.linkedin.trim() !== '')

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
        <p className="text-gray-600 mt-2">Upload your resume and answer standard job application questions</p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-md">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm">Profile saved successfully!</span>
        </div>
      )}

      {/* Step 1: Resume Upload or LinkedIn */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Step 1: Add Resume or LinkedIn Profile</h3>
          {resumeUploaded && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
        </div>

        <div className="space-y-2 mb-6">
          <label className="block text-sm font-medium text-gray-700">
            LinkedIn profile URL (use this instead of a resume)
          </label>
          <input
            type="url"
            value={questions.linkedin || ''}
            onChange={(e) => handleQuestionChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />
        </div>
        
        {resumeUploaded ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-md">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Resume uploaded successfully!</span>
            </div>
            <button
              onClick={() => {
                setResumeUploaded(false)
                setResumeUrl(null)
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Replace Resume
            </button>
          </div>
        ) : (
          user?.id && (
            <ResumeUpload
              userId={user.id}
              onUploadSuccess={handleResumeUploadSuccess}
              onUploadError={handleResumeUploadError}
            />
          )
        )}
      </div>

      {/* Step 2: Job Application Questions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Step 2: Answer Standard Questions</h3>
        </div>

        <div className="space-y-6">
          {STANDARD_QUESTIONS.map((question) => (
            <div key={question.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {question.label}
                {!['portfolio', 'github'].includes(question.id) && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              
              {question.type === 'select' ? (
                <select
                  value={questions[question.id] || ''}
                  onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                >
                  <option value="">Select an option...</option>
                  {question.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={question.type}
                  value={questions[question.id] || ''}
                  onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          disabled={!hasResumeOrLinkedIn || !allQuestionsAnswered || isSaving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save & Continue
            </>
          )}
        </button>
      </div>
    </div>
  )
}



