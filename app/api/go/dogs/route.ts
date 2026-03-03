import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/sanity-admin'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Normalize a Sanity image so it always uses { _type: 'reference', _ref: id }
// The admin UI loads dereferenced images (asset->{ url, _id }) but Sanity
// expects { _type: 'reference', _ref: id } when writing back.
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

function normalizeGallery(gallery: any[]): any[] {
  if (!gallery || !Array.isArray(gallery)) return []
  return gallery
    .map((img) => normalizeImage(img))
    .filter(Boolean)
    .map((img, i) => ({
      ...img,
      _key: img._key || `gallery-${i}-${Date.now()}`,
    }))
}

// Normalize image fields in a payload before writing to Sanity
function normalizePayload(payload: Record<string, any>): Record<string, any> {
  const out = { ...payload }
  if ('mainImage' in out) {
    out.mainImage = normalizeImage(out.mainImage)
  }
  if ('gallery' in out) {
    out.gallery = normalizeGallery(out.gallery)
  }
  return out
}

function revalidateDogPages(slug?: string) {
  revalidatePath('/')          // homepage (featured dogs)
  revalidatePath('/dogs')      // dogs listing
  if (slug) {
    revalidatePath(`/dogs/${slug}`)  // individual dog page
  }
}

// GET — list all dogs (with raw asset refs for admin)
export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) return unauthorized()

  try {
    const dogs = await adminClient.fetch(
      `*[_type == "dog"] | order(name asc) {
        _id, name, slug, breed, variety, gender, color, dob, weight, height,
        status, price, featured, personality, description,
        mainImage{ ..., asset->{ url, _id } },
        gallery[]{ ..., asset->{ url, _id } },
        sire, dam, bloodline, registry, registrationNumber
      }`
    )
    return NextResponse.json(dogs)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST — create / update / delete / toggle_featured / set_status
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) return unauthorized()

  try {
    const { action, payload } = await req.json()

    switch (action) {
      case 'create': {
        const normalized = normalizePayload(payload)
        const doc = await adminClient.create({ _type: 'dog', ...normalized })
        const slug = normalized.slug?.current
        revalidateDogPages(slug)
        return NextResponse.json({ ok: true, _id: doc._id })
      }

      case 'update': {
        const { _id, ...fields } = payload
        if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
        const normalized = normalizePayload(fields)
        await adminClient.patch(_id).set(normalized).commit()
        const slug = normalized.slug?.current
        revalidateDogPages(slug)
        return NextResponse.json({ ok: true })
      }

      case 'delete': {
        const { _id, slug } = payload
        if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
        await adminClient.delete(_id)
        revalidateDogPages(slug)
        return NextResponse.json({ ok: true })
      }

      case 'toggle_featured': {
        const { _id, featured, slug } = payload
        if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
        await adminClient.patch(_id).set({ featured: !featured }).commit()
        revalidateDogPages(slug)
        return NextResponse.json({ ok: true, featured: !featured })
      }

      case 'set_status': {
        const { _id, status, slug } = payload
        if (!_id || !status) return NextResponse.json({ error: 'Missing _id or status' }, { status: 400 })
        await adminClient.patch(_id).set({ status }).commit()
        revalidateDogPages(slug)
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
