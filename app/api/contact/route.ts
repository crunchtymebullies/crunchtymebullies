import { NextRequest, NextResponse } from 'next/server'

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ic4pnlo7'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_EDITOR_TOKEN || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    // Save to Sanity as a submission
    const doc = {
      _type: 'submission',
      submissionType: 'contact-form',
      data: { json: JSON.stringify({ name, email, phone, subject, message, sentAt: new Date().toISOString() }) },
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
