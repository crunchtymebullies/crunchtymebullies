import { client, BLOG_POSTS_QUERY, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import Section from '@/components/Section'
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
          <span className="section-label">Updates</span>
          <h1 className="page-banner-title">Blog</h1>
        </div>
      </div>

      <Section>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug.current}`} className="group card card-hover">
                <div className="relative aspect-video overflow-hidden bg-brand-charcoal">
                  {post.mainImage && (
                    <Image
                      src={urlFor(post.mainImage).width(600).height(340).url()}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                </div>
                <div className="p-6">
                  <p className="text-white/30 text-xs font-heading tracking-wider mb-2">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                  <h2 className="text-white text-lg font-heading group-hover:text-gold transition-colors mb-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-white/40 text-sm font-body line-clamp-2">{post.excerpt}</p>
                  )}
                  <span className="text-gold text-xs tracking-[0.15em] uppercase font-heading mt-4 block">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/40 font-body">Blog posts coming soon.</p>
          </div>
        )}
      </Section>
    </>
  )
}
