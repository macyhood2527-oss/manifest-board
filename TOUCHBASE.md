# Manifest Board Touchbase

## Today

- Date: `2026-03-14`
- Latest commit: `893a067 - Migrate backend to Supabase`
- Current status: `Working MVP`

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
```

## Important Project Files

- `src/lib/supabase.js`
- `src/lib/boards.js`
- `src/lib/manifests.js`
- `src/context/AuthContext.jsx`
- `src/components/AppShell.jsx`
- `src/components/ManifestCard.jsx`
- `src/pages/BoardPage.jsx`
- `src/pages/SettingsPage.jsx`
- `supabase/schema.sql`

## Notes / Follow-ups

- Test the live Vercel deployment after the latest redeploy
- Confirm direct links like `/settings` no longer return `404`
- Optional next polish:
  - more sidebar spacing refinement
  - production checklist
  - README/screenshots for portfolio use

## Daily Update Template

```md
## YYYY-MM-DD

- Worked on:
- Fixed:
- Tested:
- Blockers:
- Next step:
```
