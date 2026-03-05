import { getStoreProducts, type StoreProduct } from '@/lib/store-api'
import type { Metadata } from 'next'
import ShopGrid from './ShopGrid'

export const metadata: Metadata = {
  title: 'Shop — Crunchtyme Bullies',
  description: 'Shop premium Crunchtyme Bullies apparel, hats, hoodies, and more.',
}

export const revalidate = 60

export default async function ShopPage() {
  let products: StoreProduct[] = []
  try {
    const res = await getStoreProducts({ limit: 50 })
    products = res.products
  } catch (err) {
    console.error('Failed to load store products:', err)
  }

  return <ShopGrid products={products} />
}
