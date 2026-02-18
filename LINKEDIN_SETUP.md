# LinkedIn OAuth Setup Guide

## ✅ Configuration Complete

Your LinkedIn OAuth has been configured with the following credentials:

- **Client ID**: `86osahl2qwesp9`
- **Client Secret**: (use your own from LinkedIn Developer Portal)
- **Redirect URI**: `http://localhost:3000/api/auth/linkedin/callback`

## 🔧 LinkedIn Developer Portal Setup

To complete the setup, you need to configure your LinkedIn Developer App:

### 1. Access LinkedIn Developer Portal
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Sign in with your LinkedIn account
3. Find your app with Client ID: `86osahl2qwesp9`

### 2. Configure Redirect URIs
In your LinkedIn app settings, add the following redirect URIs:

**For Development:**
```
http://localhost:3000/api/auth/linkedin/callback
```

**For Production (when you deploy):**
```
https://your-domain.com/api/auth/linkedin/callback
```

### 3. Request Required Permissions
Make sure your LinkedIn app has the following permissions:

- ✅ **r_liteprofile** - Read basic profile information
- ✅ **r_emailaddress** - Read email address  
- ✅ **w_messaging** - Send messages (if available)
- ✅ **r_network** - Read network information

### 4. Verify App Status
Ensure your LinkedIn app is:
- ✅ **Active** (not in development mode)
- ✅ **Approved** for the required permissions
- ✅ **Published** if you want to use it in production

## 🚀 Testing the Integration

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test LinkedIn OAuth
1. Open your browser to `http://localhost:3000`
2. Complete your profile setup
3. Go to the Connections tab
4. Click "Connect with LinkedIn" or similar button
5. You should be redirected to LinkedIn for authorization

### 3. Expected OAuth Flow
1. User clicks "Connect with LinkedIn"
2. Redirected to LinkedIn authorization page
3. User grants permissions
4. LinkedIn redirects back to: `http://localhost:3000/api/auth/linkedin/callback`
5. App exchanges authorization code for access token
6. User is redirected back to dashboard with LinkedIn connected

## 🔍 Troubleshooting

### Common Issues:

1. **"Invalid redirect_uri"**
   - Verify the redirect URI in LinkedIn Developer Portal matches exactly
   - Check for trailing slashes or HTTP vs HTTPS

2. **"Invalid client_id"**
   - Double-check the Client ID in your `.env.local` file
   - Ensure the app is active in LinkedIn Developer Portal

3. **"Insufficient permissions"**
   - Request the required permissions in LinkedIn Developer Portal
   - Some permissions may require LinkedIn approval

4. **"App not approved"**
   - Some LinkedIn permissions require manual approval
   - Check your app status in the Developer Portal

### Debug Steps:

1. **Check Environment Variables:**
   ```bash
   cat .env.local | grep LINKEDIN
   ```

2. **Test OAuth URL Generation:**
   ```bash
   curl "http://localhost:3000/api/auth/linkedin?userId=test-user"
   ```

3. **Check Application Logs:**
   - Look for errors in the terminal where `npm run dev` is running
   - Check browser developer console for JavaScript errors

## 📱 Production Deployment

When deploying to production:

1. **Update Redirect URIs** in LinkedIn Developer Portal
2. **Update Environment Variables** in your hosting platform
3. **Test OAuth Flow** in production environment
4. **Monitor API Usage** in LinkedIn Developer Portal

## 🔐 Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables in production
- Regularly rotate your Client Secret
- Monitor API usage and rate limits

## 📞 Support

If you encounter issues:

1. Check the [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
2. Review the [LinkedIn Developer Support](https://www.linkedin.com/help/linkedin/answer/a1344233)
3. Check the application logs for specific error messages

---

**Status**: ✅ LinkedIn OAuth configured and ready for testing!
