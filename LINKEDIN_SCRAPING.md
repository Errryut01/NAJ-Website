# LinkedIn Job Search API Implementation

## Overview

This application uses the RapidAPI LinkedIn Job Search API to search for job openings on LinkedIn, providing a more reliable and faster alternative to web scraping.

## How It Works

### 1. LinkedIn Job Search (`src/lib/linkedin-job-api.ts`)

The app uses the RapidAPI LinkedIn Job Search API to search for job openings on LinkedIn.

**Key Features:**
- **Dynamic URL Building**: Constructs LinkedIn job search URLs with user parameters
- **Real Data Extraction**: Scrapes actual job postings from LinkedIn
- **Smart Fallback**: Falls back to realistic mock data if scraping fails
- **Browser Management**: Properly manages browser instances and cleanup

### 2. Search Parameters

The scraper accepts the following search parameters:
- `searchQuery`: Job title or keywords
- `city`: City name
- `country`: Country name
- `jobDescription`: User's description of ideal job
- `salaryMin`: Minimum salary
- `salaryMax`: Maximum salary
- `jobType`: Full-time, Part-time, Contract, etc.
- `remote`: Remote work preference
- `postedWithin`: Time filter (e.g., "Last 24 hours")

### 3. Data Extraction

For each job posting, the scraper extracts:
- **Job Title**: The position title
- **Company Name**: Hiring company
- **Location**: Job location
- **Salary**: Salary range (if available)
- **Description**: Job description snippet
- **Posted Date**: When the job was posted
- **Job URL**: Direct link to the job posting
- **Requirements**: Generated based on job title
- **Benefits**: Generated based on company type
- **Job Type**: Full-time, Part-time, etc.
- **Experience Level**: Junior, Mid-level, Senior, etc.

### 4. LinkedIn URL Structure

The scraper builds URLs like:
```
https://www.linkedin.com/jobs/search?keywords=software%20engineer&location=San%20Francisco%2C%20United%20States&f_JT=F&f_WT=2&f_TPR=r604800
```

Where:
- `keywords`: Search query
- `location`: City and country
- `f_JT`: Job type filter (F=Full-time, P=Part-time, C=Contract)
- `f_WT`: Work type filter (2=Remote)
- `f_TPR`: Time posted filter (r604800=Last week)

## Technical Implementation

### Dependencies
- **RapidAPI LinkedIn API**: Job search
- **TypeScript**: Type safety
- **Next.js API Routes**: Backend endpoints

### Error Handling
- **Network Timeouts**: 30-second timeout for page loads
- **Element Selection**: 10-second timeout for job elements
- **Graceful Fallback**: Returns mock data if scraping fails
- **API Fallback**: Returns mock data if API fails

## Usage

### API Endpoint
```bash
POST /api/jobs/search
Content-Type: application/json

{
  "searchQuery": "software engineer",
  "city": "San Francisco",
  "country": "United States",
  "salaryMin": 100000,
  "salaryMax": 200000,
  "jobType": "Full-time",
  "remote": false,
  "postedWithin": "Last week"
}
```

### Response Format
```json
{
  "success": true,
  "jobs": [
    {
      "id": "linkedin_123456",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, United States",
      "salary": "$120k - $180k",
      "description": "We are looking for a talented software engineer...",
      "postedDate": "2 days ago",
      "url": "https://linkedin.com/jobs/view/1234567890",
      "source": "LinkedIn",
      "requirements": ["Bachelor's degree", "3+ years experience"],
      "benefits": ["Health insurance", "401k matching"],
      "jobType": "Full-time",
      "experienceLevel": "Senior"
    }
  ],
  "totalCount": 5
}
```

## Limitations and Considerations

### 1. LinkedIn Anti-Bot Measures
- LinkedIn has sophisticated anti-bot detection
- May require additional measures like proxy rotation
- Rate limiting may be necessary for production use

### 2. Legal and Ethical Considerations
- Respect LinkedIn's Terms of Service
- Implement reasonable rate limiting
- Consider using official APIs when available
- Be transparent about data collection

### 3. Performance
- Browser automation is resource-intensive
- Consider caching results
- Implement proper cleanup to prevent memory leaks

### 4. Reliability
- Web scraping is inherently fragile
- Selectors may change when LinkedIn updates their UI
- Always have fallback mechanisms

## Future Improvements

1. **Proxy Support**: Add proxy rotation for better reliability
2. **Caching**: Implement Redis caching for search results
3. **Rate Limiting**: Add proper rate limiting
4. **Monitoring**: Add health checks and monitoring
5. **Official API**: Migrate to official LinkedIn APIs when available
6. **Machine Learning**: Use ML to improve job matching

## Testing

Run the test script to verify the scraper works:
```bash
node test-scraper.js
```

This will test the scraper with a sample search and display the results.
