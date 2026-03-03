import { client, DOG_BY_SLUG_QUERY, DOGS_QUERY, urlFor } from '@/lib/sanity'
import { PortableText } from 'next-sanity'
import DogGallery from '@/components/DogGallery'
import Reveal from '@/components/Reveal'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Shield, Award, Heart, ArrowLeft, Calendar, Weight, Dna, FileText, ExternalLink, Ruler, Palette, Dog } from 'lucide-react'
import type { Dog as DogType } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const dogs = await client.fetch<DogType[]>(DOGS_QUERY).catch(() => [])
  return dogs.map((dog) => ({ slug: dog.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dog = await client.fetch<any>(DOG_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null)
  if (!dog) return { title: 'Dog Not Found' }
  return {
    title: `${dog.name} — Crunchtime Bullies`,
    description: dog.personality || `${dog.name} — ${dog.breed}. ${dog.status === 'available' ? 'Available now.' : ''}`,
  }
}

const statusDisplay: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  reserved: { label: 'Reserved', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  sold: { label: 'Sold', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  stud: { label: 'Stud', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  retired: { label: 'Retired', color: 'text-white/40 border-white/20 bg-white/5' },
  upcoming: { label: 'Coming Soon', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
}

const docTypeLabels: Record<string, string> = {
  registration: 'Registration', pedigree: 'Pedigree', dna: 'DNA Results',
  health: 'Health Clearance', contract: 'Contract', other: 'Document',
}

export default async function DogDetailPage({ params }: { params: { slug: string } }) {
  const dog = await client.fetch<any>(DOG_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null)
  if (!dog) notFound()

  const safeImageUrl = (img: any): string | null => {
    try {
      if (!img?.asset) return null
      // Handle both reference format (_ref) and dereferenced format (url)
      if (img.asset.url) return img.asset.url
      if (img.asset._ref) return urlFor(img).width(1200).height(1200).url()
      return null
    } catch { return null }
  }

  const allImages = [
    safeImageUrl(dog.mainImage),
    ...(dog.gallery || []).map((img: any) => safeImageUrl(img)),
  ].filter(Boolean) as string[]

  const status = statusDisplay[dog.status] || statusDisplay.available

  const infoItems = [
    dog.dob && { icon: Calendar, label: 'Born', value: new Date(dog.dob || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
    dog.weight && { icon: Weight, label: 'Weight', value: dog.weight },
    dog.height && { icon: Ruler, label: 'Height', value: dog.height },
    dog.color && { icon: Palette, label: 'Color', value: dog.color },
    dog.variety && { icon: Dog, label: 'Variety', value: dog.variety },
    dog.bloodline && { icon: Dna, label: 'Bloodline', value: dog.bloodline },
    dog.registry && { icon: Award, label: 'Registry', value: `${dog.registry}${dog.registrationNumber ? ` #${dog.registrationNumber}` : ''}` },
    dog.sire && { icon: Shield, label: 'Sire', value: dog.sire },
    dog.dam && { icon: Heart, label: 'Dam', value: dog.dam },
  ].filter(Boolean)

  return (
    <>
      <div className="page-section pt-8">
        <Link href="/dogs" className="inline-flex items-center gap-2 text-white/40 text-sm font-heading hover:text-gold transition-colors">
          <ArrowLeft size={16} /> Back to All Dogs
        </Link>
      </div>

      <div className="page-section py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <Reveal animation="clip-up" duration={900}>
            <DogGallery images={allImages} />
          </Reveal>

          <div>
            <Reveal animation="fade-right" delay={100}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl md:text-5xl font-display text-white">{dog.name}</h1>
                <span className={`text-[10px] tracking-[0.2em] uppercase font-heading px-3 py-1.5 border ${status.color} flex-shrink-0`}>
                  {status.label}
                </span>
              </div>
              <p className="text-white/40 text-sm font-heading tracking-wide mb-6">
                {dog.breed} {dog.variety && `· ${dog.variety}`} {dog.gender && `· ${dog.gender}`} {dog.color && `· ${dog.color}`}
              </p>
              {dog.price && dog.status === 'available' && (
                <p className="text-gold text-2xl font-heading mb-6">${dog.price.toLocaleString()}</p>
              )}
            </Reveal>

            {dog.personality && (
              <Reveal animation="fade-up" delay={200}>
                <p className="text-white/50 font-body leading-relaxed mb-6 italic border-l-2 border-gold/30 pl-4">{dog.personality}</p>
              </Reveal>
            )}

            <div className="gold-line mb-8" />

            {infoItems.length > 0 && (
              <Reveal animation="fade-up" delay={250}>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {infoItems.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-brand-dark/50 border border-white/5 rounded-lg">
                      <item.icon size={16} className="text-gold flex-shrink-0" />
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-wider font-heading">{item.label}</p>
                        <p className="text-white text-sm font-body">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {dog.healthTests?.length > 0 && (
              <Reveal animation="fade-up" delay={300}>
                <div className="mb-8">
                  <h3 className="text-white/40 text-xs uppercase tracking-wider font-heading mb-3">Health Clearances</h3>
                  <div className="flex flex-wrap gap-2">
                    {dog.healthTests.map((test: string, i: number) => (
                      <span key={i} className="text-xs font-heading text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                        ✓ {test}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {dog.description && (
              <Reveal animation="fade-up" delay={350}>
                <div className="prose prose-invert prose-sm max-w-none mb-8 text-white/50">
                  <PortableText value={dog.description} />
                </div>
              </Reveal>
            )}

            {dog.documents?.length > 0 && (
              <Reveal animation="fade-up" delay={400}>
                <div className="mb-8">
                  <h3 className="text-white/40 text-xs uppercase tracking-wider font-heading mb-3">Documents & Paperwork</h3>
                  <div className="space-y-2">
                    {dog.documents.map((doc: any, i: number) => (
                      <a key={i} href={doc.asset?.url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-3 p-3 bg-brand-dark/50 border border-white/5 rounded-lg hover:border-gold/20 transition-colors group">
                        <FileText size={18} className="text-gold" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-heading truncate">{doc.title || doc.asset?.originalFilename || 'Document'}</p>
                          <p className="text-white/30 text-xs">{docTypeLabels[doc.docType] || 'Document'}</p>
                        </div>
                        <ExternalLink size={14} className="text-white/20 group-hover:text-gold transition-colors flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {dog.pedigreeUrl && (
              <Reveal animation="fade-up" delay={450}>
                <a href={dog.pedigreeUrl} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-gold text-sm font-heading hover:underline mb-8 block">
                  <Dna size={16} /> View Full Pedigree <ExternalLink size={12} />
                </a>
              </Reveal>
            )}

            <Reveal animation="fade-up" delay={500}>
              <div className="flex flex-wrap gap-4 mt-4">
                {(dog.status === 'available' || dog.status === 'upcoming') && (
                  <Link href="/contact" className="btn-gold">Inquire About {dog.name}</Link>
                )}
                {dog.status === 'stud' && (
                  <Link href="/contact" className="btn-gold">Stud Service Inquiry</Link>
                )}
                <Link href="/dogs" className="btn-gold-outline btn-sm">View All Dogs</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  )
}
