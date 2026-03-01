'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Check, Sparkles } from 'lucide-react'

export default function ContentPage() {
  const [data, setData] = useState({ story: '', faq: '', testimonials: '', policies: '', notes: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'content', data: { json: JSON.stringify(data) } })
    })
    const progress = JSON.parse(localStorage.getItem('go-progress') || '{}')
    progress.content = 'done'
    localStorage.setItem('go-progress', JSON.stringify(progress))
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="text-center py-20">
      <Check size={48} className="text-emerald-400 mx-auto mb-4" />
      <h2 className="text-2xl font-display text-white mb-2">Content Submitted!</h2>
      <Link href="/go" className="btn-gold-outline mt-6 inline-block">Back to Command Center</Link>
    </div>
  )

  return (
    <div>
      <Link href="/go" className="inline-flex items-center gap-2 text-white/30 text-xs font-heading hover:text-gold transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Command Center
      </Link>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <FileText size={24} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-white">Written Content</h1>
          <p className="text-white/40 text-sm font-body">Your story, FAQ, testimonials, and policies in your own words.</p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Your Story</label>
          <p className="text-white/25 text-xs font-body mb-2">How did you get into breeding? What drives you? Write it however you want — we will edit it for the site.</p>
          <textarea value={data.story} onChange={e => setData(d => ({...d, story: e.target.value}))} rows={6}
            placeholder="Tell your story..."
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">FAQ Answers</label>
          <p className="text-white/25 text-xs font-body mb-2">Answer common questions: Do you ship? How do deposits work? What is your health guarantee? Return policy?</p>
          <textarea value={data.faq} onChange={e => setData(d => ({...d, faq: e.target.value}))} rows={6}
            placeholder="Q: Do you ship puppies?&#10;A: Yes, we offer...&#10;&#10;Q: How do deposits work?&#10;A: We require..."
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Client Testimonials</label>
          <p className="text-white/25 text-xs font-body mb-2">Paste any reviews, text messages, or DMs from happy customers. Include their name if they are ok with it.</p>
          <textarea value={data.testimonials} onChange={e => setData(d => ({...d, testimonials: e.target.value}))} rows={4}
            placeholder="Paste reviews, messages, or screenshots descriptions here..."
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Policies / Terms</label>
          <textarea value={data.policies} onChange={e => setData(d => ({...d, policies: e.target.value}))} rows={4}
            placeholder="Any specific policies you want on the site — health guarantee terms, deposit terms, shipping policy, etc."
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <button onClick={handleSubmit} className="btn-gold flex items-center gap-2"><Sparkles size={16} /> Submit Content</button>
      </div>
    </div>
  )
}
