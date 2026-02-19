'use client'

import { useState, useEffect } from 'react'
import { User, Mail, MapPin, Briefcase, Calendar, ExternalLink, RefreshCw } from 'lucide-react'

interface LinkedInProfileProps {
  userId: string
}

interface ProfileData {
  connected: boolean
  profile?: {
    firstName: string
    lastName: string
    phone?: string
    location?: string
    country?: string
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
  linkedinCredentials?: {
    hasAccessToken: boolean
    expiresAt?: string
  }
  isProfileComplete: boolean
  user: {
    id: string
    name: string
    email: string
  }
}

export default function LinkedInProfile({ userId }: LinkedInProfileProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProfileData = async () => {
    try {
      setRefreshing(true)
      console.log('Fetching profile data for userId:', userId)
      const response = await fetch(`/api/profile/status?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Profile data received:', data)
      setProfileData(data)
    } catch (error) {
      console.error('Error fetching profile data:', error)
      // Set a default state on error
      setProfileData({
        connected: false,
        profile: undefined,
        linkedinCredentials: undefined,
        isProfileComplete: false,
        user: {
          id: userId,
          name: 'User',
          email: `${userId}@example.com`
        }
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchProfileData()
    } else {
      setLoading(false)
    }
  }, [userId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isTokenExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profileData?.connected) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">LinkedIn Not Connected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect your LinkedIn profile to import your professional information.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">LinkedIn Profile</h3>
            <button
              onClick={fetchProfileData}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Profile Header */}
        <div className="flex items-start space-x-4">
          {profileData.profile?.profilePictureUrl ? (
            <img
              src={profileData.profile?.profilePictureUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-gray-900">
              {profileData.profile?.firstName} {profileData.profile?.lastName}
            </h4>
            
            {profileData.profile?.currentTitle && (
              <p className="text-gray-600 mt-1">
                {profileData.profile?.currentTitle}
                {profileData.profile?.currentCompany && ` at ${profileData.profile?.currentCompany}`}
              </p>
            )}

            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {profileData.user.email}
              </div>
              {profileData.profile?.country && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profileData.profile?.country}
                </div>
              )}
            </div>
          </div>

          {profileData.profile?.linkedInProfileUrl && (
            <a
              href={profileData.profile?.linkedInProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View on LinkedIn
            </a>
          )}
        </div>

        {/* Profile Summary */}
        {profileData.profile?.summary && (
          <div className="mt-6">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Summary</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              {profileData.profile?.summary}
            </p>
          </div>
        )}

        {/* Professional Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {profileData.profile?.yearsExperience && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Experience</h5>
              <div className="flex items-center text-sm text-gray-600">
                <Briefcase className="h-4 w-4 mr-2" />
                {profileData.profile?.yearsExperience} years
              </div>
            </div>
          )}

          {profileData.linkedinCredentials?.expiresAt && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Connection Status</h5>
              <div className="flex items-center text-sm">
                {isTokenExpired(profileData.linkedinCredentials?.expiresAt) ? (
                  <span className="text-red-600">Token Expired - Reconnection Required</span>
                ) : (
                  <span className="text-green-600">Active until {formatDate(profileData.linkedinCredentials?.expiresAt)}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        {profileData.profile?.skills && (
          <div className="mt-6">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Skills</h5>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(profileData.profile?.skills) ? (
                profileData.profile?.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No skills imported yet</span>
              )}
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">LinkedIn Integration</h5>
              <p className="text-sm text-gray-600">
                Your LinkedIn profile is connected and ready for job search automation.
              </p>
            </div>
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
