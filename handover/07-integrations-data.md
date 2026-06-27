# 07 — Integrations & Data (services, tables, env vars)

Every external service, the databases, and every env var (names + purpose). **Real values are in NotebookLM Ch08 / Vercel env / Fly secrets — not here.**

## Services
Vercel (host website, auto-deploy from `master`) · GitHub (`crunchtymebullies/crunchtymebullies`) · Sanity (CMS `ic4pnlo7`/`production`) · Medusa on Fly (`crunchtime-bullies-backend`) · Stripe (live payments) · Printful (store 17795010) · Supabase (`mkhvxjrmxcnnzkctjuyz`) · Resend (email) · fal.ai (AI) · Cloudflare (DNS) · IONOS (registrar) · Neon (Postgres for Medusa).

## Databases
- **Sanity:** siteSettings, homePage, dog, service, review, blogPost.
- **Supabase tables:** `email_messages`, `email_attachments`, `email_accounts`, `email_contacts`, `employees`, `employee_email_access`, `invitations`, `pay_links`, `checkout_events` (cart funnel + recovery), `designs`, `design_projects` (+versions), `lora_models`, `muse_reels`, `taste_events`.
- **Neon:** the Medusa store DB.

## Email (Resend + Supabase)
Domain verified (send+receive), default sender `info@crunchtymebullies.com`. Inbound: Resend webhook → `app/api/email/inbound/route.ts` → Supabase → `/go/inbox` (~15s, verified by `RESEND_WEBHOOK_SECRET`). Outbound: `/api/email/compose` + `/reply`. Abandoned-cart recovery cron `/api/cron/abandoned-recovery` (3pm).

## Crons (`vercel.json`)
`/api/cron/sweep` (8am, finish stuck Studio jobs) · `/api/cron/abandoned-recovery` (3pm). Daily max on Vercel Hobby.

## Env vars (names; values elsewhere)
- **Sanity:** `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN`/`SANITY_EDITOR_TOKEN`, `SANITY_REVALIDATE_SECRET`.
- **Stripe:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` (website); `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` (Medusa/Fly).
- **Medusa/store:** `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_API_KEY`/`MEDUSA_API_KEY`, `NEXT_PUBLIC_MEDUSA_REGION_ID`, `MEDUSA_ADMIN_EMAIL`/`MEDUSA_ADMIN_PASSWORD`.
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Printful:** `PRINTFUL_API_KEY`, `PRINTFUL_STORE_ID`.
- **Resend:** `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`.
- **fal.ai:** `FAL_API_KEY`.
- **Admin:** `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`/`COOKIE_SECRET`, `CRON_SECRET` (optional).
- **DB/misc:** `DATABASE_URL` (+`_UNPOOLED`), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` (push, not active; ⚠️ trailing `\n`).

## Data flow
Browse (Sanity + Medusa) → cart/checkout via `/api/store/*` proxy → Stripe charges → webhook → Medusa Paid → `/api/order/fulfill` → Printful prints+ships. Staff manage in `/go/admin`. Design Studio → fal.ai → Sanity/Supabase → publish to Medusa.
