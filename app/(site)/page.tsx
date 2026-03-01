import Link from 'next/link'
import Image from 'next/image'
import { client, HOME_PAGE_QUERY, FEATURED_DOGS_QUERY, FEATURED_REVIEWS_QUERY, BLOG_POSTS_QUERY } from '@/lib/sanity'
import DogCard from '@/components/DogCard'
import ReviewCard from '@/components/ReviewCard'
import Marquee from '@/components/Marquee'
import Section from '@/components/Section'
import SanityImage from '@/components/SanityImage'
import type { Dog, Review, BlogPost } from '@/lib/types'
import { ArrowRight, Shield, Heart, Award, Star, CheckCircle } from 'lucide-react'

export const revalidate = 60

const iconMap: Record<string, any> = { Shield, Heart, Award, Star, Check: CheckCircle }

function CTA({ cta, fallbackStyle }: { cta: any; fallbackStyle?: string }) {
  if (!cta?.text || !cta?.href) return null
  const style = cta.style || fallbackStyle || 'gold'
  const cls = style === 'gold' ? 'btn-gold' : style === 'gold-outline' ? 'btn-gold-outline' : style === 'white' ? 'btn-gold' : 'btn-gold-outline'
  return <Link href={cta.href} className={cls}>{cta.text}</Link>
}

export default async function HomePage() {
  const [page, dogs, reviews, posts] = await Promise.all([
    client.fetch(HOME_PAGE_QUERY).catch(() => null),
    client.fetch<Dog[]>(FEATURED_DOGS_QUERY).catch(() => []),
    client.fetch<Review[]>(FEATURED_REVIEWS_QUERY).catch(() => []),
    client.fetch<BlogPost[]>(BLOG_POSTS_QUERY + '[0...3]').catch(() => []),
  ])

  // Fallbacks if homePage doc doesn't exist yet
  const h = page || {}

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-brand-black" />
        {h.heroBackground?.asset?.url && (
          <SanityImage
            image={h.heroBackground}
            fill
            className="absolute inset-0"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-black to-transparent" />

        <div className="relative z-10 page-section py-32">
          <div className="max-w-2xl">
            {h.heroLabel && (
              <span className="section-label mb-4 animate-fade-in">{h.heroLabel}</span>
            )}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display text-white mb-2 leading-[0.95] animate-fade-in-up">
              {h.heroHeadingLine1 || 'Crunchtime'}
            </h1>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display text-gold mb-8 leading-[0.95] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {h.heroHeadingLine2 || 'Bullies'}
            </h1>
            {h.heroSubtext && (
              <p className="text-white/50 text-lg md:text-xl font-body leading-relaxed mb-10 max-w-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {h.heroSubtext}
              </p>
            )}
            <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <CTA cta={h.heroCta1} fallbackStyle="gold" />
              <CTA cta={h.heroCta2} fallbackStyle="gold-outline" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-heading">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold/40 to-transparent" />
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      {h.marqueeItems?.length > 0 && (
        <Marquee items={h.marqueeItems} />
      )}

      {/* ═══ CATEGORY CARDS ═══ */}
      {h.categoryCards?.length > 0 && (
        <Section>
          <div className={`grid grid-cols-1 ${h.categoryCards.length >= 2 ? 'md:grid-cols-2' : ''} gap-6`}>
            {h.categoryCards.map((card: any, i: number) => (
              <Link key={i} href={card.href || '#'} className="group relative h-72 md:h-80 overflow-hidden block card">
                {card.image?.asset?.url ? (
                  <SanityImage image={card.image} fill className="absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-charcoal" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10 flex flex-col justify-end h-full p-8">
                  {card.label && <span className="section-label">{card.label}</span>}
                  <h2 className="text-white text-3xl font-display mb-2">{card.heading}</h2>
                  {card.linkText && (
                    <span className="text-gold text-xs tracking-[0.2em] uppercase font-heading flex items-center gap-2 group-hover:gap-3 transition-all">
                      {card.linkText} <ArrowRight size={14} />
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ ABOUT PREVIEW ═══ */}
      <Section
        label={h.aboutLabel || 'About Us'}
        heading={h.aboutHeading || 'Puppies You Can Count On'}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/3] overflow-hidden">
            {h.aboutImage?.asset?.url ? (
              <SanityImage image={h.aboutImage} fill className="absolute inset-0" />
            ) : (
              <div className="absolute inset-0 bg-charcoal" />
            )}
            <div className="absolute inset-0 border border-gold/10" />
            <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-gold/30" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-gold/30" />
          </div>

          <div>
            {h.aboutText ? (
              h.aboutText.map((block: any, i: number) => (
                <p key={i} className="text-white/50 font-body leading-relaxed mb-6">
                  {block.children?.map((c: any) => c.text).join('')}
                </p>
              ))
            ) : (
              <>
                <p className="text-white/50 font-body leading-relaxed mb-6">
                  At Crunchtime Bullies, we&apos;re dedicated to producing top-quality American Bullies with exceptional structure, temperament, and health.
                </p>
                <p className="text-white/50 font-body leading-relaxed mb-8">
                  Every puppy is raised with love, health-tested, and comes with a lifetime of breeder support. We don&apos;t just breed dogs — we build families.
                </p>
              </>
            )}

            {h.aboutFeatures?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {h.aboutFeatures.map((feat: any, i: number) => {
                  const Icon = iconMap[feat.icon] || Shield
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <Icon size={20} className="text-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm font-heading">{feat.title}</p>
                        {feat.subtitle && <p className="text-white/30 text-xs font-body mt-1">{feat.subtitle}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <CTA cta={h.aboutCta} fallbackStyle="gold-outline" />
          </div>
        </div>
      </Section>

      {/* ═══ FEATURED DOGS ═══ */}
      {dogs.length > 0 && (
        <Section
          className="bg-brand-dark"
          label={h.dogsLabel || 'Our Dogs'}
          heading={h.dogsHeading || 'Featured Bullies'}
          subheading={h.dogsSubheading}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => (
              <DogCard key={dog._id} dog={dog} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/dogs" className="btn-gold-outline btn-sm">View All Dogs</Link>
          </div>
        </Section>
      )}

      {/* ═══ REVIEWS ═══ */}
      {reviews.length > 0 && (
        <Section
          label={h.reviewsLabel || 'Testimonials'}
          heading={h.reviewsHeading || 'What Our Clients Say'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        </Section>
      )}

      {/* ═══ BLOG PREVIEW ═══ */}
      {posts.length > 0 && (
        <Section
          className="bg-brand-dark"
          label={h.blogLabel || 'From The Blog'}
          heading={h.blogHeading || 'Latest Posts'}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="group card overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {post.mainImage?.asset?.url ? (
                    <Image
                      src={post.mainImage.asset.url}
                      alt={post.mainImage?.alt || post.title}
                      fill className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-charcoal" />
                  )}
                </div>
                <div className="p-6">
                  {post.publishedAt && (
                    <time className="text-gold/50 text-xs tracking-[0.15em] uppercase font-heading">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </time>
                  )}
                  <h3 className="text-white font-display text-xl mt-2 group-hover:text-gold transition-colors">{post.title}</h3>
                  {post.excerpt && <p className="text-white/40 font-body text-sm mt-2 line-clamp-2">{post.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-brand-black" />
        {h.ctaBackground?.asset?.url && (
          <SanityImage image={h.ctaBackground} fill className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-brand-black/70" />
        <div className="relative z-10 page-section text-center">
          <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
            {h.ctaHeading || 'Ready to Find Your Perfect Bully?'}
          </h2>
          {h.ctaText && <p className="text-white/50 font-body text-lg max-w-xl mx-auto mb-8">{h.ctaText}</p>}
          <div className="flex flex-wrap justify-center gap-4">
            <CTA cta={h.ctaButton1} fallbackStyle="gold" />
            <CTA cta={h.ctaButton2} fallbackStyle="gold-outline" />
          </div>
        </div>
      </section>
    </>
  )
}
