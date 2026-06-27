# 08 — Credentials & Access Vault (REDACTED in repo)

> ⚠️ **Real secret values are intentionally NOT in this repo.** Committing them would be a security risk and GitHub push-protection would block the push. The real values live in:
> - **NotebookLM Chapter 08** (owner-only notebook) — the authoritative private vault.
> - **Vercel** → project `crunchtymebullies` → Settings → Environment Variables (everything the website uses).
> - **Fly secrets** on app `crunchtime-bullies-backend` (`STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, JWT/cookie secrets, Medusa admin creds).
> - `.env.local` locally (gitignored).

This file lists WHAT exists and WHERE to get each, without values.

## Accounts & where to find the secret
| Service | What you need | Where it lives |
|---------|---------------|----------------|
| **GitHub** | repo access / PAT | github.com org `crunchtymebullies`; PAT in NotebookLM Ch08 |
| **Vercel** | team/project access + deploy token | team `christopher-hallman-s-projects`, project `crunchtymebullies`; token in NotebookLM Ch08 |
| **Stripe (LIVE)** | publishable + secret key, webhook secret | Stripe Dashboard; values in NotebookLM Ch08 + Vercel env (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`) + Fly (`STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`) |
| **Medusa** | admin login, publishable key, region id, JWT/cookie secrets, Fly token | `…fly.dev/app`; NotebookLM Ch08 + Fly secrets |
| **Printful** | API key, store id (17795010) | Printful dashboard; NotebookLM Ch08 + Vercel env |
| **Supabase** | URL, anon key, service-role key, mgmt token, DB password | Supabase project `mkhvxjrmxcnnzkctjuyz`; NotebookLM Ch08 + Vercel env |
| **Neon** | `DATABASE_URL` (Medusa DB) | Neon dashboard; NotebookLM Ch08 + Fly secret |
| **Sanity** | project `ic4pnlo7`, dataset `production`, API token, revalidate secret | sanity.io/manage; NotebookLM Ch08 + Vercel env |
| **Resend** | API key, domain id, webhook secret | resend.com; NotebookLM Ch08 + Vercel env |
| **fal.ai** | API key (`FAL_API_KEY`) | fal.ai; NotebookLM Ch08 + Vercel env |
| **Cloudflare** | DNS (shared agency account) | dash.cloudflare.com; NotebookLM Ch08 |
| **IONOS** | registrar / DNS API | ionos.com; NotebookLM Ch08 |
| **Admin dashboard** | `ADMIN_PASSWORD`, super-admin login | NotebookLM Ch08 + Vercel env |

To see env var **names** (not values), see `07-integrations-data.md`. To read the real values, open NotebookLM Chapter 08 or the Vercel/Fly settings.

> Optional: an AES-256 encrypted `handover/crunchtymebullies-credentials.zip` (opaque to GitHub scanning) can be added on request, with the password stored only in the owner's password manager.
