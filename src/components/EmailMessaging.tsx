'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, 
  Send, 
  User, 
  Search, 
  CheckCircle, 
  Clock, 
  Eye, 
  WifiOff, 
  Wifi,
  Plus,
  Trash2,
  RefreshCw,
  XCircle
} from 'lucide-react'

interface EmailAccount {
  id: string
  email: string
  provider: 'gmail' | 'yahoo' | 'outlook'
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  isActive: boolean
}

interface EmailContact {
  id: string
  name: string
  email: string
  lastContacted?: Date
  totalMessages: number
}

interface EmailMessage {
  id: string
  to: string
  from: string
  subject: string
  body: string
  sentAt: Date
  status: 'sent' | 'failed' | 'pending'
  threadId?: string
  messageId?: string
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSeconds < 60) return 'just now'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`
  
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], options) // Today
  }
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate() - 1) {
    return `Yesterday ${date.toLocaleTimeString([], options)}` // Yesterday
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) // Other days
}

export default function EmailMessaging() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [contacts, setContacts] = useState<EmailContact[]>([])
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount | null>(null)
  const [selectedContact, setSelectedContact] = useState<EmailContact | null>(null)
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Sample contacts for demo
  const sampleContacts: EmailContact[] = [
    {
      id: 'contact_1',
      name: 'Mark Butcher',
      email: 'mark.butcher@example.com',
      lastContacted: new Date(Date.now() - 3600 * 1000 * 24 * 2),
      totalMessages: 5
    },
    {
      id: 'contact_2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      lastContacted: new Date(Date.now() - 3600 * 10000 * 24 * 5),
      totalMessages: 12
    },
    {
      id: 'contact_3',
      name: 'John Doe',
      email: 'john.doe@startup.io',
      lastContacted: new Date(Date.now() - 3600 * 1000 * 24 * 7),
      totalMessages: 3
    }
  ]

  // Sample messages for demo
  const sampleMessages: EmailMessage[] = [
    {
      id: 'msg1',
      to: 'mark.butcher@example.com',
      from: 'you@yourdomain.com',
      subject: 'Follow up on our conversation',
      body: 'Hi Mark, I wanted to follow up on our conversation about the software engineering position. I\'m very interested in learning more about the role and your team.',
      sentAt: new Date(Date.now() - 3600 * 1000 * 24 * 2),
      status: 'sent'
    },
    {
      id: 'msg2',
      to: 'mark.butcher@example.com',
      from: 'you@yourdomain.com',
      subject: 'Thank you for the interview',
      body: 'Thank you for taking the time to speak with me today. I\'m excited about the opportunity and look forward to hearing about next steps.',
      sentAt: new Date(Date.now() - 3600 * 1000 * 24 * 1),
      status: 'sent'
    }
  ]

  useEffect(() => {
    loadAccounts()
    loadContacts()
    loadMessages()
    
    // Handle URL parameters for success/error messages
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    const provider = urlParams.get('provider')
    const email = urlParams.get('email')
    
    if (success === 'true' && provider && email) {
      setSuccessMessage(`Successfully connected ${provider} account: ${email}`)
      loadAccounts() // Refresh accounts
    } else if (error) {
      setErrorMessage(decodeURIComponent(error))
    }
  }, [])

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/email/accounts')
      const data = await response.json()
      if (data.accounts) {
        setAccounts(data.accounts)
        setIsConnected(data.accounts.length > 0)
        if (data.accounts.length > 0) {
          setSelectedAccount(data.accounts[0])
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error)
    }
  }

  const loadContacts = async () => {
    if (selectedAccount) {
      try {
        const response = await fetch(`/api/email/contacts?accountId=${selectedAccount.id}`)
        const data = await response.json()
        if (data.contacts) {
          setContacts(data.contacts)
        } else {
          // Use sample contacts for demo
          setContacts(sampleContacts)
        }
      } catch (error) {
        console.error('Error loading contacts:', error)
        setContacts(sampleContacts)
      }
    } else {
      setContacts(sampleContacts)
    }
  }

  const loadMessages = () => {
    if (selectedContact) {
      const contactMessages = sampleMessages.filter(msg => msg.to === selectedContact.email)
      setMessages(contactMessages)
    } else {
      setMessages([])
    }
  }

  useEffect(() => {
    loadContacts()
  }, [selectedAccount])

  useEffect(() => {
    loadMessages()
  }, [selectedContact])

  const connectGmail = async () => {
    try {
      const response = await fetch('/api/email/auth?provider=gmail')
      const data = await response.json()
      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=600')
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error)
      setErrorMessage('Failed to connect Gmail')
    }
  }

  const connectYahoo = async () => {
    try {
      const response = await fetch('/api/email/auth?provider=yahoo')
      const data = await response.json()
      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=600')
      }
    } catch (error) {
      console.error('Error connecting Yahoo:', error)
      setErrorMessage('Failed to connect Yahoo Mail')
    }
  }

  const disconnectAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/email/accounts?accountId=${accountId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        await loadAccounts()
        setSuccessMessage('Account disconnected successfully')
      }
    } catch (error) {
      console.error('Error disconnecting account:', error)
      setErrorMessage('Failed to disconnect account')
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !selectedAccount) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccount.id,
          to: selectedContact.email,
          subject: subject || `Message to ${selectedContact.name}`,
          body: newMessage
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const message: EmailMessage = {
          id: `msg_${Date.now()}`,
          to: selectedContact.email,
          from: selectedAccount.email,
          subject: subject || `Message to ${selectedContact.name}`,
          body: newMessage,
          sentAt: new Date(),
          status: 'sent'
        }

        setMessages(prev => [...prev, message])
        setNewMessage('')
        setSubject('')
        setSuccessMessage('Email sent successfully!')
      } else {
        setErrorMessage(data.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      setErrorMessage('Failed to send email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return '📧'
      case 'yahoo':
        return '📨'
      case 'outlook':
        return '📬'
      default:
        return '📧'
    }
  }

  const getMessageStatusIcon = (status: EmailMessage['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'failed':
        return <XCircle className="w-3 h-3 text-red-500" />
      case 'pending':
        return <Clock className="w-3 h-3 text-yellow-500" />
      default:
        return null
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Messaging</h2>
          <p className="text-gray-600 mb-6">
            Connect your email accounts to send messages to contacts
          </p>
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <button 
                onClick={connectGmail}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <span className="mr-2">📧</span>
                Connect Gmail
              </button>
              <button 
                onClick={connectYahoo}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <span className="mr-2">📨</span>
                Connect Yahoo Mail
              </button>
            </div>
            <p className="text-sm text-gray-500">
              You'll be redirected to authenticate with your email provider
            </p>
          </div>
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
            <Mail className="w-8 h-8 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Email Messaging</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadAccounts}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={connectGmail}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Gmail
            </button>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="mt-4 flex flex-wrap gap-2">
          {accounts.map(account => (
            <div key={account.id} className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <span className="mr-2">{getProviderIcon(account.provider)}</span>
              <span className="text-sm font-medium">{account.email}</span>
              <button
                onClick={() => disconnectAccount(account.id)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
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
          {/* Contacts Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Contacts</h3>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{contact.name}</p>
                    <p className="text-sm text-gray-500 truncate">{contact.email}</p>
                    <p className="text-xs text-gray-400">{contact.totalMessages} messages</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="w-2/3 flex flex-col">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedContact.name}</h3>
                    <p className="text-sm text-gray-500">{selectedContact.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className="flex justify-end"
                    >
                      <div className="max-w-[70%] p-3 rounded-lg shadow-sm bg-blue-500 text-white rounded-br-none">
                        <p>{msg.body}</p>
                        <div className="text-xs mt-1 flex items-center justify-end text-blue-200">
                          {formatTime(msg.sentAt)}
                          <span className="ml-1">{getMessageStatusIcon(msg.status)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 space-y-2">
                  <input
                    type="text"
                    placeholder="Subject (optional)"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="flex items-center">
                    <textarea
                      className="flex-1 resize-none border border-gray-300 rounded-lg p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your message..."
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !newMessage.trim()}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a contact to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
