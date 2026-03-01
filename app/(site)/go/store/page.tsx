'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Store, Check, Sparkles } from 'lucide-react'

export default function StorePage() {
  const [data, setData] = useState({ products: '', vendors: '', printful: '', priceRange: '', notes: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'store-info', data: { json: JSON.stringify(data) } })
    })
    const progress = JSON.parse(localStorage.getItem('go-progress') || '{}')
    progress.store = 'done'
    localStorage.setItem('go-progress', JSON.stringify(progress))
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="text-center py-20">
      <Check size={48} className="text-emerald-400 mx-auto mb-4" />
      <h2 className="text-2xl font-display text-white mb-2">Store Info Submitted!</h2>
      <Link href="/go" className="btn-gold-outline mt-6 inline-block">Back to Command Center</Link>
    </div>
  )

  return (
    <div>
      <Link href="/go" className="inline-flex items-center gap-2 text-white/30 text-xs font-heading hover:text-gold transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Command Center
      </Link>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Store size={24} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-white">Store & Products</h1>
          <p className="text-white/40 text-sm font-body">Tell us about the products and vendors for your online store.</p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">What products do you want to sell?</label>
          <textarea value={data.products} onChange={e => setData(d => ({...d, products: e.target.value}))} rows={4}
            placeholder="e.g. T-shirts, hoodies, hats with the Crunchtyme logo&#10;Dog supplements or vitamins&#10;Collars, leashes, harnesses&#10;Dog shampoo / grooming products"
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Do you have any vendors or suppliers already?</label>
          <textarea value={data.vendors} onChange={e => setData(d => ({...d, vendors: e.target.value}))} rows={3}
            placeholder="List any companies you buy products from or want to sell through. Include their website if you have it."
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Do you have a Printful account?</label>
          <select value={data.printful} onChange={e => setData(d => ({...d, printful: e.target.value}))}
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none">
            <option value="">Select...</option>
            <option value="yes">Yes, I have a Printful account</option>
            <option value="no">No, I need to set one up</option>
            <option value="unsure">I am not sure what Printful is</option>
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Price range for your products?</label>
          <input type="text" value={data.priceRange} onChange={e => setData(d => ({...d, priceRange: e.target.value}))}
            placeholder="e.g. $20-$80 for apparel, $15-$40 for dog products"
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15" />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Anything else about the store?</label>
          <textarea value={data.notes} onChange={e => setData(d => ({...d, notes: e.target.value}))} rows={3}
            placeholder="Any ideas, inspiration, or notes..."
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <button onClick={handleSubmit} className="btn-gold flex items-center gap-2"><Sparkles size={16} /> Submit Store Info</button>
      </div>
    </div>
  )
}
