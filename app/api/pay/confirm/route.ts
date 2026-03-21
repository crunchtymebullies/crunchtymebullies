import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { getSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, shortCode } = await req.json()

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 })
    }

    const stripe = getStripe()
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: `Payment not succeeded: ${pi.status}` }, { status: 400 })
    }

    const sb = getSupabase()
    const code = shortCode || pi.metadata?.short_code

    if (code) {
      await sb
        .from('pay_links')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: pi.id,
        })
        .eq('short_code', code)
    }

    // Send receipt email
    const email = pi.receipt_email || pi.metadata?.customer_email
    const name = pi.metadata?.customer_name || 'Customer'
    const amount = (pi.amount / 100).toFixed(2)

    if (email) {
      try {
        await resend.emails.send({
          from: 'CrunchTyme Bullies <info@crunchtymebullies.com>',
          to: email,
          subject: `Payment Receipt — $${amount}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #111; color: #fff; border-radius: 12px;">
              <h1 style="color: #d4a853; font-size: 24px; margin: 0 0 8px;">CrunchTyme Bullies</h1>
              <p style="color: #999; margin: 0 0 24px; font-size: 14px;">Payment Confirmation</p>
              <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #333;">
                <p style="margin: 0 0 12px;"><strong style="color: #d4a853;">Amount Paid:</strong> $${amount}</p>
                <p style="margin: 0 0 12px;"><strong style="color: #d4a853;">Name:</strong> ${name}</p>
                <p style="margin: 0;"><strong style="color: #d4a853;">Reference:</strong> ${pi.id.slice(-8).toUpperCase()}</p>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 24px;">Thank you for your payment. If you have questions, reply to this email.</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('RECEIPT_EMAIL_ERROR:', emailErr)
      }
    }

    return NextResponse.json({ success: true, amount })
  } catch (error) {
    console.error('CONFIRM_PAYMENT_ERROR:', error)
    const msg = error instanceof Error ? error.message : 'Failed to confirm payment'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
