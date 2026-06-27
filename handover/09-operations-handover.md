# 09 — Operations & Handover

## Common owner tasks
- **Orders:** `/go/admin` → Orders. Search by #, name, email, card last-4. Open → items, customer, card, Printful status.
- **Refund:** order → Payment → **Refund** (amount up to total). Use **Release hold** if only authorized.
- **Fulfillment auto** — keep Printful billing funded.
- **Edit content:** Sanity `/studio` (or Dogs/Services in `/go/admin`; photos `/go/photos`).
- **Add merch:** Design Studio (`/go/design-studio`) or Store tab "Sync Printful".
- **Email:** `/go/inbox`. **Charge directly:** Payments → pay link.

## Deploy
- Website: push to `master` (auto) OR `npx vercel --prod --token <token> --scope christopher-hallman-s-projects --yes`.
- Medusa backend (NOT auto): `cd medusa-backend && flyctl deploy -a crunchtime-bullies-backend --remote-only --depot=false --yes` (FLY_API_TOKEN set). Slow ~15–25m. If build hangs, `flyctl apps destroy fly-builder-... --yes` then redeploy.

## Rotate a key
New key in service → update Vercel env (website) or Fly secrets (Medusa) → redeploy → update NotebookLM Ch08.

## Changing developers / agency
Built by **NexaVision Group**. Grant/transfer: GitHub repo, Vercel project, Fly app, Sanity, Supabase, Stripe, Printful, Resend, fal.ai, Cloudflare, IONOS (Ch08). Give the new dev this notebook + the repo bootstrap (`CLAUDE.md`) + `handover/` docs. Then **rotate** anything the old dev shouldn't keep (esp. super-admin `admin@nexavisiongroup.com`, shared Cloudflare key, API tokens).

## Security checklist
- [ ] NotebookLM shared **owner only** (Ch08 has live secrets).
- [ ] Move Cloudflare zone to a CrunchTime-owned account (currently shared agency account).
- [ ] Rotate GitHub PAT / Vercel / Fly tokens periodically.
- [ ] Keep Printful billing funded.
- [ ] Confirm Stripe live mode + payout bank account.
- [ ] Optionally set `CRON_SECRET` to lock cron endpoints.

## Known issues / pending
- Run one real end-to-end test order (charge → Paid → Printful → refund).
- Dog LoRA not trained (needs 10–20 dog photos).
- VAPID web-push keys have trailing `\n`; push inactive — re-set before enabling.
- 2 embroidery products draft/"needs attention" (need flat-color art).
- Live Printful shipping rates not wired (flat rate). Analytics/Customers tabs are placeholders.

## Backup contact (FILL IN)
- Dev: NexaVision Group — *(email/phone)*.
- Owner: Christopher Hallman *(confirm)* — *(phone)*.
- Backup person w/ account access: *(name + contact)*.
- Master password list location (password manager): *(add)*.
