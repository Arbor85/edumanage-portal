# Auth0 Integration Guide

This guide walks you through setting up Auth0 authentication with Google and GitHub social login shortcuts for your EduManage mobile app.

## 📋 Prerequisites

- Auth0 account (free tier available at https://auth0.com)
- Google OAuth credentials (optional for Google login)
- GitHub OAuth credentials (optional for GitHub login)

---

## 🔧 Step 1: Create an Auth0 Account and Application

### 1.1 Sign Up for Auth0

1. Go to [https://auth0.com](https://auth0.com)
2. Click **Sign Up** and create a new account
3. Choose your region and create your tenant

### 1.2 Create a New Application

1. In Auth0 Dashboard, go to **Applications** → **Applications**
2. Click **Create Application**
3. Enter your app name: "EduManage Mobile"
4. Select application type: **Native**
5. Click **Create**

### 1.3 Get Your Credentials

On the application settings page, note down:

- **Domain**: e.g., `your-app.us.auth0.com`
- **Client ID**: Long alphanumeric string

---

## 🔗 Step 2: Add Redirect URLs

Your app needs to handle OAuth callbacks. Configure these in Auth0:

### 2.1 Configure Allowed Callback URLs

1. In your Auth0 app settings, find **Allowed Callback URLs**
2. Add the following redirect URI:
   ```
   mobile://callback
   ```

### 2.2 Configure Allowed Logout URLs

1. Find **Allowed Logout URLs**
2. Add:
   ```
   mobile://
   ```

### 2.3 Configure Allowed Web Origins

1. Find **Allowed Web Origins**
2. Add:
   ```
   http://localhost:*, https://localhost:*
   ```

---

## 🌐 Step 3: Enable Social Connections

### 3.1 Enable Google OAuth

1. In Auth0 Dashboard, go to **Connections** → **Social**
2. Click on **Google** to enable it
3. For custom credentials (optional):
   - Go to https://console.cloud.google.com
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Get Client ID and Client Secret
   - Add them in Auth0 Google connection settings

### 3.2 Enable GitHub OAuth

1. In Auth0 Dashboard, go to **Connections** → **Social**
2. Click on **GitHub** to enable it
3. For custom credentials (optional):
   - Go to https://github.com/settings/developers
   - Click **New OAuth App**
   - Fill in application details
   - Set Authorization callback URL: `https://YOUR_DOMAIN/login/callback`
   - Get Client ID and Client Secret
   - Add them in Auth0 GitHub connection settings

---

## 🛠️ Step 4: Configure Your App

### 4.1 Update Auth0 Configuration

Edit `config/auth0Config.ts`:

```typescript
export const AUTH0_CONFIG = {
  domain: "YOUR_AUTH0_DOMAIN", // e.g., 'your-app.us.auth0.com'
  clientId: "YOUR_AUTH0_CLIENT_ID",
  scheme: "mobile", // From app.json
  audience: "YOUR_API_AUDIENCE", // Optional if you have an API
};
```

### 4.2 Update app.json

Ensure your `app.json` has the correct scheme:

```json
{
  "expo": {
    "scheme": "mobile",
    ...
  }
}
```

---

## 🔐 Step 5: Implement Auth0 OIDC Flow (Backend Integration)

The current implementation uses a mock OAuth flow. For production, implement the actual Auth0 OIDC code flow:

### 5.1 Install Auth0 SDK

```bash
npm install auth0-react-native-sdk
```

### 5.2 Update AuthContext.tsx

Replace the `performOAuthLogin` function with actual Auth0 implementation:

```typescript
import { Auth0 } from "auth0-react-native-sdk";

async function performOAuthLogin(
  connection: string,
  isSignup: boolean = false,
) {
  const auth0 = Auth0({
    domain: AUTH0_CONFIG.domain,
    clientId: AUTH0_CONFIG.clientId,
  });

  try {
    const credentials = await auth0.webAuth.authorize(
      {
        scope: "openid profile email",
        audience: AUTH0_CONFIG.audience,
        connection: connection,
      },
      {
        customScheme: AUTH0_CONFIG.scheme,
      },
    );

    // credentials.accessToken, credentials.idToken, credentials.user

    return {
      accessToken: credentials.accessToken,
      user: credentials.user,
    };
  } catch (error) {
    console.error("Auth0 login error:", error);
    throw error;
  }
}
```

---

## 🎨 Step 6: Customize the Login Screen

The login screen is located at `app/(auth)/index.tsx`. You can customize:

- **Colors**: Update button colors in the `styles` object
- **Text**: Modify welcome messages and labels
- **Icons**: Replace emoji with actual icons using `@expo/vector-icons`
- **Layout**: Adjust spacing and padding values

### Example: Using Vector Icons

```typescript
import { FontAwesome6, AntDesign } from '@expo/vector-icons';

// In buttons, replace emojis with:
<FontAwesome6 name="google" size={20} color="#fff" />
<AntDesign name="github" size={20} color="#fff" />
```

---

## 🧪 Testing Login Flow

1. Start your app:

   ```bash
   npm run start
   ```

2. Select platform (ios/android/web)

3. You should see the login screen with Google and GitHub buttons

4. Click **Sign in with Google** or **Sign in with GitHub**

5. Complete the OAuth flow in your browser

6. You should be redirected back and logged in

---

## 🔍 Troubleshooting

### "Failed to sign in" Error

- Verify your Auth0 domain and Client ID in `config/auth0Config.ts`
- Check that callback URLs are configured correctly in Auth0
- Ensure social connections are enabled for your app

### Redirect Loop

- Check that your `app.json` scheme matches the Auth0 config
- Verify callback URLs include the correct scheme (`mobile://callback`)

### "Connection not enabled"

- Go to Auth0 Dashboard → **Applications** → Your App → **Connections**
- Enable the Google and GitHub connections
- Make sure the connections are enabled globally in **Connections** → **Social**

### CORS Issues

- Add your app URL to **Allowed Web Origins** in Auth0 settings
- For local development, add `http://localhost:*`

---

## 📚 Additional Resources

- [Auth0 React Native SDK](https://auth0.com/docs/libraries/auth0-react-native)
- [Auth0 Social Connections](https://auth0.com/docs/connections/social)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Auth0 Dashboard](https://manage.auth0.com)

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Use environment variables for Auth0 credentials
- [ ] Enable automatic token refresh
- [ ] Implement logout with Auth0 endpoint
- [ ] Add error logging and monitoring
- [ ] Test on actual iOS and Android devices
- [ ] Implement PKCE flow for enhanced security
- [ ] Add user profile management
- [ ] Set up authentication state persistence
- [ ] Configure HTTPS for all endpoints

---

## 📝 Environment Variables

Create a `.env` file (add to `.gitignore`):

```
EXPO_PUBLIC_AUTH0_DOMAIN=your_domain.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=your_client_id
EXPO_PUBLIC_API_AUDIENCE=https://your-api.com
```

Then update `config/auth0Config.ts`:

```typescript
export const AUTH0_CONFIG = {
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID!,
  scheme: "mobile",
  audience: process.env.EXPO_PUBLIC_API_AUDIENCE,
};
```
