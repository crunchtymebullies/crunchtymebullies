// ═══════════════════════════════════════════════════════════
// CRUNCHTIME BULLIES — Store API (Medusa v2 Store Endpoints)
// ═══════════════════════════════════════════════════════════

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://crunchtime-bullies-backend.fly.dev'
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_API_KEY || process.env.MEDUSA_API_KEY || ''
const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || ''

interface StoreRequestOptions {
  method?: string
  body?: any
  next?: NextFetchRequestConfig
  headers?: Record<string, string>
}

async function storeFetch<T>(path: string, options: StoreRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, next, headers = {} } = options
  const res = await fetch(`${BACKEND_URL}/store${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': API_KEY,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    next,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Store API error ${res.status}: ${err}`)
  }
  return res.json()
}

// ── Products ──

export interface StoreProduct {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  images: { id: string; url: string; rank: number }[]
  variants: StoreVariant[]
  options: StoreOption[]
  collection: { id: string; title: string; handle: string } | null
  categories: { id: string; name: string; handle: string }[]
  metadata: Record<string, string> | null
  created_at: string
  updated_at: string
}

export interface StoreVariant {
  id: string
  title: string
  sku: string | null
  options: Record<string, string>
  calculated_price?: {
    calculated_amount: number
    currency_code: string
    original_amount: number
  }
  metadata: Record<string, string> | null
}

export interface StoreOption {
  id: string
  title: string
  product_id: string
  values: { id: string; value: string }[]
}

export async function getStoreProducts(params?: {
  limit?: number
  offset?: number
  order?: string
}) {
  const sp = new URLSearchParams()
  sp.set('region_id', REGION_ID)
  if (params?.limit) sp.set('limit', String(params.limit))
  if (params?.offset) sp.set('offset', String(params.offset))
  if (params?.order) sp.set('order', params.order)
  
  return storeFetch<{ products: StoreProduct[]; count: number }>(
    `/products?${sp.toString()}`,
    { next: { revalidate: 60 } }
  )
}

export async function getStoreProduct(handle: string) {
  const sp = new URLSearchParams()
  sp.set('region_id', REGION_ID)
  sp.set('handle', handle)
  
  const { products } = await storeFetch<{ products: StoreProduct[] }>(
    `/products?${sp.toString()}`,
    { next: { revalidate: 60 } }
  )
  return products[0] || null
}

// ── Cart ──

export async function createStoreCart() {
  return storeFetch<{ cart: any }>('/carts', {
    method: 'POST',
    body: { region_id: REGION_ID },
  })
}

export async function getStoreCart(cartId: string) {
  return storeFetch<{ cart: any }>(`/carts/${cartId}`)
}

export async function addItemToCart(cartId: string, variantId: string, quantity: number = 1) {
  return storeFetch<{ cart: any }>(`/carts/${cartId}/line-items`, {
    method: 'POST',
    body: { variant_id: variantId, quantity },
  })
}

export async function updateCartItem(cartId: string, lineItemId: string, quantity: number) {
  return storeFetch<{ cart: any }>(`/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'POST',
    body: { quantity },
  })
}

export async function removeCartItem(cartId: string, lineItemId: string) {
  return storeFetch<{ cart: any }>(`/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'DELETE',
  })
}

// ── Checkout ──

export async function updateCartAddress(cartId: string, address: {
  first_name: string; last_name: string; address_1: string; address_2?: string;
  city: string; province: string; postal_code: string; country_code: string; phone?: string;
}, email: string) {
  return storeFetch<{ cart: any }>(`/carts/${cartId}`, {
    method: 'POST',
    body: { shipping_address: address, email },
  })
}

export async function getShippingOptions(cartId: string) {
  return storeFetch<{ shipping_options: any[] }>(`/shipping-options?cart_id=${cartId}`)
}

export async function addShippingMethod(cartId: string, optionId: string) {
  return storeFetch<{ cart: any }>(`/carts/${cartId}/shipping-methods`, {
    method: 'POST',
    body: { option_id: optionId },
  })
}

export async function initPaymentSessions(cartId: string) {
  return storeFetch<{ payment_collection: any }>(`/payment-collections`, {
    method: 'POST',
    body: { cart_id: cartId },
  })
}

export async function completeCart(cartId: string) {
  return storeFetch<{ type: string; order: any }>(`/carts/${cartId}/complete`, {
    method: 'POST',
  })
}

// ── Helpers ──

export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

export function getLowestPrice(product: StoreProduct): { amount: number; currency: string } | null {
  let lowest: number | null = null
  let currency = 'usd'
  for (const v of product.variants) {
    const cp = v.calculated_price
    if (cp && (lowest === null || cp.calculated_amount < lowest)) {
      lowest = cp.calculated_amount
      currency = cp.currency_code
    }
  }
  return lowest !== null ? { amount: lowest, currency } : null
}

export function getPriceRange(product: StoreProduct): { min: number; max: number; currency: string } | null {
  let min = Infinity
  let max = -Infinity
  let currency = 'usd'
  for (const v of product.variants) {
    const cp = v.calculated_price
    if (cp) {
      if (cp.calculated_amount < min) min = cp.calculated_amount
      if (cp.calculated_amount > max) max = cp.calculated_amount
      currency = cp.currency_code
    }
  }
  return min !== Infinity ? { min, max, currency } : null
}
