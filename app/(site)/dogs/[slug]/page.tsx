import { client, DOG_BY_SLUG_QUERY, DOGS_QUERY, urlFor } from '@/lib/sanity'
import { PortableText } from 'next-sanity'
import DogGallery from '@/components/DogGallery'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Shield, Award, Heart, ArrowLeft, Calendar, Weight, Dna } from 'lucide-react'
import type { Dog } from '@/lib/types'
import Reveal from '@/components/Reveal'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const dogs = await client.fetch<Dog[]>(DOGS_QUERY).catch(() => [])
  return dogs.map((dog) => ({ slug: dog.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dog = await client.fetch<Dog>(DOG_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null)
  if (!dog) return { title: 'Dog Not Found' }
  return {
    title: dog.name,
    description: `${dog.name} — ${dog.breed}. ${dog.status === 'available' ? 'Available now.' : ''}`,
  }
}

const statusDisplay: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  reserved: { label: 'Reserved', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  sold: { label: 'Sold', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  stud: { label: 'Stud Service', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
}

export default async function DogProfilePage({ params }: { params: { slug: string } }) {
  const dog = await client.fetch<Dog>(DOG_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null)

  if (!dog) notFound()

  const allImages = [
    dog.mainImage ? urlFor(dog.mainImage).width(900).height(900).url() : null,
    ...(dog.gallery || []).map((img) => urlFor(img).width(900).height(900).url()),
  ].filter(Boolean) as string[]

  const status = statusDisplay[dog.status] || statusDisplay.available

  return (
    <>
      {/* Back Link */}
      <div className="page-section pt-8">
        <Link href="/dogs" className="inline-flex items-center gap-2 text-white/40 text-sm font-heading hover:text-gold transition-colors">
          <ArrowLeft size={16} /> Back to All Dogs
        </Link>
      </div>

      {/* Profile */}
      <div className="page-section py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <Reveal animation="clip-up" duration={900}>
            <DogGallery images={allImages} />
          </Reveal>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-display text-white">{dog.name}</h1>
              <span className={`text-[10px] tracking-[0.2em] uppercase font-heading px-3 py-1.5 border ${status.color} flex-shrink-0`}>
                {status.label}
              </span>
            </div>

            <p className="text-white/40 text-sm font-heading tracking-wide mb-6">
              {dog.breed} {dog.gender && `· ${dog.gender}`} {dog.color && `· ${dog.color}`}
            </p>

            {dog.price && dog.status === 'available' && (
              <p className="text-gold text-2xl font-heading mb-6">${dog.price.toLocaleString()}</p>
            )}

            <div className="gold-line mb-8" />

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {dog.dob && (
                <div className="flex items-center gap-3 p-3 bg-brand-dark border border-white/5">
                  <Calendar size={16} className="text-gold" />
                  <div>
                    <p className="text-white/30 text-[10px] tracking-wider uppercase font-heading">Born</p>
                    <p className="text-white text-sm font-body">{new Date(dog.dob || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              )}
              {dog.weight && (
                <div className="flex items-center gap-3 p-3 bg-brand-dark border border-white/5">
                  <Weight size={16} className="text-gold" />
                  <div>
                    <p className="text-white/30 text-[10px] tracking-wider uppercase font-heading">Weight</p>
                    <p className="text-white text-sm font-body">{dog.weight}</p>
                  </div>
                </div>
              )}
              {dog.sire && (
                <div className="flex items-center gap-3 p-3 bg-brand-dark border border-white/5">
                  <Dna size={16} className="text-gold" />
                  <div>
                    <p className="text-white/30 text-[10px] tracking-wider uppercase font-heading">Sire</p>
                    <p className="text-white text-sm font-body">{dog.sire}</p>
                  </div>
                </div>
              )}
              {dog.dam && (
                <div className="flex items-center gap-3 p-3 bg-brand-dark border border-white/5">
                  <Dna size={16} className="text-gold" />
                  <div>
                    <p className="text-white/30 text-[10px] tracking-wider uppercase font-heading">Dam</p>
                    <p className="text-white text-sm font-body">{dog.dam}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Health Tests */}
            {dog.healthTests && dog.healthTests.length > 0 && (
              <div className="mb-8">
                <h3 className="text-white text-sm font-heading tracking-wider uppercase mb-3 flex items-center gap-2">
                  <Shield size={14} className="text-gold" /> Health & Testing
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dog.healthTests.map((test) => (
                    <span key={test} className="text-white/50 text-xs font-body px-3 py-1.5 bg-brand-dark border border-white/5">
                      {test}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {dog.description && (
              <div className="prose prose-invert prose-sm max-w-none mb-8 text-white/50 font-body">
                <PortableText value={dog.description} />
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-gold">
                {dog.status === 'available' ? 'Inquire About ' + dog.name : 'Contact Us'}
              </Link>
              {dog.pedigreeUrl && (
                <a href={dog.pedigreeUrl} target="_blank" rel="noopener noreferrer" className="btn-gold-outline btn-sm">
                  View Pedigree
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
