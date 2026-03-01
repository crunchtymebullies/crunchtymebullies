import { NextRequest, NextResponse } from 'next/server'

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ic4pnlo7'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_EDITOR_TOKEN || ''

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const contentType = file.type || 'image/jpeg'
    const isImage = contentType.startsWith('image/')
    const assetType = isImage ? 'images' : 'files'

    const res = await fetch(
      `https://${PROJECT}.api.sanity.io/v2021-06-07/assets/${assetType}/${DATASET}?filename=${encodeURIComponent(file.name)}`,
      { method: 'POST', headers: { 'Content-Type': contentType, Authorization: `Bearer ${TOKEN}` }, body: buffer }
    )
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
    const data = await res.json()
    return NextResponse.json({ id: data.document._id, url: data.document.url, originalFilename: data.document.originalFilename, size: data.document.size })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
