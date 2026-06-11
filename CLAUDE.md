# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server with Turbopack at localhost:3000
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier (writes in place)
```

Local Supabase (requires Docker):
```bash
pnpm supabase start      # Start local stack
pnpm supabase stop       # Stop local stack
pnpm supabase db reset   # Reset DB and apply seeds from supabase/seed.sql
```

## Environment

Copy `.env.example` to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Architecture

Next.js 15 App Router project using TypeScript, Tailwind CSS v4, Shadcn UI, and Supabase.

### Supabase client split

Two distinct clients — use the right one or auth/cookies will break:

- `lib/supabase/client.ts` — browser client (`createBrowserClient`). Use inside `"use client"` components.
- `lib/supabase/server.ts` — async server client (`createServerClient`). Use in Server Components, Route Handlers, and Server Actions. Reads/writes cookies via `next/headers` to maintain the user session.

### UI components

Shadcn UI components live in `components/ui/` and are owned source files (not node_modules). Add new ones with:
```bash
pnpm dlx shadcn-ui@latest add <component-name>
```

Use the `cn()` helper from `lib/utils.ts` (wraps `clsx` + `tailwind-merge`) whenever conditionally applying Tailwind classes.

### Theming

Tailwind v4 uses CSS-variable-based theming via `@theme {}` blocks in `app/globals.css` — there is no `tailwind.config.js`. Customize colors, fonts, and radii there.

### Server Actions

Place server actions in the `actions/` directory (currently empty).

### Local Supabase

`supabase/config.toml` configures the local stack: API on port 54321, DB on 54322, Studio on 54323. The project ID is `next-shadcn-tailwind-supabase`. Seeds go in `supabase/seed.sql`.
