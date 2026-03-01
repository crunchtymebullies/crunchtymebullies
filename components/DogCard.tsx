'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '@/lib/sanity'
import type { Dog } from '@/lib/types'

const statusColors: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  reserved: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  sold: 'bg-red-500/20 text-red-400 border-red-500/30',
  stud: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export default function DogCard({ dog, index = 0 }: { dog: Dog; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/dogs/${dog.slug}`} className="group block card card-hover">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-brand-charcoal">
          {dog.mainImage && (
            <Image
              src={urlFor(dog.mainImage).width(600).height(600).url()}
              alt={dog.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`text-[10px] tracking-[0.2em] uppercase font-heading px-3 py-1 border ${statusColors[dog.status] || statusColors.available}`}>
              {dog.status}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-white text-lg font-heading tracking-wide group-hover:text-gold transition-colors">
            {dog.name}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-white/40 text-xs font-body">{dog.breed}</span>
            {dog.gender && (
              <>
                <span className="text-white/10">·</span>
                <span className="text-white/40 text-xs font-body capitalize">{dog.gender}</span>
              </>
            )}
            {dog.color && (
              <>
                <span className="text-white/10">·</span>
                <span className="text-white/40 text-xs font-body">{dog.color}</span>
              </>
            )}
          </div>
          {dog.price && dog.status === 'available' && (
            <p className="text-gold font-heading text-sm mt-3 tracking-wide">
              ${dog.price.toLocaleString()}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
