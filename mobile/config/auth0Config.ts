// OAuth Configuration for Google and GitHub
// Values are read from environment variables (.env file)
// See .env.example for the template

export const OAUTH_CONFIG = {
  scheme: "mobile", // Must match the scheme in app.json
  google: {
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
    // For web clients, you might also need:
    // clientSecret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET,
  },
  github: {
    clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || "",
    clientSecret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET || "",
  },
};

// OAuth endpoints
export const OAUTH_ENDPOINTS = {
  google: {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
    userInfoEndpoint: "https://www.googleapis.com/oauth2/v2/userinfo",
  },
  github: {
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token",
    revocationEndpoint: "https://github.com/settings/connections/applications",
    userInfoEndpoint: "https://api.github.com/user",
  },
};
