import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ic4pnlo7'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ─── IMAGE HELPER ───
// Returns props for Next.js Image or CSS background from Sanity image + settings
export function sanityImageProps(image: any) {
  if (!image?.asset) return null
  const url = urlFor(image).url()
  return {
    url,
    alt: image.alt || '',
    fit: image.fit || 'cover',
    position: image.position || 'center',
    opacity: image.opacity ?? 100,
  }
}

// ─── QUERIES ───

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  title, tagline, description, phone, email, address, copyright, footerText,
  logo{ asset->{url}, alt, fit },
  logoDark{ asset->{url}, alt },
  favicon{ asset->{url} },
  announcement{ text, link, active },
  navigation[]{ label, href },
  footerLinks[]{ heading, links[]{ label, href } },
  paymentIcons{ asset->{url} },
  socialLinks{ instagram, facebook, tiktok, youtube, twitter },
  metaDescription, ogImage{ asset->{url} }, keywords
}`

export const HOME_PAGE_QUERY = `*[_type == "homePage"][0]{
  heroLabel, heroHeadingLine1, heroHeadingLine2, heroSubtext,
  heroBackground{ asset->{url}, alt, fit, position, opacity },
  heroCta1{ text, href, style },
  heroCta2{ text, href, style },
  marqueeItems,
  categoryCards[]{ label, heading, linkText, href, image{ asset->{url}, alt, fit, position } },
  aboutLabel, aboutHeading, aboutText,
  aboutImage{ asset->{url}, alt, fit, position, opacity },
  aboutFeatures[]{ icon, title, subtitle },
  aboutCta{ text, href, style },
  dogsLabel, dogsHeading, dogsSubheading,
  reviewsLabel, reviewsHeading,
  blogLabel, blogHeading,
  ctaHeading, ctaText,
  ctaBackground{ asset->{url}, alt, fit, position, opacity },
  ctaButton1{ text, href, style },
  ctaButton2{ text, href, style }
}`

export const FEATURED_DOGS_QUERY = `*[_type == "dog" && featured == true] | order(_createdAt desc) [0...6]{
  _id, name, breed, gender, status, "slug": slug.current, price, weight,
  mainImage{ asset->{url}, alt },
  gallery[]{ asset->{url} }
}`

export const ALL_DOGS_QUERY = `*[_type == "dog"] | order(_createdAt desc){
  _id, name, breed, gender, status, "slug": slug.current, price, weight, color, dob,
  mainImage{ asset->{url}, alt },
  gallery[]{ asset->{url} },
  featured
}`

export const DOG_BY_SLUG_QUERY = `*[_type == "dog" && slug.current == $slug][0]{
  _id, name, breed, gender, status, "slug": slug.current, price, weight, color, dob,
  mainImage{ asset->{url}, alt },
  gallery[]{ asset->{url} },
  description, sire, dam, registry, healthTests, featured
}`

export const FEATURED_REVIEWS_QUERY = `*[_type == "review" && featured == true] | order(date desc) [0...6]{
  _id, name, location, rating, text, dogPurchased,
  image{ asset->{url} }
}`

export const ALL_REVIEWS_QUERY = `*[_type == "review"] | order(date desc){
  _id, name, location, rating, text, dogPurchased,
  image{ asset->{url} }
}`

export const BLOG_POSTS_QUERY = `*[_type == "blogPost"] | order(publishedAt desc){
  _id, title, "slug": slug.current, excerpt, publishedAt, author,
  mainImage{ asset->{url}, alt },
  categories
}`

export const BLOG_POST_BY_SLUG_QUERY = `*[_type == "blogPost" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, excerpt, publishedAt, author,
  mainImage{ asset->{url}, alt },
  body, categories
}`

export const SERVICES_QUERY = `*[_type == "service"] | order(order asc){
  _id, title, description, price, featured,
  image{ asset->{url}, alt }
}`

// Aliases for CLI compatibility
export const DOGS_QUERY = ALL_DOGS_QUERY
export const REVIEWS_QUERY = ALL_REVIEWS_QUERY

