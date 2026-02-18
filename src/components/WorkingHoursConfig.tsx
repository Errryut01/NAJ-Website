'use client'

import { useState, useEffect } from 'react'
import { Clock, Save, X, Plus, Trash2 } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

interface WorkingHours {
  day: string
  startTime: string
  endTime: string
  isWorking: boolean
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

export default function WorkingHoursConfig() {
  const { user, profile, updateProfile } = useUser()
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const [timezone, setTimezone] = useState('America/New_York')
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize working hours from profile or defaults
  useEffect(() => {
    if (profile?.workingHours) {
      try {
        const savedHours = JSON.parse(profile.workingHours as string)
        setWorkingHours(savedHours)
      } catch (error) {
        console.error('Error parsing working hours:', error)
        setWorkingHours(getDefaultWorkingHours())
      }
    } else {
      setWorkingHours(getDefaultWorkingHours())
    }

    if (profile?.timezone) {
      setTimezone(profile.timezone)
    }
  }, [profile])

  const getDefaultWorkingHours = (): WorkingHours[] => {
    return DAYS_OF_WEEK.map(day => ({
      day: day.key,
      startTime: day.key === 'saturday' || day.key === 'sunday' ? '' : '09:00',
      endTime: day.key === 'saturday' || day.key === 'sunday' ? '' : '17:00',
      isWorking: day.key !== 'saturday' && day.key !== 'sunday'
    }))
  }

  const updateWorkingHours = (day: string, field: keyof WorkingHours, value: string | boolean) => {
    setWorkingHours(prev => 
      prev.map(hour => 
        hour.day === day 
          ? { ...hour, [field]: value }
          : hour
      )
    )
  }

  const handleSave = async () => {
    if (!user?.id) return

    setIsSaving(true)
    try {
      const profileData = {
        workingHours: JSON.stringify(workingHours),
        timezone: timezone
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...profileData
        }),
      })

      if (response.ok) {
        await updateProfile()
        setIsOpen(false)
      } else {
        console.error('Failed to save working hours')
      }
    } catch (error) {
      console.error('Error saving working hours:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const copyToAllDays = (sourceDay: string) => {
    const sourceHours = workingHours.find(h => h.day === sourceDay)
    if (!sourceHours) return

    setWorkingHours(prev => 
      prev.map(hour => ({
        ...hour,
        startTime: sourceHours.startTime,
        endTime: sourceHours.endTime,
        isWorking: sourceHours.isWorking
      }))
    )
  }

  const getTimezoneOptions = () => {
    const timezones = [
      'America/New_York',
      'America/Chicago', 
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney'
    ]
    return timezones
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Clock className="w-4 h-4 mr-2" />
        Configure Working Hours
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Working Hours Configuration</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Timezone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {getTimezoneOptions().map(tz => (
                  <option key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Working Hours Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Weekly Schedule</h4>
                <p className="text-sm text-gray-500">Set your available working hours for each day</p>
              </div>

              <div className="space-y-3">
                {DAYS_OF_WEEK.map(day => {
                  const dayHours = workingHours.find(h => h.day === day.key)
                  if (!dayHours) return null

                  return (
                    <div key={day.key} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                      <div className="w-24">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={dayHours.isWorking}
                            onChange={(e) => updateWorkingHours(day.key, 'isWorking', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm font-bold text-gray-900">{day.label}</span>
                        </label>
                      </div>

                      {dayHours.isWorking && (
                        <>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-semibold text-gray-700">From:</label>
                            <input
                              type="time"
                              value={dayHours.startTime}
                              onChange={(e) => updateWorkingHours(day.key, 'startTime', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm font-medium text-gray-900"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-semibold text-gray-700">To:</label>
                            <input
                              type="time"
                              value={dayHours.endTime}
                              onChange={(e) => updateWorkingHours(day.key, 'endTime', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm font-medium text-gray-900"
                            />
                          </div>

                          <button
                            onClick={() => copyToAllDays(day.key)}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                            title="Copy to all days"
                          >
                            Copy to all
                          </button>
                        </>
                      )}

                      {!dayHours.isWorking && (
                        <span className="text-sm font-medium text-gray-600 italic">Not working</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Working Hours
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
