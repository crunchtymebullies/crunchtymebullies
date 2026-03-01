'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, RefreshCw, CheckCircle2, Clock, AlertCircle, Camera, Dog, CreditCard, Store, Palette, Share2, FileText, Wrench, MessageSquare, ChevronDown, ChevronUp, Image, X, ExternalLink } from 'lucide-react'

const ADMIN_CODE = 'nexadev2026'

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  'dog-photo': { label: 'Dog Photos', icon: Camera, color: 'text-emerald-400 bg-emerald-500/10' },
  'dog-info': { label: 'Dog Info', icon: Dog, color: 'text-amber-400 bg-amber-500/10' },
  'stripe-credentials': { label: 'Stripe Creds', icon: CreditCard, color: 'text-red-400 bg-red-500/10' },
  'store-info': { label: 'Store Info', icon: Store, color: 'text-purple-400 bg-purple-500/10' },
  'branding': { label: 'Branding', icon: Palette, color: 'text-pink-400 bg-pink-500/10' },
  'social': { label: 'Social Links', icon: Share2, color: 'text-cyan-400 bg-cyan-500/10' },
  'content': { label: 'Content', icon: FileText, color: 'text-orange-400 bg-orange-500/10' },
  'services': { label: 'Services Info', icon: Wrench, color: 'text-indigo-400 bg-indigo-500/10' },
  'developer-message': { label: 'Dev Message', icon: MessageSquare, color: 'text-gold bg-gold/10' },
}

const statusColors: Record<string, string> = {
  new: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  reviewed: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  processed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

interface Submission {
  _id: string; submissionType: string; data?: { json?: string }; submittedAt: string; status: string; notes?: string
}

interface Asset {
  _id: string; url: string; originalFilename: string; _createdAt: string; size: number
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim() === ADMIN_CODE) { localStorage.setItem('go-admin', 'true'); onUnlock() }
    else { setError(true); setTimeout(() => setError(false), 2000) }
  }
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"><Shield size={28} className="text-red-400" /></div>
        <h1 className="text-2xl font-display text-white mb-2">Developer Access</h1>
        <p className="text-white/40 font-body text-sm mb-6">This area is restricted to the development team.</p>
        <form onSubmit={submit} className="space-y-3">
          <input type="password" value={code} onChange={e => setCode(e.target.value)} placeholder="Admin code"
            className={`w-full bg-brand-dark border ${error ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-red-400/40'} rounded-lg px-4 py-3 text-white font-body text-center tracking-widest focus:outline-none placeholder:text-white/15`} autoFocus />
          <button type="submit" className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-heading text-sm tracking-wider uppercase rounded-lg hover:bg-red-500/30 transition-colors">Authenticate</button>
        </form>
      </div>
    </div>
  )
}

function SubmissionCard({ sub, onUpdate }: { sub: Submission; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const config = typeConfig[sub.submissionType] || { label: sub.submissionType, icon: FileText, color: 'text-white/40 bg-white/5' }
  const Icon = config.icon

  let parsed: any = null
  try { parsed = JSON.parse(sub.data?.json || '{}') } catch { parsed = sub.data?.json }

  const updateStatus = async (status: string) => {
    setUpdating(true)
    await fetch('/api/admin/submissions/update', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-code': ADMIN_CODE },
      body: JSON.stringify({ id: sub._id, status })
    })
    setUpdating(false)
    onUpdate()
  }

  const timeAgo = (d: string) => {
    const ms = Date.now() - new Date(d).getTime()
    const mins = Math.floor(ms / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${sub.status === 'new' ? 'border-blue-500/20 bg-blue-500/[0.02]' : 'border-white/5 bg-brand-dark/30'}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-4 text-left">
        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-heading text-sm">{config.label}</h3>
            <span className={`text-[9px] tracking-wider uppercase font-heading px-2 py-0.5 border rounded-full ${statusColors[sub.status] || statusColors.new}`}>{sub.status}</span>
          </div>
          <p className="text-white/30 text-xs font-body">{timeAgo(sub.submittedAt)}</p>
        </div>
        {expanded ? <ChevronUp size={16} className="text-white/20" /> : <ChevronDown size={16} className="text-white/20" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="bg-brand-black/50 rounded-lg p-4 mb-3 max-h-80 overflow-auto">
            {sub.submissionType === 'dog-photo' && Array.isArray(parsed) ? (
              <div>
                <p className="text-white/40 text-xs font-heading mb-3">{parsed.length} photos uploaded</p>
                <div className="grid grid-cols-3 gap-2">
                  {parsed.map((p: any, i: number) => (
                    <div key={i} className="relative group">
                      <img src={p.url} alt={p.dogName} className="w-full aspect-square object-cover rounded-lg" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 rounded-b-lg">
                        <p className="text-white text-[10px] font-heading truncate">{p.dogName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : sub.submissionType === 'stripe-credentials' ? (
              <div className="space-y-2">
                <p className="text-red-400 text-xs font-heading mb-2">⚠️ SENSITIVE — Stripe Login</p>
                <p className="text-white text-sm font-body"><span className="text-white/40">Email:</span> {parsed?.email}</p>
                <p className="text-white text-sm font-body"><span className="text-white/40">Password:</span> {parsed?.password}</p>
              </div>
            ) : sub.submissionType === 'developer-message' ? (
              <div>
                <p className="text-gold text-xs font-heading mb-2">Message from: {parsed?.name || 'Client'}</p>
                <p className="text-white/70 font-body text-sm whitespace-pre-wrap">{parsed?.message}</p>
              </div>
            ) : sub.submissionType === 'dog-info' && Array.isArray(parsed) ? (
              <div className="space-y-4">
                {parsed.map((dog: any, i: number) => (
                  <div key={i} className="border-b border-white/5 pb-3 last:border-0">
                    <p className="text-gold font-heading text-sm mb-1">{dog.name || `Dog ${i+1}`}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(dog).filter(([k,v]) => v && k !== 'name').map(([k,v]) => (
                        <p key={k} className="text-white/50"><span className="text-white/25">{k}:</span> {String(v)}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-white/50 font-body text-xs whitespace-pre-wrap break-all">
                {typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(parsed)}
              </pre>
            )}
          </div>

          <div className="flex gap-2">
            {sub.status !== 'reviewed' && (
              <button onClick={() => updateStatus('reviewed')} disabled={updating}
                className="text-xs font-heading text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors disabled:opacity-30">
                Mark Reviewed
              </button>
            )}
            {sub.status !== 'processed' && (
              <button onClick={() => updateStatus('processed')} disabled={updating}
                className="text-xs font-heading text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-30">
                Mark Processed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<'submissions' | 'assets'>('submissions')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { setReady(true); if (localStorage.getItem('go-admin') === 'true') setAuth(true) }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [subs, imgs] = await Promise.all([
        fetch('/api/admin/submissions', { headers: { 'x-admin-code': ADMIN_CODE } }).then(r => r.json()),
        fetch('/api/admin/assets', { headers: { 'x-admin-code': ADMIN_CODE } }).then(r => r.json()),
      ])
      setSubmissions(Array.isArray(subs) ? subs : [])
      setAssets(Array.isArray(imgs) ? imgs : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { if (auth) fetchData() }, [auth])

  if (!ready) return null
  if (!auth) return <Gate onUnlock={() => setAuth(true)} />

  const filtered = filter === 'all' ? submissions : submissions.filter(s => s.submissionType === filter)
  const newCount = submissions.filter(s => s.status === 'new').length
  const types = [...new Set(submissions.map(s => s.submissionType))]

  const formatSize = (b: number) => b > 1048576 ? `${(b/1048576).toFixed(1)}MB` : `${(b/1024).toFixed(0)}KB`

  return (
    <div>
      <Link href="/go" className="inline-flex items-center gap-2 text-white/30 text-xs font-heading hover:text-gold transition-colors mb-8"><ArrowLeft size={14} /> Back to Command Center</Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-red-400" />
            <span className="text-red-400 text-[10px] tracking-[0.3em] uppercase font-heading">Developer Access</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display text-white">Admin Dashboard</h1>
        </div>
        <button onClick={fetchData} disabled={loading} className="p-3 bg-brand-dark/50 border border-white/10 rounded-xl hover:border-gold/20 transition-colors disabled:opacity-30">
          <RefreshCw size={18} className={`text-white/40 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-brand-dark/50 border border-white/5 rounded-xl text-center">
          <p className="text-2xl font-display text-white">{submissions.length}</p>
          <p className="text-white/30 text-xs font-heading">Total Submissions</p>
        </div>
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-center">
          <p className="text-2xl font-display text-blue-400">{newCount}</p>
          <p className="text-blue-400/50 text-xs font-heading">New / Unread</p>
        </div>
        <div className="p-4 bg-brand-dark/50 border border-white/5 rounded-xl text-center">
          <p className="text-2xl font-display text-white">{assets.length}</p>
          <p className="text-white/30 text-xs font-heading">Uploaded Images</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('submissions')} className={`px-4 py-2 rounded-lg text-xs font-heading tracking-wider uppercase transition-colors ${tab === 'submissions' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-brand-dark/30 text-white/30 border border-white/5 hover:text-white/50'}`}>
          Submissions {newCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[9px]">{newCount}</span>}
        </button>
        <button onClick={() => setTab('assets')} className={`px-4 py-2 rounded-lg text-xs font-heading tracking-wider uppercase transition-colors ${tab === 'assets' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-brand-dark/30 text-white/30 border border-white/5 hover:text-white/50'}`}>
          Image Assets
        </button>
      </div>

      {tab === 'submissions' && (
        <>
          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setFilter('all')} className={`text-[10px] tracking-wider uppercase font-heading px-3 py-1.5 rounded-full border transition-colors ${filter === 'all' ? 'text-gold border-gold/30 bg-gold/10' : 'text-white/30 border-white/5 hover:text-white/50'}`}>All</button>
            {types.map(t => {
              const c = typeConfig[t]
              return <button key={t} onClick={() => setFilter(t)} className={`text-[10px] tracking-wider uppercase font-heading px-3 py-1.5 rounded-full border transition-colors ${filter === t ? 'text-gold border-gold/30 bg-gold/10' : 'text-white/30 border-white/5 hover:text-white/50'}`}>{c?.label || t}</button>
            })}
          </div>

          {loading ? (
            <div className="text-center py-12"><RefreshCw size={24} className="text-gold animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-white/20 font-body">No submissions yet</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(sub => <SubmissionCard key={sub._id} sub={sub} onUpdate={fetchData} />)}
            </div>
          )}
        </>
      )}

      {tab === 'assets' && (
        <div>
          {loading ? (
            <div className="text-center py-12"><RefreshCw size={24} className="text-gold animate-spin mx-auto" /></div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 text-white/20 font-body">No images uploaded yet</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {assets.map(a => (
                <a key={a._id} href={a.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-xl overflow-hidden bg-brand-dark border border-white/5 hover:border-gold/20 transition-colors">
                  <img src={`${a.url}?w=400&h=400&fit=crop`} alt={a.originalFilename} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] font-heading truncate">{a.originalFilename}</p>
                    <p className="text-white/40 text-[9px]">{formatSize(a.size)} · {new Date(a._createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={12} className="text-white/60" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
