
# Copilot & AI Agent Instructions for edumanage-portal

## Architecture Overview
- **Monorepo** with four main apps:
  - `backend/`: FastAPI (Python) for fitness/training APIs, SQLite DB (auto-migrated), OpenAPI docs at `/docs`.
  - `web/`: React + Vite, main frontend, integrates with Auth0 (see `auth0-config.ts`, `services/auth0Service.ts`), OpenAI (see `services/chatgptService.ts`), and other APIs.
  - `web-vue/`: Vue 3 + Vite, alternative frontend, Auth0 integration in `src/auth/`.
  - `mobile/`: Expo/React Native, navigation via `expo-router`, screens/services in `app/`.

## Developer Workflows
- **Backend**:
  - Setup: `cd backend && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt`
  - Run: `uvicorn app.main:app --reload` (API at http://127.0.0.1:8000)
  - DB: SQLite by default, override with `DATABASE_URL` env var.
- **Web**:
  - Setup: `npm install` in `web/`
  - Run: `npm run dev` (see `.env` for API URLs and tokens)
  - Backend proxy: `npm run dev:backend` or both: `npm run dev:all`
- **web-vue**:
  - Setup: `npm install` in `web-vue/`
  - Run: `npm run dev`
  - Type-check: `npm run lint` and `npm run build`
- **Mobile**:
  - Setup: `npm install` in `mobile/`
  - Run: `npx expo start`

## Key Conventions & Patterns
- **API URLs**: All frontends use `.env` or `.env.*` for API endpoints/secrets. Never hardcode URLs.
- **Auth0**: Centralized config in `auth0-config.ts` (web) and `src/auth/` (web-vue). Use `services/auth0Service.ts` for all auth logic (login, logout, token, user info). See `AUTH0_IMPLEMENTATION.md` and `AUTH0_SETUP.md` for details and troubleshooting.
- **Service Layer**: Place API logic in `/services/` (web) or `src/services/` (web-vue). Example: `chatgptService.ts` for OpenAI, `menteesService.ts` for mentee APIs.
- **Component Structure**: Pages in `/components/pages/` or `/components/fitnes/` (web), `/src/` (web-vue), `/app/` (mobile).
- **AI Integration**: For AI suggest features, see `CHATGPT_INTEGRATION_GUIDE.md` and `components/pages/fitnes/ExerciseSetsList.tsx`. Use `AISuggestButton` and follow handler patterns described in the guide.
- **TypeScript**: Use `vue-tsc` for `.vue` type-checking in web-vue. Prefer Volar over Vetur.
- **Testing**: No explicit test runner; follow framework defaults if adding tests.

## Integration Points
- **External APIs**: Platform Portal, Emerald, Partner Center, OpenAI (see `.env` and `/services/`).
- **Auth0**: All authentication flows use Auth0. Backend `/api/auth/token` endpoint is required for secure token exchange (see `AUTH0_SETUP.md`).
- **Database**: SQLite by default, auto-migrated by FastAPI backend.

## Examples & Patterns
- **Add API endpoint**: Edit `backend/app/main.py` and update OpenAPI docs.
- **Add frontend page**: Add to `web/components/pages/` or `web-vue/src/`.
- **Add service**: Add to `web/services/` or `web-vue/src/services/`.
- **Integrate AI Suggest**: See `CHATGPT_INTEGRATION_GUIDE.md` for step-by-step usage in workout components.
- **Auth0 usage**: Use `auth0Service.ts` methods for login, logout, token, and user info. See `AUTH0_IMPLEMENTATION.md` for code samples and troubleshooting.

## References
- Each app's `README.md` for more details and up-to-date commands.
- For environment variables, always check `.env` files in each app directory.
- Adding new variable to .env update README.md and this file with instructions on usage and where to add it in the codebase.
- For Auth0 and AI integration, see `AUTH0_IMPLEMENTATION.md`, `AUTH0_SETUP.md`, and `CHATGPT_INTEGRATION_GUIDE.md` in `web/`.

---
For questions, review the relevant `README.md` or ask a maintainer. Update this file if major conventions change.
