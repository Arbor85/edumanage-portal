<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

2. Create or update the `.env` file with the required values:

   ```dotenv
   # API Configuration
   VITE_API_BASE_URL=                        # Base URL for the main API (e.g., http://localhost:8000/api)
   VITE_API_SECURE_URL=                      # Secure API endpoint URL for authenticated requests
   
   # Platform Portal Configuration
   VITE_PLATFORM_PORTAL_BASE_URL=            # Platform portal base URL (default: https://portal.platform.softwareone.com/public/v1)
   VITE_PLATFORM_PORTAL_TOKEN=               # Authentication token for platform portal access
   
   # Emerald Service Configuration
   VITE_EMERALD_BASE_URL=                    # Emerald service base URL for external integrations
   
   # Partner Center Configuration
   VITE_PARTNER_CENTER_BASE_URL=             # Partner center API URL (default: https://api.partnercenter.microsoft.com)
   
   # OpenAI API Configuration (Optional)
   VITE_OPENAI_API_KEY=                      # OpenAI API key for AI-powered workout suggestions (get from https://platform.openai.com/api-keys)
   ```

3. Run the app:
   `npm run dev`

### Backend Setup

1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Run the backend (in a separate terminal):
   ```bash
   npm run dev:backend
   ```

3. Or run both frontend and backend concurrently:
   ```bash
   npm run dev:all
   ```
