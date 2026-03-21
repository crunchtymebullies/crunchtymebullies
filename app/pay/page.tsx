'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

function PayForm({ onSuccess, amount }: { onSuccess: () => void; amount: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const { error: submitErr } = await elements.submit()
    if (submitErr) {
      setError(submitErr.message || 'Payment failed')
      setLoading(false)
      return
    }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href + '?success=1' },
      redirect: 'if_required',
    })

    if (confirmErr) {
      setError(confirmErr.message || 'Payment failed')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-6 py-4 rounded-lg font-semibold text-base tracking-wide transition-all disabled:opacity-50"
        style={{ background: '#d4a853', color: '#000' }}
      >
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  )
}

export default function PayPage() {
  const [params, setParams] = useState<{ ref: string; amount: string; name: string; email: string; description: string } | null>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    if (sp.get('success') === '1') {
      setStatus('success')
      return
    }
    const ref = sp.get('ref') || ''
    const amount = sp.get('amount') || ''
    const name = sp.get('name') || ''
    const email = sp.get('email') || ''
    const description = sp.get('desc') || sp.get('description') || ''
    if (!ref) {
      setStatus('error')
      setErrorMsg('Invalid payment link')
      return
    }
    setParams({ ref, amount, name, email, description })
  }, [])

  useEffect(() => {
    if (!params?.ref) return
    const fetchLink = async () => {
      try {
        // Fetch pay link details
        const res = await fetch(`/api/pay/link?ref=${params.ref}`)
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Link not found')
        }
        const linkData = await res.json()

        // Create payment intent
        const intentRes = await fetch('/api/pay/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shortCode: params.ref,
            amount: linkData.amount,
            customerName: linkData.customer_name || params.name,
            customerEmail: linkData.customer_email || params.email,
            description: linkData.description || params.description,
          }),
        })
        if (!intentRes.ok) {
          const d = await intentRes.json()
          throw new Error(d.error || 'Failed to initialize payment')
        }
        const { clientSecret: cs, paymentIntentId: piId } = await intentRes.json()
        setClientSecret(cs)
        setPaymentIntentId(piId)
        setParams(prev => prev ? { ...prev, amount: linkData.amount, name: linkData.customer_name || prev.name, description: linkData.description || prev.description } : prev)
        setStatus('ready')
      } catch (err) {
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      }
    }
    fetchLink()
  }, [params?.ref])

  const handleSuccess = useCallback(async () => {
    try {
      await fetch('/api/pay/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, shortCode: params?.ref }),
      })
    } catch { /* receipt email is best-effort */ }
    setStatus('success')
  }, [paymentIntentId, params?.ref])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: '#d4a853' }}>CRUNCHTYME BULLIES</h1>
          <p className="text-sm mt-1" style={{ color: '#666' }}>Secure Payment</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#141414', border: '1px solid #222' }}>
          {status === 'loading' && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#d4a853', borderTopColor: 'transparent' }} />
              <p style={{ color: '#666' }}>Loading payment...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">&#10060;</div>
              <p className="text-red-400 font-semibold mb-2">Payment Unavailable</p>
              <p style={{ color: '#666' }} className="text-sm">{errorMsg}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#1a3a1a', border: '2px solid #2d5a2d' }}>
                <span className="text-3xl">&#10003;</span>
              </div>
              <p className="text-xl font-bold text-white mb-2">Payment Successful!</p>
              <p style={{ color: '#666' }} className="text-sm">A receipt has been sent to your email.</p>
              <p style={{ color: '#444' }} className="text-xs mt-4">You can close this page.</p>
            </div>
          )}

          {status === 'ready' && clientSecret && (
            <>
              {/* Payment summary */}
              <div className="mb-6 pb-6" style={{ borderBottom: '1px solid #222' }}>
                {params?.description && (
                  <p className="text-sm mb-2" style={{ color: '#999' }}>{params.description}</p>
                )}
                {params?.name && (
                  <p className="text-xs mb-3" style={{ color: '#555' }}>For: {params.name}</p>
                )}
                <p className="text-3xl font-bold text-white">${parseFloat(params?.amount || '0').toFixed(2)}</p>
              </div>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#d4a853',
                      colorBackground: '#1a1a1a',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <PayForm onSuccess={handleSuccess} amount={parseFloat(params?.amount || '0').toFixed(2)} />
              </Elements>
            </>
          )}
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: '#333' }}>
          Powered by Stripe &middot; 256-bit encryption
        </p>
      </div>
    </div>
  )
}
