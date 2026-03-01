'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Review } from '@/lib/types'

export default function ReviewCard({ review, index = 0 }: { review: Review; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="card p-8"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < review.rating ? 'text-gold fill-gold' : 'text-white/10'}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-white/60 text-sm font-body leading-relaxed mb-6">
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Attribution */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
          <span className="text-gold text-xs font-heading">{review.name.charAt(0)}</span>
        </div>
        <div>
          <p className="text-white text-sm font-heading">{review.name}</p>
          {review.location && (
            <p className="text-white/30 text-xs font-body">{review.location}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
