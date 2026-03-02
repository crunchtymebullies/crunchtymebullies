import Reveal from '@/components/Reveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Crunchtyme Bullies',
  description: 'Terms and conditions for purchasing puppies, stud services, and products from Crunchtyme Bullies.',
}

export default function TermsPage() {
  return (
    <>
      <div className="page-banner min-h-[40vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <Reveal animation="fade-up"><h1 className="page-banner-title">Terms of Service</h1></Reveal>
          <Reveal animation="fade-up" delay={100}><p className="text-white/40 font-body text-sm mt-4">Last updated: March 1, 2026</p></Reveal>
        </div>
      </div>

      <Reveal animation="fade-up">
        <article className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 prose prose-invert prose-sm">
          <h2>1. Agreement to Terms</h2>
          <p>By accessing or using the Crunchtyme Bullies website (crunchtymebullies.com) or purchasing any products or services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.</p>

          <h2>2. Puppy Sales</h2>
          <p>All puppy sales are subject to the following conditions:</p>
          <p><strong>Deposits:</strong> A non-refundable deposit is required to reserve a puppy. The deposit amount will be communicated at the time of reservation and is applied toward the total purchase price. Deposits are non-refundable and non-transferable unless otherwise agreed upon in writing.</p>
          <p><strong>Health Guarantee:</strong> Every Crunchtyme Bullies puppy comes with a health guarantee. Details of the health guarantee, including duration and covered conditions, will be provided in a separate written agreement at the time of sale. All puppies are sold with current vaccinations, deworming records, and a veterinary health certificate.</p>
          <p><strong>Spay/Neuter:</strong> Unless otherwise agreed upon in a breeding agreement, all companion puppies are sold with a spay/neuter contract. Failure to comply may void the health guarantee.</p>
          <p><strong>Registration:</strong> ABKC registration papers will be provided for all eligible puppies. Transfer of registration will be completed upon receipt of full payment and any applicable spay/neuter documentation.</p>

          <h2>3. Stud Service</h2>
          <p>Stud service agreements are made on a case-by-case basis. A stud service contract outlining fees, terms, breeding schedule, and live cover or AI arrangements must be signed by both parties before any breeding takes place. Stud fees are due in full before or at the time of breeding and are non-refundable.</p>

          <h2>4. Shipping & Delivery</h2>
          <p>Crunchtyme Bullies offers shipping and delivery services for puppies at an additional cost. Shipping costs vary based on location and method (ground transport or flight nanny). All shipping arrangements must be coordinated and paid for in advance. Crunchtyme Bullies is not responsible for delays caused by weather, airline policies, or other factors beyond our control.</p>

          <h2>5. Returns & Refunds</h2>
          <p>Due to the nature of live animals, all sales are final. No returns or refunds will be issued after a puppy has left our care, except as outlined in the health guarantee agreement. If for any reason you are unable to keep your Crunchtyme Bullies puppy, we ask that you contact us first — we will work with you to find a suitable placement rather than having the dog surrendered to a shelter.</p>

          <h2>6. Online Store</h2>
          <p>Products purchased through our online store are subject to standard return policies. Unused and undamaged items may be returned within 30 days of receipt for a full refund, minus shipping costs. Custom or personalized items are non-refundable.</p>

          <h2>7. Intellectual Property</h2>
          <p>All content on this website — including text, images, logos, graphics, and design — is the property of Crunchtyme Bullies and is protected by copyright law. You may not reproduce, distribute, or use any content without written permission.</p>

          <h2>8. Limitation of Liability</h2>
          <p>Crunchtyme Bullies provides information on this website for general purposes only. We are not liable for any damages arising from the use of this website or reliance on information provided herein. Our total liability for any claim related to our products or services shall not exceed the purchase price paid.</p>

          <h2>9. Changes to Terms</h2>
          <p>We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated revision date. Continued use of the website after changes constitutes acceptance of the revised terms.</p>

          <h2>10. Contact</h2>
          <p>Questions about these Terms? Contact us at <a href="mailto:info@crunchtymebullies.com" className="text-gold">info@crunchtymebullies.com</a>.</p>
        </article>
      </Reveal>
    </>
  )
}
