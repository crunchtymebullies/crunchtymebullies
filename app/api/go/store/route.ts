import { NextRequest, NextResponse } from 'next/server'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://crunchtime-bullies-backend.fly.dev'
const MEDUSA_EMAIL = 'admin@crunchtymebullies.com'
const MEDUSA_PASS = process.env.ADMIN_PASSWORD || ''

async function getMedusaToken(): Promise<string> {
  const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: MEDUSA_EMAIL, password: MEDUSA_PASS }),
  })
  if (!res.ok) throw new Error('Medusa auth failed')
  const data = await res.json()
  return data.token
}

async function medusaAdmin(path: string, token: string, options?: { method?: string; body?: any }) {
  const res = await fetch(`${MEDUSA_URL}/admin${path}`, {
    method: options?.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Medusa ${res.status}: ${err}`)
  }
  return res.json()
}

// GET — list all products with summary data
export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) return unauthorized()

  try {
    const token = await getMedusaToken()
    const data = await medusaAdmin('/products?limit=50&order=title', token)

    // Slim down for the admin list
    const products = (data.products || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      description: p.description,
      status: p.status,
      thumbnail: p.thumbnail,
      variants_count: p.variants?.length || 0,
      options: (p.options || []).map((o: any) => ({
        id: o.id,
        title: o.title,
        values: (o.values || []).map((v: any) => v.value),
      })),
      first_price: (() => {
        for (const v of (p.variants || [])) {
          for (const pr of (v.prices || [])) {
            return { amount: pr.amount, currency: pr.currency_code }
          }
        }
        return null
      })(),
      images: (p.images || []).map((img: any) => ({ id: img.id, url: img.url })),
      metadata: p.metadata,
    }))

    return NextResponse.json(products)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST — update product, change status
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) return unauthorized()

  try {
    const { action, payload } = await req.json()
    const token = await getMedusaToken()

    switch (action) {
      case 'update': {
        const { id, ...fields } = payload
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        const data = await medusaAdmin(`/products/${id}`, token, { method: 'POST', body: fields })
        return NextResponse.json({ ok: true, product: { id: data.product.id, title: data.product.title } })
      }

      case 'set_status': {
        const { id, status } = payload
        if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
        const data = await medusaAdmin(`/products/${id}`, token, { method: 'POST', body: { status } })
        return NextResponse.json({ ok: true, status: data.product.status })
      }

      case 'get_detail': {
        const { id } = payload
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        const data = await medusaAdmin(`/products/${id}`, token)
        return NextResponse.json(data.product)
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
