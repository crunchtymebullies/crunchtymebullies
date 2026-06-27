# 10 — Developer Handoff

For a future developer taking over. Everything you need is this `handover/` folder, the repo bootstrap (`../CLAUDE.md`), and the full **NotebookLM** manual (deep-dive chapters 11–16 with finite operational detail).

## Where to start
1. Read `../CLAUDE.md` (project map, deploy commands, conventions, gotchas).
2. Read `handover/01..09` here (overview manual; Chapter 08 credentials are **redacted** — real values live in the NotebookLM Chapter 08 + Vercel env + Fly secrets).
3. Read the **NotebookLM** deep dives (11–16) for exhaustive per-subsystem detail and step-by-step admin flows.

## Access needed (see Chapter 08 for credentials)
GitHub repo `crunchtymebullies/crunchtymebullies`; Vercel (team `christopher-hallman-s-projects`, project `crunchtymebullies`); Fly.io app `crunchtime-bullies-backend`; plus Sanity, Supabase, Stripe, Printful, Resend, fal.ai, Cloudflare, IONOS.

## Deploy
- **Website:** push to GitHub `master` (auto-deploys on Vercel) or `npx vercel --prod --token <token> --scope christopher-hallman-s-projects --yes`.
- **Store backend (Medusa):** does NOT auto-deploy. From `medusa-backend/`: `flyctl deploy -a crunchtime-bullies-backend --remote-only --depot=false --yes` (with `FLY_API_TOKEN` set). Slow (~15–25 min). If the build hangs at `npm ci`, destroy the wedged builder app (`flyctl apps destroy fly-builder-... --yes`) and redeploy.

## Project facts (quick reference)
```json
{
  "project": "CrunchTime Bullies",
  "website_repo": "crunchtymebullies/crunchtymebullies (master) -> Vercel team christopher-hallman-s-projects",
  "store_backend": "C:/websites/crunchtymebullies/medusa-backend -> Fly app crunchtime-bullies-backend",
  "stack": ["Next.js 14.2.35","Sanity","Medusa v2.13.3","Stripe live","Printful","Supabase","Resend","fal.ai"],
  "live": {"site":"https://crunchtymebullies.com","admin":"/go/admin","studio":"/studio","store_admin":"https://crunchtime-bullies-backend.fly.dev/app"},
  "manual_notebook_id": "d3af6fd0-cf33-4888-96b7-2dd9d8cbca42",
  "credentials": "NotebookLM Chapter 08 (real) / Vercel env + Fly secrets; repo handover/08 redacted",
  "key_files": {
    "store_api":"lib/store-api.ts","customer_api":"lib/customer-api.ts",
    "design_studio_brain":"lib/muse.ts + lib/design-intelligence.ts",
    "admin_orders_ui":"app/go/admin/OrdersPanel.tsx",
    "checkout":"app/(store)/shop/checkout/CheckoutFlow.tsx",
    "fulfillment":"app/api/order/fulfill/route.ts",
    "auth":"lib/admin-auth.ts + lib/require-admin.ts + lib/roles.ts",
    "config":"next.config.mjs + vercel.json + medusa-backend/medusa-config.ts"
  }
}
```

## Must-know conventions
- Medusa amounts are **decimal dollars**; Stripe amounts are **cents**.
- The browser talks to the store via the `/api/store/*` and `/api/auth/*` rewrites (proxy to Medusa) — don't call Fly directly from the client.
- Medusa Stripe needs **`capture: true` + `webhookSecret`** (in `medusa-config.ts`) or orders authorize-but-never-charge.
- Printful fulfillment uses **`confirm=true`** (auto print/ship). Products must be published before they're orderable.
- The build ignores TypeScript/ESLint errors on purpose; clear `.next/cache` if a local build misbehaves.
- Overlays/drawers use the shared `lib/back-stack.ts` (`useBackClose` / `navAfterClose`) — reuse it for any new overlay with internal navigation.
- Never commit real secrets (push-protection will block it). Keep secrets in Vercel env / Fly secrets / NotebookLM Chapter 08.

## "Done" = a new developer can read the manual, open the repo, deploy the website and (if needed) the Medusa backend, find any credential, and operate the store (orders, refunds, fulfillment, content).
