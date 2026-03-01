import Link from 'next/link'
import Image from 'next/image'
import type { Dog } from '@/lib/types'

const statusColor: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400',
  sold: 'bg-red-500/20 text-red-400',
  reserved: 'bg-amber-500/20 text-amber-400',
  stud: 'bg-blue-500/20 text-blue-400',
}

export default function DogCard({ dog }: { dog: Dog }) {
  const imgUrl = dog.mainImage?.asset?.url
  return (
    <Link href={`/dogs/${dog.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-dark border border-white/5 hover:border-gold/30 transition-all duration-500">
        {imgUrl ? (
          <Image src={imgUrl} alt={dog.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-white/20 text-6xl font-display">{dog.name[0]}</span></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {dog.status && <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-wider mb-3 ${statusColor[dog.status] || 'bg-white/10 text-white/60'}`}>{dog.status}</span>}
          <h3 className="font-display text-white text-2xl">{dog.name}</h3>
          {dog.breed && <p className="text-gold/60 text-sm font-heading tracking-wider uppercase mt-1">{dog.breed}</p>}
        </div>
      </div>
    </Link>
  )
}
