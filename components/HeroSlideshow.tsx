'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

// Each slide gets a unique Ken Burns direction
const kenBurnsVariants = [
  'animate-kb-zoom-in',       // slow zoom in from center
  'animate-kb-drift-right',   // zoom + drift right
  'animate-kb-drift-left',    // zoom + drift left  
  'animate-kb-zoom-out',      // start zoomed, slowly pull out
  'animate-kb-drift-up',      // zoom + drift upward
]

export default function HeroSlideshow({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)
  const [previous, setPrevious] = useState(-1)
  const [transitioning, setTransitioning] = useState(false)

  const advance = useCallback(() => {
    if (images.length <= 1) return
    setPrevious(current)
    setTransitioning(true)
    setCurrent((current + 1) % images.length)
    // Reset transition state after crossfade completes
    setTimeout(() => {
      setPrevious(-1)
      setTransitioning(false)
    }, 2000)
  }, [current, images.length])

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(advance, 7000) // 7s per slide
    return () => clearInterval(timer)
  }, [advance, images.length])

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
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              isActive ? 'opacity-100 z-[2]' : 'opacity-0 z-[1]'
            }`}
          >
            <div className={`absolute inset-0 ${isActive ? variant : ''}`}>
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

      {/* Vignette + gradient overlays for text readability */}
      <div className="absolute inset-0 z-[3] bg-gradient-to-r from-brand-black via-brand-black/70 to-brand-black/20" />
      <div className="absolute inset-0 z-[3] bg-gradient-to-t from-brand-black via-transparent to-brand-black/30" />
      
      {/* Slide indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-8 right-8 z-[5] flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (i !== current) {
                  setPrevious(current)
                  setTransitioning(true)
                  setCurrent(i)
                  setTimeout(() => { setPrevious(-1); setTransitioning(false) }, 2000)
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === current
                  ? 'bg-gold w-8'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
