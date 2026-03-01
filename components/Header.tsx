'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { client, SITE_SETTINGS_QUERY } from '@/lib/sanity'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Dogs', href: '/dogs' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    client.fetch(SITE_SETTINGS_QUERY).then(setSettings).catch(() => {})
  }, [])

  const logoUrl = settings?.logo?.asset?.url
  const announcement = settings?.announcement

  return (
    <>
      {/* Announcement Bar */}
      {announcement?.active !== false && (
        <div className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark py-2 text-center">
          <Link href={announcement?.link || '/shop'} className="text-brand-black text-xs tracking-[0.2em] uppercase font-heading font-semibold hover:underline">
            {announcement?.text || 'Free Shipping on Orders Over $40'} — Shop Now
          </Link>
        </div>
      )}

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
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Crunchtime Bullies"
                width={60}
                height={60}
                className="rounded-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center group-hover:border-gold transition-colors duration-300">
                <span className="font-display text-gold text-xl">CT</span>
              </div>
            )}
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
                className="text-white/60 hover:text-gold text-xs tracking-[0.15em] uppercase font-heading transition-colors duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link href="/shop" className="text-white/60 hover:text-gold transition-colors">
              <ShoppingBag size={20} />
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-white/60 hover:text-gold transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
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
            className="fixed inset-0 z-40 bg-brand-black/98 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <nav className="flex flex-col items-center gap-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-white text-2xl font-display hover:text-gold transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="btn-gold"
              >
                Get In Touch
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
