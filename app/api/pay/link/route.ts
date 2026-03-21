import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'Missing ref' }, { status: 400 })

  const sb = getSupabase()
  const { data, error } = await sb
    .from('pay_links')
    .select('short_code, amount, customer_name, customer_email, description, status')
    .eq('short_code', ref)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  if (data.status === 'paid') {
    return NextResponse.json({ error: 'This link has already been paid' }, { status: 410 })
  }

  return NextResponse.json(data)
}
