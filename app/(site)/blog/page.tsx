import { client, BLOG_POSTS_QUERY } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import Section from '@/components/Section'
import Reveal from '@/components/Reveal'
import type { BlogPost } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'News, tips, and updates from Crunchtime Bullies.',
}

export const revalidate = 60

export default async function BlogPage() {
  const posts = await client.fetch<BlogPost[]>(BLOG_POSTS_QUERY).catch(() => [])

  return (
    <>
      <div className="page-banner">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <Reveal animation="fade-in">
            <span className="section-label">Updates</span>
          </Reveal>
          <Reveal animation="fade-up" delay={100}>
            <h1 className="page-banner-title">Blog</h1>
          </Reveal>
        </div>
      </div>

      <Section>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Reveal key={post._id} animation="fade-up" delay={i * 100}>
                <Link href={`/blog/${post.slug}`} className="group card card-hover block">
                  <div className="relative aspect-video overflow-hidden">
                    {post.mainImage?.asset?.url ? (
                      <Image
                        src={post.mainImage.asset.url}
                        alt={post.mainImage?.alt || post.title}
                        fill className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-charcoal" />
                    )}
                  </div>
                  <div className="p-6">
                    {post.publishedAt && (
                      <time className="text-gold/50 text-xs tracking-[0.15em] uppercase font-heading">
                        {new Date(post.publishedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </time>
                    )}
                    <h3 className="text-white font-display text-xl mt-2 group-hover:text-gold transition-colors">{post.title}</h3>
                    {post.excerpt && <p className="text-white/40 font-body text-sm mt-2 line-clamp-2">{post.excerpt}</p>}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal animation="fade-up">
            <div className="text-center py-20">
              <p className="text-white/30 text-lg font-body">Blog posts coming soon!</p>
            </div>
          </Reveal>
        )}
      </Section>
    </>
  )
}
