'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

const kenBurnsVariants = [
  'kb-zoom-in',
  'kb-drift-right',
  'kb-drift-left',
  'kb-zoom-out',
  'kb-drift-up',
]

export default function HeroSlideshow({ 
  images, 
  slideDuration = 4, 
  crossfadeDuration = 1,
  kenBurnsDuration = 5,
}: { 
  images: string[]
  slideDuration?: number
  crossfadeDuration?: number
  kenBurnsDuration?: number
}) {
  const [current, setCurrent] = useState(0)
  const [previous, setPrevious] = useState(-1)

  const crossfadeMs = crossfadeDuration * 1000
  const intervalMs = slideDuration * 1000

  const advance = useCallback(() => {
    if (images.length <= 1) return
    setPrevious(current)
    setCurrent((current + 1) % images.length)
    setTimeout(() => setPrevious(-1), crossfadeMs)
  }, [current, images.length, crossfadeMs])

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(advance, intervalMs)
    return () => clearInterval(timer)
  }, [advance, images.length, intervalMs])

  if (!images.length) return null

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((url, i) => {
        const isActive = i === current
        const isPrev = i === previous
        const variant = kenBurnsVariants[i % kenBurnsVariants.length]

        if (!isActive && !isPrev) return null

        return (
          <div
            key={`${url}-${i}`}
            className={`absolute inset-0 ${isActive ? 'opacity-100 z-[2]' : 'opacity-0 z-[1]'}`}
            style={{ transition: `opacity ${crossfadeMs}ms ease-in-out` }}
          >
            <div
              className="absolute inset-0"
              style={isActive ? { animation: `${variant} ${kenBurnsDuration}s ease-out forwards` } : undefined}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority={i === 0}
                quality={80}
              />
            </div>
          </div>
        )
      })}

      <div className="absolute inset-0 z-[3] bg-gradient-to-r from-brand-black via-brand-black/70 to-brand-black/20" />
      <div className="absolute inset-0 z-[3] bg-gradient-to-t from-brand-black via-transparent to-brand-black/30" />
      
      {images.length > 1 && (
        <div className="absolute bottom-8 right-8 z-[5] flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (i !== current) {
                  setPrevious(current)
                  setCurrent(i)
                  setTimeout(() => setPrevious(-1), crossfadeMs)
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === current ? 'bg-gold w-8' : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
