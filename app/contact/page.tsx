import { Mail, Phone, MapPin, Send } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Crunchtime Bullies. Inquire about available puppies, breeding services, or products.',
}

export default function ContactPage() {
  return (
    <>
      <div className="page-banner">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <span className="section-label">Get in Touch</span>
          <h1 className="page-banner-title">Contact Us</h1>
          <p className="section-subheading mx-auto mt-4">
            Have questions about our dogs, breeding program, or products?
            We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="page-section">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <span className="section-label">Reach Out</span>
              <h2 className="text-2xl font-display text-white mb-8">
                Let&apos;s Connect
              </h2>

              <div className="space-y-6">
                <a href="mailto:crunchtimebullies@gmail.com" className="flex items-start gap-4 group">
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-gold/40 transition-colors">
                    <Mail size={16} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white/30 text-xs font-heading tracking-wider uppercase mb-1">Email</p>
                    <p className="text-white text-sm font-body group-hover:text-gold transition-colors">
                      crunchtimebullies@gmail.com
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
                    <Phone size={16} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white/30 text-xs font-heading tracking-wider uppercase mb-1">Phone</p>
                    <p className="text-white text-sm font-body">Available upon request</p>
                  </div>
                </div>
              </div>

              <div className="gold-line mt-10 mb-10" />

              <p className="text-white/30 text-sm font-body leading-relaxed">
                Whether you&apos;re interested in a puppy, stud services, or just want to learn
                more about our program, don&apos;t hesitate to reach out. We typically respond
                within 24 hours.
              </p>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-white/30 text-xs font-heading tracking-wider uppercase mb-2 block">
                      First Name
                    </label>
                    <input type="text" name="firstName" required className="input-field" placeholder="John" />
                  </div>
                  <div>
                    <label className="text-white/30 text-xs font-heading tracking-wider uppercase mb-2 block">
                      Last Name
                    </label>
                    <input type="text" name="lastName" required className="input-field" placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <label className="text-white/30 text-xs font-heading tracking-wider uppercase mb-2 block">
                    Email
                  </label>
                  <input type="email" name="email" required className="input-field" placeholder="john@example.com" />
                </div>

                <div>
                  <label className="text-white/30 text-xs font-heading tracking-wider uppercase mb-2 block">
                    Phone
                  </label>
                  <input type="tel" name="phone" className="input-field" placeholder="(555) 123-4567" />
                </div>

                <div>
                  <label className="text-white/30 text-xs font-heading tracking-wider uppercase mb-2 block">
                    Interest
                  </label>
                  <select name="interest" className="input-field">
                    <option value="">Select an option</option>
                    <option value="puppy">Purchasing a Puppy</option>
                    <option value="stud">Stud Services</option>
                    <option value="products">Dog Care Products</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/30 text-xs font-heading tracking-wider uppercase mb-2 block">
                    Message
                  </label>
                  <textarea name="message" required className="textarea-field" placeholder="Tell us how we can help..." />
                </div>

                <button type="submit" className="btn-gold flex items-center gap-2">
                  <Send size={14} /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
