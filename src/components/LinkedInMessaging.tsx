'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Search,
  Users,
  Mail
} from 'lucide-react'

interface LinkedInContact {
  id: string
  name: string
  headline: string
  company: string
  location: string
  profileUrl: string
  avatar?: string
}

interface Message {
  id: string
  contactId: string
  contactName: string
  message: string
  sentAt: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  type: 'outgoing' | 'incoming'
}

export default function LinkedInMessaging() {
  const [contacts, setContacts] = useState<LinkedInContact[]>([])
  const [selectedContact, setSelectedContact] = useState<LinkedInContact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [linkedinStatus, setLinkedinStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  // Sample contacts including Mark Butcher
  const sampleContacts: LinkedInContact[] = [
    {
      id: 'mark_butcher',
      name: 'Mark Butcher',
      headline: 'Software Engineer | Full Stack Developer',
      company: 'Target Company',
      location: 'United States',
      profileUrl: 'https://www.linkedin.com/in/mwbutcher/',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 'sarah_johnson',
      name: 'Sarah Johnson',
      headline: 'Senior Product Manager',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      profileUrl: 'https://www.linkedin.com/in/sarah-johnson/',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 'mike_chen',
      name: 'Mike Chen',
      headline: 'Engineering Director',
      company: 'StartupXYZ',
      location: 'New York, NY',
      profileUrl: 'https://www.linkedin.com/in/mike-chen/',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 'emily_davis',
      name: 'Emily Davis',
      headline: 'UX Designer',
      company: 'DesignStudio',
      location: 'Austin, TX',
      profileUrl: 'https://www.linkedin.com/in/emily-davis/',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ]

  // Sample messages for Mark Butcher
  const sampleMessages: Message[] = [
    {
      id: '1',
      contactId: 'mark_butcher',
      contactName: 'Mark Butcher',
      message: 'Hi Mark! I came across your profile and was impressed by your work in software engineering. I\'d love to connect and learn more about your experience.',
      sentAt: '2025-01-16T10:30:00Z',
      status: 'read',
      type: 'outgoing'
    },
    {
      id: '2',
      contactId: 'mark_butcher',
      contactName: 'Mark Butcher',
      message: 'Thanks for reaching out! I\'d be happy to connect. What specific aspects of software engineering are you most interested in?',
      sentAt: '2025-01-16T11:15:00Z',
      status: 'read',
      type: 'incoming'
    },
    {
      id: '3',
      contactId: 'mark_butcher',
      contactName: 'Mark Butcher',
      message: 'I\'m particularly interested in full-stack development and would love to hear about your experience with modern frameworks like React and Node.js.',
      sentAt: '2025-01-16T11:45:00Z',
      status: 'delivered',
      type: 'outgoing'
    }
  ]

  useEffect(() => {
    setContacts(sampleContacts)
    checkLinkedInStatus()
  }, [])

  const checkLinkedInStatus = async () => {
    try {
      const response = await fetch('/api/linkedin/automation?action=status')
      const data = await response.json()
      setLinkedinStatus(data.isLoggedIn ? 'connected' : 'disconnected')
      setIsConnected(data.isLoggedIn)
    } catch (error) {
      console.error('Error checking LinkedIn status:', error)
      setLinkedinStatus('disconnected')
      setIsConnected(false)
    }
  }

  useEffect(() => {
    if (selectedContact) {
      // Load messages for selected contact
      const contactMessages = sampleMessages.filter(msg => msg.contactId === selectedContact.id)
      setMessages(contactMessages)
    }
  }, [selectedContact])

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.headline.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return

    const message: Message = {
      id: Date.now().toString(),
      contactId: selectedContact.id,
      contactName: selectedContact.name,
      message: newMessage,
      sentAt: new Date().toISOString(),
      status: 'sent',
      type: 'outgoing'
    }

    setIsLoading(true)
    
    try {
      // Send real message via LinkedIn automation
      const response = await fetch('/api/linkedin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          message: newMessage,
          connections: [selectedContact]
        })
      })

      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        if (result.status === 'sent') {
          // Update message status based on real result
          setMessages(prev => [...prev, { ...message, status: 'sent' }])
          setNewMessage('')
          
          // Simulate delivery confirmation after a delay
          setTimeout(() => {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === message.id 
                  ? { ...msg, status: 'delivered' as const }
                  : msg
              )
            )
          }, 2000)
          
          alert('Message sent successfully to Mark Butcher!')
        } else {
          alert(`Failed to send message: ${result.error || 'Unknown error'}`)
        }
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please check your LinkedIn connection.')
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-gray-400" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'read':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">LinkedIn Messaging</h2>
          <p className="text-gray-600 mb-6">
            Connect to LinkedIn to send real messages to Mark Butcher and your network
          </p>
          <div className="space-y-4">
            <button 
              onClick={checkLinkedInStatus}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Check LinkedIn Connection
            </button>
            <p className="text-sm text-gray-500">
              Make sure you're logged into LinkedIn via the "LinkedIn Automation" tab first
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Connection Status Banner */}
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">LinkedIn Connected</span>
            <span className="text-green-600 text-sm">Ready to send real messages</span>
          </div>
          <button 
            onClick={checkLinkedInStatus}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Refresh Status
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex h-[600px]">
          {/* Contacts Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{contact.headline}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.company}</p>
                    </div>
                    {contact.id === 'mark_butcher' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {selectedContact.avatar ? (
                        <img
                          src={selectedContact.avatar}
                          alt={selectedContact.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedContact.name}</h3>
                      <p className="text-sm text-gray-600">{selectedContact.headline}</p>
                    </div>
                    {selectedContact.id === 'mark_butcher' && (
                      <div className="ml-auto flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-medium">Online</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'outgoing'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {formatTime(message.sentAt)}
                          </span>
                          {message.type === 'outgoing' && (
                            <div className="ml-2">
                              {getStatusIcon(message.status)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Message ${selectedContact.name}...`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a contact</h3>
                  <p className="text-gray-600">Choose a contact from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Contacts</h3>
              <p className="text-2xl font-bold text-blue-600">{contacts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Messages Sent</h3>
              <p className="text-2xl font-bold text-green-600">
                {messages.filter(m => m.type === 'outgoing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Response Rate</h3>
              <p className="text-2xl font-bold text-purple-600">85%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
