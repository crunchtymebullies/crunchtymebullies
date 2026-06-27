# 03 — Public Website (pages & content)

Lives in `app/(site)/`, shares `Header` + `Footer` (layout `app/(site)/layout.tsx`). Almost all content comes from **Sanity CMS** — owner edits at `/studio`, not in code.

## Pages
| Page | URL | File | Source |
|------|-----|------|--------|
| Home | `/` | `app/(site)/page.tsx` | Sanity: home config, featured dogs/reviews, latest blog |
| All Dogs | `/dogs` | `app/(site)/dogs/page.tsx` | Sanity `dog` (by status) |
| Dog detail | `/dogs/[slug]` | `app/(site)/dogs/[slug]/page.tsx` | Sanity single dog |
| Services | `/services` | `app/(site)/services/page.tsx` | Sanity `service` |
| About | `/about` | `app/(site)/about/page.tsx` | Static |
| Reviews | `/reviews` | `app/(site)/reviews/page.tsx` | Sanity `review` |
| Blog | `/blog` | `app/(site)/blog/page.tsx` | Sanity `blogPost` |
| Blog post | `/blog/[slug]` | `app/(site)/blog/[slug]/page.tsx` | Sanity single post |
| Contact | `/contact` | `app/(site)/contact/page.tsx` | Form → `/api/contact` |
| Privacy / Terms | `/privacy`, `/terms` | static | — |

## Content updates
Owner edits in **Sanity Studio** (`/studio`) → Publish → Sanity webhook → `app/(site)/api/revalidate/route.ts` (secured by `SANITY_REVALIDATE_SECRET`) refreshes pages (also time-based ISR).

## Sanity types
siteSettings (logo, announcement, nav, social, footer) · homePage (hero, marquee, cards, about, CTA) · dog (full breeding/health/media fields, status, featured) · service · review · blogPost.

## Editing without code
Sanity Studio `/studio`, plus simplified **Dogs**/**Services** editors in `/go/admin` and bulk photo upload at `/go/photos`.

## Key components
`components/Header.tsx`, `Footer.tsx`, `DogCard.tsx`, `ReviewCard.tsx`, `DogGallery.tsx`, plus visual: `HeroSlideshow`, `SwipeCarousel`, `Reveal`, `Particles`, `AuroraCanvas`, `Marquee`, `ScrollProgress`, `SanityImage`.
