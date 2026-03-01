import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageAsset } from './types'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ic4pnlo7'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageAsset) {
  return builder.image(source)
}

// ═══════════════════════════════════════════════════════════
// GROQ Queries
// ═══════════════════════════════════════════════════════════

// ── Dogs ──
export const DOGS_QUERY = `*[_type == "dog"] | order(featured desc, name asc) {
  _id, name, slug, breed, gender, color, dob, weight, status, price,
  sire, dam, registry, description, mainImage, gallery, featured,
  pedigreeUrl, healthTests
}`

export const DOG_BY_SLUG_QUERY = `*[_type == "dog" && slug.current == $slug][0] {
  _id, name, slug, breed, gender, color, dob, weight, status, price,
  sire, dam, registry, description, mainImage, gallery, featured,
  pedigreeUrl, healthTests
}`

export const FEATURED_DOGS_QUERY = `*[_type == "dog" && featured == true] | order(name asc) [0...4] {
  _id, name, slug, breed, gender, status, price, mainImage, featured
}`

// ── Blog ──
export const BLOG_POSTS_QUERY = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id, title, slug, excerpt, mainImage, publishedAt, author, categories
}`

export const BLOG_POST_BY_SLUG_QUERY = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id, title, slug, excerpt, mainImage, body, publishedAt, author, categories
}`

// ── Reviews ──
export const REVIEWS_QUERY = `*[_type == "review"] | order(date desc) {
  _id, name, location, rating, text, dogPurchased, image, featured, date
}`

export const FEATURED_REVIEWS_QUERY = `*[_type == "review" && featured == true] | order(date desc) [0...3] {
  _id, name, location, rating, text, dogPurchased, image, featured, date
}`

// ── Services ──
export const SERVICES_QUERY = `*[_type == "service"] | order(order asc) {
  _id, title, slug, description, longDescription, price, image, featured, order
}`

export const FEATURED_SERVICES_QUERY = `*[_type == "service" && featured == true] | order(order asc) [0...4] {
  _id, title, slug, description, price, image, featured, order
}`

// ── Site Settings ──
export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0] {
  _id, title, tagline, description, logo, logoAlt, heroImages,
  phone, email, address, socialLinks, announcement
}`
