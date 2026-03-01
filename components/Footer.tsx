import Link from 'next/link'
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react'

const footerNav = [
  { label: 'Home', href: '/' },
  { label: 'Dogs', href: '/dogs' },
  { label: 'Shop', href: '/shop' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const shopLinks = [
  { label: 'All Products', href: '/shop' },
  { label: 'Hoodies', href: '/shop?category=hoodies' },
  { label: 'T-Shirts', href: '/shop?category=tshirts' },
  { label: 'Hats', href: '/shop?category=hats' },
  { label: 'Dog Supplies', href: '/shop?category=supplies' },
]

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-white/5">
      {/* Main Footer */}
      <div className="max-w-site mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center">
                <span className="font-display text-gold text-lg">CT</span>
              </div>
              <div>
                <p className="font-display text-white text-base leading-none">Crunchtime</p>
                <p className="font-heading text-gold text-[9px] tracking-[0.35em] uppercase">Bullies</p>
              </div>
            </div>
            <p className="text-white/40 text-sm font-body leading-relaxed mb-6">
              Premium American Bully breeding and quality lifestyle apparel. 
              Bringing you quality breeds & quality fashion.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 transition-all">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 transition-all">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold text-xs tracking-[0.25em] uppercase font-heading mb-6">Navigate</h4>
            <ul className="space-y-3">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/40 text-sm font-body hover:text-gold transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-gold text-xs tracking-[0.25em] uppercase font-heading mb-6">Shop</h4>
            <ul className="space-y-3">
              {shopLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/40 text-sm font-body hover:text-gold transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold text-xs tracking-[0.25em] uppercase font-heading mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:crunchtimebullies@gmail.com" className="flex items-start gap-3 text-white/40 text-sm hover:text-gold transition-colors">
                  <Mail size={16} className="mt-0.5 flex-shrink-0" />
                  <span>crunchtimebullies@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:" className="flex items-start gap-3 text-white/40 text-sm hover:text-gold transition-colors">
                  <Phone size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Contact for number</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-site mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs font-body">
            © {new Date().getFullYear()} Crunchtime Bullies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-white/20 text-xs hover:text-white/40 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/20 text-xs hover:text-white/40 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
