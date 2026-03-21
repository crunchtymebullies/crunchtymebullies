import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { shortCode, amount, customerName, customerEmail, description } = await req.json()

    if (!amount || !shortCode) {
      return NextResponse.json({ error: 'Missing amount or shortCode' }, { status: 400 })
    }

    const amountCents = Math.round(parseFloat(amount) * 100)
    if (isNaN(amountCents) || amountCents <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Verify pay link exists and is pending
    const sb = getSupabase()
    const { data: link } = await sb
      .from('pay_links')
      .select('*')
      .eq('short_code', shortCode)
      .eq('status', 'pending')
      .single()

    if (!link) {
      return NextResponse.json({ error: 'Pay link not found or already paid' }, { status: 404 })
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        source: 'crunchtymebullies',
        short_code: shortCode,
        customer_name: customerName || '',
        customer_email: customerEmail || '',
      },
      description: description || 'CrunchTyme Bullies Payment',
      receipt_email: customerEmail || undefined,
    })

    // Store the payment intent ID on the pay link
    await sb
      .from('pay_links')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('short_code', shortCode)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('CREATE_INTENT_ERROR:', error)
    const msg = error instanceof Error ? error.message : 'Failed to create payment'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
