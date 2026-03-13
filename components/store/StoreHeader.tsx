'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from './CartProvider'

export default function StoreHeader() {
  const { itemCount, toggleCart } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // GSAP header entrance
    import('gsap').then(({ gsap }) => {
      const el = headerRef.current
      if (!el) return
      gsap.fromTo(el.querySelectorAll('.store-header-item'),
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
      )
    })
  }, [])

  return (
    <header
      ref={headerRef}
      className={`hidden md:block sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050507]/90 backdrop-blur-2xl border-b border-white/[0.04]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
        {/* Left — back to main site */}
        <Link
          href="/"
          className="store-header-item flex items-center gap-2 text-white/30 text-[11px] tracking-[0.2em] uppercase font-heading hover:text-white/60 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Main Site
        </Link>

        {/* Center — Logo */}
        <Link href="/shop" className="store-header-item flex flex-col items-center group">
          <span className="text-2xl font-display text-white group-hover:text-gold transition-colors tracking-wider">
            CRUNCHTYME
          </span>
          <span className="text-[9px] tracking-[0.6em] uppercase text-gold/60 font-heading -mt-0.5">
            Supply Co.
          </span>
        </Link>

        {/* Right — Cart */}
        <button
          onClick={toggleCart}
          className="store-header-item relative text-white/50 hover:text-white transition-colors p-2"
          aria-label="Cart"
        >
          <ShoppingBag size={20} strokeWidth={1.5} />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-[#050507] text-[10px] font-heading font-bold rounded-full flex items-center justify-center animate-scale-in">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
