export interface HermesRuntimeEnv {
  API_BASE_URL?: string;
  CORS_ORIGIN?: string;
}

declare global {
  interface Window {
    __HERMES_ENV__?: HermesRuntimeEnv;
  }
}

const runtime = (typeof window !== 'undefined' ? window.__HERMES_ENV__ : undefined) ?? {};

export const environment = {
  production: false,
  apiBaseUrl: runtime.API_BASE_URL ?? 'http://localhost:8080',
  corsOrigin: runtime.CORS_ORIGIN ?? 'http://localhost:4200'
};
