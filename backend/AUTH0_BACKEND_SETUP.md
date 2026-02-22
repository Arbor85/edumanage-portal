# Backend Auth0 Token Exchange Setup

This document explains how to set up the backend Auth0 token exchange endpoint.

## Overview

The `/api/auth/token` endpoint securely exchanges Auth0 authorization codes for access tokens. This is important for security because:

1. **Keeps client secret safe** - `AUTH0_CLIENT_SECRET` never leaves the backend
2. **Validates authorization codes** - Prevents frontend from using invalid/expired codes
3. **Adds extra security layer** - Backend can add additional validation

## File Structure

```
backend/
├── app/
│   ├── auth.py           # Auth0 routes and token exchange logic (NEW)
│   ├── main.py           # Updated to include auth routes
│   ├── __init__.py
│   ├── db.py
│   ├── models.py
│   └── schemas.py
├── requirements.txt      # Updated with httpx and python-dotenv
├── .env.example          # Environment variables template (NEW)
├── .env                  # Your actual credentials (CREATE THIS)
└── run-backend.bat
```

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

Or if you're using the provided batch file:

```bash
run-backend.bat
```

This will:
- Install all dependencies including `httpx` (for async HTTP) and `python-dotenv` (for env vars)
- Start the backend server

## Step 2: Get Auth0 Credentials

1. Go to https://manage.auth0.com/
2. Navigate to **Applications > Applications**
3. Select your application
4. Copy the following from the settings:
   - **Domain** (e.g., `your-app.us.auth0.com`)
   - **Client ID** (e.g., `abc123xyz`)
   - **Client Secret** (don't share this!)

## Step 3: Create Backend .env File

In the `backend/` directory, create a `.env` file:

```bash
# backend/.env
AUTH0_DOMAIN=your-app.us.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_very_secret_key_here
AUTH0_CALLBACK_URL=http://localhost:5173/callback
```

For production:
```bash
AUTH0_CALLBACK_URL=https://yourdomain.com/callback
```

⚠️ **IMPORTANT**: Add `.env` to `.gitignore` - never commit secrets!

```bash
# backend/.gitignore
.env
.env.local
```

## Step 4: Verify Setup

Start the backend and check the health endpoint:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

Then check health:
```bash
curl http://localhost:8000/api/auth/health
```

Expected response (if configured):
```json
{
  "status": "healthy",
  "auth0_domain": "your-app.us.auth0.com",
  "message": "Auth0 service is configured and ready"
}
```

## Step 5: Frontend Configuration

Make sure your frontend `.env` file has:

```bash
# Frontend .env
VITE_AUTH0_DOMAIN=your-app.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id_here
```

🔑 Note: Frontend only needs DOMAIN and CLIENT_ID (no secret)
🔐 Backend has CLIENT_SECRET (never expose to frontend)

## How It Works

```
Frontend                          Backend                           Auth0
   |                               |                                 |
   |-- Click "Login"               |                                 |
   |                               |                                 |
   |-- Redirect to Auth0 ----------|------- (no backend involved)---|
   |                               |                                 |
   |<-- Callback with code --------|------- (from Auth0)            |
   |                               |                                 |
   |-- POST /api/auth/token -------|                                 |
   |    { code: "auth0_code" }     |                                 |
   |                               |-- POST /oauth/token ----------->|
   |                               |  (includes client_secret)       |
   |                               |                                 |
   |                               |<-- { access_token, ... } -------|
   |                               |                                 |
   |<-- { access_token, ... } -----|                                 |
   |                               |                                 |
```

## API Endpoints

### POST /api/auth/token

Exchange authorization code for access token.

**Request:**
```json
{
  "code": "auth0_authorization_code_here"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Error Response (400):**
```json
{
  "detail": "Authorization code is required"
}
```

**Error Response (500):**
```json
{
  "detail": "Missing Auth0 environment variables: AUTH0_DOMAIN, AUTH0_CLIENT_SECRET"
}
```

### GET /api/auth/health

Check if Auth0 is configured.

**Success Response (200):**
```json
{
  "status": "healthy",
  "auth0_domain": "your-app.us.auth0.com",
  "message": "Auth0 service is configured and ready"
}
```

**Error Response (200 with error status):**
```json
{
  "status": "unhealthy",
  "error": "Missing Auth0 environment variables: AUTH0_CLIENT_SECRET"
}
```

## Frontend Integration

The frontend already calls this endpoint in `services/auth0Service.ts`:

```typescript
const response = await fetch('/api/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ code })
});
```

No changes needed on frontend - it just works!

## Error Handling

### Missing Environment Variables

If `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, or `AUTH0_CLIENT_SECRET` are missing:

```json
{
  "detail": "Missing Auth0 environment variables: AUTH0_DOMAIN, AUTH0_CLIENT_SECRET"
}
```

**Solution**: Set all variables in `.env` file

### Invalid Authorization Code

If the code is expired or invalid:

```json
{
  "detail": "Auth0 token exchange failed: Invalid authorization code"
}
```

**Solution**: User should login again to get a fresh code

### CORS Error

If backend is not allowing requests from frontend:

```
Access to XMLHttpRequest at 'http://localhost:8000/api/auth/token' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**: The backend CORS already includes `http://localhost:5173`, but if you change the frontend URL, update CORS in `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "your-new-url"],
    ...
)
```

## Security Best Practices

✅ **Do This:**
- Store `AUTH0_CLIENT_SECRET` only on backend in `.env`
- Use HTTPS in production
- Add `.env` to `.gitignore`
- Rotate secrets regularly in Auth0 dashboard
- Validate authorization codes on backend
- Use appropriate CORS policies

❌ **Don't Do This:**
- Commit `.env` file to git
- Expose `CLIENT_SECRET` in frontend code
- Use `CLIENT_SECRET` in environment variables exposed to browser
- Allow CORS from untrusted origins
- Log sensitive tokens

## Debugging

### Enable logging

Add debug logging to see what's happening:

```python
# In backend/app/auth.py, add:
import logging

logger = logging.getLogger(__name__)

# In _exchange_auth0_code():
logger.debug(f"Exchanging code for domain: {auth0_config.domain}")
logger.debug(f"Using callback URL: {auth0_config.callback_url}")
```

### Test the endpoint manually

```bash
curl -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code"}'
```

### Check Auth0 logs

1. Go to Auth0 Dashboard
2. Click on **Logs**
3. Look for failed token exchange attempts
4. Check error reasons

## Production Deployment

When deploying to production:

1. **Update environment variables** on your server:
   ```bash
   AUTH0_DOMAIN=prod.auth0.com
   AUTH0_CLIENT_ID=prod_client_id
   AUTH0_CLIENT_SECRET=prod_secret
   AUTH0_CALLBACK_URL=https://yourdomain.com/callback
   ```

2. **Update CORS** in `backend/app/main.py`:
   ```python
   allow_origins=["https://yourdomain.com"]
   ```

3. **Use HTTPS** for all endpoints

4. **Enable Auth0 Custom Domain** (optional but recommended):
   - Provides white-label authentication
   - Better branding
   - Higher trust

## Troubleshooting Checklist

- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created in `backend/` directory
- [ ] All Auth0 variables set: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend can reach backend (check CORS)
- [ ] Auth0 credential are correct (copy-paste from Auth0 dashboard)
- [ ] `/api/auth/health` returns `"status": "healthy"`
- [ ] Application in Auth0 shows correct Callback URL
- [ ] `.env` is in `.gitignore`

## Additional Resources

- [Auth0 Python Documentation](https://auth0.com/docs)
- [FastAPI CORS Documentation](https://fastapi.tiangolo.com/tutorial/cors/)
- [HTTPX Async Client](https://www.python-httpx.org/)
- [Auth0 Token Exchange Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow)

## Summary

✅ Backend token exchange endpoint created
✅ Secure client secret handling implemented
✅ CORS configured for frontend communication
✅ Error handling for Auth0 failures
✅ Health check endpoint for verification
✅ Environment-based configuration

Next steps:
1. Create `.env` in `backend/` with Auth0 credentials
2. Install dependencies: `pip install -r requirements.txt`
3. Start backend: `python -m uvicorn app.main:app --reload`
4. Test: `curl http://localhost:8000/api/auth/health`
5. Login from frontend - should redirect properly!
