import Link from 'next/link'
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react'
import { client, SITE_SETTINGS_QUERY } from '@/lib/sanity'

export default async function Footer() {
  const s = await client.fetch(SITE_SETTINGS_QUERY).catch(() => null)

  const email = s?.email || 'crunchtymebullies@gmail.com'
  const phone = s?.phone || ''
  const footerText = s?.footerText || 'Premium American Bully breeding. Quality bloodlines, health-tested puppies, and working family values.'
  const copyright = s?.copyright || `© ${new Date().getFullYear()} Crunchtyme Bullies. All rights reserved.`
  const instagram = s?.socialLinks?.instagram || ''
  const facebook = s?.socialLinks?.facebook || ''

  const nav = s?.navigation || [
    { label: 'Home', href: '/' },
    { label: 'Dogs', href: '/dogs' },
    { label: 'Services', href: '/services' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <footer className="bg-brand-dark border-t border-white/5">
      <div className="max-w-site mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center">
                <span className="font-display text-gold text-lg">CT</span>
              </div>
              <div>
                <p className="font-display text-white text-base leading-none">Crunchtyme</p>
                <p className="font-heading text-gold text-[9px] tracking-[0.35em] uppercase">Bullies</p>
              </div>
            </div>
            <p className="text-white/40 text-sm font-body leading-relaxed mb-6">{footerText}</p>
            <div className="flex gap-3">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 transition-all">
                  <Instagram size={16} />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 transition-all">
                  <Facebook size={16} />
                </a>
              )}
              {!instagram && !facebook && (
                <>
                  <span className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/20"><Instagram size={16} /></span>
                  <span className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/20"><Facebook size={16} /></span>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-gold text-xs tracking-[0.25em] uppercase font-heading mb-6">Navigate</h4>
            <ul className="space-y-3">
              {nav.map((item: any) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/40 text-sm font-body hover:text-gold transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gold text-xs tracking-[0.25em] uppercase font-heading mb-6">Services</h4>
            <ul className="space-y-3">
              <li><Link href="/services" className="text-white/40 text-sm font-body hover:text-gold transition-colors">All Services</Link></li>
              <li><Link href="/dogs?status=available" className="text-white/40 text-sm font-body hover:text-gold transition-colors">Available Puppies</Link></li>
              <li><Link href="/dogs?status=stud" className="text-white/40 text-sm font-body hover:text-gold transition-colors">Stud Service</Link></li>
              <li><Link href="/shop" className="text-white/40 text-sm font-body hover:text-gold transition-colors">Shop</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gold text-xs tracking-[0.25em] uppercase font-heading mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a href={`mailto:${email}`} className="flex items-start gap-3 text-white/40 text-sm hover:text-gold transition-colors">
                  <Mail size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{email}</span>
                </a>
              </li>
              {phone && (
                <li>
                  <a href={`tel:${phone}`} className="flex items-start gap-3 text-white/40 text-sm hover:text-gold transition-colors">
                    <Phone size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{phone}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-site mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs font-body">{copyright}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-white/20 text-xs hover:text-white/40 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/20 text-xs hover:text-white/40 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
