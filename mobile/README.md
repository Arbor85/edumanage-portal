# EduManage Mobile App 📚

An Expo-based mobile application with Google and GitHub OAuth authentication.

## Prerequisites

- Node.js (v18+)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app (for testing on device)
- Google Cloud Console account (for Google sign-in)
- GitHub account (for GitHub sign-in)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure OAuth Providers

#### Quick Start

1. **Copy environment template:**

   ```bash
   cp .env.example .env
   ```

2. **Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID (Web application type)
   - Copy Client ID to `.env`

3. **Set up GitHub OAuth:**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create New OAuth App
   - Copy Client ID and Client Secret to `.env`

4. **Update `.env` with your credentials:**

   ```env
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
   EXPO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
   EXPO_PUBLIC_GITHUB_CLIENT_SECRET=your_github_client_secret_here
   ```

5. **Configure redirect URIs:**
   - Run `npm start` and note the redirect URI in the console
   - Add it to both Google and GitHub OAuth app settings

> **📖 Detailed Setup:** See [OAUTH_SETUP.md](OAUTH_SETUP.md) for complete step-by-step instructions.

> **🔒 Security:** The `.env` file is in `.gitignore`. Never commit credentials!

### 3. Start the App

```bash
npm start
```

Then choose your platform:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web
- Press `j` for Expo Go on device (scan QR code)

## Project Structure

```
app/
├── (auth)/              # Authentication stack (login screen)
│   ├── _layout.tsx
│   └── index.tsx        # Login screen with Google/GitHub buttons
├── (tabs)/              # Main app stack
│   ├── _layout.tsx
│   ├── index.tsx        # Home screen
│   ├── explore.tsx      # Explore screen
│   └── profile.tsx      # User profile & settings
└── _layout.tsx          # Root navigation

components/
├── Button.tsx           # Reusable button component
└── ...other components

config/
└── auth0Config.ts       # OAuth configuration (reads from .env)

context/
└── AuthContext.tsx      # Authentication provider & hooks
```

## Features

✅ **Google OAuth** - Sign in with your Google account  
✅ **GitHub OAuth** - Sign in with your GitHub account  
✅ **Token Management** - Secure token storage with expo-secure-store  
✅ **Profile Screen** - View user info and sign out  
✅ **Dark Mode Support** - Fully themed components  
✅ **Environment Variables** - Secure credential management  
✅ **Expo Go Compatible** - Works in Expo Go for easy development

## Available Scripts

```bash
# Start development server
npm start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser

# Lint code
npm lint

# Reset project (dangerous - clears app directory)
npm run reset-project
```

## Authentication Flow

1. User opens app
2. App checks for stored authentication token
3. If no token → Show login screen
4. User clicks "Sign in with Google" or "Sign in with GitHub"
5. Browser opens OAuth provider's login page
6. User authenticates with Google or GitHub
7. OAuth provider redirects back to app with authorization code
8. App exchanges code for access token
9. Token stored securely in expo-secure-store
10. User profile fetched from provider
11. User sees main app (tabs)
12. User can sign out from Profile tab

## Using Auth Hooks

In any component, use the `useAuth` hook:

```typescript
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  );
}
```

## Troubleshooting

### "Cannot resolve expo-secure-store"

Clear cache and restart:

```bash
npm start -- --clear
```

### "AsyncStorageError: Native module is null"

This is handled gracefully on web. For native platforms, expo-secure-store is used automatically.

### "Invalid redirect URI" or "redirect_uri_mismatch"

1. Run `npm start` and check console for the redirect URI
2. Add that exact URI to:
   - Google Cloud Console → OAuth Client → Authorized redirect URIs
   - GitHub OAuth App → Authorization callback URL
3. Common formats:
   - Development: `exp://192.168.1.x:8081`
   - Expo Go: `https://auth.expo.io/@your-username/mobile`
   - Production: `mobile://callback`

### "OAuth login fails"

- Verify credentials in `.env` file
- Check redirect URIs match exactly
- Review console logs for specific errors
- Ensure OAuth apps are configured correctly
- For Google: Add your account as a test user in OAuth consent screen
- For GitHub: Verify client secret is correct

### User profile shows "User" / "user@example.com"

- Check console for API errors
- Verify OAuth scopes are correct
- Ensure access token is valid

### Setup Guide

For detailed OAuth setup instructions, see [OAUTH_SETUP.md](OAUTH_SETUP.md)

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [React Navigation](https://reactnavigation.org/)
- [Expo Router](https://docs.expo.dev/routing/introduction/)

## Support

For issues or questions:

1. Check [OAUTH_SETUP.md](OAUTH_SETUP.md) for detailed setup
2. Review error messages in the terminal and console
3. Verify OAuth app configurations in Google Cloud Console and GitHub
4. Check redirect URIs match exactly
5. Consult [Expo documentation](https://docs.expo.dev)

---

**Created with Expo & React Native** ⚛️
