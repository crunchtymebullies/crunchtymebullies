import Link from 'next/link'
import Image from 'next/image'
import type { Dog } from '@/lib/types'

const statusColor: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  sold: 'bg-red-500/20 text-red-400 border-red-500/30',
  reserved: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  stud: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  retired: 'bg-white/10 text-white/40 border-white/20',
  'our-program': 'bg-gold/15 text-gold border-gold/30',
  upcoming: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export default function DogCard({ dog }: { dog: Dog }) {
  const imgUrl = dog.mainImage?.asset?.url
  return (
    <Link href={`/dogs/${dog.slug}`} className="group block">
      <div className="card card-hover overflow-hidden rounded-2xl">
        <div className="relative aspect-square overflow-hidden">
          {imgUrl ? (
            <Image
              src={`${imgUrl}?w=600&h=600&fit=crop`}
              alt={dog.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="absolute inset-0 bg-charcoal" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Status badge */}
          {dog.status && (
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] tracking-wider uppercase font-heading border backdrop-blur-md ${statusColor[dog.status] || statusColor.available}`}>
              {dog.status}
            </div>
          )}

          {/* Hover overlay info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            {(dog as any).personality && (
              <p className="text-white/70 text-xs font-body italic line-clamp-2">&ldquo;{(dog as any).personality?.slice(0, 100)}...&rdquo;</p>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-display text-lg group-hover:text-gold transition-colors">{dog.name}</h3>
            {(dog as any).price && dog.status === 'available' && (
              <span className="text-gold font-heading text-sm">${(dog as any).price?.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            {(dog as any).variety && (
              <span className="text-white/25 text-[10px] tracking-wider uppercase font-heading">{(dog as any).variety}</span>
            )}
            {(dog as any).variety && (dog as any).color && <span className="text-white/10">·</span>}
            {(dog as any).color && (
              <span className="text-white/25 text-[10px] tracking-wider uppercase font-heading">{(dog as any).color}</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-1 text-gold/0 group-hover:text-gold/60 transition-colors">
            <span className="text-[10px] tracking-wider uppercase font-heading">View Profile</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
