import Link from 'next/link'
import Image from 'next/image'
import { Shield, Heart, Award, Star, Home, DollarSign, Dna, BadgeCheck, PawPrint, Users } from 'lucide-react'
import Section from '@/components/Section'
import Reveal from '@/components/Reveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us — Crunchtime Bullies',
  description: 'Premium American Bullies at working family prices. Health-tested, indoor-raised, and built for furever homes.',
}

const pillars = [
  {
    icon: Dna,
    label: 'Health First',
    title: 'Built on Superior Genetics',
    text: 'Every dog in our program undergoes rigorous health screening before they ever enter our breeding program. We invest in genetic testing, veterinary clearances, and ongoing health monitoring — because a healthy foundation is the only foundation worth building on.',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Heart,
    label: 'Raised Inside',
    title: 'Confidence Starts at Home',
    text: "Our puppies are raised inside our home from day one — not in a kennel, not in a yard. They get daily socialization, enrichment, and hands-on attention that builds stable, confident temperaments. When they leave us, they're ready for yours.",
    accent: 'text-gold',
    bg: 'bg-gold/10',
    border: 'border-gold/20',
  },
  {
    icon: DollarSign,
    label: 'Honest Pricing',
    title: "The Working Family's Breeder",
    text: "We believe a high-quality, ethically bred dog shouldn't be a luxury reserved for the few. Our pricing reflects the true cost of responsible breeding — no hype tax, no inflated markup. Just a fair price for a superior companion.",
    accent: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
]

const commitments = [
  { icon: BadgeCheck, text: 'ABKC Registered' },
  { icon: Dna, text: 'DNA Health Tested' },
  { icon: Home, text: 'Indoor Raised & Socialized' },
  { icon: PawPrint, text: 'Lifetime Breeder Support' },
  { icon: Users, text: 'Family-First Placements' },
  { icon: Star, text: 'Breed Standard Excellence' },
]

export default function AboutPage() {
  return (
    <>
      {/* ═══ HERO BANNER ═══ */}
      <div className="page-banner min-h-[50vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10 max-w-3xl mx-auto">
          <Reveal animation="fade-in">
            <span className="section-label">Our Story</span>
          </Reveal>
          <Reveal animation="fade-up" delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display text-white mt-4 mb-6">
              Built on Health.<br />
              <span className="text-gold">Raised with Heart.</span>
            </h1>
          </Reveal>
          <Reveal animation="fade-up" delay={200}>
            <p className="text-white/50 font-body text-lg leading-relaxed max-w-2xl mx-auto">
              To responsibly breed exceptional dogs built on a foundation of superior health, 
              stable temperaments, and unwavering dedication to the breed standard — ensuring 
              every puppy brings joy and longevity to its furever home.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ═══ THREE PILLARS ═══ */}
      <Section>
        <Reveal animation="fade-up">
          <div className="text-center mb-16">
            <span className="section-label">Our Philosophy</span>
            <h2 className="font-display text-white text-3xl md:text-4xl mt-4 mb-4">Quality &amp; Value</h2>
            <p className="text-white/40 font-body max-w-2xl mx-auto">
              Three principles guide everything we do — from selecting our breeding pairs 
              to the moment a puppy walks into your home.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p, i) => (
            <Reveal key={i} animation="fade-up" delay={i * 150}>
              <div className={`h-full p-8 bg-brand-dark/50 border ${p.border} rounded-xl hover:border-opacity-60 transition-all duration-500`}>
                <div className={`w-14 h-14 rounded-xl ${p.bg} flex items-center justify-center mb-6`}>
                  <p.icon size={26} className={p.accent} />
                </div>
                <span className={`text-[10px] tracking-[0.25em] uppercase font-heading ${p.accent} block mb-3`}>{p.label}</span>
                <h3 className="font-display text-white text-xl mb-4">{p.title}</h3>
                <p className="text-white/45 font-body text-sm leading-relaxed">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══ THE CRUNCHTIME DIFFERENCE ═══ */}
      <section className="py-20 md:py-28 bg-brand-dark">
        <div className="max-w-site mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal animation="fade-right">
              <div>
                <span className="section-label">The Crunchtime Difference</span>
                <h2 className="font-display text-white text-3xl md:text-4xl mt-4 mb-6">
                  A Superior Companion.<br />
                  <span className="text-gold">A Price That Respects You.</span>
                </h2>
                <p className="text-white/50 font-body leading-relaxed mb-4">
                  We produce family companions whose health and temperament come first — always. 
                  Through rigorous health testing, responsible practices, and early socialization, 
                  every puppy develops into a stable, confident, and loving adult dog.
                </p>
                <p className="text-white/50 font-body leading-relaxed mb-4">
                  We aim for the classic traits that matter: robust health, intelligence, and an 
                  outstanding temperament that makes them perfect, well-adjusted additions to any home.
                </p>
                <p className="text-white/50 font-body leading-relaxed mb-8">
                  And we do it at a price point that honors your budget — because owning an 
                  exceptional dog should be a reality for hardworking families, not a privilege 
                  reserved for a select few.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/dogs" className="btn-gold">Meet Our Dogs</Link>
                  <Link href="/contact" className="btn-gold-outline">Ask a Question</Link>
                </div>
              </div>
            </Reveal>

            <Reveal animation="clip-up" delay={200} duration={900}>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-black">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
                <div className="absolute inset-0 border border-gold/10 rounded-2xl" />
                <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-gold/30 rounded-tl-lg" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-gold/30 rounded-br-lg" />
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <span className="text-gold/8 text-[140px] font-display leading-none">CT</span>
                  <span className="text-gold/20 text-xs tracking-[0.4em] uppercase font-heading">Est. 2024</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ COMMITMENTS GRID ═══ */}
      <Section label="Our Commitment" heading="What Every Crunchtime Puppy Comes With">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {commitments.map((c, i) => (
            <Reveal key={i} animation="scale-up" delay={i * 80}>
              <div className="flex items-center gap-3 p-5 bg-brand-dark/40 border border-white/5 rounded-lg hover:border-gold/20 transition-colors duration-300">
                <c.icon size={20} className="text-gold flex-shrink-0" />
                <span className="text-white text-sm font-heading">{c.text}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══ PULL QUOTE ═══ */}
      <section className="py-16 bg-brand-dark">
        <div className="max-w-site mx-auto px-4 md:px-8">
          <Reveal animation="fade-up">
            <blockquote className="text-center max-w-3xl mx-auto">
              <div className="gold-line mb-8 mx-auto" />
              <p className="font-display text-2xl md:text-3xl text-white/80 leading-relaxed mb-6">
                &ldquo;We don&apos;t just breed dogs — we build families. Every puppy leaves us 
                with a foundation built for a lifetime of health, confidence, and love.&rdquo;
              </p>
              <cite className="text-gold text-sm tracking-[0.2em] uppercase font-heading not-italic">
                — Crunchtime Bullies
              </cite>
              <div className="gold-line mt-8 mx-auto" />
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <Reveal animation="fade-up">
        <section className="py-20">
          <div className="page-section text-center">
            <h2 className="text-3xl md:text-4xl font-display text-white mb-4">
              Your Furever Family Member Is Waiting
            </h2>
            <p className="text-white/40 font-body mb-8 max-w-lg mx-auto">
              Whether you&apos;re ready to welcome a new puppy or just want to learn more 
              about our program, we&apos;re here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dogs" className="btn-gold">View Available Dogs</Link>
              <Link href="/contact" className="btn-gold-outline">Contact Us</Link>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  )
}
