'use client'

import { useState } from 'react'
import { Search, Briefcase, Users, Loader2, CheckCircle, AlertCircle, Mail, ThumbsUp, ThumbsDown, RefreshCw, Send } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  url?: string
}

interface Contact {
  id: string
  name: string
  title?: string
  company?: string
  email?: string
  linkedInUrl?: string
  role: string
  approved: boolean
}

interface Message {
  contactId: string
  contactName: string
  subject: string
  body: string
  messageId?: string
  iteration?: number
  feedback?: string
}

export default function JobSearchSimple() {
  const { user, profile } = useUser()
  const [jobDescription, setJobDescription] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [isFindingContacts, setIsFindingContacts] = useState(false)
  const [approvedContacts, setApprovedContacts] = useState<Set<string>>(new Set())
  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageFeedback, setMessageFeedback] = useState<Record<string, string>>({})
  const [satisfiedMessages, setSatisfiedMessages] = useState<Set<string>>(new Set())
  const [isRevising, setIsRevising] = useState(false)
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'search' | 'contacts' | 'messages' | 'final'>('search')

  const handleSearchJobs = async () => {
    if (!jobDescription.trim()) {
      setError('Please describe the type of job you are looking for')
      return
    }

    if (!user?.id) {
      setError('User not found. Please refresh the page.')
      return
    }

    setIsSearching(true)
    setError(null)
    setJobs([])
    setContacts([])
    setSelectedJob(null)

    try {
      const response = await fetch('/api/jobs/search-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to search for jobs')
      }

      const data = await response.json()
      setJobs(data.jobs || [])
      
      if (data.jobs && data.jobs.length > 0) {
        setCurrentStep('contacts')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search for jobs')
    } finally {
      setIsSearching(false)
    }
  }

  const handleFindContacts = async (jobId: string) => {
    if (!user?.id) {
      setError('User not found. Please refresh the page.')
      return
    }

    setSelectedJob(jobId)
    setIsFindingContacts(true)
    setError(null)

    try {
      const job = jobs.find(j => j.id === jobId)
      if (!job) {
        throw new Error('Job not found')
      }

      const response = await fetch('/api/contacts/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          job: {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to find contacts')
      }

      const data = await response.json()
      setContacts(data.contacts || [])
      setCurrentStep('contacts')
    } catch (err: any) {
      setError(err.message || 'Failed to find contacts')
    } finally {
      setIsFindingContacts(false)
    }
  }

  const handleToggleContact = (contactId: string) => {
    setApprovedContacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(contactId)) {
        newSet.delete(contactId)
      } else {
        newSet.add(contactId)
      }
      return newSet
    })
  }

  const handleGenerateMessages = async (feedback?: Record<string, string>) => {
    if (approvedContacts.size === 0) {
      setError('Please approve at least one contact')
      return
    }

    if (!user?.id || !selectedJob) {
      setError('Missing required information')
      return
    }

    if (feedback && Object.keys(feedback).length > 0) {
      setIsRevising(true)
    } else {
      setIsGeneratingMessages(true)
    }
    setError(null)

    try {
      const job = jobs.find(j => j.id === selectedJob)
      if (!job) {
        throw new Error('Job not found')
      }

      const selectedContacts = contacts.filter(c => approvedContacts.has(c.id))

      const response = await fetch('/api/messages/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          job: {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
          },
          contacts: selectedContacts,
          previousMessages: feedback ? messages.map(m => ({
            contactId: m.contactId,
            subject: m.subject,
            body: m.body,
            messageId: m.messageId,
            iteration: m.iteration || 1,
          })) : undefined,
          feedback: feedback,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate messages')
      }

      const data = await response.json()
      const newMessages: Message[] = data.messages.map((msg: any) => ({
        ...msg,
        contactName: selectedContacts.find(c => c.id === msg.contactId)?.name || 'Unknown',
        iteration: feedback ? (messages.find(m => m.contactId === msg.contactId)?.iteration || 1) + 1 : 1,
      }))
      
      setMessages(newMessages)
      setCurrentStep('messages')
      // Clear feedback after revision
      if (feedback) {
        setMessageFeedback({})
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate messages')
    } finally {
      setIsGeneratingMessages(false)
      setIsRevising(false)
    }
  }

  const handleFeedbackChange = (contactId: string, feedback: string) => {
    setMessageFeedback(prev => ({
      ...prev,
      [contactId]: feedback
    }))
  }

  const handleMessageSatisfaction = (contactId: string, satisfied: boolean) => {
    if (satisfied) {
      setSatisfiedMessages(prev => new Set(prev).add(contactId))
      // Clear feedback for satisfied messages
      setMessageFeedback(prev => {
        const newFeedback = { ...prev }
        delete newFeedback[contactId]
        return newFeedback
      })
    } else {
      setSatisfiedMessages(prev => {
        const newSet = new Set(prev)
        newSet.delete(contactId)
        return newSet
      })
    }
  }

  const handleReviseMessages = () => {
    if (Object.keys(messageFeedback).length === 0) {
      setError('Please provide feedback on at least one message')
      return
    }
    handleGenerateMessages(messageFeedback)
  }

  const handleSendEmails = async () => {
    if (satisfiedMessages.size !== approvedContacts.size) {
      setError('Please confirm you are satisfied with all messages before sending')
      return
    }

    if (!user?.id) {
      setError('User not found. Please refresh the page.')
      return
    }

    setIsSendingEmails(true)
    setError(null)

    try {
      const contactsToSend = contacts.filter(c => approvedContacts.has(c.id) && satisfiedMessages.has(c.id))
      const messagesToSend = messages.filter(m => satisfiedMessages.has(m.contactId))

      // Check if Gmail is connected first
      const checkConnection = await fetch(`/api/email/google?userId=${user.id}&action=check`)
      const connectionStatus = await checkConnection.json()

      if (!connectionStatus.connected) {
        setError('Please connect your Gmail account first in the Profile section')
        setIsSendingEmails(false)
        return
      }

      // Send emails via Gmail API
      const sendPromises = contactsToSend.map(async (contact) => {
        const message = messagesToSend.find(m => m.contactId === contact.id)
        if (!message || !contact.email) {
          console.warn(`Skipping contact ${contact.id}: missing email or message`)
          return null
        }

        try {
          const response = await fetch('/api/email/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              to: contact.email,
              subject: message.subject,
              body: message.body,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to send email')
          }

          const result = await response.json()
          
          // Update message status in database
          if (message.messageId) {
            await fetch('/api/messages/update-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messageId: message.messageId,
                status: 'SENT',
                sentAt: new Date().toISOString(),
              }),
            }).catch(err => console.error('Failed to update message status:', err))
          }

          return { contactId: contact.id, success: true, messageId: result.messageId }
        } catch (err: any) {
          console.error(`Error sending email to ${contact.email}:`, err)
          return { contactId: contact.id, success: false, error: err.message }
        }
      })

      const results = await Promise.all(sendPromises)
      const failed = results.filter(r => r && !r.success)
      
      if (failed.length > 0) {
        setError(`${failed.length} email(s) failed to send. Check console for details.`)
      } else {
        setCurrentStep('final')
      }

      setIsSendingEmails(false)
    } catch (err: any) {
      setError(err.message || 'Failed to send emails')
      setIsSendingEmails(false)
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Connections over Applications
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
          Let us help you connect with the right people.
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Step 1: Job Search */}
      {currentStep === 'search' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What kind of job are you looking for?</h2>
          <p className="text-gray-600 mb-6">
            Describe the type of position you want, and we'll find similar open roles.
          </p>

          <div className="space-y-4">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g., Senior Software Engineer at a tech startup in San Francisco, remote-friendly, with focus on React and Node.js..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
            />

            <button
              onClick={handleSearchJobs}
              disabled={isSearching || !jobDescription.trim()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Find Similar Jobs
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Jobs Found */}
      {jobs.length > 0 && currentStep === 'contacts' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Briefcase className="h-6 w-6 mr-2" />
              Found {jobs.length} Similar Jobs
            </h2>
          </div>

          <div className="space-y-4 mb-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedJob === job.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !isFindingContacts && handleFindContacts(job.id)}
              >
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-gray-600">{job.company} • {job.location}</p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{job.description}</p>
                {selectedJob === job.id && isFindingContacts && (
                  <div className="mt-2 flex items-center text-indigo-600">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="text-sm">Finding contacts...</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {contacts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Potential Contacts ({contacts.length})
              </h3>

              <div className="space-y-3 mb-6">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-start space-x-3 border rounded-lg p-4">
                    <input
                      type="checkbox"
                      checked={approvedContacts.has(contact.id)}
                      onChange={() => handleToggleContact(contact.id)}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{contact.name}</h4>
                      <p className="text-sm text-gray-600">{contact.title} • {contact.company}</p>
                      <p className="text-xs text-gray-500 mt-1">Role: {contact.role}</p>
                      {contact.email && (
                        <p className="text-xs text-gray-500">Email: {contact.email}</p>
                      )}
                      {contact.linkedInUrl && (
                        <a
                          href={contact.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGenerateMessages}
                disabled={approvedContacts.size === 0 || isGeneratingMessages}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingMessages ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Messages...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Generate Messages for {approvedContacts.size} Contact{approvedContacts.size !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Generated Messages with Feedback */}
      {messages.length > 0 && currentStep === 'messages' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Generated Messages</h2>
            <div className="text-sm text-gray-600">
              {satisfiedMessages.size} of {approvedContacts.size} satisfied
            </div>
          </div>

          <div className="space-y-6 mb-6">
            {messages.map((message, index) => {
              const contact = contacts.find(c => c.id === message.contactId)
              const isSatisfied = satisfiedMessages.has(message.contactId)
              const hasFeedback = !!messageFeedback[message.contactId]
              
              return (
                <div 
                  key={`${message.contactId}-${message.iteration || 1}`} 
                  className={`border rounded-lg p-6 ${isSatisfied ? 'bg-green-50 border-green-200' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{contact?.name}</h3>
                      <p className="text-sm text-gray-600">{contact?.title} • {contact?.company}</p>
                      {message.iteration && message.iteration > 1 && (
                        <p className="text-xs text-gray-500 mt-1">Revision #{message.iteration - 1}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {isSatisfied && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          <span className="text-sm font-medium">Satisfied</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                      <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900">
                        {message.subject}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-md text-gray-900 whitespace-pre-wrap">
                        {message.body}
                      </div>
                    </div>
                  </div>

                  {!isSatisfied && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Provide feedback to improve this message (optional):
                        </label>
                        <textarea
                          value={messageFeedback[message.contactId] || ''}
                          onChange={(e) => handleFeedbackChange(message.contactId, e.target.value)}
                          placeholder="e.g., Make it more formal, emphasize my leadership experience, mention my relocation flexibility..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleMessageSatisfaction(message.contactId, true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          I'm Satisfied
                        </button>
                      </div>
                    </div>
                  )}

                  {isSatisfied && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleMessageSatisfaction(message.contactId, false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Revise Again
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={handleReviseMessages}
              disabled={Object.keys(messageFeedback).length === 0 || isRevising}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRevising ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Revising Messages...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Revise Messages with Feedback
                </>
              )}
            </button>

            <button
              onClick={handleSendEmails}
              disabled={satisfiedMessages.size !== approvedContacts.size || isSendingEmails}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingEmails ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Opening Email Client...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send All Messages
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Final Step: Email Sent */}
      {currentStep === 'final' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Emails Sent Successfully!</h2>
            <p className="text-gray-600 mb-6">
              All {satisfiedMessages.size} messages have been sent via Gmail.
              Your recipients should receive them shortly.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Check your Gmail "Sent" folder to confirm</p>
              <p>• All messages were sent from your connected Gmail account</p>
              <p>• You can view message status in the Messages section</p>
            </div>
            <button
              onClick={() => {
                setCurrentStep('search')
                setMessages([])
                setMessageFeedback({})
                setSatisfiedMessages(new Set())
                setApprovedContacts(new Set())
                setSelectedJob(null)
                setContacts([])
              }}
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start New Search
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

