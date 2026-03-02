import Reveal from '@/components/Reveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Crunchtyme Bullies',
  description: 'How Crunchtyme Bullies collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <>
      <div className="page-banner min-h-[40vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <Reveal animation="fade-up"><h1 className="page-banner-title">Privacy Policy</h1></Reveal>
          <Reveal animation="fade-up" delay={100}><p className="text-white/40 font-body text-sm mt-4">Last updated: March 1, 2026</p></Reveal>
        </div>
      </div>

      <Reveal animation="fade-up">
        <article className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 prose prose-invert prose-sm">
          <h2>Information We Collect</h2>
          <p>When you visit crunchtymebullies.com, contact us, or make a purchase, we may collect personal information including your name, email address, phone number, mailing address, and payment information. We collect this information only when you voluntarily provide it through forms, purchases, or direct communication.</p>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to process purchases and reservations, communicate with you about your inquiry or order, provide customer support, send updates about available puppies or services (only if you opt in), and improve our website and services.</p>

          <h2>Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our website, processing payments, or delivering products — but only to the extent necessary to perform those services. These providers are obligated to keep your information confidential.</p>

          <h2>Payment Security</h2>
          <p>All payment transactions are processed through Stripe, a PCI-compliant payment processor. We do not store credit card numbers on our servers. Stripe handles all payment data securely in accordance with industry standards.</p>

          <h2>Cookies</h2>
          <p>Our website may use cookies to enhance your browsing experience. Cookies are small files stored on your device that help us understand how you interact with our site. You can disable cookies in your browser settings, though some site features may not function properly without them.</p>

          <h2>Third-Party Links</h2>
          <p>Our website may contain links to third-party websites (such as social media platforms or registry sites). We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies before providing any personal information.</p>

          <h2>Children's Privacy</h2>
          <p>Our website is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will promptly remove it.</p>

          <h2>Your Rights</h2>
          <p>You have the right to request access to the personal information we hold about you, request correction of inaccurate information, request deletion of your information (subject to legal obligations), and opt out of marketing communications at any time.</p>

          <h2>Data Retention</h2>
          <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements.</p>

          <h2>Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>

          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:info@crunchtymebullies.com" className="text-gold">info@crunchtymebullies.com</a>.</p>
        </article>
      </Reveal>
    </>
  )
}
