# Auth0 Setup Guide

This application now uses Auth0 for authentication. Follow these steps to set up Auth0:

## 1. Create an Auth0 Account

- Go to https://auth0.com/
- Sign up for a free account
- Create a new tenant (or use existing one)

## 2. Create an Application in Auth0

1. Navigate to Applications > Applications in Auth0 Dashboard
2. Click "Create Application"
3. Choose application type: **Single Page Application**
4. Name your application (e.g., "Alpaki Planner")
5. Click "Create"

## 3. Configure Application Settings

In the application settings, configure:

### Settings Tab:
- **Name**: Your application name
- **Application Type**: Single Page Application
- **Allowed Callback URLs**: `http://localhost:5173/callback, https://yourdomain.com/callback`
- **Allowed Logout URLs**: `http://localhost:5173, https://yourdomain.com`
- **Allowed Web Origins**: `http://localhost:5173, https://yourdomain.com`

### Keep note of:
- **Domain**: Found at the top of the page (e.g., `your-app.us.auth0.com`)
- **Client ID**: Found in the settings

## 4. Set Environment Variables

Create a `.env` file in the project root:

```env
VITE_AUTH0_DOMAIN=your-app.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id_here
VITE_AUTH0_AUDIENCE=https://your-api.example.com
```

Or add to `.env.development`:

```env
VITE_AUTH0_DOMAIN=your-app.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id_here
```

## 5. Create a Backend Endpoint (Optional but Recommended)

For security, create a backend endpoint `/api/auth/token` that:

1. Receives the authorization code from the frontend
2. Exchanges the code for tokens using Auth0's token endpoint
3. Returns the tokens to the frontend

Example implementation (Node.js):

```javascript
app.post('/api/auth/token', async (req, res) => {
  const { code } = req.body;
  
  try {
    const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.AUTH0_CALLBACK_URL
      })
    });

    const tokens = await tokenResponse.json();
    res.json(tokens);
  } catch (error) {
    res.status(400).json({ error: 'Token exchange failed' });
  }
});
```

## 6. Add Auth0 Callback Route

Make sure your app has a route for the Auth0 callback:

In `App.tsx`, add:
```tsx
<Route path="/callback" element={<CallbackPage />} />
```

## 7. Update User Roles

Currently, the app uses basic roles (plan, gym, platform). You can extend this by:

1. Creating Auth0 Rules or Actions to add custom claims to tokens
2. Updating the User interface to store additional role information from Auth0 metadata

Example Auth0 Action to add roles:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://yourdomain.com';
  api.idToken.setCustomClaim(`${namespace}/roles`, event.user.roles || []);
};
```

## 8. Testing

1. Start your development server
2. Navigate to the login page
3. Click "Login with Auth0"
4. You'll be redirected to Auth0's login page
5. After successful login, you'll be redirected back to `/callback`
6. Finally, you'll be redirected to the appropriate dashboard based on your role

## Frontend Files Modified

- `contexts/AuthContext.tsx` - Auth context with Auth0 integration
- `components/LoginPage.tsx` - Login UI with Auth0 button
- `components/CallbackPage.tsx` - Auth0 callback handler
- `services/auth0Service.ts` - Auth0 service for token management
- `auth0-config.ts` - Auth0 configuration

## Important Security Notes

⚠️ **Never commit secrets to version control**
- Use `.env` files (add to `.gitignore`)
- Use environment variables in production
- Keep `AUTH0_CLIENT_SECRET` on backend only

✅ **Best Practices**
- Implement the backend token exchange endpoint for security
- Use HTTPS in production
- Set appropriate CORS policies
- Regularly rotate client secrets in Auth0

## Troubleshooting

### "Invalid client" error
- Check that VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID are correct
- Verify callback URL is registered in Auth0 dashboard

### "Unauthorized" error
- Check token expiration
- Verify access token scope settings in Auth0

### Callback not working
- Ensure `/callback` route exists in your app
- Check that callback URL matches Auth0 settings
- Check browser console for errors

## Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Auth0 React Integration Guide](https://auth0.com/docs/quickstart/spa/react)
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)
