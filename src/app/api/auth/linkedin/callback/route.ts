import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('LinkedIn callback started')
    
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    console.log('Request parameters:', { code: !!code, state, error })
    
    if (error) {
      console.error('LinkedIn OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=${error}`
      )
    }
    
    if (!code || !state) {
      console.error('Missing code or state parameter')
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=missing_parameters`
      )
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback',
      }),
    })
    
    console.log('Token exchange response status:', tokenResponse.status)
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=token_exchange_failed&details=${encodeURIComponent(errorText)}`
      )
    }
    
    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful, access token present:', !!tokenData.access_token)
    
    // Try to get user profile from LinkedIn API
    let profileData = null
    try {
      // Get basic profile info first
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0'
        },
      })
      
      console.log('LinkedIn API response status:', profileResponse.status)
      
      if (profileResponse.ok) {
        profileData = await profileResponse.json()
        console.log('LinkedIn API profile data retrieved successfully:', Object.keys(profileData))
        
        // Note: Additional profile details require w_member_social scope
        // For now, we'll work with the basic profile data from userinfo endpoint
        console.log('Using basic profile data from userinfo endpoint')
        
      } else {
        const errorText = await profileResponse.text()
        console.log('LinkedIn API call failed with status:', profileResponse.status, 'Error:', errorText)
      }
    } catch (apiError) {
      console.log('LinkedIn API call error, falling back to ID token:', apiError)
    }
    
    // Fallback to ID token if API call failed
    if (!profileData && tokenData.id_token) {
      try {
        const base64Payload = tokenData.id_token.split('.')[1]
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())
        profileData = payload
        console.log('Using ID token data as fallback. Available fields:', Object.keys(payload))
      } catch (tokenError) {
        console.error('Failed to parse ID token:', tokenError)
      }
    }
    
    if (!profileData) {
      console.error('No profile data available')
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=no_profile_data`
      )
    }
    
    // Extract data from profile - try multiple field name variations
    const headline = profileData.headline || profileData.title || profileData.job_title || ''
    const summary = profileData.summary || profileData.about || profileData.bio || ''
    // Handle location data - it might be an object or string
    let location = ''
    if (typeof profileData.location === 'string') {
      location = profileData.location
    } else if (profileData.location && typeof profileData.location === 'object') {
      // Handle location object - try different possible structures
      if (profileData.location.name) {
        location = profileData.location.name
      } else if (profileData.location.country) {
        location = profileData.location.country
      } else if (profileData.location.city) {
        location = profileData.location.city
      } else {
        // If it's an object but we can't extract a meaningful string, convert to string
        location = JSON.stringify(profileData.location)
      }
    } else if (profileData.locale) {
      // Handle locale - it might be a string like "en_US" or an object
      if (typeof profileData.locale === 'string') {
        location = profileData.locale
      } else if (profileData.locale && typeof profileData.locale === 'object') {
        // If locale is an object, extract meaningful string
        if (profileData.locale.country) {
          location = profileData.locale.country
        } else if (profileData.locale.language) {
          location = profileData.locale.language
        } else {
          location = JSON.stringify(profileData.locale)
        }
      }
    } else if (profileData.country) {
      location = profileData.country
    }
    
    let profilePicture = null
    if (profileData.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier) {
      profilePicture = profileData.profilePicture.displayImage.elements[0].identifiers[0].identifier
    } else if (profileData.picture) {
      profilePicture = profileData.picture
    } else if (profileData.profilePictureUrl) {
      profilePicture = profileData.profilePictureUrl
    } else if (profileData.picture_url) {
      profilePicture = profileData.picture_url
    }
    
    // Ensure location is always a string or null
    const finalLocation = typeof location === 'string' ? location : (location ? JSON.stringify(location) : null)
    
    const extractedData = {
      email: profileData.email || profileData.email_address || `${state}@example.com`,
      firstName: profileData.given_name || profileData.first_name || profileData.firstName || 'User',
      lastName: profileData.family_name || profileData.last_name || profileData.lastName || 'Name',
      fullName: profileData.name || profileData.full_name || `${profileData.given_name || profileData.first_name || 'User'} ${profileData.family_name || profileData.last_name || 'Name'}`.trim(),
      picture: profilePicture,
      currentTitle: profileData.currentTitle || headline || '',
      currentCompany: profileData.currentCompany || '',
      summary: summary || '',
      country: finalLocation
    }
    
    console.log('Profile data location field:', profileData.location)
    console.log('Profile data locale field:', profileData.locale)
    console.log('Profile data country field:', profileData.country)
    console.log('Extracted location string:', location)
    console.log('Location type:', typeof location)
    console.log('Final country for database:', finalLocation)
    console.log('Final country type:', typeof finalLocation)
    console.log('Final extracted data:', extractedData)
    
    console.log('Extracted profile data for database:', extractedData)
    
    // Create or update User
    console.log('Creating/updating User with email:', extractedData.email)
    
    const user = await prisma.user.upsert({
      where: { email: extractedData.email },
      update: {
        id: state,
        name: extractedData.fullName,
        profilePictureUrl: extractedData.picture,
      },
      create: {
        id: state,
        email: extractedData.email,
        name: extractedData.fullName,
        profilePictureUrl: extractedData.picture,
      },
    })
    
    console.log('User upsert successful:', user.id)
    
    // Create or update UserProfile
    console.log('Creating/updating UserProfile for user:', user.id)
    
    const userProfile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        firstName: extractedData.firstName,
        lastName: extractedData.lastName,
        currentTitle: extractedData.currentTitle,
        currentCompany: extractedData.currentCompany,
        summary: extractedData.summary,
        country: extractedData.country,
      },
      create: {
        userId: user.id,
        firstName: extractedData.firstName,
        lastName: extractedData.lastName,
        currentTitle: extractedData.currentTitle,
        currentCompany: extractedData.currentCompany,
        summary: extractedData.summary,
        country: extractedData.country,
      },
    })
    
    console.log('UserProfile upsert successful:', userProfile.id)
    
    // Create or update LinkedInCredentials
    console.log('Creating/updating LinkedInCredentials for user:', user.id)
    
    const linkedInCredentials = await prisma.linkedInCredentials.upsert({
      where: { userId: user.id },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      },
      create: {
        userId: user.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      },
    })
    
    console.log('LinkedInCredentials upsert successful:', linkedInCredentials.id)
    
    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?linkedin_success=true&userId=${user.id}`
    )
    
  } catch (error) {
    console.error('LinkedIn callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=callback_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
    )
  }
}