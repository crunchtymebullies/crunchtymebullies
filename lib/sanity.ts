import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export const PRODUCTS_QUERY = `*[_type == "product"] | order(title asc) {
  _id, title, slug, category, priceMin, priceMax, images, featured, inStock
}`

export const PRODUCT_BY_SLUG_QUERY = `*[_type == "product" && slug.current == $slug][0] {
  _id, title, slug, category, priceMin, priceMax, images, description, sizes, squareItemId
}`

export const FEATURED_PRODUCTS_QUERY = `*[_type == "product" && featured == true] | order(title asc) {
  _id, title, slug, category, priceMin, priceMax, images
}`

export const DOGS_QUERY = `*[_type == "dog"] | order(name asc) {
  _id, name, slug, images, breed, gender, price, status, featured
}`

export const DOG_BY_SLUG_QUERY = `*[_type == "dog" && slug.current == $slug][0] {
  _id, name, slug, images, breed, gender, birthdate, color, price, description, status
}`

export const BLOG_POSTS_QUERY = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id, title, slug, publishedAt, coverImage, excerpt
}`

export const BLOG_POST_BY_SLUG_QUERY = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id, title, slug, publishedAt, coverImage, excerpt, body, tags
}`

export const REVIEWS_QUERY = `*[_type == "review"] | order(_createdAt desc) {
  _id, name, rating, reviewText, date, type, featured
}`

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]`

export const SERVICES_QUERY = `*[_type == "service"] | order(order asc) {
  _id, title, slug, tagline, image, excerpt, price, duration, featured, benefits
}`

export const SERVICE_BY_SLUG_QUERY = `*[_type == "service" && slug.current == $slug][0] {
  _id, title, slug, tagline, image, excerpt, body, benefits, price, duration
}`

export const FEATURED_SERVICES_QUERY = `*[_type == "service" && featured == true] | order(order asc) {
  _id, title, slug, tagline, image, excerpt, price
}`
