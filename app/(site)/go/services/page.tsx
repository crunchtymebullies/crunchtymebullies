'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wrench, Check, Sparkles } from 'lucide-react'

export default function ServicesInfoPage() {
  const [data, setData] = useState({ puppyPricing: '', studFees: '', delivery: '', deposits: '', other: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'services', data: { json: JSON.stringify(data) } })
    })
    const progress = JSON.parse(localStorage.getItem('go-progress') || '{}')
    progress.services = 'done'
    localStorage.setItem('go-progress', JSON.stringify(progress))
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="text-center py-20">
      <Check size={48} className="text-emerald-400 mx-auto mb-4" />
      <h2 className="text-2xl font-display text-white mb-2">Services Info Submitted!</h2>
      <Link href="/go" className="btn-gold-outline mt-6 inline-block">Back to Command Center</Link>
    </div>
  )

  return (
    <div>
      <Link href="/go" className="inline-flex items-center gap-2 text-white/30 text-xs font-heading hover:text-gold transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Command Center
      </Link>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Wrench size={24} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-white">Services & Pricing</h1>
          <p className="text-white/40 text-sm font-body">Define your pricing and service terms so we can build them into the site.</p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Puppy Pricing</label>
          <textarea value={data.puppyPricing} onChange={e => setData(d => ({...d, puppyPricing: e.target.value}))} rows={3}
            placeholder="e.g. Pocket Bullies: $2,500 - $5,000&#10;Standard Bullies: $1,500 - $3,000&#10;Pricing depends on bloodline, color, structure"
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Stud Service Fees</label>
          <textarea value={data.studFees} onChange={e => setData(d => ({...d, studFees: e.target.value}))} rows={3}
            placeholder="e.g. Blue Steel: $1,000 stud fee&#10;Include pick of litter option? etc."
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Delivery / Shipping</label>
          <textarea value={data.delivery} onChange={e => setData(d => ({...d, delivery: e.target.value}))} rows={3}
            placeholder="Do you deliver? Ship? Flight nanny? What areas? What does it cost?"
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Deposit Policy</label>
          <textarea value={data.deposits} onChange={e => setData(d => ({...d, deposits: e.target.value}))} rows={2}
            placeholder="e.g. $500 non-refundable deposit to reserve a puppy, applied to final price"
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <button onClick={handleSubmit} className="btn-gold flex items-center gap-2"><Sparkles size={16} /> Submit Services Info</button>
      </div>
    </div>
  )
}
