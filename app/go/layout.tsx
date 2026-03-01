'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, Lock } from 'lucide-react'

const ACCESS_CODE = 'crunchgo2026'

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.toLowerCase().trim() === ACCESS_CODE) { localStorage.setItem('go-access', 'true'); onUnlock() }
    else { setError(true); setTimeout(() => setError(false), 2000) }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(208,185,112,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(208,185,112,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute top-8 left-8 w-24 h-24 border-t border-l border-gold/20" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-b border-r border-gold/20" />
      <div className="relative z-10 text-center px-6 max-w-md w-full">
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Lock size={32} className="text-gold" />
        </div>
        <h1 className="text-3xl font-display text-white mb-2">Access Portal</h1>
        <p className="text-white/40 font-body text-sm mb-8">Enter your access code to continue</p>
        <form onSubmit={submit} className="space-y-4">
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Enter access code" autoFocus
            className={`w-full bg-brand-dark border ${error ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-gold/40'} rounded-lg px-5 py-4 text-white font-body text-center text-lg tracking-widest focus:outline-none transition-all placeholder:text-white/15`} />
          <button type="submit" className="btn-gold w-full py-4 text-base"><Shield size={18} className="inline mr-2" /> Authenticate</button>
        </form>
        {error && <p className="text-red-400 text-sm font-heading mt-4 animate-fade-in">Invalid access code</p>}
      </div>
    </div>
  )
}

export default function GoLayout({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => { setReady(true); if (localStorage.getItem('go-access') === 'true') setAuth(true) }, [])
  if (!ready) return null
  if (!auth) return <Gate onUnlock={() => setAuth(true)} />

  return (
    <div className="min-h-screen bg-brand-black relative">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(208,185,112,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(208,185,112,0.4) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      <div className="sticky top-0 z-50 bg-brand-black/90 backdrop-blur-xl border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/go" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
              <span className="font-display text-gold text-sm">CT</span>
            </div>
            <div>
              <p className="text-white text-sm font-display leading-none">Command Center</p>
              <p className="text-gold/40 text-[9px] tracking-[0.3em] uppercase font-heading">Crunchtyme Bullies</p>
            </div>
          </Link>
          <Link href="/" className="text-white/30 text-xs font-heading hover:text-gold transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Main Site
          </Link>
        </div>
      </div>
      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">{children}</main>
    </div>
  )
}
