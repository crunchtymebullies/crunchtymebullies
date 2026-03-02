'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function GoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-black relative">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(208,185,112,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(208,185,112,0.4) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      <div className="sticky top-0 z-50 bg-brand-black/90 backdrop-blur-xl border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/go" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
              <span className="font-display text-gold text-sm">CT</span>
            </div>
            <div>
              <p className="text-white text-sm font-display leading-none">Command Center</p>
              <p className="text-gold/40 text-[9px] tracking-[0.3em] uppercase font-heading">Crunchtyme Bullies</p>
            </div>
          </Link>
          <Link href="/" className="text-white/30 text-xs font-heading hover:text-gold transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Main Site
          </Link>
        </div>
      </div>
      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">{children}</main>
    </div>
  )
}
