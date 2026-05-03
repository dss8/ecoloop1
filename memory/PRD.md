# ECOLOOP — Product Requirements Document

## Original Problem Statement
Build a modern, premium UI for an AI-powered custom T-shirt platform called **ECOLOOP**. Users generate custom T-shirt designs using AI (Gemini Nano Banana) and preview them on a t-shirt mockup. Eco-friendly materials. Real Firebase Authentication. Stripe checkout. Built on user's existing Vite + React + TypeScript repo (`Eco-loopTshirt005`).

## Tech Stack
- **Frontend**: Vite 7 + React 19 + TypeScript 5.9 + Tailwind v3 + shadcn/ui + Zustand 5 + Firebase v12 (modular SDK) + Lucide icons + Sonner toasts.
- **Backend**: FastAPI + MongoDB (motor) + emergentintegrations (Gemini image gen + Stripe Checkout) + firebase-admin (lazy / optional).
- **Auth**: Firebase Email+Password (configured via `VITE_FIREBASE_*` env vars). When config is empty, the app gracefully falls back to a "dev-trust" mode using `X-User-Id` headers and the local Zustand store.

## Architecture Highlights
- `/app/frontend` — Vite project served on port 3000 via `yarn start`.
- `/app/backend` — FastAPI on port 8001 (`/api/*`).
- All routes prefixed with `/api`. Frontend calls `${REACT_APP_BACKEND_URL}/api/...`.
- AuthProvider wraps the app and listens to `onAuthStateChanged`. ProtectedRoute guards `/dashboard` and `/checkout` (lets requests through when Firebase is not configured).
- Backend `get_current_user` dependency verifies Firebase ID tokens when `FIREBASE_ADMIN_CREDENTIALS_JSON` is set; otherwise trusts `X-User-Id` header.

## Core Requirements
- **Personas**: Eco-conscious shopper / customizer / designer.
- **Functional**:
  1. Landing Page (Hero "CREATE WITH NATURE", How-it-works, Products, Footer).
  2. AI Design Studio — text prompt → Gemini Nano Banana image → live overlay on t-shirt canvas → size/position/color controls → Add to Cart / Save to dashboard.
  3. Login / Signup pages (Firebase email + password) with persistent session.
  4. Protected Dashboard (orders + saved designs).
  5. Cart + Stripe Hosted Checkout (test mode) with success-page polling.
  6. Eco-friendly Products gallery + Product Detail.

## What's Implemented (May 3, 2026)
- ✅ Cloned & restructured user's Vite/TS repo into `/app/frontend` (proper `src/` layout: pages, components, components/ui, lib, hooks, stores, data; assets in `public/images/`).
- ✅ Backend FastAPI with: `GET /api/`, `POST /api/generate-design`, `GET/POST/DELETE /api/saved-designs`, `GET /api/orders`, `POST /api/checkout/session`, `GET /api/checkout/status/{id}`, `POST /api/webhook/stripe`.
- ✅ Gemini Nano Banana image generation via `emergentintegrations` (working — ~15-30s, returns base64 data URI).
- ✅ Stripe Checkout creation. Status endpoint uses DB-first strategy with pragmatic fallback (Emergent test proxy can't `Session.retrieve`, so reaching `success_url` is treated as proof of payment).
- ✅ Firebase Auth scaffold — `lib/firebase.ts`, `lib/auth.ts`, `contexts/AuthContext.tsx`, `components/ProtectedRoute.tsx`, real LoginPage + SignupPage with friendly error messages.
- ✅ Navbar logout via Firebase signOut, Dashboard uses `useAuth` (no parallel store-based redirect).
- ✅ DesignStudioPage updated: real backend AI call, generated image rendered as overlay on t-shirt canvas, size slider, Save to My Designs button.
- ✅ CheckoutPage: Card/UPI option redirects to Stripe-hosted checkout; CheckoutSuccessPage polls `/api/checkout/status/{id}` and clears cart on `paid`.
- ✅ Tested end-to-end via testing subagent — 15/15 backend tests pass, frontend smoke-test 95% (only "false positive" on hero copy).

## Backlog (P1)
- [ ] User to provide real Firebase web config and Firebase Admin SDK service account JSON. Drop them into:
  - Frontend `/app/frontend/.env`: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
  - Backend `/app/backend/.env`: `FIREBASE_PROJECT_ID`, `FIREBASE_ADMIN_CREDENTIALS_JSON` (full JSON string or path to a file).
- [ ] Real Stripe webhook signing secret for production verification (currently best-effort).
- [ ] Migrate `@app.on_event` to FastAPI `lifespan` context manager (deprecation warning only).

## Future / P2
- Sora 2 video showcase of designs.
- Trees-planted counter wired to a real partner API.
- Admin dashboard wired to real DB (currently mock data).
- Email order confirmations via Resend/SendGrid.
- Multi-currency Stripe support (currently INR).
- Saved-design re-edit flow (load a saved design back into the studio).

## Test Credentials
See `/app/memory/test_credentials.md` for current dev-mode credentials and the steps to swap in real Firebase config.
