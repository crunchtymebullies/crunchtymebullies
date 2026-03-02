'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, animate, PanInfo } from 'framer-motion'

interface Props {
  children: React.ReactNode[]
  autoPlay?: boolean
  autoPlayMs?: number
  showDots?: boolean
  className?: string
}

export default function SwipeCarousel({ children, autoPlay = true, autoPlayMs = 5000, showDots = true, className = '' }: Props) {
  const [idx, setIdx] = useState(0)
  const [width, setWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const total = children.length

  // Measure container width
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Motion
  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.8 })

  // Auto-play
  useEffect(() => {
    if (!autoPlay || !width) return
    const timer = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % total
        animate(x, -next * width, { type: 'spring', stiffness: 300, damping: 30 })
        return next
      })
    }, autoPlayMs)
    return () => clearInterval(timer)
  }, [autoPlay, autoPlayMs, width, total, x])

  const goTo = (i: number) => {
    setIdx(i)
    animate(x, -i * width, { type: 'spring', stiffness: 300, damping: 30 })
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = width * 0.2
    const velocity = info.velocity.x
    let newIdx = idx

    if (info.offset.x < -threshold || velocity < -500) {
      newIdx = Math.min(idx + 1, total - 1)
    } else if (info.offset.x > threshold || velocity > 500) {
      newIdx = Math.max(idx - 1, 0)
    }

    goTo(newIdx)
  }

  // Opacity transform for active card indicator
  const progress = useTransform(springX, (v) => width ? Math.abs(v / width) : 0)

  if (!width) {
    return <div ref={containerRef} className={`overflow-hidden ${className}`}><div className="opacity-0">{children[0]}</div></div>
  }

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex cursor-grab active:cursor-grabbing"
        style={{ x: springX, width: total * width }}
        drag="x"
        dragConstraints={{ left: -(total - 1) * width, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        {children.map((child, i) => (
          <motion.div
            key={i}
            style={{ width, minWidth: width }}
            className="px-2 md:px-0"
          >
            {child}
          </motion.div>
        ))}
      </motion.div>

      {/* Dots */}
      {showDots && total > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {children.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === idx ? 'w-8 bg-gold' : 'w-1.5 bg-white/15 hover:bg-white/25'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
