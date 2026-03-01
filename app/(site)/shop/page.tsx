import Link from 'next/link'
import Image from 'next/image'
import Section from '@/components/Section'
import { getProducts, getProductCategories } from '@/lib/medusa'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Shop premium dog care products from Crunchtime Bullies. Shampoo, treats, supplements, and more.',
}

// Fallback product card when Medusa isn't connected yet
function ProductCardPlaceholder({ product }: { product: any }) {
  const price = product.variants?.[0]?.prices?.[0]
  const formattedPrice = price
    ? `$${(price.amount / 100).toFixed(2)}`
    : 'Price TBD'

  return (
    <Link href={`/shop/${product.handle}`} className="group card card-hover">
      <div className="relative aspect-square overflow-hidden bg-brand-charcoal">
        {product.thumbnail && (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
      <div className="p-5">
        <h3 className="text-white text-sm font-heading tracking-wide group-hover:text-gold transition-colors">
          {product.title}
        </h3>
        <p className="text-gold text-sm font-heading mt-2">{formattedPrice}</p>
      </div>
    </Link>
  )
}

export default async function ShopPage() {
  let products: any[] = []
  let categories: any[] = []

  try {
    const [productRes, categoryRes] = await Promise.all([
      getProducts({ limit: 50 }),
      getProductCategories(),
    ])
    products = productRes.products
    categories = categoryRes.product_categories
  } catch {
    // Medusa not connected yet — show placeholder
  }

  return (
    <>
      <div className="page-banner">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <span className="section-label">Crunchtime Bullies</span>
          <h1 className="page-banner-title">Shop</h1>
          <p className="section-subheading mx-auto mt-4">
            Premium products for your American Bully — from care essentials to accessories.
          </p>
        </div>
      </div>

      <Section>
        {products.length > 0 ? (
          <>
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-12">
                <button className="text-gold text-xs tracking-[0.15em] uppercase font-heading px-4 py-2 border border-gold">
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className="text-white/40 text-xs tracking-[0.15em] uppercase font-heading px-4 py-2 border border-white/10 hover:text-gold hover:border-gold/30 transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCardPlaceholder key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <span className="section-label">Coming Soon</span>
            <h2 className="text-2xl font-display text-white mt-4 mb-4">Shop Under Construction</h2>
            <p className="text-white/40 font-body max-w-md mx-auto mb-8">
              We&apos;re setting up our online store with premium dog care products.
              Check back soon or contact us directly.
            </p>
            <Link href="/contact" className="btn-gold-outline btn-sm">Contact Us</Link>
          </div>
        )}
      </Section>
    </>
  )
}
