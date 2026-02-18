# Job Search Automation Platform

A comprehensive web application that automates the job search process by generating customized resumes and cover letters using Grok AI, automatically applying to jobs, and managing LinkedIn connections and messaging.

## Features

- **Profile Management**: Complete user profile setup with professional information, skills, and experience
- **AI-Powered Document Generation**: Uses Grok AI to generate tailored resumes and cover letters for each job application
- **Automated Job Search**: Searches multiple job boards using Google Jobs and LinkedIn Job API, applies to relevant positions
- **LinkedIn Integration**: Automatically sends connection requests and messages to potential hiring managers
- **Application Tracking**: Comprehensive dashboard to track job applications, interviews, and responses
- **Rate Limiting**: Prevents applying to more than one position per company per month
- **Smart Messaging**: AI-generated personalized messages for LinkedIn connections

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **AI Integration**: Grok API for document generation
- **External APIs**: Google Jobs, LinkedIn Job API, Indeed API, Glassdoor API
- **Authentication**: LinkedIn OAuth

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Grok API key
- LinkedIn Developer App credentials
- Google Jobs search (no setup required)
- Indeed API key (optional)
- Glassdoor API key (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-search-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # LinkedIn API
   LINKEDIN_CLIENT_ID="your-linkedin-client-id"
   LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
   LINKEDIN_REDIRECT_URI="http://localhost:3000/api/auth/linkedin/callback"

   # Grok API
   GROK_API_KEY="your-grok-api-key"
   GROK_API_URL="https://api.grok.com/v1"

   # Job Search APIs (optional)
   INDEED_API_KEY="your-indeed-api-key"
   GLASSDOOR_API_KEY="your-glassdoor-api-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## API Setup

### Google Jobs Search (Automatic)

Google Jobs search is automatically enabled and requires no setup:
- **Free**: No API keys or authentication required
- **Comprehensive**: Aggregates jobs from LinkedIn, Indeed, Glassdoor, company websites, and more
- **Real-time**: Always up-to-date with the latest job postings
- **Smart filtering**: Location, salary, job type, and experience level filtering

### Grok API
1. Sign up for a Grok API account
2. Get your API key from the dashboard
3. Add it to your `.env.local` file

### LinkedIn API
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Add the following redirect URI: `http://localhost:3000/api/auth/linkedin/callback`
4. Request the following permissions:
   - `r_liteprofile` - Read basic profile information
   - `r_emailaddress` - Read email address
   - `w_messaging` - Send messages
5. Copy the Client ID and Client Secret to your `.env.local` file

### Job Search APIs (Optional)
- **Indeed API**: Sign up at [Indeed Partner API](https://ads.indeed.com/jobroll/xmlfeed)
- **Glassdoor API**: Sign up at [Glassdoor API](https://www.glassdoor.com/developer/index.htm)

## Usage

### 1. Complete Your Profile
- Fill out personal information, professional experience, skills, and education
- Set your job search preferences including target companies, locations, and salary range
- Configure automation settings for applications and LinkedIn messaging

### 2. Search for Jobs
- Use the job search interface to find relevant positions
- Filter by location, salary, job type, and other criteria
- Select jobs you want to apply to

### 3. Automated Applications
- The system will generate customized resumes and cover letters using Grok AI
- Automatically apply to selected jobs (respecting rate limits)
- Track application status and responses

### 4. LinkedIn Networking
- Automatically find and connect with hiring managers at target companies
- Send personalized connection requests and follow-up messages
- Track connection status and message responses

### 5. Monitor Progress
- Use the dashboard to track applications, interviews, and responses
- View analytics on application success rates
- Manage upcoming interviews and follow-ups

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── applications/          # Job application endpoints
│   │   ├── auth/
│   │   │   └── linkedin/         # LinkedIn OAuth
│   │   ├── jobs/
│   │   │   └── search/           # Job search endpoints
│   │   ├── linkedin/
│   │   │   ├── connections/      # LinkedIn connections
│   │   │   └── messages/         # LinkedIn messaging
│   │   └── profile/              # User profile endpoints
│   └── page.tsx                  # Main dashboard
├── components/
│   ├── Applications.tsx          # Application management
│   ├── Connections.tsx           # LinkedIn connections
│   ├── Dashboard.tsx             # Main dashboard
│   ├── JobSearch.tsx             # Job search interface
│   └── ProfileSetup.tsx          # Profile setup wizard
├── lib/
│   ├── services/
│   │   ├── grok.ts              # Grok AI integration
│   │   ├── jobSearch.ts         # Job search services
│   │   └── linkedin.ts          # LinkedIn API integration
│   ├── prisma.ts                # Database client
│   └── types.ts                 # TypeScript types
└── prisma/
    └── schema.prisma            # Database schema
```

## Database Schema

The application uses Prisma ORM with the following main models:

- **User**: Basic user information
- **UserProfile**: Detailed professional profile
- **JobSearchPreferences**: User's job search criteria
- **JobApplication**: Job applications and their status
- **LinkedInConnection**: LinkedIn connections
- **LinkedInMessage**: Messages sent to connections
- **LinkedInCredentials**: OAuth tokens
- **GrokCredentials**: API keys

## Rate Limiting

The application implements several rate limiting mechanisms:

- **Company Applications**: Maximum one application per company per month
- **LinkedIn Connections**: Respects LinkedIn's connection request limits
- **API Calls**: Implements delays between external API calls

## Security Considerations

- All API keys are stored securely in environment variables
- LinkedIn OAuth tokens are encrypted and stored in the database
- User data is protected with proper authentication
- Rate limiting prevents abuse of external APIs

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
- Ensure you have a PostgreSQL database for production
- Update `DATABASE_URL` to point to your production database
- Set up proper environment variables
- Configure domain for LinkedIn OAuth redirect

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is for educational and personal use only. Users should:
- Comply with LinkedIn's Terms of Service
- Respect job application limits and company policies
- Use the automation responsibly and ethically
- Review all generated content before sending

## Support

For support, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Add more job board integrations
- [ ] Implement advanced AI features
- [ ] Add email integration
- [ ] Create mobile app
- [ ] Add analytics and reporting
- [ ] Implement team collaboration features