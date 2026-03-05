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
    const products = (data.products || []).map((p: any) => {
      // Collect all variant prices
      const variantPrices = (p.variants || []).map((v: any) => {
        const price = v.prices?.[0]
        return {
          id: v.id,
          title: v.title,
          amount: price?.amount || 0,
          currency: price?.currency_code || 'usd',
        }
      })

      // Calculate price range
      const amounts = variantPrices.map((vp: any) => vp.amount).filter((a: number) => a > 0)
      const minPrice = amounts.length ? Math.min(...amounts) : 0
      const maxPrice = amounts.length ? Math.max(...amounts) : 0

      return {
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
        first_price: variantPrices.find((vp: any) => vp.amount > 0) || null,
        min_price: minPrice,
        max_price: maxPrice,
        variant_prices: variantPrices,
        images: (p.images || []).map((img: any) => ({ id: img.id, url: img.url })),
        metadata: p.metadata,
      }
    })

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

      case 'update_price': {
        const { product_id, variant_id, amount, currency_code } = payload
        if (!product_id || !variant_id || amount == null) {
          return NextResponse.json({ error: 'Missing product_id, variant_id, or amount' }, { status: 400 })
        }
        // Get region ID
        const regions = await medusaAdmin('/regions', token)
        const regionId = regions.regions?.[0]?.id
        if (!regionId) return NextResponse.json({ error: 'No region configured' }, { status: 400 })
        
        await medusaAdmin(`/products/${product_id}/variants/${variant_id}`, token, {
          method: 'POST',
          body: { prices: [{ amount: Math.round(amount), currency_code: currency_code || 'usd', region_id: regionId }] },
        })
        return NextResponse.json({ ok: true })
      }

      case 'bulk_update_prices': {
        // Update all variants of a product with a markup percentage or flat price
        const { product_id, markup_type, markup_value } = payload
        if (!product_id || !markup_type || markup_value == null) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const regions = await medusaAdmin('/regions', token)
        const regionId = regions.regions?.[0]?.id
        if (!regionId) return NextResponse.json({ error: 'No region configured' }, { status: 400 })

        const productData = await medusaAdmin(`/products/${product_id}`, token)
        const variants = productData.product?.variants || []
        let updated = 0

        for (const v of variants) {
          const currentPrice = v.prices?.[0]?.amount || 0
          let newAmount: number

          if (markup_type === 'flat') {
            newAmount = Math.round(markup_value * 100) // convert dollars to cents
          } else if (markup_type === 'percentage') {
            // markup_value is the multiplier, e.g. 1.5 for 50% markup
            newAmount = Math.round(currentPrice * markup_value)
          } else {
            continue
          }

          try {
            await medusaAdmin(`/products/${product_id}/variants/${v.id}`, token, {
              method: 'POST',
              body: { prices: [{ amount: newAmount, currency_code: 'usd', region_id: regionId }] },
            })
            updated++
          } catch { /* skip failed variants */ }
        }

        return NextResponse.json({ ok: true, updated })
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
