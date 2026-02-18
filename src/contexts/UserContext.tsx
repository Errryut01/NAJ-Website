'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  country?: string
  postalCode?: string
  city?: string
  summary?: string
  currentTitle?: string
  currentCompany?: string
  yearsExperience?: number
  skills?: any
  experience?: any
  education?: any
  linkedInProfileUrl?: string
  profilePictureUrl?: string
}

interface JobSearchPreferences {
  id: string
  jobTitles?: string[]
  companies?: string[]
  locations?: string[]
  salaryMin?: number
  jobTypes?: string[]
  remoteWork: boolean
  maxApplicationsPerMonth: number
  autoApply: boolean
  autoConnect: boolean
  autoMessage: boolean
  connectionMessage?: string
  followUpMessage?: string
}

interface LinkedInCredentials {
  id: string
  accessToken: string
  refreshToken?: string
  expiresAt: Date
}

interface UserContextType {
  user: User | null
  profile: UserProfile | null
  preferences: JobSearchPreferences | null
  linkedinCredentials: LinkedInCredentials | null
  isConnected: boolean
  isLoading: boolean
  login: (userId: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  refreshApplications: () => void
  applicationsRefreshTrigger: number
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<JobSearchPreferences | null>(null)
  const [linkedinCredentials, setLinkedinCredentials] = useState<LinkedInCredentials | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [applicationsRefreshTrigger, setApplicationsRefreshTrigger] = useState(0)

  const isConnected = !!linkedinCredentials

  const login = useCallback(async (userId: string) => {
    try {
      setIsLoading(true)
      console.log('Starting login process for userId:', userId)
      
      const response = await fetch(`/api/profile/status?userId=${userId}`)
      const data = await response.json()
      
      if (data.user) {
        setUser(data.user)
        setProfile(data.profile)
        setLinkedinCredentials(data.linkedinCredentials)
        
        // Load preferences separately
        try {
          const preferencesResponse = await fetch(`/api/preferences?userId=${userId}`)
          if (preferencesResponse.ok) {
            const preferencesData = await preferencesResponse.json()
            if (preferencesData) {
              // Parse JSON fields
              const parsedPreferences = {
                ...preferencesData,
                jobTitles: preferencesData.jobTitles ? JSON.parse(preferencesData.jobTitles) : [],
                companies: preferencesData.companies ? JSON.parse(preferencesData.companies) : [],
                skills: preferencesData.skills ? JSON.parse(preferencesData.skills) : [],
                experience: preferencesData.experience ? JSON.parse(preferencesData.experience) : [],
                education: preferencesData.education ? JSON.parse(preferencesData.education) : []
              }
              setPreferences(parsedPreferences)
            }
          }
        } catch (prefError) {
          console.error('Error loading preferences:', prefError)
        }
        
        console.log('User data loaded successfully:', data.user)
      } else {
        // Create a basic user if none exists
        const basicUser = {
          id: userId,
          name: 'User',
          email: `${userId}@example.com`
        }
        setUser(basicUser)
        setProfile(null)
        setLinkedinCredentials(null)
        setPreferences(null)
        console.log('Basic user created, no existing profile found')
      }
    } catch (error) {
      console.error('Error logging in:', error)
      // Create a basic user on error
      const basicUser = {
        id: userId,
        name: 'User',
        email: `${userId}@example.com`
      }
      setUser(basicUser)
      setProfile(null)
      setLinkedinCredentials(null)
      setPreferences(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      // Clear LinkedIn credentials from database
      if (user?.id) {
        console.log('Disconnecting LinkedIn for user:', user.id)
        const response = await fetch(`/api/auth/linkedin/disconnect?userId=${user.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('LinkedIn disconnect failed:', errorData)
          // Don't throw error, just log it - we still want to clear local state
        } else {
          console.log('LinkedIn disconnected successfully')
        }
      }
    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error)
      // Don't throw error, just log it - we still want to clear local state
    } finally {
      // Clear local state regardless of API call success
      console.log('Clearing local state and localStorage')
      setUser(null)
      setProfile(null)
      setPreferences(null)
      setLinkedinCredentials(null)
      // Clear localStorage
      localStorage.removeItem('userId')
    }
  }, [user?.id])

  const refreshProfile = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id
    if (targetUserId) {
      await login(targetUserId)
    }
  }, [user, login])

  const refreshApplications = useCallback(() => {
    setApplicationsRefreshTrigger(prev => prev + 1)
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get user from localStorage or session storage
        const savedUserId = localStorage.getItem('userId')
        if (savedUserId) {
          await login(savedUserId)
        }
      } catch (error) {
        console.error('Error checking session:', error)
      }
    }
    
    checkSession()
  }, [])

  // Save user ID to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('userId', user.id)
    } else {
      localStorage.removeItem('userId')
    }
  }, [user])

  return (
    <UserContext.Provider value={{
      user,
      profile,
      preferences,
      linkedinCredentials,
      isConnected,
      isLoading,
      login,
      logout,
      refreshProfile,
      refreshApplications,
      applicationsRefreshTrigger
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
