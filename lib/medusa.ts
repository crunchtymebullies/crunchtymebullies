// ═══════════════════════════════════════════════════════════
// CRUNCHTIME BULLIES — Medusa Commerce Client
// ═══════════════════════════════════════════════════════════

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

interface MedusaRequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  next?: NextFetchRequestConfig
}

async function medusaFetch<T>(path: string, options: MedusaRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, next } = options

  const res = await fetch(`${MEDUSA_BACKEND_URL}/store${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': process.env.MEDUSA_API_KEY || '',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    next,
  })

  if (!res.ok) {
    throw new Error(`Medusa API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// ── Products ──

export async function getProducts(params?: {
  limit?: number
  offset?: number
  category_id?: string[]
  collection_id?: string[]
}) {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.offset) searchParams.set('offset', String(params.offset))
  if (params?.category_id) params.category_id.forEach(id => searchParams.append('category_id[]', id))
  if (params?.collection_id) params.collection_id.forEach(id => searchParams.append('collection_id[]', id))

  const query = searchParams.toString()
  return medusaFetch<{ products: any[]; count: number }>(
    `/products${query ? `?${query}` : ''}`,
    { next: { revalidate: 60 } }
  )
}

export async function getProduct(handle: string) {
  const { products } = await medusaFetch<{ products: any[] }>(
    `/products?handle=${handle}`,
    { next: { revalidate: 60 } }
  )
  return products[0] || null
}

export async function getProductCategories() {
  return medusaFetch<{ product_categories: any[] }>(
    '/product-categories',
    { next: { revalidate: 300 } }
  )
}

export async function getCollections() {
  return medusaFetch<{ collections: any[] }>(
    '/collections',
    { next: { revalidate: 300 } }
  )
}

// ── Cart ──

export async function createCart() {
  return medusaFetch<{ cart: any }>('/carts', { method: 'POST' })
}

export async function getCart(cartId: string) {
  return medusaFetch<{ cart: any }>(`/carts/${cartId}`)
}

export async function addToCart(cartId: string, variantId: string, quantity: number = 1) {
  return medusaFetch<{ cart: any }>(`/carts/${cartId}/line-items`, {
    method: 'POST',
    body: { variant_id: variantId, quantity },
  })
}

export async function updateCartItem(cartId: string, lineItemId: string, quantity: number) {
  return medusaFetch<{ cart: any }>(`/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'POST',
    body: { quantity },
  })
}

export async function removeFromCart(cartId: string, lineItemId: string) {
  return medusaFetch<{ cart: any }>(`/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'DELETE',
  })
}

// ── Checkout ──

export async function addShippingAddress(cartId: string, address: any) {
  return medusaFetch<{ cart: any }>(`/carts/${cartId}`, {
    method: 'POST',
    body: { shipping_address: address },
  })
}

export async function getShippingOptions(cartId: string) {
  return medusaFetch<{ shipping_options: any[] }>(
    `/shipping-options/${cartId}`
  )
}

export async function setPaymentSession(cartId: string, providerId: string) {
  return medusaFetch<{ cart: any }>(`/carts/${cartId}/payment-sessions`, {
    method: 'POST',
    body: { provider_id: providerId },
  })
}

export async function completeCart(cartId: string) {
  return medusaFetch<{ type: string; data: any }>(`/carts/${cartId}/complete`, {
    method: 'POST',
  })
}
