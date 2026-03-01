'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Palette, Check, Upload, Sparkles } from 'lucide-react'

export default function BrandingPage() {
  const [data, setData] = useState({ colors: '', slogans: '', notes: '' })
  const [logos, setLogos] = useState<{id:string,url:string,name:string}[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.append('file', files[i])
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setLogos(prev => [...prev, { id: data.id, url: data.url, name: data.originalFilename }])
    }
    setUploading(false)
  }

  const handleSubmit = async () => {
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'branding', data: { json: JSON.stringify({ ...data, logos }) } })
    })
    const progress = JSON.parse(localStorage.getItem('go-progress') || '{}')
    progress.branding = 'done'
    localStorage.setItem('go-progress', JSON.stringify(progress))
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="text-center py-20">
      <Check size={48} className="text-emerald-400 mx-auto mb-4" />
      <h2 className="text-2xl font-display text-white mb-2">Brand Assets Submitted!</h2>
      <Link href="/go" className="btn-gold-outline mt-6 inline-block">Back to Command Center</Link>
    </div>
  )

  return (
    <div>
      <Link href="/go" className="inline-flex items-center gap-2 text-white/30 text-xs font-heading hover:text-gold transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Command Center
      </Link>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
          <Palette size={24} className="text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-white">Brand Assets</h1>
          <p className="text-white/40 text-sm font-body">Upload logos and share brand details.</p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Upload Logo Files</label>
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-gold/30 transition-colors">
            <input ref={fileRef} type="file" multiple accept="image/*,.svg,.ai,.psd,.pdf" className="hidden" onChange={e => handleLogoUpload(e.target.files)} />
            {uploading ? <p className="text-gold font-heading text-sm">Uploading...</p> : (
              <><Upload size={24} className="text-white/30 mx-auto mb-2" /><p className="text-white/40 text-sm font-body">Tap to upload logo files (PNG, SVG, AI, PSD)</p></>
            )}
          </div>
          {logos.length > 0 && (
            <div className="flex gap-3 mt-3 flex-wrap">
              {logos.map((l,i) => <div key={i} className="w-16 h-16 rounded-lg bg-brand-dark border border-white/10 overflow-hidden"><img src={l.url} alt="" className="w-full h-full object-contain p-1" /></div>)}
            </div>
          )}
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Brand Colors</label>
          <input type="text" value={data.colors} onChange={e => setData(d => ({...d, colors: e.target.value}))}
            placeholder="e.g. Gold, Black, White — or specific hex codes if you have them"
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15" />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Slogans / Taglines</label>
          <textarea value={data.slogans} onChange={e => setData(d => ({...d, slogans: e.target.value}))} rows={3}
            placeholder="Any slogans or catchphrases you use or want on the site"
            className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15" />
        </div>
        <button onClick={handleSubmit} className="btn-gold flex items-center gap-2"><Sparkles size={16} /> Submit Brand Assets</button>
      </div>
    </div>
  )
}
