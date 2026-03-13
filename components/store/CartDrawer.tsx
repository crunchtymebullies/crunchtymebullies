'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from './CartProvider'
import { formatPrice } from '@/lib/store-api'

const FREE_SHIPPING_THRESHOLD = 4000 // $40 in cents

export default function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, total, itemCount, loading, updateItem, removeItem } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    import('gsap').then(({ gsap }) => {
      if (overlayRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      }
      if (drawerRef.current) {
        gsap.fromTo(drawerRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.45, ease: 'power3.out' }
        )
        gsap.fromTo(drawerRef.current.querySelectorAll('.cart-item'),
          { x: 40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.2 }
        )
      }
    })
  }, [isOpen])

  const handleClose = () => {
    import('gsap').then(({ gsap }) => {
      const tl = gsap.timeline({ onComplete: closeCart })
      if (drawerRef.current) tl.to(drawerRef.current, { x: '100%', duration: 0.35, ease: 'power3.in' }, 0)
      if (overlayRef.current) tl.to(overlayRef.current, { opacity: 0, duration: 0.25 }, 0.1)
    })
  }

  if (!isOpen) return null

  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const shippingRemaining = FREE_SHIPPING_THRESHOLD - subtotal

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0c] border-l border-white/[0.06] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-gold" />
            <h2 className="text-white font-display text-lg">Your Cart</h2>
            <span className="text-white/20 text-xs font-heading">({itemCount})</span>
          </div>
          <button onClick={handleClose} className="text-white/30 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="px-6 py-3 border-b border-white/[0.04]">
          {shippingRemaining > 0 ? (
            <p className="text-white/30 text-[11px] font-heading tracking-wider mb-2">
              Add <span className="text-gold">{formatPrice(shippingRemaining)}</span> for free shipping
            </p>
          ) : (
            <p className="text-emerald-400 text-[11px] font-heading tracking-wider mb-2">
              ✓ Free shipping unlocked!
            </p>
          )}
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-700 ease-out"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={40} className="text-white/10 mb-4" />
              <p className="text-white/25 font-display text-lg mb-2">Cart is empty</p>
              <p className="text-white/15 text-sm font-body mb-6">Browse our collection to find something you love.</p>
              <button onClick={handleClose} className="text-gold text-xs tracking-[0.2em] uppercase font-heading flex items-center gap-2 hover:gap-3 transition-all">
                Continue Shopping <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item flex gap-4 group">
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-white/[0.03] rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.06]">
                  {(item.thumbnail || item.product?.thumbnail) ? (
                    <Image
                      src={item.thumbnail || item.product.thumbnail || ''}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <ShoppingBag size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-heading truncate">{item.product?.title || item.title}</p>
                  <p className="text-white/25 text-[10px] font-heading tracking-wider mt-0.5">{item.variant?.title}</p>
                  <p className="text-gold text-sm font-heading mt-1">{formatPrice(item.unit_price)}</p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-white/10 rounded-md">
                      <button
                        onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="p-1.5 text-white/30 hover:text-white transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-white text-xs font-heading w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="p-1.5 text-white/30 hover:text-white transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-white/15 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — sticky checkout */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-sm font-heading">Subtotal</span>
              <span className="text-white font-display text-lg">{formatPrice(subtotal || total)}</span>
            </div>
            <p className="text-white/15 text-[10px] font-heading tracking-wider">
              Shipping & taxes calculated at checkout
            </p>
            <Link
              href="/shop/checkout"
              onClick={handleClose}
              className="block w-full py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-dark text-[#050507] text-sm font-heading font-bold tracking-[0.2em] uppercase text-center transition-all hover:shadow-[0_0_30px_rgba(208,185,112,0.3)]"
            >
              {loading ? 'Updating...' : 'Checkout'}
            </Link>
            <button
              onClick={handleClose}
              className="w-full text-center text-white/25 text-xs font-heading tracking-wider hover:text-white/40 transition-colors py-1"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
