# Manifest Board

Manifest Board is a cozy React + Vite web app for saving dreams, goals, inspirations, and future plans as visual cards. It uses Supabase for authentication, database storage, and image uploads.

## Stack

- React
- Vite
- Tailwind CSS
- React Router
- Supabase Auth
- Supabase Postgres
- Supabase Storage

## Features

- Email/password signup and login
- Multiple boards
- Theme switching
- Polaroid-style manifest cards
- Board cover images
- Image upload and crop for manifests
- Achieved page for completed dreams
- Drag and reorder cards
- Mobile-friendly sidebar layout

## Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Supabase Setup

1. Create a Supabase project.
2. Disable email confirmation if you want easier MVP testing.
3. Open the SQL Editor.
4. Run `supabase/schema.sql`.

That SQL file creates:

- `boards` table
- `manifests` table
- update timestamp triggers
- row level security policies
- `manifest-images` storage bucket
- `board-covers` storage bucket

## Run Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Project Structure

```text
src/
  app/router
  boards
  components
  context
  lib
  pages
  styles
supabase/
  schema.sql
```

## Notes

- Manifest images are optional.
- Board cover images are optional.
- Themes are saved locally in the browser.
- Selected board and sidebar state are also persisted locally.

## Built By

Melissa Marcelo
