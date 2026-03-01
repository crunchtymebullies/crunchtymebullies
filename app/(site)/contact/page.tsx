'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send, Check, AlertCircle, Instagram, Facebook } from 'lucide-react'
import Reveal from '@/components/Reveal'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'info@crunchtymebullies.com', href: 'mailto:info@crunchtymebullies.com' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.')
      return
    }
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setSending(false); return }
      setSent(true)
    } catch (err: any) {
      setError('Something went wrong. Please try emailing us directly.')
    }
    setSending(false)
  }

  return (
    <>
      <div className="page-banner">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-black" />
        <div className="page-section text-center relative z-10">
          <Reveal animation="fade-in">
            <span className="section-label">Get In Touch</span>
          </Reveal>
          <Reveal animation="fade-up" delay={100}>
            <h1 className="page-banner-title">Contact Us</h1>
          </Reveal>
          <Reveal animation="fade-up" delay={200}>
            <p className="section-subheading mx-auto mt-4">
              Questions about a puppy, stud service, or just want to learn more?
              We would love to hear from you.
            </p>
          </Reveal>
        </div>
      </div>

      <section className="py-16 md:py-24">
        <div className="max-w-site mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Left — Info */}
            <Reveal animation="fade-right" className="lg:col-span-2">
              <div>
                <h2 className="font-display text-white text-2xl mb-6">Let&apos;s Talk</h2>
                <p className="text-white/45 font-body leading-relaxed mb-8">
                  Whether you&apos;re ready to reserve a puppy, inquire about stud service,
                  or just have questions about our program — reach out. No pressure, no sales pitch.
                  Just honest answers from a family breeder.
                </p>

                <div className="space-y-4 mb-8">
                  {contactInfo.map((item, i) => (
                    <a key={i} href={item.href} className="flex items-center gap-4 p-4 bg-brand-dark/50 border border-white/5 rounded-xl hover:border-gold/20 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                        <item.icon size={18} className="text-gold" />
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-wider font-heading">{item.label}</p>
                        <p className="text-white text-sm font-body">{item.value}</p>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="p-6 bg-brand-dark/30 border border-gold/10 rounded-xl">
                  <h3 className="text-gold text-xs tracking-[0.2em] uppercase font-heading mb-3">Response Time</h3>
                  <p className="text-white/40 font-body text-sm">
                    We typically respond within 24 hours. For urgent inquiries,
                    please mention it in your message and we will prioritize your response.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Right — Form */}
            <Reveal animation="fade-left" delay={200} className="lg:col-span-3">
              {sent ? (
                <div className="flex flex-col items-center justify-center text-center py-16 bg-brand-dark/30 border border-emerald-500/20 rounded-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                    <Check size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-display text-white mb-2">Message Sent!</h3>
                  <p className="text-white/40 font-body max-w-sm">
                    Thank you for reaching out. We will get back to you within 24 hours.
                  </p>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                    className="btn-gold-outline mt-8 text-sm">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Name *</label>
                      <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                        placeholder="Your full name"
                        className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none transition-colors placeholder:text-white/15" />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Email *</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                        placeholder="your@email.com"
                        className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none transition-colors placeholder:text-white/15" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Phone</label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                        placeholder="(555) 123-4567"
                        className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none transition-colors placeholder:text-white/15" />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Subject</label>
                      <select value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))}
                        className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none transition-colors">
                        <option value="">Select a topic...</option>
                        <option value="puppy-inquiry">Puppy Inquiry</option>
                        <option value="stud-service">Stud Service</option>
                        <option value="deposit">Deposit / Reserve</option>
                        <option value="shipping">Shipping / Delivery</option>
                        <option value="general">General Question</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider font-heading block mb-2">Message *</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
                      rows={5} placeholder="Tell us what you're looking for..."
                      className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white font-body focus:border-gold/40 focus:outline-none transition-colors resize-none placeholder:text-white/15" />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                      <p className="text-red-300 text-sm font-body">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={sending} className="btn-gold w-full sm:w-auto px-12 py-4 text-base flex items-center justify-center gap-2 disabled:opacity-30">
                    {sending ? 'Sending...' : <><Send size={16} /> Send Message</>}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
