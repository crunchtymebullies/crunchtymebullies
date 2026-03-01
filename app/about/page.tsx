import Link from 'next/link'
import { Shield, Heart, Award, Star, CheckCircle } from 'lucide-react'
import Section from '@/components/Section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Crunchtime Bullies — our breeding program, our values, and our commitment to quality American Bullies.',
}

export default function AboutPage() {
  return (
    <>
      <div className="page-banner">
        <div className="absolute inset-0 bg-[url('/about-hero.jpg')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <span className="section-label">Our Story</span>
          <h1 className="page-banner-title">About Crunchtime Bullies</h1>
        </div>
      </div>

      {/* Mission */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/3] overflow-hidden bg-brand-dark">
            <div className="absolute inset-0 bg-[url('/about-mission.jpg')] bg-cover bg-center" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-gold/30" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-gold/30" />
          </div>
          <div>
            <span className="section-label">Our Mission</span>
            <h2 className="section-heading">Puppies & Quality You Can Count On</h2>
            <p className="text-white/50 font-body leading-relaxed mb-6">
              At Crunchtime Bullies, we&apos;re more than breeders — we&apos;re dedicated to advancing 
              the American Bully breed through responsible practices, comprehensive health testing, 
              and a genuine love for these incredible dogs.
            </p>
            <p className="text-white/50 font-body leading-relaxed mb-8">
              Every puppy in our program comes from carefully selected bloodlines chosen for 
              structure, temperament, and health. We believe that quality breeding starts with 
              quality care, and that extends from our dogs to every family that becomes part 
              of the Crunchtime family.
            </p>
            <Link href="/dogs" className="btn-gold-outline btn-sm">Meet Our Dogs</Link>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section className="bg-brand-dark" centered label="Our Values" heading="What Sets Us Apart">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Shield, title: 'Health First', desc: 'Every dog in our program undergoes DNA testing, OFA certification, and comprehensive vet checks.' },
            { icon: Award, title: 'Registered Pedigrees', desc: 'All our dogs come with full ABKC and/or UKC registration and documented bloodlines.' },
            { icon: Heart, title: 'Lifetime Support', desc: 'Our relationship doesn\'t end at pickup. We provide guidance and support for the life of your dog.' },
            { icon: Star, title: 'Quality Bloodlines', desc: 'We work with top bloodlines to produce dogs with exceptional structure, drive, and temperament.' },
          ].map((item) => (
            <div key={item.title} className="text-center p-6">
              <div className="w-14 h-14 mx-auto mb-5 border border-gold/20 flex items-center justify-center">
                <item.icon size={22} className="text-gold" />
              </div>
              <h3 className="text-white font-heading text-sm tracking-wider uppercase mb-3">{item.title}</h3>
              <p className="text-white/40 text-sm font-body leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section label="Our Process" heading="How It Works">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Inquire', desc: 'Reach out through our contact form or email. Tell us what you\'re looking for in a puppy — size, color, temperament preferences.' },
            { step: '02', title: 'Meet & Select', desc: 'We\'ll schedule a time for you to meet available puppies (in person or via video call). We help match you with the perfect fit.' },
            { step: '03', title: 'Welcome Home', desc: 'Your puppy comes with health records, registration papers, a puppy care kit, and our lifetime support guarantee.' },
          ].map((item) => (
            <div key={item.step} className="relative p-8 card">
              <span className="text-gold/10 text-7xl font-display absolute top-4 right-6">{item.step}</span>
              <div className="relative z-10">
                <h3 className="text-white font-heading text-lg tracking-wide mb-3">{item.title}</h3>
                <p className="text-white/40 text-sm font-body leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="py-24 bg-brand-dark border-t border-white/5">
        <div className="page-section text-center">
          <span className="section-label">Ready?</span>
          <h2 className="section-heading">Start Your Journey With Crunchtime</h2>
          <p className="section-subheading mx-auto mb-10">
            Contact us today to learn about available puppies, upcoming litters, and our breeding program.
          </p>
          <Link href="/contact" className="btn-gold">Contact Us</Link>
        </div>
      </section>
    </>
  )
}
