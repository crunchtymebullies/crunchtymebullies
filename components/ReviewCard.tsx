import { Star, Quote } from 'lucide-react'
import type { Review } from '@/lib/types'

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-brand-dark/50 border border-white/5 rounded-2xl p-8 hover:border-gold/20 transition-all duration-500 relative group h-full">
      {/* Quote decoration */}
      <div className="absolute top-6 right-6 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
        <Quote size={40} className="text-gold" />
      </div>

      <div className="flex gap-1 mb-4">
        {Array.from({ length: review.rating || 5 }).map((_, i) => (
          <Star key={i} size={14} className="fill-gold text-gold" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>

      <p className="text-white/50 font-body text-sm leading-relaxed mb-6 relative z-10">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="flex items-center gap-3 mt-auto">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-gold text-sm">{review.name?.charAt(0)}</span>
        </div>
        <div>
          <p className="text-white font-heading text-sm">{review.name}</p>
          {(review as any).location && (
            <p className="text-white/25 text-xs font-body">{(review as any).location}</p>
          )}
          {(review as any).dogPurchased && (
            <p className="text-gold/30 text-[10px] tracking-wider uppercase font-heading">{(review as any).dogPurchased}</p>
          )}
        </div>
      </div>
    </div>
  )
}
