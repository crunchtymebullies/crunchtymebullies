'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { gsap, useGSAP } from '@/lib/gsapConfig'

interface MediaItem {
  url: string
  type: 'image' | 'video'
}

interface DogGalleryProps {
  /** @deprecated Use `media` instead */
  images?: string[]
  media?: MediaItem[]
  name?: string
}

export default function DogGallery({ images, media, name }: DogGalleryProps) {
  // Support both old `images` prop (string[]) and new `media` prop
  const items: MediaItem[] = media
    ? media
    : (images || []).map(url => ({ url, type: 'image' as const }))

  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<gsap.core.Tween | null>(null)
  const isAnimatingRef = useRef(false)
  const gsapReadyRef = useRef(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())

  const [active, setActive] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)

  const count = items.length
  const hasMultiple = count > 1
  const activeItem = items[active]
  const isActiveVideo = activeItem?.type === 'video'
  const SLIDE_INTERVAL = 5 // seconds

  // Transition patterns
  const transitions = [
    { from: 'polygon(0 0, 0 0, 0 100%, 0 100%)', to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
    { from: 'circle(0% at 50% 50%)', to: 'circle(75% at 50% 50%)' },
    { from: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)', to: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
    { from: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)', to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
    { from: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
  ]

  // Pause all videos except the active one
  const pauseAllVideos = useCallback(() => {
    videoRefs.current.forEach((video) => {
      if (!video.paused) video.pause()
    })
    setVideoPlaying(false)
  }, [])

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimatingRef.current || index === active || !containerRef.current) return
      isAnimatingRef.current = true
      pauseAllVideos()

      const container = containerRef.current
      const currentSlide = container.querySelector('.slide-active') as HTMLElement
      const nextSlide = container.querySelector(`[data-slide="${index}"]`) as HTMLElement
      if (!currentSlide || !nextSlide) {
        isAnimatingRef.current = false
        return
      }

      const t = transitions[Math.floor(Math.random() * transitions.length)]
      const nextItem = items[index]

      // Ken Burns on current slide (only for images)
      const currentImg = currentSlide.querySelector('img')
      if (currentImg) {
        gsap.to(currentImg, { scale: 1.15, duration: 1.2, ease: 'power2.inOut' })
      }

      // Prepare next slide
      nextSlide.style.zIndex = '2'
      nextSlide.style.visibility = 'visible'
      if (nextItem.type === 'image') {
        const nextImg = nextSlide.querySelector('img')
        if (nextImg) gsap.set(nextImg, { scale: 1.1 })
      }

      // Clip-path reveal
      gsap.fromTo(nextSlide,
        { clipPath: t.from, opacity: 1 },
        {
          clipPath: t.to, duration: 1.2, ease: 'power3.inOut',
          onComplete: () => {
            if (nextItem.type === 'image') {
              const nextImg = nextSlide.querySelector('img')
              if (nextImg) gsap.to(nextImg, { scale: 1.0, duration: SLIDE_INTERVAL, ease: 'none' })
            }
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

      // Gold flash overlay
      const flash = container.querySelector('.slide-flash') as HTMLElement
      if (flash) {
        gsap.fromTo(flash, { opacity: 0 }, { opacity: 0.15, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' })
      }
    },
    [active, count, pauseAllVideos]
  )

  const goNext = useCallback(() => {
    goToSlide((active + 1) % count)
  }, [active, count, goToSlide])

  const goPrev = useCallback(() => {
    goToSlide((active - 1 + count) % count)
  }, [active, count, goToSlide])

  // Toggle video play/pause
  const toggleVideo = useCallback(() => {
    const video = videoRefs.current.get(active)
    if (!video) return
    if (video.paused) {
      video.play()
      setVideoPlaying(true)
    } else {
      video.pause()
      setVideoPlaying(false)
    }
  }, [active])

  // GSAP — Ken Burns on first image
  useGSAP(
    () => {
      if (!containerRef.current || count === 0) return
      gsapReadyRef.current = true
      if (items[0]?.type !== 'image') return

      const firstSlide = containerRef.current.querySelector('[data-slide="0"]') as HTMLElement
      if (!firstSlide) return

      const img = firstSlide.querySelector('img')
      if (img) {
        gsap.fromTo(img, { scale: 1.15 }, { scale: 1.0, duration: SLIDE_INTERVAL, ease: 'none' })
      }
    },
    { scope: containerRef, dependencies: [] }
  )

  // Autoplay progress bar — pause when a video is playing
  useEffect(() => {
    if (!hasMultiple || isHovering || videoPlaying) {
      if (autoplayRef.current) { autoplayRef.current.kill(); autoplayRef.current = null }
      return
    }

    if (progressRef.current) {
      gsap.set(progressRef.current, { scaleX: 0 })
      autoplayRef.current = gsap.to(progressRef.current, {
        scaleX: 1, duration: isActiveVideo ? 15 : SLIDE_INTERVAL, ease: 'none',
        onComplete: () => goNext(),
      })
    }

    return () => {
      if (autoplayRef.current) { autoplayRef.current.kill(); autoplayRef.current = null }
    }
  }, [active, hasMultiple, isHovering, videoPlaying, isActiveVideo, goNext])

  // Touch / swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext(); else goPrev()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === ' ' && isActiveVideo) { e.preventDefault(); toggleVideo() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, isActiveVideo, toggleVideo])

  if (!items || count === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-[#111] border border-white/5 flex items-center justify-center">
        <div className="text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 text-white/10 mx-auto mb-3">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
          </svg>
          <p className="text-white/20 text-sm font-heading tracking-wider">Photos Coming Soon</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="select-none">
      {/* Main Slideshow */}
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-[#0a0a0a]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide layers */}
        {items.map((item, i) => (
          <div
            key={i}
            data-slide={i}
            className={`absolute inset-0 overflow-hidden ${i === 0 ? 'slide-active' : ''}`}
            style={{
              visibility: i === 0 ? 'visible' : 'hidden',
              zIndex: i === 0 ? 1 : 0,
            }}
          >
            {item.type === 'video' ? (
              <video
                ref={el => { if (el) videoRefs.current.set(i, el) }}
                src={item.url}
                className="w-full h-full object-cover"
                playsInline
                loop
                muted={false}
                preload="metadata"
                onClick={toggleVideo}
                onEnded={() => setVideoPlaying(false)}
              />
            ) : (
              <img
                src={item.url}
                alt={name ? `${name} — photo ${i + 1}` : `Photo ${i + 1}`}
                className="w-full h-full object-cover will-change-transform"
                draggable={false}
              />
            )}
          </div>
        ))}

        {/* Video play/pause overlay */}
        {isActiveVideo && (
          <button
            onClick={toggleVideo}
            className="absolute inset-0 z-10 flex items-center justify-center group cursor-pointer"
            aria-label={videoPlaying ? 'Pause video' : 'Play video'}
          >
            <div className={`w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-black/70 ${videoPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
              {videoPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              )}
            </div>
          </button>
        )}

        {/* Gold flash overlay */}
        <div
          className="slide-flash absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(ellipse at center, rgba(208,185,112,0.4) 0%, transparent 70%)', opacity: 0 }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 pointer-events-none z-10 border border-white/[0.06] rounded-lg" />

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <button onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold/30 transition-all duration-300"
              style={{ opacity: isHovering ? 1 : 0, transition: 'opacity 0.3s' }}
              aria-label="Previous photo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold/30 transition-all duration-300"
              style={{ opacity: isHovering ? 1 : 0, transition: 'opacity 0.3s' }}
              aria-label="Next photo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 6 15 12 9 18" /></svg>
            </button>
          </>
        )}

        {/* Counter badge */}
        {hasMultiple && (
          <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
            <span className="text-white/70 text-[10px] font-heading tracking-[0.2em]">
              {isActiveVideo && <span className="text-blue-400 mr-1">VIDEO</span>}
              {active + 1}<span className="text-white/25 mx-1">/</span>{count}
            </span>
          </div>
        )}

        {/* Autoplay progress bar */}
        {hasMultiple && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-white/5">
            <div ref={progressRef} className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold/60 origin-left" style={{ transform: 'scaleX(0)' }} />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="mt-3 relative">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {items.map((item, i) => (
              <button key={i} onClick={() => goToSlide(i)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] overflow-hidden rounded transition-all duration-300 ${
                  i === active
                    ? 'ring-2 ring-gold ring-offset-1 ring-offset-[#0a0a0a] opacity-100 scale-105'
                    : 'border border-white/10 opacity-40 hover:opacity-70'
                }`}
                aria-label={`View ${item.type === 'video' ? 'video' : 'photo'} ${i + 1}`}>
                {item.type === 'video' ? (
                  <>
                    <video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/80"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                  </>
                ) : (
                  <img src={item.url} alt="" className="w-full h-full object-cover" draggable={false} />
                )}
                {i === active && <div className="absolute inset-0 border-2 border-gold/30 rounded" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
