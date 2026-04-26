/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CARBON_SERVE?: string;
  readonly VITE_ADSENSE_CLIENT?: string;
  readonly VITE_ADSENSE_SLOT_TOOL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
