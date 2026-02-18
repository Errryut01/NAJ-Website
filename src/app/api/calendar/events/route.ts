import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    // Get active Google Calendar connections for the user
    const connections = await prisma.calendarConnection.findMany({
      where: {
        userId,
        provider: 'google',
        isActive: true,
      },
    })

    if (connections.length === 0) {
      return NextResponse.json({ events: [] })
    }

    const allEvents = []

    for (const connection of connections) {
      try {
        // Check if token is expired and refresh if needed
        let accessToken = connection.accessToken
        if (connection.expiresAt && new Date() > connection.expiresAt) {
          // Token expired, try to refresh
          if (connection.refreshToken) {
            const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID || '',
                client_secret: GOOGLE_CLIENT_SECRET || '',
                refresh_token: connection.refreshToken,
                grant_type: 'refresh_token',
              }),
            })

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json()
              accessToken = refreshData.access_token
              
              // Update the connection with new token
              await prisma.calendarConnection.update({
                where: { id: connection.id },
                data: {
                  accessToken: refreshData.access_token,
                  expiresAt: refreshData.expires_in ? new Date(Date.now() + refreshData.expires_in * 1000) : null,
                },
              })
            }
          }
        }

        // Fetch events from Google Calendar
        const eventsUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
        eventsUrl.searchParams.set('timeMin', startDate || new Date().toISOString())
        eventsUrl.searchParams.set('timeMax', endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        eventsUrl.searchParams.set('singleEvents', 'true')
        eventsUrl.searchParams.set('orderBy', 'startTime')

        const eventsResponse = await fetch(eventsUrl.toString(), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          const events = eventsData.items || []

          // Transform Google Calendar events to our format
          const transformedEvents = events.map((event: any) => ({
            id: event.id,
            title: event.summary || 'No Title',
            description: event.description || '',
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            allDay: !event.start?.dateTime,
            location: event.location || '',
            attendees: event.attendees?.map((attendee: any) => ({
              email: attendee.email,
              name: attendee.displayName || attendee.email,
              status: attendee.responseStatus,
            })) || [],
            calendarId: connection.calendarId,
            calendarName: connection.calendarName || 'Google Calendar',
            source: 'google',
            url: event.htmlLink,
          }))

          allEvents.push(...transformedEvents)
        }
      } catch (error) {
        console.error(`Error fetching events for calendar ${connection.calendarId}:`, error)
        // Continue with other calendars even if one fails
      }
    }

    return NextResponse.json({ events: allEvents })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { title, description, start, end, allDay, location } = body

    // Get the first active Google Calendar connection
    const connection = await prisma.calendarConnection.findFirst({
      where: {
        userId,
        provider: 'google',
        isActive: true,
      },
    })

    if (!connection) {
      return NextResponse.json({ error: 'No active Google Calendar connection found' }, { status: 404 })
    }

    // Create event in Google Calendar
    const eventData = {
      summary: title,
      description: description || '',
      start: allDay ? { date: start.split('T')[0] } : { dateTime: start },
      end: allDay ? { date: end.split('T')[0] } : { dateTime: end },
      location: location || '',
    }

    const createResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (createResponse.ok) {
      const createdEvent = await createResponse.json()
      return NextResponse.json({ 
        success: true, 
        event: {
          id: createdEvent.id,
          title: createdEvent.summary,
          description: createdEvent.description,
          start: createdEvent.start?.dateTime || createdEvent.start?.date,
          end: createdEvent.end?.dateTime || createdEvent.end?.date,
          allDay: !createdEvent.start?.dateTime,
          location: createdEvent.location,
          source: 'google',
        }
      })
    } else {
      const errorData = await createResponse.json()
      return NextResponse.json({ error: 'Failed to create event in Google Calendar', details: errorData }, { status: 400 })
    }
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 })
  }
}
