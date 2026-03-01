// ═══════════════════════════════════════════════════════════
// CRUNCHTIME BULLIES — Type Definitions
// ═══════════════════════════════════════════════════════════

// Sanity image after GROQ dereferencing (asset->{url})
export interface SanityImageAsset {
  asset?: { url: string; _ref?: string }
  alt?: string
  fit?: string
  position?: string
  opacity?: number
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

export interface Dog {
  _id: string
  name: string
  slug: string
  breed: string
  gender: 'male' | 'female'
  color?: string
  dob?: string
  weight?: string
  status: 'available' | 'reserved' | 'sold' | 'stud'
  price?: number
  sire?: string
  dam?: string
  registry?: string
  description?: any[]
  mainImage?: SanityImageAsset
  gallery?: SanityImageAsset[]
  featured?: boolean
  pedigreeUrl?: string
  healthTests?: string[]
}

export interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt?: string
  mainImage?: SanityImageAsset
  body?: any[]
  publishedAt?: string
  author?: string
  categories?: string[]
}

export interface Review {
  _id: string
  name: string
  location?: string
  rating: number
  text: string
  dogPurchased?: string
  image?: SanityImageAsset
  featured?: boolean
  date?: string
}

export interface Service {
  _id: string
  title: string
  slug?: string
  description?: string
  longDescription?: any[]
  price?: string
  image?: SanityImageAsset
  featured?: boolean
  order?: number
}

export interface SiteSettings {
  _id: string
  title: string
  tagline?: string
  description?: string
  logo?: SanityImageAsset
  logoDark?: SanityImageAsset
  phone?: string
  email?: string
  address?: string
  socialLinks?: {
    instagram?: string
    facebook?: string
    tiktok?: string
    youtube?: string
    twitter?: string
  }
  announcement?: {
    text: string
    link?: string
    active: boolean
  }
  navigation?: { label: string; href: string }[]
  footerText?: string
  copyright?: string
  footerLinks?: { heading: string; links: { label: string; href: string }[] }[]
}

// ── Medusa Commerce Types ──

export interface MedusaProduct {
  id: string
  title: string
  handle: string
  description: string
  thumbnail: string
  images: { id: string; url: string }[]
  variants: MedusaVariant[]
  collection?: { id: string; title: string; handle: string }
  categories?: { id: string; name: string; handle: string }[]
  metadata?: Record<string, string>
}

export interface MedusaVariant {
  id: string
  title: string
  prices: { amount: number; currency_code: string }[]
  options: { value: string }[]
  inventory_quantity: number
  sku?: string
}

export interface CartItem {
  id: string
  variant_id: string
  product: MedusaProduct
  variant: MedusaVariant
  quantity: number
  unit_price: number
  thumbnail: string
  title: string
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  tax_total: number
  shipping_total: number
  total: number
  region: { id: string; currency_code: string }
}

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}
