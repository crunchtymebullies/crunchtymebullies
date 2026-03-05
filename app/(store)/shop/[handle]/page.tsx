import { getStoreProduct, getStoreProducts, type StoreProduct } from '@/lib/store-api'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductDetail from './ProductDetail'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const product = await getStoreProduct(params.handle).catch(() => null)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.title} — Crunchtyme Bullies Shop`,
    description: product.description || `Shop ${product.title} from Crunchtyme Bullies.`,
  }
}

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const product = await getStoreProduct(params.handle).catch(() => null)
  if (!product) notFound()

  return <ProductDetail product={product} />
}
