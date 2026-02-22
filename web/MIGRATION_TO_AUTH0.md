# Migration Guide: From Mock Auth to Auth0

## What Changed

### Authentication Flow
- **Before**: Mock authentication (any username + password "admin")
- **After**: Real Auth0 authentication with OIDC

### Login Page
- **Before**: Username and password form
- **After**: Role selector with Auth0 redirect button

### User Model
- **Before**: `{ username: string, role: UserRole }`
- **After**: `{ username: string, email: string, role: UserRole, sub?: string, picture?: string }`

### Auth Context
- **Before**: `login(username, password, role)` method
- **After**: `login(role)` method that redirects to Auth0

## Required Setup Steps

### 1. Auth0 Account
- Visit https://auth0.com/
- Create free account
- Create new application (Single Page Application)
- Note Domain and Client ID

### 2. Environment Variables
Create `.env` file in project root:
```env
VITE_AUTH0_DOMAIN=your-app.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id_here
```

### 3. Auth0 Configuration
In Auth0 Dashboard:
- Add callback URL: `http://localhost:5173/callback`
- Add logout URL: `http://localhost:5173`
- Add web origin: `http://localhost:5173`

### 4. Backend Token Endpoint
Create endpoint `/api/auth/token` that exchanges code for tokens

See `AUTH0_SETUP.md` for detailed implementation

### 5. Update App Routes
In `App.tsx`, ensure callback route exists:
```tsx
<Route path="/callback" element={<CallbackPage />} />
```

## Code Migration

### If Using useAuth Hook

**Before:**
```tsx
const { user, login, logout } = useAuth();

const handleLogin = async () => {
  await login(username, password, role);
};
```

**After:**
```tsx
const { user, login, logout, isAuthenticated } = useAuth();

const handleLogin = () => {
  login(role);
};
```

### If Checking User
**Before:**
```tsx
if (user) {
  // User is logged in
}
```

**After:**
```tsx
if (isAuthenticated && user) {
  // User is logged in
}
```

### If Using Logout
**Before:**
```tsx
const handleLogout = () => {
  logout();
  navigate('/login');
};
```

**After:**
```tsx
const handleLogout = () => {
  logout(); // Automatically redirects to Auth0 logout
};
```

### If Using Access Token
**New capability:**
```tsx
import { auth0Service } from '../services/auth0Service';

const token = auth0Service.getAccessToken();
fetch('/api/resource', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Testing Checklist

- [ ] Auth0 account created
- [ ] Application created in Auth0
- [ ] Environment variables set (.env file)
- [ ] Callback route added to App.tsx
- [ ] Test login page loads
- [ ] Test "Login with Auth0" button redirects properly
- [ ] Test Auth0 login success and redirect back
- [ ] Test user data populated correctly
- [ ] Test logout functionality
- [ ] Test browser refresh maintains session
- [ ] Test callback error handling

## Rollback (if needed)

To revert to mock authentication:
1. Restore previous `AuthContext.tsx`
2. Restore previous `LoginPage.tsx`
3. Remove `CallbackPage.tsx`, `auth0Service.ts`, `auth0-config.ts`
4. Update `App.tsx` to remove callback route

## Common Issues

### "Cannot find module" errors
- Run `npm install` if dependencies changed
- Check import paths are correct
- Verify all new files are created

### Blank page after login
- Check `/callback` route exists in App.tsx
- Check environment variables are set
- Check browser console for errors
- Verify Auth0 application settings

### Token exchange failed
- Verify backend `/api/auth/token` endpoint exists
- Check Auth0 credentials in environment variables
- Enable CORS for authentication requests
- Check network tab for request/response

### Session not persisting
- Check localStorage is enabled in browser
- Verify Auth0 domain and client ID are correct
- Check browser developer tools for auth0_session
- Test in private/incognito mode

## Benefits of Auth0

✅ Professional authentication system
✅ Support for passwordless, social, and MFA login
✅ User management and identity dashboard
✅ Compliance with security standards (OWASP, SOC2)
✅ Scale without managing infrastructure
✅ Built-in analytics and monitoring
✅ Flexible customization with Actions and Rules

## Support

- Auth0 Documentation: https://auth0.com/docs
- Auth0 Support: https://support.auth0.com/
- Community Forums: https://auth0.community/

## Questions?

Refer to:
1. `AUTH0_SETUP.md` - Setup guide
2. `AUTH0_IMPLEMENTATION.md` - Implementation details
3. Browser console for error messages
4. Auth0 Dashboard logs for authentication issues
