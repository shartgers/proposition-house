# Proposition House

Internal dashboard for Xomnia's service portfolio. Organises the five propositions, their offerings, and the 99 client cases that evidence them.

## What it does

- Shows all five propositions (Clear Direction, Agentic Solutions, Intelligent Workflows, Data Foundation, Trusted AI) with their offerings and case counts
- Requires Google SSO login — only Xomnia Google Workspace accounts are accepted
- Backed by Supabase (Postgres + auth)

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Supabase** — Postgres database + Google OAuth via Supabase Auth
- **Tailwind CSS v4** + **shadcn/ui** components
- **Vitest** for tests

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project with Google OAuth configured (see `docs/adr/0001-google-sso.md`)

### Environment variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to login on first visit.

## Database

```bash
npm run db:push          # apply schema migrations via Supabase CLI
npm run db:seed          # seed base data (propositions, practices)
npm run db:seed-offerings  # seed offerings
```

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run test         # run tests once
npm run test:watch   # run tests in watch mode
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
```

## Project layout

```
src/
  app/            # Next.js App Router pages and API routes
  components/     # React components (dashboard, UI primitives)
  lib/
    db/           # Supabase query helpers and TypeScript types
    supabase/     # Supabase client factories (browser + server)
    mock-data.ts  # Temporary mock data (will be replaced by DB queries)
  tests/          # Vitest tests
input/
  xomnia_use_cases.md   # Source of truth: 99 client cases
docs/
  adr/            # Architecture decisions
  agents/         # Agent and issue-tracker conventions
```

## Domain

See `CLAUDE.md` for the full domain model: proposition definitions, proof levels, sector list, and recurring clients.
