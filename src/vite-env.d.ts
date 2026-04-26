/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CARBON_SERVE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
