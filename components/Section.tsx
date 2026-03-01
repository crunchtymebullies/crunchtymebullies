'use client'

import { useEffect, useRef } from 'react'

export default function Section({
  children, className = '', label, heading, subheading, dark = false, ...rest
}: {
  children: React.ReactNode; className?: string; label?: string; heading?: string; subheading?: string; dark?: boolean; [key: string]: any;
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); observer.unobserve(el) } },
      { threshold: 0.1, rootMargin: '-40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className={`py-20 md:py-28 reveal reveal-fade-up ${dark ? 'bg-brand-dark' : ''} ${className}`}>
      <div className="max-w-site mx-auto px-4 md:px-8">
        {(label || heading) && (
          <div className="text-center mb-16">
            {label && <span className="section-label mb-4 block">{label}</span>}
            {heading && <h2 className="font-display text-white text-4xl md:text-5xl mb-4">{heading}</h2>}
            {subheading && <p className="text-white/40 font-body max-w-2xl mx-auto">{subheading}</p>}
            <div className="reveal-line h-px bg-gold/40 mx-auto mt-6" />
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
