'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingBag, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Dogs', href: '/dogs' },
  { label: 'Shop', href: '/shop' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark py-2 text-center">
        <Link href="/shop" className="text-brand-black text-xs tracking-[0.2em] uppercase font-heading font-semibold hover:underline">
          Free Shipping on Orders Over $40 — Shop Now
        </Link>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-brand-black/95 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-site mx-auto px-4 md:px-8 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center group-hover:border-gold transition-colors duration-300">
                <span className="font-display text-gold text-xl">CT</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-white text-lg leading-none">Crunchtime</p>
              <p className="font-heading text-gold text-[10px] tracking-[0.35em] uppercase">Bullies</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/70 text-sm font-heading tracking-[0.15em] uppercase
                           hover:text-gold transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Link href="/account" className="text-white/50 hover:text-gold transition-colors hidden sm:block">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link href="/cart" className="text-white/50 hover:text-gold transition-colors relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="text-white/70 hover:text-gold transition-colors lg:hidden"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-black/98 backdrop-blur-xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 h-20">
                <span className="font-display text-gold text-xl">Crunchtime Bullies</span>
                <button onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-gold">
                  <X size={28} strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex-1 flex flex-col justify-center px-12 gap-2">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 text-white text-3xl font-heading tracking-wide hover:text-gold transition-colors"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="px-12 pb-12">
                <div className="gold-line mb-6" />
                <p className="text-white/30 text-xs font-heading tracking-[0.2em] uppercase">
                  Premium Puppies & Lifestyle Apparel
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
