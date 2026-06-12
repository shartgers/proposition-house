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

## Testing

### Integration tests (data layer)

Tests run against a real Supabase instance. Add a `.env.test.local` with:

```
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

```bash
npm test              # run all integration tests once
npm run test:watch    # watch mode
```

The suite covers all query and mutation functions: propositions, case library (all filters), offering CRUD, case CRUD, allocation, and auth middleware.

### E2E tests (Playwright)

Requires the dev server running and Supabase credentials in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
# Optional (defaults to e2e@xomnia-test.internal):
E2E_TEST_EMAIL=...
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

First-time setup:

```bash
npx playwright install chromium    # install browser once
```

Run:

```bash
npm run dev &                      # start the app
npm run test:e2e                   # run E2E headlessly
npm run test:e2e:ui                # Playwright UI mode (interactive)
```

The E2E suite covers two golden paths:
1. **Case allocation** — assign an unallocated case to an offering, verify it appears under the offering
2. **Offering deletion** — delete an offering, verify its cases revert to unallocated in the case library

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run test         # run integration tests once
npm run test:watch   # integration tests in watch mode
npm run test:e2e     # Playwright E2E tests (headless)
npm run test:e2e:ui  # Playwright UI mode
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
