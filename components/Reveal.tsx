'use client'

import { useEffect, useRef } from 'react'

type Animation = 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale-up' | 'clip-up'

interface RevealProps {
  children: React.ReactNode
  animation?: Animation
  delay?: number
  duration?: number
  className?: string
  stagger?: number  // stagger delay per child (ms)
  once?: boolean
  threshold?: number
  as?: keyof JSX.IntrinsicElements
}

export default function Reveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  className = '',
  stagger = 0,
  once = true,
  threshold = 0.15,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If stagger is set, apply incremental delays to direct children
    if (stagger > 0) {
      Array.from(el.children).forEach((child, i) => {
        ;(child as HTMLElement).style.transitionDelay = `${delay + i * stagger}ms`
      })
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          if (once) observer.unobserve(el)
        } else if (!once) {
          el.classList.remove('revealed')
        }
      },
      { threshold, rootMargin: '-30px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, stagger, once, threshold])

  return (
    <Tag
      ref={ref as any}
      className={`reveal reveal-${animation} ${className}`}
      style={{
        transitionDelay: stagger ? undefined : `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </Tag>
  )
}
