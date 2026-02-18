import { NextRequest, NextResponse } from 'next/server'
import { scrapeLinkedInProfile, constructLinkedInProfileUrl } from '@/lib/linkedin-scraper'

export async function POST(request: NextRequest) {
  try {
    const { profileUrl, firstName, lastName } = await request.json()

    if (!profileUrl && (!firstName || !lastName)) {
      return NextResponse.json({ error: 'Profile URL or first/last name is required' }, { status: 400 })
    }

    let urlToScrape = profileUrl
    if (!urlToScrape) {
      // Try to construct the URL from name (not reliable, but worth trying)
      urlToScrape = constructLinkedInProfileUrl(firstName, lastName)
    }

    console.log('Scraping LinkedIn profile:', urlToScrape)

    const profileData = await scrapeLinkedInProfile(urlToScrape)

    return NextResponse.json({ success: true, data: profileData })

  } catch (error) {
    console.error('Error scraping LinkedIn profile:', error)
    return NextResponse.json({ 
      error: 'Failed to scrape LinkedIn profile', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
