'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'dogs' | 'settings'
type ToastType = { message: string; type: 'success' | 'error'; id: number }

interface DogAdmin {
  _id: string
  name: string
  slug: { _type: string; current: string }
  breed: string
  variety?: string
  gender?: string
  color?: string
  dob?: string
  weight?: string
  height?: string
  status: string
  price?: number
  featured?: boolean
  personality?: string
  description?: any[]
  mainImage?: any
  gallery?: any[]
  sire?: string
  dam?: string
  bloodline?: string
  registry?: string
  registrationNumber?: string
}

interface DogFormData {
  name: string
  breed: string
  variety: string
  gender: string
  color: string
  dob: string
  weight: string
  height: string
  status: string
  price: string
  featured: boolean
  personality: string
  mainImage: any | null
  gallery: any[]
  sire: string
  dam: string
  bloodline: string
  registry: string
  registrationNumber: string
}

const emptyForm: DogFormData = {
  name: '', breed: 'American Bully', variety: '', gender: '', color: '',
  dob: '', weight: '', height: '', status: 'available', price: '',
  featured: false, personality: '', mainImage: null, gallery: [],
  sire: '', dam: '', bloodline: '', registry: '', registrationNumber: '',
}

const STATUSES = ['available', 'reserved', 'sold', 'stud', 'retired', 'upcoming'] as const
const VARIETIES = ['Standard', 'Classic', 'Pocket', 'XL', 'Micro', 'Exotic'] as const

const statusColors: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  reserved: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  sold: 'bg-red-500/20 text-red-400 border-red-500/30',
  stud: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  retired: 'bg-white/10 text-white/40 border-white/20',
  upcoming: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const projectId = typeof window !== 'undefined'
  ? (document.querySelector('meta[name="sanity-project-id"]')?.getAttribute('content') || 'ic4pnlo7')
  : 'ic4pnlo7'
const dataset = 'production'

function genKey() { return Math.random().toString(36).slice(2, 10) }

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function refToUrl(ref: string): string {
  if (!ref) return ''
  const parts = ref.replace('image-', '').split('-')
  const ext = parts.pop()
  const id = parts.join('-')
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}.${ext}`
}

function getImageUrl(img: any): string {
  if (!img) return ''
  if (img?.asset?.url) return img.asset.url
  if (img?.asset?._ref) return refToUrl(img.asset._ref)
  return ''
}

function dogToForm(dog: DogAdmin): DogFormData {
  return {
    name: dog.name || '', breed: dog.breed || 'American Bully',
    variety: dog.variety || '', gender: dog.gender || '',
    color: dog.color || '', dob: dog.dob || '',
    weight: dog.weight || '', height: dog.height || '',
    status: dog.status || 'available', price: dog.price != null ? String(dog.price) : '',
    featured: dog.featured || false, personality: dog.personality || '',
    mainImage: dog.mainImage || null,
    gallery: dog.gallery || [],
    sire: dog.sire || '', dam: dog.dam || '',
    bloodline: dog.bloodline || '', registry: dog.registry || '',
    registrationNumber: dog.registrationNumber || '',
  }
}

// ─── API Helpers ──────────────────────────────────────────────────────────────
function useAdminApi(password: string) {
  const adminFetch = useCallback(async (url: string) => {
    const res = await fetch(url, { headers: { 'x-admin-password': password } })
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Request failed') }
    return res.json()
  }, [password])

  const adminPost = useCallback(async (url: string, body: Record<string, unknown>) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(body),
    })
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Request failed') }
    return res.json()
  }, [password])

  const adminUpload = useCallback(async (file: File, label?: string) => {
    const fd = new FormData()
    fd.append('file', file)
    if (label) fd.append('label', label)
    const res = await fetch('/api/go/upload', { method: 'POST', headers: { 'x-admin-password': password }, body: fd })
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Upload failed') }
    return res.json() as Promise<{ _id: string; url: string }>
  }, [password])

  return { adminFetch, adminPost, adminUpload }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.type === 'success') { const t = setTimeout(onDismiss, 3000); return () => clearTimeout(t) }
  }, [toast, onDismiss])
  return (
    <div onClick={onDismiss} className={`fixed top-4 left-1/2 -translate-x-1/2 z-[10001] px-5 py-3 rounded-lg text-sm font-medium shadow-lg border backdrop-blur-sm cursor-pointer ${
      toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100' : 'bg-red-900/90 border-red-500/40 text-red-100'
    }`}>{toast.message}</div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-brand-dark border border-white/10 rounded-xl p-6 w-full max-w-sm space-y-4">
        <h3 className="text-white text-lg font-display">{title}</h3>
        <p className="text-white/60 text-sm font-body">{message}</p>
        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white text-sm font-heading transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-heading transition-colors">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ManagePage() {
  // Auth (uses ADMIN_PASSWORD, separate from the /go access code)
  const [authState, setAuthState] = useState<'checking' | 'locked' | 'authenticated'>('checking')
  const [password, setPassword] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('dogs')

  // Toast
  const [toasts, setToasts] = useState<ToastType[]>([])
  const toastIdRef = useRef(0)
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { message, type, id }])
  }, [])

  // API
  const api = useAdminApi(password)

  // Dog state
  const [dogs, setDogs] = useState<DogAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingDog, setEditingDog] = useState<DogAdmin | null>(null)
  const [form, setForm] = useState<DogFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  // Check session
  useEffect(() => {
    const saved = sessionStorage.getItem('ct-manage-auth')
    if (saved) { setPassword(saved); setAuthState('authenticated') }
    else setAuthState('locked')
  }, [])

  // Load dogs
  const loadDogs = useCallback(async () => {
    try {
      const data = await api.adminFetch('/api/go/dogs')
      setDogs(data)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally { setLoading(false) }
  }, [api, showToast])

  useEffect(() => {
    if (authState === 'authenticated') loadDogs()
  }, [authState, loadDogs])

  // ─── Auth handler ─────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(''); setAuthLoading(true)
    try {
      const res = await fetch('/api/go/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      })
      const data = await res.json()
      if (!res.ok) { setAuthError(data.error || 'Login failed'); return }
      setPassword(passwordInput)
      sessionStorage.setItem('ct-manage-auth', passwordInput)
      setAuthState('authenticated')
    } catch { setAuthError('Connection error') }
    finally { setAuthLoading(false) }
  }

  // ─── Dog CRUD ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return }
    if (!form.mainImage) { showToast('Main photo is required', 'error'); return }
    setSaving(true)
    try {
      const payload: Record<string, any> = {
        name: form.name.trim(),
        slug: { _type: 'slug', current: generateSlug(form.name) },
        breed: form.breed || 'American Bully',
        status: form.status,
        featured: form.featured,
        mainImage: form.mainImage,
      }
      if (form.variety) payload.variety = form.variety
      if (form.gender) payload.gender = form.gender
      if (form.color) payload.color = form.color
      if (form.dob) payload.dob = form.dob
      if (form.weight) payload.weight = form.weight
      if (form.height) payload.height = form.height
      if (form.price) payload.price = Number(form.price)
      if (form.personality) payload.personality = form.personality
      if (form.gallery.length > 0) payload.gallery = form.gallery
      if (form.sire) payload.sire = form.sire
      if (form.dam) payload.dam = form.dam
      if (form.bloodline) payload.bloodline = form.bloodline
      if (form.registry) payload.registry = form.registry
      if (form.registrationNumber) payload.registrationNumber = form.registrationNumber

      if (editingDog) {
        payload._id = editingDog._id
        await api.adminPost('/api/go/dogs', { action: 'update', payload })
        showToast(`${form.name} updated`)
      } else {
        await api.adminPost('/api/go/dogs', { action: 'create', payload })
        showToast(`${form.name} added`)
      }
      setView('list'); setEditingDog(null); await loadDogs()
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!editingDog) return; setShowDelete(false); setSaving(true)
    try {
      await api.adminPost('/api/go/dogs', { action: 'delete', payload: { _id: editingDog._id } })
      showToast(`${editingDog.name} deleted`); setView('list'); setEditingDog(null); await loadDogs()
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const toggleFeatured = async (dog: DogAdmin) => {
    try {
      await api.adminPost('/api/go/dogs', { action: 'toggle_featured', payload: { _id: dog._id, featured: dog.featured } })
      setDogs(prev => prev.map(d => d._id === dog._id ? { ...d, featured: !d.featured } : d))
      showToast(dog.featured ? 'Removed from homepage' : 'Added to homepage')
    } catch (err: any) { showToast(err.message, 'error') }
  }

  const cycleStatus = async (dog: DogAdmin) => {
    const idx = STATUSES.indexOf(dog.status as any)
    const next = STATUSES[(idx + 1) % STATUSES.length]
    try {
      await api.adminPost('/api/go/dogs', { action: 'set_status', payload: { _id: dog._id, status: next } })
      setDogs(prev => prev.map(d => d._id === dog._id ? { ...d, status: next } : d))
      showToast(`${dog.name} → ${next}`)
    } catch (err: any) { showToast(err.message, 'error') }
  }

  // ─── Image upload ─────────────────────────────────────────────────────────
  const uploadMainImage = async (file: File) => {
    setUploadingMain(true)
    try {
      const result = await api.adminUpload(file, form.name || 'dog')
      setForm(f => ({ ...f, mainImage: { _type: 'image', asset: { _type: 'reference', _ref: result._id } } }))
      showToast('Main photo uploaded')
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setUploadingMain(false) }
  }

  const uploadGalleryImages = async (files: FileList) => {
    setUploadingGallery(true)
    const newImages: any[] = []
    for (const file of Array.from(files)) {
      try {
        const result = await api.adminUpload(file, form.name || 'dog')
        newImages.push({ _type: 'image', _key: genKey(), asset: { _type: 'reference', _ref: result._id } })
      } catch (err: any) { showToast(`Failed: ${file.name}`, 'error') }
    }
    if (newImages.length > 0) {
      setForm(f => ({ ...f, gallery: [...f.gallery, ...newImages] }))
    }
    setUploadingGallery(false)
  }

  const removeGalleryImage = (key: string) => {
    setForm(f => ({ ...f, gallery: f.gallery.filter((img: any) => img._key !== key) }))
  }

  // ─── INPUT HELPER ─────────────────────────────────────────────────────────
  const inputCls = 'w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15 transition-colors'

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // Auth check
  if (authState === 'checking') return (
    <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gold animate-pulse font-display">Loading...</div></div>
  )

  if (authState === 'locked') return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-display text-white mb-1">Dog Manager</h1>
          <p className="text-white/40 text-sm font-body">Enter admin password to continue</p>
        </div>
        <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Admin password" autoFocus
          className={`${inputCls} text-center text-lg tracking-widest`} />
        {authError && <p className="text-red-400 text-sm text-center font-body">{authError}</p>}
        <button type="submit" disabled={authLoading || !passwordInput} className="btn-gold w-full py-3 disabled:opacity-50">
          {authLoading ? 'Verifying...' : 'Enter'}
        </button>
      </form>
    </div>
  )

  // ─── FORM VIEW ──────────────────────────────────────────────────────────
  if (view === 'form') return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Toasts */}
      {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />)}

      <button onClick={() => { setView('list'); setEditingDog(null) }} className="text-white/40 hover:text-gold text-sm font-heading transition-colors">← Back</button>
      <h2 className="text-white text-xl font-display">{editingDog ? 'Edit Dog' : 'Add New Dog'}</h2>

      {/* Name */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Name *</label>
        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. King Apollo" className={inputCls} />
      </div>

      {/* Main Photo */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Main Photo *</label>
        {form.mainImage ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-brand-dark border border-white/10 group">
            <img src={getImageUrl(form.mainImage)} alt="Main" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <label className="cursor-pointer text-gold text-xs font-heading">
                Change
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadMainImage(e.target.files[0])} />
              </label>
            </div>
          </div>
        ) : (
          <label className={`block w-full py-6 border-2 border-dashed border-gold/20 rounded-lg text-center cursor-pointer hover:border-gold/40 transition-colors ${uploadingMain ? 'animate-pulse' : ''}`}>
            <span className="text-gold/60 font-body text-sm">{uploadingMain ? 'Uploading...' : '+ Upload Main Photo'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadMainImage(e.target.files[0])} disabled={uploadingMain} />
          </label>
        )}
      </div>

      {/* Gallery */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Gallery Photos {form.gallery.length > 0 && <span className="text-white/20">({form.gallery.length})</span>}</label>
        {form.gallery.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
            {form.gallery.map((img: any, i: number) => (
              <div key={img._key || i} className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-brand-dark border border-white/10 group">
                <img src={getImageUrl(img)} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeGalleryImage(img._key)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </div>
            ))}
          </div>
        )}
        <label className={`block w-full py-4 border-2 border-dashed border-gold/20 rounded-lg text-center cursor-pointer hover:border-gold/40 transition-colors ${uploadingGallery ? 'animate-pulse' : ''}`}>
          <span className="text-gold/60 font-body text-sm">{uploadingGallery ? 'Uploading...' : '+ Add Gallery Photos'}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && uploadGalleryImages(e.target.files)} disabled={uploadingGallery} />
        </label>
      </div>

      {/* Breed + Variety */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Breed</label>
          <input type="text" value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Variety</label>
          <select value={form.variety} onChange={e => setForm(f => ({ ...f, variety: e.target.value }))} className={`${inputCls} [color-scheme:dark]`}>
            <option value="">Select...</option>
            {VARIETIES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Gender</label>
        <div className="flex gap-2">
          {['male', 'female'].map(g => (
            <button key={g} type="button" onClick={() => setForm(f => ({ ...f, gender: f.gender === g ? '' : g }))}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-heading capitalize transition-colors ${form.gender === g ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-white/40 hover:text-white/60'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* DOB + Color */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Date of Birth</label>
          <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} className={`${inputCls} [color-scheme:dark]`} />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Color</label>
          <input type="text" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="Blue Fawn" className={inputCls} />
        </div>
      </div>

      {/* Weight + Height */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Weight</label>
          <input type="text" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="65 lbs" className={inputCls} />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Height</label>
          <input type="text" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} placeholder="17 inches" className={inputCls} />
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Price</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">$</span>
          <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Leave blank for Contact Us"
            className={`${inputCls} pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Status</label>
        <div className="grid grid-cols-3 gap-2">
          {STATUSES.map(s => (
            <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
              className={`py-2 rounded-lg border text-xs font-heading capitalize transition-colors ${form.status === s ? statusColors[s] || '' : 'border-white/10 text-white/30 hover:text-white/50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-white text-sm font-heading">Show on Homepage</p>
          <p className="text-white/30 text-xs font-body">Featured dogs appear on the main page</p>
        </div>
        <button type="button" onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
          className={`relative w-12 h-7 rounded-full transition-colors ${form.featured ? 'bg-gold' : 'bg-white/10'}`}>
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.featured ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {/* Personality */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Personality / Temperament</label>
        <textarea value={form.personality} onChange={e => setForm(f => ({ ...f, personality: e.target.value }))} placeholder="Friendly, energetic, great with kids..." rows={3} className={`${inputCls} resize-none`} />
      </div>

      {/* Breeding Info (collapsible section) */}
      <details className="border border-white/5 rounded-lg">
        <summary className="px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-heading cursor-pointer hover:text-white/60">Breeding & Pedigree (optional)</summary>
        <div className="p-4 space-y-3 border-t border-white/5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-white/30 text-xs font-heading block mb-1">Sire (Father)</label><input type="text" value={form.sire} onChange={e => setForm(f => ({ ...f, sire: e.target.value }))} className={inputCls} /></div>
            <div><label className="text-white/30 text-xs font-heading block mb-1">Dam (Mother)</label><input type="text" value={form.dam} onChange={e => setForm(f => ({ ...f, dam: e.target.value }))} className={inputCls} /></div>
          </div>
          <div><label className="text-white/30 text-xs font-heading block mb-1">Bloodline</label><input type="text" value={form.bloodline} onChange={e => setForm(f => ({ ...f, bloodline: e.target.value }))} placeholder="Razors Edge, Gottiline..." className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-white/30 text-xs font-heading block mb-1">Registry</label><input type="text" value={form.registry} onChange={e => setForm(f => ({ ...f, registry: e.target.value }))} placeholder="ABKC, UKC..." className={inputCls} /></div>
            <div><label className="text-white/30 text-xs font-heading block mb-1">Reg. Number</label><input type="text" value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} className={inputCls} /></div>
          </div>
        </div>
      </details>

      {/* Save */}
      <button onClick={handleSave} disabled={saving} className="btn-gold w-full py-3.5 text-base disabled:opacity-50">
        {saving ? 'Saving...' : editingDog ? 'Save Changes' : 'Add Dog'}
      </button>

      {/* Delete */}
      {editingDog && (
        <button onClick={() => setShowDelete(true)} disabled={saving}
          className="w-full py-3 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-heading">
          Delete {editingDog.name}
        </button>
      )}
      {showDelete && editingDog && <ConfirmModal title={`Delete ${editingDog.name}?`} message="This permanently removes this dog from the site." onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
    </div>
  )

  // ─── LIST VIEW ──────────────────────────────────────────────────────────
  const filtered = dogs.filter(dog => {
    const matchSearch = !searchQuery || dog.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || dog.status === statusFilter
    return matchSearch && matchStatus
  })
  const featuredCount = dogs.filter(d => d.featured).length

  return (
    <div className="space-y-4">
      {/* Toasts */}
      {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />)}

      {/* Nav */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <Link href="/go" className="flex items-center gap-2 text-white/40 hover:text-gold text-sm font-heading transition-colors">
          <ArrowLeft size={16} /> Command Center
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-display">Dogs <span className="text-white/30 text-sm font-body">({dogs.length})</span></h2>
          {featuredCount > 0 && <p className="text-gold/50 text-xs font-heading">⭐ {featuredCount} on homepage</p>}
        </div>
        <button onClick={() => { setEditingDog(null); setForm(emptyForm); setView('form') }}
          className="w-11 h-11 rounded-full bg-gold text-brand-black text-2xl font-bold flex items-center justify-center hover:bg-gold-light transition-colors shadow-lg shadow-gold/20">+</button>
      </div>

      {/* Search + Filter */}
      {dogs.length > 3 && (
        <div className="flex gap-2">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..."
            className={`flex-1 ${inputCls} py-2 text-sm`} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${inputCls} w-auto py-2 text-sm [color-scheme:dark]`}>
            <option value="all">All</option>
            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12"><div className="text-gold animate-pulse font-display">Loading dogs...</div></div>
      ) : filtered.length === 0 ? (
        <p className="text-white/30 text-center py-12 font-body">{dogs.length === 0 ? 'No dogs yet. Tap + to add one.' : 'No dogs match your filter.'}</p>
      ) : (
        filtered.map(dog => (
          <div key={dog._id} onClick={() => { setEditingDog(dog); setForm(dogToForm(dog)); setView('form') }}
            className="flex items-center gap-3 p-3 bg-brand-dark/40 rounded-xl border border-white/5 hover:border-gold/20 transition-colors cursor-pointer active:bg-brand-dark/60">
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-lg bg-brand-dark overflow-hidden shrink-0 border border-white/5">
              {getImageUrl(dog.mainImage) && <img src={getImageUrl(dog.mainImage)} alt={dog.name} className="w-full h-full object-cover" />}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-heading truncate">{dog.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <button onClick={e => { e.stopPropagation(); cycleStatus(dog) }}>
                  <span className={`text-[10px] tracking-wider uppercase font-heading px-2 py-0.5 rounded-full border ${statusColors[dog.status] || statusColors.available}`}>{dog.status}</span>
                </button>
                <span className="text-white/25 text-xs font-body">{dog.price ? `$${dog.price.toLocaleString()}` : 'Contact'}</span>
              </div>
            </div>
            {/* Featured Star */}
            <button onClick={e => { e.stopPropagation(); toggleFeatured(dog) }} className="text-2xl shrink-0 transition-transform hover:scale-110 active:scale-95"
              title={dog.featured ? 'Remove from homepage' : 'Add to homepage'}>
              {dog.featured ? '⭐' : '☆'}
            </button>
          </div>
        ))
      )}
    </div>
  )
}
