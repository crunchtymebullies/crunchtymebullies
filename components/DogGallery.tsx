'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { gsap, useGSAP } from '@/lib/gsapConfig'

interface DogGalleryProps {
  images: string[]
  name?: string
}

export default function DogGallery({ images, name }: DogGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<gsap.core.Tween | null>(null)
  const isAnimatingRef = useRef(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const [active, setActive] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const count = images.length
  const hasMultiple = count > 1
  const SLIDE_INTERVAL = 5 // seconds

  // Transition patterns — cycles through different reveals
  const transitions = [
    // Diagonal wipe left-to-right
    {
      from: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
      to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    },
    // Circle expand from center
    { from: 'circle(0% at 50% 50%)', to: 'circle(75% at 50% 50%)' },
    // Diamond expand
    {
      from: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
      to: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    },
    // Vertical split open
    {
      from: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)',
      to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    },
    // Diagonal wipe right-to-left
    {
      from: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
      to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    },
  ]

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimatingRef.current || index === active || !containerRef.current) return
      isAnimatingRef.current = true

      const container = containerRef.current
      const currentSlide = container.querySelector('.slide-active') as HTMLElement
      const nextSlide = container.querySelector(`[data-slide="${index}"]`) as HTMLElement
      if (!currentSlide || !nextSlide) {
        isAnimatingRef.current = false
        return
      }

      // Pick a random transition pattern
      const t = transitions[Math.floor(Math.random() * transitions.length)]

      // Ken Burns — zoom + drift on the current slide as it exits
      const currentImg = currentSlide.querySelector('img')
      if (currentImg) {
        gsap.to(currentImg, {
          scale: 1.15,
          duration: 1.2,
          ease: 'power2.inOut',
        })
      }

      // Prepare next slide
      nextSlide.style.zIndex = '2'
      nextSlide.style.visibility = 'visible'
      const nextImg = nextSlide.querySelector('img')
      if (nextImg) {
        gsap.set(nextImg, { scale: 1.1 })
      }

      // Clip-path reveal animation on the incoming slide
      gsap.fromTo(
        nextSlide,
        { clipPath: t.from, opacity: 1 },
        {
          clipPath: t.to,
          duration: 1.2,
          ease: 'power3.inOut',
          onComplete: () => {
            // Ken Burns on the new active slide
            if (nextImg) {
              gsap.to(nextImg, {
                scale: 1.0,
                duration: SLIDE_INTERVAL,
                ease: 'none',
              })
            }
            // Reset old slide
            currentSlide.classList.remove('slide-active')
            currentSlide.style.zIndex = '0'
            currentSlide.style.visibility = 'hidden'
            gsap.set(currentSlide, { clipPath: 'none' })
            if (currentImg) gsap.set(currentImg, { scale: 1 })

            nextSlide.classList.add('slide-active')
            nextSlide.style.clipPath = 'none'

            setActive(index)
            isAnimatingRef.current = false
          },
        }
      )

      // Subtle gold flash overlay
      const flash = container.querySelector('.slide-flash') as HTMLElement
      if (flash) {
        gsap.fromTo(
          flash,
          { opacity: 0 },
          {
            opacity: 0.15,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
          }
        )
      }
    },
    [active, count]
  )

  const goNext = useCallback(() => {
    goToSlide((active + 1) % count)
  }, [active, count, goToSlide])

  const goPrev = useCallback(() => {
    goToSlide((active - 1 + count) % count)
  }, [active, count, goToSlide])

  // Initial Ken Burns on first image
  useGSAP(
    () => {
      if (!containerRef.current || count === 0) return
      const firstSlide = containerRef.current.querySelector('[data-slide="0"]') as HTMLElement
      if (!firstSlide) return
      firstSlide.classList.add('slide-active')
      firstSlide.style.visibility = 'visible'
      firstSlide.style.zIndex = '1'

      const img = firstSlide.querySelector('img')
      if (img) {
        // Entrance animation — scale from 1.2 to 1.0
        gsap.fromTo(
          img,
          { scale: 1.2 },
          { scale: 1.0, duration: SLIDE_INTERVAL, ease: 'none' }
        )
      }

      // Entrance: fade in + slight upward movement
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      )
    },
    { scope: containerRef, dependencies: [] }
  )

  // Autoplay progress bar
  useEffect(() => {
    if (!hasMultiple || isHovering) {
      if (autoplayRef.current) {
        autoplayRef.current.kill()
        autoplayRef.current = null
      }
      return
    }

    // Animate progress bar from 0% to 100%, then advance
    if (progressRef.current) {
      gsap.set(progressRef.current, { scaleX: 0 })
      autoplayRef.current = gsap.to(progressRef.current, {
        scaleX: 1,
        duration: SLIDE_INTERVAL,
        ease: 'none',
        onComplete: () => {
          goNext()
        },
      })
    }

    return () => {
      if (autoplayRef.current) {
        autoplayRef.current.kill()
        autoplayRef.current = null
      }
    }
  }, [active, hasMultiple, isHovering, goNext])

  // Touch / swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null
    // Only trigger if horizontal swipe > 50px and more horizontal than vertical
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext()
      else goPrev()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  if (!images || count === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-[#111] border border-white/5 flex items-center justify-center">
        <div className="text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="w-16 h-16 text-white/10 mx-auto mb-3"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <p className="text-white/20 text-sm font-heading tracking-wider">
            Photos Coming Soon
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="select-none" style={{ opacity: 0 }}>
      {/* ─── Main Slideshow ─── */}
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-[#0a0a0a]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide layers */}
        {images.map((src, i) => (
          <div
            key={i}
            data-slide={i}
            className="absolute inset-0 overflow-hidden"
            style={{ visibility: 'hidden', zIndex: 0 }}
          >
            <img
              src={src}
              alt={name ? `${name} — photo ${i + 1}` : `Photo ${i + 1}`}
              className="w-full h-full object-cover will-change-transform"
              draggable={false}
            />
          </div>
        ))}

        {/* Gold flash overlay */}
        <div
          className="slide-flash absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(208,185,112,0.4) 0%, transparent 70%)',
            opacity: 0,
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 pointer-events-none z-10 border border-white/[0.06] rounded-lg" />

        {/* Navigation arrows (desktop) */}
        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold/30 transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
              style={{ opacity: isHovering ? 1 : 0, transition: 'opacity 0.3s' }}
              aria-label="Previous photo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold/30 transition-all"
              style={{ opacity: isHovering ? 1 : 0, transition: 'opacity 0.3s' }}
              aria-label="Next photo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </>
        )}

        {/* Counter badge */}
        {hasMultiple && (
          <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
            <span className="text-white/70 text-[10px] font-heading tracking-[0.2em]">
              {active + 1}
              <span className="text-white/25 mx-1">/</span>
              {count}
            </span>
          </div>
        )}

        {/* Autoplay progress bar */}
        {hasMultiple && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-white/5">
            <div
              ref={progressRef}
              className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold/60 origin-left"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        )}
      </div>

      {/* ─── Thumbnails ─── */}
      {hasMultiple && (
        <div className="mt-3 relative">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] overflow-hidden rounded transition-all duration-400 ${
                  i === active
                    ? 'ring-2 ring-gold ring-offset-1 ring-offset-[#0a0a0a] opacity-100 scale-105'
                    : 'border border-white/10 opacity-40 hover:opacity-70'
                }`}
                aria-label={`View photo ${i + 1}`}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {i === active && (
                  <div className="absolute inset-0 border-2 border-gold/30 rounded" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
