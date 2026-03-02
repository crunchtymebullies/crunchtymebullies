import Link from 'next/link'
import Image from 'next/image'
import { client, HOME_PAGE_QUERY, FEATURED_DOGS_QUERY, FEATURED_REVIEWS_QUERY, BLOG_POSTS_QUERY } from '@/lib/sanity'
import DogCard from '@/components/DogCard'
import ReviewCard from '@/components/ReviewCard'
import Marquee from '@/components/Marquee'
import Section from '@/components/Section'
import SanityImage from '@/components/SanityImage'
import Reveal from '@/components/Reveal'
import Particles from '@/components/Particles'
import AnimatedCounter from '@/components/AnimatedCounter'
import type { Dog, Review, BlogPost } from '@/lib/types'
import { ArrowRight, Shield, Heart, Award, Star, CheckCircle, Dna, Home, DollarSign, Clock } from 'lucide-react'
import HeroSlideshow from '@/components/HeroSlideshow'

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

  const h = page || {}

  return (
    <>
      {/* ═══ HERO — with particles + shimmer ═══ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-brand-black" />
        <HeroSlideshow 
          images={(() => {
            const imgs: string[] = []
            if (h.heroSlides?.length) {
              h.heroSlides.forEach((s: any) => { if (s.asset?.url) imgs.push(s.asset.url) })
            } else if (h.heroBackground?.asset?.url) {
              imgs.push(h.heroBackground.asset.url)
            }
            return imgs
          })()}
          slideDuration={h.heroSlideDuration || 4}
          crossfadeDuration={h.heroCrossfadeDuration || 1}
          kenBurnsDuration={h.heroKenBurnsDuration || 5}
        />

        {/* Floating gold particles */}
        <Particles count={25} className="z-[5] opacity-40" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 z-[4] opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(208,185,112,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(208,185,112,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <div className="relative z-10 page-section py-32">
          <div className="max-w-2xl">
            {h.heroLabel && (
              <span className="section-label mb-4 animate-fade-in">{h.heroLabel}</span>
            )}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display text-white mb-2 leading-[0.95] animate-fade-in-up">
              {h.heroHeadingLine1 || 'Crunchtyme'}
            </h1>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display mb-8 leading-[0.95] animate-fade-in-up text-shimmer" style={{ animationDelay: '0.1s' }}>
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

        {/* Corner accents */}
        <div className="absolute top-8 right-8 w-20 h-20 border-t border-r border-gold/10 z-10 hidden md:block" />
        <div className="absolute bottom-20 left-8 w-20 h-20 border-b border-l border-gold/10 z-10 hidden md:block" />

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in z-10" style={{ animationDelay: '0.6s' }}>
          <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-heading">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold/40 to-transparent" />
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      {h.marqueeItems?.length > 0 && (
        <Marquee items={h.marqueeItems} speed={h.marqueeSpeed || 15} />
      )}

      {/* ═══ STATS BAR — animated counters ═══ */}
      <Reveal animation="fade-up">
        <section className="py-12 border-y border-white/5 bg-brand-dark/30">
          <div className="max-w-site mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {[
                { icon: Dna, value: 200, suffix: '+', label: 'Genetic Tests Cleared' },
                { icon: Home, value: 100, suffix: '%', label: 'Indoor Raised' },
                { icon: Shield, value: 4, suffix: ' Year', label: 'Health Guarantee' },
                { icon: Clock, value: 24, suffix: '/7', label: 'Lifetime Support' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon size={20} className="text-gold/50 mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-display text-white">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000 + i * 300} />
                  </p>
                  <p className="text-white/30 text-xs tracking-[0.15em] uppercase font-heading mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══ CATEGORY CARDS ═══ */}
      {h.categoryCards?.length > 0 && (
        <Section>
          <Reveal animation="fade-up" stagger={150}>
            <div className={`grid grid-cols-1 ${h.categoryCards.length >= 2 ? 'md:grid-cols-2' : ''} gap-6`}>
              {h.categoryCards.map((card: any, i: number) => (
                <Reveal key={i} animation="scale-up" delay={i * 150}>
                  <Link href={card.href || '#'} className="group relative h-72 md:h-80 overflow-hidden block card gradient-border-glow">
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
                </Reveal>
              ))}
            </div>
          </Reveal>
        </Section>
      )}

      {/* ═══ ABOUT PREVIEW ═══ */}
      <Section
        label={h.aboutLabel || 'About Us'}
        heading={h.aboutHeading || 'Puppies You Can Count On'}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal animation="clip-up" duration={900}>
            <div className="relative aspect-[4/3] overflow-hidden group">
              {h.aboutImage?.asset?.url ? (
                <SanityImage image={h.aboutImage} fill className="absolute inset-0 group-hover:scale-[1.02] transition-transform duration-[1.5s]" />
              ) : (
                <div className="absolute inset-0 bg-charcoal" />
              )}
              <div className="absolute inset-0 border border-gold/10" />
              <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-gold/30" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-gold/30" />

              {/* Floating badge */}
              <div className="absolute bottom-6 right-6 bg-brand-black/80 backdrop-blur-md border border-gold/20 rounded-xl px-4 py-3 parallax-float">
                <p className="text-gold text-xs tracking-wider uppercase font-heading">Est. 2024</p>
              </div>
            </div>
          </Reveal>

          <Reveal animation="fade-right" delay={200}>
            <div>
              {h.aboutText ? (
                typeof h.aboutText === 'string' ? (
                  <p className="text-white/50 font-body leading-relaxed mb-6">{h.aboutText}</p>
                ) : (
                  h.aboutText.map((block: any, i: number) => (
                    <p key={i} className="text-white/50 font-body leading-relaxed mb-6">
                      {block.children?.map((c: any) => c.text).join('')}
                    </p>
                  ))
                )
              ) : (
                <>
                  <p className="text-white/50 font-body leading-relaxed mb-6">
                    We produce exceptional family companions built on superior health, stable temperaments, and honest pricing. Every puppy is indoor-raised with daily socialization from day one.
                  </p>
                  <p className="text-white/50 font-body leading-relaxed mb-8">
                    Owning a high-quality, ethically bred dog shouldn&apos;t be a luxury. We&apos;re the working family&apos;s breeder — fair prices, superior companions, lifetime support.
                  </p>
                </>
              )}

              {h.aboutFeatures?.length > 0 ? (
                <Reveal animation="fade-up" stagger={100}>
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
                </Reveal>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 stagger-in">
                  {[
                    { icon: Dna, title: 'Health First', sub: 'DNA tested, vet cleared' },
                    { icon: Home, title: 'Raised Inside', sub: 'Socialized from day one' },
                    { icon: DollarSign, title: 'Honest Pricing', sub: 'No hidden fees' },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors flex-shrink-0">
                        <feat.icon size={16} className="text-gold" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-heading">{feat.title}</p>
                        <p className="text-white/30 text-xs font-body mt-0.5">{feat.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <CTA cta={h.aboutCta} fallbackStyle="gold-outline" />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ═══ GOLD DIVIDER ═══ */}
      <div className="page-section">
        <Reveal animation="fade-in">
          <div className="gold-line" />
        </Reveal>
      </div>

      {/* ═══ FEATURED DOGS — with gradient border glow ═══ */}
      {dogs.length > 0 && (
        <Section
          className="bg-brand-dark"
          label={h.dogsLabel || 'Our Dogs'}
          heading={h.dogsHeading || 'Featured Bullies'}
          subheading={h.dogsSubheading}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog, i) => (
              <Reveal key={dog._id} animation="scale-up" delay={i * 100}>
                <div className="gradient-border-glow rounded-2xl">
                  <DogCard dog={dog} />
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal animation="fade-up" delay={300}>
            <div className="text-center mt-10">
              <Link href="/dogs" className="btn-gold-outline btn-sm">View All Dogs</Link>
            </div>
          </Reveal>
        </Section>
      )}

      {/* ═══ REVIEWS — with quote marks ═══ */}
      {reviews.length > 0 && (
        <Section
          label={h.reviewsLabel || 'Testimonials'}
          heading={h.reviewsHeading || 'What Our Clients Say'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <Reveal key={review._id} animation="fade-up" delay={i * 120}>
                <div className="gradient-border-glow rounded-2xl">
                  <ReviewCard review={review} />
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal animation="fade-up" delay={400}>
            <div className="text-center mt-10">
              <Link href="/reviews" className="btn-gold-outline btn-sm">Read All Reviews</Link>
            </div>
          </Reveal>
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
            {posts.map((post, i) => (
              <Reveal key={post._id} animation="fade-up" delay={i * 100}>
                <Link href={`/blog/${post.slug}`} className="group card card-hover overflow-hidden block gradient-border-glow rounded-2xl">
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
                        {new Date(post.publishedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </time>
                    )}
                    <h3 className="text-white font-display text-xl mt-2 group-hover:text-gold transition-colors">{post.title}</h3>
                    {post.excerpt && <p className="text-white/40 font-body text-sm mt-2 line-clamp-2">{post.excerpt}</p>}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal animation="fade-up" delay={300}>
            <div className="text-center mt-10">
              <Link href="/blog" className="btn-gold-outline btn-sm">View All Posts</Link>
            </div>
          </Reveal>
        </Section>
      )}

      {/* ═══ FINAL CTA — with particles ═══ */}
      <Reveal animation="fade-in" threshold={0.2}>
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-brand-black" />
          {h.ctaBackground?.asset?.url && (
            <SanityImage image={h.ctaBackground} fill className="absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-brand-black/70" />
          <Particles count={15} className="z-[2] opacity-30" />

          {/* Decorative corner lines */}
          <div className="absolute top-12 left-12 w-24 h-24 border-t border-l border-gold/10 z-[3] hidden md:block" />
          <div className="absolute bottom-12 right-12 w-24 h-24 border-b border-r border-gold/10 z-[3] hidden md:block" />

          <div className="relative z-10 page-section text-center">
            <Reveal animation="fade-up">
              <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
                {h.ctaHeading || 'Your Furever Family Member Is Waiting'}
              </h2>
            </Reveal>
            <Reveal animation="fade-up" delay={100}>
              {h.ctaText ? (
                <p className="text-white/50 font-body text-lg max-w-xl mx-auto mb-8">{h.ctaText}</p>
              ) : (
                <p className="text-white/50 font-body text-lg max-w-xl mx-auto mb-8">
                  Browse our available puppies or get in touch to learn about upcoming litters.
                </p>
              )}
            </Reveal>
            <Reveal animation="fade-up" delay={200}>
              <div className="flex flex-wrap justify-center gap-4">
                <CTA cta={h.ctaButton1} fallbackStyle="gold" />
                <CTA cta={h.ctaButton2} fallbackStyle="gold-outline" />
                {!h.ctaButton1 && !h.ctaButton2 && (
                  <>
                    <Link href="/dogs" className="btn-gold">Meet Our Dogs</Link>
                    <Link href="/contact" className="btn-gold-outline">Get In Touch</Link>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      </Reveal>
    </>
  )
}
