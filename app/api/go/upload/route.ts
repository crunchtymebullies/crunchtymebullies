import { NextRequest, NextResponse } from 'next/server'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) return unauthorized()

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const label = (formData.get('label') as string) || ''

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const token = process.env.SANITY_API_TOKEN
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ic4pnlo7'
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

    if (!token) {
      return NextResponse.json({ error: 'Missing Sanity API token' }, { status: 500 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = label
      ? `${label.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${file.name.split('.').pop()}`
      : file.name

    const uploadRes = await fetch(
      `https://${projectId}.api.sanity.io/v2024-01-01/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type },
        body: buffer,
      }
    )

    const result = await uploadRes.json()

    if (!uploadRes.ok) {
      return NextResponse.json({ error: result?.error?.description || 'Upload failed' }, { status: 500 })
    }

    const asset = result.document
    return NextResponse.json({ _id: asset._id, url: asset.url, filename: asset.originalFilename })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
