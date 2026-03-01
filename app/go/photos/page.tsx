'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Upload, X, Check, AlertCircle, Info, Sparkles } from 'lucide-react'

interface Photo { id: string; url: string; filename: string; dogName: string; notes: string }

const tips = [
  { title: 'Natural Light', desc: "Outside or near a window. No flash — it flattens the coat." },
  { title: 'Clean Background', desc: 'Plain wall, grass, or clean floor. Remove clutter.' },
  { title: 'Get Low', desc: "Kneel to the dog's eye level for a pro look." },
  { title: 'Multiple Angles', desc: 'Front face, left side, right side, stacked/standing, personality shot.' },
  { title: 'Keep Still', desc: 'Use a treat for attention. Wait for ears up, alert.' },
  { title: 'Phone is Fine', desc: 'Just make sure the lens is clean and photo is in focus.' },
]

export default function PhotosPage() {
  const [uploads, setUploads] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dogName, setDogName] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (files: FileList | null) => {
    if (!files?.length) return
    if (!dogName.trim()) { setError("Enter the dog's name first"); return }
    setUploading(true); setError('')
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      const fd = new FormData(); fd.append('file', file)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.error) { setError(data.error); continue }
        setUploads(prev => [...prev, { id: data.id, url: data.url, filename: data.originalFilename || file.name, dogName: dogName.trim(), notes: notes.trim() }])
      } catch (e: any) { setError(e.message) }
    }
    setUploading(false); setSuccess(`Uploaded!`); setTimeout(() => setSuccess(''), 3000)
  }, [dogName, notes])

  const submitAll = async () => {
    if (!uploads.length) return
    await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'dog-photo', data: { json: JSON.stringify(uploads) } }) })
    const p = JSON.parse(localStorage.getItem('go-progress') || '{}'); p.photos = 'in-progress'; localStorage.setItem('go-progress', JSON.stringify(p))
    setSuccess('All photos submitted for review!')
  }

  return (
    <div>
      <Link href="/go" className="inline-flex items-center gap-2 text-white/30 text-xs font-heading hover:text-gold transition-colors mb-8"><ArrowLeft size={14} /> Back to Command Center</Link>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Camera size={24} className="text-emerald-400" /></div>
        <div><h1 className="text-2xl md:text-3xl font-display text-white">Upload Dog Photos</h1><p className="text-white/40 text-sm font-body">Great photos, uploaded here. We handle the rest.</p></div>
      </div>

      <div className="mb-10 p-6 bg-brand-dark/50 border border-gold/10 rounded-xl">
        <div className="flex items-center gap-2 mb-4"><Info size={16} className="text-gold" /><h2 className="text-gold text-xs tracking-[0.2em] uppercase font-heading">How to Take Great Photos</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map((t, i) => (
            <div key={i} className="flex gap-3 p-3 bg-brand-black/30 rounded-lg">
              <span className="text-gold/40 font-heading text-xs mt-0.5">{String(i+1).padStart(2,'0')}</span>
              <div><p className="text-white text-sm font-heading">{t.title}</p><p className="text-white/35 text-xs font-body mt-0.5">{t.desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Dog Name *</label>
            <input type="text" value={dogName} onChange={e => setDogName(e.target.value)} placeholder="e.g. Blue Steel"
              className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15" /></div>
          <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Notes (optional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Side profile"
              className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15" /></div>
        </div>

        <div onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files) }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragOver ? 'border-gold bg-gold/5 scale-[1.01]' : uploading ? 'border-gold/30 bg-gold/5' : 'border-white/10 hover:border-gold/30'}`}>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => upload(e.target.files)} />
          {uploading ? <div className="flex flex-col items-center gap-3"><div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" /><p className="text-gold font-heading text-sm">Uploading...</p></div>
          : <div className="flex flex-col items-center gap-3"><Upload size={28} className="text-white/30" /><p className="text-white font-heading">Tap to select photos or drag & drop</p><p className="text-white/30 text-sm font-body">JPG, PNG, HEIC — any size, any amount</p></div>}
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 animate-fade-in"><AlertCircle size={18} className="text-red-400" /><p className="text-red-300 text-sm">{error}</p><button onClick={() => setError('')} className="ml-auto text-red-400"><X size={16} /></button></div>}
      {success && <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 animate-fade-in"><Check size={18} className="text-emerald-400" /><p className="text-emerald-300 text-sm">{success}</p></div>}

      {uploads.length > 0 && (
        <div className="mb-8">
          <h3 className="text-white/40 text-xs uppercase tracking-wider font-heading mb-4">Uploaded ({uploads.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploads.map((p, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-brand-dark border border-white/5 group">
                <img src={p.url} alt={p.dogName} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-white text-xs font-heading truncate">{p.dogName}</p></div>
                <div className="absolute top-2 right-2"><Check size={14} className="text-emerald-400 bg-emerald-500/20 rounded-full p-0.5" /></div>
              </div>
            ))}
          </div>
          <button onClick={submitAll} className="btn-gold mt-6"><Sparkles size={16} className="inline mr-2" /> Submit All for Review</button>
        </div>
      )}
    </div>
  )
}
