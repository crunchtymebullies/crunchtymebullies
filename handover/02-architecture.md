# 02 — Architecture & Tech Stack

## Big picture
One **Next.js app** (website + admin + storefront UI) on **Vercel**, talking to specialized services. The store "brain" (**Medusa**) is a **separate** app on **Fly.io**. Everything else is managed cloud (Sanity, Supabase, Stripe, Printful, Resend, fal.ai).

## Repos & paths
- **Website (this repo):** GitHub `crunchtymebullies/crunchtymebullies`, branch `master`. Local `C:\websites\crunchtymebullies\git\`.
- **Medusa backend:** local `C:\websites\crunchtymebullies\medusa-backend\` → Fly app `crunchtime-bullies-backend` (manual deploy).

## Versions
- Next.js **14.2.35** (App Router), React 18.3, TypeScript.
- Sanity 3.57 + next-sanity 9.8; Supabase 2.99 (+ ssr); Stripe (js + react + node); Tailwind; GSAP 3.14; Framer Motion 11; react-konva/konva 9.3; Resend 6.9 + svix + TipTap; sharp.
- Build: `next.config.mjs` ignores TS + ESLint errors (intentional).
- Medusa **v2.13.3**, `@medusajs/payment-stripe` v2.13.3, on Fly region `iad`, 1×shared-CPU/512MB, auto-stop/start. DB: Neon Postgres via `DATABASE_URL`.

## Website ↔ store connection
Browser never calls Medusa directly. `next.config.mjs` rewrites:
- `/api/store/*` → `https://crunchtime-bullies-backend.fly.dev/store/*`
- `/api/auth/*` → `https://crunchtime-bullies-backend.fly.dev/auth/*`
Server code calls Medusa directly.

## Hosting & DNS
- Website: Vercel (team `christopher-hallman-s-projects`, project `crunchtymebullies`), auto-deploy on push to `master`.
- Store: Fly.io (`crunchtime-bullies-backend`).
- Registrar: IONOS (`crunchtymebullies.com`). DNS authority: **Cloudflare** (NS `sharon`/`troy.ns.cloudflare.com`; zone holds A `@`→76.76.21.21, CNAME www, Resend MX/SPF/DKIM/DMARC). Sister domains `.store/.online/.info` still on IONOS, unused.

## Repo structure
```
app/(site)/   public website
app/(store)/  shop / checkout / account
app/go/       staff area (admin, inbox, design-studio, login, photos, settings)
app/api/      server endpoints (store proxy, go/*, order/fulfill, pay, email, cron, design, muse)
app/studio/   embedded Sanity Studio (/studio)
components/   shared UI (+ store/*)
lib/          integration clients + types
medusa-backend/  (separate) Medusa engine
```
Route groups `(site)`/`(store)` give separate layouts (cart/store header vs site nav/footer); crossing them is a full page load (normal).

## Build/deploy gotchas
- Build needs placeholder SUPABASE/SANITY/RESEND vars. Delete `.next/cache` if a local build misbehaves. `canvas` is aliased off. Stray `*.sync-conflict-*` files are harmless.
