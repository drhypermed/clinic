# Dr Hyper Clinic

Arabic-language (RTL) PWA for clinic management, prescriptions, and pediatric dose support. React 19 + TypeScript + Vite, Firebase backend (Auth, Firestore, Storage, Messaging, Functions).

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — readiness lint + large-file audit
- `npm run test` — vitest (unit)
- `npm run test:e2e` — Playwright
- `npm run verify` — typecheck + lint + test + build (run before declaring done)

## Layout

- `App.tsx`, `index.tsx` — entry
- `app/` — feature areas (`drug-catalog`, `legal`)
- `components/` — UI grouped by domain (admin, appointments, consultation, prescription, secretary, …)
- `services/` — Firebase, Gemini, messaging, security, monitoring service modules
- `contexts/`, `hooks/`, `utils/`, `types.ts`
- `drugs/` — per-group drug data, code-split via Vite `manualChunks` (`drug-<group>`)
- `functions/` — Firebase Cloud Functions
- `firestore.rules`, `firestore.indexes.json`, `storage.rules`, `firebase.json`
- `scripts/` — readiness/size lints, load tests
- `tests/` — Playwright e2e

## Path aliases (vite.config.ts)

- `@/types` → `types.ts`
- `@/constants` → `app/drug-catalog/constants.ts`
- `@/categoryIndicationKeywords` → `app/drug-catalog/categoryIndicationKeywords.ts`
- `@/…` → repo root

## Notes

- PWA via `vite-plugin-pwa`; custom `firebase-messaging-sw.js` is imported into the workbox SW.
- Build target `safari13`; manual chunking splits drug data, firebase sub-SDKs, react, and `@google/genai`.
- Manifest is RTL/Arabic (`lang: 'ar'`, `dir: 'rtl'`).
- Working dir path contains Arabic characters and spaces — always quote in shell commands.
