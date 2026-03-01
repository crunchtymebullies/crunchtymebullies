import { client, DOGS_QUERY } from '@/lib/sanity'
import DogCard from '@/components/DogCard'
import Section from '@/components/Section'
import Reveal from '@/components/Reveal'
import type { Dog } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Dogs',
  description: 'Meet our exceptional American Bullies. Premium bloodlines, health-tested, ABKC registered.',
}

export const revalidate = 60

function DogGrid({ dogs, label }: { dogs: Dog[]; label?: string }) {
  if (!dogs.length) return null
  return (
    <div className="mb-16 last:mb-0">
      {label && (
        <Reveal animation="fade-up">
          <h2 className="text-2xl font-display text-gold mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-gold" />
            {label}
          </h2>
        </Reveal>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dogs.map((dog, i) => (
          <Reveal key={dog._id} animation="scale-up" delay={i * 100}>
            <DogCard dog={dog} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export default async function DogsPage() {
  const dogs = await client.fetch<Dog[]>(DOGS_QUERY).catch(() => [])

  const available = dogs.filter((d) => d.status === 'available')
  const studs = dogs.filter((d) => d.status === 'stud')
  const others = dogs.filter((d) => d.status !== 'available' && d.status !== 'stud')

  return (
    <>
      <div className="page-banner">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <Reveal animation="fade-in">
            <span className="section-label">Our Program</span>
          </Reveal>
          <Reveal animation="fade-up" delay={100}>
            <h1 className="page-banner-title">Our Dogs</h1>
          </Reveal>
          <Reveal animation="fade-up" delay={200}>
            <p className="section-subheading mx-auto mt-4">
              Meet the foundation of our breeding program. Each dog is health-tested, ABKC registered, and raised with care.
            </p>
          </Reveal>
        </div>
      </div>

      <Section>
        <DogGrid dogs={available} label="Available" />
        <DogGrid dogs={studs} label="Studs" />
        <DogGrid dogs={others} label="Our Pack" />

        {dogs.length === 0 && (
          <Reveal animation="fade-up">
            <div className="text-center py-20">
              <p className="text-white/30 font-body text-lg">No dogs to display yet. Check back soon!</p>
            </div>
          </Reveal>
        )}
      </Section>
    </>
  )
}
