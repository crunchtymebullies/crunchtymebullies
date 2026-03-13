'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Lock, CreditCard, Truck, Check, ShoppingBag, AlertCircle, Package } from 'lucide-react'
import { useCart } from '@/components/store/CartProvider'
import { formatPrice, updateCartAddress, getShippingOptions, addShippingMethod, completeCart } from '@/lib/store-api'

type Step = 'info' | 'shipping' | 'payment' | 'complete'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'info', label: 'Information' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
  ]
  const idx = steps.findIndex(s => s.key === step)
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <span className={`text-[11px] font-heading tracking-wider ${i <= idx ? 'text-gold' : 'text-white/20'}`}>
            {i < idx ? '✓ ' : ''}{s.label}
          </span>
          {i < steps.length - 1 && <span className="text-white/10">›</span>}
        </div>
      ))}
    </div>
  )
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) return digits.slice(0, 2) + ' / ' + digits.slice(2)
  return digits
}

export default function CheckoutFlow() {
  const { items, subtotal, total, itemCount, id: cartId } = useCart()
  const [step, setStep] = useState<Step>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Info form
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [phone, setPhone] = useState('')

  // Shipping
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShipping, setSelectedShipping] = useState('')
  const [shippingCost, setShippingCost] = useState(0)

  // Payment (mock)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')

  // Order
  const [orderData, setOrderData] = useState<any>(null)

  const inputCls = 'w-full bg-[#0c0c0e] border border-white/10 rounded-xl px-4 py-3.5 text-white font-body text-sm focus:border-gold/40 focus:outline-none placeholder:text-white/15 transition-colors'

  const handleInfoSubmit = async () => {
    if (!email || !firstName || !lastName || !address1 || !city || !state || !zip) {
      setError('Please fill in all required fields'); return
    }
    if (!cartId) { setError('Cart not found. Please add items first.'); return }
    setLoading(true); setError('')
    try {
      await updateCartAddress(cartId, {
        first_name: firstName, last_name: lastName,
        address_1: address1, address_2: address2,
        city, province: state, postal_code: zip,
        country_code: 'us', phone,
      }, email)

      const { shipping_options } = await getShippingOptions(cartId)
      setShippingOptions(shipping_options || [])
      if (shipping_options?.length > 0) {
        setSelectedShipping(shipping_options[0].id)
        setShippingCost(shipping_options[0].amount || 0)
      }
      setStep('shipping')
    } catch (err: any) { setError(err.message || 'Failed to save address') }
    finally { setLoading(false) }
  }

  const handleShippingSubmit = async () => {
    if (!selectedShipping || !cartId) return
    setLoading(true); setError('')
    try {
      await addShippingMethod(cartId, selectedShipping)
      setStep('payment')
    } catch (err: any) { setError(err.message || 'Failed to set shipping') }
    finally { setLoading(false) }
  }

  const handlePaymentSubmit = async () => {
    const digits = cardNumber.replace(/\s/g, '')
    if (digits.length < 15 || !cardExpiry || !cardCvc || !cardName) {
      setError('Please fill in all payment fields'); return
    }
    if (!cartId) return
    setLoading(true); setError('')
    try {
      // Mock payment — in production this calls Stripe's confirmPayment
      // For now we just complete the cart which creates the order
      // When Stripe is connected, this will:
      // 1. Create payment intent via Medusa
      // 2. Confirm with Stripe Elements
      // 3. Then complete the cart

      // Simulate payment processing delay
      await new Promise(r => setTimeout(r, 2000))

      // Try to complete — this will fail without a real payment provider
      // but we'll show the success UI anyway for the mock
      try {
        const result = await completeCart(cartId)
        setOrderData(result)
      } catch {
        // Expected to fail without Stripe — mock success
        setOrderData({
          order: {
            id: 'order_mock_' + Date.now(),
            display_id: Math.floor(Math.random() * 9000) + 1000,
            email,
            total: (subtotal || 0) + shippingCost,
            items,
          },
        })
      }

      // Clear cart from localStorage
      localStorage.removeItem('ct-cart-id')
      setStep('complete')
    } catch (err: any) { setError(err.message || 'Payment failed') }
    finally { setLoading(false) }
  }

  // Redirect if cart is empty
  if (step !== 'complete' && items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="text-white/10 mx-auto mb-4" />
        <h2 className="text-white text-xl font-display mb-3">Your cart is empty</h2>
        <p className="text-white/30 text-sm font-body mb-6">Add some items before checking out.</p>
        <Link href="/shop" className="inline-block px-8 py-3 bg-gold text-[#0a0a0a] font-heading font-semibold text-sm tracking-wider uppercase">
          Browse Shop
        </Link>
      </div>
    )
  }

  // ── ORDER COMPLETE ──
  if (step === 'complete') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
          style={{ animation: 'scale-in 0.5s ease-out' }}>
          <Check size={36} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-display text-white mb-2">Order Confirmed!</h1>
        <p className="text-white/40 font-body text-sm mb-2">
          Order #{orderData?.order?.display_id || '—'}
        </p>
        <p className="text-white/30 font-body text-sm mb-8">
          Confirmation sent to <span className="text-gold/60">{email}</span>
        </p>

        <div className="p-5 rounded-xl bg-[#111] border border-white/5 text-left mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/40 font-heading">Items</span>
            <span className="text-white font-heading">{itemCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40 font-heading">Shipping</span>
            <span className="text-white font-heading">{shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}</span>
          </div>
          <div className="border-t border-white/5 pt-3 flex justify-between">
            <span className="text-white font-heading">Total</span>
            <span className="text-gold font-display text-lg">{formatPrice((subtotal || 0) + shippingCost)}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-left mb-8">
          <p className="text-amber-300 text-xs font-heading mb-1">Demo Mode</p>
          <p className="text-amber-200/50 text-xs font-body">This was a test order. No payment was charged. When Stripe is connected, real payments will process here.</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/shop" className="block w-full py-3.5 bg-gold text-[#0a0a0a] font-heading font-semibold text-sm tracking-wider uppercase text-center">
            Continue Shopping
          </Link>
          <Link href="/" className="text-white/30 text-xs font-heading text-center hover:text-gold transition-colors">
            Back to Main Site
          </Link>
        </div>

        <style>{`
          @keyframes scale-in { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
      </div>
    )
  }

  // ── CHECKOUT FORM ──
  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="py-4">
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-white/40 text-sm font-heading hover:text-gold transition-colors">
          <ChevronLeft size={16} /> Back to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Left: Form */}
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-display text-white mb-2">Checkout</h1>
          <StepIndicator step={step} />

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 mb-6">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-red-300 text-sm font-body">{error}</p>
            </div>
          )}

          {/* ── STEP 1: INFO ── */}
          {step === 'info' && (
            <div className="space-y-4">
              <h2 className="text-white/50 text-xs uppercase tracking-wider font-heading">Contact</h2>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address *" className={inputCls} />

              <h2 className="text-white/50 text-xs uppercase tracking-wider font-heading pt-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name *" className={inputCls} />
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name *" className={inputCls} />
              </div>
              <input type="text" value={address1} onChange={e => setAddress1(e.target.value)} placeholder="Address *" className={inputCls} />
              <input type="text" value={address2} onChange={e => setAddress2(e.target.value)} placeholder="Apartment, suite, etc. (optional)" className={inputCls} />
              <div className="grid grid-cols-3 gap-3">
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City *" className={inputCls} />
                <select value={state} onChange={e => setState(e.target.value)} className={inputCls}>
                  <option value="">State *</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="text" value={zip} onChange={e => setZip(e.target.value)} placeholder="ZIP *" className={inputCls} />
              </div>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (optional)" className={inputCls} />

              <button onClick={handleInfoSubmit} disabled={loading}
                className="w-full py-4 mt-4 bg-gold text-[#0a0a0a] font-heading font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : <><Truck size={16} /> Continue to Shipping</>}
              </button>
            </div>
          )}

          {/* ── STEP 2: SHIPPING ── */}
          {step === 'shipping' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#111] border border-white/5 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-white/30 font-heading">Contact</span>
                  <button onClick={() => setStep('info')} className="text-gold/60 text-xs font-heading hover:text-gold">Change</button>
                </div>
                <p className="text-white/60 font-body">{email}</p>
                <div className="border-t border-white/5 mt-3 pt-3 flex justify-between mb-1">
                  <span className="text-white/30 font-heading">Ship to</span>
                  <button onClick={() => setStep('info')} className="text-gold/60 text-xs font-heading hover:text-gold">Change</button>
                </div>
                <p className="text-white/60 font-body">{address1}, {city}, {state} {zip}</p>
              </div>

              <h2 className="text-white/50 text-xs uppercase tracking-wider font-heading pt-2">Shipping Method</h2>
              {shippingOptions.length === 0 ? (
                <p className="text-white/30 text-sm font-body">No shipping options available for this address.</p>
              ) : (
                <div className="space-y-2">
                  {shippingOptions.map(opt => (
                    <button key={opt.id} onClick={() => { setSelectedShipping(opt.id); setShippingCost(opt.amount || 0) }}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        selectedShipping === opt.id ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/20'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedShipping === opt.id ? 'border-gold' : 'border-white/20'}`}>
                          {selectedShipping === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                        </div>
                        <div>
                          <p className="text-white text-sm font-heading">{opt.name}</p>
                          <p className="text-white/30 text-xs font-body">{opt.type?.description || '4-7 business days'}</p>
                        </div>
                      </div>
                      <span className="text-white/60 text-sm font-heading">{opt.amount > 0 ? formatPrice(opt.amount) : 'Free'}</span>
                    </button>
                  ))}
                </div>
              )}

              <button onClick={handleShippingSubmit} disabled={loading || !selectedShipping}
                className="w-full py-4 mt-4 bg-gold text-[#0a0a0a] font-heading font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : <><CreditCard size={16} /> Continue to Payment</>}
              </button>
            </div>
          )}

          {/* ── STEP 3: PAYMENT ── */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#111] border border-white/5 text-sm space-y-3">
                <div className="flex justify-between"><span className="text-white/30 font-heading">Contact</span><span className="text-white/60 font-body">{email}</span></div>
                <div className="flex justify-between"><span className="text-white/30 font-heading">Ship to</span><span className="text-white/60 font-body">{address1}, {city} {state}</span></div>
                <div className="flex justify-between"><span className="text-white/30 font-heading">Shipping</span><span className="text-white/60 font-body">{shippingOptions.find(o => o.id === selectedShipping)?.name || 'Standard'}</span></div>
              </div>

              <h2 className="text-white/50 text-xs uppercase tracking-wider font-heading pt-2">Payment</h2>

              {/* Mock credit card form — will be replaced with Stripe Elements */}
              <div className="p-5 rounded-xl bg-[#0e0e12] border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={16} className="text-gold/60" />
                  <span className="text-white/50 text-xs font-heading tracking-wider uppercase">Credit Card</span>
                  <div className="ml-auto flex gap-1.5">
                    <div className="w-8 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[8px] text-white/30 font-bold">VISA</div>
                    <div className="w-8 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[8px] text-white/30 font-bold">MC</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="Card number" maxLength={19} className={inputCls} autoComplete="cc-number" />
                  <input type="text" value={cardName} onChange={e => setCardName(e.target.value)}
                    placeholder="Name on card" className={inputCls} autoComplete="cc-name" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM / YY" maxLength={7} className={inputCls} autoComplete="cc-exp" />
                    <input type="text" value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="CVC" maxLength={4} className={inputCls} autoComplete="cc-csc" />
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
                  <p className="text-amber-300/60 text-[10px] font-heading">Demo Mode — No real charges. Use any card number (e.g. 4242 4242 4242 4242)</p>
                </div>
              </div>

              <button onClick={handlePaymentSubmit} disabled={loading}
                className="w-full py-4 mt-4 bg-gold text-[#0a0a0a] font-heading font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors disabled:opacity-50">
                <Lock size={16} />
                {loading ? 'Processing...' : `Pay ${formatPrice((subtotal || 0) + shippingCost)}`}
              </button>

              <div className="flex items-center justify-center gap-2 pt-2">
                <Lock size={12} className="text-white/15" />
                <span className="text-white/15 text-[10px] font-heading tracking-wider">Secured with 256-bit SSL encryption</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        {step !== 'complete' && (
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 p-5 rounded-xl bg-[#0e0e12] border border-white/[0.06]">
              <h3 className="text-white font-heading text-sm mb-4">Order Summary ({itemCount})</h3>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto scrollbar-hide">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 bg-white/[0.03] rounded-lg overflow-hidden shrink-0 border border-white/[0.06]">
                      {(item.thumbnail || item.product?.thumbnail) && (
                        <Image src={item.thumbnail || item.product?.thumbnail || ''} alt="" width={56} height={56} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">{item.quantity}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs font-heading truncate">{item.product?.title || item.title}</p>
                      <p className="text-white/25 text-[10px] font-heading">{item.variant?.title}</p>
                    </div>
                    <span className="text-white/50 text-xs font-heading shrink-0">{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/30 font-body">Subtotal</span>
                  <span className="text-white/60 font-heading">{formatPrice(subtotal || 0)}</span>
                </div>
                {step !== 'info' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/30 font-body">Shipping</span>
                    <span className="text-white/60 font-heading">{shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-3 flex justify-between">
                  <span className="text-white font-heading">Total</span>
                  <span className="text-gold font-display text-xl">
                    {formatPrice((subtotal || 0) + (step !== 'info' ? shippingCost : 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
