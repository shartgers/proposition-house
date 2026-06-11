# Soft Focus Design Boilerplate

Portable styling and layout starter extracted from FluidSpecs. Use it to spin up a new Next.js app with the same calm, premium look — teal palette, soft shadows, generous spacing, and shadcn/ui components.

## What's included

| Area | Files |
| --- | --- |
| Design tokens | `app/globals.css` — CSS variables, Tailwind v4 `@theme`, utilities |
| Typography | Outfit (headings) + DM Sans (body) via `next/font/google` |
| UI primitives | `components/ui/*` — Button, Card, Input, Progress, Dialog, Sonner, etc. |
| **Post-login dashboard** | `AppShell`, `UserProfileMenu`, `ProjectCard`, `ProjectList`, `CreateProjectDialog` |
| Marketing layout | `SiteHeader`, `SiteFooter`, hero/features/CTA sections |
| Reference | `/styleguide` — live token and component gallery |
| Docs | `DESIGN-SYSTEM.md` — colors, spacing, typography, patterns |

## Quick start (standalone)

```bash
cd design-boilerplate
npm install
npm run dev
```

**Start here for the authenticated experience:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

Also available: landing (`/`), styleguide (`/styleguide`).

## Post-login dashboard (primary focus)

The `/dashboard` route demonstrates the full authenticated UI:

- Collapsible sidebar with **Create project**, recent projects, and **user profile card**
- Project grid with **progress bars**, empty state, and loading skeletons
- Create/delete project flows with toasts
- Mobile drawer navigation

Key files to copy into a new app:

```
components/layout/AppShell.tsx
components/layout/UserProfileMenu.tsx
components/dashboard/*
lib/demo/projects.ts          # replace with your API types
app/dashboard/page.tsx
```

## Copy into an existing Next.js project

1. Copy these folders/files into your project root:
   - `app/globals.css` → merge or replace your global CSS
   - `components/ui/`, `components/layout/`, `components/dashboard/`
   - `lib/utils.ts`
   - `components.json`, `postcss.config.mjs`
2. Install dependencies:

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react sonner \
  @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-progress
```

3. Add fonts to your root `app/layout.tsx`:

```tsx
import { Outfit, DM_Sans } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

// On <html>: className={`${outfit.variable} ${dmSans.variable}`}
```

4. Import `./globals.css` in layout and add `<Toaster />` from `@/components/ui/sonner`.
5. Wire your auth redirect to `/dashboard` after login.

## Customization

- **Brand name / nav links**: edit `components/layout/SiteHeader.tsx` and `SiteFooter.tsx`
- **Dashboard sidebar**: edit `components/layout/AppShell.tsx`
- **Project cards**: edit `components/dashboard/ProjectCard.tsx`
- **Colors**: change CSS variables in `:root` inside `app/globals.css`
- **Mock data**: replace `lib/demo/projects.ts` with real API hooks

## Stack

- Next.js 16 (App Router)
- Tailwind CSS v4 (`@import "tailwindcss"`)
- shadcn/ui patterns (Radix + CVA)
- TypeScript
