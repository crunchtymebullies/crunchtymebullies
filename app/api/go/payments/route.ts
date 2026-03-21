import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { getSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateShortCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 7; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// GET — list all pay links
export async function GET(req: NextRequest) {
  const authErr = await verifyAdmin(req)
  if (authErr) return authErr

  const sb = getSupabase()
  const { data, error } = await sb
    .from('pay_links')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ links: data })
}

// POST — create a pay link, optionally send via email
export async function POST(req: NextRequest) {
  const authErr = await verifyAdmin(req)
  if (authErr) return authErr

  try {
    const { amount, customerName, customerEmail, description, sendEmail } = await req.json()

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
    }

    const shortCode = generateShortCode()
    const sb = getSupabase()

    const { data, error } = await sb
      .from('pay_links')
      .insert({
        short_code: shortCode,
        amount: parseFloat(amount),
        customer_name: customerName || null,
        customer_email: customerEmail || null,
        description: description || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crunchtymebullies.com'
    const payUrl = `${baseUrl}/pay?ref=${shortCode}`

    // Send email if requested
    if (sendEmail && customerEmail) {
      try {
        const amountStr = parseFloat(amount).toFixed(2)
        await resend.emails.send({
          from: 'CrunchTyme Bullies <info@crunchtymebullies.com>',
          to: customerEmail,
          subject: `Payment Request — $${amountStr}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #111; color: #fff; border-radius: 12px;">
              <h1 style="color: #d4a853; font-size: 24px; margin: 0 0 8px;">CrunchTyme Bullies</h1>
              <p style="color: #999; margin: 0 0 24px; font-size: 14px;">Payment Request</p>
              <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #333; margin-bottom: 24px;">
                ${customerName ? `<p style="margin: 0 0 12px;"><strong style="color: #d4a853;">To:</strong> ${customerName}</p>` : ''}
                <p style="margin: 0 0 12px;"><strong style="color: #d4a853;">Amount Due:</strong> $${amountStr}</p>
                ${description ? `<p style="margin: 0;"><strong style="color: #d4a853;">For:</strong> ${description}</p>` : ''}
              </div>
              <a href="${payUrl}" style="display: block; text-align: center; background: #d4a853; color: #000; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Pay $${amountStr} Now →
              </a>
              <p style="color: #666; font-size: 12px; margin-top: 24px; text-align: center;">Secure payment powered by Stripe</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('PAY_LINK_EMAIL_ERROR:', emailErr)
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({ link: data, payUrl })
  } catch (error) {
    console.error('CREATE_PAY_LINK_ERROR:', error)
    const msg = error instanceof Error ? error.message : 'Failed to create pay link'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
