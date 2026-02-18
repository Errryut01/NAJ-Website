import { NextRequest, NextResponse } from 'next/server'
import { linkedinAutomation } from '@/lib/linkedin-automation'

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, message, connections, query, location } = await request.json()

    switch (action) {
      case 'login':
        if (!email || !password) {
          return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        try {
          await linkedinAutomation.init()
          const loginResult = await linkedinAutomation.loginToLinkedIn(email, password)
          
          if (loginResult.success) {
            return NextResponse.json({ success: true, message: 'Logged in successfully' })
          } else if (loginResult.requires2FA) {
            return NextResponse.json({ 
              success: false, 
              requires2FA: true, 
              message: loginResult.message 
            }, { status: 202 }) // 202 Accepted - indicates 2FA required
          } else {
            return NextResponse.json({ 
              error: loginResult.message || 'Login failed' 
            }, { status: 401 })
          }
        } catch (error) {
          console.error('LinkedIn automation error:', error)
          return NextResponse.json({ 
            error: `Failed to initialize LinkedIn automation: ${error.message}` 
          }, { status: 500 })
        }

      case 'getConnections':
        const connections = await linkedinAutomation.getConnections()
        return NextResponse.json({ connections })

      case 'sendMessage':
        if (!message || !connections) {
          return NextResponse.json({ error: 'Message and connections are required' }, { status: 400 })
        }

        const messageResults = []
        for (const connection of connections) {
          try {
            const result = await linkedinAutomation.sendMessage(connection.profileUrl, message)
            messageResults.push({
              id: `msg_${Date.now()}_${connection.id}`,
              recipientId: connection.id,
              recipientName: connection.name,
              message,
              sentAt: new Date(),
              status: result.success ? 'sent' : 'failed',
              error: result.error
            })
          } catch (error) {
            messageResults.push({
              id: `msg_${Date.now()}_${connection.id}`,
              recipientId: connection.id,
              recipientName: connection.name,
              message,
              sentAt: new Date(),
              status: 'failed',
              error: error.message
            })
          }
        }
        return NextResponse.json({ results: messageResults })

      case 'searchPeople':
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        const people = await linkedinAutomation.searchPeople(query, location)
        return NextResponse.json({ people })

      case 'sendConnectionRequest':
        const { profileUrl, connectionMessage } = body
        if (!profileUrl) {
          return NextResponse.json({ error: 'Profile URL is required' }, { status: 400 })
        }

        try {
          const result = await linkedinAutomation.sendConnectionRequest(profileUrl, connectionMessage)
          return NextResponse.json({ success: result.success, error: result.error })
        } catch (error) {
          console.error('Error sending connection request:', error)
          return NextResponse.json({ error: 'Failed to send connection request' }, { status: 500 })
        }

      case 'checkStatus':
        const isLoggedIn = await linkedinAutomation.checkLoginStatus()
        return NextResponse.json({ isLoggedIn })

      case 'close':
        await linkedinAutomation.close()
        return NextResponse.json({ success: true, message: 'Automation closed' })

      case 'restart':
        try {
          await linkedinAutomation.close()
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          await linkedinAutomation.init()
          return NextResponse.json({ success: true, message: 'Browser restarted' })
        } catch (error) {
          console.error('Error restarting browser:', error)
          return NextResponse.json({ 
            error: `Failed to restart browser: ${error.message}` 
          }, { status: 500 })
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('LinkedIn automation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'status':
        const isLoggedIn = await linkedinAutomation.checkLoginStatus()
        return NextResponse.json({ isLoggedIn })

      case 'connections':
        const connections = await linkedinAutomation.getConnections()
        return NextResponse.json({ connections })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('LinkedIn automation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
