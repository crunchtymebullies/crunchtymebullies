import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/sanity-admin'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function normalizeImage(img: any): any {
  if (!img) return undefined
  const ref = img.asset?._ref || img.asset?._id
  if (!ref) return undefined
  return {
    _type: 'image',
    ...(img._key ? { _key: img._key } : {}),
    ...(img.alt ? { alt: img.alt } : {}),
    asset: { _type: 'reference', _ref: ref },
  }
}

function normalizePayload(payload: Record<string, any>): Record<string, any> {
  const out = { ...payload }
  if ('image' in out) {
    out.image = normalizeImage(out.image)
  }
  return out
}

function revalidateServicePages() {
  revalidatePath('/')
  revalidatePath('/services')
}

// GET — list all services
export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) return unauthorized()

  try {
    const services = await adminClient.fetch(
      `*[_type == "service"] | order(order asc) {
        _id, title, slug, description, longDescription, price, featured, order,
        image{ ..., asset->{ url, _id } }
      }`
    )
    return NextResponse.json(services)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST — create / update / delete / reorder
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) return unauthorized()

  try {
    const { action, payload } = await req.json()

    switch (action) {
      case 'create': {
        const normalized = normalizePayload(payload)
        const doc = await adminClient.create({ _type: 'service', ...normalized })
        revalidateServicePages()
        return NextResponse.json({ ok: true, _id: doc._id })
      }

      case 'update': {
        const { _id, ...fields } = payload
        if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
        const normalized = normalizePayload(fields)
        await adminClient.patch(_id).set(normalized).commit()
        revalidateServicePages()
        return NextResponse.json({ ok: true })
      }

      case 'delete': {
        const { _id } = payload
        if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
        await adminClient.delete(_id)
        revalidateServicePages()
        return NextResponse.json({ ok: true })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
