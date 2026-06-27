# 05 — Admin Dashboard (staff tools)

Everything under `/go` (used on desktop + as installed PWA). Whole area behind a Supabase login; public: `/go/login`, `/go/join/[token]`, `/go/access/[token]`.

## `/go/admin` (`app/go/admin/page.tsx`) tabs
Overview · Dogs (CRUD→Sanity) · Services (CRUD→Sanity) · Store (catalog + Sync Printful) · **Orders** · **Carts** · Payments (Stripe pay links) · Email (→inbox) · Settings (team/invites/email accounts) · Analytics (coming soon).

## Orders manager (`app/go/admin/OrdersPanel.tsx`)
- **Universal search:** order #, name, email, or **card last-4** (across Medusa orders, Supabase carts, Stripe).
- **List:** newest first; payment + fulfillment status; filters All/Paid/Unfulfilled.
- **Detail:** items+thumbnails, customer + account/guest, money breakdown, shipping addr+method, **card on file** (brand+last4+expiry from Stripe), Printful order # + status + cost + open-in-Printful.
- **Actions:** **Refund** (captured payments, via Medusa→Stripe w/ Stripe fallback) or **Release hold** (authorized-only; cancels the hold). Auto-detects which.

## Carts tab
Reads Supabase `checkout_events` (written by the storefront each checkout step). Shows name/email, items+total, stage (Entered info → Shipping → Payment → Declined → Paid), decline reason. **Clear** button wipes the tracking list (safe; not real orders).

## Other /go pages
`/go/login` (Supabase) · `/go/inbox` (+settings) email client · `/go/photos` bulk dog photos · `/go/settings` team mgmt · `/go/access/[token]` magic-link · `/go/join/[token]` onboarding · `/go/design-studio` (Ch06).

## Roles (`lib/roles.ts`)
super_admin (dev) · admin (owner) · employee (only granted email accounts). In Supabase `user_metadata.role` + `employees` table. Invite via Settings → `/go/join/[token]`.

## Auth (dev)
`app/go/layout.tsx` guards the area. API routes use `lib/admin-auth.ts verifyAdmin()` / `lib/require-admin.ts requireEmailAuth()` — accept Supabase session OR `x-admin-password`. No global middleware.
