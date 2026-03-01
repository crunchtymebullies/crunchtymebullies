import { Mail, Phone, MapPin, Send, Instagram, Facebook } from 'lucide-react'
import Reveal from '@/components/Reveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Crunchtyme Bullies. Inquire about available puppies, breeding services, or products.',
}

export default function ContactPage() {
  return (
    <>
      <div className="page-banner">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <Reveal animation="fade-in">
            <span className="section-label">Get in Touch</span>
          </Reveal>
          <Reveal animation="fade-up" delay={100}>
            <h1 className="page-banner-title">Contact Us</h1>
          </Reveal>
          <Reveal animation="fade-up" delay={200}>
            <p className="section-subheading mx-auto mt-4">
              Have questions about our dogs, breeding program, or products?
              We&apos;d love to hear from you.
            </p>
          </Reveal>
        </div>
      </div>

      <section className="py-20">
        <div className="page-section">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Contact Info */}
            <Reveal animation="fade-right" className="lg:col-span-2">
              <div>
                <span className="section-label">Reach Out</span>
                <h2 className="text-2xl font-display text-white mb-6 mt-2">Let&apos;s Connect</h2>
                <div className="space-y-6">
                  <a href="mailto:crunchtimebullies@gmail.com" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center group-hover:border-gold/50 transition-colors">
                      <Mail size={18} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider font-heading">Email</p>
                      <p className="text-white font-body group-hover:text-gold transition-colors">crunchtimebullies@gmail.com</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center">
                      <MapPin size={18} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider font-heading">Location</p>
                      <p className="text-white font-body">United States</p>
                    </div>
                  </div>
                </div>

                <Reveal animation="fade-up" delay={300}>
                  <div className="mt-10 pt-8 border-t border-white/5">
                    <p className="text-white/30 text-xs uppercase tracking-wider font-heading mb-4">Follow Us</p>
                    <div className="flex gap-3">
                      <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold/40 hover:text-gold text-white/50 transition-all">
                        <Instagram size={16} />
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold/40 hover:text-gold text-white/50 transition-all">
                        <Facebook size={16} />
                      </a>
                    </div>
                  </div>
                </Reveal>
              </div>
            </Reveal>

            {/* Contact Form */}
            <Reveal animation="fade-left" delay={200} className="lg:col-span-3">
              <form action="/api/contact" method="POST" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Name</label>
                    <input type="text" name="name" required className="w-full bg-brand-dark border border-white/10 rounded px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none transition-colors placeholder:text-white/15" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Email</label>
                    <input type="email" name="email" required className="w-full bg-brand-dark border border-white/10 rounded px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none transition-colors placeholder:text-white/15" placeholder="you@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Subject</label>
                  <select name="subject" className="w-full bg-brand-dark border border-white/10 rounded px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none transition-colors">
                    <option value="general">General Inquiry</option>
                    <option value="puppy">Puppy Inquiry</option>
                    <option value="stud">Stud Service</option>
                    <option value="product">Product Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Message</label>
                  <textarea name="message" rows={5} required className="w-full bg-brand-dark border border-white/10 rounded px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none transition-colors resize-none placeholder:text-white/15" placeholder="Tell us what you're looking for..." />
                </div>
                <button type="submit" className="btn-gold flex items-center gap-2">
                  <Send size={16} /> Send Message
                </button>
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
