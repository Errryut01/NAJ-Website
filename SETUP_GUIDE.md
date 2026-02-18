# 🚀 Job Search Automation - Complete Setup Guide

## 📋 Prerequisites

### System Requirements
- Node.js 18+ 
- npm or yarn
- Chrome/Chromium browser
- Git

### API Keys Required

## 🔑 API Keys Setup

### 1. LinkedIn API
- **RapidAPI LinkedIn Scraper**: Get API key from [RapidAPI](https://rapidapi.com/letscrape-6bRBa3QguO5/api/fresh-linkedin-scraper-api)
- **LinkedIn OAuth**: Create app at [LinkedIn Developer Portal](https://www.linkedin.com/developers/)

### 2. Email APIs
- **Gmail API**: Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
- **Yahoo Mail**: Get credentials from [Yahoo Developer Network](https://developer.yahoo.com/)

### 3. AI/ML APIs
- **Grok API**: Get API key from [x.ai](https://x.ai/)
- **OpenAI API**: Get API key from [OpenAI](https://platform.openai.com/) (optional)
- **Anthropic API**: Get API key from [Anthropic](https://www.anthropic.com/) (optional)

### 4. Job Search APIs
- **SerpAPI**: Get API key from [SerpAPI](https://serpapi.com/) (for Google Jobs)
- **Indeed API**: Get API key from [Indeed Partner API](https://ads.indeed.com/jobroll/xmlfeed)
- **Glassdoor API**: Get API key from [Glassdoor API](https://www.glassdoor.com/developer/)

## 🛠️ Installation Steps

### 1. Clone and Install Dependencies
```bash
git clone <your-repo-url>
cd job-search-automation
npm install
```

### 2. Environment Variables
Copy `.env.local` and update with your API keys:

```bash
# Database
DATABASE_URL="file:./dev.db"

# LinkedIn API
LINKEDIN_CLIENT_ID="your_linkedin_client_id"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/auth/linkedin/callback"

# RapidAPI LinkedIn
RAPIDAPI_LINKEDIN_KEY="your_rapidapi_key"
RAPIDAPI_LINKEDIN_KEY_2="your_rapidapi_key_2"  # Optional for rotation
RAPIDAPI_LINKEDIN_KEY_3="your_rapidapi_key_3"  # Optional for rotation

# Gmail API
GMAIL_CLIENT_ID="your_gmail_client_id"
GMAIL_CLIENT_SECRET="your_gmail_client_secret"
GMAIL_REDIRECT_URI="http://localhost:3000/api/email/callback"

# Grok API
GROK_API_KEY="your_grok_api_key"
GROK_API_URL="https://api.x.ai/v1"

# Job Search APIs
SERPAPI_KEY="your_serpapi_key"
INDEED_API_KEY="your_indeed_api_key"
GLASSDOOR_API_KEY="your_glassdoor_api_key"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Database Setup
```bash
# Reset database (WARNING: This will delete all data)
npx prisma migrate reset --force

# Or create new migration
npx prisma migrate dev --name add_linkedin_profile_url

# Generate Prisma client
npx prisma generate
```

### 4. Install Chrome for Puppeteer
```bash
npx puppeteer browsers install chrome
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 🔧 LinkedIn Setup

### 1. LinkedIn OAuth App Setup
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/linkedin/callback`
4. Get Client ID and Client Secret
5. Update `.env.local` with credentials

### 2. LinkedIn Automation Setup
1. The app uses Puppeteer for browser automation
2. Chrome will open automatically for LinkedIn login
3. Handle 2FA if required
4. Browser session is maintained for subsequent operations

## 📧 Email Setup

### 1. Gmail API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/email/callback`
6. Download credentials and update `.env.local`

### 2. Yahoo Mail Setup
1. Go to [Yahoo Developer Network](https://developer.yahoo.com/)
2. Create a new app
3. Get Client ID and Client Secret
4. Update `.env.local` with credentials

## 🤖 AI/ML Setup

### 1. Grok API Setup
1. Go to [x.ai](https://x.ai/)
2. Sign up for API access
3. Get API key
4. Update `.env.local` with key

### 2. Job Analysis
- The app uses Grok to analyze job postings
- Paste a job URL to get similar job recommendations
- AI generates personalized connection messages

## 🔍 Job Search APIs

### 1. SerpAPI (Google Jobs)
1. Go to [SerpAPI](https://serpapi.com/)
2. Sign up for free account
3. Get API key
4. Update `.env.local`

### 2. Indeed API
1. Go to [Indeed Partner API](https://ads.indeed.com/jobroll/xmlfeed)
2. Apply for API access
3. Get API key
4. Update `.env.local`

### 3. Glassdoor API
1. Go to [Glassdoor API](https://www.glassdoor.com/developer/)
2. Apply for API access
3. Get API key
4. Update `.env.local`

## 🎯 Features Overview

### ✅ Available Features
- **LinkedIn Profile Search**: Find connections at target companies
- **Connection Requests**: Send personalized connection requests
- **Messaging**: Send messages to existing connections
- **Email Integration**: Send emails via Gmail/Yahoo
- **Job Analysis**: AI-powered job posting analysis
- **Application Tracking**: Track job applications
- **Calendar Integration**: Sync with Google Calendar
- **Unified Messaging**: Thread conversations across platforms

### ❌ Limitations
- **InMail**: Cannot send InMail (requires LinkedIn Premium API)
- **Rate Limits**: Subject to API rate limits
- **LinkedIn Detection**: May be detected by LinkedIn's anti-bot measures

## 🚨 Troubleshooting

### Common Issues

1. **LinkedIn Login Fails**
   - Check if 2FA is enabled
   - Clear browser cache
   - Try different user agent

2. **API Rate Limits**
   - Check API key quotas
   - Implement request delays
   - Use multiple API keys for rotation

3. **Database Issues**
   - Reset database: `npx prisma migrate reset --force`
   - Check DATABASE_URL in `.env.local`

4. **Puppeteer Issues**
   - Install Chrome: `npx puppeteer browsers install chrome`
   - Check Chrome executable path

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check specific service
DEBUG=linkedin-automation npm run dev
```

## 📊 Monitoring

### API Usage
- Monitor API usage in respective dashboards
- Set up alerts for rate limit warnings
- Track costs and usage patterns

### Application Logs
- Check browser console for errors
- Monitor server logs for API failures
- Track database query performance

## 🔒 Security

### Best Practices
- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement rate limiting
- Monitor for suspicious activity
- Regular security updates

### API Key Rotation
- Rotate API keys regularly
- Use multiple keys for high-volume services
- Monitor key usage and costs

## 📈 Scaling

### Performance Optimization
- Implement caching for API responses
- Use connection pooling for database
- Optimize Puppeteer browser instances
- Implement request queuing

### Cost Management
- Monitor API usage and costs
- Implement smart caching strategies
- Use free tiers when possible
- Optimize request patterns

## 🆘 Support

### Getting Help
1. Check this setup guide
2. Review error logs
3. Check API documentation
4. Test individual components
5. Contact support if needed

### Common Commands
```bash
# Reset everything
npm run clean && npm install && npx prisma migrate reset --force

# Check database
npx prisma studio

# Test LinkedIn connection
npm run test:linkedin

# Check API status
npm run test:apis
```

---

## 🎉 You're Ready!

Once all dependencies are installed and configured, your Job Search Automation app will be fully functional with:

- ✅ LinkedIn profile search and connection requests
- ✅ Automated messaging across platforms
- ✅ AI-powered job analysis
- ✅ Application tracking and management
- ✅ Calendar integration
- ✅ Email automation

Start by connecting your LinkedIn profile and testing the job search functionality!

