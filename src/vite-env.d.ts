/* Strongly typed environment variables */
/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_OPENAI_API_KEY: string;
  VITE_STRIPE_PUBLISHABLE_KEY: string;
  VITE_STRIPE_SECRET_KEY: string;
  VITE_STRIPE_CURRENT_PRICE: string;
  VITE_AUTH_CLIENT_ID: string;
  VITE_AUTH_UR: string;
  VITE_API_URL: string;
  VITE_CHATWOOT_WEBSITE_TOKEN: string;
  VITE_HMAC: string;
  VITE_GA: string;
  VITE_AWS_ACCESS_REGION: string;
  VITE_AWS_ACCESS_KEY: string;
  VITE_AWS_SECRET_KEY: string;
  VITE_NOVU_IDENTIFIER: string;
  VITE_NOVU_API_KEY: string;
  VITE_EXPRESS_API_URL: string;
}
