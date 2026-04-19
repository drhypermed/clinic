/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/** يتم حقنها عبر Vite `define` من vite.config.ts (تُقرأ من package.json وتاريخ الـ build). */
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
