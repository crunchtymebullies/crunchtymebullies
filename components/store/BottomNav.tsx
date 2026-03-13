'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Search, LayoutGrid, ShoppingBag, X } from 'lucide-react'
import { useCart } from './CartProvider'

export default function BottomNav() {
  const { itemCount, toggleCart } = useCart()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-[#050507]/95 backdrop-blur-xl flex items-start justify-center pt-[25vh] px-6 animate-fade-in">
          <div className="w-full max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                autoFocus
                className="w-full bg-transparent border-b-2 border-gold/40 text-white text-2xl font-display placeholder:text-white/15 py-4 pr-12 focus:outline-none focus:border-gold transition-colors"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-white/15 text-xs font-heading tracking-wider mt-4">
              Try: hoodies, hats, sweatpants...
            </p>
          </div>
        </div>
      )}

      {/* Bottom nav bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-2xl border-t border-white/[0.06]">
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            href="/shop"
            className="flex flex-col items-center gap-0.5 text-white/40 active:text-gold transition-colors py-1 px-3"
          >
            <Home size={20} strokeWidth={1.5} />
            <span className="text-[9px] tracking-wider uppercase font-heading">Shop</span>
          </Link>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center gap-0.5 text-white/40 active:text-gold transition-colors py-1 px-3"
          >
            <Search size={20} strokeWidth={1.5} />
            <span className="text-[9px] tracking-wider uppercase font-heading">Search</span>
          </button>

          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 text-white/40 active:text-gold transition-colors py-1 px-3"
          >
            <LayoutGrid size={20} strokeWidth={1.5} />
            <span className="text-[9px] tracking-wider uppercase font-heading">Home</span>
          </Link>

          <button
            onClick={toggleCart}
            className="flex flex-col items-center gap-0.5 text-white/40 active:text-gold transition-colors py-1 px-3 relative"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="text-[9px] tracking-wider uppercase font-heading">Cart</span>
            {itemCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-gold text-[#050507] text-[8px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Safe area spacer for notched phones */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  )
}
