import { client, REVIEWS_QUERY } from '@/lib/sanity'
import ReviewCard from '@/components/ReviewCard'
import Section from '@/components/Section'
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
          <span className="section-label">Testimonials</span>
          <h1 className="page-banner-title">Client Reviews</h1>
          <p className="section-subheading mx-auto mt-4">
            Heartfelt feedback from our valued Crunchtime family.
          </p>
        </div>
      </div>

      <Section>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <ReviewCard key={review._id} review={review} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/40 font-body">Reviews coming soon.</p>
          </div>
        )}
      </Section>

      {/* CTA */}
      <section className="py-20 bg-brand-dark">
        <div className="page-section text-center">
          <h2 className="section-heading">Interested in a Crunchtime Puppy?</h2>
          <p className="section-subheading mx-auto mb-8">
            Contact us to learn about available puppies and upcoming litters.
          </p>
          <Link href="/contact" className="btn-gold">Get in Touch</Link>
        </div>
      </section>
    </>
  )
}
