/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_SECURE_URL: string;
  readonly VITE_PLATFORM_PORTAL_BASE_URL: string;
  readonly VITE_PLATFORM_PORTAL_TOKEN: string;
  readonly VITE_EMERALD_BASE_URL: string;
  readonly VITE_PARTNER_CENTER_BASE_URL: string;
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_AUDIENCE?: string;
  readonly VITE_OPENAI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
