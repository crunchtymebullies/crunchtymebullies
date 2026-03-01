import { NextRequest, NextResponse } from 'next/server'

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ic4pnlo7'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_EDITOR_TOKEN || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const doc = { _type: 'submission', submissionType: body.type, data: body.data, submittedAt: new Date().toISOString(), status: 'new' }
    const res = await fetch(
      `https://${PROJECT}.api.sanity.io/v2021-06-07/data/mutate/${DATASET}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ mutations: [{ create: doc }] }) }
    )
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
    const result = await res.json()
    return NextResponse.json({ success: true, id: result.results?.[0]?.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
