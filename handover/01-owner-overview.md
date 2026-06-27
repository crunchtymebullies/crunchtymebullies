# 01 — Owner Overview & At a Glance

This is the **owner's manual + technical handover** for the CrunchTime Bullies website and online store. (The NotebookLM version answers questions interactively.)

## What CrunchTime Bullies is
A hybrid business website with three pillars:
1. **American Bully breeder site** — dogs for sale/stud, services, reviews, blog, contact.
2. **Live e-commerce apparel store** — print-on-demand merch sold through a real checkout that charges cards and auto-ships.
3. **An AI Design Studio ("MUSE")** — admin-only tool that generates merch artwork with AI and one-click publishes products.

## Live URLs
| What | URL |
|------|-----|
| Public website | https://crunchtymebullies.com |
| Online shop | https://crunchtymebullies.com/shop |
| Customer accounts / order history | https://crunchtymebullies.com/account |
| Admin dashboard (staff) | https://crunchtymebullies.com/go/admin |
| Admin email inbox | https://crunchtymebullies.com/go/inbox |
| AI Design Studio | https://crunchtymebullies.com/go/design-studio |
| Sanity CMS Studio (edit content) | https://crunchtymebullies.com/studio |
| Store backend admin (Medusa) | https://crunchtime-bullies-backend.fly.dev/app |

## Who's who (CONFIRM/UPDATE)
- **Owner / brand:** CrunchTime Bullies. Hosting owner of record: **Christopher Hallman** (Vercel team `christopher-hallman-s-projects`). *(Confirm full legal name + phone in Ch09.)*
- **Business email:** crunchtimebullies@gmail.com · **Site sender:** info@crunchtymebullies.com
- **Developer/agency:** NexaVision Group (super-admin `admin@nexavisiongroup.com`).
- **Backup technical contact:** *(add — see Ch09.)*

## Tech stack in one line
Next.js 14 on **Vercel** · content in **Sanity** · store engine **Medusa** on **Fly.io** · payments **Stripe** (live) · fulfillment **Printful** · DB+logins **Supabase** · email **Resend** · AI art **fal.ai** · DNS **Cloudflare** (registrar IONOS).

## Store status (June 2026)
LIVE on real Stripe. On payment: card charged → order shows **Paid** in admin → auto-sent to Printful (confirmed) → printed & shipped, no manual step. Shipping flat **$8.49**, free at **$40+** merchandise.

## Chapter map
01 Overview · 02 Architecture · 03 Public Website · 04 Online Store · 05 Admin Dashboard · 06 AI Design Studio · 07 Integrations & Data · 08 Credentials (REDACTED in repo; real values in NotebookLM) · 09 Operations & Handover · 10 Developer Handoff · 11–16 Deep Dives (Email, Content, Orders/Payments, Design Studio, Team/Roles, Developer Reference) — in the NotebookLM.
