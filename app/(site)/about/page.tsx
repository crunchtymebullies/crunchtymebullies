import Link from 'next/link'
import { Shield, Heart, Award, Star, CheckCircle } from 'lucide-react'
import Section from '@/components/Section'
import Reveal from '@/components/Reveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Crunchtime Bullies — our breeding program, our values, and our commitment to quality American Bullies.',
}

const values = [
  { icon: Shield, title: 'Health First', desc: 'Every dog in our program is health-tested and cleared by licensed veterinarians. We invest in genetic screening to ensure the healthiest puppies possible.' },
  { icon: Heart, title: 'Raised with Love', desc: 'Our puppies are raised in-home with daily socialization, enrichment, and hands-on care from day one. They leave us confident and well-adjusted.' },
  { icon: Award, title: 'Premium Bloodlines', desc: 'We work with top bloodlines in the American Bully community to produce dogs with exceptional structure, temperament, and presence.' },
  { icon: Star, title: 'Lifetime Support', desc: 'When you get a Crunchtime puppy, you get a breeder for life. We are always available for guidance, advice, and support.' },
]

export default function AboutPage() {
  return (
    <>
      <div className="page-banner">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <Reveal animation="fade-in">
            <span className="section-label">Our Story</span>
          </Reveal>
          <Reveal animation="fade-up" delay={100}>
            <h1 className="page-banner-title">About Crunchtime Bullies</h1>
          </Reveal>
        </div>
      </div>

      {/* Mission */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal animation="clip-up" duration={900}>
            <div className="relative aspect-[4/3] overflow-hidden bg-brand-dark">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
              <div className="absolute inset-0 border border-gold/10" />
              <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-gold/30" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-gold/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gold/10 text-[120px] font-display">CT</span>
              </div>
            </div>
          </Reveal>
          <Reveal animation="fade-right" delay={200}>
            <div>
              <span className="section-label">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-display text-white mb-6 mt-2">
                Building the Future of American Bullies
              </h2>
              <p className="text-white/50 font-body leading-relaxed mb-4">
                Crunchtime Bullies was founded with a simple mission: produce top-quality American Bullies that families can be proud of. We believe in responsible breeding practices, transparency, and putting the health of our dogs above everything else.
              </p>
              <p className="text-white/50 font-body leading-relaxed mb-8">
                Every decision we make — from selecting our breeding pairs to how we raise our puppies — is guided by our commitment to excellence. We don&apos;t cut corners, and we don&apos;t compromise on quality.
              </p>
              <Link href="/dogs" className="btn-gold-outline btn-sm">Meet Our Dogs</Link>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section className="bg-brand-dark" label="Our Values" heading="What We Stand For">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((v, i) => (
            <Reveal key={i} animation="scale-up" delay={i * 120}>
              <div className="flex gap-5 p-6 bg-brand-black/30 border border-white/5 rounded-lg hover:border-gold/20 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <v.icon size={22} className="text-gold" />
                </div>
                <div>
                  <h3 className="text-white font-display text-lg mb-2">{v.title}</h3>
                  <p className="text-white/40 font-body text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Reveal animation="fade-up">
        <section className="py-20">
          <div className="page-section text-center">
            <h2 className="text-3xl md:text-4xl font-display text-white mb-4">Ready to Join the Family?</h2>
            <p className="text-white/40 font-body mb-8 max-w-lg mx-auto">
              Whether you&apos;re looking for a new family member or interested in our breeding program, we&apos;d love to connect.
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
