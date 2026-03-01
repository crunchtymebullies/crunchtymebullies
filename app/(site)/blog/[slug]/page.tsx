import { client, BLOG_POST_BY_SLUG_QUERY, BLOG_POSTS_QUERY, urlFor } from '@/lib/sanity'
import { PortableText } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar } from 'lucide-react'
import type { BlogPost } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const posts = await client.fetch<BlogPost[]>(BLOG_POSTS_QUERY).catch(() => [])
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await client.fetch<BlogPost>(BLOG_POST_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null)
  if (!post) return { title: 'Post Not Found' }
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch<BlogPost>(BLOG_POST_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null)
  if (!post) notFound()

  return (
    <article>
      <div className="page-section pt-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 text-sm font-heading hover:text-gold transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>

      <div className="page-section py-12 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={14} className="text-gold" />
          <time className="text-white/30 text-xs font-heading tracking-wider">
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </time>
          {post.author && (
            <>
              <span className="text-white/10">·</span>
              <span className="text-white/30 text-xs font-heading">{post.author}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-display text-white mb-6 leading-tight">{post.title}</h1>
        
        {post.excerpt && (
          <p className="text-white/50 text-lg font-body mb-8">{post.excerpt}</p>
        )}

        {post.mainImage && (
          <div className="relative aspect-video overflow-hidden mb-12 bg-brand-charcoal">
            <Image
              src={urlFor(post.mainImage).width(1200).height(680).url()}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="gold-line mb-12" />

        <div className="prose prose-invert prose-lg max-w-none 
                        prose-headings:font-heading prose-headings:tracking-wide
                        prose-p:text-white/60 prose-p:font-body prose-p:leading-relaxed
                        prose-a:text-gold prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white prose-strong:font-semibold
                        prose-img:rounded-none">
          {post.body && <PortableText value={post.body} />}
        </div>
      </div>
    </article>
  )
}
