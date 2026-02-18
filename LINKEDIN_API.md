# LinkedIn Job Search API Implementation

## Overview

This application uses the RapidAPI LinkedIn Job Search API to search for job openings on LinkedIn, providing a more reliable and faster alternative to web scraping.

## How It Works

### 1. LinkedIn Job API (`src/lib/linkedin-job-api.ts`)

The API service uses the RapidAPI LinkedIn Job Search API to fetch job postings with the user's search criteria.

**Key Features:**
- **API Integration**: Uses RapidAPI LinkedIn Job Search API
- **Fallback System**: Falls back to alternative APIs if primary fails
- **Real Data**: Returns actual job postings from LinkedIn
- **Error Handling**: Proper error handling with user-friendly messages

### 2. Search Parameters

The API accepts the following search parameters:
- `searchQuery`: Job title or keywords
- `city`: City name
- `country`: Country name
- `jobDescription`: User's description of ideal job
- `salaryMin`: Minimum salary (in thousands)
- `jobType`: Full-time, Part-time, Contract, etc.
- `remote`: Remote work preference
- `postedWithin`: Time filter (e.g., "Last 24 hours")

### 3. Data Extraction

For each job posting, the API extracts:
- **Job Title** - From LinkedIn job data
- **Company Name** - Hiring company
- **Location** - Job location
- **Salary** - Salary range (if available)
- **Description** - Job description
- **Posted Date** - When the job was posted
- **Job URL** - Direct link to the job posting
- **Requirements** - Generated based on job title
- **Benefits** - Generated based on company type
- **Job Type** - Full-time, Part-time, etc.
- **Experience Level** - Junior, Mid-level, Senior, etc.

### 4. API Endpoints

**Primary API:**
```
GET https://linkedin-job-search-api.p.rapidapi.com/active-jb-expired
```

**Headers:**
```
x-rapidapi-host: linkedin-job-search-api.p.rapidapi.com
x-rapidapi-key: [YOUR_API_KEY]
```

## Technical Implementation

### Dependencies
- **RapidAPI**: LinkedIn Job Search API
- **TypeScript**: Type safety
- **Next.js API Routes**: Backend endpoints

### API Configuration
```typescript
private rapidApiKey = process.env.RAPIDAPI_LINKEDIN_KEY || ''
private rapidApiHost = 'linkedin-job-search-api.p.rapidapi.com'
```

### Error Handling
- **API Failures**: Graceful fallback to alternative APIs
- **Rate Limiting**: Proper handling of API rate limits
- **Network Errors**: Retry logic and error messages
- **Data Validation**: Ensures data integrity

## Usage

### API Endpoint
```bash
POST /api/jobs/search
Content-Type: application/json

{
  "searchQuery": "software engineer",
  "city": "San Francisco",
  "country": "United States",
  "salaryMin": 100,
  "jobType": "Full-time",
  "remote": false
}
```

### Response Format
```json
{
  "success": true,
  "jobs": [
    {
      "id": "linkedin_api_1",
      "title": "Software Engineer",
      "company": "Google",
      "location": "San Francisco, United States",
      "salary": "100k - 140k",
      "description": "We are looking for a talented software engineer...",
      "postedDate": "1 day ago",
      "url": "https://linkedin.com/jobs/view/1234567890",
      "source": "LinkedIn API",
      "requirements": ["Bachelor's degree", "3+ years experience"],
      "benefits": ["Health insurance", "401k matching"],
      "jobType": "Full-time",
      "experienceLevel": "Mid-level"
    }
  ],
  "totalCount": 8
}
```

## Advantages Over Web Scraping

### 1. Reliability
- **No Anti-Bot Measures**: APIs are designed for programmatic access
- **Consistent Data**: Structured data format
- **Rate Limiting**: Proper rate limiting instead of blocking

### 2. Performance
- **Faster Response**: Direct API calls vs browser automation
- **Lower Resource Usage**: No browser instances needed
- **Scalable**: Can handle multiple concurrent requests

### 3. Maintenance
- **Stable Interface**: API contracts are more stable than HTML
- **No Selector Updates**: No need to update CSS selectors
- **Better Error Handling**: Clear error messages and status codes

### 4. Legal Compliance
- **Terms of Service**: APIs have clear usage terms
- **Rate Limiting**: Built-in protection against abuse
- **Authentication**: Proper API key management

## Fallback System

The implementation includes a robust fallback system:

1. **Primary API**: RapidAPI LinkedIn Job Search API
2. **Fallback API**: Alternative job search APIs
3. **Mock Data**: Realistic job data if all APIs fail
4. **Error Handling**: Clear error messages for users

## Future Improvements

1. **Multiple APIs**: Add more job search APIs for redundancy
2. **Caching**: Implement Redis caching for search results
3. **Rate Limiting**: Add client-side rate limiting
4. **Analytics**: Track API usage and performance
5. **Real-time Updates**: WebSocket updates for new jobs

## Testing

Test the API endpoint:
```bash
curl -X POST "http://localhost:3000/api/jobs/search" \
  -H "Content-Type: application/json" \
  -d '{"searchQuery": "software engineer", "city": "San Francisco", "country": "United States"}'
```

This will return a list of job postings matching your search criteria.