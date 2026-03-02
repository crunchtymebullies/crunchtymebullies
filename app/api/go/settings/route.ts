import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/sanity-admin'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) return unauthorized()

  try {
    const settings = await adminClient.fetch(`*[_type == "siteSettings"][0]`)
    return NextResponse.json(settings || {})
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) return unauthorized()

  try {
    const { action, payload } = await req.json()
    if (action === 'update') {
      const existing = await adminClient.fetch(`*[_type == "siteSettings"][0]{ _id }`)
      if (existing?._id) {
        await adminClient.patch(existing._id).set(payload).commit()
      } else {
        await adminClient.create({ _type: 'siteSettings', ...payload })
      }
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
