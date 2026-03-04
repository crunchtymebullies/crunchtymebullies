'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye } from 'lucide-react'
import type { StoreProduct } from '@/lib/store-api'
import { formatPrice, getLowestPrice, getPriceRange } from '@/lib/store-api'

export default function ProductCard({ product, index = 0 }: { product: StoreProduct; index?: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // GSAP scroll reveal
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger)
        gsap.fromTo(el,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.7,
            delay: index * 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true }
          }
        )
      })
    })
  }, [index])

  // 3D tilt + glow follow
  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current
    const glow = glowRef.current
    if (!el || !glow) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (0.5 - y) * 12
    const tiltY = (x - 0.5) * 12
    el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`
    glow.style.background = `radial-gradient(600px circle at ${x * 100}% ${y * 100}%, rgba(208,185,112,0.12), transparent 60%)`
  }

  const handleMouseLeave = () => {
    const el = cardRef.current
    const glow = glowRef.current
    if (el) el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)'
    if (glow) glow.style.background = 'transparent'
    setIsHovered(false)
  }

  const priceRange = getPriceRange(product)
  const lowestPrice = getLowestPrice(product)
  const colorCount = product.options?.find(o => o.title === 'Color')?.values?.length || 0

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group will-change-transform"
      style={{ transition: 'transform 0.15s ease-out' }}
    >
      {/* Glow effect layer */}
      <div ref={glowRef} className="absolute inset-0 rounded-2xl pointer-events-none z-10 transition-opacity duration-300" />

      {/* Border glow on hover */}
      <div className={`absolute -inset-px rounded-2xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
           style={{ background: 'linear-gradient(135deg, rgba(208,185,112,0.3), transparent 50%, rgba(208,185,112,0.15))' }} />

      <Link href={`/shop/${product.handle}`} className="block relative rounded-2xl overflow-hidden bg-[#0e0e12] border border-white/[0.06]">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#0a0a0e]">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0e0e12] to-[#151518] flex items-center justify-center">
              <span className="text-white/5 font-display text-4xl">CT</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-80' : 'opacity-40'}`} />

          {/* Quick view button */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] tracking-[0.2em] uppercase font-heading">
              <Eye size={14} /> Quick View
            </span>
          </div>

          {/* Color count badge */}
          {colorCount > 1 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1">
              <span className="text-white/40 text-[10px] font-heading tracking-wider">
                {colorCount} colors
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 relative z-10">
          <h3 className={`text-sm font-heading tracking-wide transition-colors duration-300 line-clamp-1 ${isHovered ? 'text-gold' : 'text-white/80'}`}>
            {product.title}
          </h3>

          <div className="flex items-center justify-between mt-2">
            {priceRange ? (
              priceRange.min === priceRange.max ? (
                <span className="text-gold/80 text-sm font-heading">{formatPrice(priceRange.min, priceRange.currency)}</span>
              ) : (
                <span className="text-gold/80 text-sm font-heading">
                  {formatPrice(priceRange.min, priceRange.currency)} – {formatPrice(priceRange.max, priceRange.currency)}
                </span>
              )
            ) : (
              <span className="text-white/20 text-sm font-heading">Price TBD</span>
            )}

            <span className={`text-[10px] tracking-wider font-heading transition-all duration-300 ${isHovered ? 'text-gold translate-x-0 opacity-100' : 'text-transparent -translate-x-2 opacity-0'}`}>
              View →
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
