'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, ChevronLeft, Minus, Plus, Check, Truck, Shield, RotateCcw } from 'lucide-react'
import { useCart } from '@/components/store/CartProvider'
import { formatPrice, type StoreProduct } from '@/lib/store-api'

export default function ProductDetail({ product }: { product: StoreProduct }) {
  const { addToCart, loading: cartLoading } = useCart()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    for (const opt of product.options || []) {
      if (opt.values?.[0]) defaults[opt.id] = opt.values[0].value
    }
    return defaults
  })
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  // Build image list
  const images = [
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...(product.images?.map(i => i.url) || []),
  ].filter((v, i, a) => a.indexOf(v) === i) // dedupe

  // Find matching variant — Medusa v2 returns options as array of {value, option_id} objects
  const matchedVariant = product.variants?.find(v => {
    const varOpts = Array.isArray(v.options)
      ? v.options.map((o: any) => o.value)
      : Object.values(v.options || {})
    return Object.values(selectedOptions).every(val => varOpts.includes(val))
  }) || product.variants?.[0]

  const price = matchedVariant?.calculated_price

  const handleAdd = useCallback(async () => {
    if (!matchedVariant) return
    setAdding(true)
    await addToCart(matchedVariant.id, quantity)
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }, [matchedVariant, quantity, addToCart])

  return (
    <div className="min-h-screen">
      {/* Back nav */}
      <div className="px-4 md:px-8 pt-4 pb-2 max-w-7xl mx-auto">
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-white/40 text-sm font-heading hover:text-gold transition-colors">
          <ChevronLeft size={16} /> Back to Shop
        </Link>
      </div>

      <div className="px-4 md:px-8 pb-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#0e0e12] border border-white/[0.06]">
              {images[activeImage] ? (
                <Image
                  src={images[activeImage]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/5 font-display text-6xl">CT</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                      i === activeImage ? 'border-gold' : 'border-white/10 hover:border-white/20'
                    }`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div>
              <span className="text-gold/40 text-[10px] tracking-[0.3em] uppercase font-heading block mb-2">Crunchtyme Bullies</span>
              <h1 className="text-2xl md:text-3xl font-display text-white mb-3">{product.title}</h1>
              {price && (
                <p className="text-gold text-2xl font-heading">
                  {formatPrice(price.calculated_amount, price.currency_code)}
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-white/40 font-body text-sm leading-relaxed">{product.description}</p>
            )}

            <div className="w-full h-px bg-white/5" />

            {/* Options */}
            {(product.options || []).map(opt => (
              <div key={opt.id}>
                <label className="text-white/50 text-xs uppercase tracking-wider font-heading block mb-3">
                  {opt.title}: <span className="text-white/80">{selectedOptions[opt.id]}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {opt.values?.map(val => {
                    const isSelected = selectedOptions[opt.id] === val.value
                    return (
                      <button key={val.id} onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.id]: val.value }))}
                        className={`px-4 py-2.5 rounded-xl text-sm font-heading border transition-all ${
                          isSelected
                            ? 'border-gold bg-gold/10 text-gold shadow-[0_0_20px_rgba(208,185,112,0.1)]'
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
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider font-heading block mb-3">Quantity</label>
              <div className="flex items-center border border-white/10 rounded-xl w-fit overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-14 h-12 flex items-center justify-center text-white font-heading border-x border-white/10">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button onClick={handleAdd} disabled={adding || cartLoading || !matchedVariant}
              className={`w-full py-4 rounded-xl font-heading font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gold text-[#0a0a0a] hover:bg-gold/90 hover:shadow-[0_4px_30px_rgba(208,185,112,0.25)]'
              }`}>
              {added ? <><Check size={18} /> Added to Cart</> : adding ? 'Adding...' : <><ShoppingBag size={18} /> Add to Cart</>}
            </button>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: 'Free shipping over $40' },
                { icon: Shield, label: 'Secure checkout' },
                { icon: RotateCcw, label: 'Easy returns' },
              ].map((item, i) => (
                <div key={i} className="text-center py-3 px-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <item.icon size={16} className="text-gold/40 mx-auto mb-1.5" />
                  <p className="text-white/25 text-[10px] font-heading leading-tight">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Variant info */}
            {matchedVariant && (
              <p className="text-white/15 text-[10px] font-heading tracking-wider">
                SKU: {matchedVariant.sku || 'N/A'} · Variant: {matchedVariant.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky add-to-cart bar */}
      <div className="fixed bottom-16 left-0 right-0 z-50 p-3 bg-[#050507]/95 backdrop-blur-lg border-t border-white/5 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-heading truncate">{product.title}</p>
            {price && <p className="text-gold text-sm font-heading">{formatPrice(price.calculated_amount, price.currency_code)}</p>}
          </div>
          <button onClick={handleAdd} disabled={adding || cartLoading || !matchedVariant}
            className={`px-6 py-3 rounded-xl font-heading font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shrink-0 ${
              added ? 'bg-emerald-600 text-white' : 'bg-gold text-[#0a0a0a]'
            } disabled:opacity-50`}>
            {added ? <Check size={14} /> : <ShoppingBag size={14} />}
            {added ? 'Added' : adding ? '...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
