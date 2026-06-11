# Soft Focus Design System

Calm, minimal, premium UI extracted from FluidSpecs. Teal primary, aqua muted tones, soft shadows, and generous whitespace.

## Color palette (light mode)

| Token | HSL | Hex approx | Usage |
| --- | --- | --- | --- |
| `--background` | `0 0% 98%` | #F9F9F9 | Page background |
| `--foreground` | `200 10% 10%` | — | Body text |
| `--primary` | `193 45% 22%` | #1F4951 | Buttons, links, focus ring |
| `--secondary` | `189 33% 65%` | #82C0CC | Secondary buttons, accents |
| `--muted` | `195 70% 92%` | #DDF4F9 | Subtle backgrounds, icon wells |
| `--accent` | `0 0% 92%` | #EBEBEB | Sidebar, hover surfaces |
| `--border` | `0 0% 92%` | #EBEBEB | Dividers, input borders |

Dark mode inverts to cool zinc surfaces with vibrant indigo primary (`239 84% 67%`).

## Typography

- **Headings**: Outfit, weight 600, letter-spacing -0.02em
- **Body**: DM Sans, weight 400–500
- Scale: h1 4xl→5xl, h2 3xl→4xl, h3 2xl→3xl, h4 xl→2xl

## Spacing

| Token | Value | Utility |
| --- | --- | --- |
| tight | 8px | `gap-tight`, `p-tight` |
| comfortable | 24px | `gap-comfortable`, `p-comfortable` |
| spacious | 32px | `gap-spacious`, `p-spacious` |
| compact | 6px | `p-compact`, `gap-compact` |
| section-sm/md/lg | 64/96/128px | `section-spacing-*` |

## Border radius

Base `--radius: 1rem`. Derived: `rounded-sm` (−8px), `rounded-md` (−4px), `rounded-lg` (base), `rounded-xl` (+4px).

## Shadows

- `shadow-soft` — default cards
- `shadow-soft-lg` — hover lift, elevated panels
- `shadow-soft-xl` — modals (via theme token)

## Layout patterns

```tsx
// Marketing page width
<div className="container-soft">...</div>

// App page full width between sidebars
<div className="container-soft-full">...</div>

// Vertical stack with design-system gap
<div className="layout-stack gap-comfortable">...</div>

// Section vertical rhythm
<section className="section-padding">...</section>
```

## Component conventions

- **Buttons**: `rounded-md`, primary teal fill, focus ring `--ring`
- **Cards**: white surface, `shadow-xs` or `shadow-soft`, optional `hover-lift`
- **Inputs**: `border-input`, focus ring primary
- **Sidebar**: `bg-accent`, active item `bg-background/80`
- **Public header**: fixed, `backdrop-blur-sm`, `border-border`

## Post-login dashboard

Authenticated pages use `AppShell` with:

- **Sidebar**: `bg-accent`, create-project action, up to 4 recent projects, collapsible width (`w-64` / `w-14`)
- **Profile footer**: rounded card with avatar, plan label, upgrade CTA (free tier), dropdown menu
- **Main content**: `container-soft-full py-4` — full width between sidebar and edge
- **Project grid**: `md:grid-cols-2 lg:grid-cols-3`, cards with progress bar and Open/Delete actions
- **Empty state**: dashed border, centered copy, primary CTA
- **Loading**: `Skeleton` placeholders in grid layout

```tsx
<AppShell
  brandName="Your App"
  sidebarProjects={projects}
  user={user}
  onCreateProject={() => setDialogOpen(true)}
>
  <div className="container-soft-full py-4">
    <h1 className="font-heading text-lg font-semibold">Your Projects</h1>
    <ProjectList projects={projects} onDelete={handleDelete} />
  </div>
</AppShell>
```

## Files to customize first

1. `app/globals.css` — `:root` color variables
2. `app/layout.tsx` — fonts
3. `components/layout/SiteHeader.tsx` — nav links
4. `components/layout/SiteFooter.tsx` — footer columns
