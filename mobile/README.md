# EduManage Mobile App 📚

An Expo-based mobile application with Auth0 authentication supporting Google and GitHub login.

## Prerequisites

- Node.js (v18+)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app (for testing on device)
- Auth0 account (free tier available at https://auth0.com)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Auth0

#### Step A: Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Create a new Native application
3. Note your **Domain** and **Client ID**

#### Step B: Enable Social Connections

1. Go to **Connections** → **Social**
2. Enable **Google** and **GitHub**
3. Configure your credentials (optional - Auth0 provides defaults)

#### Step C: Configure Redirect URLs

In your Auth0 app settings, add:

- **Allowed Callback URLs**: `mobile://callback`
- **Allowed Logout URLs**: `mobile://`
- **Allowed Web Origins**: `http://localhost:*, https://localhost:*`

#### Step D: Set Environment Variables

Copy the `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then update `.env` with your Auth0 credentials:

```env
EXPO_PUBLIC_AUTH0_DOMAIN=your-app.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=your_client_id_here
EXPO_PUBLIC_AUTH0_AUDIENCE=https://your-api.example.com
```

> **Note**: The `.env` file is ignored by git. Keep your credentials secure!

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
└── auth0Config.ts       # Auth0 configuration (reads from .env)

context/
└── AuthContext.tsx      # Authentication provider & hooks
```

## Features

✅ **Auth0 Integration** - Secure OAuth/OIDC authentication  
✅ **Social Login** - Google and GitHub shortcuts  
✅ **Token Management** - Secure token storage with expo-secure-store  
✅ **Profile Screen** - View user info and sign out  
✅ **Dark Mode Support** - Fully themed components  
✅ **Environment Variables** - Secure credential management

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
5. Browser opens Auth0 login page
6. User authenticates with their provider
7. Redirected back to app with access token
8. Token stored securely
9. User sees main app (tabs)
10. User can sign out from Profile tab

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

This is handled gracefully - the app will fall back to mock storage. For full functionality:

1. Rebuild the native modules: `expo prebuild`
2. Or use Expo Go which includes all native modules

### "Auth0 login fails"

- Verify your Auth0 domain and Client ID in `.env`
- Check that callback URLs match in Auth0 dashboard
- Ensure social connections are enabled
- Check browser console for specific errors

### Setup Guide

For detailed Auth0 setup instructions, see [AUTH0_SETUP.md](AUTH0_SETUP.md)

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Auth0 Documentation](https://auth0.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [Expo Router](https://docs.expo.dev/routing/introduction/)

## Support

For issues or questions:

1. Check [AUTH0_SETUP.md](AUTH0_SETUP.md) for detailed setup
2. Review error messages in the terminal
3. Check Auth0 Dashboard for configuration issues
4. Consult [Expo documentation](https://docs.expo.dev)

---

**Created with Expo & React Native** ⚛️
