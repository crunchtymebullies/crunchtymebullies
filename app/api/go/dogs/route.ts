import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/sanity-admin'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        mainImage, gallery,
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
        const doc = await adminClient.create({ _type: 'dog', ...payload })
        return NextResponse.json({ ok: true, _id: doc._id })
      }

      case 'update': {
        const { _id, ...fields } = payload
        if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
        await adminClient.patch(_id).set(fields).commit()
        return NextResponse.json({ ok: true })
      }

      case 'delete': {
        const { _id } = payload
        if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
        await adminClient.delete(_id)
        return NextResponse.json({ ok: true })
      }

      case 'toggle_featured': {
        const { _id, featured } = payload
        if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
        await adminClient.patch(_id).set({ featured: !featured }).commit()
        return NextResponse.json({ ok: true, featured: !featured })
      }

      case 'set_status': {
        const { _id, status } = payload
        if (!_id || !status) return NextResponse.json({ error: 'Missing _id or status' }, { status: 400 })
        await adminClient.patch(_id).set({ status }).commit()
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
