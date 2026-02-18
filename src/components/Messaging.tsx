'use client'

import { useState, useEffect } from 'react'
import { Send, MessageCircle, Clock, CheckCircle, AlertCircle, User, Building2, Mail, Linkedin, Plus, Trash2, RefreshCw, Search, XCircle } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

interface Message {
  id: string
  recipientName: string
  recipientTitle?: string
  recipientCompany?: string
  recipientEmail?: string
  linkedinProfileUrl?: string
  message: string
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'REPLIED' | 'FAILED'
  messageType: 'CONNECTION_REQUEST' | 'FOLLOW_UP' | 'THANK_YOU' | 'INTEREST_EXPRESSION'
  platform: 'email' | 'linkedin' | 'both'
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  repliedAt?: string
  replyMessage?: string
  createdAt: string
  updatedAt: string
}

interface EmailAccount {
  id: string
  email: string
  provider: 'gmail' | 'yahoo' | 'outlook'
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  isActive: boolean
}

interface Contact {
  id: string
  name: string
  email?: string
  linkedinProfileUrl?: string
  title?: string
  company?: string
  lastContacted?: Date
  totalMessages: number
  platforms: ('email' | 'linkedin')[]
}

export default function Messaging() {
  const { user, profile, isLoading } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [newMessage, setNewMessage] = useState({
    recipientName: '',
    recipientTitle: '',
    recipientCompany: '',
    recipientEmail: '',
    linkedinProfileUrl: '',
    message: '',
    messageType: 'CONNECTION_REQUEST' as 'CONNECTION_REQUEST' | 'FOLLOW_UP' | 'THANK_YOU' | 'INTEREST_EXPRESSION',
    platform: 'email' as 'email' | 'linkedin' | 'both'
  })
  const [showPlatformChangeNotification, setShowPlatformChangeNotification] = useState(false)
  const [originalPlatform, setOriginalPlatform] = useState<'email' | 'linkedin' | 'both'>('email')
  
  // Unified messaging state
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
  const [sampleEmails, setSampleEmails] = useState<any[]>([])
  const [isGeneratingEmails, setIsGeneratingEmails] = useState(false)

  // Load email accounts and LinkedIn status
  useEffect(() => {
    loadEmailAccounts()
    checkLinkedInStatus()
  }, [])

  // Load messages from database
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return
      
      try {
        const response = await fetch(`/api/messages?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.length === 0) {
            // Add demo data if no messages exist
            const demoMessages: Message[] = [
              {
                id: '1',
                recipientName: 'Sarah Johnson',
                recipientTitle: 'Senior Recruiter',
                recipientCompany: 'TechCorp',
                recipientEmail: 'sarah.johnson@techcorp.com',
                linkedinProfileUrl: 'https://linkedin.com/in/sarah-johnson-tech',
                message: 'Hi Sarah, I noticed you work at TechCorp and I\'m very interested in the Software Engineer position you posted. I have 5 years of experience in React and Node.js. Would love to connect!',
                status: 'REPLIED',
                messageType: 'CONNECTION_REQUEST',
                platform: 'linkedin',
                sentAt: '2024-01-15T10:30:00Z',
                repliedAt: '2024-01-15T14:20:00Z',
                replyMessage: 'Hi! Thanks for reaching out. I\'d love to learn more about your experience. Can you send me your resume?',
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-15T14:20:00Z'
              },
              {
                id: '2',
                recipientName: 'Mike Chen',
                recipientTitle: 'Engineering Manager',
                recipientCompany: 'StartupXYZ',
                recipientEmail: 'mike.chen@startupxyz.com',
                linkedinProfileUrl: 'https://linkedin.com/in/mike-chen-dev',
                message: 'Thank you for the interview last week. I\'m very excited about the opportunity and wanted to follow up on the next steps.',
                status: 'DELIVERED',
                messageType: 'FOLLOW_UP',
                platform: 'email',
                sentAt: '2024-01-14T14:20:00Z',
                createdAt: '2024-01-14T14:20:00Z',
                updatedAt: '2024-01-14T14:20:00Z'
              },
              {
                id: '3',
                recipientName: 'Jennifer Davis',
                recipientTitle: 'Talent Acquisition Specialist',
                recipientCompany: 'BigTech Corp',
                recipientEmail: 'jennifer.davis@bigtech.com',
                linkedinProfileUrl: 'https://linkedin.com/in/jennifer-davis-talent',
                message: 'I\'m very interested in the Senior Developer position you posted. I have 5+ years of experience with React and Node.js.',
                status: 'PENDING',
                messageType: 'INTEREST_EXPRESSION',
                platform: 'both',
                createdAt: '2024-01-16T09:15:00Z',
                updatedAt: '2024-01-16T09:15:00Z'
              }
            ]
            setMessages(demoMessages)
          } else {
            setMessages(data)
          }
        } else {
          // Add demo data if no messages exist
          const demoMessages: Message[] = [
            {
              id: '1',
              recipientName: 'Sarah Johnson',
              recipientTitle: 'Senior Recruiter',
              recipientCompany: 'TechCorp',
              recipientEmail: 'sarah.johnson@techcorp.com',
              linkedinProfileUrl: 'https://linkedin.com/in/sarah-johnson-tech',
              message: 'Hi Sarah, I noticed you work at TechCorp and I\'m very interested in the Software Engineer position you posted. I have 5 years of experience in React and Node.js. Would love to connect!',
              status: 'REPLIED',
              messageType: 'CONNECTION_REQUEST',
              platform: 'linkedin',
              sentAt: '2024-01-15T10:30:00Z',
              repliedAt: '2024-01-15T14:20:00Z',
              replyMessage: 'Hi! Thanks for reaching out. I\'d love to learn more about your experience. Can you send me your resume?',
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T14:20:00Z'
            },
            {
              id: '2',
              recipientName: 'Mike Chen',
              recipientTitle: 'Engineering Manager',
              recipientCompany: 'StartupXYZ',
              recipientEmail: 'mike.chen@startupxyz.com',
              linkedinProfileUrl: 'https://linkedin.com/in/mike-chen-dev',
              message: 'Thank you for the interview last week. I\'m very excited about the opportunity and wanted to follow up on the next steps.',
              status: 'DELIVERED',
              messageType: 'FOLLOW_UP',
              platform: 'email',
              sentAt: '2024-01-14T14:20:00Z',
              createdAt: '2024-01-14T14:20:00Z',
              updatedAt: '2024-01-14T14:20:00Z'
            },
            {
              id: '3',
              recipientName: 'Lisa Rodriguez',
              recipientTitle: 'Talent Acquisition Specialist',
              recipientCompany: 'BigTech Inc',
              recipientEmail: 'lisa.rodriguez@bigtech.com',
              linkedinProfileUrl: 'https://linkedin.com/in/lisa-rodriguez-talent',
              message: 'Hi Lisa, I applied for the Product Manager role and would love to discuss my qualifications further. I have extensive experience in agile methodologies and product strategy.',
              status: 'READ',
              messageType: 'INTEREST_EXPRESSION',
              platform: 'both',
              sentAt: '2024-01-13T09:15:00Z',
              readAt: '2024-01-13T16:45:00Z',
              createdAt: '2024-01-13T09:15:00Z',
              updatedAt: '2024-01-13T16:45:00Z'
            }
          ]
          setMessages(demoMessages)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        // Add demo data as fallback
        const demoMessages: Message[] = [
          {
            id: '1',
            recipientName: 'Sarah Johnson',
            recipientTitle: 'Senior Recruiter',
            recipientCompany: 'TechCorp',
            recipientEmail: 'sarah.johnson@techcorp.com',
            linkedinProfileUrl: 'https://linkedin.com/in/sarah-johnson-tech',
            message: 'Hi Sarah, I noticed you work at TechCorp and I\'m very interested in the Software Engineer position you posted. I have 5 years of experience in React and Node.js. Would love to connect!',
            status: 'REPLIED',
            messageType: 'CONNECTION_REQUEST',
            platform: 'linkedin',
            sentAt: '2024-01-15T10:30:00Z',
            repliedAt: '2024-01-15T14:20:00Z',
            replyMessage: 'Hi! Thanks for reaching out. I\'d love to learn more about your experience. Can you send me your resume?',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T14:20:00Z'
          },
          {
            id: '2',
            recipientName: 'Mike Chen',
            recipientTitle: 'Engineering Manager',
            recipientCompany: 'StartupXYZ',
            recipientEmail: 'mike.chen@startupxyz.com',
            linkedinProfileUrl: 'https://linkedin.com/in/mike-chen-dev',
            message: 'Thank you for the interview last week. I\'m very excited about the opportunity and wanted to follow up on the next steps.',
            status: 'DELIVERED',
            messageType: 'FOLLOW_UP',
            platform: 'email',
            sentAt: '2024-01-14T14:20:00Z',
            createdAt: '2024-01-14T14:20:00Z',
            updatedAt: '2024-01-14T14:20:00Z'
          },
          {
            id: '3',
            recipientName: 'Lisa Rodriguez',
            recipientTitle: 'Talent Acquisition Specialist',
            recipientCompany: 'BigTech Inc',
            recipientEmail: 'lisa.rodriguez@bigtech.com',
            linkedinProfileUrl: 'https://linkedin.com/in/lisa-rodriguez-talent',
            message: 'Hi Lisa, I applied for the Product Manager role and would love to discuss my qualifications further. I have extensive experience in agile methodologies and product strategy.',
            status: 'READ',
            messageType: 'INTEREST_EXPRESSION',
            platform: 'both',
            sentAt: '2024-01-13T09:15:00Z',
            readAt: '2024-01-13T16:45:00Z',
            createdAt: '2024-01-13T09:15:00Z',
            updatedAt: '2024-01-13T16:45:00Z'
          }
        ]
        setMessages(demoMessages)
      }
    }

    fetchMessages()
  }, [user?.id])

  const loadEmailAccounts = async () => {
    setIsLoadingAccounts(true)
    try {
      const response = await fetch('/api/email/accounts')
      const data = await response.json()
      if (data.accounts) {
        setEmailAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Error loading email accounts:', error)
    } finally {
      setIsLoadingAccounts(false)
    }
  }

  const checkLinkedInStatus = async () => {
    try {
      const response = await fetch('/api/linkedin/automation?action=status')
      const data = await response.json()
      setIsLinkedInConnected(data.isLoggedIn || false)
    } catch (error) {
      console.error('Error checking LinkedIn status:', error)
      setIsLinkedInConnected(false)
    }
  }

  const generateSampleEmails = async () => {
    if (!user?.id) return
    
    setIsGeneratingEmails(true)
    try {
      const response = await fetch(`/api/email/generate?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setSampleEmails(data.sampleEmails || [])
      } else {
        setErrorMessage('Failed to generate sample emails')
      }
    } catch (error) {
      console.error('Error generating sample emails:', error)
      setErrorMessage('Failed to generate sample emails')
    } finally {
      setIsGeneratingEmails(false)
    }
  }

  const connectGmail = async () => {
    try {
      const response = await fetch('/api/email/auth?provider=gmail')
      const data = await response.json()
      if (data.authUrl) {
        // Open OAuth popup
        const popup = window.open(
          data.authUrl,
          'gmail-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )
        
        // Check if popup was blocked
        if (!popup) {
          setErrorMessage('Popup blocked. Please allow popups and try again.')
          return
        }
        
        // Monitor popup and handle success
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            // Check for success in URL parameters
            const urlParams = new URLSearchParams(window.location.search)
            const success = urlParams.get('success')
            const provider = urlParams.get('provider')
            const email = urlParams.get('email')
            
            if (success === 'true' && provider === 'gmail' && email) {
              setSuccessMessage(`Successfully connected Gmail account: ${email}`)
              // Clear URL parameters
              window.history.replaceState({}, document.title, window.location.pathname)
            }
            loadEmailAccounts() // Refresh accounts
          }
        }, 1000)
        
        // Also listen for messages from the popup
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return
          
          if (event.data.type === 'GMAIL_AUTH_SUCCESS') {
            setSuccessMessage(`Successfully connected Gmail account: ${event.data.email}`)
            loadEmailAccounts()
            popup.close()
            window.removeEventListener('message', handleMessage)
          } else if (event.data.type === 'GMAIL_AUTH_ERROR') {
            setErrorMessage(event.data.error || 'Gmail authentication failed')
            popup.close()
            window.removeEventListener('message', handleMessage)
          }
        }
        
        window.addEventListener('message', handleMessage)
        
        // Cleanup listener after 5 minutes
        setTimeout(() => {
          window.removeEventListener('message', handleMessage)
        }, 300000)
      } else {
        setErrorMessage('Failed to get Gmail auth URL')
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error)
      setErrorMessage('Failed to connect Gmail')
    }
  }

  const connectLinkedIn = async () => {
    // This would open the LinkedIn automation page
    window.location.href = '/?section=linkedin-automation'
  }

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'SENT':
        return <Send className="w-4 h-4 text-blue-500" />
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'READ':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REPLIED':
        return <MessageCircle className="w-4 h-4 text-purple-500" />
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: Message['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Pending'
      case 'SENT':
        return 'Sent'
      case 'DELIVERED':
        return 'Delivered'
      case 'READ':
        return 'Read'
      case 'REPLIED':
        return 'Replied'
      case 'FAILED':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  const getTypeColor = (type: Message['messageType']) => {
    switch (type) {
      case 'CONNECTION_REQUEST':
        return 'bg-blue-100 text-blue-800'
      case 'FOLLOW_UP':
        return 'bg-green-100 text-green-800'
      case 'THANK_YOU':
        return 'bg-yellow-100 text-yellow-800'
      case 'INTEREST_EXPRESSION':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.recipientName || !newMessage.message || !user?.id) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...newMessage
        })
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [message, ...prev])
        setNewMessage({
          recipientName: '',
          recipientTitle: '',
          recipientCompany: '',
          recipientEmail: '',
          linkedinProfileUrl: '',
          message: '',
          messageType: 'CONNECTION_REQUEST',
          platform: 'email'
        })
        setIsComposing(false)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleReplyClick = () => {
    if (selectedMessage) {
      const replyPlatform = selectedMessage.platform
      setNewMessage({
        recipientName: selectedMessage.recipientName,
        recipientTitle: selectedMessage.recipientTitle || '',
        recipientCompany: selectedMessage.recipientCompany || '',
        recipientEmail: selectedMessage.recipientEmail || '',
        linkedinProfileUrl: selectedMessage.linkedinProfileUrl || '',
        message: '',
        messageType: 'FOLLOW_UP',
        platform: replyPlatform
      })
      setOriginalPlatform(replyPlatform)
      setShowPlatformChangeNotification(false)
    }
    setIsComposing(true)
  }

  const handlePlatformChange = (newPlatform: 'email' | 'linkedin' | 'both') => {
    if (originalPlatform && newPlatform !== originalPlatform) {
      setShowPlatformChangeNotification(true)
    }
    setNewMessage(prev => ({ ...prev, platform: newPlatform }))
  }

  const handleSaveDraft = async () => {
    if (!newMessage.recipientName || !newMessage.message || !user?.id) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...newMessage,
          status: 'PENDING'
        })
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [message, ...prev])
        setNewMessage({
          recipientName: '',
          recipientTitle: '',
          recipientCompany: '',
          recipientEmail: '',
          linkedinProfileUrl: '',
          message: '',
          messageType: 'CONNECTION_REQUEST',
          platform: 'email'
        })
        setIsComposing(false)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="w-8 h-8 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Unified Messaging</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadEmailAccounts}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Email:</span>
            {emailAccounts.length > 0 ? (
              <span className="text-sm text-green-600 font-medium">
                {emailAccounts.length} account(s) connected
              </span>
            ) : (
              <button
                onClick={connectGmail}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Connect Gmail
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Linkedin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">LinkedIn:</span>
            {isLinkedInConnected ? (
              <span className="text-sm text-green-600 font-medium">Connected</span>
            ) : (
              <button
                onClick={connectLinkedIn}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Connect LinkedIn
              </button>
            )}
          </div>
        </div>

        {/* Connected Accounts */}
        {emailAccounts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {emailAccounts.map(account => (
              <div key={account.id} className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">{account.email}</span>
                <CheckCircle className="w-3 h-3 ml-2 text-green-500" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Emails Section */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Personalized Email Samples</h3>
          <button
            onClick={generateSampleEmails}
            disabled={isGeneratingEmails}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isGeneratingEmails ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Sample Emails
              </>
            )}
          </button>
        </div>
        
        {sampleEmails.length > 0 ? (
          <div className="space-y-4">
            {sampleEmails.map((email, index) => (
              <div key={email.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{email.recipient.name}</h4>
                    <p className="text-sm text-gray-600">{email.recipient.title} at {email.recipient.company}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    For: {email.job.title} at {email.job.company}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Subject:</div>
                  <div className="text-sm text-gray-900 mb-3">{email.subject}</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Email Body:</div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {email.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Click "Generate Sample Emails" to create personalized emails for your connections</p>
          </div>
        )}
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex h-[600px]">
          {/* Messages List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Messages</h3>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet. Start by composing your first message.</p>
                </div>
              ) : (
                messages
                  .filter(message => 
                    message.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    message.message.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {message.recipientName}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(message.messageType)}`}>
                              {message.messageType.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {message.recipientTitle} at {message.recipientCompany}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {getStatusIcon(message.status)}
                          <span className="text-xs text-gray-500">
                            {getStatusText(message.status)}
                          </span>
                        </div>
                      </div>
                      {message.sentAt && (
                        <div className="mt-2 text-xs text-gray-400">
                          Sent: {new Date(message.sentAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Message Details / Compose */}
          <div className="w-2/3 flex flex-col">
            {isComposing ? (
              <div className="flex-1 p-4 space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Replying to:</div>
                  <div className="text-sm text-gray-900">{newMessage.recipientName}</div>
                  <div className="text-xs text-gray-600">{newMessage.recipientTitle} at {newMessage.recipientCompany}</div>
                </div>
                {newMessage.platform === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newMessage.recipientEmail}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      placeholder="recipient@company.com"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={newMessage.linkedinProfileUrl}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, linkedinProfileUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={newMessage.platform}
                    onChange={(e) => handlePlatformChange(e.target.value as Message['platform'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="email">Email</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={newMessage.message}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Write your message here..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSendMessage}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Save Draft
                  </button>
                </div>
                <button
                  onClick={() => setIsComposing(false)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : selectedMessage ? (
              <div className="flex-1 p-4">
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedMessage.recipientName}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedMessage.recipientTitle} at {selectedMessage.recipientCompany}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        {selectedMessage.recipientEmail && (
                          <span className="text-xs text-gray-500">📧 {selectedMessage.recipientEmail}</span>
                        )}
                        {selectedMessage.linkedinProfileUrl && (
                          <a 
                            href={selectedMessage.linkedinProfileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            🔗 LinkedIn Profile
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-medium text-gray-500">Your message:</span>
                      <span className="text-xs text-gray-400">
                        {selectedMessage.sentAt && new Date(selectedMessage.sentAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                  
                  {selectedMessage.replyMessage && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-blue-600">Reply from {selectedMessage.recipientName}:</span>
                        <span className="text-xs text-blue-400">
                          {selectedMessage.repliedAt && new Date(selectedMessage.repliedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">
                        {selectedMessage.replyMessage}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleReplyClick}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Reply
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a message to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
