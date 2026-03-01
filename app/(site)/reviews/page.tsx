import { client, REVIEWS_QUERY } from '@/lib/sanity'
import ReviewCard from '@/components/ReviewCard'
import Section from '@/components/Section'
import Reveal from '@/components/Reveal'
import Link from 'next/link'
import type { Review } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Reviews',
  description: 'See what our clients say about their Crunchtime Bullies experience.',
}

export const revalidate = 60

export default async function ReviewsPage() {
  const reviews = await client.fetch<Review[]>(REVIEWS_QUERY).catch(() => [])

  return (
    <>
      <div className="page-banner">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <Reveal animation="fade-in">
            <span className="section-label">Testimonials</span>
          </Reveal>
          <Reveal animation="fade-up" delay={100}>
            <h1 className="page-banner-title">Client Reviews</h1>
          </Reveal>
          <Reveal animation="fade-up" delay={200}>
            <p className="section-subheading mx-auto mt-4">
              Heartfelt feedback from our valued Crunchtime family.
            </p>
          </Reveal>
        </div>
      </div>

      <Section>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <Reveal key={review._id} animation="fade-up" delay={i * 100}>
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal animation="fade-up">
            <div className="text-center py-20">
              <p className="text-white/30 text-lg font-body mb-4">No reviews yet!</p>
              <p className="text-white/20 font-body">Reviews from our clients will appear here.</p>
            </div>
          </Reveal>
        )}

        <Reveal animation="fade-up" delay={400}>
          <div className="text-center mt-16">
            <p className="text-white/40 font-body mb-4">Had a great experience with us?</p>
            <Link href="/contact" className="btn-gold-outline btn-sm">Leave a Review</Link>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
