'use client'

import { useState } from 'react'
import ProductCard from '@/components/store/ProductCard'
import QuickView from '@/components/store/QuickView'
import type { StoreProduct } from '@/lib/store-api'

export default function ShopGrid({ products }: { products: StoreProduct[] }) {
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null)

  return (
    <>
      {/* Hero */}
      <section className="relative pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-2">
            <span className="text-gold/50 text-[10px] tracking-[0.4em] uppercase font-heading">Crunchtyme Bullies</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display text-white mb-3">Shop</h1>
          <p className="text-white/35 font-body text-sm md:text-base max-w-lg">
            Premium apparel and accessories. Rep the brand.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-4 md:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={() => setQuickViewProduct(product)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/30 font-body">Products loading soon. Check back shortly!</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </>
  )
}
