import { NextRequest, NextResponse } from 'next/server'

const DEV_EMAIL = 'admin@nexavisiongroup.com'

export async function POST(req: NextRequest) {
  try {
    const { name, message } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    // Use mailto fallback — for production, wire up SendGrid/Resend/etc.
    // For now, save to Sanity as a submission so devs see it
    const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ic4pnlo7'
    const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
    const TOKEN = process.env.SANITY_EDITOR_TOKEN || ''

    const doc = {
      _type: 'submission',
      submissionType: 'developer-message',
      data: { json: JSON.stringify({ name, message, to: DEV_EMAIL, sentAt: new Date().toISOString() }) },
      submittedAt: new Date().toISOString(),
      status: 'new',
    }

    await fetch(
      `https://${PROJECT}.api.sanity.io/v2021-06-07/data/mutate/${DATASET}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ mutations: [{ create: doc }] }) }
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
