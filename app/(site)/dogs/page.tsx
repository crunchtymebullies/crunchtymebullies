import { client, DOGS_QUERY } from '@/lib/sanity'
import DogCard from '@/components/DogCard'
import Section from '@/components/Section'
import type { Dog } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Dogs',
  description: 'Meet our exceptional American Bullies. Premium bloodlines, health-tested, ABKC registered.',
}

export const revalidate = 60

export default async function DogsPage() {
  const dogs = await client.fetch<Dog[]>(DOGS_QUERY).catch(() => [])

  const available = dogs.filter((d) => d.status === 'available')
  const studs = dogs.filter((d) => d.status === 'stud')
  const others = dogs.filter((d) => d.status !== 'available' && d.status !== 'stud')

  return (
    <>
      {/* Banner */}
      <div className="page-banner">
        <div className="absolute inset-0 bg-[url('/dogs-banner.jpg')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/50 to-brand-black" />
        <div className="page-section text-center relative z-10">
          <span className="section-label">Our Program</span>
          <h1 className="page-banner-title">Our Dogs</h1>
          <p className="section-subheading mx-auto mt-4">
            Premium American Bullies bred for structure, temperament, and health.
          </p>
        </div>
      </div>

      {/* Available Dogs */}
      {available.length > 0 && (
        <Section label="Available Now" heading="Available Puppies & Dogs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {available.map((dog, i) => (
              <DogCard key={dog._id} dog={dog} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* Stud Services */}
      {studs.length > 0 && (
        <Section className="bg-brand-dark" label="Stud Services" heading="Our Studs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {studs.map((dog, i) => (
              <DogCard key={dog._id} dog={dog} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* Previously Available */}
      {others.length > 0 && (
        <Section label="Alumni" heading="Our Family">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {others.map((dog, i) => (
              <DogCard key={dog._id} dog={dog} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* Empty State */}
      {dogs.length === 0 && (
        <Section centered heading="Coming Soon">
          <p className="section-subheading mx-auto">
            Our dog profiles are being updated. Check back soon or contact us directly for information about available puppies.
          </p>
        </Section>
      )}
    </>
  )
}
