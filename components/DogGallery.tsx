'use client'

import { useEffect, useState } from 'react'

export default function DogGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)

  if (!images || images.length === 0) return null

  return (
    <div>
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden bg-brand-charcoal mb-3">
        <img
          src={images[active]}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 border border-white/5" />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden transition-all duration-300 ${
                i === active
                  ? 'border border-gold'
                  : 'border border-white/5 opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
