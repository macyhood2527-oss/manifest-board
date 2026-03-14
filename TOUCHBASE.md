# Manifest Board Touchbase

## Today

- Date: `2026-03-14`
- Latest commit: `cc337b4 - Improve mobile crop modal and account settings`
- Current status: `Expanded MVP with PWA, onboarding, celebrations, and optional AI helper`

## What We Completed Today

- Migrated the backend from PocketBase to Supabase
- Set up Supabase auth, database, and storage
- Added `boards` and `manifests` tables through SQL schema
- Confirmed signup and login are working
- Confirmed manifests can be created and edited
- Confirmed image uploads are working
- Fixed the no-image manifest issue so random fallback photos no longer appear
- Cleaned up the repo by removing old PocketBase files
- Added Vercel SPA rewrite support for direct routes like `/settings`
- Improved sidebar spacing and overflow behavior
- Fixed the mobile crop modal so the crop action is reachable on phones
- Added account settings for name, email, and password updates
- Rebranded browser/PWA metadata to `Manifestia`
- Added PWA manifest, icon support, service worker registration, and install prompt handling
- Synced browser/PWA `theme-color` to the selected theme
- Added onboarding for first-time users with starter manifest ideas
- Added celebration moments for new manifests and achieved manifests
- Added route-level code-splitting to reduce the initial JS bundle
- Added an AI manifest helper backed by OpenAI Responses API
- Hid the AI helper UI behind a feature flag until billing is ready
- Added a local Vite dev API path for `/api/manifest-assist` so AI can work without `vercel dev`

## Current App Features

- Email/password authentication
- Multiple boards
- Board cover images
- Theme switching
- Polaroid-style manifest cards
- Add/edit manifests
- Achieved page
- Drag-and-drop manifest ordering
- Image crop before upload
- Mobile-friendly sidebar and layout
- Mobile-friendly manifest form actions and detail actions
- Installable PWA shell with local caching
- Dynamic browser/PWA theme color
- User account settings
- First-run onboarding flow
- Celebration banners for key milestones
- Optional AI manifest drafting and rewrite helper

## Stack Used

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Lucide React

### Backend / Data

- Supabase Auth
- Supabase Postgres
- Supabase Storage

### Tooling

- ESLint
- PostCSS
- Autoprefixer

## Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
VITE_ENABLE_AI_HELPER=false
```

## Important Project Files

- `src/lib/supabase.js`
- `src/lib/boards.js`
- `src/lib/manifests.js`
- `src/context/AuthContext.jsx`
- `src/components/AppShell.jsx`
- `src/components/ImageCropModal.jsx`
- `src/components/ManifestForm.jsx`
- `src/components/CelebrationMoment.jsx`
- `src/components/ManifestCard.jsx`
- `src/lib/onboarding.js`
- `src/lib/pwa.js`
- `server/manifestAssist.js`
- `api/manifest-assist.js`
- `src/pages/BoardPage.jsx`
- `src/pages/SettingsPage.jsx`
- `public/manifest.webmanifest`
- `public/sw.js`
- `supabase/schema.sql`

## Notes / Follow-ups

- If AI is needed later, enable billing on OpenAI, set `OPENAI_API_KEY`, and flip `VITE_ENABLE_AI_HELPER=true`
- Consider adding a proper route-level error boundary for friendlier crash screens
- Consider more technical cleanup around the remaining shared `createLucideIcon` chunk
- Optional next polish:
  - production checklist
  - README/screenshots for portfolio use
  - push latest local changes if they are not on GitHub yet

## Daily Update Template

```md
## YYYY-MM-DD

- Worked on:
- Fixed:
- Tested:
- Blockers:
- Next step:
```
