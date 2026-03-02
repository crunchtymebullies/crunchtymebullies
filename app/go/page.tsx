'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Camera, Dog, CreditCard, Store, Palette, Share2, FileText, Wrench, ChevronRight, CheckCircle2, Circle, Clock, Sparkles, Zap, BarChart3, MessageSquare, X as XIcon } from 'lucide-react'

const defaultItems = [
  { id: 'photos', title: 'Upload Dog Photos', description: 'Take clean, well-lit photos of each dog and upload them here.', href: '/go/photos', icon: Camera, priority: 'high', accentColor: 'emerald' },
  { id: 'dogs', title: 'Dog Information', description: 'Fill in breed details, pedigree info, health tests, and personality for each dog.', href: '/go/dogs', icon: Dog, priority: 'high', accentColor: 'amber' },
  { id: 'stripe', title: 'Set Up Stripe Payments', description: 'Step-by-step walkthrough to create your Stripe business account.', href: '/go/stripe', icon: CreditCard, priority: 'high', accentColor: 'blue' },
  { id: 'store', title: 'Store & Products', description: 'Products you want to sell — apparel, supplements, accessories, vendor info.', href: '/go/store', icon: Store, priority: 'medium', accentColor: 'purple' },
  { id: 'branding', title: 'Brand Assets', description: 'Upload logo files, confirm colors, share marketing materials.', href: '/go/branding', icon: Palette, priority: 'medium', accentColor: 'pink' },
  { id: 'social', title: 'Social Media Links', description: 'Connect your Instagram, Facebook, TikTok to the website.', href: '/go/social', icon: Share2, priority: 'medium', accentColor: 'cyan' },
  { id: 'content', title: 'Written Content', description: 'Your story, FAQ answers, testimonials, and policies.', href: '/go/content', icon: FileText, priority: 'low', accentColor: 'orange' },
  { id: 'services', title: 'Services & Pricing', description: 'Stud fees, puppy deposits, delivery costs, and terms.', href: '/go/services', icon: Wrench, priority: 'low', accentColor: 'indigo' },
]

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: 'PRIORITY', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  medium: { label: 'IMPORTANT', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  low: { label: 'WHEN READY', color: 'text-white/40 bg-white/5 border-white/10' },
}

function DevContact() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!msg.trim()) return
    setSending(true)
    try {
      await fetch('/api/contact-dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, message: msg }) })
      setSent(true)
    } catch {}
    setSending(false)
  }

  return (
    <>
      <div className="mt-12 p-6 bg-brand-dark/30 border border-white/5 rounded-xl text-center">
        <Sparkles size={20} className="text-gold mx-auto mb-3" />
        <p className="text-white/40 font-body text-sm mb-4">
          Need help? Reach out to your development team at <a href="mailto:admin@nexavisiongroup.com" className="text-gold hover:underline">admin@nexavisiongroup.com</a>
        </p>
        <button onClick={() => { setOpen(true); setSent(false) }} className="btn-gold-outline text-sm inline-flex items-center gap-2">
          <MessageSquare size={14} /> Send Message to Developer
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-brand-dark border border-gold/20 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/20 hover:text-white/40"><XIcon size={18} /></button>

            {sent ? (
              <div className="text-center py-6">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-display text-white mb-2">Message Sent!</h3>
                <p className="text-white/40 font-body text-sm">Your developer will get back to you soon.</p>
                <button onClick={() => setOpen(false)} className="btn-gold-outline mt-6 text-sm">Close</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center"><MessageSquare size={18} className="text-gold" /></div>
                  <div>
                    <h3 className="text-lg font-display text-white">Message Your Developer</h3>
                    <p className="text-white/30 text-xs font-body">NexaVision Group</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                    className="w-full bg-brand-black border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15 text-sm" />
                  <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} placeholder="What do you need help with?"
                    className="w-full bg-brand-black border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none resize-none placeholder:text-white/15 text-sm" />
                  <button onClick={send} disabled={sending || !msg.trim()} className="btn-gold w-full text-sm disabled:opacity-30 disabled:cursor-not-allowed">
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function GoDashboard() {
  const [progress, setProgress] = useState<Record<string, string>>({})
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    try { setProgress(JSON.parse(localStorage.getItem('go-progress') || '{}')) } catch {}
  }, [])

  const completed = Object.values(progress).filter(v => v === 'done').length
  const pct = Math.round((completed / defaultItems.length) * 100)

  return (
    <div>
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-[10px] tracking-[0.3em] uppercase font-heading">System Online</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display text-white mb-4">Welcome to your<br /><span className="text-gold">Command Center</span></h1>
        <p className="text-white/45 font-body text-lg max-w-2xl leading-relaxed">
          Complete each item below to get your site fully loaded with content, photos, and payment systems. Take your time — we will review everything.
        </p>
      </div>

      {/* Quick Actions */}
      <Link href="/go/manage"
        className="group mb-10 block p-5 rounded-xl border-2 border-gold/30 bg-gradient-to-r from-gold/5 to-transparent hover:border-gold/50 hover:from-gold/10 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gold/15 flex items-center justify-center group-hover:bg-gold/25 transition-colors">
            <Zap size={26} className="text-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg text-gold group-hover:text-gold-light transition-colors">Manage Dogs</h3>
            <p className="text-white/40 font-body text-sm mt-0.5">Add, edit, and manage your dogs — photos, prices, homepage, and more</p>
          </div>
          <ChevronRight size={20} className="text-gold/40 group-hover:text-gold group-hover:translate-x-1 transition-all" />
        </div>
      </Link>

      <div className="mb-10 p-6 bg-brand-dark/50 border border-gold/10 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><BarChart3 size={16} className="text-gold" /><span className="text-white text-sm font-heading">Overall Progress</span></div>
          <span className="text-gold font-heading text-sm">{pct}%</span>
        </div>
        <div className="h-2 bg-brand-black rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-white/30 text-xs font-body mt-2">{completed} of {defaultItems.length} tasks completed</p>
      </div>

      {(['high', 'medium', 'low'] as const).map(priority => {
        const filtered = defaultItems.filter(i => i.priority === priority)
        const config = priorityConfig[priority]
        return (
          <div key={priority} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[9px] tracking-[0.25em] uppercase font-heading px-2.5 py-1 border rounded-full ${config.color}`}>{config.label}</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-3">
              {filtered.map(item => {
                const status = progress[item.id] || 'not-started'
                const isHovered = hovered === item.id
                const isDone = status === 'done'
                return (
                  <Link key={item.id} href={item.href} onMouseEnter={() => setHovered(item.id)} onMouseLeave={() => setHovered(null)}
                    className={`group block p-5 rounded-xl border transition-all duration-300 ${isDone ? 'bg-emerald-500/5 border-emerald-500/20' : isHovered ? 'bg-brand-dark/80 border-gold/30 shadow-lg shadow-gold/5' : 'bg-brand-dark/40 border-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isDone ? 'bg-emerald-500/20' : isHovered ? 'bg-gold/15' : 'bg-white/5'}`}>
                        <item.icon size={22} className={`transition-colors ${isDone ? 'text-emerald-400' : isHovered ? 'text-gold' : 'text-white/40'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-display text-lg transition-colors ${isDone ? 'text-emerald-300' : 'text-white group-hover:text-gold'}`}>{item.title}</h3>
                        <p className="text-white/35 font-body text-sm mt-0.5 line-clamp-1">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {isDone ? <CheckCircle2 size={18} className="text-emerald-400" /> : status === 'in-progress' ? <Clock size={18} className="text-amber-400" /> : <Circle size={18} className="text-white/15" />}
                        <ChevronRight size={18} className={`transition-all ${isHovered ? 'text-gold translate-x-1' : 'text-white/15'}`} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      <DevContact />
    </div>
  )
}
