import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gmail Authentication Error</title>
        </head>
        <body>
          <script>
            // Notify parent window of error
            if (window.opener) {
              window.opener.postMessage({
                type: 'GMAIL_AUTH_ERROR',
                error: '${encodeURIComponent(error)}'
              }, window.location.origin);
              window.close();
            } else {
              // If popup was closed, redirect to main page
              window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?section=messaging&error=${encodeURIComponent(error)}';
            }
          </script>
          <p>Authentication error: ${error}</p>
        </body>
      </html>
    `
    return new NextResponse(errorHtml, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  if (!code) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gmail Authentication Error</title>
        </head>
        <body>
          <script>
            // Notify parent window of error
            if (window.opener) {
              window.opener.postMessage({
                type: 'GMAIL_AUTH_ERROR',
                error: 'No authorization code received'
              }, window.location.origin);
              window.close();
            } else {
              // If popup was closed, redirect to main page
              window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?section=messaging&error=No authorization code received';
            }
          </script>
          <p>No authorization code received</p>
        </body>
      </html>
    `
    return new NextResponse(errorHtml, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  try {
    // Determine provider from state or by trying both
    let account
    let provider = 'gmail' // default

    if (state) {
      provider = state
    }

    try {
      if (provider === 'gmail') {
        account = await emailService.handleGmailCallback(code)
      } else if (provider === 'yahoo') {
        account = await emailService.handleYahooCallback(code)
      } else {
        // Try Gmail first, then Yahoo
        try {
          account = await emailService.handleGmailCallback(code)
          provider = 'gmail'
        } catch {
          account = await emailService.handleYahooCallback(code)
          provider = 'yahoo'
        }
      }
    } catch (error) {
      console.error('Error handling callback:', error)
      
      const errorHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gmail Authentication Error</title>
          </head>
          <body>
            <script>
              // Notify parent window of error
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GMAIL_AUTH_ERROR',
                  error: 'Authentication failed'
                }, window.location.origin);
                window.close();
              } else {
                // If popup was closed, redirect to main page
                window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?section=messaging&error=Authentication failed';
              }
            </script>
            <p>Authentication failed! This window should close automatically.</p>
          </body>
        </html>
      `
      
      return new NextResponse(errorHtml, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Return a page that will close the popup and notify the parent
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gmail Authentication Success</title>
        </head>
        <body>
          <script>
            // Notify parent window of success
            if (window.opener) {
              window.opener.postMessage({
                type: 'GMAIL_AUTH_SUCCESS',
                email: '${account.email}',
                provider: '${provider}'
              }, window.location.origin);
              window.close();
            } else {
              // If popup was closed, redirect to main page
              window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?section=messaging&success=true&provider=${provider}&email=${encodeURIComponent(account.email)}';
            }
          </script>
          <p>Authentication successful! This window should close automatically.</p>
        </body>
      </html>
    `
    
    return new NextResponse(successHtml, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    console.error('Error in email callback:', error)
    
    // Return a page that will close the popup and notify the parent of error
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gmail Authentication Error</title>
        </head>
        <body>
          <script>
            // Notify parent window of error
            if (window.opener) {
              window.opener.postMessage({
                type: 'GMAIL_AUTH_ERROR',
                error: 'Authentication failed'
              }, window.location.origin);
              window.close();
            } else {
              // If popup was closed, redirect to main page
              window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?section=messaging&error=Authentication failed';
            }
          </script>
          <p>Authentication failed! This window should close automatically.</p>
        </body>
      </html>
    `
    
    return new NextResponse(errorHtml, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}
