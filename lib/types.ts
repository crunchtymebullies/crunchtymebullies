// ═══════════════════════════════════════════════════════════
// CRUNCHTIME BULLIES — Type Definitions
// ═══════════════════════════════════════════════════════════

import type { Image as SanityImage } from 'sanity'

// ── Sanity CMS Types (content pages, blogs, dogs) ──

export interface SanityImageAsset extends SanityImage {
  alt?: string
}

export interface Dog {
  _id: string
  name: string
  slug: { current: string }
  breed: string
  gender: 'male' | 'female'
  color: string
  dob?: string
  weight?: string
  status: 'available' | 'reserved' | 'sold' | 'stud'
  price?: number
  sire?: string
  dam?: string
  registry?: string
  description?: any[] // Portable Text
  mainImage: SanityImageAsset
  gallery: SanityImageAsset[]
  featured: boolean
  pedigreeUrl?: string
  healthTests?: string[]
}

export interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  mainImage: SanityImageAsset
  body: any[] // Portable Text
  publishedAt: string
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
  featured: boolean
  date: string
}

export interface Service {
  _id: string
  title: string
  slug: { current: string }
  description: string
  longDescription?: any[] // Portable Text
  price?: string
  image: SanityImageAsset
  featured: boolean
  order: number
}

export interface SiteSettings {
  _id: string
  title: string
  tagline: string
  description: string
  logo: SanityImageAsset
  logoAlt: SanityImageAsset
  heroImages: SanityImageAsset[]
  phone: string
  email: string
  address?: string
  socialLinks: {
    instagram?: string
    facebook?: string
    tiktok?: string
    youtube?: string
  }
  announcement?: {
    text: string
    link?: string
    active: boolean
  }
}

// ── Medusa Commerce Types (products, cart, orders) ──

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
  region: {
    id: string
    currency_code: string
  }
}

// ── Navigation ──

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}
