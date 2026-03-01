import Image from 'next/image'
import { Star } from 'lucide-react'
import type { Review } from '@/lib/types'

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-brand-dark/50 border border-white/5 rounded-2xl p-8 hover:border-gold/20 transition-colors duration-300">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: review.rating || 5 }).map((_, i) => (
          <Star key={i} size={14} className="fill-gold text-gold" />
        ))}
      </div>
      <p className="text-white/60 font-body leading-relaxed mb-6 italic">&ldquo;{review.text}&rdquo;</p>
      <div className="flex items-center gap-3">
        {review.image?.asset?.url ? (
          <Image src={review.image.asset.url} alt={review.name} width={40} height={40} className="rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center"><span className="text-gold text-sm font-display">{review.name?.[0]}</span></div>
        )}
        <div>
          <p className="text-white font-heading text-sm">{review.name}</p>
          {review.location && <p className="text-white/30 text-xs">{review.location}</p>}
        </div>
      </div>
    </div>
  )
}
