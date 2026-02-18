# Google Gmail & Calendar Integration Setup

This guide will walk you through setting up Google OAuth to connect your Gmail account and Google Calendar.

## What You Need

You'll need to create a Google Cloud Project and get OAuth2 credentials. Here's what we need from you:

1. **Google Cloud Project** - You'll create this in Google Cloud Console
2. **OAuth 2.0 Client ID** - This will give us:
   - Client ID
   - Client Secret
3. **Authorized Redirect URIs** - We'll need to add these to your Google Cloud Project

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Job Search Automation")
5. Click "Create"

### 2. Enable Required APIs

1. In your Google Cloud Project, go to **APIs & Services** > **Library**
2. Enable the following APIs:
   - **Gmail API** (for sending emails)
   - **Google Calendar API** (for calendar access)

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required fields:
     - App name: "Job Search Automation"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events`
   - Add test users (your email) if in testing mode
   - Save and continue

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Job Search Automation Web Client"
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (for local development)
     - Your production URL if you have one (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/calendar/google/callback` (Calendar)
     - `http://localhost:3000/api/email/google/callback` (Gmail)
     - If you have production, add those too

5. Click **Create**
6. **Copy your Client ID and Client Secret** - You'll need these next!

### 4. Add Environment Variables

Add these to your `.env.local` file (create it if it doesn't exist in the root of your project):

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Redirect URIs (optional - defaults will work for localhost)
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback
GMAIL_REDIRECT_URI=http://localhost:3000/api/email/google/callback

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** 
- Replace `your_client_id_here` with your actual Client ID from step 3
- Replace `your_client_secret_here` with your actual Client Secret from step 3
- Never commit `.env.local` to git (it should be in `.gitignore`)

### 5. Restart Your Development Server

After adding the environment variables, restart your dev server:

```bash
npm run dev
```

## What the Integration Does

Once set up:

1. **Gmail Integration:**
   - Connects to your Gmail account via OAuth
   - Sends emails directly through Gmail API (instead of opening mailto links)
   - Stores tokens securely in the database

2. **Google Calendar Integration:**
   - Connects to your Google Calendar
   - Reads your calendar events
   - Can create calendar events from the app

## Testing the Connection

1. Go to the **Profile** section in the app
2. Look for "Connect Gmail" and "Connect Calendar" buttons
3. Click them to authorize the app
4. You'll be redirected to Google to sign in and grant permissions
5. Once authorized, you'll be redirected back to the app

## Security Notes

- Your OAuth tokens are stored encrypted in the database
- Tokens are automatically refreshed when they expire
- You can revoke access at any time from your [Google Account Security settings](https://myaccount.google.com/permissions)

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URIs in your Google Cloud Console match exactly what's in your `.env.local` file
- Check that you've added both the calendar and email callback URIs

### "Access blocked" error
- If your app is in testing mode, make sure your email is added as a test user
- Go to OAuth consent screen > Test users > Add users

### Token refresh issues
- Make sure you selected "offline" access type (we handle this automatically)
- The first time you connect, you'll need to approve all requested permissions

## Need Help?

If you run into issues, check:
1. All APIs are enabled in Google Cloud Console
2. OAuth consent screen is configured
3. Redirect URIs match exactly (including http vs https, trailing slashes, etc.)
4. Environment variables are set correctly and the server was restarted


