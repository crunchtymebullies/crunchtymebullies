import { NextRequest, NextResponse } from 'next/server'

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ic4pnlo7'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_EDITOR_TOKEN || ''
const ADMIN_CODE = 'nexadev2026'

export async function POST(req: NextRequest) {
  const code = req.headers.get('x-admin-code')
  if (code !== ADMIN_CODE) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, status, notes } = await req.json()
    const mutations = [{ patch: { id, set: { status, ...(notes !== undefined ? { notes } : {}) } } }]
    await fetch(
      `https://${PROJECT}.api.sanity.io/v2021-06-07/data/mutate/${DATASET}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ mutations }) }
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
