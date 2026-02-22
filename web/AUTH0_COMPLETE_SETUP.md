# Auth0 Complete Setup Checklist

This checklist guides you through the complete Auth0 integration from start to finish.

## Phase 1: Auth0 Account Setup

- [ ] **Create Auth0 Account**
  - Visit https://auth0.com/
  - Sign up for free account
  - Verify email

- [ ] **Create Application in Auth0**
  - Login to Auth0 Dashboard
  - Go to **Applications > Applications**
  - Click **Create Application**
  - Choose **Single Page Application**
  - Name: "Alpaki Planner"
  - Click **Create**

- [ ] **Copy Auth0 Credentials**
  - Copy **Domain** (e.g., `your-app.us.auth0.com`)
  - Copy **Client ID** (e.g., `abc123xyz`)
  - Keep these for later steps

- [ ] **Configure Application Settings**
  - In Auth0 Dashboard, go to your application settings
  - **Allowed Callback URLs**: `http://localhost:5173/callback, https://yourdomain.com/callback`
  - **Allowed Logout URLs**: `http://localhost:5173, https://yourdomain.com`
  - **Allowed Web Origins**: `http://localhost:5173, https://yourdomain.com`
  - **Click Save**

## Phase 2: Backend Setup

- [ ] **Get Client Secret**
  - Go back to Auth0 application settings
  - Scroll down to find **Client Secret**
  - Copy it (you won't see it again!)

- [ ] **Create Backend .env File**
  - In `backend/` directory, create `.env` file
  - Add these variables:
    ```bash
    AUTH0_DOMAIN=your-app.us.auth0.com
    AUTH0_CLIENT_ID=your_client_id_here
    AUTH0_CLIENT_SECRET=your_client_secret_here
    AUTH0_CALLBACK_URL=http://localhost:5173/callback
    ```
  - Replace with actual values from Auth0

- [ ] **Add .env to .gitignore**
  - In `backend/.gitignore`, add `.env`
  - Make sure secrets are never committed

- [ ] **Install Backend Dependencies**
  - Open terminal in `backend/` folder
  - Run: `pip install -r requirements.txt`
  - Wait for installation to complete

- [ ] **Verify Backend Setup**
  - Start backend: `python -m uvicorn app.main:app --reload`
  - Test health endpoint: `curl http://localhost:8000/api/auth/health`
  - Should return: `{"status": "healthy", "auth0_domain": "...", ...}`

## Phase 3: Frontend Setup

- [ ] **Create Frontend .env File**
  - In project root (same level as `App.tsx`), create `.env` file
  - Add these variables:
    ```bash
    VITE_AUTH0_DOMAIN=your-app.us.auth0.com
    VITE_AUTH0_CLIENT_ID=your_client_id_here
    ```
  - Replace with actual values

- [ ] **Add .env to .gitignore**
  - Make sure `.env` is in `.gitignore`
  - Verify it's not tracked by git

- [ ] **Verify Frontend .env**
  - Check that these files exist:
    - `c:\....\edumanage-university-portal\.env` ✓
    - `c:\....\edumanage-university-portal\auth0-config.ts` ✓
    - `c:\....\edumanage-university-portal\services\auth0Service.ts` ✓
    - `c:\....\edumanage-university-portal\components\CallbackPage.tsx` ✓

## Phase 4: Auth0 Roles Configuration (Optional but Recommended)

- [ ] **Create Auth0 Roles**
  - Go to Auth0 Dashboard
  - **User Management > Roles**
  - Click **Create Role**
  - Create these roles:
    - Name: `plan`, Description: "Training plan access"
    - Name: `gym`, Description: "Fitness features"
    - Name: `platform`, Description: "Subscriptions & admin"

- [ ] **Create Post-Login Action**
  - Go to **Actions > Flows > Login**
  - Click **Add Action > Create New Action**
  - Trigger: `Post-Login`
  - Name: `Add Roles to Userinfo`
  - Code: (see [AUTH0_ROLES_SETUP.md](../AUTH0_ROLES_SETUP.md))
  - Save and Deploy

- [ ] **Assign Roles to Users**
  - Go to **User Management > Users**
  - Click on a user
  - **Roles tab > Assign Roles**
  - Select role (plan, gym, or platform)
  - Save

## Phase 5: Testing

- [ ] **Start Development Environment**
  - Terminal 1: Backend
    ```bash
    cd backend
    python -m uvicorn app.main:app --reload
    ```
  - Terminal 2: Frontend
    ```bash
    npm run dev
    ```

- [ ] **Test Login Flow**
  - Navigate to `http://localhost:5173`
  - You should see the login page (no role dropdown!)
  - Click **Login with Auth0**
  - You should be redirected to Auth0 login
  - Enter your Auth0 credentials
  - You should be redirected back to the app
  - Check browser DevTools:
    - **Application > Local Storage**
    - Look for `auth0_session`
    - Verify it contains `user` with `email`, `sub`, `roles`

- [ ] **Test Role-Based Access**
  - If assigned `plan` role → Redirects to `/rooms`
  - If assigned `gym` role → Redirects to `/alerts`
  - If assigned `platform` role → Redirects to `/platform/subscription-history`

- [ ] **Test Logout**
  - Click logout button
  - Should redirect to Auth0 logout
  - Then redirect back to login page
  - LocalStorage `auth0_session` should be cleared

- [ ] **Test Browser Refresh**
  - While logged in, press F5 to refresh
  - Should maintain session (not go back to login)
  - User data should be restored from localStorage

- [ ] **Test Callback Error Handling**
  - Manually visit `http://localhost:5173/callback?error=access_denied`
  - Should show error message
  - Should redirect to login after 3 seconds

## Phase 6: Production Deployment

- [ ] **Update Auth0 Settings for Production**
  - Application settings in Auth0:
    - Add production URL to **Allowed Callback URLs**
    - Add production URL to **Allowed Logout URLs**
    - Add production URL to **Allowed Web Origins**

- [ ] **Update Environment Variables on Server**
  ```bash
  AUTH0_DOMAIN=your-app.us.auth0.com
  AUTH0_CLIENT_ID=prod_client_id
  AUTH0_CLIENT_SECRET=prod_secret
  AUTH0_CALLBACK_URL=https://yourdomain.com/callback
  VITE_AUTH0_DOMAIN=your-app.us.auth0.com
  VITE_AUTH0_CLIENT_ID=prod_client_id
  ```

- [ ] **Enable HTTPS**
  - Get SSL certificate (Let's Encrypt recommended)
  - Configure backend for HTTPS
  - Configure frontend for HTTPS

- [ ] **Update CORS Settings**
  - Backend: Change allow_origins from localhost to production domain
  - Frontend: Update API_BASE_URL to production URL

## Verification Files & Locations

### Frontend Changes
- [ ] `auth0-config.ts` - Auth0 configuration
- [ ] `services/auth0Service.ts` - Token management service
- [ ] `components/CallbackPage.tsx` - OAuth callback handler
- [ ] `contexts/AuthContext.tsx` - Auth context (updated)
- [ ] `components/LoginPage.tsx` - Login form (updated, no dropdown)
- [ ] `App.tsx` - Callback route added
- [ ] `.env` - Environment variables (create this)

### Backend Changes
- [ ] `app/auth.py` - Token exchange endpoint (NEW)
- [ ] `app/main.py` - Auth routes included (updated)
- [ ] `requirements.txt` - Dependencies (updated with httpx)
- [ ] `.env` - Environment variables (create this)
- [ ] `.gitignore` - Includes .env

### Documentation Files
- [ ] `AUTH0_SETUP.md` - Frontend setup guide
- [ ] `AUTH0_ROLES_SETUP.md` - Role configuration guide
- [ ] `AUTH0_IMPLEMENTATION.md` - Implementation details
- [ ] `MIGRATION_TO_AUTH0.md` - Migration from mock auth
- [ ] `backend/AUTH0_BACKEND_SETUP.md` - Backend setup guide (NEW)

## Troubleshooting

### Login redirects to login page again
- [ ] Check `/callback` route exists in App.tsx
- [ ] Check browser console for errors
- [ ] Check `Auth0_CALLBACK_URL` in Auth0 dashboard matches code
- [ ] Verify backend `/api/auth/health` returns healthy

### "Cannot find environment variables" error
- [ ] Create `.env` file in correct location
- [ ] Use exact variable names (case-sensitive)
- [ ] Restart dev server after creating `.env`

### Backend `/api/auth/token` returns 500 error
- [ ] Check `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` are set
- [ ] Verify backend `requirements.txt` is installed
- [ ] Check backend console for error details

### CORS error when calling `/api/auth/token`
- [ ] Verify frontend URL is in CORS allow_origins in main.py
- [ ] Default includes `http://localhost:5173`
- [ ] If using different port, update main.py

### Role not determined/showing as "plan"
- [ ] Verify role is assigned to user in Auth0 dashboard
- [ ] Check Post-Login Action is deployed
- [ ] Logout and login again
- [ ] Check browser localStorage `auth0_session` for roles

### Auth0 credentials invalid
- [ ] Double-check credentials copied from Auth0 (don't add quotes)
- [ ] Make sure using Client Secret, not Client ID
- [ ] Try creating a new application in Auth0
- [ ] Check Auth0 logs for failed attempts

## Quick Reference

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/token` | POST | Exchange code for access token |
| `/api/auth/health` | GET | Verify Auth0 configuration |
| `/callback` | GET | Handle Auth0 OAuth callback |
| `/login` | GET | Login page |

### Environment Variables

| Variable | Location | Required | Example |
|----------|----------|----------|---------|
| `VITE_AUTH0_DOMAIN` | Frontend `.env` | Yes | `your-app.us.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | Frontend `.env` | Yes | `abc123xyz` |
| `AUTH0_DOMAIN` | Backend `.env` | Yes | `your-app.us.auth0.com` |
| `AUTH0_CLIENT_ID` | Backend `.env` | Yes | `abc123xyz` |
| `AUTH0_CLIENT_SECRET` | Backend `.env` | Yes | `secret_key_here` |
| `AUTH0_CALLBACK_URL` | Backend `.env` | No (defaults to localhost) | `https://yourdomain.com/callback` |

### Key Links

- [Auth0 Dashboard](https://manage.auth0.com/)
- [Auth0 Documentation](https://auth0.com/docs)
- [Frontend Setup Guide](./AUTH0_SETUP.md)
- [Backend Setup Guide](./backend/AUTH0_BACKEND_SETUP.md)
- [Role Configuration Guide](./AUTH0_ROLES_SETUP.md)
- [API Documentation](./AUTH0_IMPLEMENTATION.md)

## Summary

✅ Complete Auth0 integration with:
- Secure backend token exchange
- Frontend OAuth login
- Role-based access control
- Session persistence
- Comprehensive error handling

🎉 Next Step: Follow the checklist above to configure Auth0!

For questions, refer to the detailed setup guides in:
- `AUTH0_SETUP.md` (frontend)
- `backend/AUTH0_BACKEND_SETUP.md` (backend)
- `AUTH0_ROLES_SETUP.md` (roles)
