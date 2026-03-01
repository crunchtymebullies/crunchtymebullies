import Link from 'next/link'
import Image from 'next/image'
import { client, FEATURED_DOGS_QUERY, FEATURED_REVIEWS_QUERY, BLOG_POSTS_QUERY, SITE_SETTINGS_QUERY } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'
import DogCard from '@/components/DogCard'
import ReviewCard from '@/components/ReviewCard'
import Marquee from '@/components/Marquee'
import Section from '@/components/Section'
import type { Dog, Review, BlogPost, SiteSettings } from '@/lib/types'
import { ArrowRight, Shield, Heart, Award } from 'lucide-react'

export const revalidate = 60

export default async function HomePage() {
  const [dogs, reviews, posts] = await Promise.all([
    client.fetch<Dog[]>(FEATURED_DOGS_QUERY).catch(() => []),
    client.fetch<Review[]>(FEATURED_REVIEWS_QUERY).catch(() => []),
    client.fetch<BlogPost[]>(BLOG_POSTS_QUERY + '[0...3]').catch(() => []),
  ])

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-brand-black" />
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-black to-transparent" />

        {/* Content */}
        <div className="relative z-10 page-section py-32">
          <div className="max-w-2xl">
            <span className="section-label mb-4 animate-fade-in">Premium Breeding Program</span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display text-white mb-2 leading-[0.95] animate-fade-in-up">
              Crunchtime
            </h1>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display text-gold mb-8 leading-[0.95] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Bullies
            </h1>
            <p className="text-white/50 text-lg md:text-xl font-body leading-relaxed mb-10 max-w-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Premium American Bully breeding. Quality bloodlines,
              health-tested puppies, and world-class breeding services.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/dogs" className="btn-gold">View Our Dogs</Link>
              <Link href="/contact" className="btn-gold-outline">Contact Us</Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-heading">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold/40 to-transparent" />
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <Marquee items={['Premium Puppies', 'Quality Bloodlines', 'Health Tested', 'ABKC Registered', 'Professional Breeding', 'Lifetime Support']} />

      {/* ═══ CATEGORY CARDS ═══ */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dogs" className="group relative h-72 md:h-80 overflow-hidden block card">
            <div className="absolute inset-0 bg-[url('/category-dogs.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 flex flex-col justify-end h-full p-8">
              <span className="section-label">Browse</span>
              <h2 className="text-white text-3xl font-display mb-2">American Bullies</h2>
              <span className="text-gold text-xs tracking-[0.2em] uppercase font-heading flex items-center gap-2 group-hover:gap-3 transition-all">
                View Available Dogs <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          <Link href="/shop" className="group relative h-72 md:h-80 overflow-hidden block card">
            <div className="absolute inset-0 bg-[url('/category-shop.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 flex flex-col justify-end h-full p-8">
              <span className="section-label">Browse</span>
              <h2 className="text-white text-3xl font-display mb-2">Dog Care Products</h2>
              <span className="text-gold text-xs tracking-[0.2em] uppercase font-heading flex items-center gap-2 group-hover:gap-3 transition-all">
                Shop Now <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </Section>

      {/* ═══ ABOUT PREVIEW ═══ */}
      <Section
        label="About Us"
        heading="Puppies You Can Count On"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/3] overflow-hidden">
            <div className="absolute inset-0 bg-[url('/about-preview.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 border border-gold/10" />
            {/* Gold corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-gold/30" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-gold/30" />
          </div>

          <div>
            <p className="text-white/50 font-body leading-relaxed mb-6">
              At Crunchtime Bullies, we&apos;re dedicated to producing top-quality American Bullies
              with exceptional structure, temperament, and health. Every puppy from our program
              comes from carefully selected bloodlines and undergoes comprehensive health testing.
            </p>
            <p className="text-white/50 font-body leading-relaxed mb-8">
              Our commitment extends beyond the sale — we provide lifetime support to every
              family that welcomes a Crunchtime puppy into their home.
            </p>

            {/* Trust Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-heading">Health Tested</p>
                  <p className="text-white/30 text-xs font-body mt-1">DNA & OFA certified</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award size={20} className="text-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-heading">Registered</p>
                  <p className="text-white/30 text-xs font-body mt-1">ABKC & UKC papers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart size={20} className="text-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-heading">Lifetime Support</p>
                  <p className="text-white/30 text-xs font-body mt-1">We&apos;re always here</p>
                </div>
              </div>
            </div>

            <Link href="/about" className="btn-gold-outline btn-sm">
              Learn More About Us
            </Link>
          </div>
        </div>
      </Section>

      {/* ═══ FEATURED DOGS ═══ */}
      {dogs.length > 0 && (
        <Section
          className="bg-brand-dark"
          label="Our Dogs"
          heading="Featured Bullies"
          subheading="Meet some of our exceptional American Bullies — bred for structure, temperament, and health."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dogs.map((dog, i) => (
              <DogCard key={dog._id} dog={dog} index={i} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/dogs" className="btn-gold-outline btn-sm">
              View All Dogs
            </Link>
          </div>
        </Section>
      )}

      {/* ═══ MARQUEE 2 ═══ */}
      <Marquee items={['Quality Breeds', 'Quality Fashion', 'Crunchtime Bullies', 'Premium Puppies', 'Lifestyle Apparel']} />

      {/* ═══ REVIEWS ═══ */}
      {reviews.length > 0 && (
        <Section
          centered
          label="Testimonials"
          heading="What Our Clients Say"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <ReviewCard key={review._id} review={review} index={i} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/reviews" className="btn-gold-outline btn-sm">
              Read All Reviews
            </Link>
          </div>
        </Section>
      )}

      {/* ═══ BLOG PREVIEW ═══ */}
      {posts.length > 0 && (
        <Section
          className="bg-brand-dark"
          label="Blog"
          heading="Latest Updates"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug.current}`} className="group card card-hover">
                <div className="relative aspect-video overflow-hidden bg-brand-charcoal">
                  {post.mainImage && (
                    <Image
                      src={urlFor(post.mainImage).width(600).height(340).url()}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                </div>
                <div className="p-6">
                  <p className="text-white/30 text-xs font-heading tracking-wider mb-2">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <h3 className="text-white text-lg font-heading group-hover:text-gold transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-white/40 text-sm font-body mt-2 line-clamp-2">{post.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/blog" className="btn-gold-outline btn-sm">
              View All Posts
            </Link>
          </div>
        </Section>
      )}

      {/* ═══ CTA ═══ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/cta-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/90 to-brand-black" />
        <div className="relative z-10 page-section text-center">
          <span className="section-label">Get in Touch</span>
          <h2 className="section-heading mx-auto">
            Ready to Welcome a<br />
            <span className="text-gold">Crunchtime Puppy?</span>
          </h2>
          <p className="section-subheading mx-auto mb-10">
            Contact us to learn about available puppies, upcoming litters,
            and our breeding program.
          </p>
          <Link href="/contact" className="btn-gold">Contact Us Today</Link>
        </div>
      </section>
    </>
  )
}
