'use client'

import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight
        const pct = total > 0 ? (window.scrollY / total) * 100 : 0
        if (barRef.current) barRef.current.style.width = `${pct}%`
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[100]">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold/60"
        style={{ width: '0%', willChange: 'width' }}
      />
    </div>
  )
}
