'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Share2, Check, Instagram, Facebook, Sparkles } from 'lucide-react'

export default function SocialPage() {
  const [data, setData] = useState({ instagram: '', facebook: '', tiktok: '', youtube: '', other: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'social', data: { json: JSON.stringify(data) } })
    })
    const progress = JSON.parse(localStorage.getItem('go-progress') || '{}')
    progress.social = 'done'
    localStorage.setItem('go-progress', JSON.stringify(progress))
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="text-center py-20">
      <Check size={48} className="text-emerald-400 mx-auto mb-4" />
      <h2 className="text-2xl font-display text-white mb-2">Social Links Saved!</h2>
      <Link href="/go" className="btn-gold-outline mt-6 inline-block">Back to Command Center</Link>
    </div>
  )

  return (
    <div>
      <Link href="/go" className="inline-flex items-center gap-2 text-white/30 text-xs font-heading hover:text-gold transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Command Center
      </Link>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Share2 size={24} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-white">Social Media Links</h1>
          <p className="text-white/40 text-sm font-body">Enter your social media handles so we can link them on the site.</p>
        </div>
      </div>
      <div className="space-y-4 max-w-lg">
        {[
          ['instagram', 'Instagram', 'https://instagram.com/your-handle'],
          ['facebook', 'Facebook', 'https://facebook.com/your-page'],
          ['tiktok', 'TikTok', 'https://tiktok.com/@your-handle'],
          ['youtube', 'YouTube', 'https://youtube.com/@your-channel'],
          ['other', 'Other Links', 'Any other social media links'],
        ].map(([key, label, placeholder]) => (
          <div key={key}>
            <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">{label}</label>
            <input type="text" value={(data as any)[key]} onChange={e => setData(d => ({...d, [key]: e.target.value}))}
              placeholder={placeholder}
              className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15" />
          </div>
        ))}
        <button onClick={handleSubmit} className="btn-gold flex items-center gap-2"><Sparkles size={16} /> Save Social Links</button>
      </div>
    </div>
  )
}
