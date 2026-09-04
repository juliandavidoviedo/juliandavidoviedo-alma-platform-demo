/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'demo' (default, in-memory mocks) | 'pilot' (Netlify Function -> Apps Script -> Sheets/Drive). */
  readonly VITE_APP_MODE?: 'demo' | 'pilot';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
