'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

interface ProductDetailModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const { addItem, isLoading, error, clearError } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState(
    product?.variants?.[0]?.id || null
  )
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (!isOpen || !product) return null

  const selectedVariant = product.variants?.find(
    (v: any) => v.id === selectedVariantId
  )
  const price = selectedVariant?.prices?.[0]
  const formattedPrice = price
    ? `$${(price.amount / 100).toFixed(2)}`
    : 'Price TBD'

  const handleAddToCart = async () => {
    if (!selectedVariantId) return

    try {
      clearError()
      await addItem(selectedVariantId, quantity)
      setAdded(true)
      setTimeout(() => {
        setAdded(false)
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Failed to add to cart:', err)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-brand-dark border border-gold/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/40 hover:text-white bg-brand-black/50 p-2 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
          {/* Image */}
          <div className="flex items-center justify-center bg-brand-black/30 rounded-xl overflow-hidden aspect-square">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white/20 text-center">
                <ShoppingBag size={48} className="mx-auto mb-2" />
                <p className="text-sm">No image available</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-display text-white mb-2">
                {product.title}
              </h2>
              <p className="text-gold text-2xl font-heading mb-6">
                {formattedPrice}
              </p>

              {product.description && (
                <p className="text-white/60 font-body text-sm mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 1 && (
                <div className="mb-8">
                  <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-3">
                    Select Option
                  </label>
                  <div className="space-y-2">
                    {product.variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                          selectedVariantId === variant.id
                            ? 'border-gold bg-gold/10 text-white'
                            : 'border-white/10 bg-transparent text-white/60 hover:border-gold/30'
                        }`}
                      >
                        <p className="font-heading text-sm">
                          {variant.title || 'Default'}
                        </p>
                        {variant.prices?.[0] && (
                          <p className="text-gold text-xs mt-1">
                            ${(variant.prices[0].amount / 100).toFixed(2)}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 border border-white/10 rounded-lg hover:border-gold/40 disabled:opacity-30 transition-colors"
                  >
                    <Minus size={18} className="text-white/60" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-white font-body focus:border-gold/40 focus:outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-white/10 rounded-lg hover:border-gold/40 transition-colors"
                  >
                    <Plus size={18} className="text-white/60" />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex gap-3">
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm font-body">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {added && (
                <div className="mb-6 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
                  <p className="text-emerald-300 text-sm font-heading text-center">
                    ✓ Added to cart!
                  </p>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariantId || isLoading || added}
              className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : added ? (
                <>
                  <ShoppingBag size={18} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
