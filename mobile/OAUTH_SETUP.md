# Google & GitHub OAuth Setup Guide

This guide walks you through setting up Google and GitHub OAuth for your EduManage mobile app.

## 📋 Prerequisites

- Google Cloud Console account
- GitHub account
- Expo CLI installed

---

## 🔧 Step 1: Set Up Google OAuth

### 1.1 Create Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in app name: "EduManage"
   - Add your email as support email
   - Add scopes: `openid`, `profile`, `email`
   - Save and continue

### 1.2 Configure OAuth Client

1. For Application type, select:
   - **Web application** (for both web and Expo Go)
2. Add Authorized redirect URIs:
   - For Expo Go development: `https://auth.expo.io/@YOUR_EXPO_USERNAME/mobile`
   - For web: `http://localhost:8081`
   - For production: Your actual redirect URI (will be logged in console when you run the app)
3. Click **Create**
4. Copy your **Client ID** (you'll need this for `.env`)

**Note:** You may also need to create separate OAuth clients for iOS and Android in production with platform-specific redirect URIs.

---

## 🐙 Step 2: Set Up GitHub OAuth

### 2.1 Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the application details:
   - **Application name**: EduManage Mobile
   - **Homepage URL**: `https://your-app-url.com` (or any URL for development)
   - **Authorization callback URL**:
     - For development: `exp://localhost:8081` or the URI logged in your console
     - For Expo Go: `https://auth.expo.io/@YOUR_EXPO_USERNAME/mobile`
4. Click **Register application**

### 2.2 Get Credentials

1. On the OAuth app page, note your **Client ID**
2. Click **Generate a new client secret**
3. Copy the **Client Secret** immediately (it won't be shown again)

---

## 🛠️ Step 3: Configure Your App

### 3.1 Update Environment Variables

1. Open your `.env` file (or create it from `.env.example`)
2. Add your credentials:

```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# GitHub OAuth
EXPO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
EXPO_PUBLIC_GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### 3.2 Update Redirect URIs

1. Start your app: `npm start`
2. Look for console logs showing the redirect URI
3. Copy that URI and add it to:
   - Google Cloud Console → Your OAuth Client → Authorized redirect URIs
   - GitHub OAuth App Settings → Authorization callback URL

Example redirect URIs:

- Development: `exp://192.168.1.5:8081` (your local IP)
- Expo Go: `https://auth.expo.io/@your-username/mobile`
- Production: `mobile://callback` (configured in app.json)

---

## 🚀 Step 4: Test Authentication

1. Clear cache and restart:

   ```bash
   npm start -- --clear
   ```

2. Open the app on your device or simulator

3. Click **Sign in with Google** or **Sign in with GitHub**

4. Complete the OAuth flow in the browser

5. You should be redirected back and logged in

---

## 🔍 Troubleshooting

### "Invalid redirect URI" Error

**Solution:** Make sure the redirect URI in your OAuth app settings exactly matches the one logged in your console.

For development:

- Use the URI that's printed in the terminal when you run `npm start`
- It usually looks like `exp://192.168.1.x:8081` for local development

### Google OAuth shows "Access Blocked"

**Solution:**

1. Go to OAuth consent screen in Google Cloud Console
2. Add your Google account as a test user
3. Or publish the OAuth consent screen (requires verification for production)

### GitHub OAuth "redirect_uri_mismatch"

**Solution:**

1. Check your GitHub OAuth app settings
2. Make sure the Authorization callback URL matches exactly
3. Include the protocol (`exp://` or `https://`)

### User profile not loading

**Solution:**

- Check console logs for specific errors
- Verify scopes are correct (`openid profile email` for Google, `read:user user:email` for GitHub)
- Make sure tokens are being stored correctly

---

## 📱 Platform-Specific Setup

### iOS (Production)

1. Create a Google OAuth client for **iOS** application type
2. Add your iOS bundle identifier
3. Update redirect URI to use custom URL scheme from app.json

### Android (Production)

1. Create a Google OAuth client for **Android** application type
2. Add your package name and SHA-1 certificate fingerprint
3. Get SHA-1 by running: `keytool -list -v -keystore ~/.android/debug.keystore`

### Web

1. Use the **Web application** client type in Google Cloud Console
2. Add `http://localhost:8081` and your production domain to authorized origins

---

## 🔐 Security Best Practices

- **Never commit** `.env` file to git (it's in `.gitignore`)
- **Rotate secrets** if they're accidentally exposed
- **Use different OAuth apps** for development and production
- **Enable 2FA** on your Google and GitHub accounts
- **Review OAuth scopes** - only request what you need
- **Monitor OAuth usage** in Google Cloud Console and GitHub settings

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)

---

## 🆘 Need Help?

1. Check the console logs for specific error messages
2. Verify all redirect URIs match exactly
3. Ensure OAuth apps are set to "External" (Google) or "Public" (GitHub)
4. Try clearing app data and cache
5. Review Google Cloud Console and GitHub audit logs

---

**Created with Expo & React Native** ⚛️
