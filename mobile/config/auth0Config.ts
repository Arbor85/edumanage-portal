// Auth0 Configuration
// Values are read from environment variables (.env file)
// See .env.example for the template

export const AUTH0_CONFIG = {
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN || "YOUR_AUTH0_DOMAIN",
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || "YOUR_AUTH0_CLIENT_ID",
  scheme: "mobile", // Must match the scheme in app.json
  audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE, // Optional: only if you have an API
};

// Social connection identifiers
export const SOCIAL_CONNECTIONS = {
  google: "google-oauth2",
  github: "github",
};
