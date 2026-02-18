'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

interface CalendarEvent {
  id: string
  title: string
  date?: string
  start?: string
  time?: string
  description?: string
  type?: 'interview' | 'meeting' | 'follow-up' | 'reminder'
  allDay?: boolean
  location?: string
  attendees?: Array<{
    email: string
    name: string
    status: string
  }>
  calendarId?: string
  calendarName?: string
  source?: string
  url?: string
}

interface WorkingHours {
  day: string
  startTime: string
  endTime: string
}

export default function Calendar() {
  const { user, profile } = useUser()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [workingHours, setWorkingHours] = useState<Array<{
    day: string
    startTime: string
    endTime: string
  }>>([])

  // Load working hours from profile
  useEffect(() => {
    if ((profile as any)?.workingHours) {
      try {
        const hours = typeof (profile as any).workingHours === 'string' 
          ? JSON.parse((profile as any).workingHours) 
          : (profile as any).workingHours
        setWorkingHours(hours)
      } catch (error) {
        console.error('Error parsing working hours:', error)
      }
    }
  }, [profile])

  // Load events - only when user changes or component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      if (isLoadingEvents) return // Prevent multiple simultaneous calls
      
      // If user is available, try to load real events
      if (!user?.id) {
        console.log('No user ID available, using sample events only')
        // Set sample events only if no user
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)
        
        const sampleEvents: CalendarEvent[] = [
          {
            id: '1',
            title: 'Interview with TechCorp',
            date: today.toISOString().split('T')[0],
            time: '10:00',
            description: 'Software Engineer position',
            type: 'interview'
          },
          {
            id: '2',
            title: 'Team Meeting',
            date: tomorrow.toISOString().split('T')[0],
            time: '14:00',
            description: 'Weekly standup',
            type: 'meeting'
          },
          {
            id: '3',
            title: 'Follow up with HR',
            date: nextWeek.toISOString().split('T')[0],
            time: '16:00',
            description: 'Check on application status',
            type: 'follow-up'
          }
        ]
        setEvents(sampleEvents)
        return
      }
      
      setIsLoadingEvents(true)
      try {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        console.log('Fetching calendar events for user:', user.id)
        const response = await fetch(`/api/calendar/events?userId=${user.id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        
        if (response.ok) {
          const data = await response.json()
          const apiEvents = data.events || []
          
          // Deduplicate events by ID to prevent duplicates
          const uniqueEvents = apiEvents.reduce((acc: CalendarEvent[], current: CalendarEvent) => {
            const existingIndex = acc.findIndex(event => event.id === current.id)
            if (existingIndex === -1) {
              acc.push(current)
            }
            return acc
          }, [])
          
          console.log(`Loaded ${apiEvents.length} events from API, ${uniqueEvents.length} unique events`)
          setEvents(uniqueEvents)
        } else {
          console.log('API response not ok, using local storage')
          // Fallback to local storage
          const localEvents = localStorage.getItem('calendarEvents')
          if (localEvents) {
            try {
              const parsedEvents = JSON.parse(localEvents)
              // Deduplicate local events as well
              const uniqueLocalEvents = parsedEvents.reduce((acc: CalendarEvent[], current: CalendarEvent) => {
                const existingIndex = acc.findIndex(event => event.id === current.id)
                if (existingIndex === -1) {
                  acc.push(current)
                }
                return acc
              }, [])
              setEvents(uniqueLocalEvents)
            } catch (e) {
              console.error('Error parsing local events:', e)
              setEvents([])
            }
          } else {
            setEvents([])
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } finally {
        setIsLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [user?.id]) // Only depend on user.id, not currentDate or isLoadingEvents

  // Refetch events when month changes (only if user is logged in)
  useEffect(() => {
    if (!user?.id) return

    const fetchMonthEvents = async () => {
      try {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        console.log('Fetching calendar events for month change:', currentDate.getMonth())
        const response = await fetch(`/api/calendar/events?userId=${user.id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        
        if (response.ok) {
          const data = await response.json()
          const apiEvents = data.events || []
          
          // Deduplicate events by ID to prevent duplicates
          const uniqueEvents = apiEvents.reduce((acc: CalendarEvent[], current: CalendarEvent) => {
            const existingIndex = acc.findIndex(event => event.id === current.id)
            if (existingIndex === -1) {
              acc.push(current)
            }
            return acc
          }, [])
          
          console.log(`Loaded ${apiEvents.length} events for month change, ${uniqueEvents.length} unique events`)
          setEvents(uniqueEvents)
        }
      } catch (error) {
        console.error('Error fetching month events:', error)
      }
    }

    fetchMonthEvents()
  }, [currentDate, user?.id]) // Remove isLoadingEvents from dependencies

  const navigateMonth = (direction: 'prev' | 'next') => {
    console.log('Navigating month:', direction)
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      console.log('New date:', newDate)
      return newDate
    })
  }

  const isWorkingDay = (date: Date) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    return workingHours.some(h => h.day === dayOfWeek)
  }

  const getWorkingHoursForDay = (date: Date) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const dayHours = workingHours.find(h => h.day === dayOfWeek)
    
    return dayHours ? { start: dayHours.startTime, end: dayHours.endTime } : null
  }

  const getEventsForDate = (date: Date) => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return Array.isArray(events) ? events.filter(event => {
      // Handle both date format (for sample events) and start format (for Google Calendar events)
      const eventDateStr = event.date || event.start?.split('T')[0]
      if (!eventDateStr) return false
      
      const eventDate = new Date(eventDateStr + 'T00:00:00')
      return eventDate.getTime() === targetDate.getTime()
    }) : []
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'meeting':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'follow-up':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reminder':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isCurrentMonth = (date: Date) => {
    const today = new Date()
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return compareDate.getTime() === todayDate.getTime()
  }

  const todayEvents = events.filter(event => {
    const today = new Date()
    const eventDateStr = event.date || event.start?.split('T')[0]
    if (!eventDateStr) return false
    
    // Parse event date and today's date in the same way to avoid timezone issues
    const eventDate = new Date(eventDateStr + 'T00:00:00')
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    return eventDate.getTime() === todayDate.getTime()
  })

  const days = getDaysInMonth(currentDate)

  // Debug logging
  console.log('Calendar render - events count:', events.length, 'currentDate:', currentDate.toISOString(), 'isLoadingEvents:', isLoadingEvents)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
        <button
          onClick={() => setShowEventForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </button>
      </div>

      {/* Today's Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Events</h3>
        {todayEvents.length > 0 ? (
          <div className="space-y-3">
            {todayEvents.map((event, index) => (
              <div key={`${event.id}-${index}-${event.start || event.date}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {event.time || (event.start ? new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '')} 
                      {event.description ? ` - ${event.description}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEventTypeColor(event.type || 'meeting')}`}>
                    {event.type || 'meeting'}
                  </span>
                  <button
                    onClick={() => setEditingEventId(event.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No events scheduled for today</p>
        )}
      </div>

      {/* Monthly Calendar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900">
            {formatDate(currentDate)}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Loading state */}
          {isLoadingEvents && (
            <div className="col-span-7 p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              Loading events...
            </div>
          )}
          
          {/* Calendar days */}
          {!isLoadingEvents && days.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-2"></div>
            }
            
            const dayEvents = getEventsForDate(date)
            const isCurrentMonthDay = isCurrentMonth(date)
            const isTodayDate = isToday(date)
            const isWorkingDayDate = isWorkingDay(date)
            
            return (
              <div
                key={date.toISOString()}
                className={`p-2 min-h-[100px] border border-gray-200 ${
                  isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'
                } ${isTodayDate ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                  } ${isTodayDate ? 'text-indigo-600' : ''}`}>
                    {date.getDate()}
                  </span>
                  {isCurrentMonthDay && isWorkingDayDate && workingHours.length > 0 && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event, index) => (
                    <div
                      key={`${event.id}-${index}-${event.start || event.date}-${date.toISOString()}`}
                      className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type || 'meeting')}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Event</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Event title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="interview">Interview</option>
                  <option value="meeting">Meeting</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Event description"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEventId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Event</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Event title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="interview">Interview</option>
                  <option value="meeting">Meeting</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Event description"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingEventId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Update Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}