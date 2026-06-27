# CrunchTime Bullies — Project Bootstrap (CLAUDE.md)

> Project bootstrap & quick map for developers. The **full owner's manual + technical handover** lives in NotebookLM (id `d3af6fd0-cf33-4888-96b7-2dd9d8cbca42`) and is mirrored, credentials-redacted, in **`handover/01..10.md`**.

## What this is
A Next.js 14 app that is three things at once:
1. **American Bully breeder site** (dogs, services, reviews, blog, contact) — content in **Sanity CMS**.
2. **Live print-on-demand store** — **Medusa** (catalog/cart/orders, on Fly.io) + **Stripe** (live payments) + **Printful** (auto print & ship).
3. **AI Design Studio "MUSE"** (`/go/design-studio`) — generate merch art on **fal.ai** and one-click publish products.

Plus an admin dashboard (`/go/admin`) and an email inbox (`/go/inbox`).

## Repos & hosting
- **This repo (website):** GitHub `crunchtymebullies/crunchtymebullies`, branch **`master`** → auto-deploys to **Vercel** (team `christopher-hallman-s-projects`, project `crunchtymebullies`).
- **Store backend (Medusa):** separate folder `C:\websites\crunchtymebullies\medusa-backend\` → **Fly.io** app `crunchtime-bullies-backend` (manual deploy, NOT auto).
- DNS: **Cloudflare** · Registrar: **IONOS** · DB: **Supabase** (+ **Neon** Postgres for Medusa) · Email: **Resend**.

## Install / dev / deploy
```bash
# website (this repo)
npm install
npm run dev
# build locally (rm cache if it misbehaves)
rm -rf .next/cache && npx next build
# deploy website: push to master (auto) OR:
npx vercel --prod --token <VERCEL_TOKEN> --scope christopher-hallman-s-projects --yes

# store backend (medusa-backend/) — slow (~15-25m), needs FLY_API_TOKEN
flyctl deploy -a crunchtime-bullies-backend --remote-only --depot=false --yes
# if the Fly build hangs at npm ci: flyctl apps destroy fly-builder-<name> --yes ; redeploy (fresh builder)
```

## Where things live
| Area | Path |
|------|------|
| Public site pages | `app/(site)/` |
| Store (shop/checkout/account) | `app/(store)/` |
| Admin + studio | `app/go/` (admin, inbox, design-studio, login, settings, photos) |
| API routes | `app/api/` (store proxy, go/*, order/fulfill, pay, email, cron, design, muse) |
| Store/customer clients | `lib/store-api.ts`, `lib/customer-api.ts` |
| Design Studio brain | `lib/muse.ts`, `lib/design-intelligence.ts` |
| Admin orders UI (refund/release-hold/search/card) | `app/go/admin/OrdersPanel.tsx` |
| Checkout (Stripe) | `app/(store)/shop/checkout/CheckoutFlow.tsx` |
| Fulfillment (→ Printful) | `app/api/order/fulfill/route.ts` |
| Auth/roles | `lib/admin-auth.ts`, `lib/require-admin.ts`, `lib/roles.ts` |
| Config | `next.config.mjs`, `vercel.json`, `medusa-backend/medusa-config.ts` |
| Content (CMS) | Sanity Studio at `/studio`; client `lib/sanity.ts` |

## Conventions & gotchas (READ before changing payments/store)
- **Medusa amounts = decimal dollars; Stripe amounts = cents.**
- Browser → store goes through the `/api/store/*` and `/api/auth/*` **rewrites** (`next.config.mjs`) that proxy to Medusa on Fly. Don't call Fly from the client.
- **Medusa Stripe needs `capture: true` + `webhookSecret`** in `medusa-config.ts`, or orders authorize-but-never-charge. Stripe webhook → `/hooks/payment/stripe_stripe` flips orders to Paid.
- **Fulfillment posts to Printful with `confirm=true`** → auto print+ship. Printful billing must stay funded. Safe because only approved/published products are orderable.
- Shipping: flat **$8.49**, free at **$40+** merchandise (Medusa price rule `item_total >= 40` on the Standard Shipping option).
- Build ignores TS/ESLint errors on purpose (`next.config.mjs`). Build env needs placeholder SUPABASE/SANITY/RESEND vars.
- Overlays/drawers/menus use shared `lib/back-stack.ts` (`useBackClose` / `navAfterClose`) so Android back + links-inside-overlays behave. Reuse it for any new overlay with internal nav.
- **Secrets:** never commit real secrets — GitHub push-protection will block it. Real values live in Vercel env / Fly secrets / NotebookLM Chapter 08. `handover/08` here is REDACTED. `.env.local` is gitignored.

## Known issues / pending
- Run one real end-to-end test order (charge → Paid → Printful order → refund).
- Dog LoRA not trained yet (needs 10–20 dog photos in the Studio Library).
- VAPID web-push keys have a trailing `\n`; push not active — re-set cleanly before enabling.
- 2 embroidery products are draft/"needs attention" (need flat-color art).
- Live Printful shipping rates not wired (flat rate instead). Analytics/Customers admin tabs are placeholders.

## Handover docs
- `handover/README.md` — index of the 10 chapters.
- `handover/01..10.md` — owner manual + tech handover (Chapter 08 redacted; real creds in NotebookLM + Vercel/Fly).
- NotebookLM (full manual): https://notebooklm.google.com/notebook/d3af6fd0-cf33-4888-96b7-2dd9d8cbca42

## Bootstrap JSON
```json
{
  "project": "CrunchTime Bullies",
  "website_repo": "crunchtymebullies/crunchtymebullies (master) → Vercel",
  "store_backend": "C:/websites/crunchtymebullies/medusa-backend → Fly app crunchtime-bullies-backend",
  "stack": ["Next.js 14.2.35","Sanity","Medusa v2.13.3","Stripe live","Printful","Supabase","Resend","fal.ai"],
  "live": {"site":"https://crunchtymebullies.com","admin":"https://crunchtymebullies.com/go/admin","studio":"https://crunchtymebullies.com/studio","store_admin":"https://crunchtime-bullies-backend.fly.dev/app"},
  "handover_notebook_id": "d3af6fd0-cf33-4888-96b7-2dd9d8cbca42",
  "credentials": "NotebookLM Chapter 08 (real) / Vercel env + Fly secrets; repo handover/08 is redacted"
}
```
