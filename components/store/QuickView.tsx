'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag, ChevronRight, Minus, Plus } from 'lucide-react'
import { useCart } from '@/components/store/CartProvider'
import { formatPrice, type StoreProduct } from '@/lib/store-api'

interface QuickViewProps {
  product: StoreProduct | null
  onClose: () => void
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const { addToCart, loading: cartLoading } = useCart()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [imageIdx, setImageIdx] = useState(0)

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1)
      setImageIdx(0)
      // Pre-select first option values
      const defaults: Record<string, string> = {}
      for (const opt of product.options || []) {
        if (opt.values?.[0]) defaults[opt.id] = opt.values[0].value
      }
      setSelectedOptions(defaults)
    }
  }, [product])

  // Find matching variant — Medusa v2 returns options as array of {value, option_id} objects
  const matchedVariant = product?.variants?.find(v => {
    const varOpts = Array.isArray(v.options)
      ? v.options.map((o: any) => o.value)
      : Object.values(v.options || {})
    return Object.values(selectedOptions).every(val => varOpts.includes(val))
  }) || product?.variants?.[0]

  const price = matchedVariant?.calculated_price
  const images = product?.thumbnail ? [product.thumbnail, ...(product.images?.map(i => i.url) || [])] : product?.images?.map(i => i.url) || []

  const handleAdd = useCallback(async () => {
    if (!matchedVariant) return
    setAdding(true)
    try {
      await addToCart(matchedVariant.id, quantity)
      onClose()
    } catch (err) {
      console.error('Failed to add to cart:', err)
    }
    setAdding(false)
  }, [matchedVariant, quantity, addToCart, onClose])

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!product) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'quickview-in 0.3s ease-out' }}
      >
        <style>{`
          @keyframes quickview-in {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
          <X size={18} />
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative aspect-square bg-[#111] overflow-hidden">
              {images[imageIdx] ? (
                <Image
                  src={images[imageIdx]}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/10 font-display text-4xl">CT</span>
                </div>
              )}
              {/* Thumbnail dots */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setImageIdx(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === imageIdx ? 'bg-gold' : 'bg-white/30'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col">
              <h2 className="text-white text-xl font-display mb-1">{product.title}</h2>

              {price && (
                <p className="text-gold text-lg font-heading mb-3">
                  {formatPrice(price.calculated_amount, price.currency_code)}
                </p>
              )}

              {product.description && (
                <p className="text-white/40 text-sm font-body leading-relaxed mb-4 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Options */}
              {(product.options || []).map(opt => (
                <div key={opt.id} className="mb-4">
                  <label className="text-white/50 text-xs uppercase tracking-wider font-heading block mb-2">
                    {opt.title}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {opt.values?.map(val => {
                      const isSelected = selectedOptions[opt.id] === val.value
                      return (
                        <button key={val.id} onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.id]: val.value }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-heading border transition-all ${
                            isSelected
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                          }`}>
                          {val.value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="mb-4">
                <label className="text-white/50 text-xs uppercase tracking-wider font-heading block mb-2">Quantity</label>
                <div className="flex items-center gap-0 border border-white/10 rounded-lg w-fit overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-white text-sm font-heading border-x border-white/10">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-auto space-y-2 pt-4">
                {/* Add to Cart */}
                <button onClick={handleAdd} disabled={adding || cartLoading || !matchedVariant}
                  className="w-full py-3.5 rounded-xl bg-gold text-[#0a0a0a] font-heading font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors disabled:opacity-50">
                  <ShoppingBag size={16} />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>

                {/* View Full Details */}
                <Link href={`/shop/${product.handle}`} onClick={onClose}
                  className="w-full py-3 rounded-xl border border-white/10 text-white/50 text-sm font-heading tracking-wider uppercase flex items-center justify-center gap-2 hover:text-gold hover:border-gold/30 transition-colors">
                  View Full Details <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
