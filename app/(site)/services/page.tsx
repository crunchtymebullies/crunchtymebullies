import { client, SERVICES_QUERY } from '@/lib/sanity'
import Image from 'next/image'
import Link from 'next/link'
import Section from '@/components/Section'
import Reveal from '@/components/Reveal'
import { PawPrint, Heart, ShieldCheck, Stethoscope, Home, Truck } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services — Crunchtyme Bullies',
  description: 'Breeding services, stud service, puppy packages, and more from Crunchtyme Bullies.',
}

export const revalidate = 60

const defaultServices = [
  {
    icon: PawPrint,
    title: 'Puppy Sales',
    description: 'Health-tested, indoor-raised American Bully puppies from premium bloodlines. Every puppy comes with health records, a starter kit, and lifetime breeder support.',
    price: 'Contact for pricing',
  },
  {
    icon: Heart,
    title: 'Stud Service',
    description: 'Access to our proven studs with documented health clearances, DNA panels, and ABKC registration. We work with you to find the right match for your female.',
    price: 'Contact for pricing',
  },
  {
    icon: Stethoscope,
    title: 'Health Guarantee',
    description: 'Every Crunchtyme puppy comes with a health guarantee. Our dogs are DNA tested, vet checked, and cleared before they ever leave our care.',
    price: 'Included',
  },
  {
    icon: Home,
    title: 'Puppy Socialization Program',
    description: 'All puppies are raised inside our home with daily socialization, crate training introduction, and enrichment activities to build stable, confident temperaments.',
    price: 'Included',
  },
  {
    icon: ShieldCheck,
    title: 'Registration Assistance',
    description: 'We handle ABKC registration paperwork for all puppies and can assist with transfers. Your puppy comes with all documentation in order.',
    price: 'Included',
  },
  {
    icon: Truck,
    title: 'Delivery & Shipping',
    description: 'We offer ground transport and flight nanny options for puppies going to families outside our area. Safe, comfortable delivery to your door.',
    price: 'Varies by location',
  },
]

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

      {sanityServices.length > 0 && (
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sanityServices.map((svc: any, i: number) => (
              <Reveal key={svc._id} animation="scale-up" delay={i * 100}>
                <div className="h-full p-8 bg-brand-dark/50 border border-white/5 rounded-xl hover:border-gold/20 transition-all duration-300">
                  {svc.image?.asset?.url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                      <Image src={svc.image.asset.url} alt={svc.title} fill className="object-cover" />
                    </div>
                  )}
                  <h3 className="font-display text-white text-xl mb-2">{svc.title}</h3>
                  {svc.price && <span className="text-gold text-sm font-heading block mb-3">{svc.price}</span>}
                  <p className="text-white/45 font-body text-sm leading-relaxed">{svc.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section label="Services" heading="What You Get with Crunchtyme">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {defaultServices.map((svc, i) => (
            <Reveal key={i} animation="fade-up" delay={i * 100}>
              <div className="h-full p-8 bg-brand-dark/50 border border-white/5 rounded-xl hover:border-gold/20 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <svc.icon size={26} className="text-gold" />
                </div>
                <h3 className="font-display text-white text-xl mb-2">{svc.title}</h3>
                <span className="text-gold/60 text-xs font-heading tracking-wider uppercase block mb-3">{svc.price}</span>
                <p className="text-white/45 font-body text-sm leading-relaxed">{svc.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
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
