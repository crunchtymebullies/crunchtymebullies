import { NextRequest, NextResponse } from 'next/server'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://crunchtime-bullies-backend.fly.dev'
const MEDUSA_EMAIL = 'admin@crunchtymebullies.com'
const MEDUSA_PASS = process.env.ADMIN_PASSWORD || ''
const PF_TOKEN = process.env.PRINTFUL_API_KEY || '2tK96hhKnlvpigW0SEgJY8H4wIDBhRXWZjffE1z6'
const PF_STORE = process.env.PRINTFUL_STORE_ID || '17795010'
const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || 'reg_01KJPK105MQDV45X1C68D62BRQ'

async function getMedusaToken(): Promise<string> {
  const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: MEDUSA_EMAIL, password: MEDUSA_PASS }),
  })
  if (!res.ok) throw new Error('Medusa auth failed')
  return (await res.json()).token
}

async function medusaAdmin(path: string, token: string, opts?: { method?: string; body?: any }) {
  const res = await fetch(`${MEDUSA_URL}/admin${path}`, {
    method: opts?.method || 'GET',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) throw new Error(`Medusa ${res.status}: ${await res.text()}`)
  return res.json()
}

async function pfApi(path: string) {
  const res = await fetch(`https://api.printful.com${path}`, {
    headers: { 'Authorization': `Bearer ${PF_TOKEN}`, 'X-PF-Store-Id': PF_STORE },
  })
  if (!res.ok) throw new Error(`Printful ${res.status}`)
  return (await res.json()).result
}

// GET: List all products with merged data
export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) return unauthorized()

  try {
    const token = await getMedusaToken()
    const medusaData = await medusaAdmin('/products?limit=50&order=title', token)
    const pfProducts = await pfApi('/store/products?limit=100')

    const pfMap: Record<string, any> = {}
    for (const p of pfProducts) {
      pfMap[p.name] = { id: p.id, variants: p.variants, synced: p.synced }
    }

    const products = (medusaData.products || []).map((mp: any) => {
      const pfMatch = pfMap[mp.title]
      const firstPrice = (() => {
        for (const v of (mp.variants || [])) {
          for (const pr of (v.prices || [])) {
            return { amount: pr.amount, currency: pr.currency_code }
          }
        }
        return null
      })()
      return {
        id: mp.id, title: mp.title, handle: mp.handle, description: mp.description,
        status: mp.status, thumbnail: mp.thumbnail,
        variants_count: mp.variants?.length || 0,
        options: (mp.options || []).map((o: any) => ({
          id: o.id, title: o.title, values: (o.values || []).map((v: any) => v.value),
        })),
        first_price: firstPrice,
        images: (mp.images || []).map((img: any) => ({ id: img.id, url: img.url })),
        printful_id: pfMatch?.id || null,
        printful_synced: pfMatch?.synced || 0,
      }
    })

    return NextResponse.json(products)
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}

// POST: Actions
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
        await medusaAdmin(`/products/${id}`, token, { method: 'POST', body: fields })
        return NextResponse.json({ ok: true })
      }

      case 'set_status': {
        const { id, status } = payload
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        await medusaAdmin(`/products/${id}`, token, { method: 'POST', body: { status } })
        return NextResponse.json({ ok: true })
      }

      // Full product detail with Printful financials
      case 'get_detail': {
        const { id, printful_id } = payload
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

        const medusa = (await medusaAdmin(`/products/${id}`, token)).product

        let variants: any[] = []
        let catalogInfo: any = null
        let stats: any = null
        let shipping_estimate: any = null

        if (printful_id) {
          try {
            const pfDetail = await pfApi(`/store/products/${printful_id}`)
            const syncVariants = pfDetail.sync_variants || []
            const catProductId = syncVariants[0]?.product?.product_id

            // Get catalog product for costs + info
            let costMap: Record<string, number> = {}
            let materialMap: Record<string, any[]> = {}
            if (catProductId) {
              const cat = await pfApi(`/products/${catProductId}`)
              catalogInfo = {
                brand: cat.product?.brand,
                model: cat.product?.model,
                description: cat.product?.description,
                type_name: cat.product?.type_name,
                origin_country: cat.product?.origin_country,
              }
              for (const cv of (cat.variants || [])) {
                costMap[String(cv.id)] = parseFloat(cv.price) || 0
                if (cv.material) materialMap[String(cv.id)] = cv.material
              }
            }

            // Get shipping estimate for first variant
            try {
              const shipRes = await fetch('https://api.printful.com/shipping/rates', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${PF_TOKEN}`,
                  'X-PF-Store-Id': PF_STORE,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  recipient: { country_code: 'US', state_code: 'CA', zip: '90210' },
                  items: [{ variant_id: syncVariants[0]?.variant_id, quantity: 1 }],
                }),
              })
              if (shipRes.ok) {
                const shipData = await shipRes.json()
                const rates = shipData.result || []
                if (rates.length > 0) {
                  shipping_estimate = {
                    rate: parseFloat(rates[0].rate) * 100,
                    name: rates[0].name,
                    min_days: rates[0].minDeliveryDays,
                    max_days: rates[0].maxDeliveryDays,
                  }
                }
              }
            } catch {}

            // Build variant data
            variants = syncVariants.map((sv: any) => {
              const cost = costMap[String(sv.variant_id)] || 0
              const retail = parseFloat(sv.retail_price) || 0
              const profit = retail - cost
              const margin = retail > 0 ? (profit / retail) * 100 : 0
              const mv = medusa.variants?.find((v: any) => v.metadata?.printful_variant_id === String(sv.id))
              const material = materialMap[String(sv.variant_id)] || null

              return {
                printful_sync_id: sv.id,
                printful_catalog_variant_id: sv.variant_id,
                medusa_variant_id: mv?.id || null,
                name: sv.name,
                color: sv.color,
                size: sv.size,
                sku: sv.sku || mv?.sku,
                retail_price: Math.round(retail * 100),
                cost_price: Math.round(cost * 100),
                medusa_price: mv?.prices?.[0]?.amount || 0,
                profit: Math.round(profit * 100),
                margin: Math.round(margin * 10) / 10,
                availability: sv.availability_status,
                thumbnail: sv.product?.image || null,
                material,
                color_code: sv.color_code || null,
              }
            })

            // Stats
            const withCosts = variants.filter((v: any) => v.cost_price > 0)
            if (withCosts.length > 0) {
              stats = {
                total_variants: variants.length,
                avg_margin: Math.round(withCosts.reduce((s: number, v: any) => s + v.margin, 0) / withCosts.length * 10) / 10,
                lowest_margin: Math.round(Math.min(...withCosts.map((v: any) => v.margin)) * 10) / 10,
                highest_margin: Math.round(Math.max(...withCosts.map((v: any) => v.margin)) * 10) / 10,
                avg_profit: Math.round(withCosts.reduce((s: number, v: any) => s + v.profit, 0) / withCosts.length),
                avg_retail: Math.round(variants.reduce((s: number, v: any) => s + v.retail_price, 0) / variants.length),
                avg_cost: Math.round(withCosts.reduce((s: number, v: any) => s + v.cost_price, 0) / withCosts.length),
                total_potential_revenue: variants.reduce((s: number, v: any) => s + v.retail_price, 0),
                total_potential_profit: withCosts.reduce((s: number, v: any) => s + v.profit, 0),
              }
            }
          } catch (err) {
            console.error('Printful detail error:', err)
          }
        }

        // Fallback: Medusa-only variants
        if (variants.length === 0) {
          variants = (medusa.variants || []).map((v: any) => ({
            medusa_variant_id: v.id, name: v.title,
            medusa_price: v.prices?.[0]?.amount || 0,
            cost_price: 0, retail_price: v.prices?.[0]?.amount || 0,
            profit: 0, margin: 0, color: '', size: '',
          }))
        }

        return NextResponse.json({
          product: {
            id: medusa.id, title: medusa.title, handle: medusa.handle,
            description: medusa.description, status: medusa.status,
            thumbnail: medusa.thumbnail,
            images: (medusa.images || []).map((img: any) => ({ id: img.id, url: img.url })),
            options: (medusa.options || []).map((o: any) => ({
              id: o.id, title: o.title, values: (o.values || []).map((v: any) => v.value),
            })),
          },
          catalog_info: catalogInfo,
          variants,
          stats,
          shipping_estimate,
        })
      }

      // Bulk price update
      case 'bulk_price': {
        const { id, printful_id, markup_type, markup_value } = payload
        if (!id || !printful_id || !markup_type || markup_value == null) {
          return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const pfDetail = await pfApi(`/store/products/${printful_id}`)
        const syncVariants = pfDetail.sync_variants || []
        const catProductId = syncVariants[0]?.product?.product_id
        if (!catProductId) return NextResponse.json({ error: 'No catalog product' }, { status: 400 })

        const cat = await pfApi(`/products/${catProductId}`)
        const costMap: Record<string, number> = {}
        for (const cv of (cat.variants || [])) {
          costMap[String(cv.id)] = parseFloat(cv.price) || 0
        }

        const medusaProd = (await medusaAdmin(`/products/${id}`, token)).product
        let updated = 0, errors = 0

        for (const sv of syncVariants) {
          const cost = costMap[String(sv.variant_id)] || 0
          if (cost <= 0) continue

          let newCents: number
          if (markup_type === 'percentage') {
            newCents = Math.round(cost * 100 * (1 + markup_value / 100))
          } else {
            newCents = Math.round(cost * 100) + markup_value
          }

          const mv = medusaProd.variants?.find((v: any) => v.metadata?.printful_variant_id === String(sv.id))
          if (!mv) continue

          try {
            await medusaAdmin(`/products/${id}/variants/${mv.id}`, token, {
              method: 'POST',
              body: { prices: [{ amount: newCents, currency_code: 'usd', region_id: REGION_ID }] },
            })
            updated++
          } catch { errors++ }
        }

        return NextResponse.json({ ok: true, updated, errors, total: syncVariants.length })
      }

      // Sync from Printful
      case 'sync_printful': {
        const pfProducts = await pfApi('/store/products?limit=100')
        const medusaData = await medusaAdmin('/products?limit=100', token)
        const existingTitles = new Set((medusaData.products || []).map((p: any) => p.title))
        const scData = await medusaAdmin('/sales-channels', token)
        const scId = scData.sales_channels?.[0]?.id

        let synced = 0, skipped = 0
        const newProducts: string[] = []

        for (const pfp of pfProducts) {
          if (existingTitles.has(pfp.name)) { skipped++; continue }

          try {
            const detail = await pfApi(`/store/products/${pfp.id}`)
            const sp = detail.sync_product
            const svs = detail.sync_variants || []
            if (svs.length === 0) continue

            const catPid = svs[0]?.product?.product_id
            const cat = catPid ? await pfApi(`/products/${catPid}`) : null
            const costMap: Record<string, number> = {}
            if (cat) for (const cv of (cat.variants || [])) costMap[String(cv.id)] = parseFloat(cv.price) || 0

            const colors = [...new Set(svs.map((v: any) => v.color).filter(Boolean))]
            const sizes = [...new Set(svs.map((v: any) => v.size).filter(Boolean))]
            const handle = sp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

            const body: any = {
              title: sp.name, handle,
              description: cat?.product?.description || sp.name,
              status: 'published', thumbnail: sp.thumbnail_url,
              options: [], metadata: { printful_sync_id: String(pfp.id) },
            }
            if (colors.length) body.options.push({ title: 'Color', values: colors })
            if (sizes.length) body.options.push({ title: 'Size', values: sizes })
            if (scId) body.sales_channels = [{ id: scId }]

            const created = await medusaAdmin('/products', token, { method: 'POST', body })

            for (const sv of svs) {
              const opts: Record<string, string> = {}
              if (sv.color) opts['Color'] = sv.color
              if (sv.size) opts['Size'] = sv.size
              const cost = costMap[String(sv.variant_id)] || 0
              const retail = parseFloat(sv.retail_price) || (cost > 0 ? cost * 1.35 : 0)

              await medusaAdmin(`/products/${created.product.id}/variants`, token, {
                method: 'POST',
                body: {
                  title: `/ ${sv.color || ''} / ${sv.size || ''}`.trim(),
                  options: opts,
                  prices: retail > 0 ? [{ amount: Math.round(retail * 100), currency_code: 'usd', region_id: REGION_ID }] : [],
                  metadata: { printful_variant_id: String(sv.id) },
                  manage_inventory: false,
                },
              })
            }

            synced++
            newProducts.push(sp.name)
          } catch (err) { console.error(`Sync failed: ${pfp.name}`, err) }
        }

        return NextResponse.json({ ok: true, synced, skipped, total: pfProducts.length, new_products: newProducts })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
