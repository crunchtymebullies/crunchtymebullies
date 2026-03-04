import { client, SERVICES_QUERY } from '@/lib/sanity'
import Image from 'next/image'
import Link from 'next/link'
import Section from '@/components/Section'
import Reveal from '@/components/Reveal'
import { PawPrint } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services — Crunchtyme Bullies',
  description: 'Breeding services, stud service, puppy packages, and more from Crunchtyme Bullies.',
}

export const revalidate = 60

export default async function ServicesPage() {
  const sanityServices = await client.fetch(SERVICES_QUERY).catch(() => [])

  return (
    <>
      <div className="page-banner">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <Reveal animation="fade-in">
            <span className="section-label">What We Offer</span>
          </Reveal>
          <Reveal animation="fade-up" delay={100}>
            <h1 className="page-banner-title">Our Services</h1>
          </Reveal>
          <Reveal animation="fade-up" delay={200}>
            <p className="section-subheading mx-auto mt-4">
              From premium puppies to stud service — everything backed by our commitment
              to health, quality, and working family values.
            </p>
          </Reveal>
        </div>
      </div>

      <Section label="Services" heading="What You Get with Crunchtyme">
        {sanityServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sanityServices.map((svc: any, i: number) => (
              <Reveal key={svc._id} animation="fade-up" delay={i * 100}>
                <div className="h-full p-8 bg-brand-dark/50 border border-white/5 rounded-xl hover:border-gold/20 transition-all duration-300 group">
                  {svc.image?.asset?.url ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                      <Image src={svc.image.asset.url} alt={svc.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                      <PawPrint size={26} className="text-gold" />
                    </div>
                  )}
                  <h3 className="font-display text-white text-xl mb-2">{svc.title}</h3>
                  {svc.price && <span className="text-gold/60 text-xs font-heading tracking-wider uppercase block mb-3">{svc.price}</span>}
                  {svc.description && <p className="text-white/45 font-body text-sm leading-relaxed">{svc.description}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/30 font-body">Services coming soon. Check back shortly!</p>
          </div>
        )}
      </Section>

      <section className="py-20 bg-brand-dark">
        <div className="page-section text-center">
          <Reveal animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-display text-white mb-4">Questions About Our Services?</h2>
            <p className="text-white/40 font-body mb-8 max-w-lg mx-auto">
              No pressure — just honest answers from a family breeder.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-gold">Get In Touch</Link>
              <Link href="/dogs" className="btn-gold-outline">View Our Dogs</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
