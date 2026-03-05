'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'dogs' | 'services' | 'store' | 'customers' | 'payments' | 'messages' | 'settings' | 'analytics'
type ToastType = { message: string; type: 'success' | 'error'; id: number }

interface DogAdmin {
  _id: string; name: string; slug: { _type: string; current: string }
  breed: string; variety?: string; gender?: string; color?: string
  dob?: string; weight?: string; height?: string; status: string
  price?: number; featured?: boolean; personality?: string
  description?: string; mainImage?: any; gallery?: any[]
  sire?: string; dam?: string; bloodline?: string
  registry?: string; registrationNumber?: string
}

interface DogFormData {
  name: string; breed: string; variety: string; gender: string
  color: string; dob: string; weight: string; height: string
  status: string; price: string; featured: boolean; personality: string
  description: string; mainImage: any | null; gallery: any[]
  sire: string; dam: string; bloodline: string
  registry: string; registrationNumber: string
}

const emptyForm: DogFormData = {
  name: '', breed: 'American Bully', variety: '', gender: '', color: '',
  dob: '', weight: '', height: '', status: 'available', price: '',
  featured: false, personality: '', description: '', mainImage: null, gallery: [],
  sire: '', dam: '', bloodline: '', registry: '', registrationNumber: '',
}

// ─── Service Types ────────────────────────────────────────────────────────────
interface ServiceAdmin {
  _id: string; title: string; slug?: { _type: string; current: string }
  description?: string; price?: string; featured?: boolean; order?: number
  image?: any
}

interface ServiceFormData {
  title: string; description: string; price: string; featured: boolean; order: string; image: any | null
}

const emptyServiceForm: ServiceFormData = {
  title: '', description: '', price: '', featured: false, order: '0', image: null,
}

// ─── Dropdown Data ───────────────────────────────────────────────────────────
const BREEDS = [
  'American Bully', 'French Bulldog', 'English Bulldog', 'Exotic Bully', 'Micro Bully',
  'American Pit Bull Terrier', 'American Staffordshire Terrier', 'American Bulldog',
  'Cane Corso', 'Dogo Argentino', 'Bullmastiff', 'Olde English Bulldogge',
  'Shorty Bull', 'Staffordshire Bull Terrier', 'Bull Terrier',
  'Presa Canario', 'Boxer', 'Alapaha Blue Blood Bulldog',
]

const VARIETY_MAP: Record<string, string[]> = {
  'American Bully': ['Standard', 'Classic', 'Pocket', 'XL', 'Micro', 'Exotic'],
  'French Bulldog': ['Standard', 'Micro', 'Fluffy/Long-Hair'],
  'English Bulldog': ['Standard', 'Miniature'],
  'Exotic Bully': ['Standard', 'Micro', 'Clean Exotic'],
  'Micro Bully': ['Standard', 'Extreme'],
  'American Pit Bull Terrier': ['Standard'],
  'Cane Corso': ['Standard'],
}

const COLORS = [
  'Black', 'Blue', 'Fawn', 'Red', 'White', 'Champagne', 'Chocolate', 'Lilac', 'Cream',
  'Blue Fawn', 'Blue Brindle', 'Fawn Brindle', 'Reverse Brindle', 'Red Brindle',
  'Blue Tri', 'Lilac Tri', 'Chocolate Tri', 'Black Tri', 'Ghost Tri',
  'Blue Merle', 'Lilac Merle', 'Chocolate Merle', 'Red Merle',
  'Piebald', 'Tuxedo', 'Seal', 'Sable',
  'Blue Nose', 'Red Nose',
]

const REGISTRIES = ['ABKC', 'UKC', 'AKC', 'ADBA', 'USBR', 'OBKC', 'BBCR', 'APRI', 'DRA', 'IDCR']

const STATUSES = ['available', 'reserved', 'sold', 'stud', 'our-program', 'not-for-sale', 'retired', 'upcoming'] as const

const statusColors: Record<string, string> = {
  'available': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'reserved': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'sold': 'bg-red-500/20 text-red-400 border-red-500/30',
  'stud': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'our-program': 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
  'not-for-sale': 'bg-white/10 text-white/50 border-white/20',
  'retired': 'bg-white/10 text-white/40 border-white/20',
  'upcoming': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const projectId = 'ic4pnlo7'
const dataset = 'production'

function genKey() { return Math.random().toString(36).slice(2, 10) }
function generateSlug(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

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

// Normalize image to proper Sanity reference format before saving
// The admin loads dereferenced images (asset->{ url, _id }) but Sanity
// expects { _type: 'reference', _ref: id } when writing.
function normalizeImageForSave(img: any): any {
  if (!img) return null
  const ref = img.asset?._ref || img.asset?._id
  if (!ref) return null
  return {
    _type: 'image',
    ...(img._key ? { _key: img._key } : {}),
    asset: { _type: 'reference', _ref: ref },
  }
}

function normalizeGalleryForSave(gallery: any[]): any[] {
  if (!gallery || !Array.isArray(gallery)) return []
  return gallery
    .map((img) => normalizeImageForSave(img))
    .filter(Boolean)
    .map((img: any, i: number) => ({
      ...img,
      _key: img._key || `gallery-${i}-${Date.now()}`,
    }))
}

function dogToForm(dog: DogAdmin): DogFormData {
  return {
    name: dog.name || '', breed: dog.breed || 'American Bully',
    variety: dog.variety || '', gender: dog.gender || '',
    color: dog.color || '', dob: dog.dob || '',
    weight: dog.weight || '', height: dog.height || '',
    status: dog.status || 'available', price: dog.price != null ? String(dog.price) : '',
    featured: dog.featured || false, personality: dog.personality || '',
    description: typeof dog.description === 'string' ? dog.description : '',
    mainImage: dog.mainImage || null, gallery: dog.gallery || [],
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

  return { adminFetch, adminPost, adminUpload } as const
}

// ─── Combo Select (dropdown + manual entry) ──────────────────────────────────
function ComboSelect({ value, onChange, options, placeholder, className }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; className?: string
}) {
  const isCustom = !!(value && !options.includes(value))
  const [manualMode, setManualMode] = useState(isCustom)

  useEffect(() => { if (value && !options.includes(value)) setManualMode(true) }, [value, options])

  const inputCls = `w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15 transition-colors [color-scheme:dark] ${className || ''}`

  if (manualMode) {
    return (
      <div className="flex gap-2">
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Type your own...'} className={inputCls} />
        <button type="button" onClick={() => { setManualMode(false); onChange('') }}
          className="px-3 rounded-lg border border-white/10 text-white/30 hover:text-gold text-xs font-heading shrink-0 transition-colors">List</button>
      </div>
    )
  }

  return (
    <select value={options.includes(value) ? value : ''} onChange={e => {
      if (e.target.value === '__other__') { setManualMode(true); onChange('') }
      else onChange(e.target.value)
    }} className={inputCls}>
      <option value="">{placeholder || 'Select...'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
      <option value="__other__">Other (type your own)</option>
    </select>
  )
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const icons = {
  overview: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  dogs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/></svg>,
  store: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  services: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  customers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  payments: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  messages: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  analytics: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  checklist: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  external: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="15 18 9 12 15 6"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  starOutline: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  more: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  up: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="18 15 12 9 6 15"/></svg>,
  down: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>,
}

// ─── Nav Config ──────────────────────────────────────────────────────────────
const navItems: { id: Tab; label: string; icon: keyof typeof icons; badge?: boolean; comingSoon?: boolean }[] = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'dogs', label: 'Dogs', icon: 'dogs', badge: true },
  { id: 'services', label: 'Services', icon: 'services', badge: true },
  { id: 'store', label: 'Store', icon: 'store', badge: true },
  { id: 'customers', label: 'Customers', icon: 'customers', comingSoon: true },
  { id: 'payments', label: 'Payments', icon: 'payments', comingSoon: true },
  { id: 'messages', label: 'Messages', icon: 'messages', comingSoon: true },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics', comingSoon: true },
]
const mobileNavItems: { id: Tab | 'more'; label: string; icon: keyof typeof icons }[] = [
  { id: 'overview', label: 'Home', icon: 'overview' },
  { id: 'dogs', label: 'Dogs', icon: 'dogs' },
  { id: 'store', label: 'Store', icon: 'store' },
  { id: 'payments', label: 'Pay', icon: 'payments' },
  { id: 'more', label: 'More', icon: 'more' },
]

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

function ConfirmModal({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#141414] border border-white/10 rounded-xl p-6 w-full max-w-sm space-y-4">
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

function ComingSoon({ title, description, icon }: { title: string; description: string; icon: keyof typeof icons }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center mb-6 text-gold/40">
        <div className="scale-[1.8]">{icons[icon]}</div>
      </div>
      <h2 className="text-2xl font-display text-white mb-2">{title}</h2>
      <p className="text-white/40 font-body text-sm max-w-md mb-6">{description}</p>
      <div className="px-4 py-2 rounded-full border border-gold/20 bg-gold/5">
        <span className="text-gold text-xs font-heading tracking-wider uppercase">Coming Soon</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ManagePage() {
  const [authState, setAuthState] = useState<'checking' | 'locked' | 'authenticated'>('checking')
  const [password, setPassword] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastType[]>([])
  const toastIdRef = useRef(0)
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { message, type, id }])
  }, [])

  // Destructure API hooks for stable references (fixes settings strobe bug)
  const { adminFetch, adminPost, adminUpload } = useAdminApi(password)

  // Dog state
  const [dogs, setDogs] = useState<DogAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [dogView, setDogView] = useState<'list' | 'form'>('list')
  const [editingDog, setEditingDog] = useState<DogAdmin | null>(null)
  const [form, setForm] = useState<DogFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  // Settings state
  const [settingsData, setSettingsData] = useState<Record<string, any>>({})
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const settingsLoadedRef = useRef(false)

  // Services state
  const [services, setServices] = useState<ServiceAdmin[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [serviceView, setServiceView] = useState<'list' | 'form'>('list')
  const [editingService, setEditingService] = useState<ServiceAdmin | null>(null)
  const [serviceForm, setServiceForm] = useState<ServiceFormData>(emptyServiceForm)
  const [serviceSaving, setServiceSaving] = useState(false)
  const [showDeleteService, setShowDeleteService] = useState(false)
  const [uploadingServiceImg, setUploadingServiceImg] = useState(false)

  // Store state
  const [storeProducts, setStoreProducts] = useState<any[]>([])
  const [storeLoading, setStoreLoading] = useState(true)
  const [storeView, setStoreView] = useState<'list' | 'form'>('list')
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [productForm, setProductForm] = useState({ title: '', description: '', status: 'published' })
  const [productSaving, setProductSaving] = useState(false)
  const [priceMode, setPriceMode] = useState<'none' | 'percent' | 'flat'>('none')
  const [priceValue, setPriceValue] = useState('')
  const [priceSaving, setPriceSaving] = useState(false)

  // Session check
  useEffect(() => {
    const saved = sessionStorage.getItem('ct-admin-auth')
    if (saved) { setPassword(saved); setAuthState('authenticated') }
    else setAuthState('locked')
  }, [])

  // Load dogs
  const loadDogs = useCallback(async () => {
    try { const data = await adminFetch('/api/go/dogs'); setDogs(data) }
    catch (err: any) { showToast(err.message, 'error') }
    finally { setLoading(false) }
  }, [adminFetch, showToast])

  useEffect(() => { if (authState === 'authenticated') loadDogs() }, [authState, loadDogs])

  // Load services
  const loadServices = useCallback(async () => {
    try { const data = await adminFetch('/api/go/services'); setServices(data) }
    catch (err: any) { showToast(err.message, 'error') }
    finally { setServicesLoading(false) }
  }, [adminFetch, showToast])

  useEffect(() => { if (authState === 'authenticated') loadServices() }, [authState, loadServices])

  // Load store products
  const loadStoreProducts = useCallback(async () => {
    try { const data = await adminFetch('/api/go/store'); setStoreProducts(data) }
    catch (err: any) { showToast(err.message, 'error') }
    finally { setStoreLoading(false) }
  }, [adminFetch, showToast])

  useEffect(() => { if (authState === 'authenticated') loadStoreProducts() }, [authState, loadStoreProducts])

  // Load settings (only once per session to prevent strobe)
  useEffect(() => {
    if (authState === 'authenticated' && activeTab === 'settings' && !settingsLoadedRef.current) {
      settingsLoadedRef.current = true
      setSettingsLoading(true)
      adminFetch('/api/go/settings')
        .then(data => setSettingsData(data || {}))
        .catch((err: any) => showToast(err.message, 'error'))
        .finally(() => setSettingsLoading(false))
    }
  }, [authState, activeTab, adminFetch, showToast])

  // Auth handler
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
      sessionStorage.setItem('ct-admin-auth', passwordInput)
      setAuthState('authenticated')
    } catch { setAuthError('Connection error') }
    finally { setAuthLoading(false) }
  }

  const switchTab = (tab: Tab) => { setActiveTab(tab); setSidebarOpen(false); if (tab === 'dogs') { setDogView('list'); setEditingDog(null) }; if (tab === 'services') { setServiceView('list'); setEditingService(null) }; if (tab === 'store') { setStoreView('list'); setEditingProduct(null) } }

  // ─── Dog CRUD ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return }
    if (!form.mainImage) { showToast('Main photo is required', 'error'); return }
    setSaving(true)
    try {
      const slug = generateSlug(form.name)
      const payload: Record<string, any> = {
        name: form.name.trim(), slug: { _type: 'slug', current: slug },
        breed: form.breed || 'American Bully', status: form.status, featured: form.featured,
        mainImage: normalizeImageForSave(form.mainImage),
      }
      // Always include all fields so clearing a field actually clears it in Sanity
      payload.variety = form.variety || ''
      payload.gender = form.gender || ''
      payload.color = form.color || ''
      payload.dob = form.dob || ''
      payload.weight = form.weight || ''
      payload.height = form.height || ''
      payload.price = form.price ? Number(form.price) : 0
      payload.personality = form.personality || ''
      payload.description = form.description || ''
      payload.gallery = normalizeGalleryForSave(form.gallery)
      payload.sire = form.sire || ''
      payload.dam = form.dam || ''
      payload.bloodline = form.bloodline || ''
      payload.registry = form.registry || ''
      payload.registrationNumber = form.registrationNumber || ''

      if (editingDog) {
        payload._id = editingDog._id
        await adminPost('/api/go/dogs', { action: 'update', payload })
        showToast(`${form.name} updated`)
      } else {
        await adminPost('/api/go/dogs', { action: 'create', payload })
        showToast(`${form.name} added`)
      }
      setDogView('list'); setEditingDog(null); await loadDogs()
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDeleteDog = async () => {
    if (!editingDog) return; setShowDelete(false); setSaving(true)
    try {
      const slug = editingDog.slug?.current || ''
      await adminPost('/api/go/dogs', { action: 'delete', payload: { _id: editingDog._id, slug } })
      showToast(`${editingDog.name} deleted`); setDogView('list'); setEditingDog(null); await loadDogs()
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const toggleFeatured = async (dog: DogAdmin) => {
    try {
      const slug = dog.slug?.current || ''
      await adminPost('/api/go/dogs', { action: 'toggle_featured', payload: { _id: dog._id, featured: dog.featured, slug } })
      setDogs(prev => prev.map(d => d._id === dog._id ? { ...d, featured: !d.featured } : d))
      showToast(dog.featured ? 'Removed from homepage' : 'Added to homepage')
    } catch (err: any) { showToast(err.message, 'error') }
  }

  const cycleStatus = async (dog: DogAdmin) => {
    const idx = STATUSES.indexOf(dog.status as any)
    const next = STATUSES[(idx + 1) % STATUSES.length]
    try {
      const slug = dog.slug?.current || ''
      await adminPost('/api/go/dogs', { action: 'set_status', payload: { _id: dog._id, status: next, slug } })
      setDogs(prev => prev.map(d => d._id === dog._id ? { ...d, status: next } : d))
      showToast(`${dog.name} → ${next}`)
    } catch (err: any) { showToast(err.message, 'error') }
  }

  // Image upload + reorder
  const uploadMainImage = async (file: File) => {
    setUploadingMain(true)
    try {
      const result = await adminUpload(file, form.name || 'dog')
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
        const result = await adminUpload(file, form.name || 'dog')
        newImages.push({ _type: 'image', _key: genKey(), asset: { _type: 'reference', _ref: result._id } })
      } catch (err: any) { showToast(`Failed: ${file.name}`, 'error') }
    }
    if (newImages.length > 0) setForm(f => ({ ...f, gallery: [...f.gallery, ...newImages] }))
    setUploadingGallery(false)
  }

  const removeGalleryImage = (key: string) => { setForm(f => ({ ...f, gallery: f.gallery.filter((img: any) => img._key !== key) })) }

  const moveGalleryImage = (key: string, dir: 'up' | 'down') => {
    setForm(f => {
      const arr = [...f.gallery]
      const idx = arr.findIndex((img: any) => img._key === key)
      if (idx < 0) return f
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= arr.length) return f
      ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
      return { ...f, gallery: arr }
    })
  }

  const setAsMainImage = (galleryImg: any) => {
    setForm(f => {
      const newGallery = f.gallery.filter((img: any) => img._key !== galleryImg._key)
      if (f.mainImage) {
        newGallery.unshift({ ...f.mainImage, _key: genKey() })
      }
      return { ...f, mainImage: { _type: 'image', asset: galleryImg.asset }, gallery: newGallery }
    })
    showToast('Main photo swapped')
  }

  // ─── Service CRUD ─────────────────────────────────────────────────────────
  const serviceToForm = (svc: ServiceAdmin): ServiceFormData => ({
    title: svc.title || '', description: svc.description || '',
    price: svc.price || '', featured: svc.featured || false,
    order: svc.order != null ? String(svc.order) : '0', image: svc.image || null,
  })

  const handleSaveService = async () => {
    if (!serviceForm.title.trim()) { showToast('Title is required', 'error'); return }
    setServiceSaving(true)
    try {
      const slug = serviceForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const payload: Record<string, any> = {
        title: serviceForm.title.trim(),
        slug: { _type: 'slug', current: slug },
        description: serviceForm.description || '',
        price: serviceForm.price || '',
        featured: serviceForm.featured,
        order: serviceForm.order ? Number(serviceForm.order) : 0,
        image: serviceForm.image || undefined,
      }
      if (editingService) {
        payload._id = editingService._id
        await adminPost('/api/go/services', { action: 'update', payload })
        showToast(`${serviceForm.title} updated`)
      } else {
        await adminPost('/api/go/services', { action: 'create', payload })
        showToast(`${serviceForm.title} added`)
      }
      setServiceView('list'); setEditingService(null); await loadServices()
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setServiceSaving(false) }
  }

  const handleDeleteService = async () => {
    if (!editingService) return; setShowDeleteService(false); setServiceSaving(true)
    try {
      await adminPost('/api/go/services', { action: 'delete', payload: { _id: editingService._id } })
      showToast(`${editingService.title} deleted`); setServiceView('list'); setEditingService(null); await loadServices()
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setServiceSaving(false) }
  }

  const uploadServiceImage = async (file: File) => {
    setUploadingServiceImg(true)
    try {
      const result = await adminUpload(file, serviceForm.title || 'service')
      setServiceForm(f => ({ ...f, image: { _type: 'image', asset: { _type: 'reference', _ref: result._id } } }))
      showToast('Image uploaded')
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setUploadingServiceImg(false) }
  }

  // ─── Store Product Edit ──────────────────────────────────────────────────
  const handleSaveProduct = async () => {
    if (!editingProduct) return
    setProductSaving(true)
    try {
      await adminPost('/api/go/store', {
        action: 'update',
        payload: { id: editingProduct.id, title: productForm.title, description: productForm.description },
      })
      showToast(`${productForm.title} updated`)
      setStoreView('list'); setEditingProduct(null); await loadStoreProducts()
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setProductSaving(false) }
  }

  const toggleProductStatus = async (product: any) => {
    const next = product.status === 'published' ? 'draft' : 'published'
    try {
      await adminPost('/api/go/store', { action: 'set_status', payload: { id: product.id, status: next } })
      setStoreProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: next } : p))
      showToast(`${product.title} → ${next}`)
    } catch (err: any) { showToast(err.message, 'error') }
  }

  const handleBulkPriceUpdate = async () => {
    if (!editingProduct || !priceValue) return
    setPriceSaving(true)
    try {
      const val = parseFloat(priceValue)
      if (isNaN(val) || val <= 0) { showToast('Enter a valid number', 'error'); setPriceSaving(false); return }

      if (priceMode === 'percent') {
        await adminPost('/api/go/store', {
          action: 'bulk_update_prices',
          payload: { product_id: editingProduct.id, mode: 'add_percent', value: val },
        })
        showToast(`All variant prices increased by ${val}%`)
      } else if (priceMode === 'flat') {
        await adminPost('/api/go/store', {
          action: 'bulk_update_prices',
          payload: { product_id: editingProduct.id, mode: 'set', value: val },
        })
        showToast(`All variants set to $${val.toFixed(2)}`)
      }
      setPriceMode('none'); setPriceValue('')
      await loadStoreProducts()
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setPriceSaving(false) }
  }

  // Settings save
  const saveSettings = async () => {
    setSettingsSaving(true)
    try {
      const { _id, _type, _createdAt, _updatedAt, _rev, ...payload } = settingsData
      await adminPost('/api/go/settings', { action: 'update', payload })
      showToast('Settings saved')
    } catch (err: any) { showToast(err.message, 'error') }
    finally { setSettingsSaving(false) }
  }

  // ─── Computed values ─────────────────────────────────────────────────────
  const inputCls = 'w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none placeholder:text-white/15 transition-colors'
  const featuredCount = dogs.filter(d => d.featured).length
  const availableCount = dogs.filter(d => d.status === 'available').length
  const reservedCount = dogs.filter(d => d.status === 'reserved').length
  const filtered = dogs.filter(dog => {
    const matchSearch = !searchQuery || dog.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || dog.status === statusFilter
    return matchSearch && matchStatus
  })
  const varieties = VARIETY_MAP[form.breed] || VARIETY_MAP['American Bully'] || []

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH SCREENS
  // ═══════════════════════════════════════════════════════════════════════════
  if (authState === 'checking') return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-gold animate-pulse font-display text-lg">Loading...</div>
    </div>
  )

  if (authState === 'locked') return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 px-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <span className="font-display text-gold text-xl">CT</span>
          </div>
          <h1 className="text-2xl font-display text-white mb-1">Admin Dashboard</h1>
          <p className="text-white/40 text-sm font-body">Enter admin password to continue</p>
        </div>
        <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Admin password" autoFocus
          className={`${inputCls} text-center text-lg tracking-widest`} />
        {authError && <p className="text-red-400 text-sm text-center font-body">{authError}</p>}
        <button type="submit" disabled={authLoading || !passwordInput} className="w-full py-3 rounded-lg bg-gold text-[#0a0a0a] font-heading font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50">
          {authLoading ? 'Verifying...' : 'Sign In'}
        </button>
        <Link href="/go" className="block text-center text-white/30 text-xs font-heading hover:text-gold transition-colors">Back to Command Center</Link>
      </form>
    </div>
  )

  const tabLabel = navItems.find(n => n.id === activeTab)?.label || 'Admin'

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN ADMIN SHELL
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] overflow-hidden">
      <style>{`
        .ct-admin { display: grid; grid-template-columns: 260px 1fr; height: 100vh; overflow: hidden; }
        .ct-sidebar { background: #0e0e0e; border-right: 1px solid rgba(208,185,112,0.08); overflow-y: auto; }
        .ct-main { overflow-y: auto; -webkit-overflow-scrolling: touch; }
        @media (max-width: 900px) {
          .ct-admin { grid-template-columns: 1fr; }
          .ct-sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 280px; z-index: 100; transform: translateX(-100%); transition: transform 0.3s ease; }
          .ct-sidebar.open { transform: translateX(0); }
          .ct-main { padding-bottom: 80px; }
        }
        .ct-nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 10px; cursor: pointer; transition: all 0.2s; color: rgba(255,255,255,0.4); font-size: 14px; }
        .ct-nav-item:hover { background: rgba(208,185,112,0.05); color: rgba(255,255,255,0.7); }
        .ct-nav-item.active { background: rgba(208,185,112,0.1); color: #D0B970; }
        .ct-nav-item.active .ct-nav-icon { color: #D0B970; }
        .ct-nav-icon { flex-shrink: 0; color: rgba(255,255,255,0.3); }
        .ct-nav-item.active .ct-indicator { display: block; }
        .ct-indicator { display: none; width: 4px; height: 4px; border-radius: 50%; background: #D0B970; margin-left: auto; }
        .ct-mobile-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: #0e0e0e; border-top: 1px solid rgba(208,185,112,0.08); z-index: 90; padding-bottom: env(safe-area-inset-bottom); }
        @media (max-width: 900px) { .ct-mobile-nav { display: flex; } }
        .ct-mobile-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 4px; color: rgba(255,255,255,0.35); font-size: 10px; transition: color 0.2s; position: relative; }
        .ct-mobile-btn.active { color: #D0B970; }
        .ct-mobile-btn.active::before { content: ''; position: absolute; top: 0; left: 25%; right: 25%; height: 2px; background: #D0B970; border-radius: 0 0 2px 2px; }
        .ct-mobile-header { display: none; position: sticky; top: 0; z-index: 50; background: rgba(10,10,10,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(208,185,112,0.08); padding: 12px 16px; }
        @media (max-width: 900px) { .ct-mobile-header { display: flex; align-items: center; gap: 12px; } }
        .ct-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 99; }
        @media (max-width: 900px) { .ct-overlay.open { display: block; } }
      `}</style>

      {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />)}
      <div className={`ct-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="ct-admin">
        {/* SIDEBAR */}
        <aside className={`ct-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="p-5">
            <Link href="/" target="_blank" className="flex items-center gap-3 mb-2 group">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <span className="font-display text-gold text-sm font-bold">CT</span>
              </div>
              <div>
                <p className="text-white text-sm font-display leading-tight">CrunchTyme</p>
                <p className="text-gold/40 text-[9px] tracking-[0.25em] uppercase font-heading">Bullies</p>
              </div>
            </Link>
            <div className="ml-[52px] mb-6">
              <span className="text-[9px] tracking-[0.2em] uppercase font-heading px-2 py-0.5 rounded-full border border-gold/20 bg-gold/5 text-gold/70">Admin Dashboard</span>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => switchTab(item.id)} className={`ct-nav-item w-full font-heading ${activeTab === item.id ? 'active' : ''}`}>
                  <span className="ct-nav-icon">{icons[item.icon]}</span>
                  <span>{item.label}</span>
                  {item.badge && item.id === 'dogs' && dogs.length > 0 && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold/60 font-heading">{dogs.length}</span>}
                  {item.badge && item.id === 'services' && services.length > 0 && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold/60 font-heading">{services.length}</span>}
                  {item.badge && item.id === 'store' && storeProducts.length > 0 && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold/60 font-heading">{storeProducts.length}</span>}
                  {item.comingSoon && <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/20 font-heading uppercase tracking-wider">Soon</span>}
                  {!item.badge && !item.comingSoon && <span className="ct-indicator" />}
                </button>
              ))}
              <div className="my-4 border-t border-white/5" />
              <Link href="/go" onClick={() => setSidebarOpen(false)} className="ct-nav-item w-full font-heading">
                <span className="ct-nav-icon">{icons.checklist}</span><span>Setup Checklist</span><span className="ct-nav-icon ml-auto">{icons.external}</span>
              </Link>
              <Link href="/" target="_blank" className="ct-nav-item w-full font-heading">
                <span className="ct-nav-icon">{icons.external}</span><span>View Live Site</span>
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-5 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center"><span className="text-gold text-xs font-heading">A</span></div>
              <div><p className="text-white text-sm font-heading">Admin</p><p className="text-gold/40 text-[10px] font-heading">Crunchtyme Bullies</p></div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="ct-main">
          <div className="ct-mobile-header">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/50 hover:text-gold transition-colors">{sidebarOpen ? icons.close : icons.menu}</button>
            {activeTab === 'dogs' && dogView === 'form' && <button onClick={() => { setDogView('list'); setEditingDog(null) }} className="text-white/50 hover:text-gold transition-colors">{icons.back}</button>}
            {activeTab === 'services' && serviceView === 'form' && <button onClick={() => { setServiceView('list'); setEditingService(null) }} className="text-white/50 hover:text-gold transition-colors">{icons.back}</button>}
            {activeTab === 'store' && storeView === 'form' && <button onClick={() => { setStoreView('list'); setEditingProduct(null) }} className="text-white/50 hover:text-gold transition-colors">{icons.back}</button>}
            <h1 className="text-white font-display text-lg flex-1">{activeTab === 'dogs' && dogView === 'form' ? (editingDog ? 'Edit Dog' : 'Add Dog') : activeTab === 'services' && serviceView === 'form' ? (editingService ? 'Edit Service' : 'Add Service') : activeTab === 'store' && storeView === 'form' ? 'Edit Product' : tabLabel}</h1>
            <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center"><span className="text-gold text-[10px] font-heading">CT</span></div>
          </div>

          <div className="p-4 md:p-8 max-w-5xl">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div><h1 className="text-2xl md:text-3xl font-display text-white mb-1">Welcome back</h1><p className="text-white/40 font-body text-sm">Here&apos;s what&apos;s happening with your kennel.</p></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ label: 'Total Dogs', value: dogs.length, color: 'text-gold' }, { label: 'Available', value: availableCount, color: 'text-emerald-400' }, { label: 'Reserved', value: reservedCount, color: 'text-amber-400' }, { label: 'On Homepage', value: featuredCount, color: 'text-blue-400' }].map(stat => (
                    <div key={stat.label} className="p-4 rounded-xl bg-[#111] border border-white/5">
                      <p className="text-white/35 text-xs font-heading uppercase tracking-wider">{stat.label}</p>
                      <p className={`text-2xl font-display mt-1 ${stat.color}`}>{loading ? '-' : stat.value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-white/50 text-xs font-heading uppercase tracking-wider mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={() => { switchTab('dogs'); setTimeout(() => { setEditingDog(null); setForm(emptyForm); setDogView('form') }, 50) }} className="p-4 rounded-xl bg-gold/10 border border-gold/20 hover:bg-gold/15 transition-colors text-left"><div className="text-gold mb-2">{icons.plus}</div><p className="text-white text-sm font-heading">Add Dog</p></button>
                    <button onClick={() => switchTab('dogs')} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors text-left"><div className="text-emerald-400 mb-2">{icons.dogs}</div><p className="text-white text-sm font-heading">Manage Dogs</p></button>
                    <button onClick={() => switchTab('services')} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors text-left"><div className="text-amber-400 mb-2">{icons.services}</div><p className="text-white text-sm font-heading">Services</p></button>
                    <button onClick={() => switchTab('settings')} className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors text-left"><div className="text-blue-400 mb-2">{icons.settings}</div><p className="text-white text-sm font-heading">Settings</p></button>
                  </div>
                </div>
                <div>
                  <h3 className="text-white/50 text-xs font-heading uppercase tracking-wider mb-3">All Sections</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {navItems.filter(n => n.id !== 'overview').map(item => (
                      <button key={item.id} onClick={() => switchTab(item.id)} className="p-4 rounded-xl bg-[#111] border border-white/5 hover:border-gold/20 transition-colors text-left group relative overflow-hidden">
                        <div className="text-white/30 group-hover:text-gold/60 transition-colors mb-2">{icons[item.icon]}</div>
                        <p className="text-white text-sm font-heading">{item.label}</p>
                        {item.comingSoon && <span className="absolute top-3 right-3 text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/20 font-heading uppercase tracking-wider">Soon</span>}
                      </button>
                    ))}
                  </div>
                </div>
                {dogs.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3"><h3 className="text-white/50 text-xs font-heading uppercase tracking-wider">Recent Dogs</h3><button onClick={() => switchTab('dogs')} className="text-gold/50 text-xs font-heading hover:text-gold transition-colors">View All</button></div>
                    <div className="space-y-2">{dogs.slice(0, 5).map(dog => (
                      <div key={dog._id} onClick={() => { switchTab('dogs'); setTimeout(() => { setEditingDog(dog); setForm(dogToForm(dog)); setDogView('form') }, 50) }} className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-white/5 hover:border-gold/20 cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] overflow-hidden shrink-0 border border-white/5">{getImageUrl(dog.mainImage) && <img src={getImageUrl(dog.mainImage)} alt={dog.name} className="w-full h-full object-cover" />}</div>
                        <div className="flex-1 min-w-0"><p className="text-white text-sm font-heading truncate">{dog.name}</p><span className={`text-[10px] tracking-wider uppercase font-heading px-2 py-0.5 rounded-full border ${statusColors[dog.status] || statusColors.available}`}>{dog.status}</span></div>
                        <span className="text-white/20 text-xs font-body">{dog.price ? `$${dog.price.toLocaleString()}` : 'Contact'}</span>
                      </div>
                    ))}</div>
                  </div>
                )}
              </div>
            )}

            {/* DOG FORM */}
            {activeTab === 'dogs' && dogView === 'form' && (
              <div className="max-w-lg mx-auto space-y-5 pb-8">
                <button onClick={() => { setDogView('list'); setEditingDog(null) }} className="text-white/40 hover:text-gold text-sm font-heading transition-colors hidden md:inline-flex items-center gap-1"><span>{icons.back}</span> Back to list</button>
                <h2 className="text-white text-xl font-display hidden md:block">{editingDog ? 'Edit Dog' : 'Add New Dog'}</h2>

                {/* Name */}
                <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. King Apollo" className={inputCls} /></div>

                {/* Main Photo */}
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Main Photo *</label>
                  {form.mainImage ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/10 group">
                      <img src={getImageUrl(form.mainImage)} alt="Main" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <label className="cursor-pointer text-gold text-xs font-heading">Change<input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadMainImage(e.target.files[0])} /></label>
                      </div>
                    </div>
                  ) : (
                    <label className={`block w-full py-6 border-2 border-dashed border-gold/20 rounded-lg text-center cursor-pointer hover:border-gold/40 transition-colors ${uploadingMain ? 'animate-pulse' : ''}`}>
                      <span className="text-gold/60 font-body text-sm">{uploadingMain ? 'Uploading...' : '+ Upload Main Photo'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadMainImage(e.target.files[0])} disabled={uploadingMain} />
                    </label>
                  )}
                </div>

                {/* Gallery with reorder */}
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Gallery Photos {form.gallery.length > 0 && <span className="text-white/20">({form.gallery.length})</span>}</label>
                  {form.gallery.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {form.gallery.map((img: any, i: number) => (
                        <div key={img._key || i} className="flex items-center gap-2 p-2 rounded-lg bg-[#111] border border-white/5">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#0a0a0a] shrink-0 border border-white/5">
                            <img src={getImageUrl(img)} alt={`#${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-white/30 text-xs font-heading w-6 text-center shrink-0">#{i + 1}</span>
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button type="button" onClick={() => moveGalleryImage(img._key, 'up')} disabled={i === 0} className="text-white/30 hover:text-gold disabled:opacity-20 transition-colors">{icons.up}</button>
                            <button type="button" onClick={() => moveGalleryImage(img._key, 'down')} disabled={i === form.gallery.length - 1} className="text-white/30 hover:text-gold disabled:opacity-20 transition-colors">{icons.down}</button>
                          </div>
                          <div className="flex gap-1.5 ml-auto shrink-0">
                            <button type="button" onClick={() => setAsMainImage(img)} className="px-2 py-1 rounded text-[10px] font-heading border border-gold/20 text-gold/60 hover:bg-gold/10 transition-colors">Set Main</button>
                            <button type="button" onClick={() => removeGalleryImage(img._key)} className="px-2 py-1 rounded text-[10px] font-heading border border-red-500/20 text-red-400/60 hover:bg-red-500/10 transition-colors">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className={`block w-full py-4 border-2 border-dashed border-gold/20 rounded-lg text-center cursor-pointer hover:border-gold/40 transition-colors ${uploadingGallery ? 'animate-pulse' : ''}`}>
                    <span className="text-gold/60 font-body text-sm">{uploadingGallery ? 'Uploading...' : '+ Add Gallery Photos'}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && uploadGalleryImages(e.target.files)} disabled={uploadingGallery} />
                  </label>
                </div>

                {/* Breed (combo dropdown) + Variety */}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Breed</label>
                  <ComboSelect value={form.breed} onChange={v => setForm(f => ({ ...f, breed: v, variety: '' }))} options={BREEDS} placeholder="Select breed..." /></div>
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Variety / Class</label>
                  <ComboSelect value={form.variety} onChange={v => setForm(f => ({ ...f, variety: v }))} options={varieties} placeholder="Select..." /></div>
                </div>

                {/* Gender */}
                <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Gender</label>
                <div className="flex gap-2">{['male', 'female'].map(g => (
                  <button key={g} type="button" onClick={() => setForm(f => ({ ...f, gender: f.gender === g ? '' : g }))}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-heading capitalize transition-colors ${form.gender === g ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-white/40 hover:text-white/60'}`}>{g}</button>
                ))}</div></div>

                {/* DOB + Color (combo dropdown) */}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Date of Birth</label>
                  <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} className={`${inputCls} [color-scheme:dark]`} /></div>
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Color / Pattern</label>
                  <ComboSelect value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))} options={COLORS} placeholder="Select color..." /></div>
                </div>

                {/* Weight + Height */}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Weight</label>
                  <input type="text" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="65 lbs" className={inputCls} /></div>
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Height</label>
                  <input type="text" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} placeholder="17 inches" className={inputCls} /></div>
                </div>

                {/* Price */}
                <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Price</label>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">$</span>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Leave blank for Contact Us"
                  className={`${inputCls} pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} /></div></div>

                {/* Status */}
                <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Status</label>
                <div className="grid grid-cols-4 gap-2">{STATUSES.map(s => (
                  <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                    className={`py-2 rounded-lg border text-[11px] font-heading capitalize transition-colors ${form.status === s ? statusColors[s] || '' : 'border-white/10 text-white/30 hover:text-white/50'}`}>{s.replace('-', ' ')}</button>
                ))}</div></div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div><p className="text-white text-sm font-heading">Show on Homepage</p><p className="text-white/30 text-xs font-body">Featured dogs appear on the main page</p></div>
                  <button type="button" onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                    className={`relative w-12 h-7 rounded-full transition-colors ${form.featured ? 'bg-gold' : 'bg-white/10'}`}>
                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.featured ? 'left-6' : 'left-1'}`} /></button>
                </div>

                {/* Description */}
                <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Full description of this dog — background, training, what makes them special..." rows={4} className={`${inputCls} resize-none`} /></div>

                {/* Personality */}
                <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Personality / Temperament</label>
                <textarea value={form.personality} onChange={e => setForm(f => ({ ...f, personality: e.target.value }))} placeholder="Friendly, energetic, great with kids..." rows={2} className={`${inputCls} resize-none`} /></div>

                {/* Registry (combo dropdown) + Reg Number */}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Registry</label>
                  <ComboSelect value={form.registry} onChange={v => setForm(f => ({ ...f, registry: v }))} options={REGISTRIES} placeholder="Select..." /></div>
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Reg. Number</label>
                  <input type="text" value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} placeholder="Registration #" className={inputCls} /></div>
                </div>

                {/* Breeding Info */}
                <details className="border border-white/5 rounded-lg">
                  <summary className="px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-heading cursor-pointer hover:text-white/60">Breeding & Pedigree (optional)</summary>
                  <div className="p-4 space-y-3 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-white/30 text-xs font-heading block mb-1">Sire (Father)</label><input type="text" value={form.sire} onChange={e => setForm(f => ({ ...f, sire: e.target.value }))} className={inputCls} /></div>
                      <div><label className="text-white/30 text-xs font-heading block mb-1">Dam (Mother)</label><input type="text" value={form.dam} onChange={e => setForm(f => ({ ...f, dam: e.target.value }))} className={inputCls} /></div>
                    </div>
                    <div><label className="text-white/30 text-xs font-heading block mb-1">Bloodline</label><input type="text" value={form.bloodline} onChange={e => setForm(f => ({ ...f, bloodline: e.target.value }))} placeholder="Razors Edge, Gottiline..." className={inputCls} /></div>
                  </div>
                </details>

                {/* Save */}
                <button onClick={handleSave} disabled={saving} className="w-full py-3.5 rounded-lg bg-gold text-[#0a0a0a] font-heading font-semibold hover:bg-gold/90 transition-colors text-base disabled:opacity-50">
                  {saving ? 'Saving...' : editingDog ? 'Save Changes' : 'Add Dog'}</button>

                {editingDog && <button onClick={() => setShowDelete(true)} disabled={saving} className="w-full py-3 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-heading">Delete {editingDog.name}</button>}
                {showDelete && editingDog && <ConfirmModal title={`Delete ${editingDog.name}?`} message="This permanently removes this dog from the site." onConfirm={handleDeleteDog} onCancel={() => setShowDelete(false)} />}
              </div>
            )}

            {/* DOG LIST */}
            {activeTab === 'dogs' && dogView === 'list' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><h2 className="text-white text-xl font-display">Dogs <span className="text-white/30 text-sm font-body">({dogs.length})</span></h2>
                  {featuredCount > 0 && <p className="text-gold/50 text-xs font-heading mt-0.5">{featuredCount} on homepage</p>}</div>
                  <button onClick={() => { setEditingDog(null); setForm(emptyForm); setDogView('form') }} className="w-11 h-11 rounded-full bg-gold text-[#0a0a0a] text-2xl font-bold flex items-center justify-center hover:bg-gold/90 transition-colors shadow-lg shadow-gold/20">+</button>
                </div>
                {dogs.length > 3 && (
                  <div className="flex gap-2">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className={`flex-1 ${inputCls} py-2 text-sm`} />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${inputCls} w-auto py-2 text-sm [color-scheme:dark]`}>
                      <option value="all">All</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {loading ? <div className="text-center py-12"><div className="text-gold animate-pulse font-display">Loading dogs...</div></div>
                : filtered.length === 0 ? <p className="text-white/30 text-center py-12 font-body">{dogs.length === 0 ? 'No dogs yet. Tap + to add one.' : 'No dogs match your filter.'}</p>
                : filtered.map(dog => (
                  <div key={dog._id} onClick={() => { setEditingDog(dog); setForm(dogToForm(dog)); setDogView('form') }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-white/5 hover:border-gold/20 transition-colors cursor-pointer active:bg-[#161616]">
                    <div className="w-14 h-14 rounded-lg bg-[#0a0a0a] overflow-hidden shrink-0 border border-white/5">
                      {getImageUrl(dog.mainImage) && <img src={getImageUrl(dog.mainImage)} alt={dog.name} className="w-full h-full object-cover" />}</div>
                    <div className="flex-1 min-w-0"><p className="text-white font-heading truncate">{dog.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <button onClick={e => { e.stopPropagation(); cycleStatus(dog) }}><span className={`text-[10px] tracking-wider uppercase font-heading px-2 py-0.5 rounded-full border ${statusColors[dog.status] || statusColors.available}`}>{dog.status}</span></button>
                      <span className="text-white/25 text-xs font-body">{dog.price ? `$${dog.price.toLocaleString()}` : 'Contact'}</span>
                    </div></div>
                    <button onClick={e => { e.stopPropagation(); toggleFeatured(dog) }} className="shrink-0 transition-transform hover:scale-110 active:scale-95" title={dog.featured ? 'Remove from homepage' : 'Add to homepage'}>
                      <span className={dog.featured ? 'text-gold' : 'text-white/20'}>{dog.featured ? icons.star : icons.starOutline}</span></button>
                  </div>
                ))}
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div className="max-w-lg space-y-6">
                <div><h2 className="text-white text-xl font-display mb-1">Site Settings</h2><p className="text-white/40 text-sm font-body">Update your site name, contact info, and more.</p></div>
                {settingsLoading ? <div className="text-center py-12"><div className="text-gold animate-pulse font-display">Loading settings...</div></div> : (<>
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Site Title</label>
                  <input type="text" value={settingsData.title || ''} onChange={e => setSettingsData(d => ({ ...d, title: e.target.value }))} placeholder="CrunchTyme Bullies" className={inputCls} /></div>
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Tagline</label>
                  <input type="text" value={settingsData.tagline || ''} onChange={e => setSettingsData(d => ({ ...d, tagline: e.target.value }))} placeholder="Premium American Bullies" className={inputCls} /></div>
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Description</label>
                  <textarea value={settingsData.description || ''} onChange={e => setSettingsData(d => ({ ...d, description: e.target.value }))} rows={3} placeholder="Brief description of your kennel..." className={`${inputCls} resize-none`} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Phone</label>
                    <input type="tel" value={settingsData.phone || ''} onChange={e => setSettingsData(d => ({ ...d, phone: e.target.value }))} placeholder="(555) 123-4567" className={inputCls} /></div>
                    <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Email</label>
                    <input type="email" value={settingsData.email || ''} onChange={e => setSettingsData(d => ({ ...d, email: e.target.value }))} placeholder="info@crunchtymebullies.com" className={inputCls} /></div>
                  </div>
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Address</label>
                  <input type="text" value={settingsData.address || ''} onChange={e => setSettingsData(d => ({ ...d, address: e.target.value }))} placeholder="City, State" className={inputCls} /></div>
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Social Media</label>
                  <div className="space-y-3">{['instagram', 'facebook', 'tiktok', 'youtube'].map(platform => (
                    <div key={platform} className="flex items-center gap-3"><span className="text-white/30 text-xs font-heading capitalize w-20">{platform}</span>
                    <input type="text" value={settingsData.socialLinks?.[platform] || ''} onChange={e => setSettingsData(d => ({ ...d, socialLinks: { ...d.socialLinks, [platform]: e.target.value } }))} placeholder={`${platform} URL`} className={`flex-1 ${inputCls} py-2 text-sm`} /></div>
                  ))}</div></div>
                  <button onClick={saveSettings} disabled={settingsSaving} className="w-full py-3.5 rounded-lg bg-gold text-[#0a0a0a] font-heading font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50">
                    {settingsSaving ? 'Saving...' : 'Save Settings'}</button>
                </>)}
              </div>
            )}

            {/* SERVICES LIST */}
            {activeTab === 'services' && serviceView === 'list' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><h2 className="text-white text-xl font-display">Services <span className="text-white/30 text-sm font-body">({services.length})</span></h2>
                  <p className="text-white/40 text-xs font-body mt-0.5">Manage the services shown on your Services page</p></div>
                  <button onClick={() => { setEditingService(null); setServiceForm(emptyServiceForm); setServiceView('form') }} className="w-11 h-11 rounded-full bg-gold text-[#0a0a0a] text-2xl font-bold flex items-center justify-center hover:bg-gold/90 transition-colors shadow-lg shadow-gold/20">+</button>
                </div>
                {servicesLoading ? <div className="text-center py-12"><div className="text-gold animate-pulse font-display">Loading services...</div></div>
                : services.length === 0 ? <p className="text-white/30 text-center py-12 font-body">No services yet. Tap + to add one.</p>
                : services.map(svc => (
                  <div key={svc._id} onClick={() => { setEditingService(svc); setServiceForm(serviceToForm(svc)); setServiceView('form') }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-white/5 hover:border-gold/20 transition-colors cursor-pointer active:bg-[#161616]">
                    <div className="w-14 h-14 rounded-lg bg-[#0a0a0a] overflow-hidden shrink-0 border border-white/5 flex items-center justify-center">
                      {getImageUrl(svc.image) ? <img src={getImageUrl(svc.image)} alt={svc.title} className="w-full h-full object-cover" /> : <span className="text-white/10">{icons.services}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-heading truncate">{svc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {svc.price && <span className="text-gold/60 text-xs font-heading">{svc.price}</span>}
                        {svc.featured && <span className="text-[10px] tracking-wider uppercase font-heading px-2 py-0.5 rounded-full border bg-gold/10 text-gold/60 border-gold/20">Featured</span>}
                      </div>
                    </div>
                    <span className="text-white/15 text-xs font-heading shrink-0">#{svc.order ?? 0}</span>
                  </div>
                ))}
              </div>
            )}

            {/* SERVICE FORM */}
            {activeTab === 'services' && serviceView === 'form' && (
              <div className="max-w-lg mx-auto space-y-5 pb-8">
                <button onClick={() => { setServiceView('list'); setEditingService(null) }} className="text-white/40 hover:text-gold text-sm font-heading transition-colors hidden md:inline-flex items-center gap-1"><span>{icons.back}</span> Back to list</button>
                <h2 className="text-white text-xl font-display hidden md:block">{editingService ? 'Edit Service' : 'Add New Service'}</h2>

                {/* Title */}
                <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Title *</label>
                <input type="text" value={serviceForm.title} onChange={e => setServiceForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Stud Service" className={inputCls} /></div>

                {/* Image */}
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Image</label>
                  {serviceForm.image ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/10 group max-w-xs">
                      <img src={getImageUrl(serviceForm.image)} alt="Service" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                        <label className="cursor-pointer text-gold text-xs font-heading px-3 py-1.5 rounded-lg border border-gold/30 hover:bg-gold/10">Change<input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadServiceImage(e.target.files[0])} /></label>
                        <button type="button" onClick={() => setServiceForm(f => ({ ...f, image: null }))} className="text-red-400 text-xs font-heading px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className={`block w-full py-6 border-2 border-dashed border-gold/20 rounded-lg text-center cursor-pointer hover:border-gold/40 transition-colors ${uploadingServiceImg ? 'animate-pulse' : ''}`}>
                      <span className="text-gold/60 font-body text-sm">{uploadingServiceImg ? 'Uploading...' : '+ Upload Image (optional)'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadServiceImage(e.target.files[0])} disabled={uploadingServiceImg} />
                    </label>
                  )}
                </div>

                {/* Description */}
                <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Short Description</label>
                <textarea value={serviceForm.description} onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this service..." rows={3} className={`${inputCls} resize-none`} /></div>

                {/* Price + Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Price / Range</label>
                  <input type="text" value={serviceForm.price} onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. $500 or Contact for pricing" className={inputCls} /></div>
                  <div><label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Display Order</label>
                  <input type="number" value={serviceForm.order} onChange={e => setServiceForm(f => ({ ...f, order: e.target.value }))} placeholder="0" className={`${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} /></div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div><p className="text-white text-sm font-heading">Featured</p><p className="text-white/30 text-xs font-body">Highlighted on the services page</p></div>
                  <button type="button" onClick={() => setServiceForm(f => ({ ...f, featured: !f.featured }))}
                    className={`relative w-12 h-7 rounded-full transition-colors ${serviceForm.featured ? 'bg-gold' : 'bg-white/10'}`}>
                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${serviceForm.featured ? 'left-6' : 'left-1'}`} /></button>
                </div>

                {/* Save */}
                <button onClick={handleSaveService} disabled={serviceSaving} className="w-full py-3.5 rounded-lg bg-gold text-[#0a0a0a] font-heading font-semibold hover:bg-gold/90 transition-colors text-base disabled:opacity-50">
                  {serviceSaving ? 'Saving...' : editingService ? 'Save Changes' : 'Add Service'}</button>

                {editingService && <button onClick={() => setShowDeleteService(true)} disabled={serviceSaving} className="w-full py-3 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-heading">Delete {editingService.title}</button>}
                {showDeleteService && editingService && <ConfirmModal title={`Delete ${editingService.title}?`} message="This permanently removes this service from the site." onConfirm={handleDeleteService} onCancel={() => setShowDeleteService(false)} />}
              </div>
            )}

            {/* COMING SOON TABS */}
            {/* STORE LIST */}
            {activeTab === 'store' && storeView === 'list' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white text-xl font-display">Store Products <span className="text-white/30 text-sm font-body">({storeProducts.length})</span></h2>
                    <p className="text-white/40 text-xs font-body mt-0.5">Manage your Printful merchandise — edit titles, descriptions, and visibility</p>
                  </div>
                  <Link href="/shop" target="_blank" className="px-3 py-1.5 rounded-lg border border-gold/20 text-gold/60 text-xs font-heading hover:bg-gold/10 transition-colors flex items-center gap-1.5">
                    {icons.external} <span>View Shop</span>
                  </Link>
                </div>

                {storeLoading ? <div className="text-center py-12"><div className="text-gold animate-pulse font-display">Loading products...</div></div>
                : storeProducts.length === 0 ? <p className="text-white/30 text-center py-12 font-body">No products found. Products are synced from Printful.</p>
                : storeProducts.map(product => (
                  <div key={product.id} onClick={() => {
                    setEditingProduct(product)
                    setProductForm({ title: product.title || '', description: product.description || '', status: product.status || 'published' })
                    setStoreView('form')
                  }} className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-white/5 hover:border-gold/20 transition-colors cursor-pointer active:bg-[#161616]">
                    <div className="w-14 h-14 rounded-lg bg-[#0a0a0a] overflow-hidden shrink-0 border border-white/5">
                      {product.thumbnail ? <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10">{icons.store}</div>}
                    </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-heading truncate">{product.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <button onClick={e => { e.stopPropagation(); toggleProductStatus(product) }}>
                          <span className={`text-[10px] tracking-wider uppercase font-heading px-2 py-0.5 rounded-full border ${product.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 text-white/40 border-white/20'}`}>
                            {product.status}
                          </span>
                        </button>
                        <span className="text-white/25 text-xs font-body">{product.variants_count} variants</span>
                        {product.first_price && <span className="text-gold/50 text-xs font-heading">
                          {product.min_price && product.max_price && product.min_price !== product.max_price
                            ? `$${(product.min_price / 100).toFixed(2)} – $${(product.max_price / 100).toFixed(2)}`
                            : `from $${(product.first_price.amount / 100).toFixed(2)}`
                          }
                        </span>}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-xl bg-[#111] border border-white/5 mt-6">
                  <p className="text-white/30 text-xs font-body">Products and variants are synced from <span className="text-gold/50">Printful</span>. To add new products or change variants/pricing, update them in your Printful dashboard and they will sync here.</p>
                </div>
              </div>
            )}

            {/* STORE PRODUCT EDIT FORM */}
            {activeTab === 'store' && storeView === 'form' && editingProduct && (
              <div className="max-w-lg mx-auto space-y-5 pb-8">
                <button onClick={() => { setStoreView('list'); setEditingProduct(null) }} className="text-white/40 hover:text-gold text-sm font-heading transition-colors hidden md:inline-flex items-center gap-1"><span>{icons.back}</span> Back to products</button>
                <h2 className="text-white text-xl font-display hidden md:block">Edit Product</h2>

                {/* Product thumbnail */}
                {editingProduct.thumbnail && (
                  <div className="relative w-full aspect-video max-w-xs rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/10">
                    <img src={editingProduct.thumbnail} alt={editingProduct.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Product Title</label>
                  <input type="text" value={productForm.title} onChange={e => setProductForm(f => ({ ...f, title: e.target.value }))} className={inputCls} />
                </div>

                {/* Description */}
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Description</label>
                  <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} rows={5} placeholder="Describe this product — materials, fit, features..." className={`${inputCls} resize-none`} />
                </div>

                {/* Status */}
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Status</label>
                  <div className="flex gap-2">
                    {['published', 'draft'].map(s => (
                      <button key={s} type="button" onClick={() => setProductForm(f => ({ ...f, status: s }))}
                        className={`flex-1 py-2.5 rounded-lg border text-sm font-heading capitalize transition-colors ${
                          productForm.status === s
                            ? s === 'published' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/20 bg-white/5 text-white/50'
                            : 'border-white/10 text-white/30 hover:text-white/50'
                        }`}>{s}</button>
                    ))}
                  </div>
                  <p className="text-white/20 text-[10px] font-body mt-1.5">Draft products are hidden from the shop page</p>
                </div>

                {/* PRICING */}
                <div className="border border-gold/10 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-gold/5 border-b border-gold/10">
                    <h3 className="text-gold text-xs uppercase tracking-wider font-heading">Pricing</h3>
                    <p className="text-white/30 text-[10px] font-body mt-0.5">Current prices and markup tools</p>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Current price range */}
                    {editingProduct.min_price > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs font-heading">Current Range</span>
                        <span className="text-gold font-heading text-sm">
                          {editingProduct.min_price === editingProduct.max_price
                            ? `$${(editingProduct.min_price / 100).toFixed(2)}`
                            : `$${(editingProduct.min_price / 100).toFixed(2)} – $${(editingProduct.max_price / 100).toFixed(2)}`
                          }
                        </span>
                      </div>
                    )}

                    {/* Variant prices preview */}
                    {editingProduct.variant_prices?.length > 0 && (
                      <div>
                        <span className="text-white/30 text-[10px] font-heading uppercase tracking-wider block mb-2">Variant Prices (first 5)</span>
                        <div className="space-y-1">
                          {editingProduct.variant_prices.slice(0, 5).map((vp: any) => (
                            <div key={vp.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.02]">
                              <span className="text-white/40 text-xs font-body truncate flex-1">{vp.title}</span>
                              <span className="text-white/60 text-xs font-heading ml-3">${(vp.amount / 100).toFixed(2)}</span>
                            </div>
                          ))}
                          {editingProduct.variant_prices.length > 5 && (
                            <p className="text-white/20 text-[10px] font-body text-center pt-1">+ {editingProduct.variant_prices.length - 5} more variants</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Markup tools */}
                    <div className="border-t border-white/5 pt-4">
                      <span className="text-white/40 text-xs font-heading uppercase tracking-wider block mb-3">Adjust Pricing</span>
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => { setPriceMode(priceMode === 'percent' ? 'none' : 'percent'); setPriceValue('') }}
                          className={`flex-1 py-2.5 rounded-lg border text-xs font-heading transition-colors ${priceMode === 'percent' ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-white/40 hover:text-white/60'}`}>
                          % Markup
                        </button>
                        <button onClick={() => { setPriceMode(priceMode === 'flat' ? 'none' : 'flat'); setPriceValue('') }}
                          className={`flex-1 py-2.5 rounded-lg border text-xs font-heading transition-colors ${priceMode === 'flat' ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-white/40 hover:text-white/60'}`}>
                          Flat Price
                        </button>
                      </div>

                      {priceMode !== 'none' && (
                        <div className="space-y-3">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                              {priceMode === 'percent' ? '%' : '$'}
                            </span>
                            <input type="number" value={priceValue} onChange={e => setPriceValue(e.target.value)}
                              placeholder={priceMode === 'percent' ? 'e.g. 50 for 50% markup' : 'e.g. 29.99'}
                              className={`${inputCls} pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
                          </div>
                          <p className="text-white/20 text-[10px] font-body">
                            {priceMode === 'percent'
                              ? `This adds ${priceValue || '0'}% on top of current prices for all variants. Standard markup is 40-100%.`
                              : `This sets ALL variants to $${priceValue || '0'} flat. Best for single-price items like hats.`
                            }
                          </p>
                          {priceMode === 'percent' && priceValue && editingProduct.min_price > 0 && (
                            <div className="p-3 rounded-lg bg-gold/5 border border-gold/10">
                              <p className="text-gold/70 text-xs font-heading">Preview: ${(editingProduct.min_price / 100).toFixed(2)} → ${(editingProduct.min_price / 100 * (1 + parseFloat(priceValue || '0') / 100)).toFixed(2)}</p>
                            </div>
                          )}
                          <button onClick={handleBulkPriceUpdate} disabled={priceSaving || !priceValue}
                            className="w-full py-2.5 rounded-lg bg-gold/20 border border-gold/30 text-gold font-heading text-sm hover:bg-gold/30 transition-colors disabled:opacity-50">
                            {priceSaving ? 'Updating...' : `Apply ${priceMode === 'percent' ? 'Markup' : 'Price'} to All ${editingProduct.variants_count} Variants`}
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-white/15 text-[10px] font-body">💡 Tip: Standard POD markup is 40-100% over cost. For premium items (hoodies, Under Armour), 50-80%. For basics (tees, hats), 80-150%.</p>
                  </div>
                </div>

                {/* Product info (read-only) */}
                <details className="border border-white/5 rounded-lg">
                  <summary className="px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-heading cursor-pointer hover:text-white/60">Product Details (from Printful)</summary>
                  <div className="p-4 space-y-3 border-t border-white/5">
                    <div className="flex justify-between">
                      <span className="text-white/30 text-xs font-heading">Handle</span>
                      <span className="text-white/60 text-xs font-body">{editingProduct.handle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/30 text-xs font-heading">Variants</span>
                      <span className="text-white/60 text-xs font-body">{editingProduct.variants_count}</span>
                    </div>
                    {editingProduct.options?.map((opt: any) => (
                      <div key={opt.id}>
                        <span className="text-white/30 text-xs font-heading block mb-1">{opt.title}</span>
                        <div className="flex flex-wrap gap-1">
                          {opt.values?.map((v: string, i: number) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-heading border border-white/5">{v}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {editingProduct.first_price && (
                      <div className="flex justify-between">
                        <span className="text-white/30 text-xs font-heading">Starting Price</span>
                        <span className="text-gold/60 text-xs font-heading">${(editingProduct.first_price.amount / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/30 text-xs font-heading">Medusa ID</span>
                      <span className="text-white/30 text-[10px] font-body">{editingProduct.id}</span>
                    </div>
                  </div>
                </details>

                {/* Images */}
                {editingProduct.images?.length > 0 && (
                  <details className="border border-white/5 rounded-lg">
                    <summary className="px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-heading cursor-pointer hover:text-white/60">Images ({editingProduct.images.length})</summary>
                    <div className="p-4 grid grid-cols-3 gap-2 border-t border-white/5">
                      {editingProduct.images.map((img: any) => (
                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/5">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Live preview link */}
                <Link href={`/shop/${editingProduct.handle}`} target="_blank"
                  className="flex items-center gap-2 text-gold/50 text-xs font-heading hover:text-gold transition-colors">
                  {icons.external} View on live shop
                </Link>

                {/* Pricing Section */}
                <div className="border border-gold/20 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-gold/5 border-b border-gold/10">
                    <h3 className="text-gold text-xs uppercase tracking-wider font-heading flex items-center gap-2">{icons.payments} Pricing</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Current price range */}
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs font-heading">Current Retail</span>
                      <span className="text-gold font-heading text-sm">
                        {editingProduct.min_price > 0
                          ? editingProduct.min_price === editingProduct.max_price
                            ? `$${(editingProduct.min_price / 100).toFixed(2)}`
                            : `$${(editingProduct.min_price / 100).toFixed(2)} – $${(editingProduct.max_price / 100).toFixed(2)}`
                          : 'Not set'}
                      </span>
                    </div>

                    {/* Quick markup buttons */}
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Quick Markup (applies to all variants)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: '+25%', value: 1.25 },
                          { label: '+50%', value: 1.50 },
                          { label: '+75%', value: 1.75 },
                          { label: '2x', value: 2.0 },
                        ].map(m => (
                          <button key={m.label} type="button" onClick={async () => {
                            setProductSaving(true)
                            try {
                              await adminPost('/api/go/store', {
                                action: 'bulk_update_prices',
                                payload: { product_id: editingProduct.id, markup_type: 'percentage', markup_value: m.value }
                              })
                              showToast(`Prices updated: ${m.label}`)
                              await loadStoreProducts()
                              // Refresh the editing product data
                              const fresh = storeProducts.find((p: any) => p.id === editingProduct.id)
                              if (fresh) setEditingProduct(fresh)
                            } catch (err: any) { showToast(err.message, 'error') }
                            finally { setProductSaving(false) }
                          }}
                            className="py-2.5 rounded-lg border border-gold/20 text-gold/60 text-xs font-heading hover:bg-gold/10 transition-colors disabled:opacity-30"
                            disabled={productSaving}>
                            {m.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-white/15 text-[10px] font-body mt-1.5">Tip: Industry standard for print-on-demand apparel is 50–100% markup (1.5x–2x). Premium streetwear brands can push 2x+.</p>
                    </div>

                    {/* Set flat price */}
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Or Set Flat Price (all variants)</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                          <input type="number" id="flatPrice" placeholder="e.g. 35.00" step="0.01"
                            className={`${inputCls} pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
                        </div>
                        <button type="button" onClick={async () => {
                          const input = document.getElementById('flatPrice') as HTMLInputElement
                          const val = parseFloat(input?.value || '0')
                          if (!val || val <= 0) { showToast('Enter a valid price', 'error'); return }
                          setProductSaving(true)
                          try {
                            await adminPost('/api/go/store', {
                              action: 'bulk_update_prices',
                              payload: { product_id: editingProduct.id, markup_type: 'flat', markup_value: val }
                            })
                            showToast(`All variants set to $${val.toFixed(2)}`)
                            await loadStoreProducts()
                          } catch (err: any) { showToast(err.message, 'error') }
                          finally { setProductSaving(false) }
                        }}
                          className="px-4 py-3 rounded-lg bg-gold/10 border border-gold/20 text-gold text-xs font-heading hover:bg-gold/20 transition-colors disabled:opacity-30"
                          disabled={productSaving}>
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Individual variant prices */}
                    {editingProduct.variant_prices?.length > 0 && editingProduct.variant_prices.length <= 20 && (
                      <details className="border border-white/5 rounded-lg">
                        <summary className="px-3 py-2 text-white/30 text-[10px] uppercase tracking-wider font-heading cursor-pointer hover:text-white/50">
                          Edit Individual Variant Prices ({editingProduct.variant_prices.length})
                        </summary>
                        <div className="p-3 space-y-1.5 border-t border-white/5 max-h-60 overflow-y-auto">
                          {editingProduct.variant_prices.map((vp: any) => (
                            <div key={vp.id} className="flex items-center gap-2">
                              <span className="text-white/30 text-[10px] font-heading flex-1 truncate">{vp.title}</span>
                              <div className="relative w-24 shrink-0">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20 text-[10px]">$</span>
                                <input type="number" step="0.01" defaultValue={(vp.amount / 100).toFixed(2)}
                                  onBlur={async (e) => {
                                    const newVal = parseFloat(e.target.value)
                                    if (!newVal || newVal === vp.amount / 100) return
                                    try {
                                      await adminPost('/api/go/store', {
                                        action: 'update_price',
                                        payload: { product_id: editingProduct.id, variant_id: vp.id, amount: Math.round(newVal * 100), currency_code: 'usd' }
                                      })
                                      showToast('Price updated')
                                    } catch (err: any) { showToast(err.message, 'error') }
                                  }}
                                  className="w-full bg-[#0a0a0a] border border-white/10 rounded px-2 pl-5 py-1.5 text-white/60 text-[11px] font-body focus:border-gold/40 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>

                {/* Save */}
                <button onClick={handleSaveProduct} disabled={productSaving}
                  className="w-full py-3.5 rounded-lg bg-gold text-[#0a0a0a] font-heading font-semibold hover:bg-gold/90 transition-colors text-base disabled:opacity-50">
                  {productSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
            {activeTab === 'customers' && <ComingSoon title="Customer Management" description="Track buyers, manage inquiries, view purchase history, and build your client relationships." icon="customers" />}
            {activeTab === 'payments' && <ComingSoon title="Payments" description="Accept deposits, process payments with Stripe, track revenue, and manage payment history." icon="payments" />}
            {activeTab === 'messages' && <ComingSoon title="Messages" description="Communicate with customers, send updates about litters, and manage inquiries all in one place." icon="messages" />}
            {activeTab === 'analytics' && <ComingSoon title="Analytics" description="Track website traffic, sales metrics, popular dogs, and conversion rates with detailed reports." icon="analytics" />}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="ct-mobile-nav">
        {mobileNavItems.map(item => (
          <button key={item.id} onClick={() => item.id === 'more' ? setSidebarOpen(true) : switchTab(item.id as Tab)}
            className={`ct-mobile-btn font-heading ${item.id !== 'more' && activeTab === item.id ? 'active' : ''}`}>
            {icons[item.icon]}<span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
