import { NextRequest, NextResponse } from 'next/server'

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ic4pnlo7'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_EDITOR_TOKEN || ''
const ADMIN_CODE = 'nexadev2026'

export async function GET(req: NextRequest) {
  const code = req.headers.get('x-admin-code')
  if (code !== ADMIN_CODE) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const query = encodeURIComponent('*[_type == "submission"] | order(submittedAt desc) { _id, submissionType, data, submittedAt, status, notes }')
    const res = await fetch(
      `https://${PROJECT}.api.sanity.io/v2021-06-07/data/query/${DATASET}?query=${query}`,
      { headers: { Authorization: `Bearer ${TOKEN}` }, next: { revalidate: 0 } }
    )
    const data = await res.json()
    return NextResponse.json(data.result || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
